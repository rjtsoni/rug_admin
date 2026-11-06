import React from 'react';
import { Box, Check, CircleHelp, Image, Package, Settings, Shapes } from 'lucide-react';
import ImageUploadField from './ImageUploadField';
import './components-editor.css';

const sections = [
  { title: 'Header & brand', target: 'brand', icon: Settings, note: 'Company name and logo.', fields: [['companyName', 'Company name'], ['logoText', 'Logo wordmark'], ['logoImage', 'Logo image', 'image'], ['navCaption', 'Navigation caption'], ['footerCaption', 'Footer logo caption']] },
  { title: 'Homepage banner', target: 'homepage', icon: Image, note: 'Set a unique image and message for each slide.', fields: [] },
  { title: 'Benefits', target: 'homepage', icon: Check, note: 'The four reassurance items beneath the hero.', fields: [1, 2, 3, 4].flatMap(i => [[`benefit${i}Title`, `Item ${i} title`], [`benefit${i}Body`, `Item ${i} caption`]]) },
  { title: 'Design ribbon', target: 'homepage', icon: Shapes, note: 'Scrolling brand line between sections.', fields: [['ribbon1', 'Phrase 1'], ['ribbon2', 'Phrase 2'], ['ribbon3', 'Phrase 3'], ['ribbon4', 'Phrase 4']] },
  { title: 'Room finder', target: 'homepage', icon: Image, note: 'Section title and the three room image cards.', fields: [['roomsEyebrow', 'Eyebrow'], ['roomsTitle', 'Headline'], ['roomsDescription', 'Description'], ['roomsSecondLine', 'Second line'], ['room1Title', 'Living room title'], ['livingImage', 'Living room image', 'image'], ['room2Title', 'Bedroom title'], ['bedroomImage', 'Bedroom image', 'image'], ['room3Title', 'Dining room title'], ['diningImage', 'Dining room image', 'image']] },
  { title: 'Product collection', target: 'homepage', icon: Package, note: 'Collection heading, browse action and closing line.', fields: [['collectionEyebrow', 'Eyebrow'], ['collectionTitle', 'Headline'], ['collectionButton', 'Browse button label'], ['collectionFoot', 'Closing sentence'], ['collectionFootAccent', 'Closing emphasis']] },
  { title: 'Signature edit', target: 'homepage', icon: Package, note: 'Featured piece story and section labels.', fields: [['signatureEyebrow', 'Eyebrow'], ['signatureKicker', 'Top caption'], ['signatureTitle', 'Headline'], ['signatureBody', 'Description', 'area'], ['signatureButton', 'Button label'], ['signatureFocusLabel', 'Product label'], ['signatureCoordinate', 'Stage caption'], ...[1, 2, 3].map(i => [`signatureStep${i}`, `Bottom note ${i}`])] },
  { title: 'Material edit', target: 'homepage', icon: Shapes, note: 'Edit the three material cards, their images, copy and linked products.', fields: [['materialEyebrow', 'Eyebrow'], ['materialTitle', 'Headline'], ['materialDescription', 'Description', 'area'], ['materialButton', 'Button label']] },
  { title: 'Craft story', target: 'pages', icon: Image, note: 'Story title, paragraphs and link copy.', fields: [['storySubtitle', 'Eyebrow'], ['storyTitle', 'Headline'], ['storyBody', 'First paragraph', 'area'], ['storySecondParagraph', 'Second paragraph', 'area'], ['storyLink', 'Link label'], ['storySignature', 'Signature line']] },
  { title: 'Size guide', target: 'homepage', icon: Box, note: 'Section introduction and four size examples.', fields: [['sizeEyebrow', 'Eyebrow'], ['sizeTitle', 'Headline'], ['sizeDescription', 'Description', 'area'], ...[1, 2, 3, 4].flatMap(i => [[`size${i}Name`, `Size ${i} name`], [`size${i}Dims`, `Size ${i} dimensions`], [`size${i}Caption`, `Size ${i} caption`]])] },
  { title: 'Craft banner', target: 'homepage', icon: CircleHelp, note: 'Closing brand promise and the three value points.', fields: [['craftEyebrow', 'Eyebrow'], ['craftTitle', 'Headline'], ['craftDescription', 'Description', 'area'], ['craftPoint1', 'Promise 1'], ['craftPoint2', 'Promise 2'], ['craftPoint3', 'Promise 3']] },
  { title: 'Newsletter', target: 'homepage', icon: CircleHelp, note: 'Email signup copy and helper text.', fields: [['newsletterEyebrow', 'Eyebrow'], ['newsletterTitle', 'Headline'], ['newsletterDescription', 'Description', 'area'], ['newsletterPlaceholder', 'Email placeholder'], ['newsletterNote', 'Consent note']] },
  { title: 'Footer', target: 'footer', icon: Settings, note: 'Footer brand copy and copyright.', fields: [['tagline', 'Tagline'], ['secondLine', 'Second line'], ['origin', 'Origin line'], ['copyright', 'Copyright name']] }
];

