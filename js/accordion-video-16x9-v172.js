/* v172: export accordion click reliability + YouTube 16:9 sizing. */
(function(){
  'use strict';

  const YOUTUBE_RATIO = 16 / 9;
  const YOUTUBE_RATIO_TEXT = '1.7777777778';

  const CSS_V172 = `
/* v172: force YouTube players to keep a 16:9 box in preview/export */
.free-element[data-type="youtube"] {
  aspect-ratio: 16 / 9;
}

.free-element[data-type="youtube"] > .inner,
.free-element[data-type="youtube"] .youtube-inner,
.free-element[data-type="youtube"] iframe.editable-youtube {
  width: 100% !important;
  height: 100% !important;
}

body.preview-mode .accordion-dropdown-template .accordion-item-head,
body.exported-site .accordion-dropdown-template .accordion-item-head {
  cursor: pointer !important;
  pointer-events: auto !important;
}`;

  function injectCSS() {
    let style = document.getElementById('patchV172AccordionVideo16x9');
    if (!style) {
      style = document.createElement('style');
      style.id = 'patchV172AccordionVideo16x9';
      document.head.appendChild(style);
    }
    style.textContent = CSS_V172;
  }

  function isPublicView() {
    return document.body.classList.contains('preview-mode') ||
      document.body.classList.contains('exported-site');
  }

  function installAccordionDelegation() {
    if (document.__accordionPublicDelegationV172) return;
    document.__accordionPublicDelegationV172 = true;

    document.addEventListener('click', function(event){
      if (!isPublicView()) return;

      const head = event.target.closest && event.target.closest('.accordion-dropdown-template .accordion-item-head, .accordion-dropdown-template [data-accordion-toggle]');
      if (!head) return;

      const root = head.closest('.accordion-dropdown-template');
      const item = head.closest('.accordion-item-template');
      if (!root || !item) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      const shouldOpen = !item.classList.contains('open');
      root.querySelectorAll('.accordion-item-template.open').forEach(function(openItem){
        if (openItem !== item) openItem.classList.remove('open');
      });
      item.classList.toggle('open', shouldOpen);
    }, true);
  }

  function widthPxFor(el) {
    const rect = el.getBoundingClientRect();
    if (rect.width > 0) return rect.width;

    const context = el.closest('.block-canvas, .accordion-list-canvas, .select-switcher-group-canvas, .hover-slide-group-canvas, .group-inner') || el.parentElement;
    const contextWidth = context && context.getBoundingClientRect ? context.getBoundingClientRect().width : 0;
    const widthStyle = String(el.style.width || '').trim();

    if (widthStyle.endsWith('%') && contextWidth > 0) {
      return contextWidth * (parseFloat(widthStyle) || 0) / 100;
    }

    if (widthStyle.endsWith('px')) {
      return parseFloat(widthStyle) || 0;
    }

    return 0;
  }

  function autoplayYoutubeSrc(src) {
    if (!src || !/youtube\.com\/embed\//i.test(src)) return src;

    try {
      const url = new URL(src, window.location.href);
      url.searchParams.set('autoplay', '1');
      url.searchParams.set('mute', '1');
      url.searchParams.set('playsinline', '1');
      return url.href;
    } catch (error) {
      const joiner = src.includes('?') ? '&' : '?';
      let next = src;
      if (!/[?&]autoplay=/i.test(next)) next += joiner + 'autoplay=1';
      if (!/[?&]mute=/i.test(next)) next += '&mute=1';
      if (!/[?&]playsinline=/i.test(next)) next += '&playsinline=1';
      return next;
    }
  }

  function normalizeYoutubeIframe(iframe) {
    if (!iframe) return;

    const src = iframe.getAttribute('src') || '';
    const autoplaySrc = autoplayYoutubeSrc(src);
    if (autoplaySrc && autoplaySrc !== src) iframe.setAttribute('src', autoplaySrc);

    iframe.setAttribute('width', '560');
    iframe.setAttribute('height', '315');
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
    iframe.setAttribute('loading', 'eager');
  }

  function normalizeYoutube(el) {
    if (!el || el.dataset?.type !== 'youtube') return;

    el.dataset.youtubeAspectRatio = YOUTUBE_RATIO_TEXT;
    el.style.aspectRatio = '16 / 9';

    const widthPx = widthPxFor(el);
    if (widthPx > 0) {
      el.style.height = Math.round(widthPx / YOUTUBE_RATIO) + 'px';
    }

    const iframe = el.querySelector('iframe.editable-youtube, .youtube-inner iframe');
    normalizeYoutubeIframe(iframe);
  }

  function normalizeAllYoutube(scope) {
    (scope || document).querySelectorAll('.free-element[data-type="youtube"]').forEach(normalizeYoutube);
  }

  function selectedYoutubeElement() {
    try {
      return (typeof selectedElement !== 'undefined' && selectedElement && selectedElement.dataset?.type === 'youtube')
        ? selectedElement
        : null;
    } catch (error) {
      return null;
    }
  }

  function wrapEditorFunctions() {
    if (typeof window.addElement === 'function' && !window.addElement.__youtube16x9V172) {
      const previousAddElement = window.addElement;
      window.addElement = function(type) {
        const result = previousAddElement.apply(this, arguments);
        if (type === 'youtube') {
          setTimeout(function(){
            const current = selectedYoutubeElement();
            if (current) normalizeYoutube(current);
            normalizeAllYoutube(document);
          }, 0);
        }
        return result;
      };
      window.addElement.__youtube16x9V172 = true;
      try { addElement = window.addElement; } catch (error) {}
    }

    if (typeof window.setYoutubeSizeByWidthPx === 'function' && !window.setYoutubeSizeByWidthPx.__youtube16x9V172) {
      const previousSetYoutubeSize = window.setYoutubeSizeByWidthPx;
      window.setYoutubeSizeByWidthPx = function(widthPx) {
        const current = selectedYoutubeElement();
        if (current) current.dataset.youtubeAspectRatio = YOUTUBE_RATIO_TEXT;
        const result = previousSetYoutubeSize.apply(this, arguments);
        const after = selectedYoutubeElement();
        if (after) normalizeYoutube(after);
        return result;
      };
      window.setYoutubeSizeByWidthPx.__youtube16x9V172 = true;
      try { setYoutubeSizeByWidthPx = window.setYoutubeSizeByWidthPx; } catch (error) {}
    }

    if (typeof window.syncYoutubeWidthControls === 'function' && !window.syncYoutubeWidthControls.__youtube16x9V172) {
      const previousSyncYoutube = window.syncYoutubeWidthControls;
      window.syncYoutubeWidthControls = function() {
        const current = selectedYoutubeElement();
        if (current) normalizeYoutube(current);
        return previousSyncYoutube.apply(this, arguments);
      };
      window.syncYoutubeWidthControls.__youtube16x9V172 = true;
      try { syncYoutubeWidthControls = window.syncYoutubeWidthControls; } catch (error) {}
    }

    if (typeof window.applyYoutubeEmbedToElement === 'function' && !window.applyYoutubeEmbedToElement.__youtubeAutoplayV179) {
      const previousApplyYoutubeEmbed = window.applyYoutubeEmbedToElement;
      window.applyYoutubeEmbedToElement = function() {
        const result = previousApplyYoutubeEmbed.apply(this, arguments);
        setTimeout(function(){
          const current = selectedYoutubeElement();
          if (current) normalizeYoutube(current);
          normalizeAllYoutube(document);
        }, 0);
        return result;
      };
      window.applyYoutubeEmbedToElement.__youtubeAutoplayV179 = true;
      try { applyYoutubeEmbedToElement = window.applyYoutubeEmbedToElement; } catch (error) {}
    }
  }

  function wrapExportBuilders() {
    if (typeof window.buildExportCSS === 'function' && !window.buildExportCSS.__accordionVideo16x9V172) {
      const previousBuildExportCSS = window.buildExportCSS;
      window.buildExportCSS = function() {
        return previousBuildExportCSS.apply(this, arguments) + '\n' + CSS_V172 + '\n';
      };
      window.buildExportCSS.__accordionVideo16x9V172 = true;
      try { buildExportCSS = window.buildExportCSS; } catch (error) {}
    }

    if (typeof window.buildExportJS === 'function' && !window.buildExportJS.__accordionVideo16x9V172) {
      const previousBuildExportJS = window.buildExportJS;
      window.buildExportJS = function(exportPagesJSON, currentPageIdJSON) {
        return previousBuildExportJS.apply(this, arguments) + `

/* v172: public accordion click fix + YouTube 16:9 normalization */
(function(){
  if (window.__accordionVideo16x9RuntimeV172) return;
  window.__accordionVideo16x9RuntimeV172 = true;
  var ratio = 16 / 9;
  function qsa(selector, root){ return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }
  function isPublicView(){ return document.body.classList.contains('preview-mode') || document.body.classList.contains('exported-site'); }
  function widthPxFor(el){
    var rect = el.getBoundingClientRect();
    if (rect.width > 0) return rect.width;
    var context = el.closest('.block-canvas, .accordion-list-canvas, .select-switcher-group-canvas, .hover-slide-group-canvas, .group-inner') || el.parentElement;
    var contextWidth = context && context.getBoundingClientRect ? context.getBoundingClientRect().width : 0;
    var widthStyle = String(el.style.width || '').trim();
    if (/%$/.test(widthStyle) && contextWidth > 0) return contextWidth * (parseFloat(widthStyle) || 0) / 100;
    if (/px$/.test(widthStyle)) return parseFloat(widthStyle) || 0;
    return 0;
  }
  function autoplayYoutubeSrc(src){
    if (!src || !/youtube\\.com\\/embed\\//i.test(src)) return src;
    try {
      var url = new URL(src, window.location.href);
      url.searchParams.set('autoplay', '1');
      url.searchParams.set('mute', '1');
      url.searchParams.set('playsinline', '1');
      return url.href;
    } catch (error) {
      var next = src;
      if (!/[?&]autoplay=/i.test(next)) next += (next.indexOf('?') >= 0 ? '&' : '?') + 'autoplay=1';
      if (!/[?&]mute=/i.test(next)) next += '&mute=1';
      if (!/[?&]playsinline=/i.test(next)) next += '&playsinline=1';
      return next;
    }
  }
  function normalizeYoutube(root){
    qsa('.free-element[data-type="youtube"]', root || document).forEach(function(el){
      el.setAttribute('data-youtube-aspect-ratio', '1.7777777778');
      el.style.aspectRatio = '16 / 9';
      var widthPx = widthPxFor(el);
      if (widthPx > 0) el.style.height = Math.round(widthPx / ratio) + 'px';
      qsa('iframe.editable-youtube, .youtube-inner iframe', el).forEach(function(iframe){
        var src = iframe.getAttribute('src') || '';
        var autoplaySrc = autoplayYoutubeSrc(src);
        if (autoplaySrc && autoplaySrc !== src) iframe.setAttribute('src', autoplaySrc);
        iframe.setAttribute('width', '560');
        iframe.setAttribute('height', '315');
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
        iframe.setAttribute('loading', 'eager');
      });
    });
  }
  document.addEventListener('click', function(event){
    if (!isPublicView()) return;
    var head = event.target.closest && event.target.closest('.accordion-dropdown-template .accordion-item-head, .accordion-dropdown-template [data-accordion-toggle]');
    if (!head) return;
    var root = head.closest('.accordion-dropdown-template');
    var item = head.closest('.accordion-item-template');
    if (!root || !item) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    var shouldOpen = !item.classList.contains('open');
    qsa('.accordion-item-template.open', root).forEach(function(openItem){
      if (openItem !== item) openItem.classList.remove('open');
    });
    item.classList.toggle('open', shouldOpen);
  }, true);
  function run(){ normalizeYoutube(document); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('resize', run);
  if (window.MutationObserver) {
    var timer = null;
    new MutationObserver(function(){
      clearTimeout(timer);
      timer = setTimeout(run, 60);
    }).observe(document.body || document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
  }
})();`;
      };
      window.buildExportJS.__accordionVideo16x9V172 = true;
      try { buildExportJS = window.buildExportJS; } catch (error) {}
    }
  }

  function boot() {
    injectCSS();
    installAccordionDelegation();
    wrapEditorFunctions();
    wrapExportBuilders();
    normalizeAllYoutube(document);
    setTimeout(function(){ normalizeAllYoutube(document); }, 80);
    setTimeout(function(){ normalizeAllYoutube(document); }, 320);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.addEventListener('resize', function(){ normalizeAllYoutube(document); });

  if (window.MutationObserver) {
    let youtubeTimer = null;
    new MutationObserver(function(){
      clearTimeout(youtubeTimer);
      youtubeTimer = setTimeout(function(){ normalizeAllYoutube(document); }, 80);
    }).observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src', 'class', 'style']
    });
  }
})();
