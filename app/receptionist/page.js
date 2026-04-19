'use client';
import { useState, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';

export default function ReceptionistPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [complaints, setComplaints] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');
  const [lookup, setLookup] = useState(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!/^\d{10}$/.test(phone)) {
      setLookup(null);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/patients?phone=${phone}`);
        if (cancelled) return;
        if (res.ok) {
          const arr = await res.json();
          if (arr.length > 0) {
            setLookup(arr[0]);
            setName((prev) => prev || arr[0].name);
          } else {
            setLookup(null);
          }
        }
      } catch {}
      finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [phone]);

  async function handleSubmit() {
    if (!name.trim() || !phone.trim()) {
      setError('Name and phone are required');
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      setError('Phone must be 10 digits');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(null);

    try {
      const patientRes = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      });
      if (!patientRes.ok) {
        if (patientRes.status === 401) { window.location.href = '/login'; return; }
        if (patientRes.status === 403) { window.location.href = '/expired'; return; }
        setError('Failed to register patient');
        return;
      }
      const patient = await patientRes.json();

      const prescRes = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: patient.id, complaints: complaints.trim() }),
      });
      if (!prescRes.ok) {
        if (prescRes.status === 401) { window.location.href = '/login'; return; }
        if (prescRes.status === 403) { window.location.href = '/expired'; return; }
        setError('Failed to create prescription');
        return;
      }
      const prescription = await prescRes.json();

      setSuccess({ patient, prescription, isReturning: !!lookup });
      setName('');
      setPhone('');
      setComplaints('');
      setLookup(null);
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <main className="min-h-screen bg-indigo-50 p-4 pb-16">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-indigo-800 mb-6 mt-4">New Patient Entry</h1>

          <div className="bg-white rounded-2xl shadow p-5 flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Mobile Number</label>
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit mobile number"
                maxLength={10}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              {searching && <p className="text-xs text-gray-400 mt-1">Searching...</p>}
              {lookup && !searching && (
                <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-xs text-emerald-800">
                  ✓ Returning patient: <strong>{lookup.name}</strong>
                </div>
              )}
              {!lookup && !searching && /^\d{10}$/.test(phone) && (
                <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-800">
                  New patient — enter name below
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Patient Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter full name"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Chief Complaints <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea
                value={complaints}
                onChange={e => setComplaints(e.target.value)}
                placeholder="e.g. anxiety, sleeplessness..."
                rows={3}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
                <p className="font-semibold">✓ Token #{success.prescription.id} created</p>
                <p>{success.patient.name} — {success.patient.phone}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {success.isReturning ? 'Returning patient — sent to doctor queue' : 'New patient — sent to doctor queue'}
                </p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-indigo-600 text-white py-3 rounded-xl font-semibold text-base hover:bg-indigo-700 active:scale-95 transition disabled:opacity-60"
            >
              {loading ? 'Registering...' : 'Register Patient'}
            </button>
          </div>
        </div>
      </main>
      <BottomNav role="receptionist" />
    </>
  );
}