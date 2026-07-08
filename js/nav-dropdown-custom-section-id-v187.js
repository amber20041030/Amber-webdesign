/* v187: nav dropdown page jump + custom section ID target. */
(function(){
  'use strict';

  if (window.__navDropdownCustomSectionIdV187) return;
  window.__navDropdownCustomSectionIdV187 = true;

  const TITLE_KEY = '__title';
  const CARD_ID = 'navDropdownActionCardV164';
  const CUSTOM_INPUT_ID = 'navDropdownCustomSectionTargetV187';

  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, match => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    })[match]);
  }

  function readJSON(el, attr, fallback) {
    try {
      const raw = el?.getAttribute(attr) || '';
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJSON(el, attr, value) {
    if (!el) return;
    const text = JSON.stringify(value || {});
    el.setAttribute(attr, text);
    const key = attr.replace(/^data-/, '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    if (el.dataset) el.dataset[key] = text;
  }

  function selectedRoot() {
    const selectedNode = qs('.nav-option-edit-selected');
    return qs('.nav-dropdown[data-option-picker-open="true"]') ||
      selectedNode?.closest?.('.nav-dropdown') ||
      qs('.nav-dropdown.selected');
  }

  function selectedTarget(root = selectedRoot()) {
    if (!root) return TITLE_KEY;
    if (qs('.nav-dropdown-title.nav-option-edit-selected', root)) return TITLE_KEY;
    const option = qs('.nav-dropdown-option.nav-option-edit-selected', root);
    return option ? String(option.getAttribute('data-option-index') || '0') : TITLE_KEY;
  }

  function normalizeNav(root) {
    if (!root) return;
    qsa('.nav-dropdown-option', root).forEach((option, index) => {
      option.setAttribute('data-option-index', String(index));
      if (!option.getAttribute('data-option-id')) {
        option.setAttribute('data-option-id', 'navopt-' + Date.now().toString(36) + '-' + index);
      }
    });
  }

  function getAction(root, target) {
    normalizeNav(root);
    const actions = readJSON(root, 'data-option-actions', {});
    if (target === TITLE_KEY) return actions[TITLE_KEY] || {};
    const option = qs(`.nav-dropdown-option[data-option-index="${String(target).replace(/"/g, '\\"')}"]`, root);
    const id = option?.getAttribute('data-option-id') || '';
    const byId = readJSON(root, 'data-option-actions-by-id', {});
    return (id && byId[id]) || actions[String(target)] || {};
  }

  function setAction(root, target, action) {
    normalizeNav(root);
    const actions = readJSON(root, 'data-option-actions', {});
    actions[target === TITLE_KEY ? TITLE_KEY : String(target)] = action;
    writeJSON(root, 'data-option-actions', actions);
    if (target !== TITLE_KEY) {
      const option = qs(`.nav-dropdown-option[data-option-index="${String(target).replace(/"/g, '\\"')}"]`, root);
      const id = option?.getAttribute('data-option-id') || '';
      if (id) {
        const byId = readJSON(root, 'data-option-actions-by-id', {});
        byId[id] = Object.assign({}, action, { itemId: id });
        writeJSON(root, 'data-option-actions-by-id', byId);
      }
    }
    try { if (typeof scheduleAutoSave === 'function') scheduleAutoSave(); } catch (error) {}
  }

  function getCurrentMode() {
    try { return window.currentDeviceMode || currentDeviceMode || 'desktop'; } catch (error) { return 'desktop'; }
  }

  function pageHTML(pageId) {
    try {
      const page = pages && pages[pageId];
      if (!page) return '';
      const mode = getCurrentMode();
      return page.responsive?.[mode]?.html || page.responsive?.desktop?.html || page.html || '';
    } catch (error) {
      return '';
    }
  }

  function labelForBlock(el) {
    return (el.getAttribute('data-name') || el.querySelector?.('.block-label')?.textContent || el.id || '').trim();
  }

  function sectionEntriesForPage(pageId) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = pageHTML(pageId);
    const seen = new Set();
    return qsa('.html-block[id], section[id], header[id], footer[id], nav[id], div[id]', wrapper)
      .map(el => [el.id, labelForBlock(el) || el.id])
      .filter(([id]) => {
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      });
  }

  function ensureCustomInput() {
    const card = qs('#' + CARD_ID);
    const select = qs('#navDropdownSectionTargetV164');
    if (!card || !select) return null;
    let input = qs('#' + CUSTOM_INPUT_ID);
    if (input) return input;

    const wrap = document.createElement('div');
    wrap.id = 'navDropdownCustomSectionWrapV187';
    wrap.innerHTML = `
      <label class="simple-label">自訂區塊 ID</label>
      <input type="text" class="form-control form-control-sm mb-2" id="${CUSTOM_INPUT_ID}" placeholder="例如：about-us">
      <div class="small text-muted mb-3">可直接輸入目標分頁裡你自訂的區塊 ID，不需要出現在下拉選單。</div>
    `;
    select.insertAdjacentElement('afterend', wrap);
    input = qs('#' + CUSTOM_INPUT_ID);
    input?.addEventListener('input', () => syncSelectFromCustomInput());
    select.addEventListener('change', () => {
      const custom = qs('#' + CUSTOM_INPUT_ID);
      if (custom && select.value) custom.value = select.value;
    });
    qs('#navDropdownPageTargetV164')?.addEventListener('change', () => refreshSectionOptionsForPage());
    return input;
  }

  function ensureOption(select, value, label) {
    if (!select || !value) return;
    if (![...select.options].some(option => option.value === value)) {
      select.insertAdjacentHTML('beforeend', `<option value="${escapeHTML(value)}">${escapeHTML(label || value)}</option>`);
    }
    select.value = value;
  }

  function refreshSectionOptionsForPage(preferred = '') {
    const select = qs('#navDropdownSectionTargetV164');
    if (!select) return;
    const pageId = qs('#navDropdownPageTargetV164')?.value || '';
    const custom = qs('#' + CUSTOM_INPUT_ID);
    const current = preferred || custom?.value.trim() || select.value || '';
    const entries = pageId ? sectionEntriesForPage(pageId) : [];
    if (entries.length) {
      select.innerHTML = '<option value="">選擇區塊 ID</option>' + entries
        .map(([id, name]) => `<option value="${escapeHTML(id)}">${escapeHTML(id)} - ${escapeHTML(name)}</option>`)
        .join('');
    }
    if (current) ensureOption(select, current, current + '（自訂）');
    if (custom && current) custom.value = current;
  }

  function syncSelectFromCustomInput() {
    const input = qs('#' + CUSTOM_INPUT_ID);
    const select = qs('#navDropdownSectionTargetV164');
    const value = (input?.value || '').trim().replace(/^#/, '');
    if (value) ensureOption(select, value, value + '（自訂）');
  }

  function syncPanelFromAction() {
    const input = ensureCustomInput();
    const root = selectedRoot();
    if (!input || !root) return;
    const target = selectedTarget(root);
    const action = getAction(root, target);
    const value = String(action.scrollTarget || '').replace(/^#/, '');
    refreshSectionOptionsForPage(value);
    input.value = value;
    syncSelectFromCustomInput();
  }

  function applyCustomTargetBeforeSave() {
    const input = ensureCustomInput();
    const root = selectedRoot();
    if (!input || !root) return;
    const customId = input.value.trim().replace(/^#/, '');
    if (!customId) return;
    const type = qs('#navDropdownActionTypeV164')?.value || 'none';
    if (type !== 'section' && type !== 'page-section') return;

    ensureOption(qs('#navDropdownSectionTargetV164'), customId, customId + '（自訂）');
    const target = selectedTarget(root);
    const action = getAction(root, target);
    const next = Object.assign({}, action, {
      itemId: target,
      functionEnabled: true,
      pageEnabled: type === 'page-section',
      pageTarget: type === 'page-section' ? (qs('#navDropdownPageTargetV164')?.value || '') : '',
      scrollEnabled: true,
      scrollTarget: customId,
      linkEnabled: false,
      linkUrl: ''
    });
    setAction(root, target, next);
  }

  function findTarget(id) {
    if (!id) return null;
    const clean = String(id).replace(/^#/, '');
    let target = document.getElementById(clean);
    if (target) return target;
    try {
      target = document.querySelector('[data-id="' + CSS.escape(clean) + '"], [data-block-id="' + CSS.escape(clean) + '"]');
    } catch (error) {}
    return target || null;
  }

  function scrollToCustomTarget(id, behavior = 'smooth') {
    const target = findTarget(id);
    if (!target) return false;
    try { target.scrollIntoView({ behavior, block: 'start' }); }
    catch (error) { target.scrollIntoView(); }
    return true;
  }

  function previewPageJump(data) {
    if (!data || !data.pageEnabled || !data.pageTarget || !data.scrollEnabled || !data.scrollTarget) return false;
    if (document.body.classList.contains('exported-site')) return false;
    if (typeof loadPage !== 'function') return false;
    loadPage(data.pageTarget, true);
    setTimeout(() => scrollToCustomTarget(data.scrollTarget), 180);
    setTimeout(() => scrollToCustomTarget(data.scrollTarget), 420);
    return true;
  }

  function handlePreviewClick(event) {
    if (!document.body.classList.contains('preview-mode') || document.body.classList.contains('exported-site')) return;
    const node = event.target?.closest?.('.nav-dropdown-title, .nav-dropdown-option');
    if (!node) return;
    const root = node.closest('.nav-dropdown');
    if (!root) return;
    const target = node.classList.contains('nav-dropdown-title') ? TITLE_KEY : String(node.getAttribute('data-option-index') || '0');
    const action = getAction(root, target);
    if (!previewPageJump(action)) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
  }

  function exportRuntime() {
    return `
(function(){
  if (window.__navDropdownCustomSectionRuntimeV187) return;
  window.__navDropdownCustomSectionRuntimeV187 = true;
  var TITLE_KEY = '__title';
  function qsa(root, selector){ return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }
  function readJSON(el, attr, fallback){ try { var raw = el && el.getAttribute(attr); return raw ? (JSON.parse(raw) || fallback) : fallback; } catch(e){ return fallback; } }
  function cleanId(id){ return String(id || '').replace(/^#/, ''); }
  function encodeId(id){ return encodeURIComponent(cleanId(id)).replace(/%20/g, '+'); }
  function currentFile(){ return String(location.pathname || 'index.html').split('/').pop() || 'index.html'; }
  function pageFile(pageId){
    var maps = [window.PAGE_FILES_V186, window.PAGE_FILES_V161, window.PAGE_FILES_V160, window.PAGE_FILES_V159];
    for (var i = 0; i < maps.length; i++) {
      if (maps[i] && maps[i][String(pageId || '')]) return maps[i][String(pageId || '')];
    }
    return String(pageId || 'index').replace(/[^a-zA-Z0-9_\\-\\u4e00-\\u9fff]/g, '-') + '.html';
  }
  function findTarget(id){ var clean = cleanId(id); if (!clean) return null; var target = document.getElementById(clean); if (target) return target; try { target = document.querySelector('[data-id="' + CSS.escape(clean) + '"], [data-block-id="' + CSS.escape(clean) + '"]'); } catch(e) {} return target || null; }
  function scrollToId(id){ var target = findTarget(id); if (!target) return false; try { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch(e) { target.scrollIntoView(); } return true; }
  function actionFor(root, target){ qsa(root, '.nav-dropdown-option').forEach(function(option, index){ option.setAttribute('data-option-index', String(index)); }); var actions = readJSON(root, 'data-option-actions', {}); if (target === TITLE_KEY) return actions[TITLE_KEY] || null; var option = qsa(root, '.nav-dropdown-option')[parseInt(target, 10) || 0]; var id = option && option.getAttribute('data-option-id'); var byId = readJSON(root, 'data-option-actions-by-id', {}); return (id && byId[id]) || actions[String(target)] || null; }
  function enabled(value){ return value === true || value === 'true' || value === 1 || value === '1'; }
  function run(data){
    if (!data || !data.pageTarget || !data.scrollTarget) return false;
    var hasPageAndScroll = enabled(data.pageEnabled) && enabled(data.scrollEnabled);
    var legacyPageSection = data.actionType === 'page-section' || data.type === 'page-section';
    if (!hasPageAndScroll && !legacyPageSection) return false;
    var file = pageFile(data.pageTarget);
    var hash = encodeId(data.scrollTarget);
    if (currentFile() === file) {
      if (location.hash !== '#' + hash) history.replaceState(null, '', '#' + hash);
      setTimeout(function(){ scrollToId(data.scrollTarget); }, 30);
      return true;
    }
    location.href = file + '#' + hash;
    return true;
  }
  function removeEditorChrome(){
    qsa(document, '.no-export, .move-handle, .element-toolbar, .resize-handle, .editor-actions, .accordion-editor-panel, .carousel-editor-panel, .select-switcher-editor-panel, .vertical-carousel-editor-panel, .vertical-news-editor-panel, .hover-slide-editor-panel, [data-element-action], [data-block-action], [data-resize]').forEach(function(node){ if (node && node.parentNode) node.parentNode.removeChild(node); });
    qsa(document, '[style]').forEach(function(node){
      if (node && node.style) node.style.removeProperty('cursor');
    });
  }
  function installExportChromeGuard(){
    if (document.getElementById('navDropdownExportChromeGuardV187')) return;
    var style = document.createElement('style');
    style.id = 'navDropdownExportChromeGuardV187';
    style.textContent = 'body.exported-site .no-export,body.exported-site .move-handle,body.exported-site .element-toolbar,body.exported-site .resize-handle,body.exported-site .editor-actions,body.exported-site [data-element-action],body.exported-site [data-block-action],body.exported-site [data-resize]{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}html body.exported-site.exported-site,html body.exported-site.exported-site *{cursor:default!important}html body.exported-site .free-element[data-type="shape"],html body.exported-site .free-element[data-type="shape"] *,html body.exported-site .shape-element,html body.exported-site .shape-element *,html body.exported-site svg,html body.exported-site svg *{cursor:default!important}body.exported-site a[href],body.exported-site button,body.exported-site [role="button"],body.exported-site .nav-dropdown-title,body.exported-site .nav-dropdown-option{cursor:pointer!important}body.exported-site .free-element[data-type="shape"] a,body.exported-site .free-element[data-type="shape"] button{cursor:pointer!important}';
    document.head.appendChild(style);
  }
  installExportChromeGuard();
  document.addEventListener('click', function(event){
    var node = event.target.closest && event.target.closest('.nav-dropdown-title, .nav-dropdown-option');
    if (!node) return;
    var root = node.closest && node.closest('.nav-dropdown');
    if (!root) return;
    var target = node.classList.contains('nav-dropdown-title') ? TITLE_KEY : String(node.getAttribute('data-option-index') || '0');
    var data = actionFor(root, target);
    if (!run(data)) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
  }, true);
  function scrollHash(){ if (location.hash) setTimeout(function(){ scrollToId(decodeURIComponent(location.hash.slice(1).replace(/\\+/g, ' '))); }, 160); }
  function boot(){ removeEditorChrome(); scrollHash(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  window.addEventListener('load', boot);
})();`;
  }

  function cleanEditorChromeFromClone(clone) {
    if (!clone || !clone.querySelectorAll) return clone;
    qsa('.no-export, .move-handle, .element-toolbar, .resize-handle, .editor-actions, .accordion-editor-panel, .carousel-editor-panel, .select-switcher-editor-panel, .vertical-carousel-editor-panel, .vertical-news-editor-panel, .hover-slide-editor-panel, [data-element-action], [data-block-action], [data-resize]', clone)
      .forEach(node => node.remove());
    qsa('.selected, .multi-selected, .is-editing, .has-selected-child', clone)
      .forEach(node => node.classList.remove('selected', 'multi-selected', 'is-editing', 'has-selected-child'));
    qsa('[contenteditable], [data-editable-text]', clone).forEach(node => {
      node.removeAttribute('contenteditable');
      node.style.removeProperty('caret-color');
    });
    qsa('[style]', clone).forEach(node => node.style.removeProperty('cursor'));
    return clone;
  }

  function cleanEditorChromeFromHTML(html) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html || '';
    cleanEditorChromeFromClone(wrapper);
    return wrapper.innerHTML;
  }

  function installExportCleaners() {
    if (window.__navDropdownExportCleanersV187) return;
    window.__navDropdownExportCleanersV187 = true;

    if (typeof window.cleanPageCloneForExport === 'function') {
      const previousCleanClone = window.cleanPageCloneForExport;
      const wrappedCleanClone = function(clone) {
        const output = previousCleanClone.call(this, cleanEditorChromeFromClone(clone));
        return cleanEditorChromeFromHTML(output);
      };
      window.cleanPageCloneForExport = wrappedCleanClone;
      try { cleanPageCloneForExport = wrappedCleanClone; } catch (error) {}
    }

    if (typeof window.cleanHTMLForExport === 'function') {
      const previousCleanHTML = window.cleanHTMLForExport;
      const wrappedCleanHTML = function(html) {
        return cleanEditorChromeFromHTML(previousCleanHTML.apply(this, arguments));
      };
      window.cleanHTMLForExport = wrappedCleanHTML;
      try { cleanHTMLForExport = wrappedCleanHTML; } catch (error) {}
    }

    if (typeof window.cleanForExport === 'function') {
      const previousCleanForExport = window.cleanForExport;
      const wrappedCleanForExport = function() {
        return cleanEditorChromeFromHTML(previousCleanForExport.apply(this, arguments));
      };
      window.cleanForExport = wrappedCleanForExport;
      try { cleanForExport = wrappedCleanForExport; } catch (error) {}
    }
  }

  function install() {
    ensureCustomInput();
    syncPanelFromAction();
  }

  document.addEventListener('click', event => {
    if (event.target?.id === 'applyNavDropdownActionV164') applyCustomTargetBeforeSave();
    if (event.target?.closest?.('.nav-dropdown-title, .nav-dropdown-option')) setTimeout(syncPanelFromAction, 80);
  }, true);
  document.addEventListener('change', event => {
    if (event.target?.id === 'navDropdownActionTargetV164' || event.target?.id === 'navDropdownActionTypeV164') setTimeout(syncPanelFromAction, 0);
    if (event.target?.id === 'navDropdownPageTargetV164') setTimeout(() => refreshSectionOptionsForPage(), 0);
  }, true);
  document.addEventListener('input', event => {
    if (event.target?.id === CUSTOM_INPUT_ID) syncSelectFromCustomInput();
  }, true);
  document.addEventListener('click', handlePreviewClick, true);

  if (typeof buildExportJS === 'function' && !window.__navDropdownCustomSectionExportJSWrappedV187) {
    window.__navDropdownCustomSectionExportJSWrappedV187 = true;
    const previousBuildExportJSV187 = buildExportJS;
    buildExportJS = function(exportPagesJSON, currentPageIdJSON) {
      return exportRuntime() + previousBuildExportJSV187.apply(this, arguments);
    };
    window.buildExportJS = buildExportJS;
  }

  if (typeof buildExportCSS === 'function' && !window.__navDropdownExportChromeCSSWrappedV187) {
    window.__navDropdownExportChromeCSSWrappedV187 = true;
    const previousBuildExportCSSV187 = buildExportCSS;
    buildExportCSS = function() {
      return previousBuildExportCSSV187.apply(this, arguments) + `

/* v187: exported site must not show editor move controls. */
body.exported-site .no-export,
body.exported-site .move-handle,
body.exported-site .element-toolbar,
body.exported-site .resize-handle,
body.exported-site .editor-actions,
body.exported-site [data-element-action],
body.exported-site [data-block-action],
body.exported-site [data-resize] {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
}

html body.exported-site.exported-site,
html body.exported-site.exported-site * {
  cursor: default !important;
}

html body.exported-site .free-element[data-type="shape"],
html body.exported-site .free-element[data-type="shape"] *,
html body.exported-site .shape-element,
html body.exported-site .shape-element *,
html body.exported-site svg,
html body.exported-site svg * {
  cursor: default !important;
}

body.exported-site a[href],
body.exported-site button,
body.exported-site [role="button"],
body.exported-site .nav-dropdown-title,
body.exported-site .nav-dropdown-option {
  cursor: pointer !important;
}

body.exported-site .free-element[data-type="shape"] a,
body.exported-site .free-element[data-type="shape"] button {
  cursor: pointer !important;
}
`;
    };
    window.buildExportCSS = buildExportCSS;
  }

  window.addEventListener('load', () => {
    installExportCleaners();
    install();
    setTimeout(install, 200);
  });

  installExportCleaners();
})();
