// ============================================================
// SACRA — Arte Religiosa
// Script: Lenis + frame scrubbing + GSAP scroll animations
// ============================================================

gsap.registerPlugin(ScrollTrigger);

// ── DOM refs ─────────────────────────────────────────────────
const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');
const section = document.querySelector('.video-scroll-section');
const contentSection = document.getElementById('content-section');
const loader = document.getElementById('loader');
const fill = document.getElementById('loader-fill');
const label = document.getElementById('loader-text');
const header = document.getElementById('site-header');
const heroOverlay = document.getElementById('hero-overlay');
const heroManifesto = document.getElementById('hero-manifesto');

// ── Image sequence ──────────────────────────────────────────
const TOTAL_FRAMES = 192;
const FRAME_PATH = (i) => `frames/frame${String(i).padStart(4, '0')}.jpg`;
const images = new Array(TOTAL_FRAMES);
let loadedCount = 0, allLoaded = false;
let targetFrame = 0, displayFrame = 0, lastRendered = -1;
const FRAME_LERP = 0.08;

// ── Canvas ───────────────────────────────────────────────────
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawFrame(Math.round(displayFrame));
}

function drawFrame(idx) {
    idx = Math.max(0, Math.min(TOTAL_FRAMES - 1, idx));
    const img = images[idx];
    if (!img?.complete || !img.naturalWidth) return;
    const { width: cw, height: ch } = canvas;
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const sw = img.naturalWidth * scale, sh = img.naturalHeight * scale;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - sw) / 2, (ch - sh) / 2, sw, sh);
    lastRendered = idx;
}

// ── Scroll progress for hero section ─────────────────────────
function heroProgress(scrollY) {
    const top = section.offsetTop;
    const h = section.offsetHeight - window.innerHeight;
    return Math.max(0, Math.min(1, (scrollY - top) / h));
}

// ── Header colour state based on scroll position ─────────────
// Switches between dark (white text, transparent bg) and
// light (black text, frosted white bg) as user scrolls
// in/out of the white content section.
function updateHeaderMode(scrollY) {
    const contentTop = contentSection.offsetTop;
    // Give a tiny lead (-10px) so the transition feels anticipatory
    if (scrollY + 10 >= contentTop) {
        header.classList.add('header--light');
    } else {
        header.classList.remove('header--light');
    }
}

// ── Fade hero overlay ─────────────────────────────────────────
const FADE_BY = 0.18;

function updateFade(progress) {
    const t = Math.min(1, progress / FADE_BY);
    const o = 1 - t;

    // Normal hero entry fade
    heroOverlay.style.opacity = o;
    heroOverlay.style.transform = `translateY(${-t * 22}px)`;
    heroOverlay.style.pointerEvents = o < 0.05 ? 'none' : '';

    // Header fade (only while in the dark hero section)
    if (!header.classList.contains('header--light')) {
        header.style.opacity = o;
        header.style.transform = `translateY(${-t * 11}px)`;
        header.style.pointerEvents = o < 0.05 ? 'none' : '';
    } else {
        header.style.opacity = '1';
        header.style.transform = 'none';
        header.style.pointerEvents = '';
    }

    // NEW: Transition out at the very end (the "Melt")
    // When progress hits > 90%, we fade the whole sticky container to the content background color
    if (progress > 0.90) {
        const outFactor = (progress - 0.90) / 0.10; // 0 to 1
        canvas.style.opacity = 1 - outFactor;
        heroOverlay.style.opacity = Math.min(heroOverlay.style.opacity, 1 - outFactor);
        section.querySelector('.sticky-container').style.background = `rgba(247, 245, 240, ${outFactor})`;

        // BLOOM Manifesto
        heroManifesto.style.opacity = outFactor;
        heroManifesto.style.pointerEvents = outFactor > 0.5 ? 'auto' : 'none';
        // Minor upward drift for Manifesto for elegancy (very subtle)
        heroManifesto.style.transform = `translateY(${(1 - outFactor) * 15}px)`;

        // Trigger text split reveal once it starts appearing
        if (outFactor > 0.1) {
            heroManifesto.classList.add('is-visible');
            heroManifesto.querySelectorAll('.js-split').forEach(el => el.classList.add('is-visible'));
        }
    } else {
        canvas.style.opacity = 1;
        section.querySelector('.sticky-container').style.background = 'var(--black)';
        heroManifesto.style.opacity = 0;
        heroManifesto.style.pointerEvents = 'none';
        heroManifesto.classList.remove('is-visible');
    }
}

// ── Lenis ────────────────────────────────────────────────────
const lenis = new Lenis({
    lerp: 0.05,
    smoothWheel: true,
    wheelMultiplier: 0.8,
    touchMultiplier: 1.8,
});

// Feed Lenis scroll into Lenis + GSAP ScrollTrigger
lenis.on('scroll', ({ scroll }) => {
    ScrollTrigger.update();
    // Always update header colour mode based on scroll position
    updateHeaderMode(scroll);
    if (!allLoaded) return;
    const p = heroProgress(scroll);
    targetFrame = p * (TOTAL_FRAMES - 1);
    updateFade(p);
});

