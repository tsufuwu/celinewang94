import * as fs from "fs";
import * as path from "path";
import { XMLParser } from "fast-xml-parser";
import * as cheerio from "cheerio";

export interface WordPressImportResult {
  storiesCount: number;
  chaptersCount: number;
  passwordLockedCount: number;
  commentsCount: number;
  guestbookCount: number;
  reviewsCount: number;
  paragraphCommentsCount: number;
}

export function cleanHtmlToText(html: string): string {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8217;/g, "’")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#8230;/g, "…")
    .trim();
}

export function parseChapterParagraphs(
  rawHtml: string,
  postmeta: any
): { paragraphs: { index: number; text: string }[]; wordCount: number } {
  const footnoteMap = new Map<string, string>();
  if (postmeta) {
    const list = Array.isArray(postmeta) ? postmeta : [postmeta];
    for (const m of list) {
      if (m["wp:meta_key"] === "footnotes") {
        try {
          const parsed = JSON.parse(m["wp:meta_value"]);
          if (Array.isArray(parsed)) {
            parsed.forEach((f: any) => {
              if (f.id && f.content) {
                footnoteMap.set(f.id, cleanHtmlToText(f.content));
              }
            });
          }
        } catch {
          // ignore parse errors
        }
      }
    }
  }

  const $ = cheerio.load(rawHtml, { xml: false });

  // 1. Convert Gutenberg footnotes
  $("sup[data-fn]").each((_, el) => {
    const fnId = $(el).attr("data-fn");
    const noteText = fnId ? footnoteMap.get(fnId) : null;
    if (noteText) {
      let word = "";
      const prev: any = el.prev;
      if (prev && (prev.name === "em" || prev.name === "strong" || prev.name === "span")) {
        word = $(prev).text().trim();
        $(prev).remove();
      }
      if (word) {
        $(el).replaceWith(`[${word}][[${noteText}]]`);
      } else {
        $(el).replaceWith(`[[${noteText}]]`);
      }
    } else {
      $(el).remove();
    }
  });

  // 2. Remove Easy-footnotes wrapper if already placed
  $(".easy-footnote-margin-adjust").remove();
  $("ol.easy-footnotes-wrapper").remove();
  $(".wp-block-post-navigation-link").remove();

  const paragraphs: { index: number; text: string }[] = [];
  let pIdx = 1;

  $("p").each((_, el) => {
    const pText = cleanHtmlToText($(el).html() || "");
    if (
      pText &&
      pText.length > 0 &&
      pText !== "-----" &&
      !pText.startsWith("<!--") &&
      !pText.includes("| Chương")
    ) {
      paragraphs.push({
        index: pIdx++,
        text: pText,
      });
    }
  });

  if (paragraphs.length === 0) {
    const lines = cleanHtmlToText(rawHtml).split(/\n\s*\n/);
    lines.forEach((l) => {
      const trimmed = l.trim();
      if (trimmed.length > 0 && trimmed !== "-----") {
        paragraphs.push({
          index: pIdx++,
          text: trimmed,
        });
      }
    });
  }

  // Calculate total word count
  let wordCount = 0;
  paragraphs.forEach((p) => {
    const words = p.text.replace(/\[\[.*?\]\]/g, "").trim().split(/\s+/).filter(Boolean);
    wordCount += words.length;
  });

  return { paragraphs, wordCount };
}

