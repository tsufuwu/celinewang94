const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');

const xml = fs.readFileSync('old_data/celinewang94.wordpress.com.2026-11-03.000.xml', 'utf8');
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
const doc = parser.parse(xml);
const items = doc.rss.channel.item;

const p5946 = items.find(i => String(i['wp:post_id']) === '5946');
const p5893 = items.find(i => String(i['wp:post_id']) === '5893');
const p5909 = items.find(i => String(i['wp:post_id']) === '5909');

fs.writeFileSync('scripts/p5946.html', p5946['content:encoded'] || '', 'utf8');
fs.writeFileSync('scripts/p5893.html', p5893['content:encoded'] || '', 'utf8');
fs.writeFileSync('scripts/p5909.html', p5909['content:encoded'] || '', 'utf8');

console.log('p5946 len:', p5946['content:encoded']?.length);
console.log('p5893 len:', p5893['content:encoded']?.length);
console.log('p5909 len:', p5909['content:encoded']?.length);

