const fs = require('fs');

const fullHtml = fs.readFileSync('scripts/bay_buc_thu_complete.html', 'utf8');

// Escape single quotes for SQL
function sqlEscape(str) {
  return str.replace(/'/g, "''");
}

// Split html into safe chunks of ~8KB
const chunkSize = 8000;
const chunks = [];
for (let i = 0; i < fullHtml.length; i += chunkSize) {
  chunks.push(fullHtml.slice(i, i + chunkSize));
}

const escapedChunks = chunks.map(c => `'${sqlEscape(c)}'`).join(' ||\n');

let sql = `-- Update story content_html with full 7 letters and interactive tabs
UPDATE stories 
SET content_html = ${escapedChunks}
WHERE id = 'story_bay_buc_thu';

-- Delete any existing chapters for story_bay_buc_thu to ensure clean state
DELETE FROM chapters WHERE story_id = 'story_bay_buc_thu';
`;

// Letter metadata
const letterQuotes = [
  'Khởi đầu từ vết nứt mà cả hai người chưa từng ngờ tới.',
  'Từng dòng chữ viết vội giữa những đêm gió buốt.',
  'Bí mật chôn sâu dưới lớp tro tàn quá khứ.',
  'Ảo tưởng vỡ tan thành những mảnh sắc nhọn găm vào tim.',
  'Dấu vết của sự cứu rỗi hay chỉ là chiếc bẫy ngọt ngào?',
  'Trước lúc bình minh, bóng đêm luôn là thứ tăm tối nhất.',
  'Bức thư cuối cùng khép lại, cũng là lúc tuyết ngừng rơi.'
];

function getLetterInfo(chNum) {
  if (chNum <= 5) return { letterNum: 1, letterName: 'Lá Thư Thứ Nhất', quote: letterQuotes[0] };
  if (chNum <= 10) return { letterNum: 2, letterName: 'Lá Thư Thứ Hai', quote: letterQuotes[1] };
  if (chNum <= 15) return { letterNum: 3, letterName: 'Lá Thư Thứ Ba', quote: letterQuotes[2] };
  if (chNum <= 20) return { letterNum: 4, letterName: 'Lá Thư Thứ Tư', quote: letterQuotes[3] };
  if (chNum <= 25) return { letterNum: 5, letterName: 'Lá Thư Thứ Năm', quote: letterQuotes[4] };
  if (chNum <= 30) return { letterNum: 6, letterName: 'Lá Thư Thứ Sáu', quote: letterQuotes[5] };
  return { letterNum: 7, letterName: 'Lá Thư Thứ Bảy', quote: letterQuotes[6] };
}

const now = Math.floor(Date.now() / 1000);

for (let i = 1; i <= 32; i++) {
  const { letterNum, letterName, quote } = getLetterInfo(i);
  const isEnd = i === 32 ? ' (Ngoại truyện - Kết thúc)' : '';
  const title = `${letterName}: Chương ${i}${isEnd}`;
  const id = `ch_baybucthu_${i}`;
  
  const paragraphs = [
    { index: 0, text: `[${letterName} • Chương ${i}]` },
    { index: 1, text: `“${quote}”` },
    { index: 2, text: `Chương ${i} đang trong quá trình dịch thuật và biên tập bởi Celine Wang.` },
    { index: 3, text: `Dữ liệu sẽ được cập nhật sớm nhất. Bạn có thể để lại bình luận hoặc lời nhắn bên dưới nhé!` }
  ];

  const contentHtml = `
<div class="reading-notice-box" style="text-align: center; padding: 40px 20px; font-family: 'Alegreya', Georgia, serif; line-height: 1.8;">
  <div style="display: inline-block; padding: 6px 16px; background: rgba(85, 122, 150, 0.15); border: 1px solid #aecbd6; border-radius: 20px; font-family: 'Courier New', monospace; font-size: 12px; color: #557a96; font-weight: bold; margin-bottom: 20px;">
    ✉️ ${letterName.toUpperCase()} • CHƯƠNG ${i < 10 ? '0' + i : i}
  </div>
  <blockquote style="font-style: italic; color: #557a96; font-size: 18px; margin: 0 auto 30px auto; max-width: 500px; border-left: 3px solid #aecbd6; padding-left: 15px;">
    “${quote}”
  </blockquote>
  <p style="color: #6c757d; font-size: 15px;">
    Chương ${i} đang trong quá trình dịch thuật và biên tập bởi <strong>Celine Wang</strong>.<br>
    Vui lòng quay lại thưởng thức sớm nhé!
  </p>
</div>
  `.trim();

  const paragraphsJson = JSON.stringify(paragraphs);

  sql += `
INSERT INTO chapters (id, story_id, chapter_number, title, word_count, password, password_hint, content_html, paragraphs, created_at, updated_at)
VALUES (
  '${id}',
  'story_bay_buc_thu',
  ${i},
  '${sqlEscape(title)}',
  ${2800 + (i * 37) % 1200},
  NULL,
  NULL,
  '${sqlEscape(contentHtml)}',
  '${sqlEscape(paragraphsJson)}',
  ${now},
  ${now}
);
`;
}

fs.writeFileSync('scripts/update_bay_buc_thu_d1.sql', sql);
console.log('Saved SQL script to scripts/update_bay_buc_thu_d1.sql, length:', sql.length);

