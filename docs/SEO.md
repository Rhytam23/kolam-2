# SEO and link previews

## Page titles and descriptions
Every page address has its own title and description in `ROUTES` (`src/data/traditions.ts`): home, each art form (`/alpana`), each photo reader (`/alpana/read-a-photo`), `/read-a-photo`, `/studio`, `/about`. A test checks that all routes are unique and titled.

## Shared links
The built app is a single-page app, so the server answers each page address with `index.html` whose `<title>`, description, `og:*` and `twitter:*` tags are rewritten for that page (`page_html` and `add_page_routes` in `backend/main.py`, from `routes.json` written at build time). Crawlers and chat previews therefore see the right text without running JavaScript.

## Image and site address
- Preview image: `public/og.png` (1200 x 630), referenced as `%SITE_URL%/og.png`.
- Set `SITE_URL` when building ([ENVIRONMENT.md](ENVIRONMENT.md)); without it image links are relative and some previews will not show the picture.

## Sitemap and robots
- `sitemap.xml` is generated at build time from `ROUTES` when `SITE_URL` is set.
- `public/robots.txt` allows everything. It does not list the sitemap; add a `Sitemap:` line with your address if you want crawlers to find it.

## Language
`<html lang>` follows the chosen interface language; art-form names are marked with their own `lang`.

## Not done
No structured data (JSON-LD), no per-language URLs, no canonical tags.
