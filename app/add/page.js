'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const STORAGE_KEY = 'pairing-notes-v1';

export default function AddPairingPage() {
  const router = useRouter();
  const [dish, setDish] = useState('');
  const [wine, setWine] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const canSave = dish.trim() && wine.trim();

  const handleSave = () => {
    if (!canSave) return;

    setSaving(true);

    const newPairing = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      dish: dish.trim(),
      wine: wine.trim(),
      note: note.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const existing = raw ? JSON.parse(raw) : [];
      const updated = [newPairing, ...existing];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    setTimeout(() => router.push('/'), 120);
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <main>
      <div className="container">
        <header className="site-header">
          <div className="page-header">
            <Link href="/" className="back-link">
              ← Back to pairings
            </Link>
            <h1 className="page-title">
              New <em>Pairing</em>
            </h1>
          </div>
        </header>

        <div className="pairing-form" onKeyDown={handleKeyDown}>
          <div className="field-group">
            <label className="field-label" htmlFor="dish">Dish</label>
            <input
              id="dish"
              className="field-input"
              type="text"
              placeholder="e.g. Roasted lamb rack"
              value={dish}
              onChange={e => setDish(e.target.value)}
              autoFocus
              autoComplete="off"
            />
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="wine">Wine</label>
            <input
              id="wine"
              className="field-input"
              type="text"
              placeholder="e.g. 2018 Château Pichon Lalande"
              value={wine}
              onChange={e => setWine(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="note">Tasting Note</label>
            <textarea
              id="note"
              className="field-textarea"
              placeholder="e.g. Earthy tannins cut through the richness of the lamb beautifully…"
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={!canSave || saving}
            >
              {saving ? 'Saving…' : 'Save Pairing'}
            </button>
            <Link href="/" className="btn btn-ghost">
              Cancel
            </Link>
            <span style={{
              marginLeft: 'auto',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.62rem',
              letterSpacing: '0.14em',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
            }}>
              ⌘↵ to save
            </span>
          </div>
        </div>

        <footer className="site-footer">
          <p>Pairing Notes · Stored locally in your browser</p>
        </footer>
      </div>
    </main>
  );
}
