// grab page sections, nav links, and project/photo elements once
const sections = Array.from(document.querySelectorAll('.section'));
const navLinks = Array.from(document.querySelectorAll('.top-nav a'));
const revealItems = Array.from(document.querySelectorAll('.reveal'));
const photoAlbum = document.getElementById('photo-album');
const photoLightbox = document.getElementById('photo-lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');
const projectSection = document.getElementById('projects');
const projectGrid = document.getElementById('project-grid');
const projectMore = document.getElementById('project-more');
let projectCards = [];
if (projectGrid) {
    projectCards = Array.from(projectGrid.querySelectorAll('.card'));
}

let showAllProjects = false;

document.documentElement.classList.remove('no-js');
document.documentElement.classList.add('js');

// photos i show in the gallery at the bottom
const photoFiles = [
    'gsx250r-road.jpg',
    'gsx250r-cat-1.jpg',
    'gsx250r-cat-2.jpg'
];

// highlight whichever section i am currently scrolled to
function setCurrentSection(sectionId) {
    navLinks.forEach((link) => {
        const isCurrent = link.getAttribute('href') === `#${sectionId}`;
        link.classList.toggle('is-current', isCurrent);

        if (isCurrent) {
            link.setAttribute('aria-current', 'true');
        } else {
            link.removeAttribute('aria-current');
        }
    });
}

// update the url hash without polluting browser back history
function syncUrlHash(sectionId) {
    const nextHash = `#${sectionId}`;

    if (window.location.hash === nextHash) {
        return;
    }

    history.replaceState(null, '', nextHash);
}

// build a clickable card for one gallery photo
function createAlbumItem(fileName) {
    const item = document.createElement('figure');
    item.className = 'album-item';

    const image = document.createElement('img');
    image.loading = 'lazy';
    image.decoding = 'async';
    image.src = `assets/photos/${fileName}`;
    image.alt = fileName;

    image.addEventListener('error', () => {
        item.remove();
    });

    item.addEventListener('click', () => {
        openLightbox(image.src, fileName);
    });

    item.append(image);
    return item;
}

// open the full-screen photo viewer
function openLightbox(src, altText) {
    if (!photoLightbox || !lightboxImg) {
        return;
    }

    photoLightbox.classList.remove('is-zoomed');
    lightboxImg.src = src;
    lightboxImg.alt = altText;
    photoLightbox.hidden = false;
    document.body.style.overflow = 'hidden';
}

// close the photo viewer and unlock page scrolling
function closeLightbox() {
    if (!photoLightbox || !lightboxImg) {
        return;
    }

    photoLightbox.hidden = true;
    photoLightbox.classList.remove('is-zoomed');
    lightboxImg.src = '';
    document.body.style.overflow = '';
}

function renderPhotoAlbum() {
    if (!photoAlbum) {
        return;
    }

    photoFiles.forEach((fileName) => {
        photoAlbum.append(createAlbumItem(fileName));
    });
}

// fall back to a plain hero background if the main photo fails to load
function applyHeroFallbackIfMissing() {
    const heroImage = new Image();
    heroImage.onload = () => {
        document.body.classList.remove('no-hero-image');
    };
    heroImage.onerror = () => {
        document.body.classList.add('no-hero-image');
    };
    heroImage.src = 'assets/photos/AboutMe.jpg';
}

// find the section closest to the upper viewport marker
function updateCurrentSectionByScroll() {
    if (!sections.length) {
        return;
    }

    const markerY = window.innerHeight * 0.38;
    let closestSection = sections[0];
    let closestDistance = Number.POSITIVE_INFINITY;

    sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const sectionCenter = rect.top + rect.height / 2;
        const distance = Math.abs(sectionCenter - markerY);

        if (distance < closestDistance) {
            closestDistance = distance;
            closestSection = section;
        }
    });

    setCurrentSection(closestSection.id);
    syncUrlHash(closestSection.id);
}

let isTicking = false;

// throttle nav highlight updates to animation frames while scrolling
function requestSectionUpdate() {
    if (isTicking) {
        return;
    }

    isTicking = true;
    requestAnimationFrame(() => {
        updateCurrentSectionByScroll();
        isTicking = false;
    });
}

// collapse extra project cards on mobile until i tap view more
function updateProjectList() {
    if (!projectMore) {
        return;
    }

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const canCollapse = projectCards.length > 3;

    if (!isMobile) {
        showAllProjects = false;
    }

    if (projectGrid) {
        projectGrid.classList.toggle('is-collapsed', isMobile && canCollapse && !showAllProjects);
    }
    projectMore.hidden = !isMobile || !canCollapse;
    projectMore.setAttribute('aria-expanded', String(isMobile && showAllProjects));
    if (showAllProjects) {
        projectMore.textContent = 'show less';
    } else {
        projectMore.textContent = 'view more';
    }
}

if (projectMore) {
    projectMore.addEventListener('click', () => {
        showAllProjects = !showAllProjects;
        updateProjectList();

        if (!showAllProjects && projectSection) {
            scrollToSectionElement(projectSection);
        }
    });
}

let smoothScrollToY = null;

