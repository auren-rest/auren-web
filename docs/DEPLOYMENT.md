# Deployment

Single app, domain `www.auren.rest` (canonical; apex redirects to it). No environment variables are needed.

## Vercel

Import the repo, framework Next.js, no root-directory change, then add `www.auren.rest` as the primary domain and `auren.rest` set to redirect (308) to it under Domains. DNS: A/ALIAS to the host Vercel shows.

## Docker / Kubernetes (Traefik)

```bash
docker build -t auren-web .
docker run -p 8080:3000 auren-web
```

Route `Host(`www.auren.rest`)` to the container's port 3000 with TLS. The Dockerfile has not been test-built yet (the Docker daemon was unavailable); the standalone output it copies (`.next/standalone/server.js`) was verified from a local build.

## Before launch

- Write real Privacy and Terms pages.
- Contact address is `auren.rest@gmail.com` (shown and used for `mailto:` links); override with `NEXT_PUBLIC_CONTACT_EMAIL`.