export function parseWordPressXml(xmlContent: string) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
    parseTagValue: false,
  });

  const jsonObj = parser.parse(xmlContent);
  const items = Array.isArray(jsonObj.rss?.channel?.item) ? jsonObj.rss.channel.item : [];

  const storyDefinitions = [
    {
      id: "story_om_lay_trong_luc",
      pageId: 44,
      slug: "om-lay-trong-luc",
      title: "Ôm Lấy Trọng Lực",
      author: "larivegauche",
      coverUrl: "/images/stories/om-lay-trong-luc.png",
      description:
        "Lương Mục Dã là một nhiếp ảnh gia thương mại từng rong ruổi nơi băng giá hoang sơ. Hứa Tiếu Trần là một vận động viên trượt băng đơn nam từng chạm đỉnh vinh quang nhưng phải đối mặt với chấn thương và khoảng trống tâm lý.",
      status: "COMPLETED",
      tags: ["Đam mỹ", "Hiện đại", "Cường cường", "Thể thao", "Trượt tuyết", "Full"],
      matchPost: (title: string, cats: string[]) =>
        cats.includes("ôm lấy trọng lực") ||
        cats.includes("larivegauche") ||
        title.startsWith("[EG]") ||
        title.includes("ôm lấy trọng lực") ||
        title.includes("trượt tuyết") ||
        title.includes("Muztagh Ata"),
    },
    {
      id: "story_sternstunde",
      pageId: 4016,
      slug: "sternstunde",
      title: "Sternstunde - Thời Khắc Định Mệnh",
      author: "Trĩ Sở",
      coverUrl: "/images/stories/sternstunde.png",
      description:
        "Sternstunde – Khoảnh khắc của những vì sao, giây phút số phận được định đoạt. Cuộc gặp gỡ định mệnh giữa sân băng và giới giải trí.",
      status: "ONGOING",
      tags: ["Đam mỹ", "Hiện đại", "Đang cook", "Giới giải trí"],
      matchPost: (title: string, cats: string[]) =>
        cats.includes("sternstunde") || cats.includes("trĩ sở") || title.startsWith("[Sternstunde]"),
    },
    {
      id: "story_de_profundis",
      pageId: 356,
      slug: "de-profundis",
      title: "De profundis",
      author: "Oscar Wilde",
      coverUrl: "/images/stories/de-profundis.png",
      description:
        "Bức thư từ vực sâu khổ đau gửi cho Lord Alfred Douglas – kiệt tác triết học và tâm sự đầy day dứt của Oscar Wilde.",
      status: "ONGOING",
      tags: ["Dịch", "Văn học cổ điển", "Thư từ", "Triết lý", "Đang cook"],
      matchPost: (title: string, cats: string[]) =>
        cats.includes("de profundis oscar wilde") || title.startsWith("[dịch] de profundis"),
    },
    {
      id: "story_mat_bao",
      pageId: 5484,
      slug: "mat-bao",
      title: "Mắt Bão",
      author: "Đàm Thạch",
      coverUrl: "/images/stories/mat-bao.png",
      description:
        "Giữa tâm bão dữ dội, nơi yên tĩnh nhất chính là mắt bão – cũng là nơi hai linh hồn va vào nhau, cùng vượt qua hiểm nguy và bóng tối bao trùm.",
      status: "COMPLETED",
      tags: ["Fanfic", "Full", "Đam mỹ"],
      matchPost: (title: string, cats: string[]) =>
        title.includes("Mắt Bão") || title.includes("Fanfic/ Mắt Bão"),
    },
    {
      id: "story_gio_tin_phong",
      pageId: 5730,
      slug: "gio-tin-phong-thoi-ve-phia-bien",
      title: "Gió Tín Phong Thổi Về Phía Biển",
      author: "Thương Bắc Thụ",
      coverUrl: "/images/stories/gio-tin-phong.png",
      description:
        "Ngọn gió tín phong thổi mang theo hơi thở của biển cả mặn mòi và những rung cảm đầu đời kín đáo, sâu lắng.",
      status: "ONGOING",
      tags: ["Đam mỹ", "Hiện đại", "Đang cook"],
      matchPost: (title: string, cats: string[]) =>
        cats.includes("Gió Tín Phong") || title.startsWith("[Gió Tín Phong]"),
    },
    {
      id: "story_bay_buc_thu",
      pageId: 5946,
      slug: "bay-buc-thu-duoc-gui-den-sau-cai-chet-cua-ke-hoang-tuong",
      title: "Bảy Bức Thư Được Gửi Đến Sau Cái Chết Của Kẻ Hoang Tưởng",
      author: "Miêu Giới Đệ Nhất Lỗ",
      coverUrl: "/images/stories/bay-buc-thu.png",
      description:
        "Sau cái chết bí ẩn của một người đàn ông mắc chứng hoang tưởng, lần lượt bảy bức thư kỳ lạ được gửi đến.",
      status: "COMPLETED",
      tags: ["Đam mỹ", "Trinh thám", "Tâm lý", "Full"],
      matchPost: (title: string, cats: string[]) =>
        title.includes("Bảy bức thư") || title.includes("bảy bức thư"),
    },
    {
      id: "story_bong_nhiet_do_thap",
      pageId: 2951,
      slug: "bong-nhiet-do-thap",
      title: "Bỏng Nhiệt Độ Thấp",
      author: "larivegauche x otasquiero",
      coverUrl: "/images/stories/default.png",
      description:
        "Vết bỏng do tiếp xúc lâu với vật có nhiệt độ không quá cao, âm ỉ nhưng để lại vết tích sâu sắc.",
      status: "ONGOING",
      tags: ["Đam mỹ", "Đang cook"],
      matchPost: (title: string, cats: string[]) => title.includes("Bỏng Nhiệt Độ Thấp"),
    },
  ];

  // 1. Extract Stories
  const storiesList: any[] = [];
  storyDefinitions.forEach((def) => {
    const pageItem = items.find(
      (i: any) => String(i["wp:post_id"]) === String(def.pageId) || i["wp:post_name"] === def.slug
    );
    let contentHtml = "";
    if (pageItem) {
      contentHtml = pageItem["content:encoded"] || "";
    }
    storiesList.push({
      id: def.id,
      slug: def.slug,
      title: def.title,
      author: def.author,
      coverUrl: def.coverUrl,
      description: def.description,
      contentHtml,
      status: def.status,
      tags: def.tags,
    });
  });

  // 2. Extract Chapters
  const posts = items.filter(
    (i: any) =>
      i["wp:post_type"] === "post" &&
      (i["wp:status"] === "publish" || i["wp:status"] === "private")
  );
  const chaptersList: any[] = [];
  const extraCounter: Record<string, number> = {};

  posts.forEach((p: any, idx: number) => {
    const title = (p.title || "").trim();
    if (!title) return;

    const cats: string[] = [];
    const rawCats = p.category ? (Array.isArray(p.category) ? p.category : [p.category]) : [];
    rawCats.forEach((c: any) => {
      const name = typeof c === "string" ? c : c["#text"];
      const domain = typeof c === "object" ? c["@_domain"] : "";
      if (domain === "category" && name) cats.push(name.toLowerCase());
    });

    let matchedStory = null;
    for (const def of storyDefinitions) {
      if (def.matchPost(title, cats)) {
        matchedStory = def;
        break;
      }
    }

    if (!matchedStory) {
      matchedStory = storyDefinitions[0];
    }

    let chapterNum: number;
    const numMatch =
      title.match(/Chương\s+(\d+)/i) ||
      title.match(/–\s*0?(\d+)/i) ||
      title.match(/-\s*0?(\d+)/i);
    if (numMatch) {
      chapterNum = parseInt(numMatch[1], 10);
    } else {
      extraCounter[matchedStory.id] = (extraCounter[matchedStory.id] || 101) + 1;
      chapterNum = extraCounter[matchedStory.id];
    }

    const password = p["wp:post_password"] ? String(p["wp:post_password"]).trim() : null;
    const rawHtml = p["content:encoded"] || "";
    const { paragraphs, wordCount } = parseChapterParagraphs(rawHtml, p["wp:postmeta"]);

    const chId = `ch_${p["wp:post_id"] || idx + 1}`;
    const createdAt = p["wp:post_date"] ? new Date(p["wp:post_date"]).getTime() : Date.now();

    chaptersList.push({
      id: chId,
      wpPostId: p["wp:post_id"],
      storyId: matchedStory.id,
      chapterNumber: chapterNum,
      title,
      wordCount,
      password,
      passwordHint: password ? "Mật khẩu được lưu từ bản dịch chính thức trên WordPress" : null,
      paragraphs,
      createdAt,
    });
  });

  chaptersList.sort((a, b) => {
    if (a.storyId !== b.storyId) return a.storyId.localeCompare(b.storyId);
    return a.chapterNumber - b.chapterNumber;
  });

  // 3. Extract Comments
  const guestbookComments: any[] = [];
  const storyReviews: any[] = [];
  const paragraphCommentsList: any[] = [];

  const postIdToChapter = new Map<string, any>();
  chaptersList.forEach((c) => postIdToChapter.set(String(c.wpPostId), c));

  const postIdToStory = new Map<string, any>();
  storyDefinitions.forEach((s) => postIdToStory.set(String(s.pageId), s));

  items.forEach((item: any) => {
    const rawComments = item["wp:comment"];
    if (!rawComments) return;
    const list = Array.isArray(rawComments) ? rawComments : [rawComments];

    list.forEach((c: any) => {
      if (String(c["wp:comment_approved"]) !== "1") return;

      const commentId = `cm_${c["wp:comment_id"]}`;
      const author = (c["wp:comment_author"] || "Độc giả").trim();
      const content = cleanHtmlToText(c["wp:comment_content"]);
      if (!content) return;

      const isAdmin =
        author.toLowerCase().includes("celine") || author.toLowerCase().includes("admin");
      const createdAt = c["wp:comment_date"]
        ? new Date(c["wp:comment_date"]).getTime()
        : Date.now();
      const parentId =
        c["wp:comment_parent"] && String(c["wp:comment_parent"]) !== "0"
          ? `cm_${c["wp:comment_parent"]}`
          : null;

      const itemId = String(item["wp:post_id"]);

      if (itemId === "1" || item["wp:post_name"] === "media-naranja") {
        guestbookComments.push({
          id: commentId,
          authorName: author,
          isAdmin,
          title: null,
          content,
          parentId,
          createdAt,
        });
      } else if (postIdToStory.has(itemId)) {
        const story = postIdToStory.get(itemId);
        storyReviews.push({
          id: commentId,
          storyId: story.id,
          authorName: author,
          rating: 5,
          content,
          likes: 0,
          parentId,
          createdAt,
        });
      } else if (postIdToChapter.has(itemId)) {
        const chapter = postIdToChapter.get(itemId);
        paragraphCommentsList.push({
          id: commentId,
          chapterId: chapter.id,
          paragraphIndex: 1,
          authorName: isAdmin ? `[Admin] ${author}` : author,
          content,
          isTypoReport: false,
          isResolved: false,
          createdAt,
        });
      } else {
        guestbookComments.push({
          id: commentId,
          authorName: author,
          isAdmin,
          title: `[WordPress] ${item.title || ""}`,
          content,
          parentId,
          createdAt,
        });
      }
    });
  });

  return {
    stories: storiesList,
    chapters: chaptersList,
    guestbookComments,
    storyReviews,
    paragraphComments: paragraphCommentsList,
  };
}

