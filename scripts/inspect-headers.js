const fs = require('fs');

const c5946 = fs.readFileSync('scripts/c5946.html', 'utf8');
const c5909 = fs.readFileSync('scripts/c5909.html', 'utf8');

console.log('--- c5946 lines 1 to 150 ---');
console.log(c5946.split('\n').slice(0, 150).join('\n'));

console.log('\n--- c5909 lines 1 to 150 ---');
console.log(c5909.split('\n').slice(0, 150).join('\n'));

