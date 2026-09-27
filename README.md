<p align="center"><img src="docs/kolam.svg" width="220" alt="A single-line diamond kolam drawn by Chittara"></p>

# Chittara – Kolam, rangoli and alpana

*Chittara* (ಚಿತ್ತಾರ) means "picture" in Kannada. It is also the name of the geometric art that women
of the Deewaru community in the Malnad region of Karnataka paint on the walls and floors of their
homes, in white rice paste on red earth.

**Understand the design behind a kolam, and draw it again with your own hands.**
Built for Smart India Hackathon problem statement **SIH25107**: *"Develop computer programs (in any
language, preferably Python) to identify the design principles behind the Kolam designs and
recreate the kolams."* It also works for the wider family of Indian floor art: rangoli, muggulu,
rangavalli, alpana and mandana.

A pulli kolam is a grid of dots (*pulli*) with a line (*neli*) that loops around every dot without
touching it. Between two neighbouring dots the line either **crosses** itself or **turns**, as if it
bounced off a mirror. The dot grid plus that choice at every gap fully describes the kolam
(the mirror-curve model of Gerdes, 1989). Chittara reads exactly that from a photo. Free-hand designs
without dots (alpana, most rangoli) are read by their turning symmetry and colours instead.

## What it does

| | |
| --- | --- |
| **Read a design** | Take or upload a photo. For dot kolams, OpenCV finds the dots, fits a rotation- and perspective-tolerant grid, and reads every gap between two dots as a crossing, a turn-back or a join. Free-hand designs are traced colour by colour. |
| **Design principles** | Dot grid and dots per row (e.g. `1-3-5-3-1`), crossings/turns/joins, number of separate lines (1 = sikku), mirror and turning symmetry (e.g. "8-fold"), and the colours used, each named after its traditional material (rice flour, kaavi, turmeric, kumkum…). |
| **Recreate** | Dot kolams are redrawn as clean lines on top of your photo; fix missed dots by hand and recreate. Free-hand designs are traced into filled colour layers. |
| **Make a similar design** | One click starts a new design in the studio with the same grid, or the same symmetry and colours for rangoli and alpana. |
| **Design Studio** | Dot kolams (square or diamond grids, one-line sikku option) and radial designs: lotus, festival, alpana (double-outlined petals), marigold, star, and a circle of curls wound round dots; 3–16 petals, 1–4 rings. Colour sets: rice flour on a red or dark floor, kaavi on cream, Pongal, Diwali and festival. |
| **Draw it yourself** | A step-by-step guide that follows how floor art is really made: prepare the ground, put down the small dots first, then draw the lines (around the dots for a pulli kolam, from dot to dot for rangoli and alpana) one line or ring at a time, and fill the colours last, with tips and materials for every step. Rangoli and alpana designs can be downloaded with their dots as a printable template. |
| **Practise it** | Draw the design yourself by tapping its dots in the order the line goes: round each dot for a pulli kolam, dot to dot along each petal for a rangoli, one curl per dot for a curl kolam. A wrong dot shows where to go; a ring or line can be finished for you. |
| **From dots to design** | As you scroll, the landing page draws a circle-of-curls kolam and then a festival rangoli the way they are made by hand (dots, then lines, then colour), each with *Learn to draw this* and *Practise it*. It also shows the three steps for a rangoli, a pulli kolam and a photo. |
| **Share** | Export SVG, PNG or the open `.kolam.json` format, save kolams in the browser, and share links with a preview card. |

No sample photo at hand? Press **Try a sample** in the analyzer.

## Privacy and hosting

See [`public/privacy.html`](public/privacy.html) (served at `/privacy.html`) and [`public/terms.html`](public/terms.html).

Photos are analysed in memory and never stored; each visitor can have 20 photos read per minute
(`RATE_LIMIT_PER_MINUTE`). The server sends a strict Content-Security-Policy and other security
headers. Fonts (Tiro Tamil, Telugu, Devanagari, Bangla, Kannada and
Hind Madurai) are bundled with the app, so the site makes no third-party requests.

## Run it

### One command (Docker)

```bash
docker build -t chittara .
docker run -p 8000:8000 chittara
```

Open http://localhost:8000. The container serves the web app and the API (`/api/...`) together.

### Local development

Requires Node.js 20+ and Python 3.10+.

```bash
# terminal 1 – API on :8000
cd backend
pip install -r requirements.txt
python main.py

# terminal 2 – web app on :3000 (proxies /api to :8000)
npm install
npm run dev
```

### Checks

```bash
npm run typecheck && npm test && npm run build
cd backend && pip install -r requirements-dev.txt && python -m pytest -q
```

CI runs the same checks and a Docker build on every push (`.github/workflows/ci.yml`).

## Deploy

### Easiest: Render (free)