// CLI Execution support
if (require.main === module) {
  const filePath =
    process.argv[2] ||
    path.join(__dirname, "../old_data/celinewang94.wordpress.com.2026-11-03.000.xml");
  console.log("Running WordPress import script for:", filePath);

  if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    process.exit(1);
  }

  const xmlContent = fs.readFileSync(filePath, "utf8");
  const parsed = parseWordPressXml(xmlContent);

  const passCount = parsed.chapters.filter((c) => Boolean(c.password)).length;
  const totalComments =
    parsed.guestbookComments.length +
    parsed.storyReviews.length +
    parsed.paragraphComments.length;

  console.log("\n==============================================");
  console.log("WORDPRESS MIGRATION DATA SUMMARY");
  console.log("==============================================");
  console.log(`- Stories parsed: ${parsed.stories.length}`);
  console.log(`- Chapters parsed: ${parsed.chapters.length}`);
  console.log(`- Password-locked chapters: ${passCount}`);
  console.log(`- Guestbook posts: ${parsed.guestbookComments.length}`);
  console.log(`- Story reviews: ${parsed.storyReviews.length}`);
  console.log(`- Paragraph comments: ${parsed.paragraphComments.length}`);
  console.log(`- Total comments: ${totalComments}`);
  console.log("==============================================");
}