function raf(time) {
    lenis.raf(time);
    if (allLoaded) {
        displayFrame += (targetFrame - displayFrame) * FRAME_LERP;
        const idx = Math.round(displayFrame);
        if (idx !== lastRendered) drawFrame(idx);
    }
    requestAnimationFrame(raf);
}

// ── IntersectionObserver — no longer needed for header colour
// (handled by scroll position). Keep only for initial state check.
document.addEventListener('DOMContentLoaded', () => {
    // Set initial header mode right away in case page loads scrolled
    updateHeaderMode(window.scrollY);

    // Smooth scroll for all anchor links using Lenis
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;
            
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                lenis.scrollTo(targetEl, {
                    offset: -80, // Header buffer
                    duration: 1.8,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) 
                });
            }
        });
    });
});

// ── Text split helper ─────────────────────────────────────────
function splitWords(el) {
    const html = el.innerHTML;
    // split by words, preserving <br> tags
    el.innerHTML = html
        .split(/(<br\s*\/?>)/gi)
        .map(chunk => {
            if (/^<br/i.test(chunk)) return chunk;
            return chunk.split(' ').filter(Boolean).map(w =>
                `<span class="word"><span class="word-inner">${w}</span></span>`
            ).join(' ');
        })
        .join('');
}

// Wrap lines in reveal-title elements
function wrapLines(el) {
    el.innerHTML = el.innerHTML
        .split('<br>')
        .map(l => `<span class="line-inner">${l}</span>`)
        .join('');
}

// ── Intersection Observer for scroll-reveal ──────────────────
function observeReveal(sel, cb) {
    document.querySelectorAll(sel).forEach(el => {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    cb ? cb(el) : el.classList.add('is-visible');
                    io.unobserve(el);
                }
            });
        }, { threshold: 0.15 });
        io.observe(el);
    });
}

// ── Stat counter animation ────────────────────────────────────
function animateStat(el) {
    const numEl = el.querySelector('.stat-number');
    const target = parseInt(numEl.dataset.target, 10);
    const dur = 1800;
    const start = performance.now();
    el.classList.add('is-visible');
    function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(1, elapsed / dur);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        numEl.textContent = Math.round(eased * target).toLocaleString('pt-BR');
        if (progress < 1) requestAnimationFrame(tick);
        else numEl.textContent = target.toLocaleString('pt-BR');
    }
    requestAnimationFrame(tick);
}

// ── Parallax on feature image ─────────────────────────────────
function initParallax() {
    const imgs = document.querySelectorAll('.js-parallax-img');
    imgs.forEach(img => {
        gsap.fromTo(img,
            { yPercent: -5 },
            {
                yPercent: 5,
                ease: 'none',
                scrollTrigger: {
                    trigger: img.closest('.section-feature'),
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true,
                }
            }
        );
    });
}

// ── GSAP horizontal drag-scroll animation ────────────────────
// Auto-advances the horizontal strip slightly when scrolling
function initHScrollGSAP() {
    const track = document.getElementById('hscroll-track');
    if (!track) return;
    gsap.to(track, {
        scrollLeft: track.scrollWidth * 0.5,
        ease: 'none',
        scrollTrigger: {
            trigger: '#hs-section',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
        }
    });
}

// ── Preloader ──────────────────────────────────────────────────
function onFrameLoaded() {
    loadedCount++;
    const pct = Math.round((loadedCount / TOTAL_FRAMES) * 100);
    fill.style.width = pct + '%';
    label.textContent = pct + '%';
    if (images[0]?.complete && images[0].naturalWidth > 0) { resizeCanvas(); drawFrame(0); }
    if (loadedCount === TOTAL_FRAMES) {
        allLoaded = true;
        loader.classList.add('hidden');
        setTimeout(() => loader.style.display = 'none', 1100);
        drawFrame(0);
    }
}

function preloadFrames() {
    for (let i = 0; i < TOTAL_FRAMES; i++) {
        const img = new Image();
        images[i] = img;
        img.onload = img.onerror = onFrameLoaded;
        img.src = FRAME_PATH(i + 1);
    }
}

// ── Init ──────────────────────────────────────────────────────
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
preloadFrames();
requestAnimationFrame(raf);

