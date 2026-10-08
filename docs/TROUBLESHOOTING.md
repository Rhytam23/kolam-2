# Troubleshooting

| Symptom | Likely cause | What to do |
|---|---|---|
| "Many people are reading photos right now" (503) | The queue is full or the wait was too long | The app retries 3 times by itself. If frequent, see capacity in [DEPLOYMENT.md](DEPLOYMENT.md) |
| "Too many photos in a short time" (429) | One address sent more than `RATE_LIMIT_PER_MINUTE` photos in a minute (a shared school network counts as one) | Wait a minute, or raise the limit |
| "That picture is very large" (413) | More than `MAX_PIXELS` | Use a smaller photo |
| "Image is larger than 8 MB" (413) | Over `MAX_UPLOAD_BYTES` | The app shrinks photos to 1600 px first; try a different photo or raise the limit |
| "Could not read the image" (400) | Corrupt file or an unsupported format | Use PNG, JPEG or WebP |
| "Could not reach the analysis server" | Network down, backend not running, or Render waking up (about a minute) | Retry; locally start `python main.py` |
| "That photo took too long to read" | Over `ANALYSIS_TIMEOUT_SECONDS` | Try a smaller or clearer photo |
| Dot kolam: dots missed or extra | Shadows, busy floor, low contrast | Pick "Phone photo of a floor" or "Textured or busy floor"; tap to add or remove dots, then **Recreate from my dots** |
| Free-hand trace looks too thick, thin or ragged | The picture holds little detail (for example a 200 px image has one-pixel lines) | Use a larger or cleaner copy; compare with the **Compare with photo** slider; try the **Tidied** version |
| Low "Matches your picture" | Blurry, dark, shadowed or angled photo | Follow the retake tips shown under the photo |
| Photo says "repaired" but looks worse | Repair only keeps changes that measure better; a very odd photo can still fool it | Retake in even daylight; report it with the photo if you may share it |
| Site shows the old version after a deploy | Service worker cache | Hard-refresh; bump the cache name in `public/sw.js` for a forced update |
| Browser console shows a CORS error | Frontend and API on different origins | Add the frontend address to `CORS_ORIGINS` and set `VITE_API_BASE_URL` |
| Everyone shares one rate limit / limit ignored | `TRUST_PROXY` does not match the setup | `1` behind a proxy such as Render, `0` when exposed directly |
| Fonts look wrong for a script | Missing `@fontsource` import or font mapping | `src/main.tsx`, `src/lib/fonts.ts` |

For anything else, check the server log (failures are logged without the photo) and `/api/health`.
