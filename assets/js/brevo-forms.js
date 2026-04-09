(function () {
  'use strict';

  function handleQuoteForm(form) {
    if (form.dataset.brevoBound === '1') return;
    form.dataset.brevoBound = '1';

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      if (form.dataset.submitting === '1') return;
      form.dataset.submitting = '1';

      var submitBtn = form.querySelector('button[type="submit"]');
      var statusDiv = form.querySelector('.form-status');
      var originalText = submitBtn.textContent || 'Submit';

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      if (statusDiv) {
        statusDiv.textContent = '';
        statusDiv.className = 'form-status';
      }

      var resetButton = function () {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        form.dataset.submitting = '0';
      };

      var data = {
        firstName: (form.querySelector('[name="firstName"]').value || '').trim(),
        lastName: (form.querySelector('[name="lastName"]') ? form.querySelector('[name="lastName"]').value : '').trim(),
        email: (form.querySelector('[name="email"]').value || '').trim(),
        phone: (form.querySelector('[name="phone"]') ? form.querySelector('[name="phone"]').value : '').trim(),
        company: (form.querySelector('[name="company"]') ? form.querySelector('[name="company"]').value : '').trim(),
        message: (form.querySelector('[name="message"]') ? form.querySelector('[name="message"]').value : '').trim(),
        sourcePage: window.location.pathname
      };

      var controller = new AbortController();
      var timeoutId = setTimeout(function () { controller.abort(); }, 30000);

      try {
        var response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        var result = await response.json();

        if (response.ok) {
          form.reset();
          if (statusDiv) {
            statusDiv.textContent = result.message || 'Thank you! We will be in touch shortly.';
            statusDiv.className = 'form-status text-success mt-2';
          }
        } else {
          throw new Error(result.error || 'Submission failed.');
        }
      } catch (err) {
        clearTimeout(timeoutId);
        if (statusDiv) {
          var msg = err.name === 'AbortError' ? 'Request timed out. Please try again.' : (err.message || 'Something went wrong. Please try again.');
          statusDiv.textContent = msg;
          statusDiv.className = 'form-status text-danger mt-2';
        }
      } finally {
        resetButton();
      }
    });
  }

  function handleNewsletterForm(form) {
    if (form.dataset.brevoBound === '1') return;
    form.dataset.brevoBound = '1';

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      if (form.dataset.submitting === '1') return;
      form.dataset.submitting = '1';

      var submitBtn = form.querySelector('button[type="submit"]');
      var statusDiv = form.querySelector('.form-status');
      var originalText = submitBtn.textContent || 'Subscribe';

      submitBtn.disabled = true;
      submitBtn.textContent = 'Subscribing...';
      if (statusDiv) {
        statusDiv.textContent = '';
        statusDiv.className = 'form-status';
      }

      var resetButton = function () {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        form.dataset.submitting = '0';
      };

      var email = (form.querySelector('[name="email"]').value || '').trim();

      var controller = new AbortController();
      var timeoutId = setTimeout(function () { controller.abort(); }, 30000);

      try {
        var response = await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        var result = await response.json();

        if (response.ok) {
          form.reset();
          if (statusDiv) {
            statusDiv.textContent = result.message || 'Successfully subscribed!';
            statusDiv.className = 'form-status text-success mt-2';
          }
        } else {
          throw new Error(result.error || 'Subscription failed.');
        }
      } catch (err) {
        clearTimeout(timeoutId);
        if (statusDiv) {
          var msg = err.name === 'AbortError' ? 'Request timed out. Please try again.' : (err.message || 'Something went wrong. Please try again.');
          statusDiv.textContent = msg;
          statusDiv.className = 'form-status text-danger mt-2';
        }
      } finally {
        resetButton();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.brevo-quote-form').forEach(handleQuoteForm);
    document.querySelectorAll('.brevo-newsletter-form').forEach(handleNewsletterForm);
  });
})();
