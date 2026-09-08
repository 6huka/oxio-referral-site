const REFERRAL_CODE = "RGYJA2F";
const REFERRAL_URL = "https://order.oxio.ca/?referral=RGYJA2F";

/*
|--------------------------------------------------------------------------
| Session ID
|--------------------------------------------------------------------------
*/

function getSessionId() {
  let sessionId = sessionStorage.getItem("site-session-id");

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("site-session-id", sessionId);
  }

  return sessionId;
}

/*
|--------------------------------------------------------------------------
| Analytics
|--------------------------------------------------------------------------
*/

function trackEvent(name, params = {}) {
  const payload = {
    event: name,
    path: window.location.pathname,
    sessionId: getSessionId(),
    viewportWidth: window.innerWidth,
    timeOnPage: Math.round(performance.now()),
    ...params
  };

  /*
  |------------------------------------------------------------------------
  | Send only referral conversions to Cloudflare
  |------------------------------------------------------------------------
  */

  if (
    name === "copy_referral_code" ||
    name === "referral_click"
  ) {
    fetch("/site-action", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(() => {});
  }

  /*
  |------------------------------------------------------------------------
  | Keep existing analytics compatibility
  |------------------------------------------------------------------------
  */

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);

  if (typeof window.gtag === "function") {
    window.gtag("event", name, params);
  }

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

async function copyReferralCode(event) {
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

  const button = event.currentTarget;

  const label =
    button.dataset.trackLabel ||
    button.getAttribute("aria-label") ||
    button.textContent.trim() ||
    "unknown-copy-button";

  trackEvent("copy_referral_code", {
    label
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
        const label =
          link.dataset.trackLabel ||
          link.textContent.trim() ||
          "unknown-referral-link";

        trackEvent("referral_click", {
          label
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

  const initialTheme =
    savedTheme || "light";

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

  document
    .querySelectorAll("[data-current-year]")
    .forEach((element) => {
      element.textContent = year;
    });

  document
    .querySelectorAll("[data-current-month-year]")
    .forEach((element) => {
      element.textContent = monthYear;
    });
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