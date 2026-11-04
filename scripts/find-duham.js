const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');

const xml = fs.readFileSync('old_data/celinewang94.wordpress.com.2026-11-03.000.xml', 'utf8');
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
const doc = parser.parse(xml);
const items = doc.rss.channel.item;

console.log('Searching all items in XML containing "Dụ Hàm" or "SCENE 02" or "Hạ Bình Thu"...');

items.forEach(item => {
  const content = (item['content:encoded'] || '') + (item.title || '');
  if (content.includes('Dụ Hàm') || content.includes('SCENE 02') || content.includes('Hạ Bình Thu')) {
    console.log(`\n========================================`);
    console.log(`ID: ${item['wp:post_id']}`);
    console.log(`Type: ${item['wp:post_type']}`);
    console.log(`Status: ${item['wp:status']}`);
    console.log(`Title: ${item.title}`);
    console.log(`Slug: ${item['wp:post_name']}`);
    console.log(`Content length: ${(item['content:encoded'] || '').length}`);
    
    // Check if SCENE 02 is in this item
    if ((item['content:encoded'] || '').includes('SCENE 02')) {
      console.log('>>> CONTAINS SCENE 02!');
      const idx = item['content:encoded'].indexOf('SCENE 02');
      console.log('Snippet around SCENE 02:');
      console.log(item['content:encoded'].slice(idx - 100, idx + 800));
    }
  }
});

