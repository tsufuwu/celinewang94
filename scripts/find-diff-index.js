const fs = require('fs');

const c5946 = fs.readFileSync('scripts/c5946.html', 'utf8');
const c5909 = fs.readFileSync('scripts/c5909.html', 'utf8');

// Find the first index where they differ
let diffIdx = 0;
while (diffIdx < c5946.length && diffIdx < c5909.length && c5946[diffIdx] === c5909[diffIdx]) {
  diffIdx++;
}

console.log('Differ at index:', diffIdx);
console.log('--- c5946 around diff: ---');
console.log(c5946.slice(diffIdx, diffIdx + 600));
console.log('\n--- c5909 around diff: ---');
console.log(c5909.slice(diffIdx, diffIdx + 600));

