#!/usr/bin/env bash
set -euo pipefail

# Deploy Next.js app op bestaande Ubuntu host (bijv. Proxmox host zelf)
# Usage: sudo bash setup-ubuntu.sh

APP_USER="nextjs"
APP_DIR="/opt/my-onderzoek-pwa"
NODE_MAJOR="20"
REPO_URL="${REPO_URL:-https://github.com/yourusername/my-onderzoek-pwa.git}"
SOURCE_DIR="${SOURCE_DIR:-$(pwd)}"

if [ ! -f "${SOURCE_DIR}/package.json" ]; then
  echo "SOURCE_DIR does not look like the project root: ${SOURCE_DIR}"
  echo "Run this script from the project directory or pass SOURCE_DIR=/path/to/project"
  exit 1
fi

echo "=================================================="
echo "MedSummary PWA - Ubuntu Host Deployment"
echo "=================================================="

echo "[1/7] Installing base packages"
apt-get update
apt-get install -y ca-certificates curl git gnupg nginx rsync

echo "[2/7] Installing Node.js ${NODE_MAJOR}.x"
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODE_MAJOR}.x nodistro main" > /etc/apt/sources.list.d/nodesource.list
apt-get update
apt-get install -y nodejs

echo "[3/7] Creating app user and directory"
if ! id -u "${APP_USER}" >/dev/null 2>&1; then
  useradd --system --create-home --shell /bin/bash "${APP_USER}"
  echo "Created user ${APP_USER}"
else
  echo "User ${APP_USER} already exists"
fi

mkdir -p "${APP_DIR}"
chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"

echo "[4/7] Cloning repository"
if [ "${SOURCE_DIR}" = "${APP_DIR}" ]; then
  echo "Project is already in ${APP_DIR}, skipping copy"
else
  echo "Syncing project files from ${SOURCE_DIR} to ${APP_DIR}"
  rsync -a \
    --delete \
    --exclude ".git/" \
    --exclude "node_modules/" \
    --exclude ".next/" \
    --exclude "*.log" \
    "${SOURCE_DIR}/" "${APP_DIR}/"
  chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"
fi

echo "[5/7] Installing dependencies and building app"
if [ ! -f "${APP_DIR}/.env" ]; then
  cp "${APP_DIR}/.env.example" "${APP_DIR}/.env"
  echo "⚠️  Created ${APP_DIR}/.env from .env.example"
  echo "⚠️  IMPORTANT: Update GEMINI_API_KEY before starting the service:"
  echo "    nano ${APP_DIR}/.env"
else
  echo ".env already exists, skipping"
fi

cd "${APP_DIR}"
runuser -u "${APP_USER}" -- bash -lc "npm ci"
runuser -u "${APP_USER}" -- bash -lc "npm run build"
echo "Build completed successfully"

echo "[6/7] Installing systemd service"
SERVICE_FILE="/etc/systemd/system/my-onderzoek-pwa.service"
if [ -f "${SERVICE_FILE}" ]; then
  echo "Service file already exists. Backing up to ${SERVICE_FILE}.bak"
  cp "${SERVICE_FILE}" "${SERVICE_FILE}.bak"
fi

sed "s|__APP_DIR__|${APP_DIR}|g" "${APP_DIR}/deploy/lxc/my-onderzoek-pwa.service" > "${SERVICE_FILE}"
chmod 644 "${SERVICE_FILE}"
systemctl daemon-reload
echo "Systemd service installed"

echo "[7/7] Installing Nginx reverse proxy"
NGINX_CONF="/etc/nginx/sites-available/my-onderzoek-pwa.conf"
NGINX_ENABLED="/etc/nginx/sites-enabled/my-onderzoek-pwa.conf"

if [ ! -f "${NGINX_CONF}" ]; then
  cp "${APP_DIR}/deploy/lxc/nginx-my-onderzoek-pwa.conf" "${NGINX_CONF}"
  echo "Nginx config installed to ${NGINX_CONF}"
else
  echo "Nginx config already exists at ${NGINX_CONF}"
fi

ln -sf "${NGINX_CONF}" "${NGINX_ENABLED}"
if [ -f /etc/nginx/sites-enabled/default ]; then
  rm -f /etc/nginx/sites-enabled/default
fi

nginx -t
systemctl reload nginx
echo "Nginx configured and reloaded"

echo ""
echo "=================================================="
echo "✅ Installation Complete!"
echo "=================================================="
echo ""
echo "NEXT STEPS:"
echo "1. Edit .env and add GEMINI_API_KEY:"
echo "   nano ${APP_DIR}/.env"
echo ""
echo "2. Edit Nginx domain/IP:"
echo "   nano ${NGINX_CONF}"
echo "   Change 'server_name YOUR_DOMAIN_OR_IP;' to your actual domain/IP"
echo ""
echo "3. Reload Nginx after editing:"
echo "   nginx -t && systemctl reload nginx"
echo ""
echo "4. Start the service:"
echo "   systemctl enable --now my-onderzoek-pwa"
echo ""
echo "5. Check status:"
echo "   systemctl status my-onderzoek-pwa"
echo "   journalctl -u my-onderzoek-pwa -f"
echo ""
echo "App should be running on: http://127.0.0.1:3000"
echo "Via Nginx: http://<your-domain>"
echo ""
