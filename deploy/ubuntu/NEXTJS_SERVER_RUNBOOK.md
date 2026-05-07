# Next.js Server Runbook (Ubuntu + Nginx + systemd)

Dit document is je vaste handleiding om:
- de huidige app te beheren
- updates uit te rollen
- een tweede (of derde) Next.js app op dezelfde server te draaien

Servercontext:
- OS: Ubuntu
- Reverse proxy: Nginx
- App runtime: Node.js + Next.js (`next start`)
- Service manager: systemd

---

## 1) Hoe het nu draait

Verkeer gaat via twee lagen:

1. Nginx luistert op poort 80/443
2. Nginx proxyt naar Next.js op lokale poort (bijv. 3000)

Dus: Nginx voor webverkeer + Next.js voor app-logica.

Snelle checks:

```bash
systemctl status medsummary
systemctl status nginx
ss -ltnp | grep :3000
ss -ltnp | grep :80
```

---

## 2) Standaard update-flow (huidige app)

### Op Windows (lokaal)

```powershell
cd C:\DEV\my-onderzoek-pwa
git add .
git commit -m "Beschrijving van wijziging"
git push origin main
```

### Op Ubuntu server

```bash
cd /opt/my-onderzoek-pwa
git pull origin main
npm ci
npm run build
sudo systemctl restart medsummary
sudo systemctl status --no-pager -l medsummary
```

Health check:

```bash
curl -I http://127.0.0.1:3000
```

### One-command update script (medsummary)

Script in repo:

```bash
deploy/ubuntu/update-medsummary.sh
```

Gebruik op server:

```bash
cd /opt/my-onderzoek-pwa
bash deploy/ubuntu/update-medsummary.sh
```

Optionele overrides:

```bash
APP_DIR=/opt/my-onderzoek-pwa BRANCH=main SERVICE_NAME=medsummary bash deploy/ubuntu/update-medsummary.sh
```

---

## 3) Troubleshooting die we al zijn tegengekomen

### A) `fatal: not a git repository`

Je zit in een map zonder `.git`.
Gebruik altijd de echte clone-map:

```bash
cd /opt/my-onderzoek-pwa
```

### B) `EADDRINUSE: address already in use :::3000`

Er draait al een oude handmatige Next.js server.

```bash
sudo ss -ltnp | grep :3000
sudo pkill -f "next start" || true
sudo pkill -f "npm run start" || true
sudo systemctl restart medsummary
```

### C) `bad unit file setting`

Systemd service bestand is fout of corrupt. Maak service opnieuw en `daemon-reload`.

### D) Build warning over meerdere lockfiles

Zorg dat je build in de echte app-map draait (`/opt/my-onderzoek-pwa`) en vermijd extra lockfiles in parent dirs als dat kan.

---

## 4) Nieuwe (2e) Next.js app op dezelfde server

Gebruik per app:
- eigen map
- eigen service
- eigen poort
- eigen Nginx site

Voorbeeld hieronder gebruikt:
- App naam: `app2`
- Map: `/opt/app2`
- Poort: `3001`
- Service: `app2.service`
- Domein: `app2.jouwdomein.nl`

### Stap 1: code ophalen

```bash
sudo mkdir -p /opt
cd /opt
sudo git clone https://github.com/<jouw-user>/<jouw-repo>.git app2
sudo chown -R root:root /opt/app2
```

### Stap 2: env instellen

```bash
cd /opt/app2
cp .env.example .env.production.local 2>/dev/null || true
nano .env.production.local
```

Vul minimaal benodigde variabelen in (API keys etc.).

### Stap 3: dependencies + build

```bash
cd /opt/app2
npm ci
npm run build
```

### Stap 4: systemd service voor app2

```bash
cat >/etc/systemd/system/app2.service <<'EOF'
[Unit]
Description=App2 Next.js
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/app2
Environment=NODE_ENV=production
Environment=HOSTNAME=0.0.0.0
Environment=PORT=3001
EnvironmentFile=-/opt/app2/.env.production.local
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now app2
sudo systemctl status --no-pager -l app2
```

### Stap 5: Nginx site voor app2

```bash
cat >/etc/nginx/sites-available/app2 <<'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name app2.jouwdomein.nl;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/app2 /etc/nginx/sites-enabled/app2
sudo nginx -t
sudo systemctl reload nginx
```

### Stap 6: verify

```bash
curl -I http://127.0.0.1:3001
curl -I http://app2.jouwdomein.nl
```

---

## 5) Update-flow voor 2e app

Op je laptop:

```powershell
git add .
git commit -m "Update app2"
git push origin main
```

Op server:

```bash
cd /opt/app2
git pull origin main
npm ci
npm run build
sudo systemctl restart app2
sudo systemctl status --no-pager -l app2
```

### One-command update script (app2)

Script in repo:

```bash
deploy/ubuntu/update-app2.sh
```

Gebruik op server:

```bash
cd /opt/my-onderzoek-pwa
bash deploy/ubuntu/update-app2.sh
```

Optionele overrides:

```bash
APP_DIR=/opt/app2 BRANCH=main SERVICE_NAME=app2 bash deploy/ubuntu/update-app2.sh
```

---

## 6) Handige one-liners

### Welke process gebruikt poort?

```bash
sudo ss -ltnp | grep :3000
sudo ss -ltnp | grep :3001
```

### Logs live volgen

```bash
sudo journalctl -u medsummary -f
sudo journalctl -u app2 -f
```

### Nginx logs

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 7) Cloudflare Tunnel (optioneel)

Per hostname kun je naar een andere lokale service routeren:
- `medsummary.jouwdomein.nl` -> `http://localhost:3000`
- `app2.jouwdomein.nl` -> `http://localhost:3001`

Als Nginx al goed werkt met domeinen, is Cloudflare Tunnel optioneel.

---

## 8) Belangrijk beheeradvies

- Start apps niet handmatig met `npm run start` als systemd ze beheert.
- Gebruik per app altijd unieke poort + unieke servicenaam.
- Houd secrets alleen in `.env.production.local` op de server (niet committen).
- Roteer API keys direct als ze ooit publiek gedeeld zijn.
