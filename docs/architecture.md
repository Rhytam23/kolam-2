# How a photo becomes a design

`POST /api/analyze` (backend/main.py) runs these steps on a small worker pool, so the site stays responsive while photos are read.

1. **Guards**: per-visitor rate limit (visitor = the last `X-Forwarded-For` entry behind a proxy), type and byte limits, a pixel limit read from the file header, then a cache lookup (same photo and settings = instant answer).
2. **Queue**: at most `MAX_CONCURRENT` photos are read at once; up to `MAX_WAITING` wait; beyond that the server answers `503` with `Retry-After`, and the web app retries by itself.
3. **Reduce and straighten**: long side to `MAX_SIDE`; a sheet photographed at an angle is flattened (`detection.deskew_if_needed`).
4. **Photo repair** (`enhance.py`): measures blur, contrast, uneven light (a fitted lighting plane), grain, glare and size. Only the needed fixes are applied. Dot designs are read on both versions and the better reading wins; free-hand designs keep the repair only if the photo measures better. The response says what was fixed and gives retake tips.
5. **Reading**: dot designs (kolam, muggulu) go through dot detection, lattice fit and strand reading (`detection.py`, `principles.py`). Everything else is traced.
6. **Tracing** (`drawing.py`, `vectorize.py`): colours are learned from a sample and every pixel gets its nearest colour; the true colour of thin strokes is recovered from the pixels furthest from the floor; each colour layer becomes smooth cubic Béziers with sharp corners kept. A **tidied** copy smooths wobbles and, for turning patterns, restores petals by majority vote.
7. **Drawing guide** (frontend): guide dots sit on corners and curve anchors (`utils/traced.ts`), outlines are drawn from the centre outwards and numbered, and Practice mode lets a person tap through them (`utils/practice.ts`, `tracedPlan`).

## Limits worth knowing
- No method reproduces every photo exactly. Very blurry, tiny, or heavily shadowed photos give a lower score and tips for retaking.
- Dot grids are capped at 25×25 dots; the dot reader assumes a rectangular or diamond lattice.
- Interface translations (`src/lib/i18n.tsx`) cover the navigation and the photo reader and need review by native speakers.
- The free hosting plan has one shared CPU: many people reading photos at the very same moment will queue.
