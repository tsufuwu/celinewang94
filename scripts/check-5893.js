const fs = require('fs');

const c5893 = fs.readFileSync('scripts/c5893.html', 'utf8');
console.log('c5893 length:', c5893.length);
console.log(c5893.slice(c5893.indexOf('film-slate') - 200, c5893.indexOf('film-slate') + 800));

