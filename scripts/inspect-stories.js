const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');

const xmlData = fs.readFileSync('old_data/celinewang94.wordpress.com.2026-11-03.000.xml', 'utf8');
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseTagValue: false,
});
const jsonObj = parser.parse(xmlData);
const items = jsonObj.rss.channel.item;

const storyPageIds = [44, 356, 2951, 4016, 5484, 5730, 5946, 1];
storyPageIds.forEach(id => {
  const p = items.find(i => String(i['wp:post_id']) === String(id));
  if (p) {
    const content = p['content:encoded'] || '';
    const comments = p['wp:comment'] ? (Array.isArray(p['wp:comment']) ? p['wp:comment'] : [p['wp:comment']]) : [];
    console.log(`Page [${id}] "${p.title}" slug: ${p['wp:post_name']} len: ${content.length} comments: ${comments.length}`);
  }
});

