const fs = require('fs');
const h5909 = fs.readFileSync('scripts/p5909.html', 'utf8');

console.log('5909 HTML length:', h5909.length);

// Let's see the sections in 5909
const cheerio = require('cheerio');
const $ = cheerio.load(h5909);

console.log('--- Top level divs in 5909 ---');
$('div').each((i, el) => {
  const text = $(el).clone().children().remove().end().text().trim();
  const style = $(el).attr('style') || '';
  if (style.includes('background') || text.includes('Thư')) {
    console.log(i, text.slice(0, 50), 'style:', style.slice(0, 80));
  }
});

