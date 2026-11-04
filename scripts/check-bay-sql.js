const fs = require('fs');
const sql = fs.readFileSync('old_data/update_story_bay_buc_thu.sql', 'utf8');

console.log('--- Links in update_story_bay_buc_thu.sql ---');
const cheerio = require('cheerio');
// Extract the html string from SQL
const match = sql.match(/content_html = '(.*)' WHERE id/s);
if (match) {
  const html = match[1].replace(/''/g, "'");
  const $ = cheerio.load(html);
  $('a').each((i, el) => {
    console.log(i, $(el).text().trim(), 'href:', $(el).attr('href'));
  });
} else {
  console.log('Match failed');
}

