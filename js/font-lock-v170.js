/* v170: prevent browser/system text auto-scaling from changing exported layout. */
(function fontLockV170() {
  if (window.__fontLockV170) return;
  window.__fontLockV170 = true;

  const cssV170 = `
html,
body,
#sitePage,
.site-page {
  -webkit-text-size-adjust: none !important;
  text-size-adjust: none !important;
  font-size: 16px;
  font-synthesis: none;
  font-optical-sizing: none;
}

body.preview-mode,
body.exported-site,
body.exported-site.preview-mode {
  -webkit-text-size-adjust: none !important;
  text-size-adjust: none !important;
  font-size: 16px !important;
}

body.preview-mode #sitePage,
body.preview-mode .site-page,
body.exported-site #sitePage,
body.exported-site .site-page,
body.exported-site.preview-mode #sitePage,
body.exported-site.preview-mode .site-page {
  font-size: 16px !important;
  font-family: "Microsoft JhengHei", "Noto Sans TC", Arial, sans-serif;
  font-synthesis: none !important;
  font-optical-sizing: none !important;
}

body.preview-mode #sitePage *,
body.preview-mode .site-page *,
body.exported-site #sitePage *,
body.exported-site .site-page *,
body.exported-site.preview-mode #sitePage *,
body.exported-site.preview-mode .site-page * {
  -webkit-text-size-adjust: none !important;
  text-size-adjust: none !important;
  font-synthesis: none !important;
  font-optical-sizing: none !important;
}

body.preview-mode .free-element,
body.preview-mode .free-element *,
body.exported-site .free-element,
body.exported-site .free-element *,
body.exported-site.preview-mode .free-element,
body.exported-site.preview-mode .free-element * {
  line-height: inherit;
}

body.preview-mode [data-editable-text],
body.exported-site [data-editable-text],
body.exported-site.preview-mode [data-editable-text] {
  word-break: keep-all;
  overflow-wrap: normal;
}
`;

  function injectCSS() {
    if (document.getElementById('fontLockCSSV170')) return;
    const style = document.createElement('style');
    style.id = 'fontLockCSSV170';
    style.textContent = cssV170;
    document.head.appendChild(style);
  }

  const runtimeV170 = `
(function(){
  if (window.__fontLockRuntimeV170) return;
  window.__fontLockRuntimeV170 = true;
  function apply(){
    document.documentElement.style.webkitTextSizeAdjust = 'none';
    document.documentElement.style.textSizeAdjust = 'none';
    document.body.style.webkitTextSizeAdjust = 'none';
    document.body.style.textSizeAdjust = 'none';
    document.body.style.fontSize = '16px';
    var page = document.getElementById('sitePage') || document.querySelector('.site-page');
    if (page) {
      page.style.webkitTextSizeAdjust = 'none';
      page.style.textSizeAdjust = 'none';
      page.style.fontSize = '16px';
      page.style.fontSynthesis = 'none';
      page.style.fontOpticalSizing = 'none';
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply); else apply();
  window.addEventListener('resize', apply);
})();`;

  function patchExportBuilders() {
    if (typeof buildExportCSS === 'function' && !buildExportCSS.__v170Wrapped) {
      const previousBuildExportCSS = buildExportCSS;
      buildExportCSS = function () {
        return previousBuildExportCSS.apply(this, arguments) + '\n\n' + cssV170 + '\n';
      };
      buildExportCSS.__v170Wrapped = true;
      window.buildExportCSS = buildExportCSS;
    }

    if (typeof buildExportJS === 'function' && !buildExportJS.__v170Wrapped) {
      const previousBuildExportJS = buildExportJS;
      buildExportJS = function () {
        return previousBuildExportJS.apply(this, arguments) + runtimeV170;
      };
      buildExportJS.__v170Wrapped = true;
      window.buildExportJS = buildExportJS;
    }
  }

  window.addEventListener('load', () => {
    injectCSS();
    patchExportBuilders();
  });
})();
