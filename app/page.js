'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'pairing-notes-v1';

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function highlight(text, query) {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return parts.map((p, i) =>
    p.toLowerCase() === query.toLowerCase()
      ? <mark key={i}>{p}</mark>
      : p
  );
}

export default function HomePage() {
  const [pairings, setPairings] = useState([]);
  const [query, setQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPairings(JSON.parse(raw));
    } catch {}
  }, []);

  const deletePairing = useCallback((id) => {
    setPairings(prev => {
      const next = prev.filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const filtered = pairings.filter(p => {
    const q = query.toLowerCase();
    if (!q) return true;
    return (
      p.dish.toLowerCase().includes(q) ||
      p.wine.toLowerCase().includes(q) ||
      p.note.toLowerCase().includes(q)
    );
  });

  // Sort newest first
  const sorted = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <main>
      <div className="container">
        <header className="site-header">
          <div className="header-row">
            <div>
              <h1 className="site-title">
                Pairing<span> Notes</span>
              </h1>
              <p className="site-subtitle">A sommelier's cellar book</p>
            </div>
            <Link href="/add" className="btn btn-primary">
              + Add Pairing
            </Link>
          </div>
        </header>

        {mounted && (
          <>
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

            {sorted.length > 0 ? (
              <>
                <p className="pairings-meta">
                  {sorted.length} {sorted.length === 1 ? 'pairing' : 'pairings'}
                  {query && ` · filtered`}
                </p>
                <ul className="pairings-list">
                  {sorted.map((p, i) => (
                    <li
                      key={p.id}
                      className="pairing-card"
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <div className="card-header">
                        <h2 className="pairing-dish">
                          {highlight(p.dish, query)}
                        </h2>
                        <button
                          className="btn btn-danger"
                          onClick={() => deletePairing(p.id)}
                          title="Delete pairing"
                        >
                          Remove
                        </button>
                      </div>
                      <p className="pairing-wine">
                        {highlight(p.wine, query)}
                      </p>
                      {p.note && (
                        <p className="pairing-note">
                          {highlight(p.note, query)}
                        </p>
                      )}
                      <p className="pairing-time">{formatDate(p.createdAt)}</p>
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
          </>
        )}

        <footer className="site-footer">
          <p>Pairing Notes · Stored locally in your browser</p>
        </footer>
      </div>
    </main>
  );
}
