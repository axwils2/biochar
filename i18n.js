window.BiocharI18n = (function () {
  const STORAGE_KEY = 'biocharLang';
  const DEFAULT_LANG = 'en';

  function getCurrentLang() {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  }

  function setLanguage(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    location.reload();
  }

  function t(key, vars) {
    vars = vars || {};
    const lang = getCurrentLang();
    const parts = key.split('.');
    const namespace = parts[0];
    const subkey = parts.slice(1).join('.');
    const tr = window.BiocharTranslations || {};
    let str =
      (tr[lang] && tr[lang][namespace] && tr[lang][namespace][subkey] !== undefined
        ? tr[lang][namespace][subkey]
        : null) ||
      (tr[DEFAULT_LANG] && tr[DEFAULT_LANG][namespace] && tr[DEFAULT_LANG][namespace][subkey] !== undefined
        ? tr[DEFAULT_LANG][namespace][subkey]
        : null) ||
      key;
    return Object.keys(vars).reduce(function (s, k) {
      return s.replace('{' + k + '}', vars[k]);
    }, str);
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Swap text content
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.dataset.i18n);
    });
    // Swap placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      el.placeholder = t(el.dataset.i18nPlaceholder);
    });
    // Swap innerHTML (for tooltips with HTML content)
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      el.innerHTML = t(el.dataset.i18nHtml);
    });
    // Set language select value
    var sel = document.getElementById('lang-select');
    if (sel) sel.value = getCurrentLang();
  });

  return { getCurrentLang: getCurrentLang, setLanguage: setLanguage, t: t };
})();
