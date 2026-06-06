// currency.js — window.BiocharCurrency
(function () {
  'use strict';

  // Used as the offline fallback list when the FX API is unreachable,
  // and as the seed list for currency selectors before rates have loaded.
  // Once rates are fetched, selectors are populated from the full rates table.
  const FALLBACK_LIST = [
    { code: 'USD', symbol: '$',  name: 'US Dollar' },
    { code: 'MXN', symbol: '$',  name: 'Mexican Peso' },
    { code: 'COP', symbol: '$',  name: 'Colombian Peso' },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
    { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol' },
    { code: 'GTQ', symbol: 'Q',  name: 'Guatemalan Quetzal' },
    { code: 'HNL', symbol: 'L',  name: 'Honduran Lempira' },
    { code: 'NIO', symbol: 'C$', name: 'Nicaraguan Córdoba' },
    { code: 'CRC', symbol: '₡',  name: 'Costa Rican Colón' },
  ];

  function deriveSymbol(code) {
    try {
      const parts = new Intl.NumberFormat('en-US', { style: 'currency', currency: code })
        .formatToParts(0);
      const sym = parts.find(p => p.type === 'currency');
      return sym ? sym.value : code;
    } catch (_) { return code; }
  }

  function projectDefaultCode() {
    try {
      return (window.BiocharProjectCurrency && window.BiocharProjectCurrency.getProjectCurrency()) || 'USD';
    } catch (_) { return 'USD'; }
  }

  window.BiocharCurrency = {
    SUPPORTED: FALLBACK_LIST,

    RATES_KEY: 'biocharExchangeRates_v2',
    RATES_TTL: 86400000, // 24 hours in ms
    _rates: null,
    _ratesPromise: null,

    _isValidRateTable(rates) {
      return rates && typeof rates === 'object'
        && rates.USD === 1
        && Object.keys(rates).length >= 100;
    },

    getRates() {
      if (this._rates) return Promise.resolve(this._rates);
      if (this._ratesPromise) return this._ratesPromise;
      this._ratesPromise = (async () => {
        try {
          const cached = JSON.parse(localStorage.getItem(this.RATES_KEY) || 'null');
          if (cached && Date.now() - cached.timestamp < this.RATES_TTL
              && this._isValidRateTable(cached.rates)) {
            this._rates = cached.rates;
            return this._rates;
          }
        } catch (_) {}
        try {
          const resp = await fetch('https://open.er-api.com/v6/latest/USD');
          if (!resp.ok) throw new Error('rate fetch http ' + resp.status);
          const data = await resp.json();
          if (data.result !== 'success' || !data.rates) {
            throw new Error('rate fetch unexpected payload');
          }
          const rates = Object.assign({ USD: 1 }, data.rates);
          if (!this._isValidRateTable(rates)) {
            throw new Error('rate fetch table failed validation');
          }
          this._rates = rates;
          localStorage.setItem(this.RATES_KEY, JSON.stringify({
            rates: this._rates, timestamp: Date.now()
          }));
        } catch (_) {
          // Offline fallback — USD pass-through only. Do NOT cache this.
          this._rates = { USD: 1 };
        }
        return this._rates;
      })();
      return this._ratesPromise;
    },

    toBase(amount, fromCode) {
      if (!fromCode || fromCode === 'USD') return amount;
      const rate = this._rates && this._rates[fromCode];
      return rate ? amount / rate : amount;
    },

    fromBase(amount, toCode) {
      if (!toCode || toCode === 'USD') return amount;
      const rate = this._rates && this._rates[toCode];
      return rate ? amount * rate : amount;
    },

    format(baseUsdAmount, toCode, decimals) {
      const dec = (decimals === undefined) ? 0 : decimals;
      let code = toCode || 'USD';
      // Guard against silent label/number mismatch: if rates aren't loaded yet,
      // or this specific code is missing from the table, fall back to USD so
      // the symbol always matches the number we're rendering.
      if (code !== 'USD' && !(this._rates && this._rates[code])) {
        if (!this._missingRateWarned) this._missingRateWarned = {};
        if (!this._missingRateWarned[code]) {
          this._missingRateWarned[code] = true;
          console.warn('[BiocharCurrency] missing rate for ' + code + ', rendering as USD');
        }
        code = 'USD';
      }
      const converted = this.fromBase(baseUsdAmount, code);
      try {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: code,
          maximumFractionDigits: dec,
          minimumFractionDigits: dec,
        }).format(converted);
      } catch (_) {
        return code + ' ' + Math.round(converted).toLocaleString();
      }
    },

    // Returns the list of currency codes to show in selectors. After rates
    // load, this is the full world list (alphabetical). Before rates are
    // ready, falls back to the curated short list.
    getOptionCodes() {
      if (this._rates) {
        return Object.keys(this._rates).sort();
      }
      return FALLBACK_LIST.map(c => c.code);
    },

    _optionsHtml(selectedCode, short) {
      const codes = this.getOptionCodes();
      const sel = selectedCode || projectDefaultCode();
      return codes.map(code => {
        const isSel = code === sel ? ' selected' : '';
        const label = short ? code : `${deriveSymbol(code)} ${code}`;
        return `<option value="${code}"${isSel}>${label}</option>`;
      }).join('');
    },

    // Populate an existing <select> with the current options list.
    populateSelect(selectEl, selectedCode, short) {
      if (!selectEl) return;
      const current = selectedCode || selectEl.value || projectDefaultCode();
      selectEl.innerHTML = this._optionsHtml(current, short);
      selectEl.value = current;
    },

    wrapInput(fieldId, selectedCode, onchangeFn) {
      const input = document.getElementById(fieldId);
      if (!input || input.parentElement.classList.contains('currency-input-wrap')) return;
      const wrap = document.createElement('div');
      wrap.className = 'currency-input-wrap';
      input.parentNode.insertBefore(wrap, input);
      const sel = document.createElement('select');
      sel.id = fieldId + '_currency';
      sel.className = 'currency-prefix-select';
      sel.innerHTML = this._optionsHtml(selectedCode, false);
      if (onchangeFn) sel.setAttribute('onchange', `${onchangeFn}('${fieldId}')`);
      wrap.appendChild(sel);
      wrap.appendChild(input);
      input.classList.add('currency-input');
    },

    injectOutputSelect(fieldId, selectedCode, onchangeFn) {
      const el = document.getElementById(fieldId);
      if (!el || document.getElementById(fieldId + '_currency')) return;
      const sel = document.createElement('select');
      sel.id = fieldId + '_currency';
      sel.className = 'currency-output-select';
      sel.innerHTML = this._optionsHtml(selectedCode, true);
      if (onchangeFn) sel.setAttribute('onchange', `${onchangeFn}('${fieldId}')`);
      el.insertAdjacentElement('afterend', sel);
    },

    // Wrap a class-based input inside a dynamic route card (Tool 3)
    wrapClassInput(inputEl, fieldClass, selectedCode, onchangeFn) {
      if (!inputEl || inputEl.parentElement.classList.contains('currency-input-wrap')) return;
      const wrap = document.createElement('div');
      wrap.className = 'currency-input-wrap';
      inputEl.parentNode.insertBefore(wrap, inputEl);
      const sel = document.createElement('select');
      sel.className = 'currency-prefix-select ' + fieldClass + '_currency';
      sel.innerHTML = this._optionsHtml(selectedCode, false);
      if (onchangeFn) sel.setAttribute('onchange', `${onchangeFn}('${fieldClass}', this.closest('.route-card'))`);
      wrap.appendChild(sel);
      wrap.appendChild(inputEl);
      inputEl.classList.add('currency-input');
    },
  };
})();