// Wait for DOM content (fonts etc.) then init animations
document.addEventListener('DOMContentLoaded', () => {
    // Split text nodes for word-by-word reveal
    document.querySelectorAll('.js-split').forEach(splitWords);
    // Wrap headlines for line-wipe
    document.querySelectorAll('.js-reveal-title, .feature-headline, .contact-headline').forEach(wrapLines);

    // Scroll reveals
    observeReveal('.js-split', el => el.classList.add('is-visible'));
    observeReveal('.js-card', el => el.classList.add('is-visible'));
    observeReveal('.js-reveal-title', el => el.classList.add('is-visible'));
    observeReveal('.section-feature', el => el.classList.add('is-visible'));
    observeReveal('.section-contact', el => el.classList.add('is-visible'));
    observeReveal('.js-stat', animateStat);

    // GSAP-powered animations
    initParallax();
    initHScrollGSAP();
    initTilt();
    initLightbox();

    // Horizontal scroll arrows
    const track = document.getElementById('hscroll-track');
    const btnNext = document.getElementById('hscroll-next');
    const btnPrev = document.getElementById('hscroll-prev');

    if (track && btnNext && btnPrev) {
        const step = window.innerWidth * 0.45; // Move by 45% of viewport
        btnNext.onclick = () => {
            gsap.to(track, {
                scrollLeft: track.scrollLeft + step,
                duration: 1.2,
                ease: "expo.out"
            });
        };
        btnPrev.onclick = () => {
            gsap.to(track, {
                scrollLeft: track.scrollLeft - step,
                duration: 1.2,
                ease: "expo.out"
            });
        };
    }

    // Smooth scroll for nav links & Logo
    document.querySelectorAll('a[href^="#"], .header-logo').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            const target = (href === '#' || href === '#top') ? 0 : document.querySelector(href);
            if (target !== null) {
                lenis.scrollTo(target, {
                    offset: href === '#' ? 0 : -80,
                    duration: 1.8,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            }
        });
    });
});
/**
 * 3D Tilt Effect for Gallery Cards
 */
function initTilt() {
    const cards = document.querySelectorAll('.js-card');

    cards.forEach(card => {
        const wrap = card.querySelector('.card-img-wrap');
        const img = wrap.querySelector('img');

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Normalize to -1 to 1
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const percentX = (x - centerX) / centerX;
            const percentY = (y - centerY) / centerY;

            // Apply a power curve to make it less sensitive in the center
            // and more dramatic at the edges
            const power = 3;
            const tiltX = Math.pow(Math.abs(percentX), power) * Math.sign(percentX);
            const tiltY = Math.pow(Math.abs(percentY), power) * Math.sign(percentY);

            // Max degrees
            const maxTilt = 6;

            gsap.to(wrap, {
                rotateX: -tiltY * maxTilt,
                rotateY: tiltX * maxTilt,
                duration: 1.2,
                ease: "power2.out",
                overwrite: true
            });

            // Minimal parallax shift for depth
            gsap.to(img, {
                x: -percentX * 8,
                y: -percentY * 8,
                duration: 1.2,
                ease: "power2.out",
                overwrite: true
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(wrap, {
                rotateX: 0,
                rotateY: 0,
                duration: 1.5,
                ease: "expo.out"
            });
            gsap.to(img, {
                x: 0,
                y: 0,
                duration: 1.5,
                ease: "expo.out"
            });
        });
    });
}

/**
 * Immersive Lightbox Logic
 */
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDesc = document.getElementById('lightbox-desc');
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');
    const overlay = lightbox.querySelector('.lightbox-overlay');

    let currentIndex = 0;
    let items = [];

    // Collect all artwork items (Grid + Browse)
    const allArtworks = document.querySelectorAll('.art-card, .hscroll-item');

    allArtworks.forEach((el, index) => {
        const img = el.querySelector('img');
        const titleEl = el.querySelector('.card-title') || el.querySelector('p');
        const metaEl = el.querySelector('.card-meta');

        const itemData = {
            src: img.getAttribute('src'),
            title: titleEl ? titleEl.innerText : 'Untitled',
            meta: metaEl ? metaEl.innerText : 'Curatorial Detail'
        };
        items.push(itemData);

        // Open on click
        el.addEventListener('click', (e) => {
            e.preventDefault();
            openLightbox(index);
        });
    });

    function openLightbox(index) {
        currentIndex = index;
        updateLightboxContent();
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('lightbox-open');
        lenis.stop(); // Lock scroll

        gsap.fromTo('.lightbox-content',
            { opacity: 0, y: 30, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power4.out" }
        );
    }

    function closeLightbox() {
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('lightbox-open');
        lenis.start(); // Unlock scroll
    }

    function updateLightboxContent() {
        const item = items[currentIndex];

        // Fading transition for content swap
        gsap.to('.lightbox-content', {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                lightboxImg.src = item.src;
                lightboxTitle.innerText = item.title;
                lightboxDesc.innerText = item.meta;
                gsap.to('.lightbox-content', { opacity: 1, duration: 0.5 });
            }
        });
    }

    function nextImage() {
        currentIndex = (currentIndex + 1) % items.length;
        updateLightboxContent();
    }

    function prevImage() {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        updateLightboxContent();
    }

    // Event Listeners
    closeBtn.onclick = closeLightbox;
    overlay.onclick = closeLightbox;
    nextBtn.onclick = (e) => { e.stopPropagation(); nextImage(); };
    prevBtn.onclick = (e) => { e.stopPropagation(); prevImage(); };

    // Keyboard support
    window.addEventListener('keydown', (e) => {
        if (lightbox.getAttribute('aria-hidden') === 'true') return;

        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
    });
}
