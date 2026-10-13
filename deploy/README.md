# HAYP.STUDIOS PRODUCTION DEPLOYMENT ASSETS
**Last Updated:** 2026-10-13  
**Status:** DONE (Phase 9 Deliverable 9.1 completed)

## Overview
This directory contains all configuration templates, service manifests, and operational documentation for deploying the Hayp.Studios production application to the Hetzner Cloud VPS `vortex` (IPv4: `2.28.120.85`).

## File Inventory
1. **`ecosystem.config.js`** — PM2 process manager configuration for the Next.js production server.
   - App Name: `hayp-frontend`
   - Runtime Port: `3003` (`NODE_ENV=production`)
   - Autorestart: Enabled with 1GB max memory threshold
2. **`Caddyfile`** — Automated TLS reverse-proxy configuration.
   - Domains: `haypstudios.com`, `www.haypstudios.com`
   - Upstream Target: `127.0.0.1:3003`
   - Compression: `gzip` and `zstd` enabled
3. **`PROD_FIREWALL_SETUP.md`** — Uncomplicated Firewall (UFW) rules specification.
   - Public Inbound: Ports `22` (SSH), `80` (HTTP), `443` (HTTPS)
   - Internal Only: Port `3003` (bound to localhost `127.0.0.1`, prohibited from external exposure)

## Architecture & Deployment Workflow
- **Hosting Model:** Standalone Node.js process managed by PM2 behind a local Caddy reverse proxy.
- **Delivery Flow:** Local development (`main`) -> GitHub origin -> Production VPS pull -> PM2 reload.
- **Prerequisites for Deliverable 9.2:** Automated CI/CD pipeline via GitHub Actions.
