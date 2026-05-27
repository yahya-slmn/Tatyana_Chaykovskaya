const menuBtn = document.getElementById('menuBtn');
const nav = document.getElementById('nav');
const cursorGlow = document.querySelector('.cursor-glow');
const scrollProgress = document.getElementById('scrollProgress');
const loader = document.getElementById('cinematicLoader');
const loaderLine = document.getElementById('loaderLine');
const spotlight = document.getElementById('luxurySpotlight');

function setMenuState(isOpen) {
  nav?.classList.toggle('active', isOpen);
  menuBtn?.setAttribute('aria-expanded', String(isOpen));
  document.body.classList.toggle('menu-open', isOpen);
  const icon = menuBtn?.querySelector('i');
  if (icon) {
    icon.classList.toggle('bx-menu', !isOpen);
    icon.classList.toggle('bx-x', isOpen);
  }
}
menuBtn?.setAttribute('aria-expanded', 'false');
menuBtn?.addEventListener('click', () => setMenuState(!nav?.classList.contains('active')));
document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', () => setMenuState(false)));
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenuState(false); });
window.addEventListener('resize', () => { if (window.innerWidth > 1180) setMenuState(false); });

const canUsePointerFX = window.matchMedia('(pointer: fine)').matches && window.innerWidth > 1024;
let pointerFrame = null;
let pointerX = 0;
let pointerY = 0;

function updatePointerFX() {
  pointerFrame = null;
  if (cursorGlow) {
    cursorGlow.style.left = `${pointerX}px`;
    cursorGlow.style.top = `${pointerY}px`;
  }
  if (spotlight) {
    spotlight.style.setProperty('--mx', `${pointerX}px`);
    spotlight.style.setProperty('--my', `${pointerY}px`);
  }
}

if (canUsePointerFX) {
  window.addEventListener('mousemove', (e) => {
    pointerX = e.clientX;
    pointerY = e.clientY;
    if (!pointerFrame) pointerFrame = requestAnimationFrame(updatePointerFX);
  }, { passive: true });
}

window.addEventListener('load', () => {
  if (loaderLine) loaderLine.style.width = '100%';
  setTimeout(() => loader?.classList.add('hide'), 180);
  setTimeout(() => loader?.remove(), 850);
});

let scrollFrame = null;
function updateProgress() {
  scrollFrame = null;
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  if (scrollProgress) scrollProgress.style.width = `${pct}%`;
}
window.addEventListener('scroll', () => {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateProgress);
}, { passive: true });
updateProgress();

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));


// Responsive gallery slideshow.
// Desktop/laptop uses 16:9 landscape images.
// Mobile uses 9:16 portrait images.
// Only the active image + nearby thumbnails are loaded for better performance.
const slideMeta = [
  { title: 'Signature Culinary Direction', kicker: 'Editorial Story', category: 'all' },
  { title: 'Color, Texture & Detail', kicker: 'Artistic Direction', category: 'story' },
  { title: 'Emotion Through Food', kicker: 'Philosophy', category: 'vision' },
  { title: 'Wellness With Elegance', kicker: 'Wellness Vision', category: 'vision' },
  { title: 'Spice, Depth & Memory', kicker: 'Culinary Identity', category: 'story' },
  { title: 'Balanced Concept Plates', kicker: 'R&D Method', category: 'rd' },
  { title: 'Premium Guest Moment', kicker: 'Hospitality', category: 'business' },
  { title: 'Fresh Flavor Architecture', kicker: 'R&D Method', category: 'rd' },
  { title: 'Precision & Construction', kicker: 'Technical Craft', category: 'rd' },
  { title: 'Market-Ready Product', kicker: 'Business Thinking', category: 'business' },
  { title: 'Sensory Composition', kicker: 'Editorial Food', category: 'story' },
  { title: 'Luxury Texture Story', kicker: 'Signature Detail', category: 'all' },
  { title: 'Premium Product Styling', kicker: 'Business Thinking', category: 'business' },
  { title: 'Seasonal Flavor Mood', kicker: 'Wellness Vision', category: 'vision' },
  { title: 'Refined Plate Memory', kicker: 'Editorial Story', category: 'story' },
  { title: 'Soft Dessert Moment', kicker: 'Signature Detail', category: 'story' },
  { title: 'Creative Culinary Study', kicker: 'R&D Method', category: 'rd' },
  { title: 'Guest-Facing Beauty', kicker: 'Hospitality', category: 'business' },
  { title: 'Ingredient-Led Concept', kicker: 'R&D Method', category: 'rd' },
  { title: 'Artistic Brand Moment', kicker: 'Editorial Food', category: 'vision' },
  { title: 'Premium Dessert Language', kicker: 'Signature Detail', category: 'all' },
  { title: 'Modern Food Story', kicker: 'Culinary Identity', category: 'story' },
  { title: 'Light Wellness Touch', kicker: 'Wellness Vision', category: 'vision' },
  { title: 'Concept to Plate', kicker: 'R&D Method', category: 'rd' },
  { title: 'Memorable Guest Delight', kicker: 'Hospitality', category: 'business' }
];

