# Neural Atlas — Bilingual Content & SEO Style Guide

## 1. Factual Honesty Standards

- Only cite verified personal facts: Abdalrahman Mostafa, First-Year Intelligent Computing student, Faculty of Science, Al-Azhar University.
- Maintain exact baseline inventory unless the owner authors new entries in Admin Studio: 7 Semester 1 courses (titles owner-provided; syllabus details marked unverified) and 2 active initiatives (`C++ & Problem Solving`, `Local AI Agent`).
- Never invent grades, GPAs, publication metrics, dates, client work, or testimonials.

## 2. Bilingual EN/AR Authoring Guidelines

- Provide both English (`*En`) and Arabic (`*Ar`) titles and content before setting `publicationStatus: 'published'`.
- Keep Arabic prose natural and technical terms accurate (`الحوسبة الذكية`, `هياكل البيانات والخوارزميات`, `مذكرات التعلّم`).
- Wrap inline mathematics in `$ ... $` and block equations in `$$ ... $$`; escape literal currency symbols as `\$50` so KaTeX leaves prose untouched.

## 3. Search & Sharing Metadata Standards

- Configure optional `VITE_SITE_URL` in `.env` (no invented fallback domains) to emit canonical `<link rel="canonical">`, `og:url`, absolute `og:image`, `/sitemap.xml`, and `/robots.txt` (`Disallow: /admin`).
- Draft previews (`/projects/:slug`, `/notes/:slug` opened by owner) and `/admin` / `not-found` dynamically emit `<meta name="robots" content="noindex, nofollow" />`.
- Never place private `contactEmail` inside public SEO JSON-LD, OpenGraph tags, or backup exports.
