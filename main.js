// ===== CONFIG =====
// Replace YOUR-N8N-DOMAIN with your actual n8n instance domain
// Your webhook path from n8n: /webhook/atoz-quote
const WEBHOOK_URL = 'https://YOUR-N8N-DOMAIN.com/webhook/atoz-quote';

// ===== NAV =====
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

// ===== FAQ ACCORDION =====
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

// ===== 3D ORBITING CAROUSEL =====
(function() {
  const scene = document.getElementById('carouselScene');
  const wrapper = document.getElementById('carouselWrapper');
  if (!scene || !wrapper) return;

  const cards = scene.querySelectorAll('.service-card');
  const total = cards.length;
  const angleStep = (2 * Math.PI) / total;
  const radiusX = 380;
  const radiusZ = 280;
  const tiltX = -12;
  let angle = 0;
  let speed = 0.003;
  let targetSpeed = 0.003;
  let paused = false;
  let rafId = null;
  let isDragging = false;
  let dragStartX = 0;
  let dragAngleStart = 0;

  function positionCards() {
    cards.forEach((card, i) => {
      const cardAngle = angle + i * angleStep;
      const x = Math.sin(cardAngle) * radiusX;
      const z = Math.cos(cardAngle) * radiusZ;
      const y = Math.sin(cardAngle) * 30;

      const scale = (z + radiusZ) / (2 * radiusZ);
      const mappedScale = 0.65 + scale * 0.35;
      const mappedOpacity = 0.4 + scale * 0.6;
      const zIndex = Math.round(scale * 100);

      card.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateX(${tiltX}deg) scale(${mappedScale})`;
      card.style.zIndex = zIndex;
      card.style.opacity = mappedOpacity;
      card.style.filter = scale < 0.5 ? `blur(${(1 - scale * 2) * 2}px)` : 'none';
      card.style.pointerEvents = scale > 0.6 ? 'auto' : 'none';
    });
  }

  function animate() {
    if (!paused && !isDragging) {
      speed += (targetSpeed - speed) * 0.05;
      angle += speed;
    }
    positionCards();
    rafId = requestAnimationFrame(animate);
  }

  wrapper.addEventListener('mouseenter', () => {
    if (!isDragging) {
      paused = true;
      targetSpeed = 0;
    }
  });

  wrapper.addEventListener('mouseleave', () => {
    paused = false;
    targetSpeed = 0.003;
  });

  wrapper.addEventListener('mousedown', (e) => {
    if (e.target.closest('.service-card')) return;
    isDragging = true;
    dragStartX = e.clientX;
    dragAngleStart = angle;
    wrapper.style.cursor = 'grabbing';
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX;
    angle = dragAngleStart + dx * 0.005;
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      wrapper.style.cursor = '';
    }
  });

  wrapper.addEventListener('touchstart', (e) => {
    if (e.target.closest('.service-card')) return;
    isDragging = true;
    dragStartX = e.touches[0].clientX;
    dragAngleStart = angle;
    paused = true;
  }, { passive: true });

  wrapper.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - dragStartX;
    angle = dragAngleStart + dx * 0.005;
  }, { passive: true });

  wrapper.addEventListener('touchend', () => {
    isDragging = false;
    paused = false;
    targetSpeed = 0.003;
  });

  positionCards();
  animate();
})();

// ===== SCROLL REVEAL =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.faq-item, .svc-what-list li, [data-reveal]').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});
