/* v184: keep editor preview background inside the selected device layout size. */
(function previewBackgroundSizeV184() {
  if (window.__previewBackgroundSizeV184) return;
  window.__previewBackgroundSizeV184 = true;

  const DEVICE_SIZES = {
    desktop: { width: 1920, height: 1080 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 390, height: 844 }
  };
  const OUTSIDE_PREVIEW_BG = '#f3f5f8';

  const cssV184 = `
body.preview-mode:not(.exported-site),
body.preview-mode:not(.exported-site) .editor-layout,
body.preview-mode:not(.exported-site) .canvas-area {
  background: var(--preview-outside-background-v184, #f3f5f8) !important;
  background-color: var(--preview-outside-background-v184, #f3f5f8) !important;
}

body.preview-mode:not(.exported-site) .site-background-layer-v153 {
  position: fixed !important;
  inset: auto !important;
  left: 50% !important;
  top: 0 !important;
  right: auto !important;
  bottom: auto !important;
  width: var(--preview-background-width-v184, var(--fixed-layout-design-width-v167, 390px)) !important;
  min-width: var(--preview-background-width-v184, var(--fixed-layout-design-width-v167, 390px)) !important;
  max-width: var(--preview-background-width-v184, var(--fixed-layout-design-width-v167, 390px)) !important;
  height: var(--preview-background-height-v184, 844px) !important;
  min-height: var(--preview-background-height-v184, 844px) !important;
  max-height: none !important;
  transform: translateX(-50%) scale(var(--fixed-layout-scale-v167, 1)) !important;
  transform-origin: top center !important;
  background-size: cover !important;
  background-position: center center !important;
  background-repeat: no-repeat !important;
}
`;

  function injectCSS() {
    if (document.getElementById('previewBackgroundSizeCSSV184')) return;
    const style = document.createElement('style');
    style.id = 'previewBackgroundSizeCSSV184';
    style.textContent = cssV184;
    document.head.appendChild(style);
  }

  function currentMode() {
    if (document.body.classList.contains('device-mobile')) return 'mobile';
    if (document.body.classList.contains('device-tablet')) return 'tablet';
    return 'desktop';
  }

  function currentScale(width) {
    const cssScale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--fixed-layout-scale-v167'));
    if (Number.isFinite(cssScale) && cssScale > 0) return cssScale;
    const viewport = Math.max(320, window.innerWidth || document.documentElement.clientWidth || width);
    return Math.min(1, viewport / width);
  }

  function setImportantStyle(el, prop, value) {
    if (!el) return;
    el.style.setProperty(prop, value, 'important');
  }

  function resetPreviewOutsideBackground() {
    document.documentElement.style.removeProperty('--preview-outside-background-v184');
    document.body.style.removeProperty('--preview-outside-background-v184');
    document.body.style.removeProperty('background');
    document.body.style.removeProperty('background-color');
    const canvas = document.getElementById('canvasArea') || document.querySelector('.canvas-area');
    if (canvas) {
      canvas.style.removeProperty('background');
      canvas.style.removeProperty('background-color');
    }
  }

  function applyPreviewOutsideBackground() {
    document.documentElement.style.setProperty('--preview-outside-background-v184', OUTSIDE_PREVIEW_BG);
    document.body.style.setProperty('--preview-outside-background-v184', OUTSIDE_PREVIEW_BG);
    setImportantStyle(document.body, 'background', OUTSIDE_PREVIEW_BG);
    setImportantStyle(document.body, 'background-color', OUTSIDE_PREVIEW_BG);

    const canvas = document.getElementById('canvasArea') || document.querySelector('.canvas-area');
    setImportantStyle(canvas, 'background', OUTSIDE_PREVIEW_BG);
    setImportantStyle(canvas, 'background-color', OUTSIDE_PREVIEW_BG);
  }

  function applySize() {
    injectCSS();

    if (!document.body.classList.contains('preview-mode') || document.body.classList.contains('exported-site')) {
      resetPreviewOutsideBackground();
      return;
    }

    const mode = currentMode();
    const size = DEVICE_SIZES[mode] || DEVICE_SIZES.desktop;
    const page = document.getElementById('sitePage') || document.querySelector('.site-page');
    const canvas = document.getElementById('canvasArea') || document.querySelector('.canvas-area');
    const layer = document.getElementById('siteBackgroundLayerV153') || document.querySelector('.site-background-layer-v153');
    const pageHeight = page ? Math.max(page.scrollHeight || 0, page.offsetHeight || 0) : 0;
    const height = Math.max(size.height, pageHeight);
    const scale = currentScale(size.width);

    document.documentElement.style.setProperty('--preview-background-width-v184', size.width + 'px');
    document.documentElement.style.setProperty('--preview-background-height-v184', height + 'px');
    document.documentElement.style.setProperty('--fixed-layout-design-width-v167', size.width + 'px');
    document.documentElement.style.setProperty('--fixed-layout-scale-v167', String(scale));
    document.body.style.setProperty('--preview-background-width-v184', size.width + 'px');
    document.body.style.setProperty('--preview-background-height-v184', height + 'px');
    applyPreviewOutsideBackground();

    if (layer) {
      layer.style.width = size.width + 'px';
      layer.style.minWidth = size.width + 'px';
      layer.style.height = height + 'px';
      layer.style.minHeight = height + 'px';
      layer.style.transform = 'translateX(-50%) scale(' + scale + ')';
      layer.style.transformOrigin = 'top center';
    }

    if (canvas) {
      canvas.style.minHeight = Math.max(window.innerHeight || 0, Math.ceil(height * scale)) + 'px';
    }
  }

  function scheduleApply() {
    window.requestAnimationFrame(() => {
      applySize();
      window.setTimeout(applySize, 80);
      window.setTimeout(applySize, 260);
    });
  }

  function patchRuntime() {
    if (typeof switchDeviceMode === 'function' && !switchDeviceMode.__v184Wrapped) {
      const previousSwitchDeviceMode = switchDeviceMode;
      switchDeviceMode = function () {
        const result = previousSwitchDeviceMode.apply(this, arguments);
        scheduleApply();
        return result;
      };
      switchDeviceMode.__v184Wrapped = true;
      window.switchDeviceMode = switchDeviceMode;
    }

    if (typeof loadPage === 'function' && !loadPage.__v184Wrapped) {
      const previousLoadPage = loadPage;
      loadPage = function () {
        const result = previousLoadPage.apply(this, arguments);
        scheduleApply();
        return result;
      };
      loadPage.__v184Wrapped = true;
      window.loadPage = loadPage;
    }
  }

  window.addEventListener('resize', scheduleApply);
  window.addEventListener('orientationchange', scheduleApply);

  document.addEventListener('click', event => {
    if (event.target?.id === 'previewBtn' || event.target?.id === 'exitPreviewBtn' || event.target?.id === 'floatingExitPreviewBtn') {
      scheduleApply();
    }
  }, true);

  window.addEventListener('load', () => {
    injectCSS();
    patchRuntime();
    scheduleApply();
  });

  if (document.readyState !== 'loading') {
    injectCSS();
    patchRuntime();
    scheduleApply();
  }

  window.previewBackgroundSizeV184 = scheduleApply;
})();
