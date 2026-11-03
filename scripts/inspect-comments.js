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

let totalComments = 0;
let approvedComments = 0;
let celineComments = 0;
const commentsByItem = [];

items.forEach(item => {
  const rawComments = item['wp:comment'];
  if (!rawComments) return;
  const list = Array.isArray(rawComments) ? rawComments : [rawComments];
  totalComments += list.length;
  
  const approved = list.filter(c => String(c['wp:comment_approved']) === '1');
  approvedComments += approved.length;
  
  const celine = approved.filter(c => (c['wp:comment_author'] || '').toLowerCase().includes('celine'));
  celineComments += celine.length;

  if (approved.length > 0) {
    commentsByItem.push({
      id: item['wp:post_id'],
      type: item['wp:post_type'],
      title: item.title,
      slug: item['wp:post_name'],
      total: list.length,
      approved: approved.length
    });
  }
});

console.log(`Total comments: ${totalComments}, Approved: ${approvedComments}, By Celine: ${celineComments}`);
console.log('Items with approved comments:', commentsByItem.length);
commentsByItem.slice(0, 15).forEach(c => console.log(`[${c.type}] [${c.id}] "${c.title}" -> ${c.approved} approved`));
