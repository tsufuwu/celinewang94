const fs = require('fs');
const cheerio = require('cheerio');

const h5946 = fs.readFileSync('scripts/p5946.html', 'utf8');
const $ = cheerio.load(h5946);

// Remove scripts/styles
$('script, style').remove();
console.log($.text().replace(/\s+/g, ' '));

