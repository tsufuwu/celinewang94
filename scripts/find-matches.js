const fs = require('fs');
const cheerio = require('cheerio');

const xml = fs.readFileSync('old_data/celinewang94.wordpress.com.2026-11-03.000.xml', 'utf8');
const $ = cheerio.load(xml, { xmlMode: true });

$('item').each((_, el) => {
  const content = $(el).find('content\\:encoded').text();
  const id = $(el).find('wp\\:post_id').text();
  const title = $(el).find('title').text();
  const postName = $(el).find('wp\\:post_name').text();
  const postType = $(el).find('wp\\:post_type').text();
  
  if (/Lá Thư Thứ Hai|SCENE 02/i.test(content)) {
    console.log({ id, title, postName, postType, length: content.length });
  }
});

