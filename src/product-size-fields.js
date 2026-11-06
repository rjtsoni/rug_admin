const API = import.meta.env?.VITE_API_URL || 'http://localhost:4000';
const nativeFetch = window.fetch.bind(window);

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) key === 'text' ? node.textContent = value : node.setAttribute(key, value);
  children.forEach(child => node.append(child));
  return node;
}

async function compressImage(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw Error('Choose a JPG, PNG or WebP photo.');
  if (file.size > 12 * 1024 * 1024) throw Error('Choose a photo smaller than 12 MB.');
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d'); context.fillStyle = '#f6f4ee'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
  let quality = .82, blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', quality));
  while (blob && blob.size > 300 * 1024 && quality > .45) { quality -= .08; blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', quality)); }
  if (!blob || blob.size > 300 * 1024) throw Error('This photo is too large after optimisation. Choose a smaller image.');
  return await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(blob); });
}

function mountProductSizes(form) {
  if (form.querySelector('h2')?.textContent.trim() !== 'Product details') return;
  form.querySelectorAll('.editor-grid .field').forEach(field => {
    const label = field.textContent.trim();
    if (label.startsWith('Main product image') || label.startsWith('Additional product images') || label.startsWith('Regular price (₹)') || label.startsWith('Discount (%)')) field.style.display = 'none';
  });
  form.querySelectorAll('.editor-image').forEach(image => { image.style.display = 'none'; });
  if (form.querySelector('[data-product-size-section]')) return;
  const sizes = form.__aaraSizeDraft || [];
  form.__aaraSizeDraft = sizes;
  let changed = Boolean(form.__aaraSizesChanged), sizesLoaded = Boolean(form.__aaraSizesLoaded);
  const details = form.__aaraDetailsDraft || { ...(form.__aaraDetailsDraft = {}) };
  form.__aaraDetailsDraft = details;
  const section = el('section');
  section.dataset.productSizeSection = 'true';
  section.style.cssText = 'border:1px solid #dedbd1;background:#fffdf8;padding:18px;margin:18px 0';
  const heading = el('h3', { text: 'Sizes, prices & photos' }); heading.style.cssText = 'margin:0 0 5px;font-size:18px;color:#354335';
  const intro = el('p', { text: 'Add each rug size with its own regular price, discount and 1–4 photos. The selected size and its photos will appear on the product page.' }); intro.style.cssText = 'margin:0 0 14px;font-size:13px;color:#71806b';
  const list = el('div'); const status = el('small'); status.style.cssText = 'display:block;color:#9b5144;margin:8px 0';
  const addButton = el('button', { type: 'button', text: '+ Add size option' }); addButton.className = 'secondary';
  addButton.style.cssText = 'padding:10px 14px;border:1px solid #c8cdbb;background:transparent;color:#354335;cursor:pointer';
  const detailsSection = el('div'); detailsSection.style.cssText = 'border-top:1px solid #dedbd1;margin-top:20px;padding-top:16px';
  const detailsTitle = el('h4', { text: 'Product details shown on the storefront' }); detailsTitle.style.cssText = 'margin:0 0 5px;color:#354335;font-size:16px';
  const detailsIntro = el('p', { text: 'Fill in the specifications and care information you want shoppers to see.' }); detailsIntro.style.cssText = 'margin:0 0 12px;font-size:12px;color:#71806b';
  const detailFields = el('div'); detailFields.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:10px';
  const detailConfig = [['sku','SKU','text'],['material','Material','text'],['texture','Texture','text'],['pileThickness','Pile thickness','text'],['origin','Origin','text'],['highlights','Highlights','textarea'],['care','Care instructions','textarea'],['delivery','Delivery note','textarea'],['returns','Returns & replacement','textarea'],['craftEyebrow','Craft story eyebrow','text'],['craftTitle','Craft story heading','text'],['craftDescription','Craft story paragraph 1','textarea'],['craftSecondParagraph','Craft story paragraph 2','textarea'],['craftPoint1Title','Craft quality 1 title','text'],['craftPoint1Caption','Craft quality 1 caption','text'],['craftPoint2Title','Craft quality 2 title','text'],['craftPoint2Caption','Craft quality 2 caption','text'],['craftPoint3Title','Craft quality 3 title','text'],['craftPoint3Caption','Craft quality 3 caption','text'],['craftStep1Title','Craft step 1 title','text'],['craftStep1Body','Craft step 1 description','textarea'],['craftStep2Title','Craft step 2 title','text'],['craftStep2Body','Craft step 2 description','textarea'],['craftStep3Title','Craft step 3 title','text'],['craftStep3Body','Craft step 3 description','textarea'],['craftExpectTitle','Craft notes heading','text'],['craftExpect1','Craft note 1','textarea'],['craftExpect2','Craft note 2','textarea'],['craftExpect3','Craft note 3','textarea']];
  for (const [key,label,type] of detailConfig) {
    if (key === 'craftEyebrow') { const group = el('div'); group.style.cssText = 'grid-column:1/-1;border-top:1px solid #dedbd1;padding-top:14px;margin-top:6px'; const title = el('b', { text: 'Craft story section' }); const note = el('small', { text: 'This block appears below the product details on the storefront.' }); note.style.cssText = 'display:block;margin-top:4px;color:#71806b'; group.append(title,note); detailFields.append(group); }
    const wrap = el('label'); wrap.style.cssText = 'display:grid;gap:5px;font-size:12px;color:#354335'; wrap.append(document.createTextNode(label));
    const control = el(type === 'textarea' ? 'textarea' : 'input', type === 'textarea' ? {} : { type: 'text' }); control.value = details[key] || ''; control.style.cssText = 'width:100%;box-sizing:border-box;padding:9px;border:1px solid #dedbd1;background:#fff'; if (type === 'textarea') control.rows = 3;
    control.addEventListener('input', () => { details[key] = control.value; form.__aaraDetailsChanged = true; }); wrap.append(control); detailFields.append(wrap);
  }
  const craftImageField = el('label'); craftImageField.style.cssText = 'display:grid;gap:6px;font-size:12px;color:#354335;margin-top:10px'; craftImageField.append(document.createTextNode('Craft story image'));
  const craftImageInput = el('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp' });
  const craftImagePreview = el('img'); craftImagePreview.alt = 'Craft story image preview'; craftImagePreview.style.cssText = 'display:none;width:180px;height:110px;object-fit:cover;background:#efeee6';
  craftImageInput.onchange = async () => { if (!craftImageInput.files?.[0]) return; status.textContent = 'Optimising craft image…'; try { details.craftImage = await compressImage(craftImageInput.files[0]); craftImagePreview.src = details.craftImage; craftImagePreview.style.display = 'block'; form.__aaraDetailsChanged = true; status.textContent = ''; } catch (error) { status.textContent = error.message; } };
  if (details.craftImage) { craftImagePreview.src = details.craftImage; craftImagePreview.style.display = 'block'; }
  const removeCraftImage = el('button', { type: 'button', text: 'Remove craft image' }); removeCraftImage.style.cssText = 'justify-self:start;padding:7px 10px;border:1px solid #c8cdbb;background:transparent;cursor:pointer'; removeCraftImage.onclick = () => { details.craftImage = ''; craftImagePreview.removeAttribute('src'); craftImagePreview.style.display = 'none'; form.__aaraDetailsChanged = true; };
  craftImageField.append(craftImageInput, craftImagePreview, removeCraftImage);
  const deliveryWrap = el('label'); deliveryWrap.style.cssText = 'display:flex;align-items:center;gap:9px;font-size:13px;color:#354335';
  const freeDelivery = el('input', { type: 'checkbox' }); freeDelivery.checked = details.freeDelivery ?? true;
  deliveryWrap.append(freeDelivery, document.createTextNode('Free delivery'));
  const chargeWrap = el('label'); chargeWrap.style.cssText = 'display:grid;gap:5px;font-size:12px;color:#354335'; chargeWrap.append(document.createTextNode('Delivery charge (₹)'));
  const deliveryCharge = el('input', { type: 'number', min: '0', step: '1' }); deliveryCharge.value = details.deliveryCharge ?? 0; deliveryCharge.style.cssText = 'width:100%;box-sizing:border-box;padding:9px;border:1px solid #dedbd1;background:#fff';
  chargeWrap.append(deliveryCharge);
  const syncDelivery = () => { details.freeDelivery = freeDelivery.checked; details.deliveryCharge = freeDelivery.checked ? 0 : Math.max(0, Number(deliveryCharge.value) || 0); deliveryCharge.disabled = freeDelivery.checked; form.__aaraDetailsChanged = true; };
  freeDelivery.addEventListener('change', syncDelivery); deliveryCharge.addEventListener('input', syncDelivery); deliveryCharge.disabled = freeDelivery.checked;
  detailFields.append(deliveryWrap, chargeWrap);
  detailsSection.append(detailsTitle, detailsIntro, detailFields, craftImageField);
  section.append(heading, intro, list, addButton, detailsSection, status);
  const footer = form.querySelector('footer'); if (footer) form.insertBefore(section, footer); else form.append(section);
  form.dataset.productSizesMounted = 'true';

  const render = () => {
    list.replaceChildren();
    sizes.forEach((item, index) => {
      const card = el('div'); card.style.cssText = 'border-top:1px solid #dedbd1;padding:16px 0;margin-top:12px';
      const row = el('div'); row.style.cssText = 'display:grid;grid-template-columns:2fr 1fr 1fr;gap:12px';
      const makeField = (label, type, value, onInput) => {
        const wrap = el('label'); wrap.style.cssText = 'display:grid;gap:6px;font-size:12px;color:#354335'; wrap.append(document.createTextNode(label));
        const input = el('input', { type }); input.value = value ?? ''; input.style.cssText = 'width:100%;box-sizing:border-box;padding:10px;border:1px solid #dedbd1;background:#fff'; input.addEventListener('input', onInput); wrap.append(input); return wrap;
      };
      row.append(makeField('Size label (for example 8 × 10 ft)', 'text', item.label, event => { item.label = event.target.value; changed = form.__aaraSizesChanged = true; }));
      row.append(makeField('Regular price (₹)', 'number', item.price, event => { item.price = Number(event.target.value); changed = form.__aaraSizesChanged = true; renderPrice.textContent = getPriceText(item); }));
      row.append(makeField('Discount (%)', 'number', item.discountPercentage, event => { item.discountPercentage = Math.min(100, Math.max(0, Math.round(Number(event.target.value) || 0))); changed = form.__aaraSizesChanged = true; renderPrice.textContent = getPriceText(item); }));
      const renderPrice = el('small', { text: getPriceText(item) }); renderPrice.style.cssText = 'display:block;color:#71806b;margin:10px 0';
      const photos = el('div'); photos.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;margin:10px 0';
      const refreshPhotos = () => {
        photos.replaceChildren();
        item.images.forEach((src, imageIndex) => {
          const wrap = el('div'); wrap.style.cssText = 'display:grid;gap:4px';
          const img = el('img', { src, alt: `Size ${item.label} photo ${imageIndex + 1}` }); img.style.cssText = 'width:96px;height:72px;object-fit:cover;background:#efeee6';
          const remove = el('button', { type: 'button', text: 'Remove photo' }); remove.className = 'secondary'; remove.style.cssText = 'padding:6px;border:1px solid #c8cdbb;background:transparent;cursor:pointer'; remove.onclick = () => { item.images.splice(imageIndex, 1); changed = form.__aaraSizesChanged = true; refreshPhotos(); };
          wrap.append(img, remove); photos.append(wrap);
        });
        photoCount.textContent = `Photos ${item.images.length}/4 · At least one photo is required`;
        upload.disabled = item.images.length >= 4;
      };
      const photoCount = el('small'); photoCount.style.color = '#71806b';
      const upload = el('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp' });
      upload.onchange = async () => { if (!upload.files?.[0]) return; upload.disabled = true; status.textContent = 'Optimising photo…'; try { item.images.push(await compressImage(upload.files[0])); changed = form.__aaraSizesChanged = true; refreshPhotos(); status.textContent = ''; } catch (error) { status.textContent = error.message; upload.disabled = false; } };
      refreshPhotos();
      const removeSize = el('button', { type: 'button', text: 'Remove size' }); removeSize.className = 'secondary'; removeSize.style.cssText = 'padding:8px 12px;border:1px solid #c8cdbb;background:transparent;cursor:pointer;margin-top:10px'; removeSize.onclick = () => { sizes.splice(index, 1); changed = form.__aaraSizesChanged = true; render(); };
      card.append(row, renderPrice, photoCount, photos, upload, removeSize); list.append(card);
    });
  };
  addButton.onclick = () => { sizes.push({ label: '', price: Number(form.querySelector('input[type="number"]')?.value) || 0, discountPercentage: 0, images: [] }); changed = form.__aaraSizesChanged = true; render(); };
  render();
  const record = [...form.querySelectorAll('small')].find(node => node.textContent.includes('Record ID:'));
  const productId = record?.textContent.split('Record ID:')[1]?.trim();
  if (productId) {
    status.textContent = 'Loading saved size options…';
    nativeFetch(`${API}/api/admin/products`, { credentials: 'include' }).then(response => response.ok ? response.json() : Promise.reject()).then(products => {
      const existingProduct = products.find(item => item._id === productId);
      const saved = existingProduct?.sizes || [];
      if (!form.__aaraDetailsChanged) Object.assign(details, existingProduct?.details || {});
      if (!changed) sizes.splice(0, sizes.length, ...saved.map(item => ({ ...item, images: [...(item.images || [])] })));
      else sizes.unshift(...saved.filter(item => !sizes.some(current => current.label === item.label)).map(item => ({ ...item, images: [...(item.images || [])] })));
      sizesLoaded = form.__aaraSizesLoaded = true; status.textContent = ''; render();
      detailsSection.querySelectorAll('input,textarea').forEach(control => { const key = detailConfig.find(([,label]) => control.parentElement.textContent.trim() === label)?.[0]; if (key) control.value = details[key] || ''; });
      if (details.craftImage) { craftImagePreview.src = details.craftImage; craftImagePreview.style.display = 'block'; }
      freeDelivery.checked = details.freeDelivery ?? true; deliveryCharge.value = details.deliveryCharge ?? 0; deliveryCharge.disabled = freeDelivery.checked;
    }).catch(() => { sizesLoaded = form.__aaraSizesLoaded = true; status.textContent = 'Could not load saved sizes. Check the API connection and reopen this product.'; });
  } else sizesLoaded = form.__aaraSizesLoaded = true;
}

