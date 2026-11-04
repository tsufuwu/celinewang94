const fs = require('fs');

const c5946 = fs.readFileSync('scripts/c5946.html', 'utf8');
const c5909 = fs.readFileSync('scripts/c5909.html', 'utf8');

console.log('c5946 length:', c5946.length);
console.log('c5909 length:', c5909.length);

// Compare the metadata section
const idx5946 = c5946.indexOf('border-top: 1px solid #b8cdd8');
const idx5909 = c5909.indexOf('border-top: 1px solid #b8cdd8');

console.log('5946 before letters len:', idx5946);
console.log('5909 before letters len:', idx5909);

// Check if the part before letters is identical
const before5946 = c5946.slice(0, idx5946);
const before5909 = c5909.slice(0, idx5909);
console.log('Before letters identical?:', before5946 === before5909);

