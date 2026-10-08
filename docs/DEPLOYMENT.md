# Deployment

One Docker image runs everything (`Dockerfile`): a Node stage builds the web app, then a Python stage serves it together with the API on `$PORT` (default 8000).

## Render (`render.yaml`)
1. Render, **New > Blueprint**, pick this repository.
2. The blueprint creates one Docker web service named `chittara` on the **free** plan, health check `/api/health`, auto-deploy on every push to the connected branch (`main`).
3. After the first deploy set `SITE_URL` to the public address (for example `https://chittara.onrender.com`) and deploy again, so link previews and `sitemap.xml` use it.

Set other variables in the Render dashboard ([ENVIRONMENT.md](ENVIRONMENT.md)). Render sets `PORT` itself and sends `X-Forwarded-For`, which is why `TRUST_PROXY` defaults to `1`.

## Build and run by hand
```bash
docker build --build-arg SITE_URL=https://example.org -t chittara .
docker run -p 8000:8000 -e MAX_CONCURRENT=2 chittara
```

## After a deploy
- Check `https://<site>/api/health`.
- Installed and returning visitors may see the old version until the service worker updates: hard-refresh once. When a change must reach everyone, bump the cache name in `public/sw.js` (`chittara-v3`).

## Capacity (free plan)
The free plan sleeps after 15 minutes without visitors (about a minute to wake) and has one shared CPU and limited memory. It can serve many visitors, but many people reading photos at the same moment will queue (the server answers "busy, retry shortly" rather than failing). If that happens often: raise the plan, then raise `MAX_CONCURRENT` to match the CPUs. Multiple instances each keep their own cache and rate limiter ([DATABASE.md](DATABASE.md)).

## Rollback
In Render, open the service, **Events**, and redeploy a previous successful deploy, or revert the commit on `main` and push.

## CI
`.github/workflows/ci.yml` runs frontend typecheck, tests and build, backend tests, and a Docker build on every push and pull request. It does not deploy.
