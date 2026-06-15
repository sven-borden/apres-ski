# Deployment

Live at **https://apres-ski.borden.ch**. Hosted on **Coolify**
(`coolify.borden.ch`) as a single docker-compose stack, fronted by a **Synology**
reverse proxy that terminates TLS.

```
Internet ──HTTPS──▶ Synology reverse proxy ──HTTP──▶ Coolify Traefik ──▶ app:3000
                                                                  └──▶ pocketbase:8090 (internal)
```

## The stack (`docker-compose.yaml`)

- **`app`** — Next.js standalone, built from `/Dockerfile` (multi-stage,
  `output: "standalone"`), port 3000, public.
- **`pocketbase`** — built from `/pocketbase` (official PB binary + baked
  migrations + hooks), volume `pb-data:/pb_data`, **no published port, no domain**.
  The app reaches it at `http://pocketbase:8090` (`POCKETBASE_URL` env).

Both services share the compose network, so the app resolves `pocketbase` by name.

## Coolify config (already set)

- Build pack: **dockercompose**, compose file `/docker-compose.yaml`.
- FQDN: `http://apres-ski.borden.ch` — **http on purpose** so Traefik doesn't
  redirect to https and loop behind Synology's TLS.
- Domain→service mapping lives in `docker_compose_domains`:
  `[{"name":"app","domain":"http://apres-ski.borden.ch"}]`.
- Env vars (runtime): `POCKETBASE_URL=http://pocketbase:8090`,
  `ANTHROPIC_API_KEY` (set me — currently a dummy), `ANTHROPIC_MODEL=claude-haiku-4-5`,
  `PB_SUPERUSER_EMAIL` / `PB_SUPERUSER_PASSWORD` (PB admin, created on boot).

## Deploying

Push to `main` → GitHub webhook auto-deploys. Or trigger via the Coolify MCP
(`deploy` with the app uuid). New builds rebuild both images.

## Synology reverse proxy (one-time, done)

DSM → Control Panel → Login Portal → Advanced → Reverse Proxy:
Source `apres-ski.borden.ch` HTTPS 443 → Destination Coolify Traefik HTTP :80,
**preserve the Host header** so Traefik routes `Host(apres-ski.borden.ch)`.

## PocketBase admin

PB is internal-only — the dashboard isn't publicly reachable. To use it,
temporarily add an FQDN to the `pocketbase` service (behind Synology, ideally
IP-allowlisted) or port-forward via the Coolify container terminal. The
superuser is created on boot from `PB_SUPERUSER_*` (see `pocketbase/pb_hooks`).

## Gotchas learned the hard way

- **Separate Coolify apps don't share a network** by default → a standalone PB
  isn't resolvable. One compose stack fixes it.
- **Compose domain mapping isn't the resource `fqdn`** — it's `docker_compose_domains`,
  set via the Coolify API *after* a deploy has parsed the compose
  (`docker_compose_raw` must exist first). Format: array of `{name, domain}`.
- **A bad `PB_SUPERUSER_*` value used to crash PB boot** — the hook now catches
  it (`pocketbase/pb_hooks/main.pb.js`).
