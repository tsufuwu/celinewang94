const fs = require('fs');
const cheerio = require('cheerio');

const h5946 = fs.readFileSync('scripts/p5946.html', 'utf8');
const $46 = cheerio.load(h5946);

console.log('--- In p5946: All <a> tags ---');
$46('a').each((i, el) => {
  console.log(i, $46(el).text().trim(), 'href:', $46(el).attr('href'), 'style:', $46(el).attr('style'));
});

console.log('\n--- In p5946: All <button> tags ---');
$46('button').each((i, el) => {
  console.log(i, $46(el).text().trim());
});

const h5909 = fs.readFileSync('scripts/p5909.html', 'utf8');
const $09 = cheerio.load(h5909);

console.log('\n--- In p5909 ("code mẫu"): All <a> tags ---');
$09('a').each((i, el) => {
  console.log(i, $09(el).text().trim(), 'href:', $09(el).attr('href'));
});

console.log('\n--- In p5909: All <button> tags ---');
$09('button').each((i, el) => {
  console.log(i, $09(el).text().trim());
});