// scroll smoothly to any section using my custom momentum loop when active
function scrollToSectionElement(sectionEl) {
    if (!sectionEl) {
        return;
    }

    if (smoothScrollToY) {
        let scrollMargin = 0;

        if (sectionEl.id !== 'about') {
            if (typeof window.getComputedStyle === 'function') {
                const computedStyle = window.getComputedStyle(sectionEl);
                const parsedMargin = parseFloat(computedStyle.scrollMarginTop);
                if (!Number.isNaN(parsedMargin)) {
                    scrollMargin = parsedMargin;
                } else {
                    scrollMargin = 83;
                }
            } else {
                scrollMargin = 83;
            }
        }

        const nextY = window.scrollY + sectionEl.getBoundingClientRect().top - scrollMargin;
        smoothScrollToY(nextY);
        return;
    }

    sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// smooth wheel and keyboard scroll with momentum coasting for desktop browsers
function enableFloatyWheelScroll() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

    if (prefersReducedMotion || !hasFinePointer) {
        return;
    }

    // turn off native css smooth scroll so each animation frame doesn't restart a transition
    document.documentElement.classList.add('has-smooth-scroll');

    let targetY = window.scrollY;
    let currentY = window.scrollY;
    let velocityY = 0;
    let lastWheelTime = 0;
    let lastFrameTime = 0;
    let animationId = 0;

    // tuned so wheel stops glide slightly before settling
    const baseEasing = 0.085;
    const velocityFriction = 0.88;
    const wheelIntensity = 1.05;
    const velocityImpulse = 0.28;
    const maxVelocity = 140;
    const stopThreshold = 0.08;

    // convert line/page wheel units into pixels and cap huge trackpad spikes
    function normalizeWheelDelta(event) {
        let delta = event.deltaY;

        if (event.deltaMode === 1) {
            delta *= 40;
        } else if (event.deltaMode === 2) {
            delta *= window.innerHeight * 0.85;
        }

        return Math.min(Math.max(delta, -240), 240);
    }

    function getMaxScroll() {
        return Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
    }

    function clampTarget(nextValue) {
        return Math.min(Math.max(nextValue, 0), getMaxScroll());
    }

    function animateScroll(now) {
        if (!lastFrameTime) {
            lastFrameTime = now;
        }

        // keep the same glide feel on 60hz and 120hz+ displays
        const elapsed = Math.min(Math.max((now - lastFrameTime) / 16.667, 0.25), 3.0);
        lastFrameTime = now;

        // bleed remaining wheel velocity into the target so stopping slows down naturally
        if (Math.abs(velocityY) > stopThreshold) {
            const maxScroll = getMaxScroll();
            const nextTarget = clampTarget(targetY + velocityY * elapsed);

            if ((nextTarget <= 0 && velocityY < 0) || (nextTarget >= maxScroll && velocityY > 0)) {
                velocityY *= 0.4;
            }

            targetY = nextTarget;
            velocityY *= Math.pow(velocityFriction, elapsed);
        }

        const easeStep = 1 - Math.pow(1 - baseEasing, elapsed);
        currentY += (targetY - currentY) * easeStep;

        if (Math.abs(targetY - currentY) <= stopThreshold && Math.abs(velocityY) <= stopThreshold) {
            currentY = targetY;
            velocityY = 0;
        }

        window.scrollTo(0, currentY);

        if (currentY !== targetY || Math.abs(velocityY) > stopThreshold) {
            animationId = requestAnimationFrame(animateScroll);
            return;
        }

        velocityY = 0;
        lastFrameTime = 0;
        animationId = 0;
    }

    smoothScrollToY = (nextY) => {
        velocityY = 0;
        targetY = clampTarget(nextY);

        if (targetY !== currentY && !animationId) {
            lastFrameTime = performance.now();
            animationId = requestAnimationFrame(animateScroll);
        }
    };

    window.addEventListener(
        'wheel',
        (event) => {
            if (event.ctrlKey) {
                return;
            }

            if (photoLightbox && !photoLightbox.hidden) {
                return;
            }

            event.preventDefault();
            const delta = normalizeWheelDelta(event);
            if (delta === 0) {
                return;
            }

            const now = performance.now();

            // drop old coasting velocity right away if i reverse direction
            if ((delta > 0 && targetY < currentY - 2) || (delta < 0 && targetY > currentY + 2)) {
                targetY = currentY;
                velocityY = 0;
            }

            const wheelGap = now - lastWheelTime;
            lastWheelTime = now;

            let boost = 1.0;
            if (wheelGap > 0 && wheelGap < 140) {
                boost = 1.2;
            }

            targetY = clampTarget(targetY + delta * wheelIntensity * boost);
            velocityY = Math.min(Math.max(velocityY + delta * velocityImpulse * boost, -maxVelocity), maxVelocity);

            if (!animationId) {
                lastFrameTime = now;
                animationId = requestAnimationFrame(animateScroll);
            }
        },
        { passive: false }
    );

    // route keyboard scrolling through the same glide loop
    window.addEventListener('keydown', (event) => {
        if (event.altKey || event.ctrlKey || event.metaKey) {
            return;
        }

        if (photoLightbox && !photoLightbox.hidden) {
            return;
        }

        let activeTag = '';
        if (document.activeElement && document.activeElement.tagName) {
            activeTag = document.activeElement.tagName.toLowerCase();
        }

        if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select' || (document.activeElement && document.activeElement.isContentEditable)) {
            return;
        }

        if (event.key === 'Home') {
            event.preventDefault();
            smoothScrollToY(0);
            return;
        }

        if (event.key === 'End') {
            event.preventDefault();
            smoothScrollToY(getMaxScroll());
            return;
        }

        let keyDelta = 0;
        if (event.key === 'ArrowDown') {
            keyDelta = 95;
        } else if (event.key === 'ArrowUp') {
            keyDelta = -95;
        } else if (event.key === 'PageDown') {
            keyDelta = window.innerHeight * 0.85;
        } else if (event.key === 'PageUp') {
            keyDelta = -window.innerHeight * 0.85;
        } else if (event.key === ' ') {
            if (activeTag === 'button' || activeTag === 'a') {
                return;
            }
            if (event.shiftKey) {
                keyDelta = -window.innerHeight * 0.85;
            } else {
                keyDelta = window.innerHeight * 0.85;
            }
        } else {
            return;
        }

        event.preventDefault();
        if ((keyDelta > 0 && targetY < currentY - 2) || (keyDelta < 0 && targetY > currentY + 2)) {
            targetY = currentY;
            velocityY = 0;
        }

        targetY = clampTarget(targetY + keyDelta);
        velocityY = Math.min(Math.max(velocityY + keyDelta * 0.16, -maxVelocity), maxVelocity);

        if (!animationId) {
            lastFrameTime = performance.now();
            animationId = requestAnimationFrame(animateScroll);
        }
    });

    window.addEventListener(
        'scroll',
        () => {
            if (!animationId) {
                currentY = window.scrollY;
                targetY = currentY;
                velocityY = 0;
            }
        },
        { passive: true }
    );
}

