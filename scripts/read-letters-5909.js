const fs = require('fs');
const h5909 = fs.readFileSync('scripts/p5909.html', 'utf8');

console.log('Total length of 5909:', h5909.length);
fs.writeFileSync('scripts/formatted-5909.html', h5909, 'utf8');

// Find all occurrences of "Lá Thư" or "Bức Thư" in 5909
const matches = [...h5909.matchAll(/(?:Lá|Bức) Thư Thứ [^\n<]+/g)];
console.log('Letters in 5909:');
matches.forEach(m => console.log(m[0]));

