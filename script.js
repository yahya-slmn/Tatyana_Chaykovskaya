/* =====================================================================
   Tetiana Chaykovskaya — Portfolio behaviour
   1 Header + nav + scrollspy   2 Loader + progress   3 Reveal
   4 Showcase crossfade engine  5 Gallery slideshow   6 Lightbox
   ===================================================================== */
(() => {
  "use strict";

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const two = (n) => String(n).padStart(2, "0");
  const preload = (src) => { const i = new Image(); i.decoding = "async"; i.src = src; };

  /* 1 ── HEADER / NAV / SCROLLSPY ─────────────────────────────── */
  const header  = $("#header");
  const nav      = $("#nav");
  const menuBtn  = $("#menuBtn");
  const scrim    = $("#navScrim");

  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    scrim.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("is-locked", open);
  };

  menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  scrim.addEventListener("click", () => setMenu(false));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  window.addEventListener("resize", () => { if (window.innerWidth > 899) setMenu(false); });

  // Smooth scroll with fixed-header offset.
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      setMenu(false);
      const top = target.getBoundingClientRect().top + window.scrollY - (header.offsetHeight + 8);
      window.scrollTo({ top: Math.max(top, 0), behavior: reduceMotion ? "auto" : "smooth" });
      history.replaceState(null, "", id);
    });
  });

  // Header background + active-link scrollspy.
  const navLinks = $$(".nav a");
  const sections = navLinks
    .map((a) => $(a.getAttribute("href")))
    .filter(Boolean);

  const onScroll = () => {
    header.classList.toggle("is-stuck", window.scrollY > 24);
    const line = window.scrollY + header.offsetHeight + window.innerHeight * 0.28;
    let active = sections[0];
    sections.forEach((s) => { if (s.offsetTop <= line) active = s; });
    navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${active?.id}`));
  };

  /* 2 ── LOADER + SCROLL PROGRESS ─────────────────────────────── */
  const loader    = $("#loader");
  const loaderBar = $("#loaderBar");
  const progress  = $("#scrollProgress");

  requestAnimationFrame(() => { if (loaderBar) loaderBar.style.width = "70%"; });

  window.addEventListener("load", () => {
    if (loaderBar) loaderBar.style.width = "100%";
    setTimeout(() => loader && loader.classList.add("is-hidden"), 450);
    setTimeout(() => loader && loader.remove(), 1200);
  });
  // Safety fallback if 'load' is delayed.
  setTimeout(() => { if (loader && !loader.classList.contains("is-hidden")) { loader.classList.add("is-hidden"); setTimeout(() => loader.remove(), 1000); } }, 4000);

  let ticking = false;
  const updateProgress = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
    onScroll();
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  updateProgress();

  /* 3 ── REVEAL ON SCROLL ─────────────────────────────────────── */
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("is-in"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    $$(".reveal").forEach((el) => io.observe(el));
    // stagger grid/timeline children
    $$(".capability-grid .reveal, .timeline .reveal").forEach((el, i) => {
      el.style.setProperty("--d", `${(i % 4) * 90}ms`);
    });
  } else {
    $$(".reveal").forEach((el) => el.classList.add("is-in"));
  }

  /* 4 ── REUSABLE SHOWCASE CROSSFADE ENGINE ───────────────────── */
  const SHOWCASES = {
    philosophy: [
      { t: "Inspiration",     d: "Concepts begin with emotion, texture, and the memory they leave behind.", img: "assets/optimized/philosophy/philosophy-01.webp" },
      { t: "Better Living",   d: "Smarter choices shaped with pleasure, balance, and genuine care.",       img: "assets/optimized/philosophy/philosophy-02.webp" },
      { t: "Positive Impact", d: "Creativity gains value when lifestyle, service, and market needs meet.",  img: "assets/optimized/philosophy/philosophy-03.webp" },
    ],
    experience: [
      { t: "Define the emotion", d: "Every experience starts with a feeling we want the guest to keep.",        img: "assets/optimized/experience/Signature Experience.webp" },
      { t: "Shape the purpose",  d: "Balance pleasure with nourishment through considered hospitality.",        img: "assets/optimized/experience/Premium Hospitality.webp" },
      { t: "Build the memory",   d: "Turn fine detail and sensory composition into a lasting impression.",      img: "assets/optimized/experience/Culinary Emotion.webp" },
      { t: "Deliver the result", d: "Make beauty practical — a delightful, repeatable moment on the plate.",    img: "assets/optimized/experience/Guest Delight.webp" },
    ],
    universe: [
      { t: "Artistic Direction", d: "Taste, styling, and atmosphere shaped into a clear culinary identity.",       img: "assets/optimized/universe/Artistic Direction.webp" },
      { t: "Wellness Vision",    d: "A balanced point of view where beauty, texture, and well-being meet.",        img: "assets/optimized/universe/Wellness Vision.webp" },
      { t: "R&D Method",         d: "Ideas tested through ingredients, process, texture, and repeatable results.", img: "assets/optimized/universe/R&D Method.webp" },
      { t: "Market Thinking",    d: "Creative concepts shaped with purpose, positioning, and commercial sense.",   img: "assets/optimized/universe/Market Thinking.webp" },
    ],
    recognition: [
      { t: "Gastro Erasmus 2026", d: "Recognised culinary competition presence on an international stage.", img: "assets/awards/culinary_competition.jpg" },
      { t: "WACS Judge Certificate", d: "Certified culinary judging credibility and global leadership.",   img: "assets/awards/judge_certification.jpg" },
    ],
  };

  function initShowcase(root) {
    const key = root.dataset.showcase;
    const slides = SHOWCASES[key];
    if (!slides || !slides.length) return;

    const imgA    = $('[data-role="imgA"]', root);
    const imgB    = $('[data-role="imgB"]', root);
    const counter = $('[data-role="counter"]', root);
    const title   = $('[data-role="title"]', root);
    const text    = $('[data-role="text"]', root);
    const bar      = $('[data-role="bar"]', root);
    const dotsWrap = $('[data-role="dots"]', root);
    const caption  = $(".showcase__caption", root);
    const frame    = $(".showcase__frame", root);
    // Philosophy rotates every 2s as requested; others keep their calm pace.
    const DELAYS = { philosophy: 2000 };
    const delay = DELAYS[key] || 3000, fade = 1100;

    // Fit the frame to the ACTIVE image's natural ratio so every photo is
    // shown in full — never cropped, no empty bands — regardless of whether
    // it is landscape, square or portrait. Inline !important beats any
    // stylesheet aspect-ratio rule.
    const fitFrame = (im) => {
      // Recognition keeps a FIXED frame (set in CSS) so the two certificates,
      // which have different ratios, don't resize the section and shift the page.
      if (key === "recognition") return;
      if (!frame || !im || !(im.naturalWidth > 0 && im.naturalHeight > 0)) return;
      frame.style.setProperty("aspect-ratio", `${im.naturalWidth} / ${im.naturalHeight}`, "important");
    };

    slides.forEach((s) => preload(s.img));

    // dots
    if (dotsWrap) {
      dotsWrap.innerHTML = slides.map((_, i) =>
        `<button type="button" data-i="${i}" aria-label="Slide ${i + 1}"></button>`).join("");
    }

    let current = 0, showingA = true, locked = false, timer = null;

    // seed first frame instantly (no fade)
    imgA.src = slides[0].img;
    imgA.alt = slides[0].t;
    imgA.classList.add("is-active");
    paintCopy(0);
    if (imgA.complete) fitFrame(imgA); else imgA.addEventListener("load", () => fitFrame(imgA), { once: true });

    function paintCopy(i) {
      if (counter) counter.textContent = `${two(i + 1)} / ${two(slides.length)}`;
      if (title) title.textContent = slides[i].t;
      if (text) text.textContent = slides[i].d;
      if (dotsWrap) $$("button", dotsWrap).forEach((b, bi) => b.classList.toggle("is-active", bi === i));
    }

    function resetBar() {
      if (!bar || reduceMotion) return;
      bar.style.transition = "none";
      bar.style.width = "0%";
      void bar.offsetWidth;
      bar.style.transition = `width ${delay}ms linear`;
      bar.style.width = "100%";
    }

    function go(i) {
      i = (i + slides.length) % slides.length;
      if (locked || i === current) return;
      locked = true;
      current = i;
      const slide = slides[i];
      const hidden  = showingA ? imgB : imgA;
      const visible = showingA ? imgA : imgB;

      const reveal = () => {
        hidden.alt = slide.t;
        fitFrame(hidden);
        if (caption) caption.classList.add("is-swapping");
        setTimeout(() => { paintCopy(i); if (caption) caption.classList.remove("is-swapping"); }, reduceMotion ? 0 : 220);
        hidden.classList.add("is-active");
        visible.classList.remove("is-active");
        showingA = !showingA;
        resetBar();
        setTimeout(() => { locked = false; }, reduceMotion ? 0 : fade);
      };

      hidden.src = slide.img;
      if (hidden.complete) requestAnimationFrame(reveal);
      else hidden.onload = reveal;
    }

    function start() {
      if (timer || reduceMotion) return;
      resetBar();
      timer = setInterval(() => go(current + 1), delay);
    }
    function stop() { clearInterval(timer); timer = null; }

    if (dotsWrap) dotsWrap.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-i]");
      if (!b) return;
      stop();
      go(Number(b.dataset.i));
      start();
    });

    // autoplay only when section is on-screen
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => en.isIntersecting ? start() : stop());
      }, { threshold: 0.25 });
      io.observe(root);
    } else { start(); }

    document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());
  }

  $$("[data-showcase]").forEach(initShowcase);

  /* 5 ── GALLERY SLIDESHOW (image-led, no thumbnails) ─────────── */
  const meta = [
    { title: "Signature Direction", kicker: "Story",     cat: "all" },
    { title: "Color & Texture",     kicker: "Direction", cat: "story" },
    { title: "Food Emotion",        kicker: "Vision",    cat: "vision" },
    { title: "Wellness Elegance",   kicker: "Wellness",  cat: "vision" },
    { title: "Floral Detail",       kicker: "Identity",  cat: "story" },
    { title: "Balanced Plates",     kicker: "R&D",       cat: "rd" },
    { title: "Guest Moment",        kicker: "Guest",     cat: "business" },
    { title: "Flavor Architecture", kicker: "R&D",       cat: "rd" },
    { title: "Precision Craft",     kicker: "Craft",     cat: "rd" },
    { title: "Market Ready",        kicker: "Business",  cat: "business" },
    { title: "Sensory Story",       kicker: "Editorial", cat: "story" },
    { title: "Texture Story",       kicker: "Detail",    cat: "all" },
    { title: "Product Styling",     kicker: "Business",  cat: "business" },
    { title: "Seasonal Mood",       kicker: "Wellness",  cat: "vision" },
    { title: "Plate Memory",        kicker: "Story",     cat: "story" },
    { title: "Sweet Composition",   kicker: "Detail",    cat: "story" },
    { title: "Culinary Study",      kicker: "R&D",       cat: "rd" },
    { title: "Guest Beauty",        kicker: "Guest",     cat: "business" },
    { title: "Ingredient Concept",  kicker: "R&D",       cat: "rd" },
    { title: "Brand Moment",        kicker: "Editorial", cat: "vision" },
    { title: "Dessert Language",    kicker: "Detail",    cat: "all" },
    { title: "Modern Food",         kicker: "Identity",  cat: "story" },
    { title: "Wellness Touch",      kicker: "Wellness",  cat: "vision" },
    { title: "Concept to Plate",    kicker: "R&D",       cat: "rd" },
    { title: "Guest Delight",       kicker: "Guest",     cat: "business" },
  ];
  const landscape = Array.from({ length: 15 }, (_, i) => `assets/optimized/landscape_slideshow/image-${two(i + 1)}.webp`);
  const portrait  = Array.from({ length: 25 }, (_, i) => `assets/optimized/portrait_slideshow/slide-${two(i + 1)}.webp`);

  const gImgA = $("#galleryImgA");
  const gImgB = $("#galleryImgB");
  const gFrame = $(".gallery__frame");
  const gShell = $("#galleryShell");
  const gKicker = $("#slideKicker");
  const gTitle  = $("#slideTitle");
  const gCounter = $("#slideCounter");
  const gDots = $("#galleryDots");
  const gMeta = $(".gallery__meta");
  const swipeCue = $("#swipeCue");
  const hideCue = () => swipeCue?.classList.add("is-hidden");
  // Fit the gallery frame to each image's natural ratio (no crop, no bands).
  const fitGallery = (im) => {
    if (!gFrame || !im || !(im.naturalWidth > 0 && im.naturalHeight > 0)) return;
    gFrame.style.setProperty("aspect-ratio", `${im.naturalWidth} / ${im.naturalHeight}`, "important");
  };

  let isMobile = window.matchMedia("(max-width: 899px)").matches;
  let all = buildSlides();
  let filter = "all";
  let slides = [...all];
  let gIndex = 0, gShowingA = true, gLocked = false, gTimer = null, gInView = false, gReady = false;

  function buildSlides() {
    const imgs = isMobile ? portrait : landscape;
    return imgs.map((img, i) => ({ ...meta[i % meta.length], img }));
  }
  function applyFilter() {
    slides = filter === "all" ? [...all] : all.filter((s) => s.cat === filter);
    if (!slides.length) slides = [...all];
  }

  function renderDots() {
    if (!gDots) return;
    gDots.innerHTML = slides.map((_, i) =>
      `<button type="button" data-i="${i}" aria-label="Slide ${i + 1}"></button>`).join("");
  }
  function paintGallery(i) {
    const s = slides[i];
    if (gKicker) gKicker.textContent = s.kicker;
    if (gTitle) gTitle.textContent = s.title;
    if (gCounter) gCounter.textContent = `${two(i + 1)} / ${two(slides.length)}`;
    if (gDots) $$("button", gDots).forEach((b, bi) => b.classList.toggle("is-active", bi === i));
  }

  function gGo(i, seed = false) {
    if (!slides.length) return;
    i = (i + slides.length) % slides.length;
    const s = slides[i];

    if (seed) {
      gIndex = i; gImgA.src = s.img; gImgA.alt = s.title;
      gImgA.classList.add("is-active"); gImgB.classList.remove("is-active"); gShowingA = true;
      paintGallery(i); preload(slides[(i + 1) % slides.length].img);
      if (gImgA.complete) fitGallery(gImgA); else gImgA.addEventListener("load", () => fitGallery(gImgA), { once: true });
      return;
    }
    if (gLocked || i === gIndex) return;
    gLocked = true; gIndex = i;
    const hidden  = gShowingA ? gImgB : gImgA;
    const visible = gShowingA ? gImgA : gImgB;
    const reveal = () => {
      hidden.alt = s.title;
      hidden.classList.add("is-active");
      visible.classList.remove("is-active");
      fitGallery(hidden);
      gShowingA = !gShowingA;
      // fade the caption/counter, update at the crossfade midpoint, fade back —
      // so the number changes correctly and smoothly together with the image
      if (gMeta) gMeta.classList.add("is-swapping");
      setTimeout(() => {
        paintGallery(i);
        if (gMeta) gMeta.classList.remove("is-swapping");
      }, reduceMotion ? 0 : 180);
      preload(slides[(i + 1) % slides.length].img);
      setTimeout(() => { gLocked = false; }, reduceMotion ? 0 : 800);
    };
    hidden.src = s.img;
    if (hidden.complete) requestAnimationFrame(reveal); else hidden.onload = reveal;
  }

  function gStart() {
    clearInterval(gTimer);
    if (!gReady || !gInView || reduceMotion) return;
    gTimer = setInterval(() => gGo(gIndex + 1), 6000);
  }
  function gStop() { clearInterval(gTimer); }

  function initGallery() {
    if (gReady) return;
    gReady = true;
    applyFilter(); renderDots(); gGo(0, true);
  }
  function rebuild(seedSame = true) {
    applyFilter();
    gIndex = Math.min(gIndex, slides.length - 1);
    renderDots();
    gGo(seedSame ? gIndex : 0, true);
  }

  // controls
  $("#prevSlide")?.addEventListener("click", () => { gGo(gIndex - 1); gStart(); hideCue(); });
  $("#nextSlide")?.addEventListener("click", () => { gGo(gIndex + 1); gStart(); hideCue(); });
  gDots?.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-i]"); if (!b) return;
    gGo(Number(b.dataset.i)); gStart(); hideCue();
  });

  // filters
  $$(".gallery__filters .chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      initGallery();
      filter = btn.dataset.filter;
      $$(".gallery__filters .chip").forEach((c) => c.classList.toggle("is-active", c === btn));
      gIndex = 0; applyFilter(); renderDots(); gGo(0, true); gStart();
    });
  });

  // responsive landscape/portrait switch
  window.addEventListener("resize", () => {
    const next = window.matchMedia("(max-width: 899px)").matches;
    if (next === isMobile) return;
    isMobile = next;
    all = buildSlides();
    rebuild(false);
  }, { passive: true });

  // start when visible
  if (gShell && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        gInView = en.isIntersecting;
        if (en.isIntersecting) { initGallery(); gStart(); } else { gStop(); }
      });
    }, { threshold: 0.2, rootMargin: "300px 0px" });
    io.observe(gShell);
  } else {
    gInView = true; initGallery(); gStart();
  }
  document.addEventListener("visibilitychange", () => document.hidden ? gStop() : gStart());

  // swipe
  let sx = 0, sy = 0;
  gFrame?.addEventListener("touchstart", (e) => { const t = e.changedTouches[0]; sx = t.clientX; sy = t.clientY; }, { passive: true });
  gFrame?.addEventListener("touchend", (e) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    gGo(gIndex + (dx < 0 ? 1 : -1)); gStart(); hideCue();
  }, { passive: true });

  /* 6 ── LIGHTBOX ─────────────────────────────────────────────── */
  const lb = $("#lightbox");
  const lbImg = $("#lightboxImg");
  const lbCap = $("#lightboxCaption");
  let lbIndex = 0;

  function openLB(i) {
    lbIndex = (i + slides.length) % slides.length;
    const s = slides[lbIndex];
    if (!s) return;
    lbImg.src = s.img; lbImg.alt = s.title;
    lbCap.textContent = `${s.kicker} — ${s.title}`;
    lb.classList.add("is-open"); lb.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
  }
  function closeLB() {
    lb.classList.remove("is-open"); lb.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
    setTimeout(() => { lbImg.src = ""; }, 300);
  }
  function moveLB(step) { openLB(lbIndex + step); }

  gFrame?.addEventListener("click", () => openLB(gIndex));
  $("#closeLightbox")?.addEventListener("click", closeLB);
  $("#lightboxPrev")?.addEventListener("click", (e) => { e.stopPropagation(); moveLB(-1); });
  $("#lightboxNext")?.addEventListener("click", (e) => { e.stopPropagation(); moveLB(1); });
  lb?.addEventListener("click", (e) => { if (e.target === lb) closeLB(); });
  document.addEventListener("keydown", (e) => {
    if (!lb?.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLB();
    if (e.key === "ArrowLeft") moveLB(-1);
    if (e.key === "ArrowRight") moveLB(1);
  });
})();
