const fs = require('fs');

const c5946 = fs.readFileSync('scripts/c5946.html', 'utf8');
const c5909 = fs.readFileSync('scripts/c5909.html', 'utf8');

// 1. Extract header and metadata from 5946 (which has the complete metadata, YouTube video, Pinterest cover, and pinned note)
// In 5946, the pinned note ends before the clapperboard:
const pinEndMarker = 'Tôi hiện hữu ở khắp mọi nơi.';
const pinIndex = c5946.indexOf(pinEndMarker);
const afterPin = c5946.indexOf('</div>', pinIndex); // closes text
const afterPinBox1 = c5946.indexOf('</div>', afterPin + 6); // closes inner box
const afterPinBox2 = c5946.indexOf('</div>', afterPinBox1 + 6); // closes flex wrapper

const headerPart = c5946.slice(0, afterPinBox2 + 6);
console.log('Header part ends with:');
console.log(headerPart.slice(-200));

// 2. Extract the 7 letters from 5909
const lettersStartMarker = '<!-- LÁ THƯ THỨ NHẤT';
const lettersIndex = c5909.indexOf(lettersStartMarker);
const lettersEndMarker = '<!-- /wp:html -->';
const lettersEndIndex = c5909.lastIndexOf(lettersEndMarker);

const lettersPart = c5909.slice(lettersIndex, lettersEndIndex);
console.log('\nLetters part starts with:');
console.log(lettersPart.slice(0, 150));
console.log('\nLetters part ends with:');
console.log(lettersPart.slice(-150));

