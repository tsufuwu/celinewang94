const fs = require('fs');
const cheerio = require('cheerio');

const h5946 = fs.readFileSync('scripts/p5946.html', 'utf8');
const $ = cheerio.load(h5946);

$('a').each((i, el) => {
  const text = $(el).text().trim();
  if (['01', '02', '03', '04', '05', '06', '07'].includes(text)) {
    console.log('--- FOUND BUTTON ' + text + ' ---');
    console.log('Parent HTML:');
    console.log($(el).parent().html());
  }
});

console.log('\n--- ALL TEXT OF p5946 ---');
console.log($.text().slice(0, 3000));

