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

// Inspect post 1: [EG] Chương 1: Hướng Vãn
const ch1 = items.find(i => (i.title || '').includes('Chương 1: Hướng Vãn'));
if (ch1) {
  const html = ch1['content:encoded'] || '';
  console.log('=== CH1 HTML (first 1000 chars) ===');
  console.log(html.slice(0, 1000));

  const $ = cheerio.load(html);
  console.log('\n=== Elements in CH1 ===');
  console.log('p count:', $('p').length);
  console.log('easy-footnote count:', $('a[href*="easy-footnote"], span[id*="easy-footnote"], ol.easy-footnotes-wrapper').length);
  console.log('sup count:', $('sup').length);

  $('p').slice(0, 5).each((i, el) => {
    console.log(`p[${i}]:`, $(el).text().trim());
  });

  const footnotes = $('ol.easy-footnotes-wrapper li');
  console.log('Footnotes in ol.easy-footnotes-wrapper:', footnotes.length);
  footnotes.each((i, el) => {
    console.log(`Footnote ${i+1}:`, $(el).text().trim());
  });
}
