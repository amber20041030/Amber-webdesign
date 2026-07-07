/* v164: visible editor UI for nav-dropdown title/option page + section actions. */
(function navDropdownActionUIV164() {
  if (window.__navDropdownActionUIV164) return;
  window.__navDropdownActionUIV164 = true;

  const TITLE_KEY = '__title';
  const SELECTED_CLASS = 'nav-option-edit-selected';
  let selectedNavRoot = null;
  let selectedTarget = TITLE_KEY;

  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
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

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, match => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    })[match]);
  }

  function isPreviewLike() {
    return document.body.classList.contains('preview-mode') || document.body.classList.contains('exported-site');
  }

  function normalizeNav(root) {
    if (!root || root.dataset?.type !== 'nav-dropdown') return;
    const ids = readJSON(root, 'data-option-ids', []);
    const beforeIds = JSON.stringify(ids);
    qsa('.nav-dropdown-option', root).forEach((option, index) => {
      if (option.type !== 'button') option.type = 'button';
      if (option.dataset.optionIndex !== String(index)) option.dataset.optionIndex = String(index);
      if (!option.dataset.optionId) {
        option.dataset.optionId = ids[index] || 'navopt-' + Date.now().toString(36) + '-' + index;
      }
      ids[index] = option.dataset.optionId;
    });
    const nextIds = ids.slice(0, qsa('.nav-dropdown-option', root).length);
    const nextIdsText = JSON.stringify(nextIds);
    if (beforeIds !== nextIdsText || root.getAttribute('data-option-ids') !== nextIdsText) {
      root.setAttribute('data-option-ids', nextIdsText);
    }
    if (!root.getAttribute('data-option-actions')) writeJSON(root, 'data-option-actions', {});
  }

  function getTargetLabel(root, target) {
    if (target === TITLE_KEY) {
      return '標題：' + ((qs('.nav-dropdown-title', root)?.textContent || '').trim() || '標題');
    }
    const option = qs(`.nav-dropdown-option[data-option-index="${CSS.escape(String(target))}"]`, root);
    return '選項：' + ((option?.textContent || '').trim() || ('選項 ' + (Number(target) + 1)));
  }

  function getActions(root) {
    return readJSON(root, 'data-option-actions', {});
  }

  function setActions(root, actions) {
    writeJSON(root, 'data-option-actions', actions);
    try {
      if (typeof scheduleAutoSave === 'function') scheduleAutoSave();
    } catch (error) {}
  }

  function getAction(root, target) {
    normalizeNav(root);
    const actions = getActions(root);
    if (target === TITLE_KEY) return actions[TITLE_KEY] || {};
    const option = qs(`.nav-dropdown-option[data-option-index="${CSS.escape(String(target))}"]`, root);
    const id = option?.dataset?.optionId || '';
    const byId = readJSON(root, 'data-option-actions-by-id', {});
    return (id && byId[id]) || actions[String(target)] || {};
  }

  function setAction(root, target, action) {
    normalizeNav(root);
    const actions = getActions(root);
    if (target === TITLE_KEY) {
      actions[TITLE_KEY] = action;
    } else {
      actions[String(target)] = action;
      const option = qs(`.nav-dropdown-option[data-option-index="${CSS.escape(String(target))}"]`, root);
      const id = option?.dataset?.optionId || '';
      if (id) {
        const byId = readJSON(root, 'data-option-actions-by-id', {});
        byId[id] = Object.assign({}, action, { itemId: id });
        writeJSON(root, 'data-option-actions-by-id', byId);
      }
    }
    setActions(root, actions);
  }

  function clearMarks() {
    qsa('.nav-dropdown-title.' + SELECTED_CLASS + ', .nav-dropdown-option.' + SELECTED_CLASS)
      .forEach(node => node.classList.remove(SELECTED_CLASS));
    qsa('.nav-dropdown[data-option-picker-open="true"]')
      .forEach(root => delete root.dataset.optionPickerOpen);
  }

  function markTarget(root, target) {
    clearMarks();
    if (!root) return;
    root.dataset.optionPickerOpen = 'true';
    if (target === TITLE_KEY) {
      qs('.nav-dropdown-title', root)?.classList.add(SELECTED_CLASS);
    } else {
      qs(`.nav-dropdown-option[data-option-index="${CSS.escape(String(target))}"]`, root)?.classList.add(SELECTED_CLASS);
    }
  }

  function ensurePanel() {
    if (qs('#navDropdownActionCardV164')) return qs('#navDropdownActionCardV164');
    const inspector = qs('.editor-inspector');
    if (!inspector) return null;

    const card = document.createElement('div');
    card.className = 'setting-card d-none';
    card.id = 'navDropdownActionCardV164';
    card.innerHTML = `
      <div class="setting-title">下拉導覽跳轉設定</div>
      <div class="small text-muted mb-2">點標題或下拉選項後，在這裡設定跳分頁或跳區塊。預覽與匯出會使用同一份設定。</div>

      <label class="simple-label">目前設定目標</label>
      <select class="form-select form-select-sm mb-3" id="navDropdownActionTargetV164"></select>

      <label class="simple-label">跳轉動作</label>
      <select class="form-select form-select-sm mb-3" id="navDropdownActionTypeV164">
        <option value="none">不跳轉</option>
        <option value="page">跳到分頁</option>
        <option value="section">跳到本頁區塊</option>
        <option value="page-section">跳到分頁後捲到區塊</option>
        <option value="link">外部連結 / 錨點</option>
      </select>

      <div id="navDropdownPageWrapV164">
        <label class="simple-label">目標分頁</label>
        <select class="form-select form-select-sm mb-3" id="navDropdownPageTargetV164"></select>
      </div>

      <div id="navDropdownSectionWrapV164">
        <label class="simple-label">目標區塊 ID</label>
        <select class="form-select form-select-sm mb-3" id="navDropdownSectionTargetV164"></select>
      </div>

      <div id="navDropdownLinkWrapV164">
        <label class="simple-label">連結網址 / #區塊ID</label>
        <input type="text" class="form-control form-control-sm mb-3" id="navDropdownLinkTargetV164" placeholder="https://... 或 #about-us">
      </div>

      <button type="button" class="btn btn-outline-primary btn-sm w-100" id="applyNavDropdownActionV164">套用此跳轉設定</button>
    `;

    const firstCard = inspector.querySelector('.setting-card');
    if (firstCard) firstCard.insertAdjacentElement('afterend', card);
    else inspector.prepend(card);

    qs('#navDropdownActionTargetV164')?.addEventListener('change', event => {
      selectedTarget = event.target.value || TITLE_KEY;
      markTarget(selectedNavRoot, selectedTarget);
      syncPanel();
    });
    qs('#navDropdownActionTypeV164')?.addEventListener('change', syncVisibility);
    qs('#applyNavDropdownActionV164')?.addEventListener('click', applyPanel);
    return card;
  }

  function pageEntries() {
    try {
      if (typeof pages === 'object' && pages) {
        return Object.entries(pages).map(([id, page]) => [id, page?.name || id]);
      }
    } catch (error) {}
    return [];
  }

  function sectionEntries() {
    const root = qs('#sitePage') || document;
    const seen = new Set();
    return qsa('[id]', root)
      .map(el => [el.id, el.dataset?.name || el.getAttribute('data-name') || el.id])
      .filter(([id]) => {
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      });
  }

  function fillTargetOptions() {
    const select = qs('#navDropdownActionTargetV164');
    if (!select || !selectedNavRoot) return;
    normalizeNav(selectedNavRoot);
    const current = selectedTarget || TITLE_KEY;
    const title = (qs('.nav-dropdown-title', selectedNavRoot)?.textContent || '').trim() || '標題';
    let html = `<option value="${TITLE_KEY}">標題：${escapeHTML(title)}</option>`;
    qsa('.nav-dropdown-option', selectedNavRoot).forEach((option, index) => {
      const label = (option.textContent || '').trim() || ('選項 ' + (index + 1));
      html += `<option value="${index}">選項 ${index + 1}：${escapeHTML(label)}</option>`;
    });
    select.innerHTML = html;
    select.value = [...select.options].some(option => option.value === current) ? current : TITLE_KEY;
    selectedTarget = select.value;
  }

  function fillPageOptions(value = '') {
    const select = qs('#navDropdownPageTargetV164');
    if (!select) return;
    const entries = pageEntries();
    select.innerHTML = '<option value="">選擇分頁</option>' + entries
      .map(([id, name]) => `<option value="${escapeHTML(id)}">${escapeHTML(name)}</option>`)
      .join('');
    select.value = entries.some(([id]) => id === value) ? value : '';
  }

  function fillSectionOptions(value = '') {
    const select = qs('#navDropdownSectionTargetV164');
    if (!select) return;
    const entries = sectionEntries();
    select.innerHTML = '<option value="">選擇區塊 ID</option>' + entries
      .map(([id, name]) => `<option value="${escapeHTML(id)}">${escapeHTML(id)} - ${escapeHTML(name)}</option>`)
      .join('');
    select.value = entries.some(([id]) => id === value) ? value : '';
  }

  function actionType(data) {
    if (data?.linkEnabled && data.linkUrl) return 'link';
    if (data?.functionEnabled && data.pageEnabled && data.scrollEnabled) return 'page-section';
    if (data?.functionEnabled && data.pageEnabled) return 'page';
    if (data?.functionEnabled && data.scrollEnabled) return 'section';
    return 'none';
  }

  function syncVisibility() {
    const type = qs('#navDropdownActionTypeV164')?.value || 'none';
    qs('#navDropdownPageWrapV164')?.classList.toggle('d-none', !(type === 'page' || type === 'page-section'));
    qs('#navDropdownSectionWrapV164')?.classList.toggle('d-none', !(type === 'section' || type === 'page-section'));
    qs('#navDropdownLinkWrapV164')?.classList.toggle('d-none', type !== 'link');
  }

  function syncPanel() {
    const card = ensurePanel();
    if (!card) return;
    const isNav = !!selectedNavRoot;
    card.classList.toggle('d-none', !isNav);
    if (!isNav) return;

    fillTargetOptions();
    const data = getAction(selectedNavRoot, selectedTarget);
    const type = actionType(data);
    qs('#navDropdownActionTypeV164').value = type;
    fillPageOptions(data.pageTarget || '');
    fillSectionOptions(data.scrollTarget || '');
    if (qs('#navDropdownLinkTargetV164')) qs('#navDropdownLinkTargetV164').value = data.linkUrl || '';
    syncVisibility();
  }

  function applyPanel() {
    if (!selectedNavRoot) return;
    const type = qs('#navDropdownActionTypeV164')?.value || 'none';
    const pageTarget = qs('#navDropdownPageTargetV164')?.value || '';
    const scrollTarget = qs('#navDropdownSectionTargetV164')?.value || '';
    const linkUrl = (qs('#navDropdownLinkTargetV164')?.value || '').trim();

    const action = {
      itemId: selectedTarget,
      functionEnabled: type === 'page' || type === 'section' || type === 'page-section',
      pageEnabled: type === 'page' || type === 'page-section',
      pageTarget: type === 'page' || type === 'page-section' ? pageTarget : '',
      scrollEnabled: type === 'section' || type === 'page-section',
      scrollTarget: type === 'section' || type === 'page-section' ? scrollTarget : '',
      linkEnabled: type === 'link',
      linkUrl: type === 'link' ? linkUrl : ''
    };

    setAction(selectedNavRoot, selectedTarget, action);
    markTarget(selectedNavRoot, selectedTarget);
    syncPanel();
    alert('已套用：' + getTargetLabel(selectedNavRoot, selectedTarget));
  }

  function activateNavTarget(targetNode) {
    const root = targetNode?.closest?.('.nav-dropdown');
    if (!root) return;
    selectedNavRoot = root;
    normalizeNav(root);
    selectedTarget = targetNode.classList.contains('nav-dropdown-title')
      ? TITLE_KEY
      : String(targetNode.dataset.optionIndex || '0');
    markTarget(root, selectedTarget);
    try {
      if (typeof selectElement === 'function') selectElement(root);
    } catch (error) {}
    syncPanel();
  }

  document.addEventListener('pointerdown', event => {
    if (isPreviewLike()) return;
    const targetNode = event.target?.closest?.('.nav-dropdown-title, .nav-dropdown-option');
    if (!targetNode) return;
    activateNavTarget(targetNode);
  }, true);

  document.addEventListener('click', event => {
    if (isPreviewLike()) return;
    const targetNode = event.target?.closest?.('.nav-dropdown-title, .nav-dropdown-option');
    if (!targetNode) return;
    activateNavTarget(targetNode);
    syncPanel();
  }, true);

  let observerTimer = null;
  const observer = new MutationObserver(mutations => {
    const shouldHandle = mutations.some(mutation => {
      const target = mutation.target;
      return target instanceof Element && !target.closest('#navDropdownActionCardV164');
    });
    if (!shouldHandle) return;

    window.clearTimeout(observerTimer);
    observerTimer = window.setTimeout(() => {
      const siteRoot = qs('#sitePage') || document;
      qsa('.nav-dropdown', siteRoot).forEach(normalizeNav);
      if (selectedNavRoot && !document.body.contains(selectedNavRoot)) selectedNavRoot = null;
    }, 120);
  });

  window.addEventListener('load', () => {
    ensurePanel();
    qsa('.nav-dropdown').forEach(normalizeNav);
    observer.observe(qs('#sitePage') || document.body, { childList: true, subtree: true });
    syncPanel();
  });
})();
