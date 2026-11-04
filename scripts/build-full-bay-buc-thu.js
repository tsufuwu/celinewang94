const fs = require('fs');
const cheerio = require('cheerio');

const c5946 = fs.readFileSync('scripts/c5946.html', 'utf8');
const c5909 = fs.readFileSync('scripts/c5909.html', 'utf8');

// 1. Extract header part up to pinned note
const pinEndMarker = 'Tôi hiện hữu ở khắp mọi nơi.';
const pinIndex = c5946.indexOf(pinEndMarker);
const afterPin = c5946.indexOf('</div>', pinIndex);
const afterPinBox1 = c5946.indexOf('</div>', afterPin + 6);
const afterPinBox2 = c5946.indexOf('</div>', afterPinBox1 + 6);

const headerPart = c5946.slice(0, afterPinBox2 + 6);

// 2. Build the interactive Quick Navigation Tab Bar for 7 Letters
const navBar = `
            <!-- THANH CHỌN NHANH 7 BỨC THƯ (INTERACTIVE LETTER NAVIGATOR) -->
            <div style="margin: 25px 0 35px 0;padding: 16px 18px;background: rgba(244, 248, 250, 0.85);border: 1px solid #c0d7e3;border-radius: 8px;box-shadow: 0 4px 14px rgba(174, 203, 214, 0.15)">
                <div style="font-family: 'Courier New', monospace;font-size: 11px;font-weight: bold;color: #557a96;letter-spacing: 1.5px;margin-bottom: 12px;display: flex;align-items: center;justify-content: space-between;flex-wrap: wrap;gap: 6px">
                    <span style="display: flex;align-items: center;gap: 6px">
                        <img src="https://api.iconify.design/ph/envelope-simple-light.svg?color=%23557a96" style="width: 16px">
                        MỤC LỤC 7 BỨC THƯ (32 CHƯƠNG)
                    </span>
                    <span style="color: #8daabf;font-size: 10px;text-transform: uppercase">Bấm để chuyển nhanh đến thư</span>
                </div>
                <div style="display: flex;flex-wrap: wrap;gap: 8px">
                    <a href="#thu-1" style="flex: 1 1 calc(25% - 8px);min-width: 95px;padding: 8px 10px;text-align: center;background: #fdfdfc;border: 1px solid #aecbd6;border-left: 3px solid #557a96;border-radius: 4px;color: #233746;text-decoration: none;font-family: 'Alegreya', serif;font-size: 13.5px;font-weight: bold;box-shadow: 0 1px 3px rgba(35,55,70,0.06);transition: all 0.2s">
                        Thư 1 <span style="font-size: 11px;font-family: 'Courier New', monospace;color: #7c9eb2;display: block;font-weight: normal">01 — 05</span>
                    </a>
                    <a href="#thu-2" style="flex: 1 1 calc(25% - 8px);min-width: 95px;padding: 8px 10px;text-align: center;background: #fdfdfc;border: 1px solid #aecbd6;border-left: 3px solid #557a96;border-radius: 4px;color: #233746;text-decoration: none;font-family: 'Alegreya', serif;font-size: 13.5px;font-weight: bold;box-shadow: 0 1px 3px rgba(35,55,70,0.06);transition: all 0.2s">
                        Thư 2 <span style="font-size: 11px;font-family: 'Courier New', monospace;color: #7c9eb2;display: block;font-weight: normal">06 — 10</span>
                    </a>
                    <a href="#thu-3" style="flex: 1 1 calc(25% - 8px);min-width: 95px;padding: 8px 10px;text-align: center;background: #fdfdfc;border: 1px solid #aecbd6;border-left: 3px solid #557a96;border-radius: 4px;color: #233746;text-decoration: none;font-family: 'Alegreya', serif;font-size: 13.5px;font-weight: bold;box-shadow: 0 1px 3px rgba(35,55,70,0.06);transition: all 0.2s">
                        Thư 3 <span style="font-size: 11px;font-family: 'Courier New', monospace;color: #7c9eb2;display: block;font-weight: normal">11 — 15</span>
                    </a>
                    <a href="#thu-4" style="flex: 1 1 calc(25% - 8px);min-width: 95px;padding: 8px 10px;text-align: center;background: #fdfdfc;border: 1px solid #aecbd6;border-left: 3px solid #557a96;border-radius: 4px;color: #233746;text-decoration: none;font-family: 'Alegreya', serif;font-size: 13.5px;font-weight: bold;box-shadow: 0 1px 3px rgba(35,55,70,0.06);transition: all 0.2s">
                        Thư 4 <span style="font-size: 11px;font-family: 'Courier New', monospace;color: #7c9eb2;display: block;font-weight: normal">16 — 20</span>
                    </a>
                    <a href="#thu-5" style="flex: 1 1 calc(25% - 8px);min-width: 95px;padding: 8px 10px;text-align: center;background: #fdfdfc;border: 1px solid #aecbd6;border-left: 3px solid #557a96;border-radius: 4px;color: #233746;text-decoration: none;font-family: 'Alegreya', serif;font-size: 13.5px;font-weight: bold;box-shadow: 0 1px 3px rgba(35,55,70,0.06);transition: all 0.2s">
                        Thư 5 <span style="font-size: 11px;font-family: 'Courier New', monospace;color: #7c9eb2;display: block;font-weight: normal">21 — 25</span>
                    </a>
                    <a href="#thu-6" style="flex: 1 1 calc(25% - 8px);min-width: 95px;padding: 8px 10px;text-align: center;background: #fdfdfc;border: 1px solid #aecbd6;border-left: 3px solid #557a96;border-radius: 4px;color: #233746;text-decoration: none;font-family: 'Alegreya', serif;font-size: 13.5px;font-weight: bold;box-shadow: 0 1px 3px rgba(35,55,70,0.06);transition: all 0.2s">
                        Thư 6 <span style="font-size: 11px;font-family: 'Courier New', monospace;color: #7c9eb2;display: block;font-weight: normal">26 — 30</span>
                    </a>
                    <a href="#thu-7" style="flex: 1 1 calc(25% - 8px);min-width: 95px;padding: 8px 10px;text-align: center;background: #233746;border: 1px solid #233746;border-left: 3px solid #aecbd6;border-radius: 4px;color: #fdfdfc;text-decoration: none;font-family: 'Alegreya', serif;font-size: 13.5px;font-weight: bold;box-shadow: 0 1px 3px rgba(35,55,70,0.12);transition: all 0.2s">
                        Thư 7 <span style="font-size: 11px;font-family: 'Courier New', monospace;color: #aecbd6;display: block;font-weight: normal">31 — 32 (End)</span>
                    </a>
                </div>
            </div>
`;

