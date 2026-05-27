'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export default function AddPairingPage() {
  const router = useRouter();
  const [dish, setDish] = useState('');
  const [wine, setWine] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/');
    });
  }, []);

  const canSave = dish.trim() && wine.trim();

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError('');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/'); return; }

    const { error } = await supabase.from('pairings').insert({
      dish: dish.trim(),
      wine: wine.trim(),
      note: note.trim(),
      user_id: session.user.id,
    });

    if (error) {
      setError(error.message);
      setSaving(false);
    } else {
      router.push('/');
    }
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSave();
  };

  return (
    <main>
      <div className="container">
        <header className="site-header">
          <div className="page-header">
            <Link href="/" className="back-link">← Back to pairings</Link>
            <h1 className="page-title">New <em>Pairing</em></h1>
          </div>
        </header>

        <div className="pairing-form" onKeyDown={handleKeyDown}>
          <div className="field-group">
            <label className="field-label" htmlFor="dish">Dish</label>
            <input id="dish" className="field-input" type="text"
              placeholder="e.g. Roasted lamb rack"
              value={dish} onChange={e => setDish(e.target.value)}
              autoFocus autoComplete="off" />
          </div>
          <div className="field-group">
            <label className="field-label" htmlFor="wine">Wine</label>
            <input id="wine" className="field-input" type="text"
              placeholder="e.g. 2018 Château Pichon Lalande"
              value={wine} onChange={e => setWine(e.target.value)}
              autoComplete="off" />
          </div>
          <div className="field-group">
            <label className="field-label" htmlFor="note">Tasting Note</label>
            <textarea id="note" className="field-textarea"
              placeholder="e.g. Earthy tannins cut through the richness of the lamb beautifully…"
              value={note} onChange={e => setNote(e.target.value)} rows={3} />
          </div>

          {error && (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#c47070' }}>{error}</p>
          )}

          <div className="form-actions">
            <button className="btn btn-primary" onClick={handleSave} disabled={!canSave || saving}>
              {saving ? 'Saving…' : 'Save Pairing'}
            </button>
            <Link href="/" className="btn btn-ghost">Cancel</Link>
            <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.14em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              ⌘↵ to save
            </span>
          </div>
        </div>

        <footer className="site-footer">
          <p>Pairing Notes · Your notes stay on your device</p>
        </footer>
      </div>
    </main>
  );
}
