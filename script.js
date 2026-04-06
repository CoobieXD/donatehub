// ============================================================
// КОНФИГ — редактируй config.json
// ============================================================
const LS_THEME = "donatehub_theme";
const LS_LOCALE = "donatehub_locale";
const LS_CLICKS = "donatehub_clicks";

let CONFIG = null;

async function loadConfig() {
  const resp = await fetch("config.json");
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  CONFIG = await resp.json();
  validateConfig(CONFIG);
}

function validateConfig(config) {
  if (!config.streamerName) throw new Error("Отсутствует streamerName");
  if (!config.platforms || typeof config.platforms !== "object") {
    throw new Error("platforms должен быть объектом");
  }
  for (const [region, items] of Object.entries(config.platforms)) {
    if (!Array.isArray(items)) throw new Error(`platforms.${region} должен быть массивом`);
    for (const p of items) {
      if (!p.id || !p.name || !p.url) {
        throw new Error(`Платформа в регионе "${region}" должна иметь id, name и url`);
      }
    }
  }
}

// ============================================================
// i18n
// ============================================================
const I18N = {
  ru: {
    supportTitle: "Поддержать",
    supportSub: "Выберите удобный способ",
    loading: "Определяем регион...",
    errorDefault: "Не удалось загрузить конфигурацию",
    retry: "Попробовать снова",
    sectionDonate: "Донат с оповещением",
    sectionExtra: "Подписка и другое",
    sectionRequisites: "Реквизиты для перевода",
    footer: "Спасибо за поддержку!",
    redirectDesc: "Вы обычно используете эту платформу",
    countdownPrefix: "Перенаправление через",
    countdownSuffix: "сек...",
    redirectBtn: "Перейти сейчас",
    redirectCancel: "Отмена — выбрать другую",
    copy: "Скопировать",
    copied: "Скопировано!",
    themeTitle: "Сменить тему",
    localeTitle: "Сменить регион",
  },
  uk: {
    supportTitle: "Підтримати",
    supportSub: "Оберіть зручний спосіб",
    loading: "Визначаємо регіон...",
    errorDefault: "Не вдалося завантажити конфігурацію",
    retry: "Спробувати знову",
    sectionDonate: "Донат зі сповіщенням",
    sectionExtra: "Підписка та інше",
    sectionRequisites: "Реквізити для переказу",
    footer: "Дякуємо за підтримку!",
    redirectDesc: "Ви зазвичай використовуєте цю платформу",
    countdownPrefix: "Перенаправлення через",
    countdownSuffix: "сек...",
    redirectBtn: "Перейти зараз",
    redirectCancel: "Скасувати — обрати іншу",
    copy: "Скопіювати",
    copied: "Скопійовано!",
    themeTitle: "Змінити тему",
    localeTitle: "Змінити регіон",
  },
  en: {
    supportTitle: "Support",
    supportSub: "Choose your preferred method",
    loading: "Detecting region...",
    errorDefault: "Failed to load configuration",
    retry: "Try again",
    sectionDonate: "Donate with alert",
    sectionExtra: "Subscribe & more",
    sectionRequisites: "Transfer details",
    footer: "Thanks for your support!",
    redirectDesc: "You usually use this platform",
    countdownPrefix: "Redirecting in",
    countdownSuffix: "sec...",
    redirectBtn: "Go now",
    redirectCancel: "Cancel — choose another",
    copy: "Copy",
    copied: "Copied!",
    themeTitle: "Switch theme",
    localeTitle: "Switch region",
  },
};

const REGION_TO_LANG = { UA: "uk", RU: "ru", _global: "en" };

let currentRegion = "_global";
let currentCountryCode = "";
let currentLang = "ru";

function t(key) {
  return (I18N[currentLang] || I18N.ru)[key] || I18N.ru[key] || key;
}

