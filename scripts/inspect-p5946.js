const fs = require('fs');
const html = fs.readFileSync('scripts/p5946.html', 'utf8');
const cheerio = require('cheerio');
const $ = cheerio.load(html);

console.log('Styles count:', $('style').length);
$('style').each((i, el) => {
  console.log('--- Style ' + i + ' ---');
  console.log($(el).html());
});

console.log('Inputs count:', $('input').length);
$('input').each((i, el) => {
  console.log('Input:', $(el).attr('type'), $(el).attr('name'), $(el).attr('id'), $(el).attr('checked'));
});

console.log('Labels count:', $('label').length);
$('label').each((i, el) => {
  console.log('Label:', $(el).attr('for'), $(el).text().trim());
});

console.log('Details count:', $('details').length);

console.log('\n--- Searching for letter headers or divs ---');
$('*').each((i, el) => {
  const id = $(el).attr('id');
  const cls = $(el).attr('class');
  if (id || (cls && cls.includes('letter'))) {
    console.log('Element:', el.tagName, 'id:', id, 'class:', cls);
  }
});

