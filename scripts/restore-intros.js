const { execSync } = require('child_process');
const path = require('path');

const list = [
  'update_story_bay_buc_thu.sql',
  'update_story_bong_nhiet_do_thap.sql',
  'update_story_de_profundis.sql',
  'update_story_gio_tin_phong.sql',
  'update_story_mat_bao.sql'
];

for (const f of list) {
  const fullPath = path.join(__dirname, '../old_data', f);
  console.log(`Executing ${f}...`);
  try {
    execSync(`npx wrangler d1 execute web-doc-truyen-db --remote --file="${fullPath}"`, {
      stdio: 'inherit'
    });
    console.log(`Done ${f}`);
  } catch (err) {
    console.error(`Error on ${f}:`, err.message);
  }
}

