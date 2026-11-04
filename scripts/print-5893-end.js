const fs = require('fs');

const c5893 = fs.readFileSync('scripts/c5893.html', 'utf8');
const pIndex = c5893.indexOf('Bức Thư Thứ Nhất');
console.log('5893 end around Bức Thư Thứ Nhất:');
console.log(c5893.slice(pIndex));

