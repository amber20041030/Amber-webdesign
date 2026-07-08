/* v196: export sticky header/navbar as fixed top navigation. */
(function(){
  'use strict';

  if (window.__stickyExportReliabilityV196) return;
  window.__stickyExportReliabilityV196 = true;

  const CSS = `
body.exported-site .html-zone.zone-header,
body.exported-site header,
body.exported-site .rwd-export-mode-v186 {
  overflow: visible !important;
}

body.exported-site .html-zone.zone-sticky-top,
body.exported-site header.site-sticky-top-wrap,
body.exported-site .html-block.site-sticky-top,
body.exported-site .html-block.site-fixed-top {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  width: 100% !important;
  z-index: 2147483003 !important;
  overflow: visible !important;
}

body.exported-site .html-zone.zone-sticky-top > .html-block.site-sticky-top,
body.exported-site header.site-sticky-top-wrap > .html-block.site-sticky-top {
  position: relative !important;
  top: auto !important;
  z-index: 2147483004 !important;
}

body.exported-site .html-block.site-fixed-top {
  z-index: 2147483003 !important;
}
`;

  function applySticky(root = document) {
    const scope = root.querySelectorAll ? root : document;
    scope.querySelectorAll('.html-block').forEach(block => {
      const sticky = block.dataset?.stickyTop === 'true' || block.getAttribute('data-sticky-top') === 'true';
      const fixedTop = block.dataset?.fixedTop === 'true' || block.getAttribute('data-fixed-top') === 'true';
      const fixedBottom = block.dataset?.fixedBottom === 'true' || block.getAttribute('data-fixed-bottom') === 'true';
      block.classList.toggle('site-sticky-top', sticky && !fixedTop);
      block.classList.toggle('site-fixed-top', fixedTop || sticky);
      block.classList.toggle('site-fixed-bottom', fixedBottom);
    });

    scope.querySelectorAll('header, .html-zone.zone-header').forEach(zone => {
      const hasSticky = Array.from(zone.children).some(child =>
        child.classList?.contains('html-block') && child.classList.contains('site-sticky-top')
      );
      zone.classList.toggle('site-sticky-top-wrap', hasSticky);
      zone.classList.toggle('zone-sticky-top', hasSticky);
    });
  }

  function cleanHTML(html) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html || '';
    applySticky(wrapper);
    return wrapper.innerHTML;
  }

  function runtime() {
    return `
(function(){
  if (window.__fixedNavExportRuntimeV196) return;
  window.__fixedNavExportRuntimeV196 = true;
  function apply(){
    document.querySelectorAll('.html-block').forEach(function(block){
      var sticky = block.getAttribute('data-sticky-top') === 'true' || (block.dataset && block.dataset.stickyTop === 'true');
      var fixedTop = block.getAttribute('data-fixed-top') === 'true' || (block.dataset && block.dataset.fixedTop === 'true');
      var fixedBottom = block.getAttribute('data-fixed-bottom') === 'true' || (block.dataset && block.dataset.fixedBottom === 'true');
      block.classList.toggle('site-sticky-top', sticky && !fixedTop);
      block.classList.toggle('site-fixed-top', fixedTop || sticky);
      block.classList.toggle('site-fixed-bottom', fixedBottom);
      if (sticky || fixedTop) {
        block.style.position = 'fixed';
        block.style.top = '0px';
        block.style.left = '0px';
        block.style.right = '0px';
        block.style.width = '100%';
        block.style.zIndex = '2147483003';
        block.style.overflow = 'visible';
      }
    });
    document.querySelectorAll('header, .html-zone.zone-header').forEach(function(zone){
      var hasSticky = Array.prototype.slice.call(zone.children).some(function(child){
        return child.classList && child.classList.contains('html-block') && child.classList.contains('site-sticky-top');
      });
      zone.classList.toggle('site-sticky-top-wrap', hasSticky);
      zone.classList.toggle('zone-sticky-top', hasSticky);
      if (hasSticky) {
        zone.style.position = 'fixed';
        zone.style.top = '0px';
        zone.style.left = '0px';
        zone.style.right = '0px';
        zone.style.width = '100%';
        zone.style.zIndex = '2147483000';
        zone.style.overflow = 'visible';
      }
    });
  }
  function schedule(){ requestAnimationFrame(function(){ apply(); setTimeout(apply, 80); setTimeout(apply, 260); setTimeout(apply, 700); }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule); else schedule();
  window.addEventListener('load', schedule);
  window.addEventListener('resize', schedule);
})();`;
  }

  function install() {
    applySticky(document);

    if (typeof window.cleanHTMLForExport === 'function' && !window.cleanHTMLForExport.__stickyV195) {
      const previous = window.cleanHTMLForExport;
      const wrapped = function() {
        return cleanHTML(previous.apply(this, arguments));
      };
      wrapped.__stickyV195 = true;
      window.cleanHTMLForExport = wrapped;
      try { cleanHTMLForExport = wrapped; } catch (error) {}
    }

    if (typeof window.cleanPageCloneForExport === 'function' && !window.cleanPageCloneForExport.__stickyV195) {
      const previous = window.cleanPageCloneForExport;
      const wrapped = function(clone) {
        if (clone?.querySelectorAll) applySticky(clone);
        const result = previous.apply(this, arguments);
        return typeof result === 'string' ? cleanHTML(result) : result;
      };
      wrapped.__stickyV195 = true;
      window.cleanPageCloneForExport = wrapped;
      try { cleanPageCloneForExport = wrapped; } catch (error) {}
    }

    if (typeof window.buildExportCSS === 'function' && !window.buildExportCSS.__stickyV195) {
      const previous = window.buildExportCSS;
      const wrapped = function() {
        return previous.apply(this, arguments) + '\\n' + CSS + '\\n';
      };
      wrapped.__stickyV195 = true;
      window.buildExportCSS = wrapped;
      try { buildExportCSS = wrapped; } catch (error) {}
    }

    if (typeof window.buildExportJS === 'function' && !window.buildExportJS.__stickyV195) {
      const previous = window.buildExportJS;
      const wrapped = function() {
        return previous.apply(this, arguments) + runtime();
      };
      wrapped.__stickyV195 = true;
      window.buildExportJS = wrapped;
      try { buildExportJS = wrapped; } catch (error) {}
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
  else install();
  window.addEventListener('load', () => setTimeout(install, 80));
})();
