const API = import.meta.env.DEV ? (import.meta.env.VITE_API_URL || 'http://localhost:4000') : '';
const h = (tag, attrs = {}, children = []) => { const el = document.createElement(tag); for (const [key, value] of Object.entries(attrs)) key === 'text' ? el.textContent = value : key === 'style' ? Object.assign(el.style, value) : el.setAttribute(key, value); for (const child of children) el.append(child); return el; };
const button = (text, fn, secondary = false) => { const b = h('button', { type: 'button', text }); b.style.cssText = `padding:10px 14px;border:1px solid #c8cdbb;background:${secondary ? 'transparent' : '#354335'};color:${secondary ? '#354335' : '#fff'};cursor:pointer;margin:4px 4px 4px 0`; b.onclick = fn; return b; };
const field = (label, type = 'text', value = '') => { const wrap = h('label', { text: label }); wrap.style.cssText = 'display:grid;gap:6px;font-size:13px;margin:8px 0'; const input = h('input', { type }); input.value = value ?? ''; input.style.cssText = 'padding:10px;border:1px solid #dedbd1;width:100%;box-sizing:border-box'; wrap.append(input); return { wrap, input }; };
async function compress(file) {
  const bitmap = await createImageBitmap(file); const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d'); context.fillStyle = '#f6f4ee'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
  let quality = .82, blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', quality));
  while (blob && blob.size > 300 * 1024 && quality > .45) { quality -= .08; blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', quality)); }
  if (!blob || blob.size > 300 * 1024) throw Error('This image is too large after optimisation. Choose a smaller image.');
  return await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(blob); });
}
function mountEditor(form) {
  if (form.dataset.sizeManagerMounted || !form.innerText.includes('Product details')) return;
  const record = [...form.querySelectorAll('small')].find(el => el.textContent.includes('Record ID:'));
  const id = record?.textContent.split('Record ID:')[1]?.trim();
  if (!id) return;
  form.dataset.sizeManagerMounted = 'true';
  const slot = h('section'); slot.style.cssText = 'padding:12px 0;border-bottom:1px solid #dedbd1;margin-bottom:12px';
  const info = h('small', { text: 'Save product details first. Then manage per-size prices, discounts and 1–4 photos here; the page refreshes after saving.' }); info.style.cssText = 'display:block;color:#71806b;margin:4px 0 10px';
  slot.append(h('b', { text: 'Size options & pricing' }), info);
  slot.append(button('Manage sizes & photos', () => openManager(id, slot)));
  const header = form.querySelector('header'); header?.after(slot);
}
async function openManager(id, slot) {
  slot.querySelector('[data-error]')?.remove();
  const error = message => { let el = slot.querySelector('[data-error]'); if (!el) { el = h('small', { 'data-error': '' }); el.style.cssText = 'display:block;color:#9b5144;margin-top:8px'; slot.append(el); } el.textContent = message; };
  try {
    const response = await fetch(`${API}/api/admin/products`, { credentials: 'include' }); if (!response.ok) throw Error('Sign in again to manage this product’s sizes.');
    const products = await response.json(), product = products.find(item => item._id === id); if (!product) throw Error('Product could not be found.');
    const backdrop = h('div'); backdrop.style.cssText = 'position:fixed;inset:0;z-index:10000;background:#17211799;display:grid;place-items:center;padding:20px';
    const panel = h('div'); panel.style.cssText = 'background:#faf8f1;color:#243324;width:min(780px,100%);max-height:90vh;overflow:auto;padding:24px;box-shadow:0 20px 80px #0004';
    const title = h('h2', { text: `Sizes for ${product.name}` }); title.style.margin = '0 0 6px'; panel.append(title, h('p', { text: 'Each option controls its own gallery and sale price on the product page.' }));
    const list = h('div'); panel.append(list); const sizes = Array.isArray(product.sizes) ? product.sizes.map(item => ({ ...item, images: [...(item.images || [])] })) : [];
    const render = () => {
      list.replaceChildren();
      sizes.forEach((item, index) => {
        const card = h('section'); card.style.cssText = 'padding:16px;margin:14px 0;border:1px solid #dedbd1;background:#fffdf8';
        const row = h('div'); row.style.cssText = 'display:grid;grid-template-columns:2fr 1fr 1fr;gap:12px';
        const name = field('Size (e.g. 8 × 10 ft)', 'text', item.label); name.input.oninput = () => item.label = name.input.value;
        const price = field('Regular price (₹)', 'number', item.price); price.input.min = '0'; price.input.oninput = () => item.price = Number(price.input.value);
        const discount = field('Discount (%)', 'number', item.discountPercentage || 0); discount.input.min = '0'; discount.input.max = '100'; discount.input.oninput = () => item.discountPercentage = Math.min(100, Math.max(0, Number(discount.input.value) || 0));
        row.append(name.wrap, price.wrap, discount.wrap); card.append(row);
        const calculated = h('small', { text: `Sale price: ₹${Math.round((Number(item.price) || 0) * (1 - (Number(item.discountPercentage) || 0) / 100)).toLocaleString('en-IN')} · Save ₹${Math.round((Number(item.price) || 0) * (Number(item.discountPercentage) || 0) / 100).toLocaleString('en-IN')}` }); calculated.style.color = '#63725c'; card.append(calculated);
        const images = h('div'); images.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin:12px 0';
        item.images.forEach((url, imageIndex) => { const thumb = h('div'); thumb.style.cssText = 'display:grid;gap:4px'; const img = h('img', { src: url, alt: `Size ${item.label} photo ${imageIndex + 1}` }); img.style.cssText = 'width:90px;height:70px;object-fit:cover'; thumb.append(img, button('Remove photo', () => { item.images.splice(imageIndex, 1); render(); }, true)); images.append(thumb); });
        const upload = h('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp' }); upload.disabled = item.images.length >= 4; upload.onchange = async () => { try { if (upload.files?.[0]) item.images.push(await compress(upload.files[0])); render(); } catch (cause) { alert(cause.message); } }; card.append(h('small', { text: `Photos ${item.images.length}/4 · Add at least one photo` }), images, upload, button('Remove size', () => { sizes.splice(index, 1); render(); }, true)); list.append(card);
      });
      panel.querySelector('[data-count]').textContent = `${sizes.length} size option${sizes.length === 1 ? '' : 's'}`;
    };
    const count = h('small', { 'data-count': '' }); panel.append(count); render();
    const actions = h('footer'); actions.style.cssText = 'position:sticky;bottom:-24px;background:#faf8f1;padding:16px 0;display:flex;justify-content:space-between;gap:8px';
    actions.append(button('+ Add size', () => { sizes.push({ label: '', price: Number(product.price) || 0, discountPercentage: 0, images: [] }); render(); }, true));
    const right = h('div'); const close = button('Cancel', () => backdrop.remove(), true); const save = button('Save size options', async () => {
      const invalid = sizes.find(item => !item.label?.trim() || !Number.isFinite(Number(item.price)) || Number(item.price) < 0 || !item.images.some(Boolean));
      if (invalid) { alert(`Add a size name, valid price and at least one photo for “${invalid.label || 'unnamed size'}”.`); return; }
      save.disabled = true; save.textContent = 'Saving…';
      try { const payload = { ...product, sizes }; delete payload._id; delete payload.__v; delete payload.createdAt; delete payload.updatedAt; const result = await fetch(`${API}/api/admin/products/${id}`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); if (!result.ok) { const body = await result.json().catch(() => ({})); throw Error(body.error || 'Could not save size options.'); } backdrop.remove(); window.location.reload(); }
      catch (cause) { alert(cause.message); save.disabled = false; save.textContent = 'Save size options'; }
    }); right.append(close, save); actions.append(right); panel.append(actions); backdrop.append(panel); backdrop.addEventListener('click', event => { if (event.target === backdrop) backdrop.remove(); }); document.body.append(backdrop);
  } catch (cause) { error(cause.message); }
}
const observer = new MutationObserver(() => document.querySelectorAll('form.editor').forEach(mountEditor));
observer.observe(document.body, { childList: true, subtree: true });
document.querySelectorAll('form.editor').forEach(mountEditor);
