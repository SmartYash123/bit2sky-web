(function () {
  'use strict';

  function handleQuoteForm(form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      var submitBtn = form.querySelector('button[type="submit"]');
      var statusDiv = form.querySelector('.form-status');
      var originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      if (statusDiv) statusDiv.textContent = '';

      var data = {
        firstName: (form.querySelector('[name="firstName"]').value || '').trim(),
        lastName: (form.querySelector('[name="lastName"]') ? form.querySelector('[name="lastName"]').value : '').trim(),
        email: (form.querySelector('[name="email"]').value || '').trim(),
        phone: (form.querySelector('[name="phone"]') ? form.querySelector('[name="phone"]').value : '').trim(),
        company: (form.querySelector('[name="company"]') ? form.querySelector('[name="company"]').value : '').trim(),
        message: (form.querySelector('[name="message"]') ? form.querySelector('[name="message"]').value : '').trim(),
        sourcePage: window.location.pathname
      };

      try {
        var response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

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
        if (statusDiv) {
          statusDiv.textContent = err.message || 'Something went wrong. Please try again.';
          statusDiv.className = 'form-status text-danger mt-2';
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  function handleNewsletterForm(form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      var submitBtn = form.querySelector('button[type="submit"]');
      var statusDiv = form.querySelector('.form-status');
      var originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Subscribing...';
      if (statusDiv) statusDiv.textContent = '';

      var email = (form.querySelector('[name="email"]').value || '').trim();

      try {
        var response = await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email })
        });

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
        if (statusDiv) {
          statusDiv.textContent = err.message || 'Something went wrong. Please try again.';
          statusDiv.className = 'form-status text-danger mt-2';
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.brevo-quote-form').forEach(handleQuoteForm);
    document.querySelectorAll('.brevo-newsletter-form').forEach(handleNewsletterForm);
  });
})();
