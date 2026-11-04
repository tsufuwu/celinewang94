const fs = require('fs');
const cheerio = require('cheerio');

const xml = fs.readFileSync('old_data/celinewang94.wordpress.com.2026-11-03.000.xml', 'utf8');
const $ = cheerio.load(xml, { xmlMode: true });

$('item').each((i, el) => {
  const title = $(el).find('title').text();
  const link = $(el).find('link').text();
  const postName = $(el).find('wp\\:post_name').text();
  const postType = $(el).find('wp\\:post_type').text();
  const status = $(el).find('wp\\:status').text();
  const content = $(el).find('content\\:encoded').text();
  const id = $(el).find('wp\\:post_id').text();

  if (/bảy bức thư|bay-buc-thu|sternstunde|hoang tưởng|mẫu|bức thư/i.test(title + ' ' + postName + ' ' + link)) {
    console.log({
      id,
      postType,
      postName,
      title: title.slice(0, 60),
      contentLen: content.length,
      status
    });
  }
});

