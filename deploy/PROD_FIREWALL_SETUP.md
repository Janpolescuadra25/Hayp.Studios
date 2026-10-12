# Production Firewall Configuration (UFW) — vortex VPS

## Target Host
- **Server:** Hetzner Cloud VPS `vortex` (IP: `2.28.120.85`)
- **App:** Hayp Studios Frontend (Port `3003`, managed by PM2)
- **Reverse Proxy:** Caddy / Nginx (Ports `80`, `443`)

## UFW Rules Specification
| Port | Protocol | Purpose | Access |
|---|---|---|---|
| `22` | TCP | SSH Administration | Restricted / Public key auth |
| `80` | TCP | HTTP -> HTTPS Redirect | Public |
| `443` | TCP | HTTPS TLS Traffic | Public |
| `3003` | TCP | Internal Next.js App | Localhost only (`127.0.0.1`) — DO NOT EXPOSE |

## Verification Commands on Server
```bash
sudo ufw status verbose
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```
