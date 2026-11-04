const fs = require('fs');
const cheerio = require('cheerio');

const xml = fs.readFileSync('old_data/celinewang94.wordpress.com.2026-11-03.000.xml', 'utf8');
const $ = cheerio.load(xml, { xmlMode: true });

function getItemContent(id) {
  let content = '';
  $('item').each((_, el) => {
    if ($(el).find('wp\\:post_id').text() === id) {
      content = $(el).find('content\\:encoded').text();
    }
  });
  return content;
}

const c5946 = getItemContent('5946');
const c5909 = getItemContent('5909');
const c5893 = getItemContent('5893');

console.log('5946 length:', c5946.length);
console.log('5909 length:', c5909.length);
console.log('5893 length:', c5893.length);

fs.writeFileSync('scripts/c5946.html', c5946);
fs.writeFileSync('scripts/c5909.html', c5909);
fs.writeFileSync('scripts/c5893.html', c5893);
console.log('Saved to scripts/c5946.html, c5909.html, c5893.html');