function getPriceText(item) {
  const regular = Number(item.price) || 0, discount = Number(item.discountPercentage) || 0, sale = Math.round(regular * (1 - discount / 100));
  return discount ? `Sale price: ₹${sale.toLocaleString('en-IN')} · Save ₹${(regular - sale).toLocaleString('en-IN')}` : `Price: ₹${regular.toLocaleString('en-IN')}`;
}

window.fetch = async (input, init = {}) => {
  const url = typeof input === 'string' ? input : input?.url || '';
  const method = String(init.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
  const form = document.querySelector('form.editor[data-product-sizes-mounted="true"]');
  if (form && (method === 'POST' || method === 'PUT') && /\/api\/admin\/products(?:\/[^/?]+)?(?:\?|$)/.test(url) && init.body) {
    if (!form.__aaraSizesLoaded) return new Response(JSON.stringify({ error: 'Saved size options are still loading. Please wait a moment, then save again.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    try {
      const payload = JSON.parse(init.body), sizes = form.__aaraSizeDraft || [];
      if (!sizes.length) return new Response(JSON.stringify({ error: 'Add at least one size option and upload its product photos before saving.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      const invalid = sizes.find(item => !item.label?.trim() || !Number.isFinite(Number(item.price)) || Number(item.price) < 0 || item.images.length < 1 || item.images.length > 4);
      if (invalid) return new Response(JSON.stringify({ error: `Complete size “${invalid.label || 'unnamed'}”: enter its name and price, then upload 1–4 photos.` }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      payload.sizes = sizes.map(item => ({ ...item, price: Number(item.price) || 0, discountPercentage: Math.min(100, Math.max(0, Math.round(Number(item.discountPercentage) || 0))), images: item.images.filter(Boolean) }));
      payload.details = { ...(payload.details || {}), ...(form.__aaraDetailsDraft || {}) };
      const featured = [...sizes].sort((a, b) => (Number(b.price) * (1 - Number(b.discountPercentage || 0) / 100)) - (Number(a.price) * (1 - Number(a.discountPercentage || 0) / 100)))[0];
      if (featured?.images?.length) {
        payload.price = Number(featured.price) || 0;
        payload.discountPercentage = Math.min(100, Math.max(0, Math.round(Number(featured.discountPercentage) || 0)));
        payload.image = featured.images[0];
        payload.images = featured.images.slice(1);
      }
      init = { ...init, body: JSON.stringify(payload) };
    } catch { /* Let the original request handle invalid JSON. */ }
  }
  return nativeFetch(input, init);
};

const observer = new MutationObserver(() => document.querySelectorAll('form.editor').forEach(mountProductSizes));
observer.observe(document.body, { childList: true, subtree: true });
document.querySelectorAll('form.editor').forEach(mountProductSizes);
