const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('scripts/bay_buc_thu_complete.html', 'utf8');
const $ = cheerio.load(html);

console.log('Total a tags:', $('a').length);
const ids = [];
$('[id]').each((_, el) => ids.push($(el).attr('id')));
console.log('Found ids:', ids);

const chapterLinks = [];
$('a[href*="ch_baybucthu"]').each((_, el) => {
  chapterLinks.push({ text: $(el).text().trim(), href: $(el).attr('href') });
});
console.log('Total chapter links (1-32):', chapterLinks.length);
console.log('First 3:', chapterLinks.slice(0, 3));
console.log('Last 3:', chapterLinks.slice(-3));

