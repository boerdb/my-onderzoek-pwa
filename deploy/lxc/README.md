# Deploy Next.js app op Proxmox LXC

Deze handleiding is bedoeld voor een Debian 12 LXC container in Proxmox.

## 1) LXC container maken in Proxmox

Gebruik bij voorkeur:
- Debian 12 template
- 1 tot 2 vCPU
- 2 GB RAM (minimum), 4 GB aanbevolen
- 8 tot 16 GB disk
- Netwerk met statisch DHCP lease of vaste IP

Optioneel (alleen als nodig):
- `nesting=1` voor extra container-features

## 2) In container: project neerzetten

```bash
apt-get update
apt-get install -y git
mkdir -p /opt/my-onderzoek-pwa
cd /opt/my-onderzoek-pwa
git clone <YOUR_REPO_URL> .
```

## 3) Bootstrap uitvoeren

In de projectmap:

```bash
chmod +x deploy/lxc/setup-lxc.sh
sudo ./deploy/lxc/setup-lxc.sh
```

Dit script:
- installeert Node.js 20 + Nginx
- maakt systeemgebruiker `nextjs`
- doet `npm ci` en `npm run build`
- plaatst systemd en Nginx configuratie
- start je service

## 4) Environment configureren

```bash
cd /opt/my-onderzoek-pwa
cp .env.example .env
nano .env
```

Minimaal vereist:
- `GEMINI_API_KEY`

## 5) Domein/IP in Nginx zetten

Pas `server_name` aan in:
- `/etc/nginx/sites-available/my-onderzoek-pwa.conf`

Test en reload:

```bash
nginx -t
systemctl reload nginx
```

## 6) Runtime checks

```bash
systemctl status my-onderzoek-pwa
journalctl -u my-onderzoek-pwa -f
curl -I http://127.0.0.1:3000
curl -I http://<YOUR_CONTAINER_IP>
```

## Update workflow (nieuwe release)

```bash
cd /opt/my-onderzoek-pwa
git pull
npm ci
npm run build
systemctl restart my-onderzoek-pwa
```

## SSL met Let's Encrypt (optioneel)

```bash
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.example
```

## Troubleshooting

- `502 Bad Gateway`: check of de app op poort 3000 draait (`systemctl status my-onderzoek-pwa`).
- `AI-service niet geconfigureerd`: `GEMINI_API_KEY` ontbreekt in `.env`.
- API rate limiting te streng: verhoog `RATE_LIMIT_SEARCH` en/of `RATE_LIMIT_SUMMARY` in `.env`.
