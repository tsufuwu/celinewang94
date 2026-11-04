const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('scripts/live-bay-buc-thu.html', 'utf8');
const $ = cheerio.load(html);

// Find post content or entry content
const entryContent = $('.entry-content').html();
console.log('Entry content length:', entryContent ? entryContent.length : 'not found');

if (entryContent) {
  fs.writeFileSync('scripts/live-entry-content.html', entryContent);
  // Search for letters
  const matches = [...entryContent.matchAll(/(Lá Thư|Bức Thư)[^<]*/gi)];
  console.log('Letter matches:');
  matches.forEach(m => console.log(m[0].trim()));

  // Search for any clickable buttons or tabs
  const links = [];
  $('a', entryContent).each((_, a) => {
    links.push({ text: $(a).text().trim(), href: $(a).attr('href') });
  });
  console.log('Total links in entry content:', links.length);
  console.log('Sample links:', links.slice(0, 20));
}

