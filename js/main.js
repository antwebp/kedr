// Header scroll state
const header = document.getElementById('header');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Mobile menu
const burger = document.getElementById('burger');
const menu = document.getElementById('mobileMenu');
const setMenu = (open) => {
  menu.hidden = !open;
  burger.setAttribute('aria-expanded', String(open));
  burger.classList.toggle('is-open', open);
  document.body.style.overflow = open ? 'hidden' : '';
};
burger.addEventListener('click', () => setMenu(menu.hidden));
menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

// Modals
const productModal = document.getElementById('productModal');
const leadModal = document.getElementById('leadModal');
let openModalEl = null;

function openModal(modal) {
  setMenu(false); // closing the menu restores body scroll
  clearTimeout(modal._closeTimer); // cancel a pending close of this very modal
  if (openModalEl) hideModalNow(openModalEl);
  modal.classList.remove('is-closing');
  modal.hidden = false;
  openModalEl = modal;
  document.body.style.overflow = 'hidden';
  const focusable = modal.querySelector('input, button:not(.modal__close)');
  if (focusable) focusable.focus({ preventScroll: true });
}
function closeModal() {
  if (!openModalEl) return;
  const modal = openModalEl;
  openModalEl = null;
  document.body.style.overflow = '';
  // graceful exit: play the closing animation, then hide
  modal.classList.add('is-closing');
  modal._closeTimer = setTimeout(() => hideModalNow(modal), 320);
}
function hideModalNow(modal) {
  clearTimeout(modal._closeTimer);
  modal.hidden = true;
  modal.classList.remove('is-closing');
}

// Product catalog (descriptions shown in the modal)
const PRODUCTS = {
  cones: {
    title: 'Кедровая шишка',
    img: 'assets/img/product-cones.jpg',
    alt: 'Кедровые шишки в деревянной чаше',
    price: 'от 450 ₽',
    unit: 'за 500 г',
    text: 'Отборные кедровые шишки, собранные вручную в уральской тайге. Богаты смолистыми эфирными маслами, витаминами и микроэлементами: используются для настоек, варений и целебных отваров. Собираем только зрелые шишки без повреждений, обрабатываем бережно — без химии и консервантов. Фасуем в дышащую упаковку, чтобы продукт сохранял аромат и пользу.',
  },
  oil: {
    title: 'Кедровое масло',
    img: 'assets/img/product-oil.jpg',
    alt: 'Бутылка кедрового масла с кедровыми шишками',
    price: 'от 850 ₽',
    unit: 'за 100 мл',
    text: 'Масло холодного отжима первого прессования из ядер кедрового ореха. Сохраняет весь комплекс витаминов E, F и группы B, ненасыщенных жирных кислот и фосфолипидов. Поддерживает иммунитет, здоровье сердца и сосудов, рекомендуется при повышенных нагрузках. Тёмное стекло защищает масло от света — срок хранения до 12 месяцев.',
  },
  nuts: {
    title: 'Кедровый орех',
    img: 'assets/img/product-nuts.jpg',
    alt: 'Кедровый орех в деревянной чаше',
    price: 'от 700 ₽',
    unit: 'за 200 г',
    text: 'Ядро кедрового ореха высшего сорта — очищенное, калиброванное, без мусора и дробленых зёрен. Рекордсмен по содержанию растительного белка, лецитина и витаминов: горсть орехов покрывает суточную норму большинства микроэлементов. Идеален как самостоятельный перекус, в кашах, выпечке и салатах. Свежий урожай текущего сезона.',
  },
};

const productModalImg = document.getElementById('productModalImg');
const productModalTitle = document.getElementById('productModalTitle');
const productModalText = document.getElementById('productModalText');
const productModalPrice = document.getElementById('productModalPrice');

function openProductModal(key) {
  const p = PRODUCTS[key];
  if (!p) return;
  productModalImg.src = p.img;
  productModalImg.alt = p.alt;
  productModalTitle.textContent = p.title;
  productModalText.textContent = p.text;
  productModalPrice.innerHTML = '';
  productModalPrice.append(p.price);
  const unit = document.createElement('span');
  unit.textContent = p.unit;
  productModalPrice.append(unit);
  openModal(productModal);
}

