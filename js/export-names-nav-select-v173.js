/* v173: unified export filenames, nav hover color only, select-switcher option click fix. */
(function(){
  'use strict';

  const EDITOR_COUNT_KEY = 'bootstrap-editor-v173-editor-export-count';
  let pendingExportKind = '';

  const CSS_V173 = `
/* v173: nav dropdown hover changes title only; it no longer opens the menu on mouse hover. */
.nav-dropdown[data-nav-style-mode="hover-title"]:hover .nav-dropdown-title,
.nav-dropdown[data-dropdown-style-mode="hover-title"]:hover .nav-dropdown-title {
  color: var(--nav-option-hover-text, #0b3557) !important;
}

.nav-dropdown[data-nav-style-mode="hover-title"] .nav-dropdown-menu,
.nav-dropdown[data-dropdown-style-mode="hover-title"] .nav-dropdown-menu {
  background: var(--nav-menu-bg, #ffffff) !important;
  filter: none !important;
}

.nav-dropdown[data-nav-style-mode="hover-title"] .nav-dropdown-option,
.nav-dropdown[data-dropdown-style-mode="hover-title"] .nav-dropdown-option {
  background: var(--nav-option-bg, transparent) !important;
  color: var(--nav-option-text, #333333) !important;
  filter: none !important;
}

.nav-dropdown[data-nav-style-mode="hover-title"] .nav-dropdown-option:hover,
.nav-dropdown[data-dropdown-style-mode="hover-title"] .nav-dropdown-option:hover,
.nav-dropdown[data-nav-style-mode="hover-title"] .nav-dropdown-option:focus,
.nav-dropdown[data-dropdown-style-mode="hover-title"] .nav-dropdown-option:focus {
  background: var(--nav-option-hover-bg, var(--nav-option-bg, transparent)) !important;
  color: var(--nav-option-text, #333333) !important;
  filter: none !important;
}

/* v178: keep the dropdown title text still while the icon changes state. */
.nav-dropdown .nav-dropdown-title {
  position: relative !important;
  padding-right: calc(var(--dropdown-icon-size, 18px) + 18px) !important;
}

.nav-dropdown[data-dropdown-icon-visible="false"] .nav-dropdown-title,
.nav-dropdown[data-dropdown-icon-style="none"] .nav-dropdown-title {
  padding-right: inherit !important;
}

.nav-dropdown .nav-dropdown-title::after {
  position: absolute !important;
  right: 12px !important;
  top: 50% !important;
  margin: 0 !important;
  transform: translateY(-50%) !important;
}

.nav-dropdown[data-dropdown-icon-style="triangle-line"]:hover .nav-dropdown-title::after,
.nav-dropdown[data-dropdown-icon-style="triangle-line"].dropdown-open .nav-dropdown-title::after,
.nav-dropdown[data-dropdown-icon-style="triangle-line"].menu-open .nav-dropdown-title::after {
  width: calc(var(--dropdown-icon-size, 18px) * .62) !important;
  height: max(2px, calc(var(--dropdown-icon-size, 18px) * .1)) !important;
  min-height: 2px !important;
}

body.nav-dropdown-settings-clean-v177 #selectTitleStyleSectionV122,
body.nav-dropdown-settings-clean-v177 #selectContentTextStylePanel,
body.nav-dropdown-settings-clean-v177 #selectOptionBodyBgColor,
body.nav-dropdown-settings-clean-v177 label[for="selectOptionBodyBgColor"],
body.nav-dropdown-settings-clean-v177 #selectOptionBodyBgOpacity,
body.nav-dropdown-settings-clean-v177 #selectOptionBodyBgOpacity + .px-input-row,
body.nav-dropdown-settings-clean-v177 label[for="selectOptionBodyBgOpacity"],
body.nav-dropdown-settings-clean-v177 #selectMenuRadius,
body.nav-dropdown-settings-clean-v177 #selectMenuRadius + .px-input-row,
body.nav-dropdown-settings-clean-v177 label[for="selectMenuRadius"],
body.nav-dropdown-settings-clean-v177 #selectOptionBodyMaterial,
body.nav-dropdown-settings-clean-v177 label[for="selectOptionBodyMaterial"] {
  display: none !important;
}

.nav-dropdown[data-nav-style-mode="hover-title"]:hover .nav-dropdown-menu,
.nav-dropdown[data-dropdown-style-mode="hover-title"]:hover .nav-dropdown-menu,
.nav-dropdown[data-nav-style-mode="hover-title"].menu-open .nav-dropdown-menu,
.nav-dropdown[data-dropdown-style-mode="hover-title"].menu-open .nav-dropdown-menu,
.nav-dropdown[data-nav-style-mode="hover-title"].dropdown-open .nav-dropdown-menu,
.nav-dropdown[data-dropdown-style-mode="hover-title"].dropdown-open .nav-dropdown-menu {
  opacity: 0 !important;
  visibility: hidden !important;
  transform: translateY(-6px) !important;
  pointer-events: none !important;
}

.nav-dropdown[data-nav-style-mode="vertical-list"] .nav-dropdown-menu,
.nav-dropdown[data-dropdown-style-mode="vertical-list"] .nav-dropdown-menu,
.nav-dropdown[data-nav-style-mode="v78"].dropdown-open .nav-dropdown-menu,
.nav-dropdown[data-dropdown-style-mode="v78"].dropdown-open .nav-dropdown-menu,
.nav-dropdown[data-nav-style-mode="v78"].menu-open .nav-dropdown-menu,
.nav-dropdown[data-dropdown-style-mode="v78"].menu-open .nav-dropdown-menu {
  opacity: 1 !important;
  visibility: visible !important;
  transform: translateY(0) !important;
  pointer-events: auto !important;
}

.select-switcher-select-element.select-switcher-closing-v174 .editable-select-menu,
.free-element[data-type="select"].select-switcher-closing-v174[data-dropdown-style-mode="hover-title"]:hover .editable-select-menu,
.free-element[data-type="select"].select-switcher-closing-v174.select-hover-open-v127[data-dropdown-style-mode="hover-title"] .editable-select-menu,
.free-element[data-type="select"].select-switcher-closing-v174.dropdown-open .editable-select-menu,
.free-element[data-type="select"].select-switcher-closing-v174.menu-open .editable-select-menu,
.js-css-select-switcher .select-switcher-select-element.select-switcher-closing-v174 .editable-select-menu {
  opacity: 0 !important;
  visibility: hidden !important;
  transform: translateY(-6px) !important;
  pointer-events: none !important;
}`;

  function injectCSS() {
    let style = document.getElementById('patchV173ExportNamesNavSelect');
    if (!style) {
      style = document.createElement('style');
      style.id = 'patchV173ExportNamesNavSelect';
      document.head.appendChild(style);
    }
    style.textContent = CSS_V173;
  }

  function nextEditorName() {
    let count = 0;
    try {
      count = parseInt(localStorage.getItem(EDITOR_COUNT_KEY) || '0', 10) || 0;
      count += 1;
      localStorage.setItem(EDITOR_COUNT_KEY, String(count));
    } catch (error) {
      count = 1;
    }
    return 'editor' + count + '.zip';
  }

  function installExportFilenamePatch() {
    if (HTMLAnchorElement.prototype.__exportNamePatchV173) return;
    HTMLAnchorElement.prototype.__exportNamePatchV173 = true;

    const originalClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function(){
      const rawDownload = this.getAttribute('download') || this.download || '';
      const looksLikeZip = /\.zip$/i.test(rawDownload) || /^blob:/i.test(this.href || '');

      if (looksLikeZip && pendingExportKind === 'editor') {
        this.download = nextEditorName();
        pendingExportKind = '';
      } else if (looksLikeZip && pendingExportKind === 'site') {
        this.download = 'demo-site.zip';
        pendingExportKind = '';
      } else if (/editor-backup|full-editor|backup/i.test(rawDownload)) {
        this.download = nextEditorName();
      } else if (/custom-website|preview-export|root-pages|index-only/i.test(rawDownload)) {
        this.download = 'demo-site.zip';
      }

      return originalClick.apply(this, arguments);
    };

    document.addEventListener('click', function(event){
      const editorBtn = event.target.closest && event.target.closest('#exportEditorBackupBtn');
      const siteBtn = event.target.closest && event.target.closest('#exportBtn, #exportHtmlBtn, #exportRootHtmlBtn, [data-export], [data-action="export"]');
      if (editorBtn) pendingExportKind = 'editor';
      else if (siteBtn) pendingExportKind = 'site';
    }, true);

    installEditorBackupExtraFilesPatch();
  }

  function installEditorBackupExtraFilesPatch() {
    if (typeof JSZip === 'undefined' || !JSZip.prototype || JSZip.prototype.__editorBackupExtraFilesV173) return;
    JSZip.prototype.__editorBackupExtraFilesV173 = true;

    const extraFiles = [
      'js/nav-dropdown-action-ui-v164.js',
      'js/page-scroll-target-v166.js',
      'js/fixed-layout-scale-v167.js',
      'js/font-lock-v170.js',
      'js/accordion-export-all-items-v171.js',
      'js/accordion-video-16x9-v172.js',
      'js/export-names-nav-select-v173.js'
    ];

    async function fetchText(path) {
      try {
        const response = await fetch(new URL(path, document.baseURI || window.location.href).href, { cache: 'no-store' });
        return response.ok ? await response.text() : '';
      } catch (error) {
        return '';
      }
    }

    const originalGenerateAsync = JSZip.prototype.generateAsync;
    JSZip.prototype.generateAsync = async function() {
      if (pendingExportKind === 'editor') {
        for (const path of extraFiles) {
          if (this.file(path)) continue;
          const text = await fetchText('./' + path);
          if (text) this.file(path, text);
        }
      }
      return originalGenerateAsync.apply(this, arguments);
    };
  }

  function navMode(root) {
    return root?.getAttribute('data-nav-style-mode') || root?.getAttribute('data-dropdown-style-mode') || 'hover-title';
  }

  function closeHoverNav(root) {
    if (!root || navMode(root) !== 'hover-title') return;
    root.classList.remove('menu-open', 'dropdown-open');
  }

  function currentSelectedElement() {
    try {
      return (typeof selectedElement !== 'undefined') ? selectedElement : null;
    } catch (error) {
      return null;
    }
  }

  function fieldRow(id) {
    const node = document.getElementById(id);
    if (!node) return [];
    const rows = [node];
    const prev = node.previousElementSibling;
    if (prev && prev.classList?.contains('simple-label')) rows.push(prev);
    const next = node.nextElementSibling;
    if (next && next.classList?.contains('px-input-row')) rows.push(next);
    return rows;
  }

  function setRowsHidden(ids, hidden) {
    ids.flatMap(fieldRow).forEach(node => {
      node.classList.toggle('d-none', hidden);
      node.toggleAttribute('hidden', hidden);
    });
  }

  function cleanNavDropdownSettingsPanel() {
    const isNav = currentSelectedElement()?.dataset?.type === 'nav-dropdown';
    document.body.classList.toggle('nav-dropdown-settings-clean-v177', !!isNav);

    setRowsHidden([
      'selectOptionBodyBgColor',
      'selectOptionBodyBgOpacity',
      'selectMenuRadius',
      'selectOptionBodyMaterial',
      'selectContentTextSize',
      'selectContentTextColor',
      'selectContentTextHoverColor',
      'selectContentTextWeight',
      'selectContentTextLineHeight',
      'selectContentTextLetterSpacing',
      'selectContentTextAlign'
    ], !!isNav);

    if (isNav) {
      const hoverText = document.getElementById('navDropdownOptionHoverTextColor');
      const label = hoverText?.previousElementSibling;
      if (label?.classList?.contains('simple-label')) label.textContent = '標題 hover 文字顏色';
    }
  }

  function installNavHoverPatch() {
    if (document.__navHoverTitleOnlyV173) return;
    document.__navHoverTitleOnlyV173 = true;

    ['mouseenter', 'mouseover', 'pointerenter', 'pointerover'].forEach(type => {
      document.addEventListener(type, function(event){
        const root = event.target.closest && event.target.closest('.nav-dropdown');
        if (root) setTimeout(function(){ closeHoverNav(root); }, 0);
      }, true);
    });

    document.addEventListener('click', function(event){
      const root = event.target.closest && event.target.closest('.nav-dropdown[data-nav-style-mode="hover-title"], .nav-dropdown[data-dropdown-style-mode="hover-title"]');
      if (root) setTimeout(function(){ closeHoverNav(root); }, 0);
    }, true);
  }

  function installNavSettingsCleanup() {
    if (document.__navSettingsCleanupV177) return;
    document.__navSettingsCleanupV177 = true;

    document.addEventListener('click', () => setTimeout(cleanNavDropdownSettingsPanel, 0), true);
    document.addEventListener('change', () => setTimeout(cleanNavDropdownSettingsPanel, 0), true);
    document.addEventListener('input', () => setTimeout(cleanNavDropdownSettingsPanel, 0), true);
    setInterval(cleanNavDropdownSettingsPanel, 500);
    cleanNavDropdownSettingsPanel();
  }

  function qsa(root, selector) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function selectSwitcherGroups(block) {
    return qsa(block, '.select-switcher-group');
  }

  function syncSwitcherTitle(select, index) {
    const combo = select && select.closest && select.closest('.editable-select-combo');
    if (!combo) return;

    const selected = select.options && (select.options[index] || select.options[select.selectedIndex] || select.options[0]);
    const span = combo.querySelector('.editable-select-title span');
    if (span) span.textContent = selected ? (selected.textContent || '') : '';

    qsa(combo, '.editable-select-option').forEach(option => {
      option.classList.toggle('is-active', String(option.getAttribute('data-option-index') || '0') === String(index));
    });
  }

  function setSwitcher(block, index) {
    if (!block) return false;

    const groups = selectSwitcherGroups(block);
    if (!groups.length) return false;

    index = Math.max(0, Math.min(parseInt(index, 10) || 0, groups.length - 1));
    block.dataset.switcherIndex = String(index);

    groups.forEach((group, groupIndex) => {
      group.classList.toggle('active', groupIndex === index);
      group.dataset.switcherGroup = String(groupIndex);
    });

    const select = block.querySelector('.select-switcher-control');
    if (select) {
      select.selectedIndex = index;
      if (select.options && select.options[index]) select.value = select.options[index].value;
      else select.value = String(index);
      syncSwitcherTitle(select, index);
    }

    const info = block.querySelector('.select-switcher-info');
    if (info) info.textContent = (index + 1) + ' / ' + groups.length;

    try {
      if (typeof window.setSelectSwitcherIndex === 'function') window.setSelectSwitcherIndex(block, index);
    } catch (error) {}

    return true;
  }

  function visibleOptionFromPoint(x, y) {
    const controls = qsa(document, '.select-switcher-select-element[data-select-switcher-control="true"]')
      .filter(control => {
        return control.classList.contains('dropdown-open') ||
          control.classList.contains('menu-open') ||
          control.classList.contains('select-hover-open-v127') ||
          control.matches?.(':hover') ||
          control.matches?.(':focus-within');
      })
      .sort((a, b) => {
        const za = parseInt(window.getComputedStyle(a).zIndex || a.style.zIndex || '0', 10) || 0;
        const zb = parseInt(window.getComputedStyle(b).zIndex || b.style.zIndex || '0', 10) || 0;
        return zb - za;
      });

    for (const control of controls) {
      const options = qsa(control, '.editable-select-option');
      for (let i = options.length - 1; i >= 0; i -= 1) {
        const option = options[i];
        const rect = option.getBoundingClientRect();
        const style = window.getComputedStyle(option);
        const visible = rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && style.pointerEvents !== 'none';
        if (visible && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) return option;
      }
    }

    return null;
  }

  function optionFromEvent(event) {
    return event.target.closest?.('.select-switcher-select-element[data-select-switcher-control="true"] .editable-select-option') ||
      (typeof event.clientX === 'number' ? visibleOptionFromPoint(event.clientX, event.clientY) : null);
  }

  function closeSwitcherControl(control) {
    if (!control) return;
    control.classList.remove('dropdown-open', 'menu-open', 'select-hover-open-v127');
    control.classList.add('select-switcher-closing-v174');
    control.dataset.switcherKeepClosedV175 = 'true';
    control.querySelector('.select-switcher-control')?.blur?.();
    control.querySelector('.editable-select-title')?.blur?.();
  }

  function pointInsideControl(control, event) {
    if (!control || typeof event.clientX !== 'number' || typeof event.clientY !== 'number') return false;
    const rect = control.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 &&
      event.clientX >= rect.left && event.clientX <= rect.right &&
      event.clientY >= rect.top && event.clientY <= rect.bottom;
  }

  function releaseSwitcherControl(control) {
    if (!control) return;
    control.classList.remove('select-switcher-closing-v174');
    delete control.dataset.switcherKeepClosedV175;
  }

  function enforceClosedSwitchers(event) {
    qsa(document, '.select-switcher-select-element[data-select-switcher-control="true"][data-switcher-keep-closed-v175="true"]').forEach(control => {
      if (pointInsideControl(control, event)) {
        control.classList.remove('dropdown-open', 'menu-open', 'select-hover-open-v127');
        control.querySelector('.select-switcher-control')?.blur?.();
        control.querySelector('.editable-select-title')?.blur?.();
      } else {
        releaseSwitcherControl(control);
      }
    });
  }

  function installSwitcherCloseReset() {
    ['pointermove', 'mousemove', 'pointerover', 'mouseover'].forEach(type => {
      document.addEventListener(type, enforceClosedSwitchers, true);
    });

    document.addEventListener('pointerout', function(event){
      const control = event.target.closest && event.target.closest('.select-switcher-select-element[data-select-switcher-control="true"]');
      if (!control || control.contains(event.relatedTarget)) return;
      releaseSwitcherControl(control);
    }, true);

    document.addEventListener('pointerdown', function(event){
      const title = event.target.closest && event.target.closest('.select-switcher-select-element[data-select-switcher-control="true"] .editable-select-title');
      if (title) releaseSwitcherControl(title.closest('.select-switcher-select-element'));
    }, true);
  }

  function handleSwitcherOption(event) {
    const option = optionFromEvent(event);
    if (!option) return;

    const block = option.closest('.js-css-select-switcher');
    if (!block) return;

    const index = parseInt(option.getAttribute('data-option-index') || '0', 10) || 0;
    if (!setSwitcher(block, index)) return;

    const control = option.closest('.select-switcher-select-element');
    closeSwitcherControl(control);

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }

  function installSelectSwitcherPatch() {
    if (document.__selectSwitcherOptionPatchV173) return;
    document.__selectSwitcherOptionPatchV173 = true;

    installSwitcherCloseReset();
    window.addEventListener('pointerdown', handleSwitcherOption, true);
    window.addEventListener('pointerup', handleSwitcherOption, true);
    window.addEventListener('click', handleSwitcherOption, true);
    window.addEventListener('change', function(event){
      const select = event.target.closest && event.target.closest('.select-switcher-control');
      if (!select) return;
      const index = select.selectedIndex >= 0 ? select.selectedIndex : parseInt(select.value || '0', 10) || 0;
      setSwitcher(select.closest('.js-css-select-switcher'), index);
      closeSwitcherControl(select.closest('.select-switcher-select-element'));
    }, true);
  }

  function wrapExportBuilders() {
    if (typeof window.buildExportCSS === 'function' && !window.buildExportCSS.__v173ExportNamesNavSelect) {
      const previousBuildExportCSS = window.buildExportCSS;
      window.buildExportCSS = function() {
        return previousBuildExportCSS.apply(this, arguments) + '\n' + CSS_V173 + '\n';
      };
      window.buildExportCSS.__v173ExportNamesNavSelect = true;
      try { buildExportCSS = window.buildExportCSS; } catch (error) {}
    }

    if (typeof window.buildExportJS === 'function' && !window.buildExportJS.__v173ExportNamesNavSelect) {
      const previousBuildExportJS = window.buildExportJS;
      window.buildExportJS = function(exportPagesJSON, currentPageIdJSON) {
        return previousBuildExportJS.apply(this, arguments) + `

/* v173: exported nav hover + select-switcher option click fix */
(function(){
  if (window.__v173ExportNavSelectFix) return;
  window.__v173ExportNavSelectFix = true;
  function qsa(root, selector){ return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }
  function navMode(root){ return root && (root.getAttribute('data-nav-style-mode') || root.getAttribute('data-dropdown-style-mode') || 'hover-title'); }
  function closeHoverNav(root){ if (root && navMode(root) === 'hover-title') root.classList.remove('menu-open', 'dropdown-open'); }
  ['mouseenter','mouseover','pointerenter','pointerover','click'].forEach(function(type){
    document.addEventListener(type, function(event){
      var root = event.target.closest && event.target.closest('.nav-dropdown');
      if (root) setTimeout(function(){ closeHoverNav(root); }, 0);
    }, true);
  });
  function groups(block){ return qsa(block, '.select-switcher-group'); }
  function syncTitle(select, index){ var combo = select && select.closest && select.closest('.editable-select-combo'); if (!combo) return; var selected = select.options && (select.options[index] || select.options[select.selectedIndex] || select.options[0]); var span = combo.querySelector('.editable-select-title span'); if (span) span.textContent = selected ? (selected.textContent || '') : ''; qsa(combo, '.editable-select-option').forEach(function(option){ option.classList.toggle('is-active', String(option.getAttribute('data-option-index') || '0') === String(index)); }); }
  function setSwitcher(block, index){ if (!block) return false; var all = groups(block); if (!all.length) return false; index = Math.max(0, Math.min(parseInt(index,10) || 0, all.length - 1)); block.setAttribute('data-switcher-index', String(index)); all.forEach(function(group, groupIndex){ group.classList.toggle('active', groupIndex === index); group.setAttribute('data-switcher-group', String(groupIndex)); }); var select = block.querySelector('.select-switcher-control'); if (select) { select.selectedIndex = index; if (select.options && select.options[index]) select.value = select.options[index].value; else select.value = String(index); syncTitle(select, index); } var info = block.querySelector('.select-switcher-info'); if (info) info.textContent = (index + 1) + ' / ' + all.length; return true; }
  function visibleOptionFromPoint(x, y){ var controls = qsa(document, '.select-switcher-select-element[data-select-switcher-control="true"]').filter(function(control){ return control.classList.contains('dropdown-open') || control.classList.contains('menu-open') || control.classList.contains('select-hover-open-v127') || (control.matches && (control.matches(':hover') || control.matches(':focus-within'))); }); for (var c=0; c<controls.length; c++){ var options = qsa(controls[c], '.editable-select-option'); for (var i=options.length - 1; i>=0; i--){ var option = options[i]; var rect = option.getBoundingClientRect(); var style = window.getComputedStyle(option); if (rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && style.pointerEvents !== 'none' && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) return option; } } return null; }
  function optionFromEvent(event){ return (event.target.closest && event.target.closest('.select-switcher-select-element[data-select-switcher-control="true"] .editable-select-option')) || (typeof event.clientX === 'number' ? visibleOptionFromPoint(event.clientX, event.clientY) : null); }
  function closeControl(control){ if (!control) return; control.classList.remove('dropdown-open', 'menu-open', 'select-hover-open-v127'); control.classList.add('select-switcher-closing-v174'); control.setAttribute('data-switcher-keep-closed-v175', 'true'); var select = control.querySelector('.select-switcher-control'); var title = control.querySelector('.editable-select-title'); if (select && select.blur) select.blur(); if (title && title.blur) title.blur(); }
  function pointInside(control, event){ if (!control || typeof event.clientX !== 'number' || typeof event.clientY !== 'number') return false; var rect = control.getBoundingClientRect(); return rect.width > 0 && rect.height > 0 && event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom; }
  function releaseControl(control){ if (!control) return; control.classList.remove('select-switcher-closing-v174'); control.removeAttribute('data-switcher-keep-closed-v175'); }
  function enforceClosed(event){ qsa(document, '.select-switcher-select-element[data-select-switcher-control="true"][data-switcher-keep-closed-v175="true"]').forEach(function(control){ if (pointInside(control, event)) { control.classList.remove('dropdown-open', 'menu-open', 'select-hover-open-v127'); var select = control.querySelector('.select-switcher-control'); var title = control.querySelector('.editable-select-title'); if (select && select.blur) select.blur(); if (title && title.blur) title.blur(); } else { releaseControl(control); } }); }
  ['pointermove','mousemove','pointerover','mouseover'].forEach(function(type){ document.addEventListener(type, enforceClosed, true); });
  document.addEventListener('pointerout', function(event){ var control = event.target.closest && event.target.closest('.select-switcher-select-element[data-select-switcher-control="true"]'); if (!control || control.contains(event.relatedTarget)) return; releaseControl(control); }, true);
  document.addEventListener('pointerdown', function(event){ var title = event.target.closest && event.target.closest('.select-switcher-select-element[data-select-switcher-control="true"] .editable-select-title'); if (title) releaseControl(title.closest('.select-switcher-select-element')); }, true);
  function handle(event){ var option = optionFromEvent(event); if (!option) return; var block = option.closest && option.closest('.js-css-select-switcher'); if (!block) return; if (!setSwitcher(block, option.getAttribute('data-option-index') || '0')) return; closeControl(option.closest('.select-switcher-select-element')); event.preventDefault && event.preventDefault(); event.stopPropagation && event.stopPropagation(); event.stopImmediatePropagation && event.stopImmediatePropagation(); }
  window.addEventListener('pointerdown', handle, true);
  window.addEventListener('pointerup', handle, true);
  window.addEventListener('click', handle, true);
  window.addEventListener('change', function(event){ var select = event.target.closest && event.target.closest('.select-switcher-control'); if (!select) return; setSwitcher(select.closest('.js-css-select-switcher'), select.selectedIndex >= 0 ? select.selectedIndex : (select.value || '0')); closeControl(select.closest('.select-switcher-select-element')); }, true);
})();`;
      };
      window.buildExportJS.__v173ExportNamesNavSelect = true;
      try { buildExportJS = window.buildExportJS; } catch (error) {}
    }
  }

  function boot() {
    injectCSS();
    installExportFilenamePatch();
    installNavHoverPatch();
    installNavSettingsCleanup();
    installSelectSwitcherPatch();
    wrapExportBuilders();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
