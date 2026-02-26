// ===== CONFIG =====
// Replace with your actual n8n webhook URL
const WEBHOOK_URL = 'https://YOUR-N8N-DOMAIN.com/webhook/atoz-quote';

// Navbar scroll
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
});

// Mobile menu
const toggle = document.getElementById('mobileToggle');
const links = document.getElementById('navLinks');
toggle.addEventListener('click', () => links.classList.toggle('open'));

// Mobile dropdown
document.querySelectorAll('.dropdown').forEach(dd => {
  dd.querySelector('.dropdown-toggle').addEventListener('click', (e) => {
    if (window.innerWidth <= 900) {
      e.preventDefault();
      dd.classList.toggle('open');
    }
  });
});

// Close mobile menu on link click
links.querySelectorAll('a:not(.dropdown-toggle)').forEach(link => {
  link.addEventListener('click', () => links.classList.remove('open'));
});

// FAQ accordion
document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('click', () => {
    const item = q.parentElement;
    document.querySelectorAll('.faq-item').forEach(i => { if (i !== item) i.classList.remove('open'); });
    item.classList.toggle('open');
  });
});

// ===== FORM SUBMISSION =====
const form = document.getElementById('bookingForm');
if (form) {
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = this.querySelector('.form-submit');
    const originalText = btn.textContent;

    // Collect form data
    const formData = new FormData(this);
    const data = {};
    formData.forEach((v, k) => data[k] = v);

    // Add metadata
    data.submitted_at = new Date().toISOString();
    data.page_url = window.location.href;

    // UI: loading state
    btn.textContent = 'Sending...';
    btn.disabled = true;
    btn.style.opacity = '0.7';

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error(`Server responded ${response.status}`);

      // Success
      btn.textContent = '✓ Request Submitted!';
      btn.style.background = '#22c55e';
      btn.style.color = '#fff';
      btn.style.opacity = '1';
      form.reset();

      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.style.color = '';
        btn.disabled = false;
      }, 4000);

    } catch (err) {
      console.error('Form submission error:', err);

      btn.textContent = 'Error — Try Again';
      btn.style.background = '#ef4444';
      btn.style.color = '#fff';
      btn.style.opacity = '1';

      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.style.color = '';
        btn.disabled = false;
      }, 3000);
    }
  });
}

// Scroll reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.service-card, .faq-item, .svc-what-list li, [data-reveal]').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});
