const fs = require('fs');

const c5946 = fs.readFileSync('scripts/c5946.html', 'utf8');
const c5909 = fs.readFileSync('scripts/c5909.html', 'utf8');

// In 5946, where does the letter section start?
const marker5946 = 'P.S.';
const idx5946 = c5946.indexOf(marker5946);
console.log('5946 around P.S.:');
console.log(c5946.slice(idx5946 - 200, idx5946 + 800));

// In 5909, where does the letter section start?
const marker5909 = 'P.S.';
const idx5909 = c5909.indexOf(marker5909);
console.log('\n5909 around P.S.:');
console.log(c5909.slice(idx5909 - 200, idx5909 + 800));

