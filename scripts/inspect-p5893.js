const fs = require('fs');
const h5893 = fs.readFileSync('scripts/p5893.html', 'utf8');

const cheerio = require('cheerio');
const $ = cheerio.load(h5893);

console.log('--- In p5893 ("code bảy bức thư final") ---');
console.log('All <a>:');
$('a').each((i, el) => {
  console.log(i, $(el).text().trim(), 'href:', $(el).attr('href'));
});

console.log('\nAll text in p5893:');
$('script, style').remove();
console.log($.text().replace(/\s+/g, ' '));