function applyTranslations() {
  const name = CONFIG ? CONFIG.streamerName : "стримера";

  $("headerTitle").childNodes[0].textContent = t("supportTitle") + " ";
  $("streamerName").textContent = name;
  $("headerSub").textContent = t("supportSub");
  $("loadingText").textContent = t("loading");
  $("errorText").textContent = t("errorDefault");
  $("errorRetry").textContent = t("retry");
  $("sectionDonateTitle").textContent = t("sectionDonate");
  $("sectionExtraTitle").textContent = t("sectionExtra");
  $("sectionRequisitesTitle").textContent = t("sectionRequisites");
  $("footerText").textContent = t("footer");
  $("redirectDesc").textContent = t("redirectDesc");
  $("countdownPrefix").textContent = t("countdownPrefix");
  $("countdownSuffix").textContent = t("countdownSuffix");
  $("redirectBtn").textContent = t("redirectBtn");
  $("cancelRedirectBtn").textContent = t("redirectCancel");
  $("themeToggle").title = t("themeTitle");
  $("themeToggle").setAttribute("aria-label", t("themeTitle"));
  $("localeToggle").title = t("localeTitle");
  $("localeToggle").setAttribute("aria-label", t("localeTitle"));

  document.querySelectorAll(".requisite__copy:not(.requisite__copy--done)").forEach((btn) => {
    btn.setAttribute("data-tooltip", t("copy"));
  });

  const langAttr = { uk: "uk", ru: "ru", en: "en" };
  document.documentElement.lang = langAttr[currentLang] || "ru";

  // Highlight active locale item
  document.querySelectorAll(".locale-picker__item").forEach((item) => {
    item.classList.toggle("locale-picker__item--active", item.dataset.region === currentRegion);
  });
}

