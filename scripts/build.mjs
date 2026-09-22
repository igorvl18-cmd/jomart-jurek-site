import fs from 'node:fs';

const content = JSON.parse(fs.readFileSync('data/content.json', 'utf8'));
const gallery = JSON.parse(fs.readFileSync('data/gallery.json', 'utf8'));
const pages = { ru: 'dist/index.html', kk: 'dist/kz/index.html', en: 'dist/english/index.html' };

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function sectionReplace(html, id, selector, value) {
  const sectionPattern = new RegExp(`(<section[^>]*id=["']${id}["'][^>]*>[\\s\\S]*?</section>)`);
  return html.replace(sectionPattern, section => {
    const pattern = selector === 'h1'
      ? /<h1>[\s\S]*?<\/h1>/
      : selector === 'h2'
        ? /<h2>[\s\S]*?<\/h2>/
        : /<p class="lead">[\s\S]*?<\/p>/;
    return section.replace(pattern, `<${selector === 'lead' ? 'p class="lead"' : selector}>${escapeHtml(value)}</${selector === 'lead' ? 'p' : selector}>`);
  });
}

for (const [lang, file] of Object.entries(pages)) {
  let html = fs.readFileSync(file, 'utf8');
  const c = content[lang];
  html = sectionReplace(html, 'home', 'h1', c.hero_title);
  html = html.replace(/<p class="hero-copy">[\s\S]*?<\/p>/, `<p class="hero-copy">${escapeHtml(c.hero_text)}</p>`);
  for (const [id, prefix] of [['about','about'],['projects','projects'],['house','house'],['help','help'],['contacts','contacts']]) {
    html = sectionReplace(html, id, 'h2', c[`${prefix}_title`]);
    html = sectionReplace(html, id, 'lead', c[`${prefix}_text`]);
  }
  const altKey = lang === 'ru' ? 'alt_ru' : lang === 'kk' ? 'alt_kk' : 'alt_en';
  const galleryHtml = gallery.map((item, index) => `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item[altKey])}" loading="lazy" decoding="async">`).join('');
  html = html.replace(/<div class="gallery">[\s\S]*?<\/div>\s*<div class="full-gallery"[\s\S]*?<\/div>/, `<div class="gallery">${galleryHtml}</div>`);
  fs.writeFileSync(file, html);
}
