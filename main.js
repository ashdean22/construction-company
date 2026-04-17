// ===== CONFIG =====
// Replace YOUR-N8N-DOMAIN with your actual n8n instance domain
// Your webhook path from n8n: /webhook/atoz-quote
const WEBHOOK_URL = 'https://n8n.outlander.ventures/webhook/atoz-quote-v2';

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

// ===== 3D ORBITING CAROUSEL =====
(function() {
  const wrapper = document.getElementById('carouselWrapper');
  const scene = document.getElementById('carouselScene');
  const dotsContainer = document.getElementById('carouselDots');
  if (!wrapper || !scene) return;

  const cards = Array.from(scene.querySelectorAll('.service-card'));
  const total = cards.length;
  const angleStep = (Math.PI * 2) / total;

  let currentAngle = 0;
  let targetAngle = 0;
  let autoSpeed = 0.005;
  let cardHovered = false;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartAngle = 0;
  let lastDragDelta = 0;
  let momentum = 0;
  let frontIndex = 0;

  function getRadius() {
    const w = wrapper.offsetWidth;
    if (w < 600) return { x: 180, z: 160 };
    if (w < 900) return { x: 280, z: 220 };
    return { x: 400, z: 300 };
  }

  function getCardOffset() {
    const card = cards[0];
    return { x: card.offsetWidth / 2, y: card.offsetHeight / 2 };
  }

  cards.forEach((card) => {
    card.addEventListener('mouseenter', () => { cardHovered = true; });
    card.addEventListener('mouseleave', () => { cardHovered = false; });
  });

  for (let i = 0; i < total; i++) {
    const dot = document.createElement('div');
    dot.className = 'carousel-dot';
    dot.addEventListener('click', () => {
      const targetCardAngle = -i * angleStep;
      let diff = targetCardAngle - currentAngle;
      diff = ((diff + Math.PI) % (Math.PI * 2)) - Math.PI;
      if (diff < -Math.PI) diff += Math.PI * 2;
      targetAngle = currentAngle + diff;
      momentum = 0;
    });
    dotsContainer.appendChild(dot);
  }
  const dots = dotsContainer.querySelectorAll('.carousel-dot');

  function positionCards() {
    const r = getRadius();
    const offset = getCardOffset();
    let closestDist = Infinity;
    let closestIdx = 0;

    cards.forEach((card, i) => {
      const a = currentAngle + i * angleStep;
      const x = Math.sin(a) * r.x;
      const z = Math.cos(a) * r.z;
      const y = Math.sin(a * 0.5) * 20;

      const normalizedZ = (z + r.z) / (2 * r.z);
      const scale = 0.6 + normalizedZ * 0.4;
      const opacity = 0.3 + normalizedZ * 0.7;

      card.style.transform = `translate3d(${x - offset.x}px, ${y - offset.y}px, ${z}px) scale(${scale})`;
      card.style.zIndex = Math.round(normalizedZ * 100);
      card.style.opacity = opacity;

      if (normalizedZ < 0.35) {
        card.style.filter = `blur(${(0.35 - normalizedZ) * 6}px)`;
        card.style.pointerEvents = 'none';
      } else {
        card.style.filter = 'none';
        card.style.pointerEvents = 'auto';
      }

      const dist = Math.abs(Math.sin(a)) + (1 - Math.cos(a));
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    });

    frontIndex = closestIdx;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === frontIndex));
  }

  let lastTime = performance.now();

  function animate(now) {
    const dt = Math.min((now - lastTime) / 16.667, 3);
    lastTime = now;

    if (!isDragging) {
      if (Math.abs(momentum) > 0.0001) {
        currentAngle += momentum * dt;
        momentum *= 0.94;
      } else if (!cardHovered) {
        targetAngle += autoSpeed * dt;
      }

      currentAngle += (targetAngle - currentAngle) * 0.08 * dt;
    }

    positionCards();
    requestAnimationFrame(animate);
  }

  wrapper.addEventListener('mousedown', (e) => {
    if (e.target.closest('.service-card')) return;
    isDragging = true;
    dragStartX = e.clientX;
    dragStartAngle = currentAngle;
    lastDragDelta = 0;
    momentum = 0;
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX;
    const newAngle = dragStartAngle + dx * 0.004;
    lastDragDelta = newAngle - currentAngle;
    currentAngle = newAngle;
    targetAngle = currentAngle;
  });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    momentum = lastDragDelta;
  });

  wrapper.addEventListener('touchstart', (e) => {
    isDragging = true;
    dragStartX = e.touches[0].clientX;
    dragStartAngle = currentAngle;
    lastDragDelta = 0;
    momentum = 0;
  }, { passive: true });

  wrapper.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - dragStartX;
    const newAngle = dragStartAngle + dx * 0.005;
    lastDragDelta = newAngle - currentAngle;
    currentAngle = newAngle;
    targetAngle = currentAngle;
  }, { passive: true });

  wrapper.addEventListener('touchend', () => {
    isDragging = false;
    momentum = lastDragDelta * 1.5;
    targetAngle = currentAngle;
  });

  positionCards();
  requestAnimationFrame(animate);
})();
