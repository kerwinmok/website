const sections = Array.from(document.querySelectorAll('.section'));
const navLinks = Array.from(document.querySelectorAll('.top-nav a'));
const revealItems = Array.from(document.querySelectorAll('.reveal'));
const photoAlbum = document.getElementById('photo-album');

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

const sectionObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                setCurrentSection(entry.target.id);
            }
        });
    },
    {
        threshold: 0.55,
        rootMargin: '-8% 0px -8% 0px'
    }
);

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

sections.forEach((section) => sectionObserver.observe(section));
revealItems.forEach((item) => revealObserver.observe(item));
setCurrentSection('about');
renderPhotoAlbum();
