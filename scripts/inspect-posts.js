const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');

const xmlPath = 'old_data/celinewang94.wordpress.com.2026-11-03.000.xml';
const xmlData = fs.readFileSync(xmlPath, 'utf8');

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseTagValue: false,
});

const jsonObj = parser.parse(xmlData);
const items = Array.isArray(jsonObj.rss?.channel?.item) ? jsonObj.rss.channel.item : [];

const posts = items.filter(i => i['wp:post_type'] === 'post');
console.log('Total posts:', posts.length);

const storyPostMap = {};
const sampleTitles = [];

for (const p of posts) {
  const title = p.title || '(No title)';
  const password = p['wp:post_password'] || null;
  const status = p['wp:status'];
  const cats = [];
  const rawCats = p.category ? (Array.isArray(p.category) ? p.category : [p.category]) : [];
  for (const c of rawCats) {
    if (typeof c === 'string') cats.push(c);
    else if (c['#text']) cats.push(c['#text']);
  }

  sampleTitles.push({
    title,
    status,
    hasPassword: Boolean(password),
    password,
    cats,
    commentCount: p['wp:comment'] ? (Array.isArray(p['wp:comment']) ? p['wp:comment'].length : 1) : 0
  });
}

console.log('Sample 30 post titles and categories:');
sampleTitles.slice(0, 30).forEach((p, idx) => {
  console.log(`${idx + 1}. [Pass: ${p.hasPassword ? p.password : 'No'}] [${p.status}] [Cmts: ${p.commentCount}] "${p.title}" | Cats: ${p.cats.join(', ')}`);
});

const passPosts = sampleTitles.filter(p => p.hasPassword);
console.log(`\nTotal posts with passwords: ${passPosts.length}`);
console.log('Sample passwords:', passPosts.slice(0, 10).map(p => `"${p.title}" -> "${p.password}"`));
