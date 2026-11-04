const fs = require('fs');
const xml = fs.readFileSync('old_data/celinewang94.wordpress.com.2026-11-03.000.xml', 'utf8');

console.log('Searching for interactive patterns in XML...');

const patterns = [
  ':checked',
  'type="radio"',
  'type="checkbox"',
  '<details',
  'onclick',
  'tab-content',
  'tab-pane',
  'nav-tabs',
  'active-tab',
  'show-tab',
  'letter-tab'
];

patterns.forEach(p => {
  const count = (xml.match(new RegExp(p, 'gi')) || []).length;
  console.log(`Pattern "${p}": ${count} occurrences`);
});

