# Environment variables

All are optional. Backend variables are read in `backend/config.py`; `SITE_URL` and `VITE_API_BASE_URL` are used when building the frontend (`vite.config.ts`). Copy `.env.example` as a starting point.

## Backend
| Variable | Default | Meaning |
|---|---|---|
| `PORT` | `8000` | Port the server listens on |
| `STATIC_DIR` | `<repo>/dist` | Built frontend to serve at `/` (when present) |
| `CORS_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000` | Comma-separated origins allowed to call the API (only needed if the frontend is hosted elsewhere) |
| `MAX_UPLOAD_BYTES` | `8388608` (8 MB) | Largest upload accepted |
| `MAX_PIXELS` | `40000000` | Refuse pictures with more pixels (width x height) |
| `MAX_SIDE` | `1600` | Photos are reduced to this long side before being read |
| `MAX_CONCURRENT` | `2` | Photos read at the same moment |
| `MAX_WAITING` | `12` | Photos allowed to wait in line before the server answers `503` |
| `QUEUE_WAIT_SECONDS` | `25` | Longest a photo waits for a free slot |
| `ANALYSIS_TIMEOUT_SECONDS` | `60` | Longest one photo may take to read |
| `CACHE_ENTRIES` | `48` | Recent readings kept in memory so repeats are instant |
| `RATE_LIMIT_PER_MINUTE` | `20` | Photos one visitor can have read per minute |
| `TRUST_PROXY` | `1` | `1` behind a hosting proxy: the visitor is the last `X-Forwarded-For` entry. Set `0` when the app is exposed directly |

## Frontend build
| Variable | Default | Meaning |
|---|---|---|
| `SITE_URL` | empty | Public address (e.g. `https://chittara.onrender.com`) used for link-preview images and `sitemap.xml`. Docker build argument of the same name |
| `VITE_API_BASE_URL` | empty (same origin) | Only when the API is hosted elsewhere |

There are no secrets, keys or credentials to configure.