// ============================================================
// SVG-иконки платформ
// ============================================================
const ICONS = {
  monobank: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#1a1a1a"/>
    <path d="M20 10c-2 0-4 1-5 3-1 2 0 4 1 5l1 1c1 1 1 2 1 3v6h4v-6c0-1 0-2 1-3l1-1c1-1 2-3 1-5-1-2-3-3-5-3z" fill="#fff"/>
    <circle cx="17" cy="16" r="1.5" fill="#1a1a1a"/>
    <circle cx="23" cy="16" r="1.5" fill="#1a1a1a"/>
    <path d="M14 11c-1-1-3-1-4 0M26 11c1-1 3-1 4 0" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,
  donatello: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#ff6b00"/>
    <path d="M20 8a12 12 0 00-3.6 23.4V27l-2-2 1.5-1.5L18 25.6V20h-3v-2h3v-3.5a3.5 3.5 0 017 0V18h3v2h-3v5.6l2.1-2.1L28.6 25l-2 2v4.4A12 12 0 0020 8z" fill="#fff" fill-rule="evenodd"/>
  </svg>`,
  donationalerts: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#f57a00"/>
    <path d="M20 7l2.5 5.5H28l-4.5 3.5 1.8 5.5L20 18l-5.3 3.5 1.8-5.5L12 12.5h5.5z" fill="#fff"/>
    <rect x="17" y="24" width="6" height="3" rx="1" fill="#fff"/>
    <rect x="14" y="29" width="12" height="3" rx="1.5" fill="#fff"/>
  </svg>`,
  "donationalerts-ua": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#f57a00"/>
    <path d="M20 7l2.5 5.5H28l-4.5 3.5 1.8 5.5L20 18l-5.3 3.5 1.8-5.5L12 12.5h5.5z" fill="#fff"/>
    <rect x="17" y="24" width="6" height="3" rx="1" fill="#fff"/>
    <rect x="14" y="29" width="12" height="3" rx="1.5" fill="#fff"/>
  </svg>`,
  "donationalerts-global": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#f57a00"/>
    <path d="M20 7l2.5 5.5H28l-4.5 3.5 1.8 5.5L20 18l-5.3 3.5 1.8-5.5L12 12.5h5.5z" fill="#fff"/>
    <rect x="17" y="24" width="6" height="3" rx="1" fill="#fff"/>
    <rect x="14" y="29" width="12" height="3" rx="1.5" fill="#fff"/>
  </svg>`,
  donatex: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#6c5ce7"/>
    <path d="M12 12l7 8-7 8h5l4.5-5.3L26 28h5l-7-8 7-8h-5l-4.5 5.3L17 12h-5z" fill="#fff"/>
  </svg>`,
  donatepay: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#26a650"/>
    <circle cx="20" cy="20" r="10" stroke="#fff" stroke-width="2" fill="none"/>
    <path d="M18 14v12M18 14h3.5a3.5 3.5 0 010 7H18" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  streamlabs: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#80f5d2"/>
    <path d="M11 25l7-10h4l-3 5h7l-7 10h-4l3-5h-7z" fill="#09161f"/>
  </svg>`,
  kofi: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#ff5e5b"/>
    <path d="M10 15h16v2c0 5-3.5 9-8 9s-8-4-8-9v-2z" fill="#fff"/>
    <path d="M26 15h3a4 4 0 010 8h-3" stroke="#fff" stroke-width="2" fill="none"/>
    <path d="M18 18c-1-1.5-3-1.5-4 0s0 3.5 4 5.5c4-2 5-4 4-5.5s-3-1.5-4 0z" fill="#ff5e5b"/>
  </svg>`,
  paypal: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#003087"/>
    <path d="M15 30l1-6h3c5 0 8-3 8.5-7.5.5-4-2.5-6.5-7-6.5h-6L11 30h4z" fill="#0070e0"/>
    <path d="M13 32l1-6h3c5 0 8-3 8.5-7.5.5-4-2.5-6.5-7-6.5h-6L9 32h4z" fill="#fff"/>
    <path d="M17 16h3c2 0 3 1 2.8 3-.3 2-2 3.5-4 3.5h-2l-.8 4h-3l1.5-7.5L17 16z" fill="#003087"/>
  </svg>`,
  patreon: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#ff424d"/>
    <circle cx="23" cy="16" r="7" fill="#fff"/>
    <rect x="10" y="9" width="4" height="22" rx="2" fill="#fff"/>
  </svg>`,
  boosty: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#f15f2c"/>
    <path d="M20 6l-6 14h5l-3 14 12-18h-6l4-10h-6z" fill="#fff"/>
  </svg>`,
  crypto: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#f7931a"/>
    <text x="20" y="27" text-anchor="middle" fill="#fff" font-size="20" font-weight="bold" font-family="sans-serif">₿</text>
  </svg>`,
  steam: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#1b2838"/>
    <circle cx="22" cy="16" r="5" stroke="#fff" stroke-width="2" fill="none"/>
    <circle cx="22" cy="16" r="2" fill="#fff"/>
    <path d="M10 26l7-7" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
    <circle cx="14" cy="27" r="4" stroke="#fff" stroke-width="2" fill="none"/>
    <circle cx="14" cy="27" r="1.5" fill="#fff"/>
  </svg>`,
  usdt: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#26a17b"/>
    <path d="M12 12h16v4H12z" fill="#fff" rx="1"/>
    <rect x="18" y="16" width="4" height="14" rx="1" fill="#fff"/>
    <ellipse cx="20" cy="23" rx="8" ry="3" stroke="#fff" stroke-width="2" fill="none"/>
  </svg>`,
  btc: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#f7931a"/>
    <path d="M22 10v2M18 10v2M18 28v2M22 28v2" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
    <path d="M16 12h5c3 0 5 1.5 5 4s-1.5 3.5-3 4c2 .5 4 2 4 4.5 0 2.5-2 4.5-5.5 4.5H16V12z" fill="#fff"/>
    <path d="M19 12v8M19 20v9" stroke="#f7931a" stroke-width="3"/>
  </svg>`,
  ton: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#0098ea"/>
    <path d="M20 6L8 18l12 16 12-16L20 6z" fill="none" stroke="#fff" stroke-width="2.5"/>
    <path d="M20 10v20" stroke="#fff" stroke-width="2"/>
    <path d="M10.5 17.5h19" stroke="#fff" stroke-width="2"/>
  </svg>`,
  eth: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#627eea"/>
    <path d="M20 6l-8 14 8 4.5 8-4.5L20 6z" fill="#fff" opacity="0.6"/>
    <path d="M20 6v18.5l8-4.5L20 6z" fill="#fff" opacity="0.9"/>
    <path d="M20 26.5l-8-4.5L20 34l8-12-8 4.5z" fill="#fff" opacity="0.6"/>
    <path d="M20 26.5V34l8-12-8 4.5z" fill="#fff" opacity="0.9"/>
  </svg>`,
  sol: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#000"/>
    <defs><linearGradient id="sg" x1="8" y1="30" x2="32" y2="10" gradientUnits="userSpaceOnUse"><stop stop-color="#9945ff"/><stop offset="0.5" stop-color="#14f195"/><stop offset="1" stop-color="#00c2ff"/></linearGradient></defs>
    <path d="M10 27h16.5l3.5-3.5H13.5L10 27z" fill="url(#sg)"/>
    <path d="M10 16.5h16.5l3.5-3.5H13.5L10 16.5z" fill="url(#sg)"/>
    <path d="M10 20l3.5 3.5H30L26.5 20H10z" fill="url(#sg)"/>
  </svg>`,
  mastercard: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#1a1a2e"/>
    <circle cx="16" cy="20" r="8" fill="#eb001b" opacity="0.9"/>
    <circle cx="24" cy="20" r="8" fill="#f79e1b" opacity="0.9"/>
    <path d="M20 13.6a8 8 0 010 12.8 8 8 0 000-12.8z" fill="#ff5f00"/>
  </svg>`,
  visa: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#1a1f71"/>
    <path d="M17 16l-3 9h-3l-1.5-7c0-.4-.2-.7-.6-.8A11 11 0 006 16v-.3h4.5c.6 0 1.1.4 1.2 1l1.1 5.8L15.5 16H17z" fill="#fff"/>
    <path d="M26 25h2.5l-2-9H25c-.5 0-.9.3-1 .7L20.5 25h2.5l.5-1.3h3l.3 1.3zM24 21.5l1.2-3.4.7 3.4H24z" fill="#fff"/>
    <path d="M19.5 16l-2 9h-2.3l2-9h2.3z" fill="#fff"/>
    <path d="M32 16l-1.8 9H28l.2-.9C27.3 25 26 25.3 25 25.3c-2 0-3-1-3-2.3 0-2.3 2.5-3 5-3 .5 0 1 0 1.3.1 0-.6-.5-1-1.7-1-.8 0-1.7.2-2.2.5l-.4-1.7c.7-.3 1.7-.5 2.7-.5 2.5 0 4 1 4 3.2v.1L32 16z" fill="#fff"/>
  </svg>`,
};

// ============================================================
// Уведомления (ntfy.sh)
// ============================================================
function notify(type, details) {
  if (!CONFIG || !CONFIG.notifications?.enabled || !CONFIG.notifications?.ntfyTopic) return;
  const topic = CONFIG.notifications.ntfyTopic;
  const body = JSON.stringify({ type, ...details, timestamp: Date.now() });
  fetch(`https://ntfy.sh/${encodeURIComponent(topic)}`, {
    method: "POST",
    body,
    headers: { "Content-Type": "application/json" }
  }).catch(() => {});
}

