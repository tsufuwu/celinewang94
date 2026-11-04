const fs = require('fs');

const xml = fs.readFileSync('old_data/celinewang94.wordpress.com.2026-11-03.000.xml', 'utf8');

// Search for any tabs or click handlers or anchors with href="#..." in xml
const matches = [...xml.matchAll(/href=["']#([^"']+)["']/g)];
const hrefs = new Set();
matches.forEach(m => hrefs.add(m[1]));
console.log('Unique anchor targets (href="#..."):', Array.from(hrefs));

// Search for javascript or onclick
const onClicks = [...xml.matchAll(/onclick=["'][^"']+["']/gi)];
console.log('onClicks found in xml:', onClicks.length);

