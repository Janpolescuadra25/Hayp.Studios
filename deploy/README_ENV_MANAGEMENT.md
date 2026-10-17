# Hayp Studios — Environment Variable & Secret Management Runbook

**Asset ID:** Asset #15  
**Deliverable:** 10.3  
**Environment:** Local development & production Hetzner VPS  
**Production Host:** `vortex` (`2.28.120.85`)  
**Status:** Operational  
**Last Updated:** 2026-10-18

---

## 1. Operating Principle
Hayp Studios treats environment configuration as a security boundary. Runtime secrets and local environment data must never be committed to GitHub. The repo contains only template variables and safe defaults, while real credentials are maintained solely in the live server environment.

## 2. Local Environment Contract
Local development should use a local `.env` or `.env.local` file that is explicitly excluded from Git. This file may include:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `ADMIN_EMAIL`
- `NEXT_PUBLIC_EMAILJS_*`
- other runtime or service credentials as needed

Do not check in any of these values.

## 3. Production Environment Contract
The production server is the Hetzner VPS at `2.28.120.85` and is managed via PM2 for the `hayp-frontend` service on port `3003`.

Use SSH to edit production environment variables directly on the server when required:

```bash
ssh -i ~/.ssh/id_ed25519_hetzner root@2.28.120.85
cd /var/www/hayp-studios
nano .env
```

After updating the live `.env`, reload PM2 so the running process sees the new environment:

```bash
pm2 restart hayp-frontend --update-env
```

## 4. Safe Deployment Workflow
1. Update `.env.example` in the repo with the new key names and safe placeholder values.
2. Keep production secrets on the VPS only.
3. Deploy code with `git pull origin main` after CI checks pass.
4. Rebuild and restart the PM2 process if environment changes were made.

## 5. Secrets Protection Checklist
- [ ] No `.env`, `.env.local`, or `.env.production` file is tracked in Git.
- [ ] Placeholder values are used in repo templates only.
- [ ] Production credentials are not pasted into pull request bodies or chat logs.
- [ ] PM2 and Caddy reloads are performed after environment edits.

## 6. Example Commands
```bash
# View the live server config
ssh -i ~/.ssh/id_ed25519_hetzner root@2.28.120.85
cat /var/www/hayp-studios/.env

# Reload the app after a config change
pm2 restart hayp-frontend --update-env
```

---

## 7. Operational Reminder
Any environment change affecting authentication, database, or email delivery must be validated with a fresh build and smoke check before it is treated as production-safe.