const landscapeImages = Array.from({ length: 15 }, (_, i) => `assets/optimized/landscape_slideshow/image-${String(i + 1).padStart(2, '0')}.webp`);
const portraitImages = Array.from({ length: 25 }, (_, i) => `assets/optimized/portrait_slideshow/slide-${String(i + 1).padStart(2, '0')}.webp`);

let isMobileGallery = window.matchMedia('(max-width: 768px)').matches;
let gallerySlides = buildResponsiveSlides();

function buildResponsiveSlides() {
  const images = isMobileGallery ? portraitImages : landscapeImages;
  return images.map((img, index) => ({ ...slideMeta[index % slideMeta.length], img }));
}

const slideImage = document.getElementById('slideImage');
const slideKicker = document.getElementById('slideKicker');
const slideTitle = document.getElementById('slideTitle');
const slideCounter = document.getElementById('slideCounter');
const slideThumbs = document.getElementById('slideThumbs');
const prevSlide = document.getElementById('prevSlide');
const nextSlide = document.getElementById('nextSlide');
let currentSlide = 0;
let activeFilter = 'all';
let filteredSlides = [...gallerySlides];
let autoSlideTimer;

function twoDigits(number) {
  return String(number).padStart(2, '0');
}

let thumbObserver = null;
let galleryInitialized = false;
let galleryInView = false;
let slideshowShell = document.querySelector('.slideshow-shell');

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(src);
    img.onerror = () => resolve(src);
    img.src = src;
  });
}

function setupThumbLazyLoad() {
  if (!slideThumbs) return;
  if (thumbObserver) thumbObserver.disconnect();

  const loadThumb = (img) => {
    if (!img || img.src || !img.dataset.src) return;
    img.src = img.dataset.src;
  };

  if ('IntersectionObserver' in window) {
    thumbObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        loadThumb(entry.target);
        thumbObserver.unobserve(entry.target);
      });
    }, { root: slideThumbs, rootMargin: '60px 120px' });

    slideThumbs.querySelectorAll('img[data-src]').forEach((img, index) => {
      if (index === currentSlide || index === currentSlide + 1) loadThumb(img);
      else thumbObserver.observe(img);
    });
  } else {
    slideThumbs.querySelectorAll('img[data-src]').forEach(loadThumb);
  }
}

function renderThumbs() {
  if (!slideThumbs) return;
  slideThumbs.innerHTML = filteredSlides.map((slide, index) => `
    <button class="slide-thumb ${index === currentSlide ? 'active' : ''}" data-index="${index}" aria-label="Open ${slide.title}">
      <img data-src="${slide.img}" alt="${slide.title} thumbnail" loading="lazy" decoding="async" fetchpriority="low">
    </button>
  `).join('');

  if (!slideThumbs.dataset.bound) {
    slideThumbs.dataset.bound = 'true';
    slideThumbs.addEventListener('click', (e) => {
      const btn = e.target.closest('.slide-thumb');
      if (!btn) return;
      goToSlide(Number(btn.dataset.index), true);
    });
  }

  setupThumbLazyLoad();
}

function updateThumbActive() {
  if (!slideThumbs) return;
  slideThumbs.querySelectorAll('.slide-thumb').forEach((thumb, index) => {
    const isActive = index === currentSlide;
    thumb.classList.toggle('active', isActive);
    if (isActive || index === currentSlide + 1) {
      const img = thumb.querySelector('img[data-src]');
      if (img && !img.src) img.src = img.dataset.src;
    }
  });
}