// Trigger wiring (event delegation so it also works for dynamically focused flows)
document.addEventListener('click', (e) => {
  const productBtn = e.target.closest('[data-product]');
  if (productBtn) { openProductModal(productBtn.dataset.product); return; }
  const leadBtn = e.target.closest('[data-open-lead]');
  if (leadBtn) { openModal(leadModal); return; }
  if (e.target.closest('[data-modal-close]')) closeModal();
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (openModalEl) closeModal();
    else setMenu(false);
  }
});

// FAQ accordion — one item open at a time
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach((item) => {
  const head = item.querySelector('.faq-item__head');
  head.addEventListener('click', () => {
    const isOpen = item.classList.contains('is-open');
    faqItems.forEach((other) => {
      other.classList.remove('is-open');
      other.querySelector('.faq-item__head').setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      item.classList.add('is-open');
      head.setAttribute('aria-expanded', 'true');
    }
  });
});

// Phone formatting (Russian format) — applies to every tel input
const formatPhone = (input) => {
  let d = input.value.replace(/\D/g, '');
  if (d.startsWith('8')) d = '7' + d.slice(1);
  if (d && !d.startsWith('7')) d = '7' + d;
  d = d.slice(0, 11);
  let out = '';
  if (d.length) out = '+7';
  // a separator is added only when a digit follows it — otherwise erasing
  // gets stuck right before it (the deleted dash would be re-added)
  if (d.length > 1) out += ' (' + d.slice(1, 4);
  if (d.length > 4) out += ') ' + d.slice(4, 7);
  if (d.length > 7) out += '-' + d.slice(7, 9);
  if (d.length > 9) out += '-' + d.slice(9, 11);
  input.value = out;
};
document.querySelectorAll('input[type="tel"]').forEach((tel) => {
  tel.addEventListener('input', () => formatPhone(tel));
});

// Lead forms (page + modal): identical validation and submit flow
document.querySelectorAll('.lead-form').forEach((form) => {
  const status = form.querySelector('.lead-form__status');
  const submitBtn = form.querySelector('.btn--submit');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    status.classList.remove('is-error');
    const name = form.elements.name.value.trim();
    const tel = form.elements.phone.value.replace(/\D/g, '');
    if (!name) { status.textContent = 'Пожалуйста, укажите ваше имя.'; status.classList.add('is-error'); form.elements.name.focus(); return; }
    if (tel.length < 11) { status.textContent = 'Пожалуйста, укажите корректный телефон.'; status.classList.add('is-error'); form.elements.phone.focus(); return; }
    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'Отправляем…';
    // fields locked while the request "goes through"
    form.querySelectorAll('.field__input').forEach((el) => (el.disabled = true));
    // Simulated request — replace with real API call in production.
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.querySelector('span').textContent = 'Отправить заявку';
      form.querySelectorAll('.field__input').forEach((el) => (el.disabled = false));
      // success notice "delivered" to the user
      status.innerHTML =
        '<svg class="lead-form__check" aria-hidden="true"><use href="#i-check"/></svg>' +
        'Заявка отправлена! Мы свяжемся с вами в ближайшее время.';
      form.reset();
    }, 1100);
  });
});

// ---- Premium anchor scrolling: custom eased animation (~0.9–1.2s) ----
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const HEADER_OFFSET = 82; // exact header height — sections land flush under it
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
let scrollRaf = null;
let autoScrollDir = 0; // direction of the running eased scroll (0 = none)
let wheelLockUntil = 0; // until this timestamp wheel input is swallowed (momentum tail after an eased scroll)

function stopAutoScroll() {
  const wasRunning = !!scrollRaf;
  cancelAnimationFrame(scrollRaf);
  scrollRaf = null;
  autoScrollDir = 0;
  // short tail: swallow the trackpad momentum ticks that follow
  if (wasRunning) wheelLockUntil = performance.now() + 300;
}

function smoothScrollTo(targetY) {
  const maxY = document.documentElement.scrollHeight - window.innerHeight;
  const endY = Math.max(0, Math.min(targetY, maxY));
  if (prefersReduced) { window.scrollTo(0, endY); return; }
  const startY = window.scrollY;
  const diff = endY - startY;
  if (Math.abs(diff) < 2) { scrollRaf = null; return; }
  autoScrollDir = Math.sign(diff);
  // slower than native, but proportional to distance: 650ms…1150ms
  const duration = Math.min(650 + Math.abs(diff) * 0.18, 1150);
  const start = performance.now();
  cancelAnimationFrame(scrollRaf);
  const step = (now) => {
    const t = Math.min((now - start) / duration, 1);
    window.scrollTo(0, startY + diff * easeInOutCubic(t));
    if (t < 1) scrollRaf = requestAnimationFrame(step);
    else stopAutoScroll();
  };
  scrollRaf = requestAnimationFrame(step);
}

