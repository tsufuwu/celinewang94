const fs = require('fs');

const c5909 = fs.readFileSync('scripts/c5909.html', 'utf8');
const lines = c5909.split('\n');

console.log('Lines 280 to 350:');
console.log(lines.slice(280, 350).join('\n'));