1. Merge your branch into `main` on GitHub.
2. Sign in at [render.com](https://render.com) with GitHub, choose **New > Blueprint**, and pick this
   repository. Render reads [`render.yaml`](render.yaml), builds the Docker image and gives you an
   address such as `https://chittara.onrender.com`.
3. In the service's **Environment** settings, set `SITE_URL` to that address and deploy again, so
   shared links show the preview picture.
4. Open the address on a phone and check that **Try a sample** in *Read a Design* works.

The free plan sleeps when nobody has visited for 15 minutes; the first visit after that takes
about a minute. A paid instance (or any host below) stays awake. Every push to `main` redeploys.

### Anywhere else

The Docker image runs anywhere that runs containers (Railway, Fly.io, Google Cloud Run,
Hugging Face Spaces, a VPS). It listens on `$PORT` (default 8000) and has a health check at
`/api/health`. Build with `--build-arg SITE_URL=https://your-domain` so shared links show the
preview card. Serve it over **HTTPS**: phones only allow installing the app, and the camera
button, on secure sites.

To host the frontend separately (for example on a static host), build it with
`VITE_API_BASE_URL=https://your-api.example.com npm run build`, and start the API with
`CORS_ORIGINS=https://your-frontend.example.com`. See `.env.example`.

### Phones and tablets

The site adapts to phones, tablets and desktops, and can be installed as an app: *Install the
app* in the footer (Android, Chrome, Edge), or **Share > Add to Home Screen** in Safari on
iPhone and iPad. Once installed it opens full screen, and the studio, guide and practice work
offline; reading a photo needs a connection.

## API

`POST /api/analyze` (multipart form)

| field | |
| --- | --- |
| `file` | PNG, JPEG or WebP, up to 8 MB |
| `preset` | `balanced` (default), `clean-scan`, `phone-photo`, `noisy-background` |
| `deskew` | `true` (default): straighten a photographed sheet. The corrected image is returned as `image` |
| `dots` | optional JSON list of `{x, y}` (0–1): use these dots instead of detecting them |

The response includes `dots`, `lattice` (grid size, origin and axes in image coordinates),
`design` (see below), `symmetry` (mirror/rotation scores of the drawing), `radial` (turning
symmetry: `order` N for N-fold), `palette` (main colours, their share and which one is the ground),
`layers` (each colour traced as an SVG path in 0–1 coordinates), `confidence` (dot-grid reading only)
and `message`. Free-hand designs return `lattice: null` and `design: null`.

## The `.kolam.json` format

```json
{
  "format": "kolam", "version": 1, "createdAt": "2026-01-01T00:00:00.000Z",
  "design": {
    "rows": 3, "cols": 3,
    "mask": ["010", "111", "010"],
    "h": ["..", "xx", ".."],
    "v": [".x.", ".x."]
  },
  "dots": [{ "x": 0.5, "y": 0.2 }],
  "lattice": null
}
```

`mask[j][i]` is `1` where a dot sits. `h[j][i]` describes the gap between dots `(i, j)` and
`(i+1, j)`, and `v[j][i]` the gap between `(i, j)` and `(i, j+1)`. Each gap is `x` (strands cross),
`p` (strands turn back around each dot), `j` (strands join the two dots) or `.` (no gap because a
dot is missing).

## Project layout

```text
src/utils/kolamLogic.ts     mirror-curve engine: tracing, symmetry, single-line transform, SVG
src/utils/radial.ts         radial rangoli / alpana / curl designs and drawing guides
src/utils/practice.ts       practice mode: which dot comes next, and what each tap draws
src/lib/colours.ts          traditional colours, materials and colour sets
src/components/             analyzer, generator, walkthrough and page sections
src/lib/                    API client and .kolam.json helpers
backend/detection.py        dot detection (OpenCV)
backend/principles.py       lattice fit, crossing/turn reading, symmetry
backend/drawing.py          turning symmetry, colour palette and traced layers for any design
backend/main.py             FastAPI app; also serves the built frontend
public/                     app icons, manifest and the offline service worker (sw.js)
render.yaml                 one-click hosting on Render
```

## Feedback

Tried it on your own kolam? Please [open an issue](https://github.com/Rhytam23/kolam-2/issues)
with the photo (or its `.kolam.json`) and what Chittara got right or wrong.

## References

- G. Siromoney, R. Siromoney, K. Krithivasan. *Array grammars and kolam*. Computer Graphics and Image Processing 3(1), 1974.
- P. Gerdes. *Reconstruction and extension of lost symmetries: examples from the Tamil of South India*. Computers & Mathematics with Applications 17(4–6), 1989.
- M. Ascher. *The Kolam Tradition*. American Scientist 90(1), 2002.
- *KolamNetV2: efficient attention-based deep learning network for Tamil heritage art-kolam classification*. npj Heritage Science, 2024.

## License

MIT, see [LICENSE](LICENSE).
