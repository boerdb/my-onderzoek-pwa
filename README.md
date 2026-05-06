This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Proxmox LXC

For a self-hosted deployment in a Proxmox LXC container, use:

- `deploy/lxc/README.md`
- `deploy/lxc/setup-lxc.sh`

This setup uses:

- Node.js 20
- systemd service (`my-onderzoek-pwa.service`)
- Nginx reverse proxy (`nginx-my-onderzoek-pwa.conf`)

## Deploy on Ubuntu Host

For deployment on an existing Ubuntu/Debian host (e.g., Proxmox host itself), use:

- `deploy/ubuntu/README.md`
- `deploy/ubuntu/setup-ubuntu.sh`

Handles all dependencies, build, and service setup without creating an LXC container.
