/* v173: unified ZIP download names. */
(function(){
  'use strict';

  if (window.__exportFilenamePolicyV173) return;
  window.__exportFilenamePolicyV173 = true;

  const EDITOR_COUNT_KEY = 'editor-backup-export-count-v173';
  const INTENT_TTL = 60000;

  function getCount() {
    const n = parseInt(localStorage.getItem(EDITOR_COUNT_KEY) || '0', 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }

  function nextEditorName() {
    const next = getCount() + 1;
    localStorage.setItem(EDITOR_COUNT_KEY, String(next));
    return 'editor' + next + '.zip';
  }

  function setIntent(kind) {
    window.__zipDownloadIntentV173 = {
      kind,
      expires: Date.now() + INTENT_TTL
    };
  }

  function takeIntent() {
    const intent = window.__zipDownloadIntentV173;
    if (!intent || intent.expires < Date.now()) return null;
    window.__zipDownloadIntentV173 = null;
    return intent.kind;
  }

  function isZipDownload(anchor) {
    const name = String(anchor && anchor.download || '').toLowerCase();
    const href = String(anchor && anchor.href || '').toLowerCase();
    return name.endsWith('.zip') || href.startsWith('blob:');
  }

  window.getEditorBackupDownloadNameV173 = nextEditorName;
  window.getSiteExportDownloadNameV173 = function() {
    return 'demo-site.zip';
  };

  document.addEventListener('click', event => {
    if (event.target && event.target.closest && event.target.closest('#exportEditorBackupBtn')) {
      setIntent('editor');
      return;
    }
    if (event.target && event.target.closest && event.target.closest('#exportBtn')) {
      setIntent('site');
    }
  }, true);

  const nativeClick = HTMLAnchorElement.prototype.click;
  if (!nativeClick.__exportFilenamePolicyWrappedV173) {
    const wrappedClick = function() {
      if (isZipDownload(this)) {
        const currentName = String(this.download || '');
        const intent = takeIntent();
        if (intent === 'editor' || /editor|backup/i.test(currentName)) {
          this.download = nextEditorName();
        } else {
          this.download = 'demo-site.zip';
        }
      }
      return nativeClick.apply(this, arguments);
    };
    wrappedClick.__exportFilenamePolicyWrappedV173 = true;
    HTMLAnchorElement.prototype.click = wrappedClick;
  }
})();
