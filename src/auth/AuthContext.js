// Local, on-device accounts (no backend). Sign-up/login screens store accounts
// in AsyncStorage under one key. Structured so it can later be swapped for real
// auth (e.g. Supabase) by replacing the action bodies — the rest of the app just
// consumes { user, signUp, logIn, logOut }.
//
// NOTE: passwords are lightly hashed, not securely. This is a local demo, not a
// real credential store. Do not reuse important passwords.

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEY = 'ascend.auth.v1';
const AuthContext = createContext(null);

// djb2 — a fast non-cryptographic hash, adequate for a local demo only.
function hashPw(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) & 0xffffffff;
  return String(h >>> 0);
}

const normEmail = (e) => (e || '').trim().toLowerCase();

export function AuthProvider({ children }) {
  const [data, setData] = useState(null); // { users, session } | null while loading
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    (async () => {
      let d;
      try {
        const raw = await AsyncStorage.getItem(AUTH_KEY);
        d = raw ? JSON.parse(raw) : { users: {}, session: null };
      } catch (e) {
        d = { users: {}, session: null };
      }
      // Seed a ready-to-use DEMO account so you can log in and test immediately.
      // Login: player@ascend.app / ascend.  (Remove this block before a real launch.)
      const demoId = 'player@ascend.app';
      if (!d.users[demoId]) {
        d = {
          ...d,
          users: { ...d.users, [demoId]: { id: demoId, name: 'PLAYER', email: demoId, pass: hashPw('ascend') } },
        };
      }
      setData(d);
    })();
  }, []);

  const persist = (next) => {
    setData(next);
    AsyncStorage.setItem(AUTH_KEY, JSON.stringify(next)).catch(() => {});
  };

  const actions = {
    signUp({ name, email, password }) {
      const d = dataRef.current;
      const id = normEmail(email);
      if (!name?.trim()) return { ok: false, error: 'Enter your name.' };
      if (!id.includes('@')) return { ok: false, error: 'Enter a valid email.' };
      if ((password || '').length < 4) return { ok: false, error: 'Password must be 4+ characters.' };
      if (d.users[id]) return { ok: false, error: 'An account with that email already exists.' };
      const user = { id, name: name.trim(), email: id, pass: hashPw(password) };
      persist({ users: { ...d.users, [id]: user }, session: id });
      return { ok: true };
    },

    logIn({ email, password }) {
      const d = dataRef.current;
      const id = normEmail(email);
      const user = d.users[id];
      if (!user || user.pass !== hashPw(password)) {
        return { ok: false, error: 'Wrong email or password.' };
      }
      persist({ ...d, session: id });
      return { ok: true };
    },

    logOut() {
      const d = dataRef.current;
      persist({ ...d, session: null });
    },
  };

  const user = data?.session ? data.users[data.session] || null : null;

  return (
    <AuthContext.Provider value={{ ready: !!data, user, actions }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
