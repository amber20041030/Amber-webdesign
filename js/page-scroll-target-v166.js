/* v166: add "go to page, then scroll to section" target to all element function settings. */
(function pageScrollTargetV166() {
  if (window.__pageScrollTargetV166) return;
  window.__pageScrollTargetV166 = true;

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

  function getCurrentMode() {
    try {
      return window.currentDeviceMode || currentDeviceMode || 'desktop';
    } catch (error) {
      return 'desktop';
    }
  }

  function getPageHTML(pageId) {
    try {
      const page = pages && pages[pageId];
      if (!page) return '';
      const mode = getCurrentMode();
      return page.responsive?.[mode]?.html || page.responsive?.desktop?.html || page.html || '';
    } catch (error) {
      return '';
    }
  }

  function blockLabel(el) {
    return (
      el.getAttribute('data-name') ||
      el.querySelector?.('.block-label')?.textContent ||
      el.id ||
      '區塊'
    ).trim();
  }

  function sectionEntriesFromHTML(html) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html || '';
    const seen = new Set();
    return qsa('.html-block[id], section[id], header[id], footer[id], nav[id], div[id]', wrapper)
      .map(el => [el.id, blockLabel(el)])
      .filter(([id]) => {
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      });
  }

  function sectionEntriesForPage(pageId) {
    if (!pageId) return [];
    const html = getPageHTML(pageId);
    return sectionEntriesFromHTML(html);
  }

  function ensureElementPanel() {
    if (qs('#goToPageScrollTargetSelect')) return;
    const pageSelect = qs('#goToPageSelect');
    if (!pageSelect) return;

    const wrap = document.createElement('div');
    wrap.id = 'goToPageScrollTargetWrapV166';
    wrap.innerHTML = `
      <label class="simple-label">跳轉分頁後捲到指定區塊</label>
      <select class="form-select form-select-sm mb-3" id="goToPageScrollTargetSelect">
        <option value="">不指定區塊</option>
      </select>
      <div class="small text-muted mb-3">先選上方目標子頁面，這裡會列出該分頁內已設定 ID 的區塊。</div>
    `;
    pageSelect.insertAdjacentElement('afterend', wrap);
    pageSelect.addEventListener('change', () => refreshElementPageScrollTargetOptions());
  }

  function refreshElementPageScrollTargetOptions(preferred = '') {
    ensureElementPanel();
    const select = qs('#goToPageScrollTargetSelect');
    const pageSelect = qs('#goToPageSelect');
    if (!select || !pageSelect) return;

    const pageId = pageSelect.value || '';
    const entries = sectionEntriesForPage(pageId);
    const current = preferred || select.value || '';
    select.innerHTML = '<option value="">不指定區塊</option>' + entries
      .map(([id, label]) => `<option value="${escapeHTML(id)}">${escapeHTML(id)} - ${escapeHTML(label)}</option>`)
      .join('');
    select.value = entries.some(([id]) => id === current) ? current : '';
  }

  function syncElementPanel() {
    if (!window.selectedElement && typeof selectedElement === 'undefined') return;
    const el = window.selectedElement || selectedElement;
    if (!el) return;
    refreshElementPageScrollTargetOptions(el.dataset.cssPageScrollTarget || '');
  }

  function applyElementPageScrollTarget() {
    const el = window.selectedElement || (typeof selectedElement !== 'undefined' ? selectedElement : null);
    if (!el) return;
    const pageEnabled = qs('#goToPageEnabled')?.checked === true;
    const target = qs('#goToPageScrollTargetSelect')?.value || '';
    if (pageEnabled && target) {
      el.dataset.cssPageScrollTarget = target;
    } else {
      el.removeAttribute('data-css-page-scroll-target');
    }
  }

  function scrollToTarget(id) {
    if (!id) return false;
    const target = document.getElementById(id);
    if (!target) return false;
    if (typeof scrollTargetToBlockBottom === 'function') scrollTargetToBlockBottom(target);
    else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return true;
  }

  function handleElementFunctionClickV166(el) {
    if (!el || el.dataset.cssFunctionEnabled !== 'true') return false;
    const pageEnabled = el.dataset.cssPageEnabled === 'true' && el.dataset.cssPageTarget;
    const pageScrollTarget = el.dataset.cssPageScrollTarget || '';
    if (!pageEnabled || !pageScrollTarget) return false;

    if (typeof loadPage === 'function') {
      loadPage(el.dataset.cssPageTarget, true);
      setTimeout(() => scrollToTarget(pageScrollTarget), 140);
      return true;
    }
    return false;
  }

  function patchEditorFunctions() {
    if (typeof syncElementCssFunctionPanel === 'function' && !syncElementCssFunctionPanel.__v166Wrapped) {
      const previous = syncElementCssFunctionPanel;
      syncElementCssFunctionPanel = function () {
        const result = previous.apply(this, arguments);
        syncElementPanel();
        return result;
      };
      syncElementCssFunctionPanel.__v166Wrapped = true;
      window.syncElementCssFunctionPanel = syncElementCssFunctionPanel;
    }

    if (typeof applyElementCssFunction === 'function' && !applyElementCssFunction.__v166Wrapped) {
      const previous = applyElementCssFunction;
      applyElementCssFunction = function () {
        const result = previous.apply(this, arguments);
        applyElementPageScrollTarget();
        return result;
      };
      applyElementCssFunction.__v166Wrapped = true;
      window.applyElementCssFunction = applyElementCssFunction;
    }

    if (typeof handleElementFunctionClick === 'function' && !handleElementFunctionClick.__v166Wrapped) {
      const previous = handleElementFunctionClick;
      handleElementFunctionClick = function (el) {
        if (handleElementFunctionClickV166(el)) return;
        return previous.apply(this, arguments);
      };
      handleElementFunctionClick.__v166Wrapped = true;
      window.handleElementFunctionClick = handleElementFunctionClick;
    }
  }

  function exportRuntime() {
    return `
(function(){
  if (window.__pageScrollTargetRuntimeV166) return;
  window.__pageScrollTargetRuntimeV166 = true;
  function scrollTarget(id){ if (!id) return false; if (typeof scrollToExportTarget === 'function') { scrollToExportTarget(id); return true; } var target = document.getElementById(id); if (!target) return false; try { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch(e) { target.scrollIntoView(); } return true; }
  var previousPageScroll = typeof handlePageAndScroll === 'function' ? handlePageAndScroll : null;
  window.handlePageAndScroll = function(el, event){
    if (!el || el.getAttribute('data-css-function-enabled') !== 'true') return previousPageScroll ? previousPageScroll(el, event) : false;
    var pageId = el.getAttribute('data-css-page-target') || '';
    var pageScrollTarget = el.getAttribute('data-css-page-scroll-target') || '';
    if (el.getAttribute('data-css-page-enabled') === 'true' && pageId && pageScrollTarget && typeof renderExportPage === 'function') {
      if (event) { event.preventDefault(); event.stopPropagation(); }
      renderExportPage(pageId, function(){ setTimeout(function(){ scrollTarget(pageScrollTarget); }, 80); });
      return true;
    }
    return previousPageScroll ? previousPageScroll(el, event) : false;
  };
  try { handlePageAndScroll = window.handlePageAndScroll; } catch(e) {}

  var previousElementFunction = typeof handleElementFunction === 'function' ? handleElementFunction : null;
  window.handleElementFunction = function(el, event){
    if (!el || el.getAttribute('data-css-function-enabled') !== 'true') return previousElementFunction ? previousElementFunction(el, event) : false;
    var pageId = el.getAttribute('data-css-page-target') || '';
    var pageScrollTarget = el.getAttribute('data-css-page-scroll-target') || '';
    if (el.getAttribute('data-css-page-enabled') === 'true' && pageId && pageScrollTarget && typeof renderExportPage === 'function') {
      if (event) { event.preventDefault(); event.stopPropagation(); }
      renderExportPage(pageId, function(){ setTimeout(function(){ scrollTarget(pageScrollTarget); }, 80); });
      return true;
    }
    return previousElementFunction ? previousElementFunction(el, event) : false;
  };
})();`;
  }

  function patchExportJS() {
    if (typeof buildExportJS !== 'function' || buildExportJS.__v166Wrapped) return;
    const previous = buildExportJS;
    buildExportJS = function () {
      return previous.apply(this, arguments) + exportRuntime();
    };
    buildExportJS.__v166Wrapped = true;
    window.buildExportJS = buildExportJS;
  }

  document.addEventListener('change', event => {
    if (event.target?.id === 'goToPageSelect') refreshElementPageScrollTargetOptions();
    if (event.target?.id === 'goToPageEnabled') refreshElementPageScrollTargetOptions();
  }, true);

  document.addEventListener('click', event => {
    if (event.target?.id === 'applyElementCssFunctionBtn') {
      setTimeout(applyElementPageScrollTarget, 0);
    }
  }, true);

  window.addEventListener('load', () => {
    ensureElementPanel();
    patchEditorFunctions();
    patchExportJS();
    syncElementPanel();
  });
})();
