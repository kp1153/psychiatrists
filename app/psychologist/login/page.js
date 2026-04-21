'use client';
import { useState } from 'react';

export default function PsychologistLoginPage() {
  const [clinicId, setClinicId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!clinicId || pin.length !== 4) {
      setError('Enter Clinic ID and 4-digit PIN');
      return;
    }
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clinic_id: clinicId, pin, role: 'psychologist' }),
    });
    setLoading(false);
    if (res.ok) {
      window.location.href = '/psychologist';
    } else {
      const data = await res.json();
      setError(data.error || 'Login failed');
    }
  }

  return (
    <main className="min-h-screen bg-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow p-6 w-full max-w-sm flex flex-col gap-4">
        <div className="text-center">
          <div className="text-4xl mb-2">🧠</div>
          <h1 className="text-xl font-bold text-purple-800">Psychologist Login</h1>
          <p className="text-xs text-gray-400 mt-1">Enter your clinic ID and PIN</p>
        </div>

        <div>
          <label className="text-xs text-gray-500">Clinic ID</label>
          <input
            type="number"
            value={clinicId}
            onChange={e => setClinicId(e.target.value)}
            placeholder="e.g. 101"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500">PIN</label>
          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            maxLength={4}
            placeholder="4-digit PIN"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-purple-600 text-white py-3 rounded-xl font-semibold text-base hover:bg-purple-700 active:scale-95 transition disabled:opacity-60"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </main>
  );
}