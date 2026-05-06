# Deploy op Ubuntu Host

Voor wanneer je al Ubuntu/Debian draait op de target machine (geen LXC container).

## Quick Start

Als de projectbestanden al op de Ubuntu server staan, ga dan naar die map en draai het script daar.

```bash
# Op je Ubuntu host (bijv. 192.168.1.173):
cd /opt
sudo bash deploy/ubuntu/setup-ubuntu.sh

# Na script:
nano /opt/my-onderzoek-pwa/.env          # Voeg GEMINI_API_KEY toe
nano /etc/nginx/sites-available/my-onderzoek-pwa.conf  # Pas domein/IP aan
sudo systemctl enable --now my-onderzoek-pwa
```

## Wat het script doet

1. **Installeert**: Node.js 20, Nginx, Git
2. **Kopieert/synchroniseert**: projectbestanden naar `/opt/my-onderzoek-pwa`
3. **Build**: `npm ci` + `npm run build`
4. **Configureert**: Systemd service + Nginx reverse proxy
5. **Start**: app service

## Configuratie na deploy

### 1. Environment variables

```bash
nano /opt/my-onderzoek-pwa/.env
```

**Verplicht:**
- `GEMINI_API_KEY` — je Google Gemini API key

**Optioneel:**
- `RATE_LIMIT_SEARCH=30` — search requests per minuut
- `RATE_LIMIT_SUMMARY=10` — summary requests per minuut

### 2. Nginx domein

```bash
nano /etc/nginx/sites-available/my-onderzoek-pwa.conf
```

Wijzig:
```nginx
server_name YOUR_DOMAIN_OR_IP;
```

In je daadwerkelijke domein/IP, bijv.:
```nginx
server_name 192.168.1.173;
# of:
server_name medsummary.example.com;
```

Test en reload:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Service starten

```bash
sudo systemctl enable --now my-onderzoek-pwa
sudo systemctl status my-onderzoek-pwa
```

Logs volgen:
```bash
sudo journalctl -u my-onderzoek-pwa -f
```

## Updates

```bash
cd /opt/my-onderzoek-pwa
git pull
npm ci
npm run build
sudo systemctl restart my-onderzoek-pwa
```

## SSL/TLS (optioneel)

Met Let's Encrypt en certbot:

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.example
```

Certbot zal Nginx automatisch updaten met SSL config.

Auto-renewal:
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## Troubleshooting

| Probleem | Oplossing |
|----------|-----------|
| `502 Bad Gateway` | Check `systemctl status my-onderzoek-pwa` |
| AI niet beschikbaar | Controleer `GEMINI_API_KEY` in `.env` |
| Nginx error | Draai `sudo nginx -t` |
| Port conflict | Check `sudo lsof -i :3000` en `sudo lsof -i :80` |

## Logs bekijken

```bash
# Service logs
sudo journalctl -u my-onderzoek-pwa -n 50 -f

# Nginx access/errors
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```