// 3. Process the 7 letters from 5909:
// - Add id="thu-1" to id="thu-7" to each envelope box
// - Replace chapter links with /chuong/ch_baybucthu_[num]
const lettersStartMarker = '<!-- LÁ THƯ THỨ NHẤT';
const lettersIndex = c5909.indexOf(lettersStartMarker);
const lettersEndMarker = '<!-- /wp:html -->';
const lettersEndIndex = c5909.lastIndexOf(lettersEndMarker);

let lettersPart = c5909.slice(lettersIndex, lettersEndIndex);

// Add IDs to letter envelope blocks
lettersPart = lettersPart.replace(
  /<!-- LÁ THƯ THỨ NHẤT[^>]*-->\s*<div/i,
  '<!-- LÁ THƯ THỨ NHẤT (1-5) -->\n            <div id="thu-1"'
);
lettersPart = lettersPart.replace(
  /<!-- LÁ THƯ THỨ HAI[^>]*-->\s*<div/i,
  '<!-- LÁ THƯ THỨ HAI (6-10) -->\n            <div id="thu-2"'
);
lettersPart = lettersPart.replace(
  /<!-- LÁ THƯ THỨ BA[^>]*-->\s*<div/i,
  '<!-- LÁ THƯ THỨ BA (11-15) -->\n            <div id="thu-3"'
);
lettersPart = lettersPart.replace(
  /<!-- LÁ THƯ THỨ TƯ[^>]*-->\s*<div/i,
  '<!-- LÁ THƯ THỨ TƯ (16-20) -->\n            <div id="thu-4"'
);
lettersPart = lettersPart.replace(
  /<!-- LÁ THƯ THỨ NĂM[^>]*-->\s*<div/i,
  '<!-- LÁ THƯ THỨ NĂM (21-25) -->\n            <div id="thu-5"'
);
lettersPart = lettersPart.replace(
  /<!-- LÁ THƯ THỨ SÁU[^>]*-->\s*<div/i,
  '<!-- LÁ THƯ THỨ SÁU (26-30) -->\n            <div id="thu-6"'
);
lettersPart = lettersPart.replace(
  /<!-- LÁ THƯ THỨ BẢY - KẾT THÚC[^>]*-->\s*<div/i,
  '<!-- LÁ THƯ THỨ BẢY - KẾT THÚC (31-32) -->\n            <div id="thu-7"'
);

// Map each chapter button <a ...>XX</a> to /chuong/ch_baybucthu_[number]
// Using Cheerio on lettersPart
const $ = cheerio.load(`<div id="letters-root">${lettersPart}</div>`, { xmlMode: false });

for (let chNum = 1; chNum <= 32; chNum++) {
  const numStr = chNum < 10 ? `0${chNum}` : `${chNum}`;
  // Find anchor tag with text matching numStr
  $('a').each((_, a) => {
    const text = $(a).text().trim();
    if (text === numStr) {
      $(a).attr('href', `/chuong/ch_baybucthu_${chNum}`);
      $(a).attr('title', `Đọc Chương ${chNum}`);
      // Add subtle hover style if needed
      const existingStyle = $(a).attr('style') || '';
      $(a).attr('style', existingStyle + ';transition:all 0.15s ease;');
    }
  });
}

const processedLettersPart = $('#letters-root').html();

// Combine everything
const fullHtml = `${headerPart}\n${navBar}\n${processedLettersPart}\n<!-- /wp:html -->`;

fs.writeFileSync('scripts/bay_buc_thu_complete.html', fullHtml);
console.log('Successfully created bay_buc_thu_complete.html, total length:', fullHtml.length);

