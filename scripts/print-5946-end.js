const fs = require('fs');

const c5946 = fs.readFileSync('scripts/c5946.html', 'utf8');
const pIndex = c5946.indexOf('Bức Thư Thứ Nhất');
console.log(c5946.slice(pIndex - 200, pIndex + 1500));

