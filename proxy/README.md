# ASCEND AI Proxy

A tiny serverless function that holds your Anthropic API key and calls the
Messages API for the app. **The API key never ships in the mobile client** — the
app calls this proxy, the proxy calls Anthropic.

The app works fully **without** this proxy (it falls back to an on-device quest
generator). Deploy this only when you want AI-generated quests + weekly recaps.

## Deploy (Cloudflare Workers — free tier is enough)

```bash
npm install -g wrangler
wrangler login
cd proxy
wrangler secret put ANTHROPIC_API_KEY   # paste your key when prompted
wrangler deploy
```

Wrangler prints a URL like `https://ascend-ai-proxy.<you>.workers.dev`.
Put it in `src/config.js`:

```js
export const AI_PROXY_URL = 'https://ascend-ai-proxy.<you>.workers.dev';
```

Reload the app — onboarding and the weekly review now use AI, and silently fall
back to the local generator on any error.

## Request shapes

The app POSTs JSON. The proxy branches on `mode`:

- `{ "mode": "quests", ... }` → `{ "text": "<minified quest JSON>" }`
- `{ "mode": "recap",  ... }` → `{ "text": "<plain-text recap>" }`

## Other hosts

The same logic ports directly to a Vercel/Netlify function or a Supabase Edge
Function — read the request body, call `https://api.anthropic.com/v1/messages`
with the `ANTHROPIC_API_KEY` from the environment, and return `{ text }`. Keep
the two system prompts in `worker.js` verbatim.
