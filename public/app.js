const sections = Array.from(document.querySelectorAll('.section'));
const navLinks = Array.from(document.querySelectorAll('.top-nav a'));
const revealItems = Array.from(document.querySelectorAll('.reveal'));
const photoAlbum = document.getElementById('photo-album');
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
    'gsx250r-cat-2.jpg',
    'gsx250r-cat-3.jpg',
    'gsx250r-cat-4.jpg'
];

const heroCycleImg = document.getElementById('hero-cycle-img');
const heroCycleCount = document.getElementById('hero-cycle-count');
const heroPrevBtn = document.getElementById('hero-prev');
const heroNextBtn = document.getElementById('hero-next');
const aboutHero = document.getElementById('about');
let currentHeroPhotoIndex = 0;

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
    heroImage.src = `assets/photos/${photoFiles[0]}`;
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

function updateHeroPhoto(nextIndex) {
    if (!photoFiles.length) {
        return;
    }

    const total = photoFiles.length;
    currentHeroPhotoIndex = ((nextIndex % total) + total) % total;
    const fileName = photoFiles[currentHeroPhotoIndex];
    const imagePath = `assets/photos/${fileName}`;

    if (heroCycleImg) {
        heroCycleImg.src = imagePath;
    }

    if (heroCycleCount) {
        heroCycleCount.textContent = `${currentHeroPhotoIndex + 1} / ${total}`;
    }

    if (aboutHero) {
        aboutHero.style.setProperty('--hero-bg', `url("${imagePath}")`);
    }
}

function initHeroPhotoCycler() {
    if (!heroCycleImg) {
        return;
    }

    if (heroPrevBtn) {
        heroPrevBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            updateHeroPhoto(currentHeroPhotoIndex - 1);
        });
    }

    if (heroNextBtn) {
        heroNextBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            updateHeroPhoto(currentHeroPhotoIndex + 1);
        });
    }

    heroCycleImg.addEventListener('click', () => {
        updateHeroPhoto(currentHeroPhotoIndex + 1);
    });

    let touchStartX = 0;
    heroCycleImg.addEventListener(
        'touchstart',
        (event) => {
            if (event.touches.length > 0) {
                touchStartX = event.touches[0].clientX;
            }
        },
        { passive: true }
    );

    heroCycleImg.addEventListener(
        'touchend',
        (event) => {
            if (event.changedTouches.length === 0) {
                return;
            }
            const deltaX = event.changedTouches[0].clientX - touchStartX;
            if (Math.abs(deltaX) < 35) {
                return;
            }
            if (deltaX < 0) {
                updateHeroPhoto(currentHeroPhotoIndex + 1);
            } else {
                updateHeroPhoto(currentHeroPhotoIndex - 1);
            }
        },
        { passive: true }
    );

    updateHeroPhoto(0);
}

updateCurrentSectionByScroll();
renderPhotoAlbum();
applyHeroFallbackIfMissing();
updateProjectList();
initHeroPhotoCycler();
