(() => {
  "use strict";

  const root = document.documentElement;
  const localHosts = new Set(["127.0.0.1", "localhost", "0.0.0.0"]);
  const isPreview = Boolean(window.__UWIN_PREVIEW__)
    || localHosts.has(window.location.hostname)
    || window.location.hostname.endsWith("github.io");
  const metrikaId = 94435950;

  if (isPreview) {
    root.dataset.previewMode = "true";
  }

  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");

  const closeMobileMenu = () => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Открыть меню");
    mobileMenu.hidden = true;
    document.body.classList.remove("menu-open");
  };

  menuToggle?.addEventListener("click", () => {
    const willOpen = menuToggle.getAttribute("aria-expanded") !== "true";
    menuToggle.setAttribute("aria-expanded", String(willOpen));
    menuToggle.setAttribute("aria-label", willOpen ? "Закрыть меню" : "Открыть меню");
    mobileMenu.hidden = !willOpen;
    document.body.classList.toggle("menu-open", willOpen);
  });

  mobileMenu?.querySelectorAll("a, button").forEach((control) => {
    control.addEventListener("click", closeMobileMenu);
  });

  const openDialog = (dialog) => {
    if (!(dialog instanceof HTMLDialogElement)) return;
    document.querySelectorAll("dialog[open]").forEach((openItem) => {
      if (openItem !== dialog) openItem.close();
    });
    if (!dialog.open) dialog.showModal();
    document.body.classList.add("dialog-open");
  };

  document.querySelectorAll("[data-open-dialog]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const dialogId = trigger.getAttribute("data-open-dialog");
      const dialog = dialogId ? document.getElementById(dialogId) : null;
      openDialog(dialog);
    });
  });

  document.querySelectorAll("dialog").forEach((dialog) => {
    dialog.querySelectorAll("[data-close-dialog]").forEach((button) => {
      button.addEventListener("click", () => dialog.close());
    });
    dialog.addEventListener("click", (event) => {
      const bounds = dialog.getBoundingClientRect();
      const outside = event.clientX < bounds.left
        || event.clientX > bounds.right
        || event.clientY < bounds.top
        || event.clientY > bounds.bottom;
      if (outside) dialog.close();
    });
    dialog.addEventListener("close", () => {
      if (!document.querySelector("dialog[open]")) {
        document.body.classList.remove("dialog-open");
      }
    });
  });

  const quickContact = document.querySelector("[data-quick-contact]");
  const quickContactToggle = document.querySelector("[data-quick-contact-toggle]");

  quickContactToggle?.addEventListener("click", () => {
    const open = !quickContact?.classList.contains("is-open");
    quickContact?.classList.toggle("is-open", open);
    quickContactToggle.setAttribute("aria-expanded", String(open));
  });

  document.addEventListener("click", (event) => {
    if (quickContact?.classList.contains("is-open") && !quickContact.contains(event.target)) {
      quickContact.classList.remove("is-open");
      quickContactToggle?.setAttribute("aria-expanded", "false");
    }
  });

  const backToTop = document.querySelector("[data-back-to-top]");
  const updateBackToTop = () => {
    backToTop?.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.85);
  };

  window.addEventListener("scroll", updateBackToTop, { passive: true });
  updateBackToTop();
  backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  const reviewTrack = document.querySelector("[data-review-track]");
  const reviewStep = () => {
    const card = reviewTrack?.querySelector(".review-card");
    if (!card) return 620;
    const styles = window.getComputedStyle(reviewTrack);
    return card.getBoundingClientRect().width + Number.parseFloat(styles.columnGap || styles.gap || "0");
  };

  document.querySelector("[data-review-prev]")?.addEventListener("click", () => {
    reviewTrack?.scrollBy({ left: -reviewStep(), behavior: "smooth" });
  });

  document.querySelector("[data-review-next]")?.addEventListener("click", () => {
    reviewTrack?.scrollBy({ left: reviewStep(), behavior: "smooth" });
  });

  const phoneInputs = document.querySelectorAll('input[type="tel"]');
  phoneInputs.forEach((input) => {
    input.addEventListener("input", () => {
      const digits = input.value.replace(/\D/g, "").replace(/^8/, "7").slice(0, 11);
      if (!digits) return;
      const normalized = digits.startsWith("7") ? digits : `7${digits}`;
      const parts = [
        normalized.slice(1, 4),
        normalized.slice(4, 7),
        normalized.slice(7, 9),
        normalized.slice(9, 11),
      ];
      let value = "+7";
      if (parts[0]) value += ` (${parts[0]}`;
      if (parts[0].length === 3) value += ")";
      if (parts[1]) value += ` ${parts[1]}`;
      if (parts[2]) value += `-${parts[2]}`;
      if (parts[3]) value += `-${parts[3]}`;
      input.value = value;
    });
  });

  const searchParams = new URLSearchParams(window.location.search);
  const trackedFields = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "yclid"];
  const forms = [...document.querySelectorAll("[data-lead-form]")];

  forms.forEach((form) => {
    const sourceInput = form.querySelector('[name="source_url"]');
    const referrerInput = form.querySelector('[name="referrer"]');
    if (sourceInput) sourceInput.value = window.location.href;
    if (referrerInput) referrerInput.value = document.referrer;
    trackedFields.forEach((field) => {
      const input = form.querySelector(`[name="${field}"]`);
      if (input) input.value = searchParams.get(field) || "";
    });
  });

  const setStatus = (form, message) => {
    const status = form.querySelector("[data-form-status]");
    if (status) status.textContent = message;
  };

  const formResult = searchParams.get("form");
  if (formResult === "error" || formResult === "send-error") {
    const message = formResult === "send-error"
      ? "Не удалось отправить заявку. Позвоните нам: +7 923-001-7816"
      : "Проверьте заполнение формы и отправьте её ещё раз.";
    forms.forEach((form) => setStatus(form, message));
  }

  const loadFormToken = async () => {
    if (isPreview || forms.length === 0) return;
    try {
      const response = await fetch("api/form-token.php?form=oil", {
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("token");
      const data = await response.json();
      if (typeof data.token !== "string" || !data.token) throw new Error("token");
      forms.forEach((form) => {
        const tokenInput = form.querySelector('[name="form_token"]');
        if (tokenInput) tokenInput.value = data.token;
      });
    } catch {
      forms.forEach((form) => setStatus(form, "Не удалось подготовить форму. Позвоните нам: +7 923-001-7816"));
    }
  };

  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      if (!isPreview) return;
      event.preventDefault();
      setStatus(form, "Предпросмотр: отправка отключена. На рабочем домене форма будет активна.");
    });
  });

  loadFormToken();

  const navLinks = [...document.querySelectorAll(".nav-links a[href^=\"#\"]")];
  const navTargets = navLinks
    .map((link) => ({ link, target: document.querySelector(link.getAttribute("href")) }))
    .filter((item) => item.target);

  if ("IntersectionObserver" in window && navTargets.length) {
    const navObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => link.classList.remove("is-active"));
      navTargets.find((item) => item.target === visible.target)?.link.classList.add("is-active");
    }, { rootMargin: "-20% 0px -65%", threshold: [0, 0.1, 0.35] });
    navTargets.forEach((item) => navObserver.observe(item.target));
  }

  const loadMetrika = () => {
    if (isPreview || typeof window.ym === "function") return;
    window.ym = function () {
      (window.ym.a = window.ym.a || []).push(arguments);
    };
    window.ym.l = Date.now();
    window.mainMetrikaId = metrikaId;
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://mc.yandex.ru/metrika/tag.js";
    document.head.append(script);
    window.ym(metrikaId, "init", {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: true,
      ecommerce: "dataLayer",
    });
    window.ym(metrikaId, "getClientID", (clientId) => {
      forms.forEach((form) => {
        const input = form.querySelector('[name="ym_client_id"]');
        if (input) input.value = clientId || "";
      });
    });
  };

  window.setTimeout(loadMetrika, 2000);
})();
