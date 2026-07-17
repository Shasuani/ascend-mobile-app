// App configuration.
//
// AI_PROXY_URL: the serverless proxy that holds the Anthropic API key and calls
// the Messages API (§1). Leave EMPTY to run fully offline with the local quest
// generator — the app is 100% functional without a backend. When you deploy a
// proxy (Cloudflare Worker / Vercel / Supabase Edge), put its URL here.
//
// NEVER put the Anthropic API key in this file or anywhere in the client.
export const AI_PROXY_URL = '';

// Prune progress entries older than this many days (§10).
export const PROGRESS_RETENTION_DAYS = 45;

// Days between automatic weekly reviews (§9).
export const REVIEW_INTERVAL_DAYS = 7;
