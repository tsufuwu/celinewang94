const fs = require('fs');
const cheerio = require('cheerio');

const h5909 = fs.readFileSync('scripts/p5909.html', 'utf8');
const $ = cheerio.load(h5909);

// Look for details, summary, or whatever makes them clickable!
console.log('details count:', $('details').length);
$('details').each((i, el) => {
  console.log(`details ${i}:`, $(el).find('summary').text().trim());
});

console.log('\nAll elements with id in 5909:');
$('[id]').each((i, el) => {
  console.log($(el).attr('id'), el.tagName);
});

console.log('\nAll <a> tags in 5909:');
$('a').each((i, el) => {
  const href = $(el).attr('href');
  if (href && href.startsWith('#')) {
    console.log($(el).text().trim(), '-> anchor:', href);
  }
});

