const fs = require('fs');

const c5909 = fs.readFileSync('scripts/c5909.html', 'utf8');

// Check what links exist in 5909
const cheerio = require('cheerio');
const $ = cheerio.load(c5909);

const links = [];
$('a').each((_, a) => {
  links.push({
    text: $(a).text().trim(),
    href: $(a).attr('href')
  });
});

console.log('Total links in 5909:', links.length);
console.log(links);

