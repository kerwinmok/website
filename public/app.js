const panels = Array.from(document.querySelectorAll('.panel'));
const stage = document.querySelector('.photo-stage');
const stageImage = document.getElementById('stage-image');
const placeholder = document.getElementById('image-placeholder');
const filenameLabel = document.getElementById('photo-filename');

function showPlaceholder(message) {
    placeholder.textContent = message;
    placeholder.classList.add('visible');
}

function hidePlaceholder() {
    placeholder.classList.remove('visible');
}

function updateImageByName(fileName) {
    if (!fileName || !stageImage) {
        return;
    }

    const nextSrc = `assets/photos/${fileName}`;
    stage.classList.add('is-transitioning');
    filenameLabel.textContent = fileName;

    const temp = new Image();
    temp.onload = () => {
        stageImage.src = nextSrc;
        hidePlaceholder();
        requestAnimationFrame(() => {
            stage.classList.remove('is-transitioning');
        });
    };

    temp.onerror = () => {
        showPlaceholder(`insert in resource folders: public/assets/photos/${fileName}`);
        requestAnimationFrame(() => {
            stage.classList.remove('is-transitioning');
        });
    };

    temp.src = nextSrc;
}

stageImage.addEventListener('error', () => {
    const currentName = filenameLabel.textContent || 'FrontPage.jpg';
    showPlaceholder(`insert in resource folders: public/assets/photos/${currentName}`);
});

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                panels.forEach((panel) => panel.classList.remove('is-active'));
                entry.target.classList.add('is-active');
                updateImageByName(entry.target.dataset.image);
            }
        });
    },
    {
        threshold: 0.55,
        rootMargin: '-8% 0px -8% 0px'
    }
);

panels.forEach((panel) => observer.observe(panel));
updateImageByName('FrontPage.jpg');
