const fs = require('fs');

const c5946 = fs.readFileSync('scripts/c5946.html', 'utf8');
const c5909 = fs.readFileSync('scripts/c5909.html', 'utf8');

console.log('5946 top up to 2000 chars:');
console.log(c5946.slice(0, 2000));
console.log('\n--- 5909 top up to 2000 chars: ---');
console.log(c5909.slice(0, 2000));

