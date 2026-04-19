'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PharmacyLoginPage() {
  const router = useRouter();
  const [clinicId, setClinicId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!clinicId || pin.length !== 4) {
      setError('Enter clinic ID and 4-digit PIN');
      return;
    }
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clinic_id: clinicId, pin, role: 'pharmacy' }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      router.push('/pharmacy');
    } else {
      setError(data.error || 'Login failed');
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-start pt-20 bg-orange-50 p-6">
      <div className="bg-white rounded-3xl shadow p-8 w-full max-w-sm flex flex-col gap-5">
        <div className="text-center">
          <h1 className="text-xl font-bold text-orange-800">Pharmacy Login</h1>
          <p className="text-gray-400 text-sm mt-1">Doctor से Clinic ID लो</p>
        </div>
        <div>
          <input
            type="number"
            value={clinicId}
            onChange={e => setClinicId(e.target.value)}
            placeholder="Clinic ID"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <p className="text-xs text-gray-400 mt-1 ml-1">Doctor Settings → Clinic ID देखो</p>
        </div>
        <input
          type="password"
          value={pin}
          onChange={e => setPin(e.target.value)}
          placeholder="4-digit PIN"
          maxLength={4}
          inputMode="numeric"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button onClick={handleLogin} disabled={loading}
          className="bg-orange-500 text-white py-3 rounded-2xl font-semibold text-base hover:bg-orange-600 disabled:opacity-60 transition">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </main>
  );
}