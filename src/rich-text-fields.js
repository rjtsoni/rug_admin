import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const mounted = new WeakMap();
const toolbar = [
  [{ header: [2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['blockquote', 'link'],
  ['clean']
];

function isDescriptionField(textarea) {
  const label = textarea.closest('label')?.textContent?.toLowerCase() || '';
  return /description|paragraph|page content|highlights|care instructions|delivery note|returns|intro|business note|privacy note|consent note|craft note/i.test(label);
}

function syncTextarea(textarea, value) {
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
  if (setter) setter.call(textarea, value);
  else textarea.value = value;
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  textarea.dispatchEvent(new Event('change', { bubbles: true }));
}

window.__aaraSetRichTextValue = (textarea, value) => {
  const text = String(value || '');
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
  if (setter) setter.call(textarea, text);
  else textarea.value = text;
  const field = mounted.get(textarea);
  if (!field) return;
  if (text.trim() && /<[a-z][\s\S]*>/i.test(text)) {
    field.editor.setContents(field.editor.clipboard.convert({ html: text, text: '' }), 'silent');
  } else if (text.trim()) {
    field.editor.setText(text, 'silent');
  } else {
    field.editor.setText('', 'silent');
  }
};

function mount(textarea) {
  if (mounted.has(textarea) || !isDescriptionField(textarea)) return;

  const host = document.createElement('div');
  host.className = 'rich-text-admin';
  textarea.insertAdjacentElement('afterend', host);
  textarea.style.display = 'none';
  textarea.setAttribute('aria-hidden', 'true');
  textarea.tabIndex = -1;

  const editor = new Quill(host, {
    theme: 'snow',
    modules: { toolbar },
    formats: ['header', 'bold', 'italic', 'underline', 'strike', 'list', 'blockquote', 'link']
  });

  const initial = textarea.value || '';
  if (initial.trim()) {
    if (/<[a-z][\s\S]*>/i.test(initial)) {
      editor.setContents(editor.clipboard.convert({ html: initial, text: '' }), 'silent');
    } else {
      editor.setText(initial, 'silent');
    }
  }

  editor.on('text-change', () => {
    const value = editor.getText().trim() ? editor.getSemanticHTML(0, editor.getLength()) : '';
    syncTextarea(textarea, value);
  });
  mounted.set(textarea, { editor, host });
}

function mountAll() {
  document.querySelectorAll('.editor textarea, .component-editor textarea, .contact-admin textarea').forEach(mount);
}

const observer = new MutationObserver(mountAll);
observer.observe(document.body, { childList: true, subtree: true });
mountAll();
