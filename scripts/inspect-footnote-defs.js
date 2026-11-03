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

const ch1 = items.find(i => (i.title || '').includes('Chương 1: Hướng Vãn'));
if (ch1) {
  const html = ch1['content:encoded'] || '';
  const $ = cheerio.load(html);
  
  // Look for id 'aed332bd-0be2-49b3-98cd-c8eaea3ca715'
  const target = $('#aed332bd-0be2-49b3-98cd-c8eaea3ca715');
  console.log('Target found:', target.length);
  if (target.length) {
    console.log('Target html:', target.parent().html());
  } else {
    // Check all elements with footnotes or id
    $('[id]').each((i, el) => {
      console.log(`[id]: ${$(el).attr('id')} (tag: ${el.tagName}) -> text: "${$(el).text().slice(0, 100)}"`);
    });
  }
}

