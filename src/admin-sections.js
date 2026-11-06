import React from 'react';
import { createRoot } from 'react-dom/client';
import OrdersAdmin from './OrdersAdmin.jsx';
import OffersAdmin from './OffersAdmin.jsx';
import NewsletterAdmin from './NewsletterAdmin.jsx';
import './AdminSections.css';

const sections = [
  { key: 'orders', label: 'Orders', icon: '▤', Component: OrdersAdmin },
  { key: 'offers', label: 'Offers', icon: '✦', Component: OffersAdmin },
  { key: 'newsletter', label: 'Newsletter', icon: '✉', Component: NewsletterAdmin }
];
let activeKey = '';
let panelRoot = null;
let panelHost = null;
let content = null;
let savedTitle = '';
let previousBuiltInButton = null;

function restoreWorkspace() {
  if (!content) return;
  panelRoot?.unmount(); panelRoot = null;
  panelHost?.remove(); panelHost = null;
  for (const child of content.children) child.style.removeProperty('display');
  const title = document.querySelector('.topbar h1');
  if (title && savedTitle) title.textContent = savedTitle;
  savedTitle = ''; activeKey = '';
  document.querySelectorAll('[data-aara-admin-section]').forEach(button => button.classList.remove('active'));
  previousBuiltInButton?.classList.add('active');
}
function showSection(section, button) {
  content = document.querySelector('.workspace .content');
  if (!content) return;
  if (activeKey === section.key) return;
  previousBuiltInButton = document.querySelector('.sidebar nav button.active:not([data-aara-admin-section])') || previousBuiltInButton;
  restoreWorkspace();
  content = document.querySelector('.workspace .content');
  if (!content) return;
  activeKey = section.key;
  const title = document.querySelector('.topbar h1');
  if (title) { savedTitle = title.textContent; title.textContent = section.label; }
  for (const child of content.children) child.style.display = 'none';
  panelHost = document.createElement('div'); panelHost.className = 'admin-sections-host'; content.append(panelHost);
  panelRoot = createRoot(panelHost);
  panelRoot.render(React.createElement(section.Component, { onClose: restoreWorkspace }));
  document.querySelectorAll('.sidebar nav button').forEach(item => item.classList.toggle('active', item === button));
}
function attachButtons() {
  const nav = document.querySelector('.sidebar nav');
  if (!nav) return;
  sections.forEach(section => {
    let button = nav.querySelector(`[data-aara-admin-section="${section.key}"]`);
    // The legacy dashboard renders its own Orders / Offers buttons, whose
    // handlers open the old full-screen panels. Remove those so this single
    // sidebar entry always opens the persistent workspace panel below.
    [...nav.querySelectorAll('button:not([data-aara-admin-section])')]
      .filter(item => item.textContent.trim().replace(/\s+/g, ' ').toLowerCase() === section.label.toLowerCase())
      .forEach(item => item.remove());
    if (!button) {
      button = document.createElement('button');
      button.dataset.aaraAdminSection = section.key;
      button.className = 'aara-orders-nav';
      button.innerHTML = `<span aria-hidden="true">${section.icon}</span><span>${section.label}</span>`;
      button.addEventListener('click', () => showSection(section, button));
      nav.append(button);
    }
  });
  if (activeKey && panelHost && !panelHost.isConnected) {
    content = document.querySelector('.workspace .content');
    if (content) content.append(panelHost);
  }
}
document.addEventListener('click', event => {
  if (!activeKey) return;
  const builtIn = event.target.closest('.sidebar nav button:not([data-aara-admin-section])');
  if (builtIn) restoreWorkspace();
}, true);
const observer = new MutationObserver(attachButtons);
observer.observe(document.documentElement, { childList: true, subtree: true });
attachButtons();
