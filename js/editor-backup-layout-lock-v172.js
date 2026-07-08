/* v172: keep editor-backup imports stable across different computers. */
(function(){
  'use strict';

  if (window.__editorBackupLayoutLockV172) return;
  window.__editorBackupLayoutLockV172 = true;

  const SAVE_KEY = 'bootstrap-editor-v84-pages';
  const DESIGN_WIDTHS = { desktop: 1920, tablet: 768, mobile: 390 };
  const BACKUP_PAYLOAD_ID = 'editorBackupPayloadV172';
  const BACKUP_RESTORE_ID = 'editorBackupRestoreV172';
  const LOCAL_JS_ASSETS = [
    './js/editor.js',
    './js/nav-dropdown-action-ui-v164.js',
    './js/page-scroll-target-v166.js',
    './js/fixed-layout-scale-v167.js',
    './js/font-lock-v170.js',
    './js/accordion-export-all-items-v171.js',
    './js/editor-backup-layout-lock-v172.js',
    './js/export-filename-policy-v173.js'
  ];

  const cssV172 = `
/* v172: editor import layout lock */
html,
body,
#sitePage,
.site-page {
  -webkit-text-size-adjust: none !important;
  text-size-adjust: none !important;
  font-synthesis: none !important;
  font-optical-sizing: none !important;
}

body:not(.preview-mode) {
  --editor-design-width-v172: 1920px;
  overflow-x: hidden;
}

body:not(.preview-mode).device-tablet {
  --editor-design-width-v172: 768px;
}

body:not(.preview-mode).device-mobile {
  --editor-design-width-v172: 390px;
}

body:not(.preview-mode) .canvas-area {
  overflow: auto !important;
}

body:not(.preview-mode) #sitePage.site-page {
  width: var(--editor-design-width-v172) !important;
  min-width: var(--editor-design-width-v172) !important;
  max-width: var(--editor-design-width-v172) !important;
  font-size: 16px !important;
  font-family: "Microsoft JhengHei", "Noto Sans TC", Arial, sans-serif;
}

body:not(.preview-mode) #sitePage .free-element,
body:not(.preview-mode) #sitePage .free-element * {
  -webkit-text-size-adjust: none !important;
  text-size-adjust: none !important;
  font-synthesis: none !important;
  font-optical-sizing: none !important;
  box-sizing: border-box !important;
}

body:not(.preview-mode) #sitePage .free-element[data-type="shape"] .inner {
  position: relative !important;
  display: block !important;
  width: 100% !important;
  height: 100% !important;
}

body:not(.preview-mode) #sitePage .free-element[data-type="shape"] .shape-fill {
  position: absolute !important;
  inset: 0 !important;
  display: block !important;
  width: 100% !important;
  height: 100% !important;
}`;

  function injectCSS() {
    if (document.getElementById('editorBackupLayoutLockCSSV172')) return;
    const style = document.createElement('style');
    style.id = 'editorBackupLayoutLockCSSV172';
    style.textContent = cssV172;
    document.head.appendChild(style);
  }

  function parseStyleNumber(value) {
    const n = parseFloat(String(value || '').trim());
    return Number.isFinite(n) ? n : null;
  }

  function designWidthFor(mode) {
    return DESIGN_WIDTHS[mode] || DESIGN_WIDTHS.desktop;
  }

  function styleToPx(value, base) {
    const raw = String(value || '').trim();
    if (!raw) return null;
    if (raw.endsWith('%')) {
      const n = parseStyleNumber(raw);
      return n === null ? null : Math.round(base * n / 100);
    }
    const n = parseStyleNumber(raw);
    return n === null ? null : Math.round(n);
  }

  function lockElement(el, baseWidth) {
    if (!el || !el.style) return;
    const type = el.getAttribute('data-type') || '';
    const isTextLike = /^(text|heading|button|link|list|input|select|nav-dropdown|accordion-item)$/.test(type);
    const isShape = type === 'shape';
    if (!isTextLike && !isShape) return;

    ['left', 'width'].forEach(prop => {
      const px = styleToPx(el.style.getPropertyValue(prop), baseWidth);
      if (px !== null) el.style.setProperty(prop, px + 'px');
    });
    ['top', 'height'].forEach(prop => {
      const px = styleToPx(el.style.getPropertyValue(prop), baseWidth);
      if (px !== null) el.style.setProperty(prop, px + 'px');
    });

    const computed = window.getComputedStyle ? window.getComputedStyle(el) : null;
    const fontSize = parseStyleNumber(el.style.fontSize) || parseStyleNumber(computed && computed.fontSize);
    if (fontSize !== null && isTextLike) el.style.setProperty('font-size', Math.round(fontSize) + 'px');
    el.style.setProperty('box-sizing', 'border-box');
    el.setAttribute('data-editor-layout-locked-v172', 'true');

    if (isShape) {
      let inner = el.querySelector(':scope > .inner');
      if (!inner) {
        inner = document.createElement('div');
        inner.className = 'inner';
        while (el.firstChild) inner.appendChild(el.firstChild);
        el.appendChild(inner);
      }
      let fill = inner.querySelector('.shape-fill');
      if (!fill) {
        fill = document.createElement('div');
        fill.className = 'shape-fill';
        inner.insertBefore(fill, inner.firstChild);
      }
      const shapeType = el.getAttribute('data-shape-type') || fill.getAttribute('data-shape-type') || 'rect';
      el.setAttribute('data-shape-type', shapeType);
      fill.setAttribute('data-shape-type', shapeType);
    }
  }

  function lockHTML(html, mode) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html || '';
    const baseWidth = designWidthFor(mode);
    wrapper.querySelectorAll('.free-element').forEach(el => lockElement(el, baseWidth));
    return wrapper.innerHTML;
  }

  function lockPayload(payload) {
    if (!payload || !payload.pages) return payload;
    Object.values(payload.pages).forEach(page => {
      if (!page) return;
      if (page.html) page.html = lockHTML(page.html, 'desktop');
      const responsive = page.responsive || {};
      Object.keys(responsive).forEach(mode => {
        if (responsive[mode] && responsive[mode].html) {
          responsive[mode].html = lockHTML(responsive[mode].html, mode);
        }
      });
    });
    payload.editorLayoutLockV172 = {
      enabled: true,
      desktopWidth: DESIGN_WIDTHS.desktop,
      tabletWidth: DESIGN_WIDTHS.tablet,
      mobileWidth: DESIGN_WIDTHS.mobile,
      textSizeAdjust: 'none'
    };
    return payload;
  }

  function lockCurrentProject() {
    try { if (typeof captureCurrentPage === 'function') captureCurrentPage(); } catch (error) {}
    try { if (typeof captureCurrentResponsiveMode === 'function') captureCurrentResponsiveMode(); } catch (error) {}
    if (window.pages) lockPayload({ pages: window.pages });
    try {
      const page = document.getElementById('sitePage');
      if (page) page.querySelectorAll('.free-element').forEach(el => lockElement(el, designWidthFor(window.currentDeviceMode || 'desktop')));
    } catch (error) {}
  }

  function getPayload() {
    lockCurrentProject();
    const payload = (typeof getSerializableProjectPayload === 'function')
      ? getSerializableProjectPayload(true)
      : (typeof getProjectPayloadForBrowserStorage === 'function' ? getProjectPayloadForBrowserStorage() : {});
    return lockPayload(payload || {});
  }

  async function fetchText(path) {
    try {
      const response = await fetch(new URL(path, document.baseURI || window.location.href).href, { cache: 'no-store' });
      return response.ok ? await response.text() : '';
    } catch (error) {
      return '';
    }
  }

  function escapeScript(text) {
    return String(text || '').replace(/<\/script/gi, '<\\/script').replace(/<\/style/gi, '<\\/style');
  }

  function escapeJson(json) {
    return String(json || '{}').replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
  }

  function timestamp() {
    const d = new Date();
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
  }

  function restoreScript() {
    return `(function(){
  var PAYLOAD_ID = '${BACKUP_PAYLOAD_ID}';
  var SAVE_KEY = '${SAVE_KEY}';
  function parse(raw){ try { return raw ? JSON.parse(raw) : null; } catch(error){ return null; } }
  function payload(){ var node = document.getElementById(PAYLOAD_ID); return node ? parse(node.textContent || node.innerText || '') : null; }
  function restore(){
    var data = payload();
    if (!data || !data.pages) return;
    try {
      if (typeof applySavedPayload === 'function') applySavedPayload(data, true);
      try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch(error) {}
      try { if (typeof saveProjectToIndexedDB === 'function') saveProjectToIndexedDB(data); } catch(error) {}
      document.body.classList.add('editor-backup-layout-lock-v172');
      if (typeof normalizeEditorBackupLayoutV172 === 'function') normalizeEditorBackupLayoutV172();
      var status = document.getElementById('manualSaveStatus');
      if (status) status.innerHTML = '<i class="bi bi-shield-check"></i> 已載入備份並鎖定版面';
    } catch(error) {
      console.warn('backup restore failed', error);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(restore, 120); });
  else setTimeout(restore, 120);
})();`;
  }

  function inlineOrAppendScript(doc, src, text) {
    if (!text) return;
    let script = Array.from(doc.querySelectorAll('script[src]')).find(node => {
      const raw = node.getAttribute('src') || '';
      return raw.replace(/^\.?\//, '') === src.replace(/^\.?\//, '');
    });
    if (!script) {
      script = document.createElement('script');
      (doc.body || doc.documentElement).appendChild(script);
    }
    script.removeAttribute('src');
    script.setAttribute('data-editor-backup-js-v172', src);
    script.textContent = escapeScript(text);
  }

  async function buildBackupHTML(payloadJSON) {
    const doc = document.documentElement.cloneNode(true);
    const head = doc.querySelector('head');
    const body = doc.querySelector('body');
    if (head) {
      let title = head.querySelector('title') || document.createElement('title');
      title.textContent = '備份編輯器 v172';
      if (!title.parentNode) head.appendChild(title);
      const style = document.createElement('style');
      style.setAttribute('data-editor-backup-layout-lock-v172', 'true');
      style.textContent = cssV172;
      head.appendChild(style);
    }
    if (body) {
      body.classList.remove('preview-mode', 'panels-hidden');
      body.classList.add('editor-backup-v172', 'editor-backup-layout-lock-v172');
    }
    doc.querySelectorAll('.selected, .multi-selected, .has-selected-child, .is-editing').forEach(node => {
      node.classList.remove('selected', 'multi-selected', 'has-selected-child', 'is-editing');
    });
    doc.querySelectorAll('#' + BACKUP_PAYLOAD_ID + ', #' + BACKUP_RESTORE_ID).forEach(node => node.remove());

    const editorCSS = await fetchText('./css/editor.css');
    if (editorCSS) {
      doc.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        const href = link.getAttribute('href') || '';
        if (/editor\\.css(\\?|#|$)/.test(href)) {
          const style = document.createElement('style');
          style.setAttribute('data-editor-backup-css', 'editor.css');
          style.textContent = editorCSS;
          link.replaceWith(style);
        }
      });
    }

    const assets = {};
    for (const src of LOCAL_JS_ASSETS) assets[src] = await fetchText(src);
    LOCAL_JS_ASSETS.forEach(src => inlineOrAppendScript(doc, src, assets[src]));

    const payloadScript = document.createElement('script');
    payloadScript.id = BACKUP_PAYLOAD_ID;
    payloadScript.type = 'application/json';
    payloadScript.textContent = escapeJson(payloadJSON);

    const restore = document.createElement('script');
    restore.id = BACKUP_RESTORE_ID;
    restore.textContent = restoreScript();

    (doc.querySelector('body') || doc).appendChild(payloadScript);
    (doc.querySelector('body') || doc).appendChild(restore);
    return '<!doctype html>\n' + doc.outerHTML;
  }

  async function exportEditorBackupV172(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
    if (typeof JSZip === 'undefined') {
      alert('找不到 JSZip，無法匯出備份編輯器。');
      return;
    }
    const button = document.getElementById('exportEditorBackupBtn');
    const oldHTML = button ? button.innerHTML : '';
    if (button) {
      button.disabled = true;
      button.innerHTML = '<i class="bi bi-hourglass-split"></i> 匯出中';
    }
    try {
      const payload = getPayload();
      payload.version = 'v172-editor-backup-layout-lock';
      payload.backupType = 'full-editor-backup';
      payload.savedAt = Date.now();
      payload.exportedAt = payload.savedAt;
      const payloadJSON = JSON.stringify(payload, null, 2);
      const zip = new JSZip();
      const html = await buildBackupHTML(payloadJSON);
      const stamp = timestamp();
      zip.file('index.html', html);
      zip.file('backup-project.json', payloadJSON);
      const css = await fetchText('./css/editor.css');
      if (css) zip.file('css/editor.css', css + '\n' + cssV172 + '\n');
      for (const src of LOCAL_JS_ASSETS) {
        const text = await fetchText(src);
        if (text) zip.file(src.replace(/^\.\//, ''), text);
      }
      zip.file('README.txt', [
        '備份編輯器 v172',
        '',
        '這版會在匯出備份時鎖定文字與形狀元件尺寸，並把新版補丁一起帶入備份編輯器。',
        '解壓縮後開啟 index.html 即可繼續編輯。'
      ].join('\n'));
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'editor-backup-v172-' + stamp + '.zip';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        URL.revokeObjectURL(url);
        a.remove();
      }, 0);
      alert('已匯出備份編輯器 ZIP。這版會鎖定文字與形狀版面，換電腦匯入也會維持一致。');
    } catch (error) {
      console.error('export editor backup v172 failed', error);
      alert('匯出備份編輯器失敗，請確認瀏覽器允許下載。');
    } finally {
      if (button) {
        button.disabled = false;
        button.innerHTML = oldHTML;
      }
    }
  }

  function normalizeEditorBackupLayoutV172() {
    injectCSS();
    const page = document.getElementById('sitePage');
    if (page) page.querySelectorAll('.free-element').forEach(el => lockElement(el, designWidthFor(window.currentDeviceMode || 'desktop')));
    try { if (typeof captureCurrentPage === 'function') captureCurrentPage(); } catch (error) {}
  }

  window.normalizeEditorBackupLayoutV172 = normalizeEditorBackupLayoutV172;
  window.exportEditorBackupV172 = exportEditorBackupV172;

  injectCSS();
  document.addEventListener('DOMContentLoaded', normalizeEditorBackupLayoutV172);
  setTimeout(normalizeEditorBackupLayoutV172, 160);

  const button = document.getElementById('exportEditorBackupBtn');
  if (button && !button.__editorBackupV172Bound) {
    button.__editorBackupV172Bound = true;
    button.addEventListener('click', exportEditorBackupV172, true);
  }

  if (typeof applySavedPayload === 'function' && !window.__applySavedPayloadLayoutLockWrappedV172) {
    window.__applySavedPayloadLayoutLockWrappedV172 = true;
    const previousApplySavedPayloadV172 = applySavedPayload;
    applySavedPayload = function(saved, silent) {
      lockPayload(saved);
      const result = previousApplySavedPayloadV172.apply(this, arguments);
      setTimeout(normalizeEditorBackupLayoutV172, 80);
      return result;
    };
    window.applySavedPayload = applySavedPayload;
  }
})();
