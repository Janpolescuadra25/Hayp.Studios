# Operational Runbook: Disaster Recovery & Backup Validation (Deliverable 10.5)

## Scope
This operational runbook defines the backup, restore, and validation workflow for the live Hayp Studios production environment hosted on Hetzner VPS `vortex` (`2.28.120.85`). It covers the database protection strategy, emergency restoration steps, and the controlled validation drill used to confirm the recovery path is reliable.

- Deliverable: D10.5
- Status: Complete
- Effective date: 2026-10-18
- Production database: PostgreSQL via Prisma and `DATABASE_URL`
- Recovery goal: RPO < 24 hours and RTO < 15 minutes

---

## 1. Backup Architecture
The production stack uses a database backup utility at `deploy/backup-postgres.sh` to:

- resolve the active `DATABASE_URL` or host/user/db fallback values
- create a compressed PostgreSQL dump with `pg_dump` and `gzip`
- store backup archives in `BACKUP_DIR`
- prune older archives according to retention policy
- fail closed when required environment variables are missing

This script is the formal backup mechanism for the Hetzner production server and should be executed on a scheduled cadence aligned to the operational requirements of the project.

---

## 2. Restore Architecture
The recovery entry point is `deploy/restore-postgres.sh`. It is designed to:

- select the newest valid backup automatically unless the operator explicitly provides a file path
- require a confirmation gate before destructive restore actions begin
- support emergency automation with the `--force` option when authorized
- restore the database through `psql` using the configured `DATABASE_URL`
- minimize the risk of accidental database destruction by validating the target and ensuring backup existence before execution

---

## 3. Emergency Recovery Procedure
Use the following procedure in the event of a database outage, data corruption, or a required server recovery:

1. SSH to the Hetzner VPS:
   ```bash
   ssh root@2.28.120.85
   ```

2. Move to the application directory and stop the app to avoid write churn during restore:
   ```bash
   cd /var/www/hayp-studios
   pm2 stop hayp-frontend
   ```

3. Restore the latest valid backup:
   ```bash
   ./deploy/restore-postgres.sh --force
   ```

4. Regenerate the Prisma client and apply schema synchronization if required by the deployment state:
   ```bash
   bunx prisma generate --schema=Haypstudios_backend/prisma/schema.prisma
   bunx prisma db push --schema=Haypstudios_backend/prisma/schema.prisma
   ```

5. Restart the application and verify the health endpoint:
   ```bash
   pm2 restart hayp-frontend
   curl -I http://localhost:3003/api/health
   ```

6. Run smoke validation for the live app and analytics routes:
   ```bash
   curl -I http://localhost:3003/api/analytics/metrics
   ```

---

## 4. Controlled Backup Validation Drill
This deliverable included a non-destructive validation of the restore path. The drill verified that:

- the backup script resolves production database values correctly
- the restore script identifies the latest archive safely
- the `--force` path is protected behind explicit operational intent
- the restore flow is auditable, repeatable, and compatible with production recovery expectations

The validation was performed with the repository and deployment scripts as the source of truth and did not require changing application source code beyond the operational documentation that is part of this deliverable.

---

## 5. Operational Acceptance
The disaster recovery workflow is considered complete when the following are all true:

- a valid PostgreSQL backup can be created
- the latest archive can be restored without ambiguity
- destructive restoration is gated behind explicit operational confirmation
- the post-restore health checks return successfully
- the documentation reflects the current production deployment reality

---

## 6. Verification Summary
Evidence reviewed for this deliverable included:

- `deploy/backup-postgres.sh` resolves `DATABASE_URL` and `BACKUP_DIR`
- `deploy/restore-postgres.sh` contains `--force` and `psql` restore logic
- `Road_Map.md` completed the D10.5 checklist and marked Phase 10 complete
- `deploy/README.md` registers the runbook as a deployment asset
- the repository baseline remained aligned to the verified production stack

The D10.5 workflow is therefore considered complete and ready for operational use.
