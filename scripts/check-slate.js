const fs = require('fs');

const c5909 = fs.readFileSync('scripts/c5909.html', 'utf8');
const c5893 = fs.readFileSync('scripts/c5893.html', 'utf8');

console.log('c5909 has clapperboard/film-slate?:', c5909.includes('film-slate'));
console.log('c5893 has clapperboard/film-slate?:', c5893.includes('film-slate'));
console.log('c5909 has envelope?:', c5909.includes('envelope'));
console.log('c5893 has envelope?:', c5893.includes('envelope'));

