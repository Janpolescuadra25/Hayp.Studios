#!/usr/bin/env bash
# ============================================================================== 
# HAYP STUDIOS — AUTOMATED POST-DEPLOYMENT SMOKE VERIFICATION SCRIPT
# Deliverable 9.5: Automated Verification & Health Checks
# Target: https://haypstudios.com (or pass --local for http://localhost:3003)
# Dependencies: bash, curl, grep, coreutils
# ============================================================================== 

set -euo pipefail

TARGET_ARG="${1:-https://haypstudios.com}"
if [ "$TARGET_ARG" = "--local" ]; then
  TARGET_HOST="http://localhost:3003"
else
  TARGET_HOST="$TARGET_ARG"
fi

PASSED=0
FAILED=0

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_pass() { echo -e "${GREEN}[PASS]${NC} $1"; ((PASSED++)); }
log_fail() { echo -e "${RED}[FAIL]${NC} $1"; ((FAILED++)); }

echo "======================================================================"
echo " Starting Post-Deployment Verification for: $TARGET_HOST"
echo " Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "======================================================================"

# 1. Health Check Endpoint Verification
log_info "Testing /api/health endpoint..."
HEALTH_URL="${TARGET_HOST}/api/health"
HEALTH_RESP=$(curl -s -w "\n%{http_code}" --max-time 10 "$HEALTH_URL" || echo -e "ERROR\n000")
HEALTH_CODE=$(echo "$HEALTH_RESP" | tail -n1)
HEALTH_BODY=$(echo "$HEALTH_RESP" | head -n -1)

if [ "$HEALTH_CODE" -eq 200 ]; then
  if echo "$HEALTH_BODY" | grep -q '"status":"healthy"' && echo "$HEALTH_BODY" | grep -q '"database":"connected"'; then
    log_pass "/api/health returned 200 OK with status: healthy, database: connected"
  else
    log_fail "/api/health returned 200 but payload status is unexpected: $HEALTH_BODY"
  fi
else
  log_fail "/api/health failed with HTTP status: $HEALTH_CODE"
fi

# 2. HTTP Security Headers Verification (Only applicable on full reverse-proxy domain targets)
if [[ "$TARGET_HOST" =~ ^https:// ]]; then
  log_info "Testing HTTP Security Headers on root endpoint..."
  HEADERS=$(curl -s -I --max-time 10 "$TARGET_HOST" || true)

  check_header() {
    local header_name="$1"
    if echo "$HEADERS" | grep -i -q "$header_name"; then
      log_pass "Header found: $header_name"
    else
      log_fail "Missing security header: $header_name"
    fi
  }

  check_header "Strict-Transport-Security"
  check_header "X-Content-Type-Options"
  check_header "X-Frame-Options"
  check_header "Referrer-Policy"
fi

# 3. Protected Route Security Gate Verification
log_info "Testing unauthenticated access guardrail on /api/analytics/metrics..."
METRICS_URL="${TARGET_HOST}/api/analytics/metrics"
METRICS_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$METRICS_URL" || echo "000")

if [ "$METRICS_CODE" -eq 401 ] || [ "$METRICS_CODE" -eq 403 ]; then
  log_pass "/api/analytics/metrics correctly rejected unauthenticated request with HTTP $METRICS_CODE"
else
  log_fail "/api/analytics/metrics did not reject unauthenticated access (HTTP status: $METRICS_CODE)"
fi

# 4. Public Inquiry API Endpoint Responsiveness
log_info "Testing /api/inquiry endpoint input validation..."
INQUIRY_URL="${TARGET_HOST}/api/inquiry"
INQUIRY_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -d '{}' --max-time 10 "$INQUIRY_URL" || echo "000")

if [ "$INQUIRY_CODE" -eq 400 ] || [ "$INQUIRY_CODE" -eq 422 ]; then
  log_pass "/api/inquiry rejected empty JSON payload with HTTP $INQUIRY_CODE (Validation Active)"
elif [ "$INQUIRY_CODE" -eq 200 ]; then
  log_pass "/api/inquiry responded with HTTP 200"
else
  log_fail "/api/inquiry unexpected response status: $INQUIRY_CODE"
fi

# 5. HTTPS Redirection Verification (for production domain targets)
if [[ "$TARGET_HOST" =~ ^https:// ]]; then
  HTTP_HOST="http://${TARGET_HOST#https://}"
  log_info "Testing HTTP to HTTPS redirection on $HTTP_HOST..."
  REDIRECT_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$HTTP_HOST" || echo "000")
  if [ "$REDIRECT_CODE" -eq 301 ] || [ "$REDIRECT_CODE" -eq 308 ]; then
    log_pass "HTTP to HTTPS redirect verified (HTTP $REDIRECT_CODE)"
  else
    log_fail "HTTP to HTTPS redirect failed or returned unexpected code: $REDIRECT_CODE"
  fi
fi

echo "======================================================================"
echo " Verification Complete: $PASSED checks passed, $FAILED checks failed"
echo "======================================================================"

if [ "$FAILED" -gt 0 ]; then
  echo -e "${RED}[ALERT] Deployment verification failed! Review errors above.${NC}"
  exit 1
else
  echo -e "${GREEN}[SUCCESS] All deployment smoke checks passed cleanly!${NC}"
  exit 0
fi