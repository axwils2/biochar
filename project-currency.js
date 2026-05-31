// project-currency.js — window.BiocharProjectCurrency
// Country list (ISO 3166-1 alpha-2) and country → currency (ISO 4217) map.
// Localized country names are resolved via Intl.DisplayNames so translations
// don't have to be maintained per-country in translations.js.
(function () {
  'use strict';

  const COUNTRY_CODES = [
    "AD","AE","AF","AG","AL","AM","AO","AR","AT","AU","AW","AZ",
    "BA","BB","BD","BE","BF","BG","BH","BI","BJ","BM","BN","BO","BR","BS","BT","BW","BY","BZ",
    "CA","CD","CF","CG","CH","CI","CL","CM","CN","CO","CR","CU","CV","CY","CZ",
    "DE","DJ","DK","DM","DO","DZ",
    "EC","EE","EG","ER","ES","ET",
    "FI","FJ","FM","FR",
    "GA","GB","GD","GE","GH","GM","GN","GQ","GR","GT","GW","GY",
    "HK","HN","HR","HT","HU",
    "ID","IE","IL","IN","IQ","IR","IS","IT",
    "JM","JO","JP",
    "KE","KG","KH","KI","KM","KN","KP","KR","KW","KY","KZ",
    "LA","LB","LC","LI","LK","LR","LS","LT","LU","LV","LY",
    "MA","MC","MD","ME","MG","MH","MK","ML","MM","MN","MO","MR","MT","MU","MV","MW","MX","MY","MZ",
    "NA","NE","NG","NI","NL","NO","NP","NR","NZ",
    "OM",
    "PA","PE","PG","PH","PK","PL","PR","PS","PT","PW","PY",
    "QA",
    "RO","RS","RU","RW",
    "SA","SB","SC","SD","SE","SG","SI","SK","SL","SM","SN","SO","SR","SS","ST","SV","SY","SZ",
    "TD","TG","TH","TJ","TL","TM","TN","TO","TR","TT","TV","TW","TZ",
    "UA","UG","US","UY","UZ",
    "VA","VC","VE","VN","VU",
    "WS",
    "XK",
    "YE",
    "ZA","ZM","ZW"
  ];

  const COUNTRY_TO_CURRENCY = {
    AD:"EUR", AE:"AED", AF:"AFN", AG:"XCD", AL:"ALL", AM:"AMD", AO:"AOA", AR:"ARS", AT:"EUR", AU:"AUD", AW:"AWG", AZ:"AZN",
    BA:"BAM", BB:"BBD", BD:"BDT", BE:"EUR", BF:"XOF", BG:"BGN", BH:"BHD", BI:"BIF", BJ:"XOF", BM:"BMD", BN:"BND", BO:"BOB", BR:"BRL", BS:"BSD", BT:"BTN", BW:"BWP", BY:"BYN", BZ:"BZD",
    CA:"CAD", CD:"CDF", CF:"XAF", CG:"XAF", CH:"CHF", CI:"XOF", CL:"CLP", CM:"XAF", CN:"CNY", CO:"COP", CR:"CRC", CU:"CUP", CV:"CVE", CY:"EUR", CZ:"CZK",
    DE:"EUR", DJ:"DJF", DK:"DKK", DM:"XCD", DO:"DOP", DZ:"DZD",
    EC:"USD", EE:"EUR", EG:"EGP", ER:"ERN", ES:"EUR", ET:"ETB",
    FI:"EUR", FJ:"FJD", FM:"USD", FR:"EUR",
    GA:"XAF", GB:"GBP", GD:"XCD", GE:"GEL", GH:"GHS", GM:"GMD", GN:"GNF", GQ:"XAF", GR:"EUR", GT:"GTQ", GW:"XOF", GY:"GYD",
    HK:"HKD", HN:"HNL", HR:"EUR", HT:"HTG", HU:"HUF",
    ID:"IDR", IE:"EUR", IL:"ILS", IN:"INR", IQ:"IQD", IR:"IRR", IS:"ISK", IT:"EUR",
    JM:"JMD", JO:"JOD", JP:"JPY",
    KE:"KES", KG:"KGS", KH:"KHR", KI:"AUD", KM:"KMF", KN:"XCD", KP:"KPW", KR:"KRW", KW:"KWD", KY:"KYD", KZ:"KZT",
    LA:"LAK", LB:"LBP", LC:"XCD", LI:"CHF", LK:"LKR", LR:"LRD", LS:"LSL", LT:"EUR", LU:"EUR", LV:"EUR", LY:"LYD",
    MA:"MAD", MC:"EUR", MD:"MDL", ME:"EUR", MG:"MGA", MH:"USD", MK:"MKD", ML:"XOF", MM:"MMK", MN:"MNT", MO:"MOP", MR:"MRU", MT:"EUR", MU:"MUR", MV:"MVR", MW:"MWK", MX:"MXN", MY:"MYR", MZ:"MZN",
    NA:"NAD", NE:"XOF", NG:"NGN", NI:"NIO", NL:"EUR", NO:"NOK", NP:"NPR", NR:"AUD", NZ:"NZD",
    OM:"OMR",
    PA:"PAB", PE:"PEN", PG:"PGK", PH:"PHP", PK:"PKR", PL:"PLN", PR:"USD", PS:"ILS", PT:"EUR", PW:"USD", PY:"PYG",
    QA:"QAR",
    RO:"RON", RS:"RSD", RU:"RUB", RW:"RWF",
    SA:"SAR", SB:"SBD", SC:"SCR", SD:"SDG", SE:"SEK", SG:"SGD", SI:"EUR", SK:"EUR", SL:"SLE", SM:"EUR", SN:"XOF", SO:"SOS", SR:"SRD", SS:"SSP", ST:"STN", SV:"USD", SY:"SYP", SZ:"SZL",
    TD:"XAF", TG:"XOF", TH:"THB", TJ:"TJS", TL:"USD", TM:"TMT", TN:"TND", TO:"TOP", TR:"TRY", TT:"TTD", TV:"AUD", TW:"TWD", TZ:"TZS",
    UA:"UAH", UG:"UGX", US:"USD", UY:"UYU", UZ:"UZS",
    VA:"EUR", VC:"XCD", VE:"VES", VN:"VND", VU:"VUV",
    WS:"WST",
    XK:"EUR",
    YE:"YER",
    ZA:"ZAR", ZM:"ZMW", ZW:"ZWG"
  };

  // Legacy slugs from before this project used ISO codes (so saved projects still work).
  const LEGACY_COUNTRY_SLUGS = {
    bolivia:"BO", brazil:"BR", colombia:"CO", costa_rica:"CR",
    dominican_republic:"DO", ecuador:"EC", el_salvador:"SV",
    guatemala:"GT", honduras:"HN", mexico:"MX", nicaragua:"NI",
    panama:"PA", peru:"PE"
    // "custom" stays "custom" — handled by callers that want a generic fallback.
  };

  function normalizeCountryCode(raw) {
    if (!raw) return '';
    if (raw === 'custom') return 'custom';
    if (LEGACY_COUNTRY_SLUGS[raw]) return LEGACY_COUNTRY_SLUGS[raw];
    return String(raw).toUpperCase();
  }

  function getProjectCurrency() {
    try {
      const data = (window.BiocharEngine && window.BiocharEngine.loadProjectData())
        || JSON.parse(localStorage.getItem('biocharProjectData') || '{}');
      const raw = data && data.tool1 && data.tool1.country;
      if (!raw) return 'USD';
      const code = normalizeCountryCode(raw);
      return COUNTRY_TO_CURRENCY[code] || 'USD';
    } catch (_) { return 'USD'; }
  }

  function getCountryDisplayName(code, lang) {
    const norm = normalizeCountryCode(code);
    if (!norm || norm === 'custom') return '';
    try {
      const dn = new Intl.DisplayNames([lang || 'en'], { type: 'region' });
      return dn.of(norm) || norm;
    } catch (_) {
      return norm;
    }
  }

  // Convert any inputs with [data-usd-default] from their original USD value
  // to the project currency. Only writes the conversion when the input still
  // contains the untouched USD default — protects user-entered or restored values.
  function applyHtmlDefaults(root) {
    const scope = root || document;
    const code = getProjectCurrency();
    if (!code || code === 'USD') return;
    if (!window.BiocharCurrency || !window.BiocharCurrency._rates) return;
    scope.querySelectorAll('[data-usd-default]').forEach(el => {
      const usd = parseFloat(el.dataset.usdDefault);
      if (!isFinite(usd)) return;
      const current = parseFloat(el.value);
      if (!isFinite(current) || current !== usd) return;
      const converted = window.BiocharCurrency.fromBase(usd, code);
      el.value = converted >= 100 ? converted.toFixed(0) : converted.toFixed(2);
      // Match the field's currency selector to the project currency if present.
      const sel = document.getElementById(el.id + '_currency');
      if (sel) sel.value = code;
    });
  }

  window.BiocharProjectCurrency = {
    COUNTRY_CODES,
    COUNTRY_TO_CURRENCY,
    LEGACY_COUNTRY_SLUGS,
    normalizeCountryCode,
    getProjectCurrency,
    getCountryDisplayName,
    applyHtmlDefaults
  };
})();
