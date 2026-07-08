/* v180: add a universal rotation angle input for every free element. */
(function(){
  'use strict';

  const RANGE_ID = 'elementRotateDeg';
  const INPUT_ID = 'elementRotateDegInput';

  function qs(id) {
    return document.getElementById(id);
  }

  function setPanelValue(id, value) {
    const el = qs(id);
    if (el) el.value = value;
  }

  function clampAngle(value) {
    const raw = parseFloat(value);
    if (!Number.isFinite(raw)) return 0;
    return ((Math.round(raw) % 360) + 360) % 360;
  }

  function selectedFreeElements() {
    const list = [];
    try {
      if (Array.isArray(selectedElements)) list.push(...selectedElements);
      if (selectedElement) list.push(selectedElement);
    } catch (error) {}

    return Array.from(new Set(list)).filter(function(el){
      return !!(el && el.isConnected && el.classList && el.classList.contains('free-element'));
    });
  }

  function activeElement() {
    try {
      if (selectedElement && selectedElement.isConnected) return selectedElement;
    } catch (error) {}
    return document.querySelector('.free-element.selected');
  }

  function applyTransform(el) {
    if (!el) return;
    try {
      if (typeof applyElementTransformState === 'function') {
        applyElementTransformState(el);
      } else {
        const flipX = el.dataset.flipX === 'true' ? -1 : 1;
        const flipY = el.dataset.flipY === 'true' ? -1 : 1;
        const rotate = clampAngle(el.dataset.rotateDeg || '0');
        el.style.transform = 'scaleX(' + flipX + ') scaleY(' + flipY + ') rotate(' + rotate + 'deg)';
        el.style.transformOrigin = 'center center';
      }
      if (el.dataset.type === 'line' && typeof applyLineStyleToElement === 'function') {
        applyLineStyleToElement(el);
      }
    } catch (error) {
      console.warn('[v180 rotation]', error);
    }
  }

  function syncLinePanel(angle, el) {
    if (!el || el.dataset.type !== 'line') return;
    setPanelValue('lineAngle', angle);
    setPanelValue('lineAngleInput', angle);
  }

  function syncRotationPanel() {
    const el = activeElement();
    const angle = clampAngle(el ? (el.dataset.rotateDeg || '0') : '0');
    setPanelValue(RANGE_ID, angle);
    setPanelValue(INPUT_ID, angle);
    syncLinePanel(angle, el);
  }

  function applyRotationFromPanel(sourceId) {
    const source = qs(sourceId);
    const angle = clampAngle(source ? source.value : 0);
    const targets = selectedFreeElements();
    if (!targets.length) return;

    try { if (typeof saveHistorySnapshot === 'function') saveHistorySnapshot(); } catch (error) {}

    targets.forEach(function(el){
      el.dataset.rotateDeg = String(angle);
      applyTransform(el);
    });

    setPanelValue(RANGE_ID, angle);
    setPanelValue(INPUT_ID, angle);
    syncLinePanel(angle, activeElement());

    try { if (typeof scheduleAutoSave === 'function') scheduleAutoSave(); } catch (error) {}
  }

  function injectControls() {
    if (qs('elementRotationControlV180')) return;

    const heightInput = qs('elHPx');
    const heightRow = heightInput && heightInput.closest ? heightInput.closest('.px-input-row') : null;
    const anchor = heightRow || qs('elH');
    if (!anchor) return;

    const html = `
      <div id="elementRotationControlV180" class="element-rotation-control-v180">
        <label class="simple-label">旋轉角度</label>
        <input type="range" class="form-range" id="${RANGE_ID}" min="0" max="359" step="1" value="0">
        <div class="px-input-row mb-3">
          <span>度</span>
          <input type="number" class="form-control form-control-sm" id="${INPUT_ID}" min="0" max="359" step="1" value="0">
        </div>
      </div>`;

    anchor.insertAdjacentHTML('afterend', html);
  }

  function bindControls() {
    const range = qs(RANGE_ID);
    const input = qs(INPUT_ID);
    if (!range || !input || range.dataset.rotationBoundV180 === 'true') return;

    range.dataset.rotationBoundV180 = 'true';
    range.addEventListener('input', function(){ applyRotationFromPanel(RANGE_ID); });
    range.addEventListener('change', function(){ applyRotationFromPanel(RANGE_ID); });

    input.addEventListener('input', function(){ applyRotationFromPanel(INPUT_ID); });
    input.addEventListener('change', function(){ applyRotationFromPanel(INPUT_ID); });
    input.addEventListener('keydown', function(event){
      if (event.key !== 'Enter') return;
      applyRotationFromPanel(INPUT_ID);
      event.target.blur();
    });

    ['lineAngle', 'lineAngleInput'].forEach(function(id){
      const el = qs(id);
      if (!el || el.dataset.rotationSyncV180 === 'true') return;
      el.dataset.rotationSyncV180 = 'true';
      ['input', 'change'].forEach(function(type){
        el.addEventListener(type, function(){
          setTimeout(syncRotationPanel, 0);
        });
      });
    });
  }

  function wrapRefreshInspector() {
    if (typeof window.refreshInspector !== 'function' || window.refreshInspector.__rotationV180) return;
    const previousRefreshInspector = window.refreshInspector;
    window.refreshInspector = function() {
      const result = previousRefreshInspector.apply(this, arguments);
      injectControls();
      bindControls();
      syncRotationPanel();
      return result;
    };
    window.refreshInspector.__rotationV180 = true;
    try { refreshInspector = window.refreshInspector; } catch (error) {}
  }

  function boot() {
    injectControls();
    bindControls();
    wrapRefreshInspector();
    syncRotationPanel();
    setTimeout(function(){
      injectControls();
      bindControls();
      wrapRefreshInspector();
      syncRotationPanel();
    }, 120);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('click', function(){
    setTimeout(syncRotationPanel, 0);
  }, true);
})();