function preloadNextSlide() {
  if (!galleryInView) return;
  const next = filteredSlides[(currentSlide + 1) % filteredSlides.length];
  if (!next) return;
  const run = () => {
    const img = new Image();
    img.decoding = 'async';
    img.src = next.img;
  };
  if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 1200 });
  else setTimeout(run, 700);
}

function goToSlide(index, resetTimer = false) {
  if (!filteredSlides.length) return;
  currentSlide = (index + filteredSlides.length) % filteredSlides.length;
  const slide = filteredSlides[currentSlide];

  if (slideImage && slide) {
    const applySlide = () => {
      slideImage.src = slide.img;
      slideImage.alt = slide.title;
      slideImage.classList.remove('changing');
      preloadNextSlide();
    };

    if (slideImage.getAttribute('src') === slide.img) {
      slideImage.alt = slide.title;
      preloadNextSlide();
    } else {
      slideImage.classList.add('changing');
      loadImage(slide.img).then(applySlide);
    }
  }

  if (slideKicker) slideKicker.textContent = slide.kicker;
  if (slideTitle) slideTitle.textContent = slide.title;
  if (slideCounter) slideCounter.textContent = `${twoDigits(currentSlide + 1)} / ${twoDigits(filteredSlides.length)}`;
  updateThumbActive();
  if (resetTimer) startAutoSlide();
}

function startAutoSlide() {
  clearInterval(autoSlideTimer);
  if (!galleryInitialized || !galleryInView) return;
  autoSlideTimer = setInterval(() => goToSlide(currentSlide + 1), 5200);
}

function initGallery(shouldAutoplay = true) {
  if (galleryInitialized) return;
  galleryInitialized = true;
  updateGalleryModeClass();
  renderThumbs();
  goToSlide(0);

  prevSlide?.addEventListener('click', () => goToSlide(currentSlide - 1, true));
  nextSlide?.addEventListener('click', () => goToSlide(currentSlide + 1, true));
  slideImage?.addEventListener('click', () => openViewer(currentSlide));

  if (shouldAutoplay) startAutoSlide();
}

if (slideshowShell && 'IntersectionObserver' in window) {
  const slideshowObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      galleryInView = entry.isIntersecting;
      if (entry.isIntersecting) {
        initGallery(true);
        startAutoSlide();
      } else {
        clearInterval(autoSlideTimer);
      }
    });
  }, { threshold: 0.16, rootMargin: '520px 0px' });
  slideshowObserver.observe(slideshowShell);
} else {
  galleryInView = true;
  initGallery(true);
}


function refreshFilteredSlides() {
  filteredSlides = activeFilter === 'all'
    ? [...gallerySlides]
    : gallerySlides.filter(slide => slide.category === activeFilter || slide.category === 'all');
}

function updateGalleryModeClass() {
  slideshowShell?.classList.toggle('portrait-mode', isMobileGallery);
  slideshowShell?.classList.toggle('landscape-mode', !isMobileGallery);
}

function refreshResponsiveGallery() {
  const nextIsMobile = window.matchMedia('(max-width: 768px)').matches;
  if (nextIsMobile === isMobileGallery) return;
  isMobileGallery = nextIsMobile;
  gallerySlides = buildResponsiveSlides();
  refreshFilteredSlides();
  currentSlide = Math.min(currentSlide, filteredSlides.length - 1);
  updateGalleryModeClass();
  if (galleryInitialized) {
    renderThumbs();
    goToSlide(currentSlide, true);
  }
}

updateGalleryModeClass();
window.addEventListener('resize', refreshResponsiveGallery, { passive: true });

// Category filters for the slideshow.
document.querySelectorAll('.gallery-filter').forEach(btn => {
  btn.addEventListener('click', () => {
    galleryInView = true;
    initGallery(false);
    activeFilter = btn.dataset.filter;
    document.querySelectorAll('.gallery-filter').forEach(item => item.classList.toggle('active', item === btn));
    refreshFilteredSlides();
    currentSlide = 0;
    renderThumbs();
    goToSlide(0, true);
  });
});

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxTitle = document.getElementById('lightboxTitle');
const closeLightbox = document.getElementById('closeLightbox');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
let lightboxIndex = 0;

