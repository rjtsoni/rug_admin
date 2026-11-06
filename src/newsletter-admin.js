import React from 'react';
import { createRoot } from 'react-dom/client';
import NewsletterAdmin from './NewsletterAdmin.jsx';
let modalRoot;
function openNewsletterAdmin() { if (document.getElementById('aara-newsletter-admin-overlay')) return; const host = document.createElement('div'); host.id = 'aara-newsletter-admin-overlay'; document.body.append(host); modalRoot = createRoot(host); modalRoot.render(React.createElement(NewsletterAdmin, { onClose: () => { modalRoot?.unmount(); modalRoot = null; host.remove(); } })); }
function attachNewsletterButton() { const nav = document.querySelector('.sidebar nav'); if (!nav || nav.querySelector('[data-aara-newsletter]')) return; const button = document.createElement('button'); button.dataset.aaraNewsletter = 'true'; button.className = 'aara-orders-nav aara-newsletter-nav'; button.innerHTML = '<span aria-hidden="true">✉</span><span>Newsletter</span>'; button.addEventListener('click', openNewsletterAdmin); nav.append(button); }
const observer = new MutationObserver(attachNewsletterButton); observer.observe(document.documentElement, { childList: true, subtree: true }); attachNewsletterButton();