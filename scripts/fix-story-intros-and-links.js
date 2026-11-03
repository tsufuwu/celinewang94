const fs = require('fs');
const path = require('path');
const { XMLParser } = require('fast-xml-parser');
const cheerio = require('cheerio');
const { execSync } = require('child_process');

const XML_FILE = path.join(__dirname, '../old_data/celinewang94.wordpress.com.2026-11-03.000.xml');

function main() {
  console.log('Reading WordPress XML...');
  const xmlData = fs.readFileSync(XML_FILE, 'utf8');
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    parseTagValue: false,
  });
  const jsonObj = parser.parse(xmlData);
  const items = Array.isArray(jsonObj.rss?.channel?.item) ? jsonObj.rss.channel.item : [];

  const postSlugToChapterId = new Map();
  const pageSlugToStoryRoute = new Map([
    ['om-lay-trong-luc-larivegauche', '/truyen/om-lay-trong-luc'],
    ['om-lay-trong-luc', '/truyen/om-lay-trong-luc'],
    ['sternstunde-thoi-khac-dinh-menh-tri-so', '/truyen/sternstunde'],
    ['sternstunde', '/truyen/sternstunde'],
    ['draft-sterntunde', '/truyen/sternstunde'],
    ['de-profundis-oscar-wilde', '/truyen/de-profundis'],
    ['tu-chon-vuc-tham-de-profundis', '/truyen/de-profundis'],
    ['edit-fanfic-mat-bao-by-dam-thach', '/truyen/mat-bao'],
    ['mat-bao', '/truyen/mat-bao'],
    ['gio-tin-phong-thoi-ve-phia-bien-thuong-bac-thu', '/truyen/gio-tin-phong-thoi-ve-phia-bien'],
    ['gio-tin-phong', '/truyen/gio-tin-phong-thoi-ve-phia-bien'],
    ['bay-buc-thu-duoc-gui-den-sau-cai-chet-cua-ke-hoang-tuong-mieu-gioi-de-nhat-lo', '/truyen/bay-buc-thu-duoc-gui-den-sau-cai-chet-cua-ke-hoang-tuong'],
    ['bong-nhiet-do-thap-larivegauche-x-otasquiero', '/truyen/bong-nhiet-do-thap'],
    ['media-naranja', '/'],
    ['dang-go', '/kho-truyen'],
    ['dich', '/kho-truyen'],
    ['fanfic', '/kho-truyen'],
    ['full', '/kho-truyen'],
    ['password', '/tro-chuyen'],
  ]);

  items.forEach(item => {
    if (item['wp:post_type'] === 'post') {
      const slug = item['wp:post_name'];
      const id = 'ch_' + item['wp:post_id'];
      if (slug) {
        postSlugToChapterId.set(slug, id);
      }
    }
  });

  console.log(`Mapped ${postSlugToChapterId.size} post slugs to chapter IDs.`);

  function rewriteWordPressUrl(href) {
    if (!href || typeof href !== 'string') return href;
    if (!href.includes('celinewang94.wordpress.com')) return href;

    try {
      const url = new URL(href);
      const pathname = url.pathname.replace(/\/+$/, '');
      const parts = pathname.split('/').filter(Boolean);
      if (parts.length === 0) return '/';
      const lastPart = parts[parts.length - 1];

      if (postSlugToChapterId.has(lastPart)) {
        return `/chuong/${postSlugToChapterId.get(lastPart)}`;
      }
      if (pageSlugToStoryRoute.has(lastPart)) {
        return pageSlugToStoryRoute.get(lastPart);
      }
      for (const part of parts) {
        if (pageSlugToStoryRoute.has(part)) {
          return pageSlugToStoryRoute.get(part);
        }
      }
      return '/kho-truyen';
    } catch {
      return href;
    }
  }

  function processHtml(rawHtml) {
    if (!rawHtml) return '';
    const $ = cheerio.load(rawHtml, { xmlMode: false, decodeEntities: true });
    $('a').each(function() {
      const currentHref = $(this).attr('href');
      if (currentHref && currentHref.includes('celinewang94.wordpress.com')) {
        const newHref = rewriteWordPressUrl(currentHref);
        $(this).attr('href', newHref);
      }
    });
    return $('body').html() || '';
  }

  // Stories to update
  const storyTargetPages = [
    { id: 'story_om_lay_trong_luc', pageId: 44, title: 'Ôm Lấy Trọng Lực' },
    { id: 'story_sternstunde', pageId: 4016, title: 'Sternstunde' },
    { id: 'story_de_profundis', pageId: 356, title: 'De profundis' },
    { id: 'story_mat_bao', pageId: 5484, title: 'Mắt Bão' },
    { id: 'story_gio_tin_phong', pageId: 5730, title: 'Gió Tín Phong' },
    { id: 'story_bay_buc_thu', pageId: 5946, title: 'Bảy Bức Thư' },
    { id: 'story_bong_nhiet_do_thap', pageId: 2951, title: 'Bỏng Nhiệt Độ Thấp' }
  ];

  const sqlFiles = [];

  storyTargetPages.forEach(target => {
    const pageItem = items.find(i => i['wp:post_type'] === 'page' && String(i['wp:post_id']) === String(target.pageId));
    if (!pageItem) {
      console.warn(`Could not find page ${target.pageId} for ${target.title}`);
      return;
    }
    const rawHtml = pageItem['content:encoded'] || '';
    const processedHtml = processHtml(rawHtml);
    console.log(`Processing ${target.title} (Page ${target.pageId}): Raw len = ${rawHtml.length}, Processed len = ${processedHtml.length}`);

    // Break into 20k char chunks to avoid SQLITE_TOOBIG
    const chunkSize = 20000;
    const chunks = [];
    for (let i = 0; i < processedHtml.length; i += chunkSize) {
      chunks.push(processedHtml.slice(i, i + chunkSize));
    }

    const sqlStatements = [];
    chunks.forEach((chunk, idx) => {
      const escaped = chunk.replace(/'/g, "''");
      if (idx === 0) {
        sqlStatements.push(`UPDATE stories SET content_html = '${escaped}' WHERE id = '${target.id}';`);
      } else {
        sqlStatements.push(`UPDATE stories SET content_html = content_html || '${escaped}' WHERE id = '${target.id}';`);
      }
    });

    const outSqlPath = path.join(__dirname, `../old_data/update_${target.id}.sql`);
    fs.writeFileSync(outSqlPath, sqlStatements.join('\n\n'), 'utf8');
    sqlFiles.push({ title: target.title, path: outSqlPath });
  });

  console.log(`Generated SQL files for ${sqlFiles.length} stories.`);

  // Execute them on D1
  for (const item of sqlFiles) {
    console.log(`Executing SQL for ${item.title}...`);
    try {
      execSync(`npx wrangler d1 execute web-doc-truyen-db --remote --file="${item.path}"`, {
        stdio: 'inherit'
      });
      console.log(`Successfully updated ${item.title} in D1.`);
    } catch (e) {
      console.error(`Failed to update ${item.title}:`, e.message);
    }
  }

  console.log('All stories intro HTML updated!');
}

main();
