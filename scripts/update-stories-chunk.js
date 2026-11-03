const fs = require('fs');
const path = require('path');
const { parseXmlData, escapeSql } = require('./generate-import-sql');

const XML_FILE = path.join(__dirname, '../old_data/celinewang94.wordpress.com.2026-11-03.000.xml');
const OUTPUT_DIR = path.join(__dirname, '../old_data/sql_chunks');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const data = parseXmlData(XML_FILE);

// Part 0: Clean mock data and insert Stories
let p0Sql = `-- Clean mock data
DELETE FROM paragraph_comments;
DELETE FROM reviews;
DELETE FROM guestbook_posts;
DELETE FROM reading_progress;
DELETE FROM chapters;
DELETE FROM stories;

`;

data.stories.forEach(s => {
  const tagsJson = JSON.stringify(s.tags);
  // Insert base story with empty content_html
  p0Sql += `INSERT INTO stories (id, slug, title, author, cover_url, description, content_html, status, tags, created_at, updated_at) VALUES (${escapeSql(s.id)}, ${escapeSql(s.slug)}, ${escapeSql(s.title)}, ${escapeSql(s.author)}, ${escapeSql(s.coverUrl)}, ${escapeSql(s.description)}, '', ${escapeSql(s.status)}, ${escapeSql(tagsJson)}, ${Date.now()}, ${Date.now()});\n`;
  
  // Append content_html in small chunks of 20,000 chars to strictly stay under SQLITE_TOOBIG limit
  const fullHtml = s.contentHtml || '';
  const CHUNK_LEN = 20000;
  for (let i = 0; i < fullHtml.length; i += CHUNK_LEN) {
    const slice = fullHtml.substring(i, i + CHUNK_LEN);
    p0Sql += `UPDATE stories SET content_html = content_html || ${escapeSql(slice)} WHERE id = ${escapeSql(s.id)};\n`;
  }
});

fs.writeFileSync(path.join(OUTPUT_DIR, 'chunk_00_stories.sql'), p0Sql);
console.log('Regenerated chunk_00_stories.sql successfully!');

