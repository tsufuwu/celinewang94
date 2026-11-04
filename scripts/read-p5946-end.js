const fs = require('fs');
const html = fs.readFileSync('scripts/p5946.html', 'utf8');

const idx = html.indexOf('01</a>');
console.log('--- HTML around buttons 01-04 ---');
console.log(html.slice(idx - 200, idx + 1500));

console.log('--- END OF p5946.html (last 2000 chars) ---');
console.log(html.slice(-2000));

