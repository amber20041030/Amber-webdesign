/* v171: keep every accordion dropdown item in preview and exported pages. */
(function(){
  'use strict';

  const SNAPSHOT_ATTR = 'data-accordion-items-html-v171';
  const COUNT_ATTR = 'data-accordion-items-count-v171';

  const CSS_V171 = `
/* v171: accordion export keeps all edited items */
body.preview-mode .accordion-dropdown-template .accordion-list,
body.preview-mode .accordion-dropdown-template .accordion-list-canvas,
body.exported-site .accordion-dropdown-template .accordion-list,
body.exported-site .accordion-dropdown-template .accordion-list-canvas {
  display: flex !important;
  flex-direction: column !important;
  gap: 10px !important;
  position: relative !important;
  height: auto !important;
  min-height: 0 !important;
  overflow: visible !important;
}

body.preview-mode .accordion-dropdown-template .accordion-item-template,
body.exported-site .accordion-dropdown-template .accordion-item-template {
  display: block !important;
  position: relative !important;
  left: auto !important;
  top: auto !important;
  right: auto !important;
  bottom: auto !important;
  width: 100% !important;
  height: auto !important;
  min-height: 54px !important;
  flex: 0 0 auto !important;
  opacity: 1 !important;
  visibility: visible !important;
  transform: none !important;
}`;

  function listFor(root) {
    return root && (root.querySelector(':scope .accordion-list-canvas') || root.querySelector(':scope .accordion-list'));
  }

  function cleanupItemForSnapshot(item) {
    const clone = item.cloneNode(true);
    clone.classList.remove('selected', 'multi-selected', 'is-editing', 'has-selected-child');
    clone.removeAttribute('contenteditable');
    clone.querySelectorAll('.no-export, .move-handle, .element-toolbar, .resize-handle, .editor-actions, [data-accordion-action]').forEach(node => node.remove());
    clone.querySelectorAll('[contenteditable]').forEach(node => node.removeAttribute('contenteditable'));
    clone.querySelectorAll('[data-editable-text]').forEach(node => {
      node.removeAttribute('data-editable-text');
      node.removeAttribute('contenteditable');
    });
    return clone.outerHTML;
  }

  function normalizeItem(item) {
    if (!item) return;
    item.style.position = 'relative';
    item.style.left = 'auto';
    item.style.top = 'auto';
    item.style.right = 'auto';
    item.style.bottom = 'auto';
    item.style.width = '100%';
    item.style.height = 'auto';
  }

  function storeAccordionItems(scope) {
    (scope || document).querySelectorAll('.accordion-dropdown-template').forEach(root => {
      const list = listFor(root);
      if (!list) return;
      const items = Array.from(list.querySelectorAll(':scope > .accordion-item-template'));
      if (!items.length) return;
      items.forEach(normalizeItem);
      root.setAttribute(COUNT_ATTR, String(items.length));
      root.setAttribute(SNAPSHOT_ATTR, encodeURIComponent(items.map(cleanupItemForSnapshot).join('')));
    });
  }

  function restoreAccordionItems(scope) {
    (scope || document).querySelectorAll('.accordion-dropdown-template').forEach(root => {
      const list = listFor(root);
      if (!list) return;
      const expected = parseInt(root.getAttribute(COUNT_ATTR) || '0', 10);
      const encoded = root.getAttribute(SNAPSHOT_ATTR) || '';
      const current = list.querySelectorAll(':scope > .accordion-item-template').length;
      if (encoded && expected > current) {
        try {
          list.innerHTML = decodeURIComponent(encoded);
        } catch (error) {
          console.warn('accordion restore failed', error);
        }
      }
      list.querySelectorAll(':scope > .accordion-item-template').forEach(normalizeItem);
    });
  }

  function bindRuntime(scope) {
    (scope || document).querySelectorAll('.accordion-dropdown-template').forEach(root => {
      if (root.__accordionExportAllItemsBoundV171) return;
      root.__accordionExportAllItemsBoundV171 = true;
      root.addEventListener('click', event => {
        const head = event.target.closest('[data-accordion-toggle], .accordion-item-head');
        if (!head || !root.contains(head)) return;
        const item = head.closest('.accordion-item-template');
        if (!item) return;
        const shouldOpen = !item.classList.contains('open');
        root.querySelectorAll('.accordion-item-template.open').forEach(openItem => {
          if (openItem !== item) openItem.classList.remove('open');
        });
        item.classList.toggle('open', shouldOpen);
      });
    });
  }

  function normalizeAccordions(scope) {
    storeAccordionItems(scope || document);
    restoreAccordionItems(scope || document);
    bindRuntime(scope || document);
  }

  window.normalizeAccordionExportAllItemsV171 = normalizeAccordions;

  if (typeof cleanPageCloneForExport === 'function' && !window.__accordionCleanExportAllItemsWrappedV171) {
    window.__accordionCleanExportAllItemsWrappedV171 = true;
    const previousCleanPageCloneForExportV171 = cleanPageCloneForExport;
    cleanPageCloneForExport = function(clone) {
      storeAccordionItems(clone);
      const html = previousCleanPageCloneForExportV171.apply(this, arguments);
      if (!html || typeof html !== 'string') return html;
      const wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      restoreAccordionItems(wrapper);
      return wrapper.innerHTML;
    };
    window.cleanPageCloneForExport = cleanPageCloneForExport;
  }

  if (typeof cleanHTMLForExport === 'function' && !window.__accordionCleanHTMLAllItemsWrappedV171) {
    window.__accordionCleanHTMLAllItemsWrappedV171 = true;
    const previousCleanHTMLForExportV171 = cleanHTMLForExport;
    cleanHTMLForExport = function(html) {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = html || '';
      storeAccordionItems(wrapper);
      const cleaned = previousCleanHTMLForExportV171.call(this, wrapper.innerHTML);
      const restored = document.createElement('div');
      restored.innerHTML = cleaned || '';
      restoreAccordionItems(restored);
      return restored.innerHTML;
    };
    window.cleanHTMLForExport = cleanHTMLForExport;
  }

  if (typeof buildExportCSS === 'function' && !window.__accordionExportAllItemsCSSWrappedV171) {
    window.__accordionExportAllItemsCSSWrappedV171 = true;
    const previousBuildExportCSSV171 = buildExportCSS;
    buildExportCSS = function() {
      return previousBuildExportCSSV171.apply(this, arguments) + '\n' + CSS_V171 + '\n';
    };
    window.buildExportCSS = buildExportCSS;
  }

  if (typeof buildExportJS === 'function' && !window.__accordionExportAllItemsJSWrappedV171) {
    window.__accordionExportAllItemsJSWrappedV171 = true;
    const previousBuildExportJSV171 = buildExportJS;
    buildExportJS = function(exportPagesJSON, currentPageIdJSON) {
      const js = previousBuildExportJSV171.apply(this, arguments);
      return js + `

/* v171: restore every edited accordion dropdown item after export page render */
(function(){
  var SNAPSHOT_ATTR = '${SNAPSHOT_ATTR}';
  var COUNT_ATTR = '${COUNT_ATTR}';
  function listFor(root){ return root && (root.querySelector('.accordion-list-canvas') || root.querySelector('.accordion-list')); }
  function normalizeItem(item){
    if (!item) return;
    item.style.position = 'relative';
    item.style.left = 'auto';
    item.style.top = 'auto';
    item.style.right = 'auto';
    item.style.bottom = 'auto';
    item.style.width = '100%';
    item.style.height = 'auto';
  }
  function restore(scope){
    (scope || document).querySelectorAll('.accordion-dropdown-template').forEach(function(root){
      var list = listFor(root);
      if (!list) return;
      var expected = parseInt(root.getAttribute(COUNT_ATTR) || '0', 10);
      var encoded = root.getAttribute(SNAPSHOT_ATTR) || '';
      var current = list.querySelectorAll(':scope > .accordion-item-template').length;
      if (encoded && expected > current) {
        try { list.innerHTML = decodeURIComponent(encoded); } catch(error) {}
      }
      list.querySelectorAll(':scope > .accordion-item-template').forEach(normalizeItem);
      if (!root.__accordionExportAllItemsBoundV171) {
        root.__accordionExportAllItemsBoundV171 = true;
        root.addEventListener('click', function(event){
          var head = event.target.closest('[data-accordion-toggle], .accordion-item-head');
          if (!head || !root.contains(head)) return;
          var item = head.closest('.accordion-item-template');
          if (!item) return;
          var shouldOpen = !item.classList.contains('open');
          root.querySelectorAll('.accordion-item-template.open').forEach(function(openItem){
            if (openItem !== item) openItem.classList.remove('open');
          });
          item.classList.toggle('open', shouldOpen);
        });
      }
    });
  }
  document.addEventListener('DOMContentLoaded', function(){ restore(document); });
  var previousRender = window.renderExportPage;
  if (typeof previousRender === 'function' && !previousRender.__accordionExportAllItemsWrappedV171) {
    window.renderExportPage = function(pageId){
      var result = previousRender.apply(this, arguments);
      setTimeout(function(){ restore(document); }, 0);
      return result;
    };
    window.renderExportPage.__accordionExportAllItemsWrappedV171 = true;
  }
  restore(document);
})();`;
    };
    window.buildExportJS = buildExportJS;
  }

  document.addEventListener('DOMContentLoaded', () => normalizeAccordions(document));
  document.addEventListener('click', event => {
    if (event.target.closest('#exportBtn, #exportHtmlBtn, #exportRootHtmlBtn, [data-export], [data-action="export"]')) {
      normalizeAccordions(document);
    }
  }, true);
})();
