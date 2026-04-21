const sections = Array.from(document.querySelectorAll('.section'));
const navLinks = Array.from(document.querySelectorAll('.top-nav a'));
const revealItems = Array.from(document.querySelectorAll('.reveal'));
const photoAlbum = document.getElementById('photo-album');

document.documentElement.classList.remove('no-js');
document.documentElement.classList.add('js');

// Add or remove filenames here as your album grows.
const photoFiles = [
    'FrontPage.jpg',
    'AboutMe.jpg',
    'Projects.jpg',
    'Experience.jpg',
    'Photos.jpg'
];

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

function syncUrlHash(sectionId) {
    const nextHash = `#${sectionId}`;

    if (window.location.hash === nextHash) {
        return;
    }

    // Keep URL aligned to the visible section without adding history entries on every scroll tick.
    history.replaceState(null, '', nextHash);
}

function createAlbumItem(fileName) {
    const item = document.createElement('figure');
    item.className = 'album-item';

    const image = document.createElement('img');
    image.loading = 'lazy';
    image.decoding = 'async';
    image.src = `assets/photos/${fileName}`;
    image.alt = fileName;

    const caption = document.createElement('figcaption');
    caption.textContent = fileName;

    image.addEventListener('error', () => {
        item.classList.add('album-placeholder');
        image.remove();
        caption.textContent = `missing file: public/assets/photos/${fileName}`;
    });

    item.append(image, caption);
    return item;
}

function renderPhotoAlbum() {
    if (!photoAlbum) {
        return;
    }

    photoFiles.forEach((fileName) => {
        photoAlbum.append(createAlbumItem(fileName));
    });
}

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

function enableFloatyWheelScroll() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

    if (prefersReducedMotion || !hasFinePointer) {
        return;
    }

    let targetY = window.scrollY;
    let currentY = window.scrollY;
    let animationId = 0;

    const easing = 0.12;
    const intensity = 0.9;
    const stopThreshold = 0.45;

    function clampTarget(nextValue) {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        return Math.min(Math.max(nextValue, 0), Math.max(maxScroll, 0));
    }

    function animateScroll() {
        currentY += (targetY - currentY) * easing;

        if (Math.abs(targetY - currentY) <= stopThreshold) {
            currentY = targetY;
        }

        window.scrollTo(0, currentY);

        if (currentY !== targetY) {
            animationId = requestAnimationFrame(animateScroll);
            return;
        }

        animationId = 0;
    }

    window.addEventListener(
        'wheel',
        (event) => {
            if (event.ctrlKey) {
                return;
            }

            event.preventDefault();
            targetY = clampTarget(targetY + event.deltaY * intensity);

            if (!animationId) {
                animationId = requestAnimationFrame(animateScroll);
            }
        },
        { passive: false }
    );

    window.addEventListener(
        'scroll',
        () => {
            if (!animationId) {
                currentY = window.scrollY;
                targetY = currentY;
            }
        },
        { passive: true }
    );
}

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
    // Older browsers get immediate visibility and no scroll-tracking effects.
    revealItems.forEach((item) => item.classList.add('is-visible'));
}

window.addEventListener('scroll', requestSectionUpdate, { passive: true });
window.addEventListener('resize', requestSectionUpdate);
enableFloatyWheelScroll();

const initialSectionId = (window.location.hash || '').replace('#', '');
const hasInitialSection = sections.some((section) => section.id === initialSectionId);

setCurrentSection(hasInitialSection ? initialSectionId : 'about');
updateCurrentSectionByScroll();
renderPhotoAlbum();
applyHeroFallbackIfMissing();
