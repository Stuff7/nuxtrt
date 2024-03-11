# NuxtRT

Realtime polls, chat and video calls using Nuxt 3, Drizzle, WebSockets and WebRTC

# Run

Note: HTTPS is required for [getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)

```bash
export DB="Your PostgreSQL connection string goes here"

# Optionally set these to use your own SSL certificate
export NITRO_SSL_CERT=""
export NITRO_SSL_KEY=""

# Prepare the database
npm run migrate

# Install dependencies
npm i

# Run HTTPS server
npm run dev -- --host --https
```
