# API

Base path `/api`. Source: `backend/main.py`; response types: `src/types/kolam.ts`.

## `GET /api/health`
```json
{"status":"ok","maxUploadBytes":8388608,"allowedTypes":["image/png","image/jpeg","image/webp"],
 "waiting":0,"stats":{"analyzed":0,"cached":0,"busy":0,"failed":0,"seconds":0.0}}
```
`waiting` is the number of photos in line; `stats` are counters since the process started.

## `POST /api/analyze` (multipart form)
| Field | Default | Meaning |
|---|---|---|
| `file` | required | PNG, JPEG or WebP, up to `MAX_UPLOAD_BYTES` |
| `preset` | `balanced` | `balanced`, `clean-scan`, `phone-photo`, `noisy-background` (dot detection tuning) |
| `deskew` | `true` | Straighten a photographed sheet; the corrected picture is returned as `image` |
| `dots` | none | JSON list of `{x, y}` in 0 to 1: use these dots instead of detecting them (max 600) |
| `grid` | `true` | `false` skips the dot-grid search, for art forms drawn without dots |

```bash
curl -F file=@photo.jpg -F grid=false http://localhost:8000/api/analyze
```

### Response
| Field | Meaning |
|---|---|
| `width`, `height` | Size of the picture the dots and layers refer to |
| `dots`, `lattice`, `design` | Dot grid reading (`null` for free-hand designs): grid size, axes, crossings/turns/joins per gap |
| `confidence` | Dot-grid reading quality, `null` for free-hand designs |
| `symmetry`, `radial` | Mirror and turning symmetry (`radial.order` N means N-fold) |
| `palette` | Main colours with their share; one is the ground (`background: true`) |
| `layers` | Each drawn colour as SVG cubic Bézier paths (`M`, `C`, `Z`) in 0 to 1 coordinates; draw with `fill-rule="evenodd"` |
| `tidied` | A cleaner copy of `layers` (free-hand designs only) |
| `quality` | `score`, `scoreAfter`, `problems`, `fixes` (plain words), `tips`, `fidelity` (0 to 1, how closely the trace matches the picture) |
| `image` | Present when the picture was straightened or repaired: a JPEG data URI the dots refer to |
| `message` | One-sentence summary |

### Status codes
| Code | When |
|---|---|
| 200 | Read |
| 400 | The file could not be read as an image |
| 413 | Larger than `MAX_UPLOAD_BYTES`, or more than `MAX_PIXELS` |
| 415 | Not PNG, JPEG or WebP |
| 422 | Unknown `preset`, or malformed `dots` |
| 429 | Too many photos from this visitor (`RATE_LIMIT_PER_MINUTE`) |
| 503 | Busy (queue full or waited too long) or the photo took too long; has `Retry-After`. The web app retries up to 3 times |
| 500 | The reading failed; the cause is logged (never the photo) |

Responses over 1 KB are gzip-compressed.
