#!/usr/bin/env bash
set -euo pipefail

# One-command update for a second Next.js app
# Usage:
#   bash deploy/ubuntu/update-app2.sh
# Optional overrides:
#   APP_DIR=/opt/app2 BRANCH=main SERVICE_NAME=app2 bash deploy/ubuntu/update-app2.sh

APP_DIR="${APP_DIR:-/opt/app2}"
BRANCH="${BRANCH:-main}"
SERVICE_NAME="${SERVICE_NAME:-app2}"

if [ ! -d "${APP_DIR}" ]; then
  echo "ERROR: APP_DIR does not exist: ${APP_DIR}" >&2
  exit 1
fi

if [ ! -f "${APP_DIR}/package.json" ]; then
  echo "ERROR: package.json not found in ${APP_DIR}" >&2
  exit 1
fi

if [ ! -d "${APP_DIR}/.git" ]; then
  echo "ERROR: ${APP_DIR} is not a git repository" >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: npm is not installed" >&2
  exit 1
fi

if ! command -v systemctl >/dev/null 2>&1; then
  echo "ERROR: systemctl not available" >&2
  exit 1
fi

if [ "$(id -u)" -ne 0 ]; then
  SUDO="sudo"
else
  SUDO=""
fi

echo "[1/5] Pull latest code (${BRANCH})"
git -C "${APP_DIR}" pull origin "${BRANCH}"

echo "[2/5] Install dependencies"
cd "${APP_DIR}"
npm ci

echo "[3/5] Build production bundle"
npm run build

echo "[4/5] Restart service: ${SERVICE_NAME}"
${SUDO} systemctl restart "${SERVICE_NAME}"

echo "[5/5] Service status"
${SUDO} systemctl status --no-pager -l "${SERVICE_NAME}"

echo "Done."
