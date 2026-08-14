(function () {
  'use strict';

  const requestConfigs = {
    'engineering-calculation': {
      eyebrow: 'Инженерный расчёт · UWIN OIL',
      title: 'Получить инженерный расчёт',
      description: 'Передайте продукт, производительность и текущую задачу — инженер подготовит рабочую схему азотирования.',
      productLabel: 'Продукт',
      taskLabel: 'Текущая задача',
      taskPlaceholder: 'Что требуется рассчитать или изменить',
      submitLabel: 'Отправить данные инженеру',
      note: 'Нужен хотя бы один способ связи: телефон или рабочая почта.',
      showTechnology: false,
      thankUrl: 'thanks/engineering-calculation.html'
    },
    'technology-comparison': {
      eyebrow: 'Сравнение технологий · UWIN OIL',
      title: 'Получить инженерное сравнение',
      description: 'Сопоставим жидкий и газообразный азот применительно к вашему продукту, линии и текущему способу обработки.',
      productLabel: 'Продукт',
      taskLabel: 'Что важно сравнить',
      taskPlaceholder: 'Например, влияние на кислород, тару, расход или интеграцию',
      submitLabel: 'Запросить сравнение',
      note: 'Инженер свяжется с вами и уточнит исходные параметры сравнения.',
      showTechnology: true,
      thankUrl: 'thanks/technology-comparison.html'
    },
    'line-audit': {
      eyebrow: 'Аудит действующей линии · UWIN OIL',
      title: 'Заказать аудит линии',
      description: 'Изучим производственный контур, определим возможные точки подключения и состав исходных данных для внедрения.',
      productLabel: 'Продукт на линии',
      taskLabel: 'Текущая конфигурация или ограничение',
      taskPlaceholder: 'Опишите участок линии, доступное место или существующее оборудование',
      submitLabel: 'Отправить данные на аудит',
      note: 'После заявки согласуем удобный формат аудита и перечень технических материалов.',
      showTechnology: false,
      thankUrl: 'thanks/line-audit.html'
    },
    'industrial-test': {
      eyebrow: 'Промышленный тест · UWIN OIL',
      title: 'Обсудить проведение теста',
      description: 'Подберём режим проверки на вашей линии и заранее согласуем измеримые показатели до и после обработки.',
      productLabel: 'Масло для теста',
      taskLabel: 'Что нужно подтвердить',
      taskPlaceholder: 'Например, растворённый кислород, расход азота или стабильность тары',
      submitLabel: 'Запросить проведение теста',
      note: 'Инженер уточнит условия теста, контрольные точки и доступные способы измерения.',
      showTechnology: false,
      thankUrl: 'thanks/industrial-test.html'
    },
    'commercial-proposal': {
      eyebrow: 'Коммерческое предложение · UWIN OIL',
      title: 'Получить коммерческое предложение',
      description: 'Передайте основные параметры проекта — подготовим состав решения, формат поставки и коммерческие условия.',
      productLabel: 'Продукт',
      taskLabel: 'Что должно войти в предложение',
      taskPlaceholder: 'Оборудование, внедрение, пусконаладка или сервис',
      submitLabel: 'Запросить коммерческое предложение',
      note: 'Если исходных данных пока недостаточно, инженер уточнит их при контакте.',
      showTechnology: false,
      thankUrl: 'thanks/commercial-proposal.html'
    }
  };

  const header = document.querySelector('[data-header]');
  const menu = document.querySelector('[data-menu]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const dialog = document.querySelector('[data-dialog]');
  const dialogClose = document.querySelector('[data-dialog-close]');
  const form = document.querySelector('[data-request-form]');
  const requestType = document.querySelector('[data-request-type]');
  const formStatus = document.querySelector('[data-form-status]');
  const submitButton = document.querySelector('[data-submit-label]');
  const phoneInput = form && form.elements.phone;
  const emailInput = form && form.elements.email;
  let activeConfig = requestConfigs['engineering-calculation'];
  let lastTrigger = null;

  function updateHeader() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 20);
  }

  function closeMenu() {
    if (!menu || !menuToggle) return;
    menu.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }

  function setText(selector, value) {
    const node = document.querySelector(selector);
    if (node) node.textContent = value;
  }

  function setFieldValue(name, value) {
    if (!form || !form.elements[name]) return;
    form.elements[name].value = value || '';
  }

  function fillAttribution(trigger) {
    if (!form) return;
    const params = new URLSearchParams(window.location.search);
    setFieldValue('source_url', window.location.href);
    setFieldValue('referrer', document.referrer);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'yclid'].forEach(function (name) {
      setFieldValue(name, params.get(name));
    });

    const context = trigger && trigger.closest('section, header, footer');
    const contextName = context && (context.id || context.className);
    setFieldValue('lead_source', [contextName, trigger && trigger.textContent.trim()].filter(Boolean).join(' · '));
  }

  function clearContactErrors() {
    if (phoneInput) phoneInput.setCustomValidity('');
    if (emailInput) emailInput.setCustomValidity('');
  }

  function validateContact() {
    if (!phoneInput || !emailInput) return true;
    clearContactErrors();
    if (phoneInput.value.trim() || emailInput.value.trim()) return true;
    phoneInput.setCustomValidity('Укажите телефон или рабочую почту.');
    return false;
  }

  function configureForm(type, trigger) {
    if (!form) return;
    const config = requestConfigs[type] || requestConfigs['engineering-calculation'];
    activeConfig = config;
    form.reset();
    clearContactErrors();
    requestType.value = type in requestConfigs ? type : 'engineering-calculation';

    setText('[data-dialog-eyebrow]', config.eyebrow);
    setText('[data-dialog-title]', config.title);
    setText('[data-dialog-description]', config.description);
    setText('[data-product-label]', config.productLabel);
    setText('[data-task-label]', config.taskLabel);
    setText('[data-submit-label]', config.submitLabel);
    setText('[data-form-note]', config.note);

    const taskInput = document.querySelector('[data-task-input]');
    if (taskInput) taskInput.placeholder = config.taskPlaceholder;

    const technologyField = document.querySelector('[data-field-group="technology"]');
    if (technologyField) {
      technologyField.hidden = !config.showTechnology;
      const select = technologyField.querySelector('select');
      if (select) select.required = config.showTechnology;
    }

    ['company', 'product', 'capacity'].forEach(function (name) {
      if (form.elements[name]) form.elements[name].required = true;
    });

    fillAttribution(trigger);
    if (formStatus) {
      formStatus.textContent = '';
      formStatus.classList.remove('visible', 'is-error');
    }

    if (window.UwinFormSecurity && typeof window.UwinFormSecurity.issueToken === 'function') {
      window.UwinFormSecurity.issueToken(form, requestType.value);
    }
  }

  function openRequest(type, trigger) {
    if (!dialog) return;
    lastTrigger = trigger || document.activeElement;
    configureForm(type, trigger);
    dialog.showModal();
    document.body.classList.add('dialog-open');
    window.setTimeout(function () {
      const firstInput = form && form.querySelector('input:not([type="hidden"]):not([tabindex="-1"])');
      if (firstInput) firstInput.focus();
    }, 40);
  }

  function closeRequest() {
    if (!dialog || !dialog.open) return;
    dialog.close();
    document.body.classList.remove('dialog-open');
    if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
  }

  function showFormError(message) {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.classList.add('visible', 'is-error');
  }

  function isPreviewHost() {
    return window.location.hostname.endsWith('.github.io') || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuToggle && menu) {
    menuToggle.addEventListener('click', function () {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!isOpen));
      menu.classList.toggle('open', !isOpen);
      document.body.classList.toggle('menu-open', !isOpen);
    });

    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

  document.querySelectorAll('[data-request]').forEach(function (button) {
    button.addEventListener('click', function () {
      openRequest(button.getAttribute('data-request'), button);
    });
  });

  if (dialogClose) dialogClose.addEventListener('click', closeRequest);

  if (dialog) {
    dialog.addEventListener('click', function (event) {
      const rect = dialog.getBoundingClientRect();
      const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
      if (outside) closeRequest();
    });

    dialog.addEventListener('close', function () {
      document.body.classList.remove('dialog-open');
    });
  }

  if (phoneInput && emailInput) {
    phoneInput.addEventListener('input', clearContactErrors);
    emailInput.addEventListener('input', clearContactErrors);
  }

  if (form) {
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      if (!validateContact() || !form.checkValidity()) {
        form.reportValidity();
        return;
      }

      if (isPreviewHost()) {
        window.location.assign(activeConfig.thankUrl + '?preview=1');
        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.setAttribute('aria-busy', 'true');
      }

      if (formStatus) {
        formStatus.textContent = 'Отправляем данные…';
        formStatus.classList.add('visible');
        formStatus.classList.remove('is-error');
      }

      try {
        const response = await window.fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          credentials: 'same-origin',
          headers: { Accept: 'application/json' }
        });
        const payload = await response.json().catch(function () { return null; });
        if (!response.ok || !payload || !payload.success) {
          throw new Error(payload && payload.message ? payload.message : 'Не удалось отправить форму.');
        }
        window.location.assign(payload.redirect || activeConfig.thankUrl);
      } catch (error) {
        showFormError(error.message || 'Не удалось отправить форму. Позвоните нам по номеру +7 923 001-78-16.');
        if (window.UwinFormSecurity && typeof window.UwinFormSecurity.issueToken === 'function') {
          window.UwinFormSecurity.issueToken(form, requestType.value);
        }
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.removeAttribute('aria-busy');
        }
      }
    });
  }

  const revealNodes = Array.from(document.querySelectorAll('[data-reveal]'));
  revealNodes.forEach(function (node) {
    const delay = Number(node.getAttribute('data-delay') || 0);
    node.style.transitionDelay = delay + 'ms';
  });

  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -9% 0px', threshold: 0.08 });

    revealNodes.forEach(function (node) { observer.observe(node); });
  } else {
    revealNodes.forEach(function (node) { node.classList.add('is-visible'); });
  }
})();
