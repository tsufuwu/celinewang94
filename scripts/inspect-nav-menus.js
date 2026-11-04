const fs = require('fs');
const cheerio = require('cheerio');

const xml = fs.readFileSync('old_data/celinewang94.wordpress.com.2026-11-03.000.xml', 'utf8');
const $ = cheerio.load(xml, { xmlMode: true });

$('item').each((_, el) => {
  if ($(el).find('wp\\:post_type').text() === 'nav_menu_item') {
    const meta = {};
    $(el).find('wp\\:postmeta').each((_, m) => {
      const k = $(m).find('wp\\:meta_key').text();
      const v = $(m).find('wp\\:meta_value').text();
      meta[k] = v;
    });
    console.log({
      id: $(el).find('wp\\:post_id').text(),
      title: $(el).find('title').text(),
      url: meta['_menu_item_url'],
      type: meta['_menu_item_type'],
      object: meta['_menu_item_object'],
      objectId: meta['_menu_item_object_id'],
      menuItemParent: meta['_menu_item_menu_item_parent']
    });
  }
});

