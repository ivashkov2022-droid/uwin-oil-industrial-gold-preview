(function () {
  'use strict';

  document.documentElement.dataset.previewMode = 'true';

  document.addEventListener('submit', function (event) {
    var form = event.target;
    if (!(form instanceof HTMLFormElement)) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    var successBox = form.querySelector('.js-successbox');
    var errorBox = form.querySelector('.js-errorbox-all');

    if (errorBox) errorBox.style.display = 'none';
    if (successBox) {
      successBox.textContent = 'Режим предпросмотра: данные не отправлены.';
      successBox.style.display = 'block';
    } else {
      window.alert('Режим предпросмотра: данные не отправлены.');
    }
  }, true);
})();

