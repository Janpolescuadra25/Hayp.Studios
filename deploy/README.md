# Phase 13 Production Deployment Documentation
## STATUS: DONE - Fully Implemented & Verified

### Deployment Overview
- **Target VPS:** Hetzner Cloud `vortex` (2.28.120.85)
- **Deployed Commit:** `3b0445bb1775536d3b701dffd1f4905c275bb164` (branch `main`)
- **Application:** Next.js standalone build served via PM2
- **PM2 Process Name:** `hayp-frontend`
- **Port Configuration:** Node.js runs on port 3003, Nginx reverse proxy handles ports 80/443 for `https://haypstudios.com`
- **Database:** PostgreSQL 14+ running on VPS localhost:5432, database name `HaypStudios_db`

### Key Files & Configuration
- `deploy/ecosystem.config.js`: PM2 process configuration
- `prisma/schema.prisma`: Production-ready Prisma schema with PostgreSQL provider
- `.env.production.example`: Template for production environment variables
- `next.config.ts`: Enables Next.js standalone output mode required for deployment

### Maintenance Procedures
1. **To deploy a new version:** SSH into `vortex`, navigate to `/var/www/hayp-studios`, run `git fetch && git checkout <new-sha>`, then execute `pm2 reload hayp-frontend`
2. **To check logs:** Run `pm2 logs hayp-frontend` on the VPS
3. **To verify health:** Run `curl -I http://localhost:3003` to confirm the application is responding

### Deployment Root Causes Resolved
- Initial Prisma Error P1012: Fixed by switching Prisma datasource from SQLite to PostgreSQL
- VPS PostgreSQL credential mismatch: Fixed by syncing database user/password with deployment `.env` values
- Shell quoting issues in initial deployment scripts: Resolved by running all patches in a fresh PowerShell session