// route top nav anchor clicks through smooth scrolling
navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
        const href = link.getAttribute('href') || '';
        if (!href.startsWith('#')) {
            return;
        }

        const targetSection = document.getElementById(href.slice(1));
        if (!targetSection) {
            return;
        }

        event.preventDefault();
        scrollToSectionElement(targetSection);
        syncUrlHash(targetSection.id);
    });
});

// fade sections in as they enter the screen
const revealObserver = new IntersectionObserver(
    (entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.15
    }
);

if ('IntersectionObserver' in window) {
    revealItems.forEach((item) => revealObserver.observe(item));
} else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
}

window.addEventListener('scroll', requestSectionUpdate, { passive: true });
window.addEventListener('resize', () => {
    requestSectionUpdate();
    updateProjectList();
});
enableFloatyWheelScroll();

// highlight whatever section the initial url hash points to
const initialSectionId = (window.location.hash || '').replace('#', '');
const hasInitialSection = sections.some((section) => section.id === initialSectionId);

if (hasInitialSection) {
    setCurrentSection(initialSectionId);
} else {
    setCurrentSection('about');
}

if (lightboxClose) {
    lightboxClose.addEventListener('click', () => {
        closeLightbox();
    });
}

if (lightboxImg && photoLightbox) {
    lightboxImg.addEventListener('click', (event) => {
        event.stopPropagation();
        photoLightbox.classList.toggle('is-zoomed');
    });
}

if (photoLightbox) {
    photoLightbox.addEventListener('click', (event) => {
        if (event.target === photoLightbox) {
            closeLightbox();
        }
    });
}

window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && photoLightbox && !photoLightbox.hidden) {
        closeLightbox();
    }
});

// format years and months old between two dates
function formatAgeInYearsAndMonths(birthDate, targetDate) {
    let years = targetDate.getFullYear() - birthDate.getFullYear();
    let months = targetDate.getMonth() - birthDate.getMonth();

    if (targetDate.getDate() < birthDate.getDate()) {
        months -= 1;
    }

    if (months < 0) {
        years -= 1;
        months += 12;
    }

    return `${years} yrs ${months} mos old`;
}

// update my age tooltips on the timeline endpoints
function updateTimelineAgeTooltips() {
    const birthDate = new Date(2006, 11, 21);
    const startWorkDate = new Date(2021, 7, 30);
    const nowDate = new Date();

    const startAgeText = formatAgeInYearsAndMonths(birthDate, startWorkDate);
    const currentAgeText = formatAgeInYearsAndMonths(birthDate, nowDate);

    const startTips = Array.from(document.querySelectorAll('[data-age-start]'));
    const nowTips = Array.from(document.querySelectorAll('[data-age-now]'));

    startTips.forEach((tip) => {
        tip.textContent = startAgeText;
    });

    nowTips.forEach((tip) => {
        tip.textContent = currentAgeText;
    });
}

updateCurrentSectionByScroll();
renderPhotoAlbum();
applyHeroFallbackIfMissing();
updateProjectList();
updateTimelineAgeTooltips();
