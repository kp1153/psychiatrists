'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function PharmacyPrescriptionPage() {
  const { id } = useParams();
  const router = useRouter();

  const [prescription, setPrescription] = useState(null);
  const [patient, setPatient] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [dispensed, setDispensed] = useState([]);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/prescriptions/${id}`);
      const data = await res.json();
      setPrescription(data);
      if (data.status === 'dispensed') setDone(true);

      const qRes = await fetch(`/api/prescriptions?patient_id=${data.patient_id}`);
      const qData = await qRes.json();
      if (qData.length > 0) setPatient({ name: qData[0].patient_name, phone: qData[0].patient_phone });

      if (data.medicines && data.medicines !== '') {
        try {
          const meds = JSON.parse(data.medicines);
          setMedicines(meds);
          setDispensed(meds.map(() => false));
        } catch {}
      }
    }
    load();
  }, [id]);

  function toggleDispensed(i) {
    setDispensed(prev => prev.map((v, idx) => idx === i ? !v : v));
  }

  async function markDone() {
    setSaving(true);
    await fetch(`/api/prescriptions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'dispensed' }),
    });
    setSaving(false);
    setDone(true);
  }

  if (!prescription) return <p className="text-center mt-20 text-gray-400">Loading...</p>;

  return (
    <main className="min-h-screen bg-orange-50 p-4 pb-20">
      <div className="max-w-lg mx-auto">
        <button onClick={() => router.back()} className="text-orange-700 text-sm mb-4 mt-2 flex items-center gap-1">
          ← Back
        </button>

        <div className="bg-white rounded-2xl shadow p-4 mb-4">
          <div className="flex justify-between">
            <div>
              <p className="font-bold text-lg text-gray-800">{patient?.name}</p>
              <p className="text-sm text-gray-500">{patient?.phone}</p>
            </div>
            <span className="text-xs text-gray-400">Token #{prescription.id}</span>
          </div>
          {prescription.complaints && (
            <p className="text-sm text-gray-600 mt-2">Complaints: {prescription.complaints}</p>
          )}
          {prescription.tests && (
            <p className="text-sm text-gray-600 mt-1">Tests: {prescription.tests}</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow p-4 mb-4">
          <p className="font-semibold text-gray-700 mb-3">Medicines to Dispense</p>
          <div className="flex flex-col gap-3">
            {medicines.map((m, i) => (
              <div key={i}
                onClick={() => !done && toggleDispensed(i)}
                className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer
                  ${dispensed[i] ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
                <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex-shrink-0 transition
                  ${dispensed[i] ? 'bg-green-500 border-green-500' : 'border-gray-300'}`} />
                <div>
                  <p className="font-semibold text-sm text-gray-800">{m.name} {m.dose && `— ${m.dose}`}</p>
                  <p className="text-xs text-gray-500">
                    {m.timing?.join(', ')}{m.duration ? ` · ${m.duration}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {prescription.notes && (
          <div className="bg-white rounded-2xl shadow p-4 mb-4">
            <p className="font-semibold text-gray-700 mb-1">Doctor Notes</p>
            <p className="text-sm text-gray-600">{prescription.notes}</p>
          </div>
        )}

        {done ? (
          <div className="bg-green-50 border border-green-200 text-green-800 text-center rounded-xl p-4 font-semibold">
            ✓ Medicines Dispensed
          </div>
        ) : (
          <button onClick={markDone} disabled={saving}
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold text-base hover:bg-orange-600 disabled:opacity-60 transition">
            {saving ? 'Saving...' : 'Mark as Dispensed'}
          </button>
        )}
      </div>
    </main>
  );
}