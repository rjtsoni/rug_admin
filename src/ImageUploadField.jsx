import React, { useState } from 'react';

function toDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read this image.'));
    reader.readAsDataURL(blob);
  });
}

function compressImage(bitmap, maxBytes) {
  return new Promise((resolve, reject) => {
    let scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
    const attempt = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext('2d');
      context.fillStyle = '#f6f4ee';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      for (let quality = 0.84; quality >= 0.48; quality -= 0.12) {
        const blob = await new Promise(done => canvas.toBlob(done, 'image/webp', quality));
        if (blob && blob.size <= maxBytes) return resolve(blob);
      }
      if (scale <= 0.45) return reject(new Error('Could not optimise this image enough. Choose a smaller file.'));
      scale *= 0.78;
      return attempt();
    };
    attempt().catch(reject);
  });
}

export default function ImageUploadField({ label, value, onChange, onRemove, maxBytes = 500 * 1024 }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Choose a JPG, PNG or WebP image.'); event.target.value = ''; return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setError('Choose an image smaller than 12 MB.'); event.target.value = ''; return;
    }
    setBusy(true); setError('');
    try {
      const bitmap = await createImageBitmap(file);
      const blob = await compressImage(bitmap, maxBytes);
      bitmap.close();
      onChange(await toDataUrl(blob));
    } catch (cause) {
      setError(cause.message || 'Could not process this image.');
    } finally {
      setBusy(false);
    }
  }
  return <div className="field image-upload-field"><span>{label}</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} disabled={busy} /><small>{busy ? 'Preparing image…' : `JPG, PNG or WebP · up to 12 MB. Optimised to ${Math.round(maxBytes / 1024)} KB.`}</small>{value && <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}><img src={value} alt={`${label} preview`} style={{ width: 150, height: 90, objectFit: 'cover', background: '#efeee6' }} />{onRemove && <button type="button" className="secondary" onClick={() => { onRemove(); setError(''); }}>Remove image</button>}</div>}{error && <small role="alert" style={{ color: '#9b5144' }}>{error}</small>}</div>;
}
