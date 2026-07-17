// Week generation with graceful degradation (§6).
// Tries the serverless AI proxy; on ANY failure falls back to the local
// generator so the app never breaks. The proxy holds the Anthropic key and the
// System prompt — the client only sends this JSON payload and sanitizes the reply.

import { AI_PROXY_URL } from '../config';
import { ATTR_KEYS, BOSS_XP } from '../logic/constants';
import { generateLocalWeek } from '../logic/localGenerator';
import { questXp } from '../logic/tiers';

let aiIdCounter = 0;
function makeId(attr) {
  aiIdCounter += 1;
  return `${String(attr || 'foc').toLowerCase()}-ai-${Date.now().toString(36)}-${aiIdCounter}`;
}

// Coerce a raw AI attr value to a valid attribute key.
function coerceAttr(attr) {
  const up = String(attr || '').toUpperCase();
  return ATTR_KEYS.includes(up) ? up : 'FOC';
}

// Turn one raw AI quest into a safe, complete quest object.
function sanitizeQuest(raw, tier) {
  const attr = coerceAttr(raw.attr);
  const duration = Number(raw.duration_min) || 15;
  const xp = Number(raw.xp) > 0 ? Math.round(Number(raw.xp)) : questXp(duration, tier);
  return {
    id: makeId(attr),
    title: String(raw.title || 'Quest').slice(0, 40),
    attr,
    duration_min: duration,
    xp,
    window: typeof raw.window === 'string' ? raw.window : '08:00',
    why: String(raw.why || 'The System demands progress.'),
  };
}

// Build the recent_performance block from the caller-supplied metrics.
export function buildPayload(profile, recent) {
  return {
    mode: 'quests',
    focus_areas: profile.focusAreas,
    wake_time: profile.wake,
    work_days: profile.workDays,
    work_hours: { start: profile.workStart, end: profile.workEnd },
    sleep_time: profile.sleep,
    daily_minutes: profile.dailyMinutes,
    tier: profile.tier,
    goal_text: profile.goalText || '',
    constraints: profile.constraints || [],
    recent_performance: recent || { completion_7d: 0, skipped_quests: [] },
  };
}

// Parse the proxy reply into a validated week, or throw to trigger the fallback.
function parseAiWeek(text, tier, focusAreas) {
  const cleaned = String(text).replace(/```json/gi, '').replace(/```/g, '').trim();
  const data = JSON.parse(cleaned);
  if (!Array.isArray(data.workday) || data.workday.length === 0) {
    throw new Error('AI returned no workday quests');
  }
  const workday = data.workday.map((q) => sanitizeQuest(q, tier));
  const restday = Array.isArray(data.restday)
    ? data.restday.map((q) => sanitizeQuest(q, tier))
    : workday.slice(0, Math.max(2, workday.length - 1));

  const bossAttr = coerceAttr(data.boss?.attr || focusAreas?.[0]);
  const boss = {
    id: makeId(bossAttr),
    title: String(data.boss?.title || 'Weekly Trial').slice(0, 40),
    attr: bossAttr,
    xp: Number(data.boss?.xp) > 0 ? Math.round(Number(data.boss.xp)) : BOSS_XP,
    why: String(data.boss?.why || 'Prove your growth before the week ends.'),
  };

  return {
    workday,
    restday,
    boss,
    note: String(data.note || 'The System has assigned your path.'),
    source: 'ai',
    generatedAt: Date.now(),
  };
}

// Public API. Always resolves to a valid week object (never rejects).
export async function generateWeek(profile, recent) {
  if (!AI_PROXY_URL) return generateLocalWeek(profile);
  try {
    const res = await fetch(AI_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildPayload(profile, recent)),
    });
    if (!res.ok) throw new Error(`Proxy ${res.status}`);
    const body = await res.json();
    // Proxy may return { text } or the raw Messages API shape.
    const text = body.text ?? body.content?.[0]?.text ?? JSON.stringify(body);
    return parseAiWeek(text, profile.tier, profile.focusAreas);
  } catch (e) {
    return generateLocalWeek(profile);
  }
}
