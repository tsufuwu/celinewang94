const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');

const xml = fs.readFileSync('old_data/celinewang94.wordpress.com.2026-11-03.000.xml', 'utf8');
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
const doc = parser.parse(xml);
const items = doc.rss.channel.item;

function getStr(val) {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return val['#text'] || JSON.stringify(val);
  return String(val);
}

const matches = items.filter(i => {
  const t = getStr(i.title).toLowerCase();
  const n = getStr(i['wp:post_name']).toLowerCase();
  const c = getStr(i.category).toLowerCase();
  const raw = getStr(i['content:encoded']).toLowerCase();
  return t.includes('bảy bức thư') || t.includes('bức thư') || n.includes('bay-buc-thu') || c.includes('bảy bức thư') || raw.includes('bảy bức thư') || t.includes('hoang tưởng') || n.includes('hoang-tuong');
});

console.log('Found matches:', matches.length);
matches.forEach(m => {
  console.log(`ID: ${m['wp:post_id']} | Type: ${m['wp:post_type']} | Status: ${m['wp:status']} | Title: ${getStr(m.title)} | Slug: ${m['wp:post_name']} | ContentLen: ${getStr(m['content:encoded']).length}`);
});
