const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');
const cheerio = require('cheerio');

const xmlData = fs.readFileSync('old_data/celinewang94.wordpress.com.2026-11-03.000.xml', 'utf8');
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseTagValue: false,
});
const jsonObj = parser.parse(xmlData);
const items = jsonObj.rss.channel.item;

function cleanHtmlToText(html) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8217;/g, '’')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#8230;/g, '…')
    .trim();
}

function parseChapterParagraphs(rawHtml, postmeta) {
  const footnoteMap = new Map();
  if (postmeta) {
    const list = Array.isArray(postmeta) ? postmeta : [postmeta];
    for (const m of list) {
      if (m['wp:meta_key'] === 'footnotes') {
        try {
          const parsed = JSON.parse(m['wp:meta_value']);
          if (Array.isArray(parsed)) {
            parsed.forEach(f => {
              if (f.id && f.content) {
                footnoteMap.set(f.id, cleanHtmlToText(f.content));
              }
            });
          }
        } catch (e) {}
      }
    }
  }

  const $ = cheerio.load(rawHtml, { xmlMode: false, decodeEntities: true });

  // 1. Convert Gutenberg footnotes
  $('sup[data-fn]').each((_, el) => {
    const fnId = $(el).attr('data-fn');
    const noteText = footnoteMap.get(fnId);
    if (noteText) {
      let word = '';
      const prev = el.prev;
      if (prev && (prev.name === 'em' || prev.name === 'strong' || prev.name === 'span')) {
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

  $('.easy-footnote-margin-adjust').remove();
  $('ol.easy-footnotes-wrapper').remove();
  $('.wp-block-post-navigation-link').remove();

  const paragraphs = [];
  let pIdx = 1;

  $('p').each((_, el) => {
    const pText = cleanHtmlToText($(el).html());
    if (pText && pText.length > 0 && pText !== '-----' && !pText.startsWith('<!--') && !pText.includes('| Chương')) {
      paragraphs.push({
        index: pIdx++,
        text: pText
      });
    }
  });

  return paragraphs;
}

const ch1 = items.find(i => (i.title || '').includes('Chương 1: Hướng Vãn'));
const paras = parseChapterParagraphs(ch1['content:encoded'], ch1['wp:postmeta']);
console.log('Sample paragraphs with [word][[note]]:');
paras.filter(p => p.text.includes('[[')).slice(0, 3).forEach(p => console.log(`[P${p.index}]: ${p.text}\n`));
