// AI-written weekly recap in the System's stern voice (§9). Plain text out.
// Falls back to the local templated recap when the proxy is absent or fails.

import { AI_PROXY_URL } from '../config';
import { localRecap } from '../logic/review';

export async function generateRecap(review, goalText) {
  const fallback = localRecap(review, goalText);
  if (!AI_PROXY_URL) return fallback;
  try {
    const res = await fetch(AI_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'recap',
        completion: review.metrics.completion,
        days_cleared: review.metrics.daysCleared,
        days_active: review.metrics.daysActive,
        xp_gained: review.metrics.xpGained,
        strongest: review.strongest,
        weakest: review.weakest,
        tier_change: review.direction,
        old_tier: review.oldTier,
        new_tier: review.newTier,
        repeatedly_skipped: review.metrics.repeatedlySkipped,
        goal_text: goalText || '',
      }),
    });
    if (!res.ok) throw new Error(`Proxy ${res.status}`);
    const body = await res.json();
    const text = body.text ?? body.content?.[0]?.text ?? '';
    return text && text.trim() ? text.trim() : fallback;
  } catch (e) {
    return fallback;
  }
}
