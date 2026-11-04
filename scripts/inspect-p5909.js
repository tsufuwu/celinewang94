const fs = require('fs');
const cheerio = require('cheerio');

const h5909 = fs.readFileSync('scripts/p5909.html', 'utf8');
const $ = cheerio.load(h5909);

console.log('--- Text in p5909 ---');
console.log($.text().slice(0, 3000));

console.log('\n--- All links in p5909 ---');
$('a').each((i, el) => {
  console.log(i, $(el).text().trim(), 'href:', $(el).attr('href'));
});

