const fs = require('fs');

const h5946 = fs.readFileSync('scripts/p5946.html', 'utf8');
const h5893 = fs.readFileSync('scripts/p5893.html', 'utf8');
const h5909 = fs.readFileSync('scripts/p5909.html', 'utf8');

console.log('=== p5946 snippet ===');
console.log(h5946.slice(1000, 3000));

console.log('\n=== Checking what strings exist in p5946 ===');
for (let i = 1; i <= 7; i++) {
  console.log(`Letter ${i} count in 5946:`, (h5946.match(new RegExp(`bức thư thứ ${i}|thư thứ ${i}|bức thứ ${i}|thư ${i}`, 'gi')) || []).length);
}

console.log('\n=== Checking p5893 ("code bảy bức thư final") ===');
console.log('p5893 snippet:');
console.log(h5893.slice(0, 2000));

console.log('\n=== Checking p5909 ("code mẫu") ===');
console.log('p5909 snippet:');
console.log(h5909.slice(0, 2000));

