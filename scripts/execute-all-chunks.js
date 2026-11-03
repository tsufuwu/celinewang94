const { execSync } = require('child_process');
const path = require('path');

const chunks = [
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

console.log(`Starting execution of ${chunks.length} chunks on remote D1...`);

chunks.forEach((chunk, index) => {
  const filePath = `old_data/sql_chunks/${chunk}`;
  console.log(`\n[${index + 1}/${chunks.length}] Executing: ${chunk}...`);
  try {
    const cmd = `npx wrangler d1 execute web-doc-truyen-db --remote --file=${filePath}`;
    const output = execSync(cmd, { encoding: 'utf8' });
    // Print brief output
    const match = output.match(/Processed (\d+) queries/);
    if (match) {
      console.log(`  -> SUCCESS: ${match[0]}`);
    } else {
      console.log(`  -> SUCCESS`);
    }
  } catch (err) {
    console.error(`  -> ERROR executing ${chunk}:`, err.message);
    process.exit(1);
  }
});

console.log('\n======================================');
console.log('ALL CHUNKS EXECUTED SUCCESSFULLY!');
console.log('======================================');