export default function ComponentsEditor({ settings, setSettings, onSubmit, onSaveSection, products = [], busy }) {
  function update(target, key, value) {
    setSettings(current => ({ ...current, [target]: { ...current[target], [key]: value } }));
  }
  function renderField(target, [key, label, type]) {
    const value = settings[target]?.[key] || '';
    if (type === 'image') return <ImageUploadField key={key} label={label} value={value} maxBytes={240 * 1024} onChange={next => update(target, key, next)} onRemove={() => update(target, key, '')} />;
    return <label className="field" key={key}>{label}{type === 'area' ? <textarea rows="3" value={value} onChange={event => update(target, key, event.target.value)} /> : <input value={value} onChange={event => update(target, key, event.target.value)} />}</label>;
  }
  const homepage = settings.homepage || {};
  const legacyCopy = { title: homepage.heroTitle || '', subtitle: homepage.heroSubtitle || '', description: homepage.heroDescription || '', secondLine: homepage.heroSecondLine || '', button: homepage.heroButton || '', footnote: homepage.heroFootnote || '', label: homepage.heroLabel || '', labelTitle: homepage.heroLabelTitle || '' };
  const emptyBannerSlide = () => ({ image: '', title: '', subtitle: '', description: '', secondLine: '', button: '', footnote: '', label: '', labelTitle: '' });
  const bannerSlides = Array.isArray(homepage.heroSlides)
    ? homepage.heroSlides
    : (Array.isArray(homepage.heroImages) ? homepage.heroImages : [homepage.heroImage, homepage.heroSecondImage].filter(Boolean)).map(item => typeof item === 'string' ? { image: item, ...legacyCopy } : item);
  function updateBannerSlides(nextSlides) {
    const first = nextSlides.find(slide => slide.image) || {};
    setSettings(current => ({ ...current, homepage: {
      ...current.homepage,
      heroSlides: nextSlides,
      heroImages: nextSlides.map(slide => slide.image || '').filter(Boolean),
      heroImage: first.image || '',
      heroSecondImage: nextSlides.find(slide => slide.image && slide.image !== first.image)?.image || '',
      heroTitle: first.title || current.homepage.heroTitle || '',
      heroSubtitle: first.subtitle || current.homepage.heroSubtitle || '',
      heroDescription: first.description || current.homepage.heroDescription || '',
      heroSecondLine: first.secondLine || current.homepage.heroSecondLine || '',
      heroButton: first.button || current.homepage.heroButton || '',
      heroFootnote: first.footnote || current.homepage.heroFootnote || '',
      heroLabel: first.label || current.homepage.heroLabel || '',
      heroLabelTitle: first.labelTitle || current.homepage.heroLabelTitle || ''
    }}));
  }
  function updateBannerSlide(index, key, value) {
    const currentSlides = bannerSlides.length ? bannerSlides : [emptyBannerSlide()];
    updateBannerSlides(currentSlides.map((slide, slideIndex) => slideIndex === index ? { ...slide, [key]: value } : slide));
  }
  const materialDefaults = [
    { name: 'Quiet neutrals', title: 'A softer kind of statement.', text: 'Layer warm ivory, oatmeal and sand for a space that invites you to slow down.', design: 'sandstone', colour: '#d7c8ae', filter: 'Wool', note: 'WOOL · WARM SAND · SOFT TEXTURE' },
    { name: 'Earth & clay', title: 'Warmth, with a little character.', text: 'Sculptural lines and sunbaked tones bring an expressive, grounded energy home.', design: 'terra', colour: '#c18b70', filter: 'Wool', note: 'WOOL · TERRACOTTA · SCULPTED LINES' },
    { name: 'Into the green', title: 'Nature sets the tone.', text: 'Muted olive and an intricate weave make a thoughtful foundation for your favourite room.', design: 'olive', colour: '#92977b', filter: 'Hand-knotted', note: 'HAND-KNOTTED · OLIVE · TIMELESS PATTERN' }
  ];
  const materialItems = materialDefaults.map((defaults, index) => ({ ...defaults, ...(homepage.materials?.[index] || {}) }));
  function updateMaterialItem(index, patch) {
    const next = materialItems.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item);
    setSettings(current => ({ ...current, homepage: { ...current.homepage, materials: next } }));
  }
  const signatureItems = Array.from({ length: 3 }, (_, index) => homepage.signatureProducts?.[index] || { productId: '', images: [] });
  function updateSignatureItem(index, patch) {
    const next = signatureItems.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item);
    setSettings(current => ({ ...current, homepage: { ...current.homepage, signatureProducts: next } }));
  }
  function saveSectionPayload(target, title, fields) {
    const keys = title === 'Homepage banner'
      ? ['heroSlides', 'heroImages', 'heroImage', 'heroSecondImage', 'heroTitle', 'heroSubtitle', 'heroDescription', 'heroSecondLine', 'heroButton', 'heroFootnote', 'heroLabel', 'heroLabelTitle']
      : fields.map(([key]) => key);
    const source = settings[target] || {};
    const sectionData = Object.fromEntries(keys.filter(key => source[key] !== undefined).map(key => [key, source[key]]));
    if (title === 'Signature edit') sectionData.signatureProducts = source.signatureProducts || [];
    if (title === 'Material edit') sectionData.materials = source.materials || [];
    onSaveSection({ [target]: sectionData }, title);
  }
  return <form className="component-editor" onSubmit={onSubmit}>
    <div className="component-intro"><span className="overline">STOREFRONT COMPONENTS</span><h2>Edit your storefront.</h2><p>Open a section, make your changes and press its Save button.</p></div>
    {sections.map(({ title, target, icon: Icon, note, fields, optionalFields }, index) => <details className="component-card panel" key={title} open={index === 0}>
      <summary><span className="component-icon"><Icon size={18} /></span><span className="component-summary"><b>{title}</b><small>{note}</small></span><span className="component-count">{title === 'Homepage banner' ? `${bannerSlides.length || 1} slides` : `${fields.length} fields`}</span></summary>
      {title === 'Homepage banner' && <><p className="component-help">Each slide has its own image, headline, description and button copy. Add up to five slides.</p><div className="banner-slide-list">{(bannerSlides.length ? bannerSlides : [emptyBannerSlide()]).map((slide, slideIndex) => <section className="banner-slide-card" key={`banner-${slideIndex}`}><div className="banner-slide-heading"><b>Slide {slideIndex + 1}</b>{bannerSlides.length > 1 && <button type="button" className="secondary" onClick={() => updateBannerSlides(bannerSlides.filter((_, index) => index !== slideIndex))}>Remove slide</button>}</div><ImageUploadField label="Banner image" value={slide.image || ''} maxBytes={240 * 1024} onChange={next => updateBannerSlide(slideIndex, 'image', next)} onRemove={slide.image ? () => updateBannerSlides(bannerSlides.filter((_, index) => index !== slideIndex)) : undefined} /><div className="component-fields banner-slide-fields">{[['title', 'Headline'], ['subtitle', 'Small text above headline'], ['description', 'Description', 'area'], ['secondLine', 'Second description line'], ['button', 'Button text'], ['footnote', 'Small text below button'], ['label', 'Text on photo'], ['labelTitle', 'Photo caption']].map(([key, label, type]) => <label className="field" key={key}>{label}{type === 'area' ? <textarea rows="3" value={slide[key] || ''} onChange={event => updateBannerSlide(slideIndex, key, event.target.value)} /> : <input value={slide[key] || ''} onChange={event => updateBannerSlide(slideIndex, key, event.target.value)} />}</label>)}</div></section>)}</div><button type="button" className="secondary banner-add-image" disabled={bannerSlides.length >= 5} onClick={() => updateBannerSlides([...bannerSlides, emptyBannerSlide()])}>{bannerSlides.length >= 5 ? 'Maximum 5 slides' : '+ Add another slide'}</button></>}
      {title === 'Material edit' && <><p className="component-help">Each material has its own photo, tab name, caption and product link. Clicking its photo or details link on the storefront opens that product.</p><div className="signature-product-editor">{materialItems.map((item, itemIndex) => <section className="signature-product-editor-card" key={`material-${itemIndex}`}><b>Material {itemIndex + 1}</b><ImageUploadField label="Material image" value={item.image || ''} maxBytes={240 * 1024} onChange={next => updateMaterialItem(itemIndex, { image: next })} onRemove={item.image ? () => updateMaterialItem(itemIndex, { image: '' }) : undefined} /><label className="field">Tab name<input value={item.name || homepage[`materialTab${itemIndex + 1}`] || ''} onChange={event => updateMaterialItem(itemIndex, { name: event.target.value })} /></label><label className="field">Eyebrow / material line<input value={item.note || ''} placeholder="WOOL · TERRACOTTA · SCULPTED LINES" onChange={event => updateMaterialItem(itemIndex, { note: event.target.value })} /></label><label className="field">Headline<input value={item.title || ''} onChange={event => updateMaterialItem(itemIndex, { title: event.target.value })} /></label><label className="field">Description<textarea rows="3" value={item.text || ''} onChange={event => updateMaterialItem(itemIndex, { text: event.target.value })} /></label><label className="field">Collection filter<input value={item.filter || ''} onChange={event => updateMaterialItem(itemIndex, { filter: event.target.value })} /></label><label className="field">Product to open<select value={item.productId || ''} onChange={event => updateMaterialItem(itemIndex, { productId: event.target.value })}><option value="">Auto match collection / design</option>{products.map(product => <option key={product._id || product.id} value={product._id || product.id}>{product.name} · {product.category || product.type}</option>)}</select></label></section>)}</div></>}      {title === 'Signature edit' && <><p className="component-help">Choose up to three products to feature. Upload up to three images per product; its price and product details come from Products.</p><div className="signature-product-editor">{signatureItems.map((item, itemIndex) => { const selectedProduct = products.find(product => String(product._id || product.id) === String(item.productId)); const itemImages = Array.isArray(item.images) ? item.images : []; return <section className="signature-product-editor-card" key={`signature-product-${itemIndex}`}><b>Featured product {itemIndex + 1}</b><label className="field">Product<select value={item.productId || ''} onChange={event => updateSignatureItem(itemIndex, { productId: event.target.value })}><option value="">Choose a product</option>{products.map(product => <option key={product._id || product.id} value={product._id || product.id}>{product.name} · ₹{Number(product.price || 0).toLocaleString('en-IN')}</option>)}</select></label>{selectedProduct && <small className="signature-product-meta">Selected: {selectedProduct.name} · ₹{Number(selectedProduct.price || 0).toLocaleString('en-IN')}</small>}<div className="signature-image-list">{(itemImages.length ? itemImages : ['']).map((image, imageIndex) => <ImageUploadField key={`signature-${itemIndex}-image-${imageIndex}`} label={`Product image ${imageIndex + 1}`} value={image} maxBytes={240 * 1024} onChange={next => updateSignatureItem(itemIndex, { images: itemImages.length ? itemImages.map((current, index) => index === imageIndex ? next : current) : [next] })} onRemove={image ? () => updateSignatureItem(itemIndex, { images: itemImages.filter((_, index) => index !== imageIndex) }) : undefined} />)}</div><button type="button" className="secondary" disabled={itemImages.length >= 3} onClick={() => updateSignatureItem(itemIndex, { images: [...itemImages, ''] })}>{itemImages.length >= 3 ? 'Maximum 3 images' : '+ Add product image'}</button></section>; })}</div></>}
      <div className="component-fields">{fields.map(field => renderField(target, field))}</div>
      {optionalFields?.length > 0 && <details className="component-optional"><summary>More options</summary><div className="component-fields">{optionalFields.map(field => renderField(target, field))}</div></details>}
      <button type="button" className="primary component-save-section" onClick={() => saveSectionPayload(target, title, fields)} disabled={busy}>{busy ? 'Saving…' : `Save ${title}`}</button>
    </details>)}
    <div className="save-row"><span>Save changes to update the storefront.</span><button className="primary" disabled={busy}><Settings size={16} />{busy ? 'Saving…' : 'Save all components'}</button></div>
  </form>;
}


