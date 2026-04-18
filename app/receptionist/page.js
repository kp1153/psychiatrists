'use client';
import { useState } from 'react';
import BottomNav from '@/components/BottomNav';

export default function ReceptionistPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [complaints, setComplaints] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

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
      const patient = await patientRes.json();

      const prescRes = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: patient.id, complaints: complaints.trim() }),
      });
      const prescription = await prescRes.json();

      setSuccess({ patient, prescription });
      setName('');
      setPhone('');
      setComplaints('');
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
              <label className="block text-sm font-semibold text-gray-600 mb-1">Mobile Number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                maxLength={10}
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
                <p className="text-xs text-gray-500 mt-1">Prescription sent to doctor queue</p>
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