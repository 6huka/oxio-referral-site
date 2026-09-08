const REFERRAL_CODE = "RGYJA2F";
const REFERRAL_URL = "https://order.oxio.ca/?referral=RGYJA2F";

function trackEvent(name, params = {}) {
  const payload = {
    event: name,
    timestamp: new Date().toISOString(),
    path: window.location.pathname,
    ...params
  };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);

  if (typeof window.gtag === "function") {
    window.gtag("event", name, params);
  }

  window.dispatchEvent(new CustomEvent("site-analytics-event", { detail: payload }));
  console.debug("[analytics]", payload);
}

function showToast(message) {
  let toast = document.getElementById("site-toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "site-toast";
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

async function copyReferralCode() {
  try {
    await navigator.clipboard.writeText(REFERRAL_CODE);
  } catch {
    const temp = document.createElement("textarea");
    temp.value = REFERRAL_CODE;
    temp.style.position = "fixed";
    temp.style.opacity = "0";
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    temp.remove();
  }

  showToast("Code copied");
  trackEvent("copy_referral_code", { code: REFERRAL_CODE });
}

function initCopyButtons() {
  document.querySelectorAll("[data-copy-referral]").forEach((button) => {
    button.addEventListener("click", copyReferralCode);
  });
}

function initReferralTracking() {
  document.querySelectorAll('a[href*="order.oxio.ca"]').forEach((link) => {
    link.addEventListener("click", () => {
      trackEvent("referral_click", {
        code: REFERRAL_CODE,
        destination: REFERRAL_URL,
        label: link.textContent.trim()
      });
    });
  });
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;

  const button = document.querySelector("[data-theme-toggle]");
  if (button) {
    button.textContent = theme === "dark" ? "Light mode" : "Dark mode";
    button.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem("site-theme");
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(savedTheme || (systemDark ? "dark" : "light"));

  const button = document.querySelector("[data-theme-toggle]");
  if (!button) return;

  button.addEventListener("click", () => {
    const nextTheme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";

    localStorage.setItem("site-theme", nextTheme);
    applyTheme(nextTheme);
    trackEvent("theme_change", { theme: nextTheme });
  });
}

function initCurrentYear() {
  document.querySelectorAll("[data-current-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

function initFaqAccordions() {
  document.querySelectorAll("[data-faq-button]").forEach((button) => {
    const target = document.getElementById(button.getAttribute("aria-controls"));
    if (!target) return;

    button.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      target.hidden = expanded;

      trackEvent("faq_toggle", {
        question: button.textContent.trim(),
        expanded: !expanded
      });
    });
  });
}

async function checkReferralLink() {
  const statusElements = document.querySelectorAll("[data-referral-status]");
  if (!statusElements.length) return;

  statusElements.forEach((el) => {
    el.textContent = "Checking referral link…";
  });

  try {
    await fetch(REFERRAL_URL, {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-store"
    });

    statusElements.forEach((el) => {
      el.textContent = "Referral link available";
      el.dataset.status = "ok";
    });

    trackEvent("referral_link_check", { result: "reachable_or_opaque" });
  } catch {
    statusElements.forEach((el) => {
      el.textContent = "Referral link status could not be verified";
      el.dataset.status = "unknown";
    });

    trackEvent("referral_link_check", { result: "unknown" });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initCopyButtons();
  initReferralTracking();
  initTheme();
  initCurrentYear();
  initFaqAccordions();
  checkReferralLink();
});