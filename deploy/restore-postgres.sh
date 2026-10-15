#!/usr/bin/env bash
# ============================================================================== 
# HAYP STUDIOS — Automated PostgreSQL Restore Script
# Deliverable 9.4 / 9.5 Production Tooling
#
# Usage:
#   ./deploy/restore-postgres.sh [path/to/backup.sql.gz] [--force]
#
# Environment Variables:
#   DATABASE_URL          Full PostgreSQL connection string (masked in logs)
#   POSTGRES_BACKUP_DIR   Directory where backups are stored (default: /var/backups/haypstudios/postgres)
# ============================================================================== 

set -euo pipefail

BACKUP_DIR="${POSTGRES_BACKUP_DIR:-/var/backups/haypstudios/postgres}"
BACKUP_FILE="${1:-}"
FORCE_RESTORE="false"

# Check for --force flag in arguments
for arg in "$@"; do
  if [[ "$arg" == "--force" || "$arg" == "-f" ]]; then
    FORCE_RESTORE="true"
  fi
done

# If no backup file specified as first argument, pick the latest backup from BACKUP_DIR
if [[ -z "$BACKUP_FILE" || "$BACKUP_FILE" == "--force" || "$BACKUP_FILE" == "-f" ]]; then
  if [[ -d "$BACKUP_DIR" ]]; then
    BACKUP_FILE=$(find "$BACKUP_DIR" -type f -name "*.sql.gz" | sort -r | head -n 1)
  fi
fi

echo "=================================================="
echo "HAYP STUDIOS — DATABASE RESTORE UTILITY"
echo "=================================================="

# Validation 1: Verify backup file existence
if [[ -z "$BACKUP_FILE" ]]; then
  echo "[-] ERROR: No backup file specified and no backup found in $BACKUP_DIR"
  echo "Usage: $0 <path/to/backup_file.sql.gz> [--force]"
  exit 1
fi

if [[ ! -f "$BACKUP_FILE" ]]; then
  echo "[-] ERROR: Specified backup file does not exist: $BACKUP_FILE"
  exit 1
fi

# Validation 2: Verify backup file has non-zero size
FILE_SIZE=$(wc -c < "$BACKUP_FILE" | tr -d ' ')
if [[ "$FILE_SIZE" -le 0 ]]; then
  echo "[-] ERROR: Backup file is empty (0 bytes): $BACKUP_FILE"
  exit 1
fi

echo "[+] Target backup file : $BACKUP_FILE"
echo "[+] Backup file size   : $FILE_SIZE bytes"

# Validation 3: Verify DATABASE_URL is available
if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "[-] ERROR: DATABASE_URL environment variable is not set."
  echo "Please export DATABASE_URL or set it in your environment before running restore."
  exit 1
fi

# Extract host and database name for confirmation without exposing credentials
DB_NAME=$(echo "$DATABASE_URL" | sed -E 's/.*\/([^?]+)(\?.*)?$/\1/')
DB_HOST=$(echo "$DATABASE_URL" | sed -E 's/.*@([^:]+):?.*/\1/' | sed -E 's/.*@//')
echo "[+] Target database    : $DB_NAME on host: $DB_HOST"

# Safety Confirmation Prompt
if [[ "$FORCE_RESTORE" != "true" ]]; then
  echo ""
  echo "⚠️  WARNING: Restoring will overwrite existing data in database '$DB_NAME'!"
  read -r -p "Are you sure you want to proceed with restore? [y/N]: " CONFIRMATION
  if [[ ! "$CONFIRMATION" =~ ^[Yy]$ ]]; then
    echo "[-] Database restore aborted by user."
    exit 0
  fi
fi

# Validation 4: Verify gunzip and psql tools exist
if ! command -v gunzip >/dev/null 2>&1; then
  echo "[-] ERROR: 'gunzip' command not found. Please install gzip/coreutils."
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "[-] ERROR: 'psql' command not found. Please install postgresql-client."
  exit 1
fi

echo "[*] Decompressing and restoring database..."
START_TIME=$(date +%s)

if gunzip -c "$BACKUP_FILE" | psql "$DATABASE_URL" --quiet --set ON_ERROR_STOP=on; then
  END_TIME=$(date +%s)
  DURATION=$((END_TIME - START_TIME))
  echo "[+] SUCCESS: Database '$DB_NAME' restored successfully from $BACKUP_FILE in ${DURATION}s."
  exit 0
else
  echo "[-] FATAL: Database restore failed! Check PostgreSQL logs for details."
  exit 1
fi