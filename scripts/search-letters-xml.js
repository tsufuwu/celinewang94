const fs = require('fs');
const xml = fs.readFileSync('old_data/celinewang94.wordpress.com.2026-11-03.000.xml', 'utf8');

console.log('Searching xml for key terms...');

const keywords = [
  'Bức Thư Thứ Hai',
  'Bức Thư Thứ Ba',
  'bức thư thứ',
  '2ND LETTER',
  '3RD LETTER',
  'Hạ Bình Thu',
  'Dụ Hàm',
  'Miêu Giới',
  'SCENE 02',
  'TAKE 05',
  'Bức Thư'
];

keywords.forEach(kw => {
  const count = (xml.match(new RegExp(kw, 'gi')) || []).length;
  console.log(`Keyword "${kw}": ${count} occurrences`);
});

