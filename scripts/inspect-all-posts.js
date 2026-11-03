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

const posts = items.filter(i => i['wp:post_type'] === 'post' && (i['wp:status'] === 'publish' || i['wp:status'] === 'private'));

console.log('Total publish/private posts:', posts.length);

posts.forEach((p, i) => {
  const cats = [];
  const rawCats = p.category ? (Array.isArray(p.category) ? p.category : [p.category]) : [];
  rawCats.forEach(c => {
    const name = typeof c === 'string' ? c : c['#text'];
    const domain = typeof c === 'object' ? c['@_domain'] : '';
    if (domain === 'category') cats.push(name);
  });
  console.log(`${i+1}. [${p['wp:status']}] [pass: ${p['wp:post_password'] || ''}] [cats: ${cats.join(',')}] "${p.title}"`);
});