// ============================================================
// Маппинг стран → регион
// ============================================================
const COUNTRY_TO_REGION = {
  UA: "UA",
  RU: "RU",
  BY: "RU",
};

function mapCountryToRegion(countryCode) {
  if (!countryCode) return "_global";
  const cc = countryCode.toUpperCase();
  return COUNTRY_TO_REGION[cc] || "_global";
}

// ============================================================
// DOM
// ============================================================
const $ = (id) => document.getElementById(id);

const stateLoading = $("stateLoading");
const stateSelect = $("stateSelect");
const stateRedirect = $("stateRedirect");
const stateError = $("stateError");
const platformGrid = $("platformGrid");
const extraGrid = $("extraGrid");
const requisitesList = $("requisitesList");
const sectionExtra = $("sectionExtra");
const sectionRequisites = $("sectionRequisites");
const redirectIcon = $("redirectIcon");
const redirectTitle = $("redirectTitle");
const redirectBtn = $("redirectBtn");
const countdownNum = $("countdownNum");
const progressFill = $("progressFill");
const cancelRedirectBtn = $("cancelRedirectBtn");

// ============================================================
// Тема
// ============================================================
function initTheme() {
  const saved = localStorage.getItem(LS_THEME);
  if (saved) {
    document.documentElement.setAttribute("data-theme", saved);
  }

  $("themeToggle").addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    let next;
    if (current === "light") {
      next = "dark";
    } else if (current === "dark") {
      next = "light";
    } else {
      next = prefersDark ? "light" : "dark";
    }

    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(LS_THEME, next);
  });
}

