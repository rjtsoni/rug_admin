import React from 'react';
import { createRoot } from 'react-dom/client';
import OffersAdmin from './OffersAdmin.jsx';
import './OffersAdmin.css';
let modalRoot;
function openOffers() {
  if (document.getElementById('aara-offers-overlay')) return;
  const host = document.createElement('div'); host.id = 'aara-offers-overlay'; document.body.append(host);
  modalRoot = createRoot(host);
  modalRoot.render(<OffersAdmin onClose={() => { modalRoot?.unmount(); modalRoot = null; host.remove(); }} />);
}
function attachOffersButton() {
  const nav = document.querySelector('.sidebar nav');
  if (!nav || nav.querySelector('[data-aara-offers]')) return;
  const button = document.createElement('button'); button.dataset.aaraOffers = 'true'; button.className = 'aara-orders-nav aara-offers-nav'; button.innerHTML = '<span aria-hidden="true">✦</span><span>Offers</span>'; button.addEventListener('click', openOffers); nav.append(button);
}
const observer = new MutationObserver(attachOffersButton); observer.observe(document.documentElement, { childList: true, subtree: true }); attachOffersButton();
