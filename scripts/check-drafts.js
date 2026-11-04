const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');
const cheerio = require('cheerio');

const xml = fs.readFileSync('old_data/celinewang94.wordpress.com.2026-11-03.000.xml', 'utf8');
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
const doc = parser.parse(xml);
const items = doc.rss.channel.item;

const checkIds = [5000, 5403, 5458, 5685, 5884, 5893, 5909, 5946, 5969];

checkIds.forEach(id => {
  const item = items.find(i => String(i['wp:post_id']) === String(id));
  if (!item) return;
  const content = item['content:encoded'] || '';
  const $ = cheerio.load(content);
  $('script, style').remove();
  const text = $.text().replace(/\s+/g, ' ').trim();
  console.log(`\n========================================`);
  console.log(`ID: ${id} | Title: "${item.title}" | Status: ${item['wp:status']} | Len: ${content.length}`);
  console.log(`Snippet: ${text.slice(0, 300)}`);
});

