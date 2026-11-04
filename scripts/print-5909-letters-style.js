const fs = require('fs');

const c5909 = fs.readFileSync('scripts/c5909.html', 'utf8');
const pIndex = c5909.indexOf('<!-- LÁ THƯ THỨ NHẤT');
console.log(c5909.slice(pIndex, pIndex + 3000));

