# Security

## Data handling
Photos are read in memory and never written to disk or logged; no accounts, cookies or analytics ([DATABASE.md](DATABASE.md), `public/privacy.html`). Saved designs stay in the visitor's browser.

## Server (`backend/main.py`)
- **Headers on every response:** strict `Content-Security-Policy` (everything from the same origin; no third-party scripts, styles, fonts or images), `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: DENY`, `Permissions-Policy`, and `Strict-Transport-Security` over HTTPS.
- **CORS:** only `CORS_ORIGINS`, `GET` and `POST`.
- **Upload limits:** type allow-list (PNG, JPEG, WebP), `MAX_UPLOAD_BYTES`, and `MAX_PIXELS` checked from the file header before the picture is decoded, so a small file that expands to a huge picture is refused. Large photos are reduced to `MAX_SIDE` before any work.
- **Abuse limits:** per-visitor rate limit (`RATE_LIMIT_PER_MINUTE`), at most `MAX_CONCURRENT` photos read at once, a bounded wait queue, and a per-photo timeout.
- **Visitor address:** behind a hosting proxy (`TRUST_PROXY=1`) the visitor is the last `X-Forwarded-For` entry, the one the proxy added. Earlier entries are written by the visitor and are ignored, so rotating the header does not dodge the limit. Set `TRUST_PROXY=0` if the app is exposed without a proxy.
- **Errors:** failures return a generic message; details go to the server log without the photo.
- The container runs as a non-root user.

## Frontend
- Traced paths from the server are accepted only if colours are plain `#rrggbb` and paths contain only `M L C Z`, numbers and spaces (`src/lib/api.ts`), because they are placed inside inline SVG.
- Dependencies are few (React plus self-hosted fonts at runtime).

## Known limits
- The rate limit and cache are per process and in memory ([DATABASE.md](DATABASE.md)).
- Users who share one network address (a school, for example) share one rate-limit bucket.

## Reporting a problem
Open an issue at https://github.com/Rhytam23/kolam-2/issues. Please do not attach photos with people's faces.
