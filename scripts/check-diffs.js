const fs = require('fs');

const c5946 = fs.readFileSync('scripts/c5946.html', 'utf8');
const c5909 = fs.readFileSync('scripts/c5909.html', 'utf8');

// Check what elements are in 5946 vs 5909
console.log('5946 has youtube?:', c5946.includes('youtube'));
console.log('5909 has youtube?:', c5909.includes('youtube'));

console.log('5946 has pin/note?:', c5946.includes('Xin em đừng rơi lệ'));
console.log('5909 has pin/note?:', c5909.includes('Xin em đừng rơi lệ'));

console.log('5946 has jjwx image?:', c5946.includes('jjwxc'));
console.log('5909 has jjwx image?:', c5909.includes('jjwxc'));

console.log('5946 has pinterest image?:', c5946.includes('pinimg'));
console.log('5909 has pinterest image?:', c5909.includes('pinimg'));

