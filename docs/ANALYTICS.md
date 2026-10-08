# Analytics

Chittara collects **no analytics**. There are no cookies, trackers, advertising or third-party scripts, and the privacy page (`public/privacy.html`) promises exactly that. This is a design choice, not a gap.

## What you can see instead
`GET /api/health` returns live counters (since the last restart):

| Field | Meaning |
|---|---|
| `stats.analyzed` | Photos read |
| `stats.cached` | Repeats answered from the cache |
| `stats.busy` | Times a visitor was told "busy" (503) |
| `stats.failed` | Failed or timed-out readings |
| `stats.seconds` | Total time spent reading photos |
| `waiting` | Photos in line right now |

Average reading time is `stats.seconds / stats.analyzed`. Frequent `busy` means capacity is too small ([DEPLOYMENT.md](DEPLOYMENT.md)). Render also shows request logs and metrics for the service; those logs never contain photos.

## If you ever add analytics
1. Prefer privacy-friendly, cookie-free, self-hosted counting; never log photos or designs.
2. Update `public/privacy.html` and its "Last updated" date **before** shipping.
3. Update the Content-Security-Policy in `backend/main.py` (it currently allows only the site's own origin).
4. Update `SECURITY.md` and this page.
