// Live countdown to the next local midnight (the daily reset) (§7).

import { useEffect, useState } from 'react';
import { msUntilMidnight } from '../logic/dates';

function fmt(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, '0');
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export default function useCountdown() {
  const [label, setLabel] = useState(fmt(msUntilMidnight()));
  useEffect(() => {
    const id = setInterval(() => setLabel(fmt(msUntilMidnight())), 1000);
    return () => clearInterval(id);
  }, []);
  return label;
}
