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
  p0Sql += `INSERT INTO stories (id, slug, title, author, cover_url, description, content_html, status, tags, created_at, updated_at) VALUES (${escapeSql(s.id)}, ${escapeSql(s.slug)}, ${escapeSql(s.title)}, ${escapeSql(s.author)}, ${escapeSql(s.coverUrl)}, ${escapeSql(s.description)}, ${escapeSql(s.contentHtml)}, ${escapeSql(s.status)}, ${escapeSql(tagsJson)}, ${Date.now()}, ${Date.now()});\n`;
});

fs.writeFileSync(path.join(OUTPUT_DIR, 'chunk_00_stories.sql'), p0Sql);
console.log('Wrote chunk_00_stories.sql (size: ' + p0Sql.length + ' chars)');

// Part 1: Chapters in chunks of 25 to keep files manageable for D1
const CHUNK_SIZE = 25;
let chunkIndex = 1;

for (let i = 0; i < data.chapters.length; i += CHUNK_SIZE) {
  const batch = data.chapters.slice(i, i + CHUNK_SIZE);
  let chunkSql = '';
  batch.forEach(c => {
    const parasJson = JSON.stringify(c.paragraphs);
    chunkSql += `INSERT INTO chapters (id, story_id, chapter_number, title, word_count, password, password_hint, content_html, paragraphs, created_at, updated_at) VALUES (${escapeSql(c.id)}, ${escapeSql(c.storyId)}, ${c.chapterNumber}, ${escapeSql(c.title)}, ${c.wordCount}, ${escapeSql(c.password)}, ${escapeSql(c.passwordHint)}, NULL, ${escapeSql(parasJson)}, ${c.createdAt}, ${Date.now()});\n`;
  });
  const fileName = `chunk_chapters_${String(chunkIndex).padStart(2, '0')}.sql`;
  fs.writeFileSync(path.join(OUTPUT_DIR, fileName), chunkSql);
  console.log(`Wrote ${fileName} (${batch.length} chapters, size: ${chunkSql.length} chars)`);
  chunkIndex++;
}

// Part 2: Comments (guestbook, reviews, paragraph comments)
let cmtSql = '';
data.guestbookComments.forEach(g => {
  cmtSql += `INSERT INTO guestbook_posts (id, author_name, is_admin, title, content, parent_id, created_at) VALUES (${escapeSql(g.id)}, ${escapeSql(g.authorName)}, ${g.isAdmin ? 1 : 0}, ${escapeSql(g.title)}, ${escapeSql(g.content)}, ${escapeSql(g.parentId)}, ${g.createdAt});\n`;
});

data.storyReviews.forEach(r => {
  cmtSql += `INSERT INTO reviews (id, story_id, author_name, rating, content, likes, parent_id, created_at) VALUES (${escapeSql(r.id)}, ${escapeSql(r.storyId)}, ${escapeSql(r.authorName)}, ${r.rating}, ${escapeSql(r.content)}, ${r.likes}, ${escapeSql(r.parentId)}, ${r.createdAt});\n`;
});

fs.writeFileSync(path.join(OUTPUT_DIR, 'chunk_comments_base.sql'), cmtSql);
console.log('Wrote chunk_comments_base.sql (guestbook + reviews, size: ' + cmtSql.length + ' chars)');

// Paragraph comments in batches of 100
let pcIndex = 1;
const PC_CHUNK = 100;
for (let i = 0; i < data.paragraphComments.length; i += PC_CHUNK) {
  const batch = data.paragraphComments.slice(i, i + PC_CHUNK);
  let pcSql = '';
  batch.forEach(pc => {
    pcSql += `INSERT INTO paragraph_comments (id, chapter_id, paragraph_index, author_name, content, is_typo_report, is_resolved, created_at) VALUES (${escapeSql(pc.id)}, ${escapeSql(pc.chapterId)}, ${pc.paragraphIndex}, ${escapeSql(pc.authorName)}, ${escapeSql(pc.content)}, ${pc.isTypoReport ? 1 : 0}, ${pc.isResolved ? 1 : 0}, ${pc.createdAt});\n`;
  });
  const fileName = `chunk_paragraph_comments_${String(pcIndex).padStart(2, '0')}.sql`;
  fs.writeFileSync(path.join(OUTPUT_DIR, fileName), pcSql);
  console.log(`Wrote ${fileName} (${batch.length} comments, size: ${pcSql.length} chars)`);
  pcIndex++;
}

console.log('All SQL chunks generated successfully!');

