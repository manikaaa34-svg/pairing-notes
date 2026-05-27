'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function highlight(text, query) {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return parts.map((p, i) =>
    p.toLowerCase() === query.toLowerCase() ? <mark key={i}>{p}</mark> : p
  );
}

export default function HomePage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pairings, setPairings] = useState([]);
  const [query, setQuery] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) fetchPairings();
  }, [session]);

  async function fetchPairings() {
    const { data, error } = await supabase
      .from('pairings')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setPairings(data || []);
  }

  async function handleAuth(e) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    setMessage('');
    if (authMode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setAuthError(error.message);
      else setMessage('Check your email to confirm your account, then log in.');
    }
    setAuthLoading(false);
  }

  async function handleDelete(id) {
    await supabase.from('pairings').delete().eq('id', id);
    setPairings(prev => prev.filter(p => p.id !== id));
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setPairings([]);
  }

  if (loading) {
    return (
      <main>
        <div className="container">
          <div className="empty-state" style={{ paddingTop: 120 }}>
            <span className="empty-glyph" style={{ opacity: 0.15 }}>🍷</span>
          </div>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main>
        <div className="container" style={{ maxWidth: 480 }}>
          <header className="site-header">
            <h1 className="site-title">Pairing<span> Notes</span></h1>
            <p className="site-subtitle">A sommelier's cellar book</p>
          </header>

          <form onSubmit={handleAuth} className="pairing-form">
            <div className="field-group">
              <label className="field-label" htmlFor="email">Email</label>
              <input
                id="email"
                className="field-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="password">Password</label>
              <input
                id="password"
                className="field-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {authError && (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#c47070', letterSpacing: '0.05em' }}>
                {authError}
              </p>
            )}
            {message && (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent)', letterSpacing: '0.05em' }}>
                {message}
              </p>
            )}

            <div className="form-actions">
              <button className="btn btn-primary" type="submit" disabled={authLoading}>
                {authLoading ? '...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthError(''); setMessage(''); }}
              >
                {authMode === 'login' ? 'Create account' : 'Sign in instead'}
              </button>
            </div>
          </form>

          <footer className="site-footer">
            <p>Pairing Notes · Your notes stay on your device</p>
          </footer>
        </div>
      </main>
    );
  }

  const filtered = pairings.filter(p => {
    const q = query.toLowerCase();
    if (!q) return true;
    return p.dish.toLowerCase().includes(q) || p.wine.toLowerCase().includes(q) || (p.note || '').toLowerCase().includes(q);
  });

  return (
    <main>
      <div className="container">
        <header className="site-header">
          <div className="header-row">
            <div>
              <h1 className="site-title">Pairing<span> Notes</span></h1>
              <p className="site-subtitle">A sommelier's cellar book</p>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Link href="/add" className="btn btn-primary">+ Add Pairing</Link>
              <button className="btn btn-ghost" onClick={handleLogout}>Sign out</button>
            </div>
          </div>
        </header>

        {pairings.length > 0 && (
          <div className="search-wrap">
            <span className="search-icon">◎</span>
            <input
              className="search-input"
              type="text"
              placeholder="Search by dish, wine, or note…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoComplete="off"
            />
          </div>
        )}

        {filtered.length > 0 ? (
          <>
            <p className="pairings-meta">
              {filtered.length} {filtered.length === 1 ? 'pairing' : 'pairings'}{query && ' · filtered'}
            </p>
            <ul className="pairings-list">
              {filtered.map((p, i) => (
                <li key={p.id} className="pairing-card" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="card-header">
                    <h2 className="pairing-dish">{highlight(p.dish, query)}</h2>
                    <button className="btn btn-danger" onClick={() => handleDelete(p.id)}>Remove</button>
                  </div>
                  <p className="pairing-wine">{highlight(p.wine, query)}</p>
                  {p.note && <p className="pairing-note">{highlight(p.note, query)}</p>}
                  <p className="pairing-time">{formatDate(p.created_at)}</p>
                </li>
              ))}
            </ul>
          </>
        ) : pairings.length === 0 ? (
          <div className="empty-state">
            <span className="empty-glyph">🍷</span>
            <h3>Your cellar book is empty</h3>
            <p>Begin by adding your first pairing</p>
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-glyph">◎</span>
            <h3>No results for "{query}"</h3>
            <p>Try a different search</p>
          </div>
        )}

        <footer className="site-footer">
          <p>Pairing Notes · Your notes stay on your device</p>
        </footer>
      </div>
    </main>
  );
}
