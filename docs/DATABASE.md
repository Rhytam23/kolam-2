# Data storage

Chittara has **no database**, no accounts and no server-side files. Nothing a visitor sends is written to disk.

## What is kept, and where
| Data | Where | Lifetime |
|---|---|---|
| Uploaded photo | Server memory while being read | Discarded as soon as the answer is sent |
| Recent readings (vector paths, palette, scores) | In-memory cache, up to `CACHE_ENTRIES` (LRU) | Until evicted or the process restarts. A response that contains a repaired or straightened photo is never cached |
| Per-visitor request times (rate limit) | In-memory table | About one minute per visitor |
| Counters shown by `/api/health` | In-memory | Until restart |
| Saved designs (up to 10 kolams) | The visitor's browser `localStorage` | Until they delete them or clear site data |
| Interface language | Browser `localStorage` (`chittara_lang`) | Same |
| App pages and fonts for offline use | Browser cache (service worker `chittara-v4`) | Until the cache version changes |

## What this means
- Restarting or redeploying clears the cache, rate-limit table and counters; nothing is lost that matters.
- The cache and rate limiter are per process. With several instances each would have its own, so a shared store (for example Redis) would be needed to share them.
- There is nothing to back up or migrate, and nothing of a visitor's to delete on the server ([SECURITY.md](SECURITY.md), `public/privacy.html`).
