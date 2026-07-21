// ASCEND AI proxy — Cloudflare Worker.
//
// Holds the Anthropic API key (as a Worker secret) and calls the Messages API on
// behalf of the app. The client NEVER sees the key. Deploy with `wrangler deploy`
// then put the Worker URL in src/config.js -> AI_PROXY_URL.
//
// Handles two request modes in the POST body:
//   { mode: 'quests', ... }  -> returns { text: "<minified quest JSON>" }
//   { mode: 'recap',  ... }  -> returns { text: "<plain-text recap>" }

const MODEL = 'claude-sonnet-5'; // current Sonnet — good quality/cost for weekly generation

// The System prompt for quest generation — used verbatim from the spec (§6).
const QUEST_SYSTEM = `You are THE SYSTEM — the entity that assigns quests to a Player to force their
growth. You generate a concrete quest plan, not advice.

RULES:
1. Respect daily_minutes as a hard cap on total quest minutes for a workday.
   Rest days may be ~1.6x.
2. Schedule into free windows only: morning (wake→work_start), lunch, or evening
   (work_end→sleep). Never during work hours.
3. ~70% of quests target focus_areas; keep a light baseline in the others.
4. Quests are specific and imperative. "40 push-ups", not "get fit". Title <= 5 words.
5. Number of workday quests = tier load: E=3, D=4, C=5, B=6, A=7, S=8. Rest days
   may add 1-2.
6. Provide a "workday" template and a "restday" template (not 7 distinct days).
7. Consider goal_text and constraints. If recent_performance shows repeated skips,
   change timing or replace the quest.
8. Output ONLY valid minified JSON. No markdown, no prose, no code fences.

Schema:
{"workday":[{"title":"","attr":"STR|INT|WLTH|VIT|FOC","duration_min":0,"xp":0,
"window":"HH:MM","why":""}],"restday":[...same...],
"boss":{"title":"","attr":"","xp":0,"why":""},
"note":"one line in the System's stern voice"}`;

const RECAP_SYSTEM = `You are THE SYSTEM. Write a terse, stern second-person weekly report to the
Player based on the numbers provided. 3-4 sentences. Reference the real figures.
No markdown, no lists. End by stating that the quests have been recalibrated.`;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

async function callAnthropic(apiKey, system, userText, maxTokens) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: userText }],
    }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Anthropic ${res.status}: ${detail}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (request.method !== 'POST') return json({ error: 'POST only' }, 405);
    if (!env.ANTHROPIC_API_KEY) return json({ error: 'Missing ANTHROPIC_API_KEY secret' }, 500);

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON' }, 400);
    }

    try {
      if (body.mode === 'recap') {
        const text = await callAnthropic(env.ANTHROPIC_API_KEY, RECAP_SYSTEM, JSON.stringify(body), 400);
        return json({ text });
      }
      // default: quest generation
      const text = await callAnthropic(env.ANTHROPIC_API_KEY, QUEST_SYSTEM, JSON.stringify(body), 1500);
      return json({ text });
    } catch (e) {
      return json({ error: String(e.message || e) }, 502);
    }
  },
};
