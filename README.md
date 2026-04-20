# kerwin resume website

A modern one-page resume site with a Java backend and a scroll-driven frontend experience.

As you scroll, each section fades in and the featured landscape image changes.
Image filenames are mapped so you can drop your Sony a6700 photos into the folder and they load automatically.

## stack

- Backend: Java (JDK built-in `com.sun.net.httpserver.HttpServer`)
- Frontend: HTML, CSS, vanilla JavaScript
- No third-party backend framework is required

## quick start (local)

1. Ensure Java (JDK 17+ recommended) is installed.
2. From repo root, run:

```powershell
.\scripts\run-local.ps1
```

3. Open `http://localhost:8080`.

## photo workflow

Put photos in:

`public/assets/photos/`

Use these exact filenames for automatic section mapping:

- `FrontPage.jpg`
- `AboutMe.jpg`
- `Projects.jpg`
- `Experience.jpg`
- `Photos.jpg`

If an image is missing, the UI shows a clear placeholder instruction so you know what to add.

## project structure

```text
.
|-- public/
|   |-- index.html
|   |-- styles.css
|   |-- app.js
|   `-- assets/photos/
|-- scripts/
|   `-- run-local.ps1
`-- server/
		`-- ResumeServer.java
```

## implementation notes

### 1) backend static file serving

`server/ResumeServer.java` serves all files under `public/`.

- Uses one route context (`/`) and maps request paths to files.
- Blocks path traversal by checking normalized paths stay under `public`.
- Resolves basic MIME types for html/css/js/images.

Key logic:

```java
Path requested = publicDir.resolve(safePath).normalize();
if (!requested.startsWith(publicDir)) {
		sendText(exchange, 403, "Forbidden");
		return;
}
```

### 2) scroll-triggered section + image transitions

`public/app.js` uses `IntersectionObserver`.

- Watches each content panel.
- When a panel becomes active, it updates UI state and loads a section-specific photo.
- Uses preloading with `new Image()` so transitions are smooth.

Key logic:

```javascript
const observer = new IntersectionObserver((entries) => {
	entries.forEach((entry) => {
		if (entry.isIntersecting) {
			panels.forEach((panel) => panel.classList.remove('is-active'));
			entry.target.classList.add('is-active');
			updateImageByName(entry.target.dataset.image);
		}
	});
}, { threshold: 0.55, rootMargin: '-8% 0px -8% 0px' });
```

### 3) auto-fit image behavior

`public/styles.css` applies:

```css
.photo-stage img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}
```

This keeps the stage full and clean even when source photos have slightly different dimensions.

## customization checklist

- Edit text in `public/index.html` for your real biography, projects, and experience.
- Keep or expand the section/image mapping via each panel's `data-image` value.
- Drop your actual photos into `public/assets/photos/`.

## deploy later

When you are ready for a domain, this repo can be containerized or moved to any VM/PaaS that supports running a Java process.
