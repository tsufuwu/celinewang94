const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');

const xml = fs.readFileSync('old_data/celinewang94.wordpress.com.2026-11-03.000.xml', 'utf8');
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
const doc = parser.parse(xml);
const items = doc.rss.channel.item;

const p5946 = items.find(i => String(i['wp:post_id']) === '5946');
console.log('p5946 link:', p5946.link);
console.log('p5946 slug:', p5946['wp:post_name']);

