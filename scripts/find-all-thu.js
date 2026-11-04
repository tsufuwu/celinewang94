const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');

const xml = fs.readFileSync('old_data/celinewang94.wordpress.com.2026-11-03.000.xml', 'utf8');
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
const doc = parser.parse(xml);
const items = doc.rss.channel.item;

console.log('Searching all items in XML containing "thư" or "thu"...');

items.forEach((item, index) => {
  const title = (item.title || '').toString();
  const slug = (item['wp:post_name'] || '').toString();
  const content = (item['content:encoded'] || '').toString();
  const type = (item['wp:post_type'] || '').toString();
  const status = (item['wp:status'] || '').toString();
  const id = item['wp:post_id'];

  if (title.toLowerCase().includes('thư') || slug.toLowerCase().includes('thu') || content.toLowerCase().includes('bảy bức thư') || content.toLowerCase().includes('bức thư')) {
    console.log(`[Item ${index}] ID: ${id} | Type: ${type} | Status: ${status} | Title: "${title}" | Slug: "${slug}" | ContentLen: ${content.length}`);
  }
});

