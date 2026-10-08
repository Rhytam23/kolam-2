# Changelog

Format follows [Keep a Changelog](https://keepachangelog.com/). No version tags have been cut; entries are grouped by when the work landed on `main`.

## 2026-10-06 to 2026-10-09

### Added
- A cultural kit for each of the eleven art forms: greeting in its own script, a motif on every heading rule, its own border band between sections, a doorway decoration (toran, flower garland or leaves), its own background pattern, its own verb (draw, paint, lay) and, where the app has the language, a one-time offer to switch the interface to it.
- Photo repair before reading: quality score for blur, flat contrast, uneven light, grain, glare and size; only the needed fixes are applied; the reader shows what was fixed, a before/after toggle and retake tips.
- Smooth cubic Bézier tracing of free-hand designs, with a "Tidied" copy (wobbles smoothed, petals of turning patterns restored by majority vote).
- "Matches your picture" score and a "Compare with photo" slider.
- Guide dots on corners and curve anchors, numbered outlines drawn from the centre outwards, and Practice mode for designs read from photos.
- Interface languages: English, Bengali, Tamil, Telugu, Hindi (navigation and photo reader).
- Heading typeface per art form's own script.
- Footer and 404 page greet in the languages of the art forms; the service worker cache moved to `chittara-v4`.
- Documentation set under `docs/`, `CHANGELOG.md`, and the full list of settings in `.env.example`.

### Changed
- The analysis API reads photos on a bounded worker pool with a wait queue, answers 503 with `Retry-After` when busy (the app retries by itself), caps picture size, reduces large photos early, caches repeat readings, gzips responses, and logs failures.
- The rate limit takes the visitor from the proxy's last `X-Forwarded-For` entry, so a forged header no longer dodges it.
- Colours are found first and every pixel goes to the nearest real colour; edges are decided on an enlarged picture with an ink level chosen by comparing the trace with the picture; outlines are grown by the half pixel the contour finder loses.
- Clean drawings and scans are no longer "repaired".

### Fixed
- A lace mandala lost over 40% of its white lines (blended edge pixels were dropped) and later came out swollen; coverage now matches the source and small gaps stay open.
- Thin strokes came out washed-out grey instead of their true colour.
- Photos with a shadow side no longer produce an extra "shadow" colour layer.
- A repaired photo is never kept in the server cache.

## 2026-09-27 and earlier

### Added
- A page for each of eleven floor-art traditions, each in its own colours (kolam, muggulu, rangoli, alpana, pookalam, mandana, aipan, aripan, jhoti chita, chowk purana, chittara).
- A photo reader for each art form at `/<art-form>/read-a-photo`.
- Privacy and terms pages, a 404 page, security headers, per-visitor rate limit.
- Installable app with an offline service worker.
- Scroll-drawn landing page, "Learn to draw this" guide and Practice mode, studio with round and straight-line designs, rangoli and alpana support.
- Mirror-curve engine for dot kolams, one-container Docker deploy and CI.

### Changed
- Renamed the app to Chittara.
