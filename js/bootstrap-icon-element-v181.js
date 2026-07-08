/* v181: Bootstrap Icons as a real free element. */
(function(){
  'use strict';

  const CSS_V181 = `
.free-element[data-type="icon"] {
  background: transparent;
}

.free-element[data-type="icon"] .icon-inner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--icon-color, #212529);
  line-height: 1;
}

.free-element[data-type="icon"] .editable-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1em;
  height: 1em;
  color: inherit;
  font-size: var(--icon-size, 56px);
  line-height: 1;
  pointer-events: none;
}

body.preview-mode .free-element[data-type="icon"],
body.exported-site .free-element[data-type="icon"] {
  background: transparent !important;
}`;

  const POPULAR_ICONS = [
    ['star-fill', '星星'],
    ['heart-fill', '愛心'],
    ['check-circle', '勾選圓圈'],
    ['x-circle', '叉叉圓圈'],
    ['arrow-right-circle', '向右箭頭圓圈'],
    ['arrow-left-circle', '向左箭頭圓圈'],
    ['chevron-down', '向下箭頭'],
    ['chevron-up', '向上箭頭'],
    ['play-circle', '播放圓圈'],
    ['pause-circle', '暫停圓圈'],
    ['plus-circle', '加號圓圈'],
    ['dash-circle', '減號圓圈'],
    ['search', '搜尋'],
    ['person', '人物'],
    ['house-door', '首頁'],
    ['telephone', '電話'],
    ['envelope', '信件'],
    ['geo-alt', '位置'],
    ['cart', '購物車'],
    ['bag', '購物袋'],
    ['calendar', '行事曆'],
    ['clock', '時鐘'],
    ['camera', '相機'],
    ['image', '圖片'],
    ['gear', '設定'],
    ['trash', '刪除'],
    ['download', '下載'],
    ['upload', '上傳'],
    ['link-45deg', '連結'],
    ['youtube', 'YouTube'],
    ['instagram', 'Instagram'],
    ['facebook', 'Facebook'],
    ['line', 'LINE'],
    ['whatsapp', 'WhatsApp']
  ];

  function qs(id) {
    return document.getElementById(id);
  }

  function setValue(id, value) {
    const el = qs(id);
    if (el) el.value = value;
  }

  function normalizeIconName(value) {
    return String(value || 'star-fill')
      .trim()
      .replace(/^bi\s+/, '')
      .replace(/^bi-/, '')
      .replace(/[^a-z0-9-]/gi, '')
      .toLowerCase() || 'star-fill';
  }

  function safeNumber(value, fallback, min, max) {
    const raw = parseFloat(value);
    const num = Number.isFinite(raw) ? raw : fallback;
    return Math.max(min, Math.min(max, num));
  }

  function selectedIconElement() {
    try {
      return selectedElement && selectedElement.dataset && selectedElement.dataset.type === 'icon'
        ? selectedElement
        : null;
    } catch (error) {
      return null;
    }
  }

  function injectCSS() {
    let style = qs('bootstrapIconElementStyleV181');
    if (!style) {
      style = document.createElement('style');
      style.id = 'bootstrapIconElementStyleV181';
      document.head.appendChild(style);
    }
    style.textContent = CSS_V181;
  }

  function injectSidebarButton() {
    if (document.querySelector('[data-add-element="icon"]')) return;

    const imageButton = document.querySelector('[data-add-element="image"]');
    const anchor = imageButton || document.querySelector('[data-add-element="heading"]');
    if (!anchor) return;

    anchor.insertAdjacentHTML('afterend', `
      <button class="btn btn-outline-success component-btn" data-add-element="icon" type="button">
        <i class="bi bi-stars"></i> Icon 圖示
      </button>
    `);

    const iconButton = document.querySelector('[data-add-element="icon"]');
    if (iconButton && iconButton.dataset.iconElementBoundV181 !== 'true') {
      iconButton.dataset.iconElementBoundV181 = 'true';
      iconButton.addEventListener('click', function(event){
        event.preventDefault();
        addIconElement();
      });
    }
  }

  function injectSettingsCard() {
    if (qs('iconSettingCard')) return;

    const anchor = qs('imageSettingCard') || qs('elementSettingCard');
    if (!anchor) return;

    const options = POPULAR_ICONS.map(function(item){
      return '<option value="' + item[0] + '">' + item[1] + '</option>';
    }).join('');

    anchor.insertAdjacentHTML('beforebegin', `
      <div class="setting-card d-none" id="iconSettingCard">
        <div class="setting-title">Icon 圖示設定</div>

        <label class="simple-label">Icon 名稱</label>
        <select class="form-select form-select-sm mb-2" id="iconNameInput">
          ${options}
        </select>

        <label class="simple-label">Icon 顏色</label>
        <input type="color" class="form-control form-control-color mb-3" id="iconColorInput" value="#212529">

        <label class="simple-label">Icon 大小</label>
        <input type="range" class="form-range" id="iconSizeRange" min="8" max="240" step="1" value="56">
        <div class="px-input-row mb-2">
          <span>px</span>
          <input type="number" class="form-control form-control-sm" id="iconSizeInput" min="8" max="240" step="1" value="56">
        </div>
      </div>
    `);
  }

  function iconTemplate() {
    const id = typeof uid === 'function' ? uid() : ('icon-' + Date.now());
    const toolbar = typeof elementToolbarHTML === 'function' ? elementToolbarHTML() : '';
    return `
      <div class="free-element" data-id="${id}" data-type="icon" data-name="Icon 圖示" data-icon-name="star-fill" data-icon-color="#212529" data-icon-size="56" style="left: 8%; top: 40px; width: 8%; height: 82px; z-index: 10; background: transparent; border-radius: 0;">
        ${toolbar}
        <div class="inner icon-inner">
          <i class="bi bi-star-fill editable-icon" aria-hidden="true"></i>
        </div>
      </div>
    `;
  }

  function removeTargetEmpty(canvas, block, selectedGroup, selectedTemplateContainer) {
    if (selectedGroup && typeof removeGroupEmpty === 'function') {
      removeGroupEmpty(selectedGroup);
    } else if (!selectedTemplateContainer && block && typeof removeBlockEmpty === 'function') {
      removeBlockEmpty(block);
    }

    ['.carousel-empty-slide', ':scope > .group-empty', ':scope > .select-switcher-empty-group', ':scope > .hover-slide-empty-group', '.vertical-news-empty-group'].forEach(function(selector){
      canvas.querySelectorAll(selector).forEach(function(el){ el.remove(); });
    });
  }

  function addIconElement() {
    const block = typeof getTargetBlockForElement === 'function' ? getTargetBlockForElement() : null;
    const selectedGroup = typeof getSelectedGroupElement === 'function' ? getSelectedGroupElement() : null;
    const selectedTemplateContainer = typeof getSelectedJsCssTemplateContainer === 'function' ? getSelectedJsCssTemplateContainer() : null;
    const canvas = typeof getTargetCanvasForElement === 'function'
      ? getTargetCanvasForElement(block)
      : (block && block.querySelector('.block-canvas'));

    if (!canvas) {
      alert('請先選取一個區塊，再新增 Icon 圖示。');
      return;
    }

    removeTargetEmpty(canvas, block, selectedGroup, selectedTemplateContainer);
    canvas.insertAdjacentHTML('beforeend', iconTemplate());

    const el = canvas.querySelector(':scope > .free-element:last-child');
    if (!el) return;
    applyIconToElement(el);
    if (typeof selectElement === 'function') selectElement(el);
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    try { if (typeof scheduleAutoSave === 'function') scheduleAutoSave(); } catch (error) {}
  }

  function applyIconToElement(el) {
    if (!el || el.dataset.type !== 'icon') return;

    const name = normalizeIconName(el.dataset.iconName || 'star-fill');
    const color = el.dataset.iconColor || '#212529';
    const size = safeNumber(el.dataset.iconSize || '56', 56, 8, 240);
    const icon = el.querySelector('.editable-icon');
    if (!icon) return;

    icon.className = 'bi bi-' + name + ' editable-icon';
    el.dataset.iconName = name;
    el.dataset.iconColor = color;
    el.dataset.iconSize = String(size);
    el.style.setProperty('--icon-color', color);
    el.style.setProperty('--icon-size', size + 'px');
    el.style.color = color;
    el.style.fontSize = size + 'px';
  }

  function syncPanel() {
    const card = qs('iconSettingCard');
    const el = selectedIconElement();
    if (card) card.classList.toggle('d-none', !el);
    if (!el) return;

    applyIconToElement(el);
    setValue('iconNameInput', el.dataset.iconName || 'star-fill');
    setValue('iconColorInput', el.dataset.iconColor || '#212529');
    setValue('iconSizeRange', el.dataset.iconSize || '56');
    setValue('iconSizeInput', el.dataset.iconSize || '56');
  }

  function applyPanel() {
    const el = selectedIconElement();
    if (!el) return;

    el.dataset.iconName = normalizeIconName(qs('iconNameInput')?.value || 'star-fill');
    el.dataset.iconColor = qs('iconColorInput')?.value || '#212529';
    const size = safeNumber(qs('iconSizeRange')?.value || qs('iconSizeInput')?.value || '56', 56, 8, 240);
    el.dataset.iconSize = String(size);
    setValue('iconSizeRange', size);
    setValue('iconSizeInput', size);
    applyIconToElement(el);
    try { if (typeof scheduleAutoSave === 'function') scheduleAutoSave(); } catch (error) {}
  }

  function bindSettings() {
    const name = qs('iconNameInput');
    const color = qs('iconColorInput');
    const range = qs('iconSizeRange');
    const input = qs('iconSizeInput');
    if (!name || name.dataset.iconSettingsBoundV181 === 'true') return;

    name.dataset.iconSettingsBoundV181 = 'true';
    name.addEventListener('input', applyPanel);
    name.addEventListener('change', applyPanel);
    color?.addEventListener('input', applyPanel);
    color?.addEventListener('change', applyPanel);
    range?.addEventListener('input', function(){
      setValue('iconSizeInput', range.value);
      applyPanel();
    });
    input?.addEventListener('input', function(){
      setValue('iconSizeRange', input.value);
      applyPanel();
    });
    input?.addEventListener('change', applyPanel);
  }

  function wrapAddElement() {
    if (typeof window.addElement !== 'function' || window.addElement.__iconElementV181) return;
    const previousAddElement = window.addElement;
    window.addElement = function(type) {
      if (type === 'icon') {
        addIconElement();
        return;
      }
      return previousAddElement.apply(this, arguments);
    };
    window.addElement.__iconElementV181 = true;
    try { addElement = window.addElement; } catch (error) {}
  }

  function wrapRefreshInspector() {
    if (typeof window.refreshInspector !== 'function' || window.refreshInspector.__iconElementV181) return;
    const previousRefreshInspector = window.refreshInspector;
    window.refreshInspector = function() {
      const result = previousRefreshInspector.apply(this, arguments);
      injectSettingsCard();
      bindSettings();
      syncPanel();
      return result;
    };
    window.refreshInspector.__iconElementV181 = true;
    try { refreshInspector = window.refreshInspector; } catch (error) {}
  }

  function wrapExportCSS() {
    if (typeof window.buildExportCSS !== 'function' || window.buildExportCSS.__iconElementV181) return;
    const previousBuildExportCSS = window.buildExportCSS;
    window.buildExportCSS = function() {
      return '@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css");\n' +
        previousBuildExportCSS.apply(this, arguments) + '\n' + CSS_V181 + '\n';
    };
    window.buildExportCSS.__iconElementV181 = true;
    try { buildExportCSS = window.buildExportCSS; } catch (error) {}
  }

  function normalizeExistingIcons() {
    document.querySelectorAll('.free-element[data-type="icon"]').forEach(applyIconToElement);
  }

  function boot() {
    injectCSS();
    injectSidebarButton();
    injectSettingsCard();
    bindSettings();
    wrapAddElement();
    wrapRefreshInspector();
    wrapExportCSS();
    normalizeExistingIcons();
    syncPanel();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('click', function(){
    setTimeout(function(){
      injectSidebarButton();
      syncPanel();
    }, 0);
  }, true);
})();
