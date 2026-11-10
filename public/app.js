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

const photoFiles = [
    'gsx250r-road.jpg',
    'gsx250r-cat-1.jpg',
    'gsx250r-cat-2.jpg'
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

    image.addEventListener('error', () => {
        item.remove();
    });

    item.addEventListener('click', () => {
        openLightbox(image.src, fileName);
    });

    item.append(image);
    return item;
}

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

function updateProjectList() {
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

projectMore.addEventListener('click', () => {
    showAllProjects = !showAllProjects;
    updateProjectList();

    if (!showAllProjects) {
        projectSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});

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

            if (photoLightbox && !photoLightbox.hidden) {
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
    revealItems.forEach((item) => item.classList.add('is-visible'));
}

window.addEventListener('scroll', requestSectionUpdate, { passive: true });
window.addEventListener('resize', () => {
    requestSectionUpdate();
    updateProjectList();
});
enableFloatyWheelScroll();

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
