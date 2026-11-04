const fs = require('fs');
const c5946 = fs.readFileSync('scripts/c5946.html', 'utf8');
const lines = c5946.split('\n');
console.log(lines.slice(100, 160).join('\n'));

