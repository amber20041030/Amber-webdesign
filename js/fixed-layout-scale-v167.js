/* v167: lock element layout to a design width, then scale the whole site for preview/export. */
(function fixedLayoutScaleV167() {
  if (window.__fixedLayoutScaleV167) return;
  window.__fixedLayoutScaleV167 = true;

  const WIDTHS = {
    desktop: 1440,
    tablet: 768,
    mobile: 390
  };

  const cssV167 = `
:root {
  --fixed-layout-design-width-v167: 1440px;
  --fixed-layout-scale-v167: 1;
}

body.preview-mode.device-desktop,
body.exported-site.export-mode-desktop,
body.exported-site.preview-mode.export-mode-desktop {
  --fixed-layout-design-width-v167: 1440px;
}

body.preview-mode.device-tablet,
body.exported-site.export-mode-tablet,
body.exported-site.preview-mode.export-mode-tablet {
  --fixed-layout-design-width-v167: 768px;
}

body.preview-mode.device-mobile,
body.exported-site.export-mode-mobile,
body.exported-site.preview-mode.export-mode-mobile {
  --fixed-layout-design-width-v167: 390px;
}

body.preview-mode,
body.exported-site,
body.exported-site.preview-mode {
  overflow-x: hidden !important;
  background-size: cover !important;
  background-position: center center !important;
  background-repeat: no-repeat !important;
}

body.preview-mode .site-background-layer-v153,
body.exported-site .site-background-layer-v153,
body.exported-site .export-site-background-v153 {
  position: fixed !important;
  inset: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background-size: cover !important;
  background-position: center center !important;
  background-repeat: no-repeat !important;
}

body.preview-mode .canvas-area,
body.exported-site .canvas-area,
body.exported-site.preview-mode .canvas-area,
body.exported-site .export-preview-canvas-v161,
body.exported-site.preview-mode .export-preview-canvas-v161 {
  width: 100vw !important;
  max-width: 100vw !important;
  overflow-x: hidden !important;
  display: flex !important;
  justify-content: center !important;
  align-items: flex-start !important;
  background-size: cover !important;
  background-position: center center !important;
  background-repeat: no-repeat !important;
}

body.preview-mode #sitePage.site-page,
body.preview-mode .site-page,
body.exported-site #sitePage.site-page,
body.exported-site .site-page,
body.exported-site.preview-mode #sitePage.site-page,
body.exported-site.preview-mode .site-page {
  width: var(--fixed-layout-design-width-v167) !important;
  min-width: var(--fixed-layout-design-width-v167) !important;
  max-width: var(--fixed-layout-design-width-v167) !important;
  transform: scale(var(--fixed-layout-scale-v167)) !important;
  transform-origin: top center !important;
  flex: 0 0 var(--fixed-layout-design-width-v167) !important;
  box-sizing: border-box !important;
  margin-left: auto !important;
  margin-right: auto !important;
}

body.preview-mode .html-zone,
body.exported-site .html-zone,
body.exported-site.preview-mode .html-zone,
body.preview-mode .html-block,
body.exported-site .html-block,
body.exported-site.preview-mode .html-block,
body.preview-mode .block-canvas,
body.exported-site .block-canvas,
body.exported-site.preview-mode .block-canvas {
  box-sizing: border-box !important;
}

body:not(.preview-mode):not(.exported-site) #sitePage.site-page {
  transform: none !important;
}
`;

  function injectCSS() {
    if (document.getElementById('fixedLayoutScaleCSSV167')) return;
    const style = document.createElement('style');
    style.id = 'fixedLayoutScaleCSSV167';
    style.textContent = cssV167;
    document.head.appendChild(style);
  }

  function modeFromBody() {
    if (document.body.classList.contains('device-mobile') || document.body.classList.contains('export-mode-mobile')) return 'mobile';
    if (document.body.classList.contains('device-tablet') || document.body.classList.contains('export-mode-tablet')) return 'tablet';
    return 'desktop';
  }

  function designWidthForMode(mode = modeFromBody()) {
    return WIDTHS[mode] || WIDTHS.desktop;
  }

  function getViewportWidth() {
    return Math.max(320, window.innerWidth || document.documentElement.clientWidth || designWidthForMode());
  }

  function getScale(mode = modeFromBody()) {
    const designWidth = designWidthForMode(mode);
    return Math.min(1, getViewportWidth() / designWidth);
  }

  function getPage() {
    return document.getElementById('sitePage') || document.querySelector('.site-page');
  }

  function getCanvas() {
    return document.querySelector('.canvas-area') || document.querySelector('.export-preview-canvas-v161') || document.body;
  }

  function applyScale() {
    injectCSS();
    const page = getPage();
    if (!page) return;

    const previewLike = document.body.classList.contains('preview-mode') || document.body.classList.contains('exported-site');
    if (!previewLike) {
      document.documentElement.style.removeProperty('--fixed-layout-scale-v167');
      document.documentElement.style.removeProperty('--fixed-layout-design-width-v167');
      return;
    }

    const mode = modeFromBody();
    const designWidth = designWidthForMode(mode);
    const scale = getScale(mode);
    const pageHeight = Math.max(page.scrollHeight, page.offsetHeight, window.innerHeight || 0);
    const scaledHeight = Math.ceil(pageHeight * scale);
    const canvas = getCanvas();

    document.documentElement.style.setProperty('--fixed-layout-design-width-v167', designWidth + 'px');
    document.documentElement.style.setProperty('--fixed-layout-scale-v167', String(scale));
    document.body.style.setProperty('--fixed-layout-design-width-v167', designWidth + 'px');
    document.body.style.setProperty('--fixed-layout-scale-v167', String(scale));
    page.style.setProperty('--fixed-layout-design-width-v167', designWidth + 'px');
    page.style.setProperty('--fixed-layout-scale-v167', String(scale));

    if (canvas) {
      canvas.style.minHeight = Math.max(window.innerHeight || 0, scaledHeight) + 'px';
    }
  }

  function scheduleApply() {
    window.requestAnimationFrame(() => {
      applyScale();
      window.setTimeout(applyScale, 80);
      window.setTimeout(applyScale, 260);
    });
  }

  function patchRuntime() {
    if (typeof switchDeviceMode === 'function' && !switchDeviceMode.__v167Wrapped) {
      const previousSwitchDeviceMode = switchDeviceMode;
      switchDeviceMode = function () {
        const result = previousSwitchDeviceMode.apply(this, arguments);
        scheduleApply();
        return result;
      };
      switchDeviceMode.__v167Wrapped = true;
      window.switchDeviceMode = switchDeviceMode;
    }

    if (typeof loadPage === 'function' && !loadPage.__v167Wrapped) {
      const previousLoadPage = loadPage;
      loadPage = function () {
        const result = previousLoadPage.apply(this, arguments);
        scheduleApply();
        return result;
      };
      loadPage.__v167Wrapped = true;
      window.loadPage = loadPage;
    }

    if (typeof renderExportPage === 'function' && !renderExportPage.__v167Wrapped) {
      const previousRenderExportPage = renderExportPage;
      renderExportPage = function (pageId, callback) {
        return previousRenderExportPage.call(this, pageId, function () {
          scheduleApply();
          if (typeof callback === 'function') callback();
        });
      };
      renderExportPage.__v167Wrapped = true;
      window.renderExportPage = renderExportPage;
    }
  }

  const exportJSV167 = `
(function(){
  if (window.__fixedLayoutScaleRuntimeV167) return;
  window.__fixedLayoutScaleRuntimeV167 = true;
  var WIDTHS = { desktop: 1440, tablet: 768, mobile: 390 };
  function mode(){ if (document.body.classList.contains('export-mode-mobile') || document.body.classList.contains('device-mobile')) return 'mobile'; if (document.body.classList.contains('export-mode-tablet') || document.body.classList.contains('device-tablet')) return 'tablet'; return 'desktop'; }
  function width(){ return WIDTHS[mode()] || WIDTHS.desktop; }
  function scale(){ return Math.min(1, Math.max(320, window.innerWidth || document.documentElement.clientWidth || width()) / width()); }
  function page(){ return document.getElementById('sitePage') || document.querySelector('.site-page'); }
  function canvas(){ return document.querySelector('.canvas-area') || document.querySelector('.export-preview-canvas-v161') || document.body; }
  function apply(){
    var p = page(); if (!p) return;
    var w = width(); var s = scale(); var c = canvas();
    document.documentElement.style.setProperty('--fixed-layout-design-width-v167', w + 'px');
    document.documentElement.style.setProperty('--fixed-layout-scale-v167', String(s));
    document.body.style.setProperty('--fixed-layout-design-width-v167', w + 'px');
    document.body.style.setProperty('--fixed-layout-scale-v167', String(s));
    p.style.setProperty('--fixed-layout-design-width-v167', w + 'px');
    p.style.setProperty('--fixed-layout-scale-v167', String(s));
    if (c) c.style.minHeight = Math.max(window.innerHeight || 0, Math.ceil(Math.max(p.scrollHeight, p.offsetHeight, window.innerHeight || 0) * s)) + 'px';
  }
  function schedule(){ requestAnimationFrame(function(){ apply(); setTimeout(apply, 80); setTimeout(apply, 260); }); }
  window.addEventListener('resize', schedule);
  window.addEventListener('orientationchange', schedule);
  var oldRender = typeof renderExportPage === 'function' ? renderExportPage : null;
  if (oldRender && !oldRender.__v167Wrapped) {
    renderExportPage = function(pageId, callback){ return oldRender.call(this, pageId, function(){ schedule(); if (typeof callback === 'function') callback(); }); };
    renderExportPage.__v167Wrapped = true;
    window.renderExportPage = renderExportPage;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule); else schedule();
  window.fixedLayoutScaleV167 = schedule;
})();`;

  function patchExportBuilders() {
    if (typeof buildExportCSS === 'function' && !buildExportCSS.__v167Wrapped) {
      const previousBuildExportCSS = buildExportCSS;
      buildExportCSS = function () {
        return previousBuildExportCSS.apply(this, arguments) + '\n\n' + cssV167 + '\n';
      };
      buildExportCSS.__v167Wrapped = true;
      window.buildExportCSS = buildExportCSS;
    }

    if (typeof buildExportJS === 'function' && !buildExportJS.__v167Wrapped) {
      const previousBuildExportJS = buildExportJS;
      buildExportJS = function () {
        return previousBuildExportJS.apply(this, arguments) + exportJSV167;
      };
      buildExportJS.__v167Wrapped = true;
      window.buildExportJS = buildExportJS;
    }
  }

  window.addEventListener('resize', scheduleApply);
  window.addEventListener('orientationchange', scheduleApply);

  window.addEventListener('load', () => {
    injectCSS();
    patchRuntime();
    patchExportBuilders();
    scheduleApply();
  });

  document.addEventListener('click', event => {
    if (event.target?.id === 'previewBtn' || event.target?.id === 'exitPreviewBtn' || event.target?.id === 'floatingExitPreviewBtn') {
      scheduleApply();
    }
  }, true);

  window.fixedLayoutScaleV167 = scheduleApply;
})();