// ---- One-scroll transitions: Hero → Benefits, FAQ → CTA ----
const benefitsSec = document.getElementById('benefits');
const faqSec = document.getElementById('faq');
const ctaSec = document.getElementById('lead');
const WHEEL_NOTCH = 20;
const sectionTop = (el) => el.getBoundingClientRect().top + window.scrollY;

// Touch devices (phones/tablets) scroll natively — the one-scroll hijack
// is a desktop-only interaction. It is also disabled below the desktop
// breakpoint (≤1199px), where the page uses the compact tablet layout.
const isTouchLike = window.matchMedia('(hover: none), (pointer: coarse)').matches;

// Single wheel handler: while an eased scroll is running it owns the page —
// all wheel input is swallowed (so native scrolling never fights the rAF
// animation), an upward scroll interrupts it. That is what keeps trackpad
// flicks smooth instead of janky.
window.addEventListener('wheel', (e) => {
  if (prefersReduced || isTouchLike || window.innerWidth <= 1199) return;
  if (document.body.style.overflow === 'hidden') return; // modal or mobile menu open

  if (scrollRaf) {
    if (Math.sign(e.deltaY) === -autoScrollDir) stopAutoScroll(); // opposite direction = interrupt
    e.preventDefault();
    return;
  }
  if (performance.now() < wheelLockUntil) { e.preventDefault(); return; } // momentum tail
  if (e.deltaY < WHEEL_NOTCH) return; // only a meaningful downward scroll

  const y = window.scrollY;
  // on the hero: the first scroll leads to the benefits section
  if (y < window.innerHeight * 0.4) {
    e.preventDefault();
    smoothScrollTo(sectionTop(benefitsSec) - HEADER_OFFSET + 1);
    return;
  }
  // after the FAQ: the next scroll leads to the CTA screen
  const ctaTop = sectionTop(ctaSec);
  const faqTop = sectionTop(faqSec);
  const faqBottom = faqTop + faqSec.offsetHeight;
  if (y >= faqTop - 120 && y + window.innerHeight >= faqBottom - 60 && y < ctaTop - window.innerHeight * 0.5) {
    e.preventDefault();
    smoothScrollTo(ctaTop);
  }
}, { passive: false });

// let the JS animation own the scroll (native smooth would fight per-frame steps)
document.documentElement.style.scrollBehavior = 'auto';
['touchstart', 'keydown'].forEach((ev) =>
  window.addEventListener(ev, stopAutoScroll, { passive: true })
);

document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (href.length < 2) return; // "#" placeholders
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const y = href === '#hero'
      ? 0
      : target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET + 1;
    smoothScrollTo(y);
  });
});

// ---- Section reveal transitions (harmonious fade+rise as sections enter) ----
const revealTargets = document.querySelectorAll([
  '.benefits__intro', '.benefits__list > .benefit',
  '.products .eyebrow', '.products .h2', '.products__grid > .product-card',
  '.process .eyebrow', '.process .h2', '.process__steps > .step',
  '.why__content', '.why__photo', '.why__metrics > .metric',
  '.faq .eyebrow', '.faq .h2', '.faq__text', '.faq__list > .faq-item',
  '.cta__card',
  '.footer__brand', '.footer__col', '.footer__contacts'
].join(','));

if (prefersReduced) {
  revealTargets.forEach((el) => el.classList.add('in-view'));
} else {
  // stagger siblings within the same block for a smooth cascade
  const groups = new Map();
  revealTargets.forEach((el) => {
    el.classList.add('reveal');
    const parent = el.parentElement;
    if (!groups.has(parent)) groups.set(parent, 0);
    const idx = groups.get(parent);
    if (idx < 5) el.style.setProperty('--reveal-delay', `${idx * 90}ms`);
    groups.set(parent, idx + 1);
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  revealTargets.forEach((el) => io.observe(el));
}