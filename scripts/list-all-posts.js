const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');

const xml = fs.readFileSync('old_data/celinewang94.wordpress.com.2026-11-03.000.xml', 'utf8');
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
const doc = parser.parse(xml);
const items = doc.rss.channel.item;

console.log('Total items in XML:', items.length);

const types = {};
items.forEach(i => {
  types[i['wp:post_type']] = (types[i['wp:post_type']] || 0) + 1;
});
console.log('Types:', types);

console.log('\n--- ALL POSTS (wp:post_type === "post") ---');
items.filter(i => i['wp:post_type'] === 'post').forEach((p, idx) => {
  console.log(`${idx + 1}. ID: ${p['wp:post_id']} | Status: ${p['wp:status']} | Title: ${p.title} | Slug: ${p['wp:post_name']} | Cats: ${JSON.stringify(p.category)}`);
});

