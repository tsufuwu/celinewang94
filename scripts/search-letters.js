const fs = require('fs');
const cheerio = require('cheerio');

const xml = fs.readFileSync('old_data/celinewang94.wordpress.com.2026-11-03.000.xml', 'utf8');
const $ = cheerio.load(xml, { xmlMode: true });

console.log('Categories in XML:');
$('wp\\:category').each((i, el) => {
  console.log($(el).find('wp\\:category_nicename').text(), '-->', $(el).find('wp\\:cat_name').text());
});

console.log('\nScanning posts for category or mentions of Miêu Giới / Hoang Tưởng / Bảy Bức Thư...');
$('item').each((i, el) => {
  const title = $(el).find('title').text();
  const cats = [];
  $(el).find('category').each((_, c) => {
    cats.push($(c).text());
  });
  const content = $(el).find('content\\:encoded').text();
  const id = $(el).find('wp\\:post_id').text();
  const postType = $(el).find('wp\\:post_type').text();
  const postName = $(el).find('wp\\:post_name').text();
  
  const matchesCat = cats.some(c => /bảy|thư|miêu/i.test(c));
  if (matchesCat || /miêu giới|kẻ hoang tưởng/i.test(title + ' ' + content.slice(0, 500))) {
    console.log({
      id,
      postType,
      postName,
      title: title.slice(0, 60),
      cats,
      contentLen: content.length
    });
  }
});

