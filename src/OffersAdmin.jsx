import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, Plus, RefreshCw, Save, Trash2, X } from 'lucide-react';
import './OffersAdmin.css';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000';
async function api(path, options = {}) {
  const response = await fetch(`${apiBase}/api/admin/offers${path}`, { ...options, credentials: 'include', headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) } });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'Could not save offers.');
  return result;
}

export default function OffersAdmin({ onClose }) {
  const [offers, setOffers] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  async function load() {
    setLoading(true); setError('');
    try { const rows = await api(''); const list = Array.isArray(rows) ? rows : []; setOffers(list); setDrafts(Object.fromEntries(list.map(item => [item._id, { message: item.message || '', active: item.active !== false, sortOrder: item.sortOrder || 0 }]))); }
    catch (err) { setError(err.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  async function createOffer(event) {
    event.preventDefault(); const value = message.trim(); if (!value) return;
    setBusy('new'); setError(''); setNotice('');
    try { const item = await api('', { method: 'POST', body: JSON.stringify({ message: value, active: true, sortOrder: offers.length ? Math.max(...offers.map(row => Number(row.sortOrder) || 0)) + 1 : 0 }) }); setOffers(rows => [...rows, item]); setDrafts(rows => ({ ...rows, [item._id]: { message: item.message, active: item.active, sortOrder: item.sortOrder } })); setMessage(''); setNotice('Offer created and added to the storefront rotation.'); }
    catch (err) { setError(err.message); } finally { setBusy(''); }
  }
  async function saveOffer(item) {
    const draft = drafts[item._id]; if (!draft?.message.trim()) { setError('Offer text cannot be empty.'); return; }
    setBusy(item._id); setError(''); setNotice('');
    try { const saved = await api(`/${item._id}`, { method: 'PUT', body: JSON.stringify({ ...draft, message: draft.message.trim(), sortOrder: Number(draft.sortOrder) || 0 }) }); setOffers(rows => rows.map(row => row._id === saved._id ? saved : row)); setDrafts(rows => ({ ...rows, [saved._id]: { message: saved.message, active: saved.active, sortOrder: saved.sortOrder } })); setNotice('Offer updated.'); }
    catch (err) { setError(err.message); } finally { setBusy(''); }
  }
  async function deleteOffer(item) {
    if (!window.confirm(`Delete “${item.message}”?`)) return;
    setBusy(item._id); setError(''); setNotice('');
    try { await api(`/${item._id}`, { method: 'DELETE' }); setOffers(rows => rows.filter(row => row._id !== item._id)); setDrafts(rows => { const next = { ...rows }; delete next[item._id]; return next; }); setNotice('Offer deleted.'); }
    catch (err) { setError(err.message); } finally { setBusy(''); }
  }
  return <div className="offers-overlay" role="dialog" aria-modal="true" aria-label="Manage offers"><div className="offers-shell">
    <header className="offers-header"><button className="offers-back" onClick={onClose}><ArrowLeft size={17} /> Back to admin</button><div><span className="offers-eyebrow">AARA STORE STUDIO</span><h1>Offer rotation</h1><p>Create and manage messages that autoplay in the storefront header.</p></div><button className="offers-refresh" onClick={load} disabled={loading}><RefreshCw size={16} /> Refresh</button><button className="offers-close" aria-label="Close offer manager" onClick={onClose}><X size={20} /></button></header>
    <form className="offers-create" onSubmit={createOffer}><label><span>New offer message</span><input maxLength={160} value={message} onChange={event => setMessage(event.target.value)} placeholder="Complimentary shipping on every order" required /></label><button className="primary" disabled={busy === 'new' || !message.trim()}><Plus size={16} />{busy === 'new' ? 'Creating…' : 'Create offer'}</button></form>
    {error && <p className="offers-error" role="alert">{error}</p>}{notice && <p className="offers-notice" role="status"><Check size={15} />{notice}</p>}
    <div className="offers-list-heading"><div><h2>Storefront offers</h2><p>Active offers rotate every five seconds. Set their display order below.</p></div><span>{offers.filter(item => item.active).length} active · {offers.length} total</span></div>
    {loading ? <div className="offers-empty">Loading offers…</div> : !offers.length ? <div className="offers-empty"><b>No offers yet</b><span>Create your first offer above to start the rotation.</span></div> : <div className="offers-list">{offers.map(item => { const draft = drafts[item._id] || {}; return <article className={`offer-editor-card ${draft.active ? 'is-active' : ''}`} key={item._id}><span className="offer-order">{String(Number(draft.sortOrder ?? item.sortOrder) + 1).padStart(2, '0')}</span><label className="offer-message-field"><span>Offer text</span><input maxLength={160} value={draft.message || ''} onChange={event => setDrafts(rows => ({ ...rows, [item._id]: { ...rows[item._id], message: event.target.value } }))} /></label><label className="offer-order-field"><span>Order</span><input type="number" min="0" value={draft.sortOrder ?? 0} onChange={event => setDrafts(rows => ({ ...rows, [item._id]: { ...rows[item._id], sortOrder: Number(event.target.value) } }))} /></label><label className="offer-active-field"><input type="checkbox" checked={!!draft.active} onChange={event => setDrafts(rows => ({ ...rows, [item._id]: { ...rows[item._id], active: event.target.checked } }))} />Active</label><button className="offer-save" onClick={() => saveOffer(item)} disabled={busy === item._id}><Save size={15} />Save</button><button className="offer-delete" onClick={() => deleteOffer(item)} disabled={busy === item._id} aria-label={`Delete ${item.message}`}><Trash2 size={16} /></button></article>; })}</div>}
  </div></div>;
}
