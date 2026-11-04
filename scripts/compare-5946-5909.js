const fs = require('fs');

const c5946 = fs.readFileSync('scripts/c5946.html', 'utf8');
const c5909 = fs.readFileSync('scripts/c5909.html', 'utf8');

console.log('c5946 ends with:');
console.log(c5946.slice(-500));

console.log('\n---');
console.log('c5909 ends with:');
console.log(c5909.slice(-500));

