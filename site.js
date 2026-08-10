(function () {
  'use strict';

  const header = document.querySelector('[data-header]');
  const menu = document.querySelector('[data-menu]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const dialog = document.querySelector('[data-dialog]');
  const dialogClose = document.querySelector('[data-dialog-close]');
  const requestType = document.querySelector('[data-request-type]');
  const form = document.querySelector('[data-request-form]');
  const formStatus = document.querySelector('[data-form-status]');

  function updateHeader() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 20);
  }

  function closeMenu() {
    if (!menu || !menuToggle) return;
    menu.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }

  function openRequest(type) {
    if (!dialog) return;
    if (requestType) requestType.value = type || 'Инженерный расчёт';
    if (formStatus) {
      formStatus.textContent = '';
      formStatus.classList.remove('visible');
    }
    dialog.showModal();
    document.body.classList.add('dialog-open');
  }

  function closeRequest() {
    if (!dialog || !dialog.open) return;
    dialog.close();
    document.body.classList.remove('dialog-open');
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
      openRequest(button.getAttribute('data-request'));
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

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      if (formStatus) {
        formStatus.textContent = 'Запрос сформирован. В публичном превью передача данных отключена — после согласования сайта форма будет подключена к рабочему каналу.';
        formStatus.classList.add('visible');
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