// ============================================================
// Locale picker
// ============================================================
function initLocalePicker() {
  const toggle = $("localeToggle");
  const menu = $("localeMenu");

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.hidden = !menu.hidden;
    toggle.setAttribute("aria-expanded", !menu.hidden);
  });

  menu.addEventListener("click", (e) => {
    const item = e.target.closest("[data-region]");
    if (!item) return;
    const region = item.dataset.region;
    menu.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    switchLocale(region);
  });

  document.addEventListener("click", (e) => {
    if (!$("localePicker").contains(e.target)) {
      menu.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

function switchLocale(region) {
  currentRegion = region;
  currentCountryCode = region === "_global" ? "" : region;
  currentLang = REGION_TO_LANG[region] || "en";
  localStorage.setItem(LS_LOCALE, region);

  applyTranslations();

  // Cancel any active redirect
  if (redirectAbort) {
    redirectAbort.abort();
    redirectAbort = null;
  }
  stateRedirect.hidden = true;
  stateSelect.hidden = true;

  // Clear rendered content
  platformGrid.innerHTML = "";
  extraGrid.innerHTML = "";
  requisitesList.innerHTML = "";
  sectionExtra.hidden = false;
  sectionRequisites.hidden = false;

  // Re-render
  renderForRegion(region);
}

// ============================================================
// Инициализация
// ============================================================
async function init() {
  initTheme();
  initLocalePicker();
  $("errorRetry").addEventListener("click", () => location.reload());

  try {
    await loadConfig();
  } catch (e) {
    showError(e.message);
    return;
  }

  // Query param takes priority over saved locale
  const params = new URLSearchParams(window.location.search);
  const regionOverride = params.get("region");
  const savedLocale = localStorage.getItem(LS_LOCALE);
  let region, countryCode;

  if (regionOverride) {
    region = mapCountryToRegion(regionOverride);
    countryCode = regionOverride.toUpperCase();
  } else if (savedLocale) {
    region = savedLocale;
    countryCode = savedLocale === "_global" ? "" : savedLocale;
  } else {
    const detected = await detectRegion();
    region = detected.region;
    countryCode = detected.countryCode;
  }

  currentRegion = region;
  currentCountryCode = countryCode;
  currentLang = REGION_TO_LANG[region] || "en";

  // Apply config
  document.documentElement.style.setProperty("--accent", CONFIG.accentColor);
  document.documentElement.style.setProperty("--accent-hover", lightenColor(CONFIG.accentColor, 20));

  if (CONFIG.ogImage) {
    const ogImg = document.querySelector('meta[property="og:image"]');
    if (ogImg) ogImg.setAttribute("content", CONFIG.ogImage);
  }

  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor && CONFIG.accentColor) themeColor.setAttribute("content", CONFIG.accentColor);

  applyTranslations();

  stateLoading.hidden = true;

  notify("page_view", { region: currentRegion, lang: currentLang });

  // ?go — instant redirect to top-priority platform
  if (params.has("go")) {
    const platforms = getPlatformsForRegion(region);
    if (platforms.length > 0) {
      trackClick(platforms[0].id);
      notify("platform_click", { platformId: platforms[0].id, platformName: platforms[0].name });
      window.location.href = platforms[0].url;
      return;
    }
  }

  renderForRegion(region);
}

function renderForRegion(region) {
  const platforms = getPlatformsForRegion(region);

  if (platforms.length === 1 && !hasExtraContent(region)) {
    showAutoRedirect(platforms[0], region);
    return;
  }

  const preferred = getPreferredPlatform(platforms);
  if (preferred) {
    showAutoRedirect(preferred, region);
  } else {
    showSelection(platforms, region);
  }
}

function showError(message) {
  if (stateLoading) stateLoading.hidden = true;
  if (stateError) {
    stateError.hidden = false;
    const errorText = stateError.querySelector(".error-text");
    if (errorText) errorText.textContent = message || t("errorDefault");
  }
}

function lightenColor(hex, amount) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

// ============================================================
// Гео-детекция (с fallback API)
// ============================================================
async function detectRegion() {
  const params = new URLSearchParams(window.location.search);
  const override = params.get("region");
  if (override) {
    return { region: mapCountryToRegion(override), countryCode: override.toUpperCase() };
  }

  const cached = sessionStorage.getItem("geo_region");
  if (cached) return JSON.parse(cached);

  // Primary API
  try {
    const result = await fetchGeo("https://ipapi.co/json/", (d) => d.country_code);
    sessionStorage.setItem("geo_region", JSON.stringify(result));
    return result;
  } catch { /* fallback below */ }

  // Fallback API
  try {
    const result = await fetchGeo("https://ip-api.com/json/?fields=countryCode", (d) => d.countryCode);
    sessionStorage.setItem("geo_region", JSON.stringify(result));
    return result;
  } catch { /* fallback below */ }

  return { region: "_global", countryCode: "" };
}

async function fetchGeo(url, extractCountry) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  const resp = await fetch(url, { signal: controller.signal });
  clearTimeout(timeout);
  const data = await resp.json();
  const countryCode = extractCountry(data) || "";
  const region = mapCountryToRegion(countryCode);
  return { region, countryCode };
}

// ============================================================
// Фильтрация платформ
// ============================================================
function enabled(items) {
  return items.filter((i) => i.enabled !== false);
}

function getPlatformsForRegion(region) {
  const platforms = enabled(CONFIG.platforms[region] || []);
  if (platforms.length > 0) {
    return platforms.sort((a, b) => a.priority - b.priority);
  }
  return enabled(CONFIG.platforms["_global"] || []).sort((a, b) => a.priority - b.priority);
}

function getSubscriptionsForRegion(region) {
  if (!CONFIG.subscriptions || CONFIG.subscriptions.enabled === false) return [];
  const subs = enabled(CONFIG.subscriptions[region] || []);
  if (subs.length > 0) return subs;
  return enabled(CONFIG.subscriptions["_global"] || []);
}

// ============================================================
// localStorage: предпочтительная платформа
// ============================================================

function getStreak() {
  try { return JSON.parse(localStorage.getItem(LS_CLICKS)) || { id: null, count: 0 }; } catch { return { id: null, count: 0 }; }
}

function trackClick(platformId) {
  const streak = getStreak();
  if (streak.id === platformId) {
    streak.count += 1;
  } else {
    streak.id = platformId;
    streak.count = 1;
  }
  localStorage.setItem(LS_CLICKS, JSON.stringify(streak));
}

function getPreferredPlatform(platforms) {
  const threshold = CONFIG.autoRedirectThreshold || 3;
  const streak = getStreak();
  if (streak.id && streak.count >= threshold) {
    return platforms.find(p => p.id === streak.id) || null;
  }
  return null;
}

// ============================================================
// Проверка: есть ли что показывать кроме основных платформ
// ============================================================
function hasExtraContent(region) {
  if (getSubscriptionsForRegion(region).length > 0) return true;
  if (CONFIG.steam && CONFIG.steam.url && CONFIG.steam.enabled !== false) return true;
  const reqConfig = CONFIG.requisites || {};
  if (reqConfig.enabled !== false) {
    const items = enabled(reqConfig.items || []).filter((r) => !r.region || r.region === region);
    if (items.length > 0) return true;
  }
  return false;
}

// ============================================================
// Авто-редирект (вернувшийся зритель) — requestAnimationFrame
// ============================================================
let redirectAbort = null;

function showAutoRedirect(platform, region) {
  stateRedirect.hidden = false;

  redirectIcon.innerHTML = ICONS[platform.id] || "";
  redirectTitle.textContent = platform.name;
  redirectBtn.href = platform.url;
  redirectBtn.target = "_blank";
  redirectBtn.rel = "noopener noreferrer";

  // Re-apply translated text for redirect elements
  redirectBtn.textContent = t("redirectBtn");

  const duration = (CONFIG.autoRedirectDelay || 5) * 1000;
  let startTime = null;
  let animFrameId = null;
  let cancelled = false;

  if (redirectAbort) redirectAbort.abort();
  redirectAbort = new AbortController();
  const signal = redirectAbort.signal;

  countdownNum.textContent = Math.ceil(duration / 1000);
  progressFill.style.width = "0%";

  function tick(now) {
    if (cancelled) return;
    if (!startTime) startTime = now;
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);

    progressFill.style.width = `${progress * 100}%`;
    countdownNum.textContent = Math.max(0, Math.ceil((duration - elapsed) / 1000));

    if (elapsed >= duration) {
      trackClick(platform.id);
      window.location.href = platform.url;
      return;
    }

    animFrameId = requestAnimationFrame(tick);
  }

  animFrameId = requestAnimationFrame(tick);

  redirectBtn.addEventListener("click", () => {
    cancelled = true;
    cancelAnimationFrame(animFrameId);
    trackClick(platform.id);
  }, { signal });

  cancelRedirectBtn.addEventListener("click", () => {
    cancelled = true;
    cancelAnimationFrame(animFrameId);
    redirectAbort.abort();
    redirectAbort = null;
    stateRedirect.hidden = true;
    const platforms = getPlatformsForRegion(region);
    showSelection(platforms, region);
  }, { signal });
}

