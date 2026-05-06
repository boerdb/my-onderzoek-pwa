#!/usr/bin/env bash
set -euo pipefail

APP_USER="nextjs"
NODE_MAJOR="20"

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/../.." && pwd)"
APP_DIR="${REPO_ROOT}"

if [ ! -f "${APP_DIR}/package.json" ]; then
  echo "Run this script from a cloned repository with package.json present."
  exit 1
fi

echo "[1/7] Installing base packages"
apt-get update
apt-get install -y ca-certificates curl git gnupg nginx

echo "[2/7] Installing Node.js ${NODE_MAJOR}.x"
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODE_MAJOR}.x nodistro main" > /etc/apt/sources.list.d/nodesource.list
apt-get update
apt-get install -y nodejs

echo "[3/7] Creating app user and directory"
if ! id -u "${APP_USER}" >/dev/null 2>&1; then
  useradd --system --create-home --shell /bin/bash "${APP_USER}"
fi
mkdir -p "${APP_DIR}"
chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"

echo "[4/7] Installing dependencies and building app"
if [ ! -f "${APP_DIR}/.env" ]; then
  cp "${APP_DIR}/.env.example" "${APP_DIR}/.env"
  echo "Created ${APP_DIR}/.env from .env.example. Update GEMINI_API_KEY before using AI summaries."
fi

runuser -u "${APP_USER}" -- bash -lc "cd '${APP_DIR}' && npm ci"
runuser -u "${APP_USER}" -- bash -lc "cd '${APP_DIR}' && npm run build"

echo "[5/7] Installing systemd service template"
sed "s|__APP_DIR__|${APP_DIR}|g" "${APP_DIR}/deploy/lxc/my-onderzoek-pwa.service" > /etc/systemd/system/my-onderzoek-pwa.service

echo "[6/7] Installing Nginx site template"
cp "${APP_DIR}/deploy/lxc/nginx-my-onderzoek-pwa.conf" /etc/nginx/sites-available/my-onderzoek-pwa.conf
ln -sf /etc/nginx/sites-available/my-onderzoek-pwa.conf /etc/nginx/sites-enabled/my-onderzoek-pwa.conf

if [ -f /etc/nginx/sites-enabled/default ]; then
  rm -f /etc/nginx/sites-enabled/default
fi

nginx -t
systemctl reload nginx

echo "[7/7] Done"
systemctl daemon-reload
systemctl enable --now my-onderzoek-pwa
echo "Service started. Check with: systemctl status my-onderzoek-pwa"