function openViewer(index = currentSlide) {
  lightboxIndex = (index + filteredSlides.length) % filteredSlides.length;
  const slide = filteredSlides[lightboxIndex];
  if (!lightbox || !lightboxImg || !lightboxTitle || !slide) return;
  lightboxImg.src = slide.img;
  lightboxImg.alt = slide.title;
  lightboxTitle.textContent = `${slide.kicker} — ${slide.title}`;
  lightbox.classList.add('active');
  lightbox.setAttribute('aria-hidden', 'false');
}

function moveViewer(step) {
  openViewer(lightboxIndex + step);
}

function closeViewer() {
  lightbox.classList.remove('active');
  lightbox.setAttribute('aria-hidden', 'true');
  lightboxImg.src = '';
}

// Existing gallery cards also open through the slideshow lightbox.
document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    const foundIndex = filteredSlides.findIndex(slide => slide.img === item.dataset.img);
    openViewer(foundIndex >= 0 ? foundIndex : currentSlide);
  });
});

closeLightbox?.addEventListener('click', closeViewer);
lightboxPrev?.addEventListener('click', (e) => { e.stopPropagation(); moveViewer(-1); });
lightboxNext?.addEventListener('click', (e) => { e.stopPropagation(); moveViewer(1); });
lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) closeViewer(); });
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeViewer();
  if (lightbox?.classList.contains('active') && e.key === 'ArrowLeft') moveViewer(-1);
  if (lightbox?.classList.contains('active') && e.key === 'ArrowRight') moveViewer(1);
});

// Magnetic premium buttons.
if (canUsePointerFX) document.querySelectorAll('.magnetic').forEach(item => {
  item.addEventListener('mousemove', (e) => {
    const rect = item.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    item.style.transform = `translate(${x * 0.12}px, ${y * 0.16}px)`;
  });
  item.addEventListener('mouseleave', () => {
    item.style.transform = '';
  });
});

// Gentle tilt for portrait.
if (canUsePointerFX) document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `rotateY(${x * 7}deg) rotateX(${-y * 7}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});


// Culinary universe depth movement.
const universeStage = document.querySelector('.universe-stage');
const universeCards = document.querySelectorAll('.universe-card');
if (canUsePointerFX) universeStage?.addEventListener('mousemove', (e) => {
  const rect = universeStage.getBoundingClientRect();
  const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
  const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
  universeCards.forEach(card => {
    const depth = Number(card.dataset.depth || 0.2);
    card.style.translate = `${x * depth * 120}px ${y * depth * 120}px`;
  });
});
universeStage?.addEventListener('mouseleave', () => {
  universeCards.forEach(card => card.style.translate = '0 0');
});

// Keep autoplay running while hovering; pause only when the tab is hidden.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) clearInterval(autoSlideTimer);
  else if (slideshowShell?.classList.contains('visible')) startAutoSlide();
});


// ---------- Cinematic final layer ----------

// Active navigation state while scrolling.
const pageSections = [...document.querySelectorAll('main section[id]')];
const pageNavLinks = [...document.querySelectorAll('.nav a')];
function setActiveNav(){
  const y = window.scrollY + window.innerHeight * 0.35;
  let current = pageSections[0]?.id;
  pageSections.forEach(section => {
    if (y >= section.offsetTop) current = section.id;
  });
  pageNavLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${current}`));
}
window.addEventListener('scroll', setActiveNav, { passive: true });
setActiveNav();

// Scroll-driven cinematic film card motion.
const filmSection = document.querySelector('.signature-film');
const filmTrack = document.querySelector('.film-track');
function updateFilmMotion(){
  if (!filmSection || !filmTrack || window.innerWidth < 900) return;
  const rect = filmSection.getBoundingClientRect();
  const progress = Math.min(Math.max(-rect.top / (rect.height - window.innerHeight), 0), 1);
  const maxMove = Math.max(filmTrack.scrollWidth - filmTrack.clientWidth, 0);
  filmTrack.style.transform = `translateX(${-maxMove * progress}px)`;
}
window.addEventListener('scroll', updateFilmMotion, { passive: true });
window.addEventListener('resize', updateFilmMotion);
updateFilmMotion();

// Give cards a soft editorial entrance delay.
document.querySelectorAll('.film-card, .future-card, .behind-card, .journey-step').forEach((el, index) => {
  el.style.transitionDelay = `${Math.min(index * 90, 360)}ms`;
});

// Experience section is now a stable editorial mosaic, so no horizontal scroll transform is needed.
if (filmTrack) filmTrack.style.transform = 'none';
