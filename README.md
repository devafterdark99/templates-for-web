# The Birthday Lab

A responsive, multi-page birthday theme-selection experience built with plain HTML, CSS and JavaScript.

## Project structure

```text
the-birthday-lab/
├── index.html
├── css/
│   ├── styles.css
│   └── theme-pages.css
├── js/
│   ├── main.js
│   └── theme-page.js
└── themes/
    ├── gamers-universe.html
    ├── user-os.html
    ├── project-user.html
    ├── internet-legend.html
    ├── user-awards.html
    └── users-quest.html
```

## Run locally

Open `index.html` in a browser, or use VS Code with the Live Server extension.

## Publish with GitHub Pages

1. Create a public repository named `the-birthday-lab`.
2. Upload all files and folders while preserving the structure.
3. Go to Settings → Pages.
4. Select Deploy from a branch, `main`, and `/(root)`.
5. Save and wait for the site to publish.

## Important note about choices

The current selection is stored in the visitor's browser using `localStorage`. It does not send the selection to the project owner. To collect Atharva's choice remotely, connect a form service or backend before sharing the selector.

Google Fonts are loaded from Google Fonts; if offline, the browser uses the fallback fonts.
