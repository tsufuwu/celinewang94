const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');

const xml = fs.readFileSync('old_data/celinewang94.wordpress.com.2026-11-03.000.xml', 'utf8');
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
const doc = parser.parse(xml);
const items = doc.rss.channel.item;

for (let i = 285; i <= 305; i++) {
  const item = items[i];
  if (!item) continue;
  console.log(`[${i}] ID: ${item['wp:post_id']} | Type: ${item['wp:post_type']} | Status: ${item['wp:status']} | Title: "${item.title}" | Slug: "${item['wp:post_name']}" | Len: ${(item['content:encoded'] || '').length}`);
}

