const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');

const xmlPath = 'old_data/celinewang94.wordpress.com.2026-11-03.000.xml';
console.log('Reading XML file:', xmlPath);

const xmlData = fs.readFileSync(xmlPath, 'utf8');

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseTagValue: false,
});

console.log('Parsing XML...');
const jsonObj = parser.parse(xmlData);

const channel = jsonObj.rss?.channel;
if (!channel) {
  console.error('No channel found in RSS!');
  process.exit(1);
}

console.log('Site Title:', channel.title);
console.log('Site Link:', channel.link);

const items = Array.isArray(channel.item) ? channel.item : [channel.item].filter(Boolean);
console.log('Total items in XML:', items.length);

const postTypes = {};
const statuses = {};
const pages = [];
const categories = new Set();
let passwordCount = 0;
let totalComments = 0;

for (const item of items) {
  const pType = item['wp:post_type'] || 'unknown';
  const status = item['wp:status'] || 'unknown';
  postTypes[pType] = (postTypes[pType] || 0) + 1;
  statuses[status] = (statuses[status] || 0) + 1;

  if (item['wp:post_password']) {
    passwordCount++;
  }

  const rawComments = item['wp:comment'];
  if (rawComments) {
    const commentsList = Array.isArray(rawComments) ? rawComments : [rawComments];
    totalComments += commentsList.length;
  }

  if (pType === 'page') {
    pages.push({
      title: item.title,
      slug: item['wp:post_name'],
      id: item['wp:post_id'],
      status: item['wp:status'],
      parent: item['wp:post_parent'],
    });
  }

  const cats = item.category;
  if (cats) {
    const catList = Array.isArray(cats) ? cats : [cats];
    for (const c of catList) {
      if (typeof c === 'string') categories.add(c);
      else if (c['#text']) categories.add(c['#text']);
    }
  }
}

console.log('Post Types:', postTypes);
console.log('Statuses:', statuses);
console.log('Items with password:', passwordCount);
console.log('Total comments:', totalComments);
console.log('\n--- PAGES FOUND (' + pages.length + ') ---');
pages.forEach(p => console.log(`[${p.id}] ${p.status} - "${p.title}" (slug: ${p.slug})`));

console.log('\n--- SAMPLE CATEGORIES (' + categories.size + ') ---');
console.log([...categories].slice(0, 30));
