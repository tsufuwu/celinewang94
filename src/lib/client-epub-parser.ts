import JSZip from "jszip";

export interface ParsedParagraph {
  index: number;
  text: string;
}

export interface ParsedChapter {
  chapterNumber: number;
  title: string;
  wordCount: number;
  paragraphs: ParsedParagraph[];
}

export function countWordsClient(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Client-Side EPUB Parser using JSZip and native browser DOMParser.
 * Runs 100% inside the browser to avoid Cloudflare Workers 10ms CPU limit.
 */
export async function parseEpubInBrowser(
  file: File,
  onProgress?: (percent: number, currentChapter: string) => void
): Promise<ParsedChapter[]> {
  const zip = await JSZip.loadAsync(file);

  // 1. Read META-INF/container.xml
  const containerXml = await zip.file("META-INF/container.xml")?.async("string");
  if (!containerXml) {
    throw new Error("File EPUB không hợp lệ (thiếu META-INF/container.xml).");
  }

  const parser = new DOMParser();
  const containerDoc = parser.parseFromString(containerXml, "application/xml");
  const rootfile = containerDoc.querySelector("rootfile");
  const opfPath = rootfile?.getAttribute("full-path");

  if (!opfPath) {
    throw new Error("Không thể tìm thấy file OPF trong container.xml.");
  }

  const opfContent = await zip.file(opfPath)?.async("string");
  if (!opfContent) {
    throw new Error(`Không thể đọc nội dung file OPF tại: ${opfPath}`);
  }

  const opfDir = opfPath.includes("/") ? opfPath.substring(0, opfPath.lastIndexOf("/") + 1) : "";
  const opfDoc = parser.parseFromString(opfContent, "application/xml");

  // 2. Map Manifest
  const manifestMap = new Map<string, string>();
  const items = opfDoc.querySelectorAll("manifest > item");
  items.forEach((item) => {
    const id = item.getAttribute("id");
    const href = item.getAttribute("href");
    const mediaType = item.getAttribute("media-type") || "";
    if (id && href && (mediaType.includes("html") || mediaType.includes("xml"))) {
      manifestMap.set(id, href);
    }
  });

  // 3. Read Spine
  const itemrefs = opfDoc.querySelectorAll("spine > itemref");
  const orderedFilePaths: string[] = [];
  itemrefs.forEach((ref) => {
    const idref = ref.getAttribute("idref");
    if (idref && manifestMap.has(idref)) {
      const relHref = manifestMap.get(idref)!;
      orderedFilePaths.push(opfDir + relHref);
    }
  });

  const parsedChapters: ParsedChapter[] = [];
  let chapterIndex = 1;

  for (let i = 0; i < orderedFilePaths.length; i++) {
    const filePath = orderedFilePaths[i];
    let htmlContent = await zip.file(filePath)?.async("string");
    if (!htmlContent) {
      try {
        htmlContent = await zip.file(decodeURIComponent(filePath))?.async("string");
      } catch {
        // Continue
      }
    }
    if (!htmlContent) continue;

    const doc = parser.parseFromString(htmlContent, "text/html");

    // Remove unneeded elements
    doc.querySelectorAll("script, style, nav, header, footer, noscript, svg").forEach((el) => el.remove());

    // Extract title
    let chapterTitle = "";
    const h1 = doc.querySelector("h1")?.textContent?.trim();
    const h2 = doc.querySelector("h2")?.textContent?.trim();
    const docTitle = doc.querySelector("title")?.textContent?.trim();

    if (h1 && h1.length < 120) {
      chapterTitle = h1;
    } else if (h2 && h2.length < 120) {
      chapterTitle = h2;
    } else if (docTitle && docTitle.length < 120 && !docTitle.toLowerCase().includes("untitled")) {
      chapterTitle = docTitle;
    }

    // Extract paragraphs
    const paragraphs: ParsedParagraph[] = [];
    let pIndex = 1;

    const pElements = doc.querySelectorAll("p");
    if (pElements.length > 0) {
      pElements.forEach((el) => {
        const text = (el.textContent || "").trim().replace(/\s+/g, " ");
        if (text.length > 0) {
          paragraphs.push({ index: pIndex++, text });
        }
      });
    } else {
      const bodyText = doc.body.textContent || "";
      const lines = bodyText.split(/\r?\n/).map((l) => l.trim().replace(/\s+/g, " "));
      for (const line of lines) {
        if (line.length > 0) {
          paragraphs.push({ index: pIndex++, text: line });
        }
      }
    }

    const totalWords = paragraphs.reduce((sum, p) => sum + countWordsClient(p.text), 0);

    // Skip small metadata or blank pages
    if (totalWords < 25 && paragraphs.length <= 2 && !chapterTitle.toLowerCase().includes("chương")) {
      continue;
    }

    if (!chapterTitle) {
      if (paragraphs.length > 0 && /^(chương|hồi|phần|tiết|bài|quyển|chapter)\s+\d+/i.test(paragraphs[0].text)) {
        chapterTitle = paragraphs[0].text;
        paragraphs.shift();
        paragraphs.forEach((p, idx) => {
          p.index = idx + 1;
        });
      } else {
        chapterTitle = `Chương ${chapterIndex}`;
      }
    }

    const parsed: ParsedChapter = {
      chapterNumber: chapterIndex++,
      title: chapterTitle,
      wordCount: totalWords,
      paragraphs,
    };

    parsedChapters.push(parsed);

    if (onProgress) {
      const percent = Math.round(((i + 1) / orderedFilePaths.length) * 100);
      onProgress(percent, chapterTitle);
    }
  }

  return parsedChapters;
}

/**
 * Client-Side Raw text parser
 */
export function parseRawTextInBrowser(rawText: string): ParsedChapter[] {
  if (!rawText || rawText.trim().length === 0) return [];

  const chapterRegex = /(?:^|\n)(?:===+\s*)?(chương\s+\d+[:\s\-\.\–]?[^\n]*|hồi\s+\d+[:\s\-\.\–]?[^\n]*|chapter\s+\d+[:\s\-\.\–]?[^\n]*)(?:\s*===+)?(?:\n|$)/gi;
  const matches = Array.from(rawText.matchAll(chapterRegex));

  if (matches.length === 0) {
    const lines = rawText.split(/\r?\n\r?\n/).map((l) => l.trim().replace(/\s+/g, " "));
    const paragraphs: ParsedParagraph[] = [];
    let pIndex = 1;
    for (const line of lines) {
      if (line.length > 0) {
        paragraphs.push({ index: pIndex++, text: line });
      }
    }
    const totalWords = paragraphs.reduce((sum, p) => sum + countWordsClient(p.text), 0);
    return [
      {
        chapterNumber: 1,
        title: "Chương 1",
        wordCount: totalWords,
        paragraphs,
      },
    ];
  }

  const chapters: ParsedChapter[] = [];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const title = match[1].trim();
    const startIndex = match.index! + match[0].length;
    const endIndex = i + 1 < matches.length ? matches[i + 1].index! : rawText.length;
    const content = rawText.substring(startIndex, endIndex).trim();

    const lines = content.split(/\r?\n+/).map((l) => l.trim().replace(/\s+/g, " "));
    const paragraphs: ParsedParagraph[] = [];
    let pIndex = 1;

    for (const line of lines) {
      if (line.length > 0) {
        paragraphs.push({ index: pIndex++, text: line });
      }
    }

    const totalWords = paragraphs.reduce((sum, p) => sum + countWordsClient(p.text), 0);

    chapters.push({
      chapterNumber: i + 1,
      title,
      wordCount: totalWords,
      paragraphs,
    });
  }

  return chapters;
}

