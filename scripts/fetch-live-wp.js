async function fetchLive() {
  try {
    const res = await fetch('https://celinewang94.wordpress.com/bay-buc-thu-duoc-gui-den-sau-cai-chet-cua-ke-hoang-tuong-mieu-gioi-de-nhat-lo/');
    console.log('Status:', res.status);
    const html = await res.text();
    console.log('Len:', html.length);
    const cheerio = require('cheerio');
    const $ = cheerio.load(html);
    console.log('Entry content text preview:');
    console.log($('.entry-content').text().slice(0, 3000));
    
    console.log('\nAll links inside .entry-content:');
    $('.entry-content a').each((i, el) => {
      console.log($(el).text().trim(), '->', $(el).attr('href'));
    });
  } catch (e) {
    console.error('Error fetching live:', e);
  }
}
fetchLive();

