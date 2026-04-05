# hello-verse

Portfolio website for Ankit Rathaur focused on analytics, machine learning, research, and data storytelling.

## Overview

This is a static multi-page portfolio built with:

- HTML
- CSS
- Vanilla JavaScript
- Bootstrap 5
- Boxicons and Font Awesome
- AOS for scroll animation on the home page

## Entry Points

- `index.html` - home page
- `html/projects.html` - projects library
- `html/contact-us.html` - contact page

## Current Structure

```text
hello-verse/
|-- index.html
|-- README.md
|-- assets/
|   `-- pdfs/
|-- components/
|   |-- footer.css
|   `-- footer.html
|-- css/
|   |-- index.css
|   |-- projects.css
|   |-- contact-us.css
|   |-- index_style.css          # legacy copy
|   |-- projects_styles.css      # legacy copy
|   `-- contact_us_style.css     # legacy copy
|-- html/
|   |-- projects.html
|   |-- contact-us.html
|   |-- project.html             # legacy copy
|   `-- contact-form.html        # older standalone form page
|-- images/
`-- js/
    |-- site.js
    `-- projects.js
```

## Naming Convention

Active files now follow these rules:

- Pages use `kebab-case`
- Page-specific stylesheets use `kebab-case`
- JavaScript files use short lowercase names
- Shared styles live in `css/index.css`

Examples:

- `projects.html`
- `contact-us.html`
- `contact-us.css`

## Notes On Legacy Files

Some older files are still present so existing local references do not break immediately:

- `css/index_style.css`
- `css/projects_styles.css`
- `css/contact_us_style.css`
- `html/project.html`

The active site has been updated to use the new names instead:

- `css/index.css`
- `css/projects.css`
- `css/contact-us.css`
- `html/projects.html`

## How To Run

Because this is a static site, you can open it directly in a browser:

1. Open `index.html`

For a better local workflow, use a simple local server such as the VS Code Live Server extension.

## Main Files

- `index.html` contains the main portfolio layout
- `css/index.css` contains the shared theme and home page layout
- `js/site.js` contains shared navbar, scrolling, toast, and contact-form behavior
- `html/projects.html` contains the project gallery page
- `css/projects.css` contains projects page styling
- `js/projects.js` contains projects filtering, search, modal, and navbar behavior
- `html/contact-us.html` contains the contact page
- `css/contact-us.css` contains contact page styling

## Suggested Next Cleanup

If you want to keep the repository cleaner, the next safe cleanup would be:

1. Remove legacy duplicate files after final verification.
2. Decide whether `components/` is still needed or should be integrated fully into the main pages.
3. Remove or populate the empty `database/` folder.

## Status

The repository structure is now more consistent for active files, and the README matches the current project instead of the old placeholder content.
