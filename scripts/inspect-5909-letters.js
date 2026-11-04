const fs = require('fs');

const html = fs.readFileSync('scripts/c5909.html', 'utf8');

// Find all letter blocks in 5909
const parts = html.split(/<!-- LÁ THƯ/i);
console.log('Number of parts split by LÁ THƯ:', parts.length);
for (let i = 1; i < parts.length; i++) {
  console.log(`\n=== LETTER ${i} ===`);
  console.log(parts[i].slice(0, 400));
}

