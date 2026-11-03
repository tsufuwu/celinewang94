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
  $('sup').each((i, el) => {
    const parent = $(el).parent();
    console.log(`sup[${i}]: text: "${$(el).text()}", parent tag: ${parent.prop('tagName')}, parent text: "${parent.text().trim()}"`);
    console.log('parent html:', parent.html());
  });
}
