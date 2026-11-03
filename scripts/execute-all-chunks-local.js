const { execSync } = require('child_process');

const chunks = [
  'chunk_00_stories.sql',
  'chunk_chapters_01.sql',
  'chunk_chapters_02.sql',
  'chunk_chapters_03.sql',
  'chunk_chapters_04.sql',
  'chunk_chapters_05.sql',
  'chunk_chapters_06.sql',
  'chunk_comments_base.sql',
  'chunk_paragraph_comments_01.sql',
  'chunk_paragraph_comments_02.sql',
  'chunk_paragraph_comments_03.sql',
  'chunk_paragraph_comments_04.sql',
  'chunk_paragraph_comments_05.sql',
  'chunk_paragraph_comments_06.sql',
];

console.log(`Starting execution of ${chunks.length} chunks on LOCAL D1...`);

chunks.forEach((chunk, index) => {
  const filePath = `old_data/sql_chunks/${chunk}`;
  console.log(`\n[${index + 1}/${chunks.length}] Executing locally: ${chunk}...`);
  try {
    const cmd = `npx wrangler d1 execute web-doc-truyen-db --local --file=${filePath}`;
    execSync(cmd, { encoding: 'utf8' });
    console.log(`  -> SUCCESS`);
  } catch (err) {
    console.error(`  -> ERROR executing ${chunk}:`, err.message);
    process.exit(1);
  }
});

console.log('\nAll local chunks loaded successfully!');
