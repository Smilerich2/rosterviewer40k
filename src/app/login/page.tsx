'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock } from 'lucide-react';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router   = useRouter();

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? 'Falsches Passwort.');
        setPassword('');
        inputRef.current?.focus();
      }
    } catch {
      setError('Server nicht erreichbar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(#374151 1px, transparent 1px), linear-gradient(90deg, #374151 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 shadow-lg mb-4">
            <Shield size={28} className="text-amber-400" />
          </div>
          <h1 className="font-cinzel text-2xl font-black tracking-widest text-slate-800 uppercase">
            Tactical <span className="text-amber-600">Viewer</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1 tracking-wider uppercase">Warhammer 40,000</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="flex items-center gap-2 mb-6">
            <Lock size={14} className="text-slate-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Zugang</span>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                Passwort
              </label>
              <input
                ref={inputRef}
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:border-slate-400 focus:bg-white transition placeholder-slate-300"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white font-bold text-sm tracking-wider uppercase transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Prüfe…' : 'Einloggen'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-300 text-xs mt-6 tracking-wider">
          TACTICAL VIEWER · FOR THE EMPEROR
        </p>
      </div>
    </div>
  );
}
