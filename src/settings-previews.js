const textOf = (el) => (el?.value || '').trim();
const safe = (value) => String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const titleOf = (group) => group.querySelector('.group-heading h3, .component-summary b')?.textContent?.trim() || '';
function fieldValue(group, labelName) {
  const fields = [...group.querySelectorAll('.field')];
  const match = fields.find(label => {
    const labelText = [...label.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).map(node => node.textContent).join(' ').trim();
    const uploadLabel = label.querySelector(':scope > span')?.textContent?.trim();
    return (labelText || uploadLabel || '').toLowerCase().startsWith(labelName.toLowerCase());
  });
  const control = match?.querySelector('input:not([type=file]), textarea, select');
  if (control) return textOf(control);
  const image = match?.querySelector('img');
  return image?.src || '';
}
function imageTag(src, alt, className = '') {
  return src ? `<img class="store-preview-image ${className}" src="${safe(src)}" alt="${safe(alt)}">` : `<div class="store-preview-placeholder ${className}"><span>Image preview</span></div>`;
}
function previewMarkup(group, title) {
  const isComponents = group.matches('.component-card');
  const get = (name) => fieldValue(group, name);
  const hasData = [...group.querySelectorAll('input:not([type=file]), textarea, select')].some(el => textOf(el)) || [...group.querySelectorAll('.image-upload-field img')].length > 0;
  let body = '';
  if (/brand|logo|header/i.test(title)) {
    const name = get('Company name') || get('Logo wordmark') || 'Your brand name';
    const logo = get('Logo image');
    body = `<div class="store-preview-brand">${logo ? imageTag(logo, name, 'brand-image') : `<strong>${safe(name)}</strong>`}<span>${safe(get('Logo tagline') || get('Footer logo caption') || 'Your brand tagline')}</span></div><div class="store-preview-mini-nav"><i></i><i></i><i></i><i></i></div>`;
  } else if (/homepage|banner|hero/i.test(title)) {
    const heading = get('Hero headline') || get('Headline') || 'A little texture. A lot of home.';
    const eyebrow = get('Hero eyebrow') || get('Small text above headline') || 'ROOTED IN CRAFT. MADE FOR HOME.';
    const description = get('Hero description') || get('Description') || 'Beautiful rugs. Honest materials. A softer place to land.';
    const image = get('Hero image URL') || group.querySelector('.banner-slide-card .image-upload-field img')?.src || '';
    const extra = /imagery/i.test(title) ? `<div class="store-preview-title"><small>ROOMS & INSPIRATION</small><h3>${safe(get('Rooms section heading') || 'Find a rug for every room')}</h3><p>${safe(get('Rooms section description') || 'A little inspiration for the spaces you love.')}</p></div><div class="store-preview-cards">${['Living room image','Bedroom image','Dining room image'].map((key,index)=>`<div class="store-preview-card">${imageTag(get(key),['Living room','Bedroom','Dining room'][index])}<b>${['Living room','Bedroom','Dining room'][index]}</b></div>`).join('')}</div><div class="store-preview-content"><small>${safe(get('Collection section eyebrow') || 'CONSIDERED · CURATED · COVETED')}</small><h3>${safe(get('Collection section heading') || 'Good things, underfoot.')}</h3><p>Products from your active catalogue appear in this section.</p></div><div class="store-preview-story">${imageTag(get('Craft story image'),'Craft story image')}<div><small>OUR STORY</small><h3>${safe(get('Story section heading') || 'More than a rug. A story woven in.')}</h3><p>${safe(get('Story section copy') || 'Share the story behind your craft.')}</p></div></div>` : `<div class="store-preview-caption">ROOMS & COLLECTION PREVIEW</div><div class="store-preview-lines"><i></i><i></i><i></i></div>`;
    body = `<div class="store-preview-hero">${imageTag(image, 'Homepage banner', 'hero-image')}<div class="store-preview-hero-copy"><small>${safe(eyebrow)}</small><h3>${safe(heading)}</h3><p>${safe(description)}</p><button>${safe(get('Button text') || 'Explore collection')} ↗</button></div></div>${extra}`;
  } else if (/room|imagery/i.test(title)) {
    const images = ['Living room image', 'Bedroom image', 'Dining room image'].map(name => get(name));
    const names = ['Living room title', 'Bedroom title', 'Dining room title'].map((name, index) => get(name) || ['Living room', 'Bedroom', 'Dining room'][index]);
    body = `<div class="store-preview-title"><small>${safe(get('Eyebrow') || 'ROOMS & INSPIRATION')}</small><h3>${safe(get('Rooms section heading') || get('Headline') || 'Find a rug for every room')}</h3><p>${safe(get('Rooms section description') || get('Description') || 'A little inspiration for the spaces you love.')}</p></div><div class="store-preview-cards">${names.map((name, index) => `<div class="store-preview-card">${imageTag(images[index], name)}<b>${safe(name)}</b></div>`).join('')}</div>`;
  } else if (/contact|footer/i.test(title)) {
    const brand = get('Company name') || get('Copyright name') || 'Your brand';
    body = `<div class="store-preview-footer"><div><strong>${safe(brand)}</strong><p>${safe(get('Footer tagline') || get('Tagline') || 'Your thoughtful brand message appears here.')}</p><p>${safe(get('Footer second line') || get('Second line') || 'A second line of footer copy.')}</p><small>${safe(get('Support email') || 'hello@yourstore.com')} · ${safe(get('Phone') || '+91 00000 00000')}</small></div><div><b>Explore</b><i></i><i></i><i></i></div><div><b>Customer care</b><i></i><i></i><i></i></div></div>`;
  } else if (/benefit/i.test(title)) {
    body = `<div class="store-preview-benefits">${[1,2,3,4].map((n) => `<div><span>✳</span><b>${safe(get(`Item ${n} title`) || ['Made by hand', 'Natural materials', 'Thoughtful delivery', 'Timeless by design'][n-1])}</b><small>${safe(get(`Item ${n} caption`) || 'Your supporting detail')}</small></div>`).join('')}</div>`;
  } else if (/ribbon/i.test(title)) {
    const phrases = [1,2,3,4].map(index => get(`Phrase ${index}`) || ['MADE BY HAND','NATURAL MATERIALS','AARA CRAFT','MADE TO LAST'][index-1]);
    body = `<div class="store-preview-ribbon">${phrases.map(phrase => `<span>${safe(phrase)} <i>✳</i></span>`).join('')}</div>`;
  } else if (/size/i.test(title)) {
    const sizes = [1,2,3,4].map(index => ({name:get(`Size ${index} name`) || ['Small','Medium','Large','Runner'][index-1],dims:get(`Size ${index} dimensions`) || ['3 × 5 ft','5 × 8 ft','8 × 10 ft','2.5 × 8 ft'][index-1],caption:get(`Size ${index} caption`) || 'For everyday spaces'}));
    body = `<div class="store-preview-title"><small>${safe(get('Eyebrow') || 'A LITTLE GUIDANCE GOES A LONG WAY')}</small><h3>${safe(get('Headline') || 'Find the right fit')}</h3><p>${safe(get('Description') || 'A size guide for every room.')}</p></div><div class="store-preview-size-grid">${sizes.map(item=>`<div><span></span><b>${safe(item.name)}</b><small>${safe(item.dims)}</small><small>${safe(item.caption)}</small></div>`).join('')}</div>`;
  } else if (/newsletter/i.test(title)) {
    body = `<div class="store-preview-newsletter"><small>${safe(get('Eyebrow') || 'LET\'S STAY IN THE LOOP')}</small><h3>${safe(get('Headline') || 'A little inspiration for your inbox.')}</h3><p>${safe(get('Description') || 'New collections, stories from the loom, and a few good things.')}</p><div><span>${safe(get('Email placeholder') || 'Your email address')}</span><button>Subscribe ↗</button></div></div>`;
  } else if (/signature|material/i.test(title)) {
    const cards = [...group.querySelectorAll('.signature-product-editor-card')].map((card,index)=>({image:card.querySelector('.image-upload-field img')?.src || '', title:card.querySelector('input:not([type=file]), select')?.value || `${/material/i.test(title)?'Material':'Featured rug'} ${index+1}`}));
    const fallback = /material/i.test(title) ? ['Quiet neutrals','Earth & clay','Into the green'] : ['A considered favourite','Handwoven wool','Made by hand'];
    body = `<div class="store-preview-title"><small>${safe(get('Eyebrow') || title.toUpperCase())}</small><h3>${safe(get('Headline') || 'Thoughtfully chosen for your home')}</h3><p>${safe(get('Description') || 'A closer look at the details and materials.')}</p></div><div class="store-preview-cards">${[0,1,2].map(index=>`<div class="store-preview-card">${imageTag(cards[index]?.image || '',cards[index]?.title || fallback[index])}<b>${safe(cards[index]?.title || fallback[index])}</b></div>`).join('')}</div>`;
  } else if (/collection/i.test(title)) {
    body = `<div class="store-preview-content"><small>${safe(get('Eyebrow') || 'CONSIDERED · CURATED · COVETED')}</small><h3>${safe(get('Headline') || 'Good things, underfoot.')}</h3><p>Products from your active catalogue appear in this section.</p><button>${safe(get('Browse button label') || 'Explore the collection')} ↗</button></div>`;
  } else if (/story/i.test(title)) {
    const image = group.querySelector('.image-upload-field img')?.src || '';
    body = `<div class="store-preview-story">${imageTag(image,'Craft story image')}<div><small>${safe(get('Eyebrow') || 'HUMAN HANDS. BEAUTIFUL THINGS.')}</small><h3>${safe(get('Headline') || 'More than a rug. A story woven in.')}</h3><p>${safe(get('First paragraph') || get('Description') || 'Share the story behind your craft.')}</p></div></div>`;
  } else if (/craft/i.test(title)) {
    body = `<div class="store-preview-content"><small>${safe(get('Eyebrow') || 'MADE WITH INTENTION')}</small><h3>${safe(get('Headline') || 'Less rush. More meaning.')}</h3><p>${safe(get('Description') || 'Natural fibres. Skilled hands. Considered design.')}</p><div class="store-preview-points">${[1,2,3].map(index=>`<span>✳ ${safe(get(`Promise ${index}`) || ['Earth-conscious materials','Artisanal craftsmanship','Made to be lived on'][index-1])}</span>`).join('')}</div></div>`;
  } else {
    const values = [...group.querySelectorAll('input:not([type=file]), textarea, select')].map(el => textOf(el)).filter(Boolean);
    body = `<div class="store-preview-content"><small>${safe(title.toUpperCase())}</small><h3>${safe(values[0] || 'Your section preview')}</h3><p>${safe(values[1] || 'Your content will appear here as you fill in the fields above.')}</p></div>`;
  }
  return `<div class="store-section-preview ${hasData ? 'has-content' : 'demo-only'}"><div class="store-section-preview-head"><span>STOREFRONT PREVIEW · ${safe(title.toUpperCase())}</span><b>${hasData ? 'LIVE PREVIEW' : 'DEMO PREVIEW'}</b></div>${body}<small class="store-section-preview-foot">${hasData ? 'Preview updates as you edit · save settings to publish.' : 'Example layout · add your content above to preview your own version.'}</small></div>`;
}
function updatePreviews() {
  document.querySelectorAll('.settings-group, .component-card').forEach(group => {
    const title = titleOf(group);
    if (!title) return;
    let preview = group.querySelector(':scope > .store-section-preview');
    if (!preview) {
      preview = document.createElement('div');
      preview.className = 'store-section-preview';
      const saveButton = group.querySelector(':scope > .component-save-section');
      group.insertBefore(preview, saveButton || null);
    }
    preview.outerHTML = previewMarkup(group, title);
  });
}
let scheduled = false;
function scheduleUpdate() {
  if (scheduled) return;
  scheduled = true;
  window.setTimeout(() => { scheduled = false; updatePreviews(); }, 80);
}
document.addEventListener('input', scheduleUpdate, true);
document.addEventListener('change', scheduleUpdate, true);
new MutationObserver(records => { const relevant = records.some(record => { const target = record.target.nodeType === Node.ELEMENT_NODE ? record.target : record.target.parentElement; if (target?.closest('.store-section-preview')) return false; const changedNodes = [...record.addedNodes, ...record.removedNodes].filter(node => node.nodeType === Node.ELEMENT_NODE); return !changedNodes.length || changedNodes.some(node => !node.matches('.store-section-preview')); }); if (relevant) scheduleUpdate(); }).observe(document.getElementById('root'), { childList: true, subtree: true });
window.addEventListener('load', scheduleUpdate);
scheduleUpdate();