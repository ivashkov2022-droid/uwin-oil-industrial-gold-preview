(function () {
  'use strict';

  function issueToken(form, formType) {
    if (!form || typeof window.fetch !== 'function') return Promise.resolve(null);
    const tokenField = form.querySelector('[data-form-token]');
    if (!tokenField) return Promise.resolve(null);

    tokenField.value = '';
    const endpoint = new URL('api/form-token.php', document.baseURI);
    endpoint.searchParams.set('form', formType || 'engineering-calculation');

    return window.fetch(endpoint.href, {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { Accept: 'application/json' }
    })
      .then(function (response) { return response.ok ? response.json() : null; })
      .then(function (payload) {
        if (payload && typeof payload.token === 'string') tokenField.value = payload.token;
        return payload;
      })
      .catch(function () { return null; });
  }

  window.UwinFormSecurity = { issueToken: issueToken };
})();
