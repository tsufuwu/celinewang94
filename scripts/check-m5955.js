const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');

const xml = fs.readFileSync('old_data/celinewang94.wordpress.com.2026-11-03.000.xml', 'utf8');
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
const doc = parser.parse(xml);
const items = doc.rss.channel.item;

const m5955 = items.find(i => String(i['wp:post_id']) === '5955');
console.log('m5955:', JSON.stringify(m5955, null, 2));

