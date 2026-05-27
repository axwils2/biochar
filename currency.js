// currency.js — window.BiocharCurrency
(function () {
  'use strict';

  window.BiocharCurrency = {
    SUPPORTED: [
      { code: 'USD', symbol: '$',  name: 'US Dollar' },
      { code: 'MXN', symbol: '$',  name: 'Mexican Peso' },
      { code: 'COP', symbol: '$',  name: 'Colombian Peso' },
      { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
      { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol' },
      { code: 'GTQ', symbol: 'Q',  name: 'Guatemalan Quetzal' },
      { code: 'HNL', symbol: 'L',  name: 'Honduran Lempira' },
      { code: 'NIO', symbol: 'C$', name: 'Nicaraguan Córdoba' },
      { code: 'CRC', symbol: '₡',  name: 'Costa Rican Colón' },
    ],

    RATES_KEY: 'biocharExchangeRates',
    RATES_TTL: 86400000, // 24 hours in ms
    _rates: null,

    async getRates() {
      if (this._rates) return this._rates;
      try {
        const cached = JSON.parse(localStorage.getItem(this.RATES_KEY) || 'null');
        if (cached && Date.now() - cached.timestamp < this.RATES_TTL) {
          this._rates = cached.rates;
          return this._rates;
        }
      } catch (_) {}
      try {
        const codes = this.SUPPORTED.map(c => c.code).filter(c => c !== 'USD').join(',');
        const resp = await fetch(`https://api.frankfurter.dev/latest?from=USD&to=${codes}`);
        const data = await resp.json();
        this._rates = { USD: 1, ...data.rates };
        localStorage.setItem(this.RATES_KEY, JSON.stringify({
          rates: this._rates, timestamp: Date.now()
        }));
      } catch (_) {
        // Offline fallback — USD pass-through only
        this._rates = { USD: 1 };
        this.SUPPORTED.forEach(c => { if (!this._rates[c.code]) this._rates[c.code] = null; });
      }
      return this._rates;
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
      const converted = this.fromBase(baseUsdAmount, toCode || 'USD');
      try {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: toCode || 'USD',
          maximumFractionDigits: dec,
          minimumFractionDigits: dec,
        }).format(converted);
      } catch (_) {
        return (toCode || 'USD') + ' ' + Math.round(converted).toLocaleString();
      }
    },

    _optionsHtml(selectedCode, short) {
      return this.SUPPORTED.map(c => {
        const sel = c.code === (selectedCode || 'USD') ? ' selected' : '';
        const label = short ? c.code : `${c.symbol} ${c.code}`;
        return `<option value="${c.code}"${sel}>${label}</option>`;
      }).join('');
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
