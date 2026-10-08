# Operations guide

Chittara has no admin panel, accounts or back office. "Administering" it means looking after the running service.

## Daily checks
- Open `https://<site>/api/health`: `status` should be `ok`; watch `waiting`, `busy` and `failed` ([ANALYTICS.md](ANALYTICS.md)).
- Open the site, then **Read a photo** and **Try a sample**.

## Common tasks
| Task | How |
|---|---|
| Read logs | Render dashboard, service, **Logs** (failures are logged as "analysis pipeline failed", without photos) |
| Change a limit | Render, **Environment**, edit a variable from [ENVIRONMENT.md](ENVIRONMENT.md), save (redeploys) |
| Deploy | Push to `main`; Render auto-deploys |
| Roll back | Render, **Events**, redeploy an earlier deploy; or revert on `main` |
| Restart | Render, **Manual Deploy**; clears the in-memory cache and counters |
| Update an art form's text | Edit `src/data/traditions.ts`, open a pull request, merge |
| Update the privacy page | Edit `public/privacy.html` and its date |

## Handling a visitor request
There is no account or stored photo to look up or delete. Saved designs live only in the visitor's browser; tell them to use **Delete** in Saved kolams or clear the site's data.

## Abuse
Per-visitor rate limiting and a bounded queue are built in. To tighten, lower `RATE_LIMIT_PER_MINUTE` or `MAX_WAITING`. To block an address you need to do it at the hosting or network layer; the app has no block list.
