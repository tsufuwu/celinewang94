const fs = require('fs');
const cheerio = require('cheerio');

const h5909 = fs.readFileSync('scripts/p5909.html', 'utf8');
const h5946 = fs.readFileSync('scripts/p5946.html', 'utf8');

const $09 = cheerio.load(h5909);
const $46 = cheerio.load(h5946);

$09('script, style').remove();
$46('script, style').remove();

const t09 = $09.text().replace(/\s+/g, ' ');
const t46 = $46.text().replace(/\s+/g, ' ');

console.log('Text 5909 len:', t09.length);
console.log('Text 5946 len:', t46.length);

console.log('\n--- Text in 5909 that is not in 5946: ---');
console.log(t09.slice(t46.length - 200));