// ============================================================
// Отображение: полный выбор
// ============================================================
function showSelection(platforms, region) {
  stateSelect.hidden = false;

  renderPlatformCards(platformGrid, platforms, true);

  const extraItems = [];
  const subs = getSubscriptionsForRegion(region);
  subs.forEach((s) => extraItems.push(s));
  if (CONFIG.steam && CONFIG.steam.url && CONFIG.steam.enabled !== false) extraItems.push(CONFIG.steam);

  if (extraItems.length > 0) {
    renderPlatformCards(extraGrid, extraItems, false);
  } else {
    sectionExtra.hidden = true;
  }

  const reqConfig = CONFIG.requisites || {};
  const activeRequisites = reqConfig.enabled !== false
    ? enabled(reqConfig.items || []).filter((r) => !r.region || r.region === region)
    : [];
  if (activeRequisites.length > 0) {
    renderRequisites(requisitesList, activeRequisites);
  } else {
    sectionRequisites.hidden = true;
  }
}

function renderPlatformCards(container, items, trackClicks) {
  items.forEach((p, i) => {
    const card = document.createElement("a");
    card.href = p.url;
    card.target = "_blank";
    card.rel = "noopener noreferrer";
    card.className = "card";

    const iconHtml = ICONS[p.id] || "";
    const nameHtml = esc(p.name);
    const descHtml = esc(p.description);

    let qrHtml = "";
    if (trackClicks && CONFIG.qr) {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&bgcolor=ffffff&color=111111&format=svg&data=${encodeURIComponent(p.url)}`;
      qrHtml = `<img class="card__qr" src="${escAttr(qrUrl)}" alt="QR" loading="lazy">`;
    }

    card.innerHTML = `
      <div class="card__body">
        <div class="card__icon">${iconHtml}</div>
        <div class="card__name">${nameHtml}</div>
        <div class="card__desc">${descHtml}</div>
      </div>
      ${qrHtml}
    `;

    if (trackClicks) {
      card.addEventListener("click", () => {
        trackClick(p.id);
        notify("platform_click", { platformId: p.id, platformName: p.name });
      });
    }

    container.appendChild(card);
    setTimeout(() => card.classList.add("fade-in"), i * 60);
  });
}

const CRYPTO_IDS = new Set(["usdt", "btc", "ton", "eth", "ltc", "trx", "sol", "doge", "xmr", "bnb"]);

function renderRequisites(container, requisites) {
  requisites.forEach((r, i) => {
    const row = document.createElement("div");
    row.className = "requisite";

    const isCrypto = CRYPTO_IDS.has(r.id);
    const qrHtml = isCrypto && CONFIG.qr
      ? `<img class="requisite__qr" src="${escAttr(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&bgcolor=ffffff&color=111111&format=svg&data=${encodeURIComponent(r.value)}`)}" alt="QR" loading="lazy">`
      : "";

    const copyIcon = `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect x="6" y="6" width="10" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/>
      <path d="M4 14V5a2 2 0 012-2h9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`;

    const checkIcon = `<svg viewBox="0 0 20 20" fill="none" width="16" height="16">
      <path d="M5 10l4 4 6-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

    if (isCrypto) {
      row.classList.add("requisite--crypto");
      row.innerHTML = `
        <div class="requisite__top">
          <div class="requisite__icon">${ICONS[r.id] || ""}</div>
          <div class="requisite__name">${esc(r.name)}</div>
          ${qrHtml}
        </div>
        <div class="requisite__bottom">
          <input class="requisite__input" type="text" value="${escAttr(r.value)}" readonly>
          <button class="requisite__copy" data-tooltip="${escAttr(t("copy"))}" title="${escAttr(t("copy"))}" aria-label="${escAttr(t("copy"))}">${copyIcon}</button>
        </div>
      `;
    } else {
      row.classList.add("requisite--plain");
      row.innerHTML = `
        <div class="requisite__top">
          <div class="requisite__icon">${ICONS[r.id] || ""}</div>
          <div class="requisite__name">${esc(r.name)}</div>
        </div>
        <div class="requisite__bottom">
          <input class="requisite__input" type="text" value="${escAttr(r.value)}" readonly>
          <button class="requisite__copy" data-tooltip="${escAttr(t("copy"))}" title="${escAttr(t("copy"))}" aria-label="${escAttr(t("copy"))}">${copyIcon}</button>
        </div>
      `;
    }

    const input = row.querySelector(".requisite__input");
    if (input) {
      input.addEventListener("click", () => input.select());
    }

    const btn = row.querySelector(".requisite__copy");
    btn.addEventListener("click", () => {
      copyToClipboard(r.value).then(() => {
        notify("requisite_copy", { requisiteId: r.id, requisiteName: r.name });
        btn.classList.add("requisite__copy--done");
        btn.setAttribute("data-tooltip", t("copied"));
        btn.innerHTML = checkIcon;
        setTimeout(() => {
          btn.classList.remove("requisite__copy--done");
          btn.setAttribute("data-tooltip", t("copy"));
          btn.innerHTML = copyIcon;
        }, 1500);
      }).catch(() => {});
    });

    container.appendChild(row);
    setTimeout(() => row.classList.add("fade-in"), i * 60);
  });
}

// ============================================================
// Utils
// ============================================================
function esc(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function escAttr(str) {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  }
  return fallbackCopy(text);
}

function fallbackCopy(text) {
  return new Promise((resolve, reject) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      resolve();
    } catch (e) {
      reject(e);
    } finally {
      document.body.removeChild(textarea);
    }
  });
}

// ============================================================
// Start
// ============================================================
init();
