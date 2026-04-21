# kerwin resume website

A modern one-page resume site with a Java backend and a scroll-driven frontend experience.

As you scroll, each section fades in and the featured landscape image changes.
Image filenames are mapped so you can drop your Sony a6700 photos into the folder and they load automatically.

## stack

- Backend: Java (JDK built-in `com.sun.net.httpserver.HttpServer`)
- Frontend: HTML, CSS, vanilla JavaScript
- No third-party backend framework is required

## quick start (local)

### option 1: open as a plain html site (no server, fastest)

From repo root, run:

```powershell
.\scripts\open-static.ps1
```

This opens `public/index.html` directly in your default browser.

### option 2: run java server (only when needed)

1. Ensure Java (JDK 17+ recommended) is installed.
2. From repo root, run:

```powershell
.\scripts\run-local.ps1
```

3. Open `http://localhost:8080`.

Use this option if you later add API calls, routing, or anything that requires HTTP.

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

## deploy now with github pages (free)

This project is already configured to deploy the `public/` folder to GitHub Pages using GitHub Actions.

### first-time setup

1. Push this repository to GitHub.
2. In GitHub, go to **Settings > Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Commit and push changes to `main`.
5. Wait for the workflow to finish under the **Actions** tab.

Your live URL will be:

- `https://kerwinmok.github.io/website/`

### optional custom domain later

When you buy a domain, add it in **Settings > Pages > Custom domain** and configure DNS at your registrar.
