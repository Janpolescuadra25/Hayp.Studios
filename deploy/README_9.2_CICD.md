# DELIVERABLE 9.2: CI/CD PIPELINE & DEPLOYMENT AUTOMATION — DONE
**Last Updated:** 2026-10-13  
**Status:** ✅ FULLY IMPLEMENTED & VERIFIED

## Overview
This document specifies the automated CI/CD pipeline implemented for Hayp.Studios via GitHub Actions.

## Workflow File
- Path: `.github/workflows/deploy.yml`
- Triggers: Push events to the `main` branch, plus manual `workflow_dispatch`.

## Architecture & Stages
1. **Stage 1: Test & Build Verification Gate (`test-and-build`)**
   - Environment: `ubuntu-latest`
   - Runtime: Bun (`oven-sh/setup-bun@v2`)
   - Pre-flight Gates: Executes `bun test` (all route and auth tests must pass) and `bun run build` (Next.js Turbopack compilation must exit 0).
   - Fail-Closed: If any test or build fails, the deployment job is completely aborted.
2. **Stage 2: Production Deploy (`deploy`)**
   - Connects to Hetzner Cloud VPS `vortex` (`2.28.120.85`) over SSH (Port `22`).
   - Executes pull-only deployment to the designated application directory (`/var/www/haypstudios`).
   - Runs `bun install` and production compile `bun run build`.
   - Executes non-interactive database migrations via `bun run db:migrate:deploy`.
   - Reloads the `hayp-frontend` PM2 service on Port `3003` with zero downtime.

## Required GitHub Repository Secrets
The following secrets must be registered in the GitHub repository settings (**Settings > Secrets and variables > Actions**):
| Secret Name | Purpose | Example / Notes |
|---|---|---|
| `VPS_HOST` | Target VPS IP | `2.28.120.85` |
| `VPS_USERNAME` | SSH User | `root` |
| `VPS_SSH_PRIVATE_KEY` | Ed25519 Private Key | Laptop SSH key matching `id_ed25519_hetzner` |
| `VPS_APP_DIR` | Optional server path | Default: `/var/www/haypstudios` |
| `DATABASE_URL` | Production PostgreSQL DB | Configured in server `.env` |