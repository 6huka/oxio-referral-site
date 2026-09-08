const REFERRAL_CODE = "RGYJA2F";
const REFERRAL_URL = "https://order.oxio.ca/?referral=RGYJA2F";

/*
|--------------------------------------------------------------------------
| Analytics
|--------------------------------------------------------------------------
*/

function trackEvent(name, params = {}) {
  const payload = {
    event: name,
    timestamp: new Date().toISOString(),
    path: window.location.pathname,
    ...params
  };

  // Google Tag Manager-compatible dataLayer
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);

  // Google Analytics 4, if gtag is added later
  if (typeof window.gtag === "function") {
    window.gtag("event", name, params);
  }

  // Custom event for another analytics system later
  window.dispatchEvent(
    new CustomEvent("site-analytics-event", {
      detail: payload
    })
  );

  console.debug("[analytics]", payload);
}

/*
|--------------------------------------------------------------------------
| Toast notification
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Copy referral code
|--------------------------------------------------------------------------
*/

async function copyReferralCode() {
  try {
    await navigator.clipboard.writeText(REFERRAL_CODE);
  } catch {
    // Fallback for browsers where Clipboard API is unavailable
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

  trackEvent("copy_referral_code", {
    code: REFERRAL_CODE
  });
}

function initCopyButtons() {
  document
    .querySelectorAll("[data-copy-referral]")
    .forEach((button) => {
      button.addEventListener(
        "click",
        copyReferralCode
      );
    });
}

/*
|--------------------------------------------------------------------------
| Referral click tracking
|--------------------------------------------------------------------------
*/

function initReferralTracking() {
  document
    .querySelectorAll('a[href*="order.oxio.ca"]')
    .forEach((link) => {
      link.addEventListener("click", () => {
        trackEvent("referral_click", {
          code: REFERRAL_CODE,
          destination: REFERRAL_URL,
          label: link.textContent.trim()
        });
      });
    });
}

/*
|--------------------------------------------------------------------------
| Dark mode
|--------------------------------------------------------------------------
*/

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;

  const button =
    document.querySelector("[data-theme-toggle]");

  if (!button) {
    return;
  }

  const darkModeEnabled =
    theme === "dark";

  button.textContent =
    darkModeEnabled
      ? "Light mode"
      : "Dark mode";

  button.setAttribute(
    "aria-pressed",
    darkModeEnabled ? "true" : "false"
  );
}

function initTheme() {
  const savedTheme =
    localStorage.getItem("site-theme");

  const systemDark =
    window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

  const initialTheme =
    savedTheme ||
    (systemDark ? "dark" : "light");

  applyTheme(initialTheme);

  const button =
    document.querySelector("[data-theme-toggle]");

  if (!button) {
    return;
  }

  button.addEventListener("click", () => {
    const currentTheme =
      document.documentElement.dataset.theme;

    const nextTheme =
      currentTheme === "dark"
        ? "light"
        : "dark";

    localStorage.setItem(
      "site-theme",
      nextTheme
    );

    applyTheme(nextTheme);

    trackEvent("theme_change", {
      theme: nextTheme
    });
  });
}

/*
|--------------------------------------------------------------------------
| Dynamic month and year
|--------------------------------------------------------------------------
*/

function initDynamicDates() {
  const now = new Date();

  const year =
    now.getFullYear();

  const monthYear =
    now.toLocaleDateString(
      "en-CA",
      {
        month: "long",
        year: "numeric"
      }
    );

  // Update all visible years
  document
    .querySelectorAll("[data-current-year]")
    .forEach((element) => {
      element.textContent = year;
    });

  // Update all visible month + year labels
  document
    .querySelectorAll("[data-current-month-year]")
    .forEach((element) => {
      element.textContent = monthYear;
    });

  // Update browser tab title
  document.title =
    `Oxio Referral Code Canada ${year}: ${REFERRAL_CODE} | Get 1 Month Free`;

  // Update Open Graph title if present
  const ogTitle =
    document.querySelector(
      "[data-dynamic-og-title]"
    );

  if (ogTitle) {
    ogTitle.setAttribute(
      "content",
      `Oxio Referral Code Canada ${year}: ${REFERRAL_CODE}`
    );
  }
}

/*
|--------------------------------------------------------------------------
| Collapsible FAQ
|--------------------------------------------------------------------------
*/

function initFaqAccordions() {
  document
    .querySelectorAll("[data-faq-button]")
    .forEach((button) => {
      const targetId =
        button.getAttribute(
          "aria-controls"
        );

      const target =
        document.getElementById(
          targetId
        );

      if (!target) {
        return;
      }

      button.addEventListener(
        "click",
        () => {
          const expanded =
            button.getAttribute(
              "aria-expanded"
            ) === "true";

          const nextExpanded =
            !expanded;

          button.setAttribute(
            "aria-expanded",
            String(nextExpanded)
          );

          target.hidden =
            !nextExpanded;

          trackEvent("faq_toggle", {
            question:
              button.textContent.trim(),
            expanded:
              nextExpanded
          });
        }
      );
    });
}

/*
|--------------------------------------------------------------------------
| Initialise site
|--------------------------------------------------------------------------
*/

document.addEventListener(
  "DOMContentLoaded",
  () => {
    initCopyButtons();
    initReferralTracking();
    initTheme();
    initDynamicDates();
    initFaqAccordions();
  }
);