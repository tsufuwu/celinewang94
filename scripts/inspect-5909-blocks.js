const fs = require('fs');
const h5909 = fs.readFileSync('scripts/p5909.html', 'utf8');

const cheerio = require('cheerio');
const $ = cheerio.load(h5909);

console.log('Searching for letter blocks in 5909...');

const letters = ['Nhất', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy'];
letters.forEach(l => {
  const el = $(`*:contains("Lá Thư Thứ ${l}")`).last();
  console.log(`\n=== Lá Thư Thứ ${l} ===`);
  console.log('Tag:', el[0]?.tagName);
  console.log('Parent HTML snippet:');
  console.log(el.parent().html()?.slice(0, 500));
});

