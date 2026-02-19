'use client';

import { useState } from 'react';
import { RefreshCw, X } from 'lucide-react';

type Status = 'idle' | 'confirm' | 'loading' | 'success' | 'error';

export function UpdateButton() {
  const [status, setStatus] = useState<Status>('idle');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/webhook/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setStatus('success');
        setPassword('');
      } else {
        setErrorMsg('Falsches Passwort.');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Server nicht erreichbar.');
      setStatus('error');
    }
  };

  const reset = () => { setStatus('idle'); setPassword(''); setErrorMsg(''); };

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
        <RefreshCw size={13} className="animate-spin" />
        Update läuft… Seite in ~2 Min. neu laden.
        <button onClick={reset} className="ml-1 text-green-400 hover:text-green-600"><X size={12} /></button>
      </div>
    );
  }

  if (status === 'confirm' || status === 'loading' || status === 'error') {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="password"
          placeholder="Passwort…"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoFocus
          className="text-xs px-2 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 w-32 focus:outline-none focus:border-slate-500"
        />
        <button
          type="submit"
          disabled={status === 'loading' || !password}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-white transition disabled:opacity-50"
        >
          <RefreshCw size={12} className={status === 'loading' ? 'animate-spin' : ''} />
          {status === 'loading' ? 'Läuft…' : 'Update'}
        </button>
        <button type="button" onClick={reset} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
        {status === 'error' && <span className="text-xs text-red-500">{errorMsg}</span>}
      </form>
    );
  }

  // idle
  return (
    <button
      onClick={() => setStatus('confirm')}
      title="App aktualisieren"
      className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-300 transition"
    >
      <RefreshCw size={13} />
      <span className="hidden sm:inline">Update</span>
    </button>
  );
}
