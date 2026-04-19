'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';

export default function WalkInPage() {
  const router = useRouter();

  const [brandsMap, setBrandsMap] = useState({});
  const [clinicInfo, setClinicInfo] = useState(null);
  const [loadingInit, setLoadingInit] = useState(true);

  // Patient (optional)
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');

  // Medicine rows
  const [medicines, setMedicines] = useState([
    { salt: '', brand: '', qty: '1', price: '' },
  ]);

  // UI states
  const [saving, setSaving] = useState(false);
  const [printMode, setPrintMode] = useState(false);
  const [billDate] = useState(new Date().toISOString());

  useEffect(() => {
    async function load() {
      const [brandsRes, settingsRes] = await Promise.all([
        fetch('/api/brands'),
        fetch('/api/settings'),
      ]);
      if (brandsRes.status === 401 || settingsRes.status === 401) {
        window.location.href = '/login';
        return;
      }
      const brandsData = brandsRes.ok ? await brandsRes.json() : { brands: {} };
      const settingsData = settingsRes.ok ? await settingsRes.json() : {};
      setBrandsMap(brandsData.brands || {});
      setClinicInfo(settingsData);
      setLoadingInit(false);
    }
    load();
  }, []);

  // When salt changes → auto-fill brand + price from brandsMap
  function handleSaltChange(i, value) {
    setMedicines((prev) =>
      prev.map((m, idx) => {
        if (idx !== i) return m;
        const mapped = brandsMap[value] || {};
        return {
          ...m,
          salt: value,
          brand: mapped.brand || m.brand,
          price: mapped.price || m.price,
        };
      })
    );
  }

  function updateField(i, field, value) {
    setMedicines((prev) =>
      prev.map((m, idx) => (idx === i ? { ...m, [field]: value } : m))
    );
  }

  function addRow() {
    setMedicines((prev) => [...prev, { salt: '', brand: '', qty: '1', price: '' }]);
  }

  function removeRow(i) {
    setMedicines((prev) => prev.filter((_, idx) => idx !== i));
  }

  const total = useMemo(() => {
    return medicines.reduce((sum, m) => {
      const p = parseFloat(m.price) || 0;
      const q = parseFloat(m.qty) || 1;
      return sum + p * q;
    }, 0);
  }, [medicines]);

  function handlePrint() {
    setPrintMode(true);
    setTimeout(() => window.print(), 200);
  }

  if (loadingInit)
    return <p className="text-center mt-20 text-gray-400">Loading...</p>;

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
        }
        @media screen {
          .print-only { display: none !important; }
        }
      `}</style>

      {/* ── SCREEN UI ── */}
      <main className="min-h-screen bg-orange-50 p-4 pb-28 no-print">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => router.back()}
            className="text-orange-700 text-sm mb-4 mt-2 flex items-center gap-1"
          >
            ← Back
          </button>

          <h1 className="text-2xl font-bold text-orange-800 mb-4">Walk-in Sale 🛒</h1>

          {/* Patient details (optional) */}
          <div className="bg-white rounded-2xl shadow p-4 mb-4 flex flex-col gap-3">
            <p className="font-semibold text-gray-700 text-sm">Patient Details <span className="text-gray-400 font-normal">(optional)</span></p>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Patient name"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <input
              type="tel"
              value={patientPhone}
              onChange={(e) => setPatientPhone(e.target.value)}
              placeholder="Phone number"
              inputMode="tel"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Medicines */}
          <div className="bg-white rounded-2xl shadow p-4 mb-4">
            <p className="font-semibold text-gray-700 mb-3">Medicines</p>

            <div className="flex flex-col gap-4">
              {medicines.map((med, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-semibold text-gray-500">Item {i + 1}</p>
                    {medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRow(i)}
                        className="text-xs text-red-400"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Salt — autocomplete from brandsMap keys */}
                  <div>
                    <label className="text-[10px] text-gray-400">Salt / Generic name</label>
                    <input
                      list={`salts-${i}`}
                      type="text"
                      value={med.salt}
                      onChange={(e) => handleSaltChange(i, e.target.value)}
                      placeholder="e.g. Olanzapine 5mg"
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
                    />
                    <datalist id={`salts-${i}`}>
                      {Object.keys(brandsMap).map((s) => (
                        <option key={s} value={s} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400">Brand name</label>
                    <input
                      type="text"
                      value={med.brand}
                      onChange={(e) => updateField(i, 'brand', e.target.value)}
                      placeholder="e.g. Oleanz 5"
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
                    />
                  </div>

                  <div className="flex gap-2">
                    <div className="w-24">
                      <label className="text-[10px] text-gray-400">Qty</label>
                      <input
                        type="text"
                        value={med.qty}
                        onChange={(e) => updateField(i, 'qty', e.target.value)}
                        inputMode="decimal"
                        placeholder="1"
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-400">₹ Price (per unit)</label>
                      <input
                        type="text"
                        value={med.price}
                        onChange={(e) => updateField(i, 'price', e.target.value)}
                        inputMode="decimal"
                        placeholder="0"
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
                      />
                    </div>
                    <div className="w-24 flex flex-col justify-end">
                      <label className="text-[10px] text-gray-400">Amount</label>
                      <p className="border border-gray-100 bg-gray-50 rounded-lg px-2 py-1.5 text-sm text-right font-semibold text-emerald-700">
                        ₹{((parseFloat(med.price) || 0) * (parseFloat(med.qty) || 1)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addRow}
              className="mt-3 w-full border-2 border-dashed border-orange-300 text-orange-600 py-2 rounded-xl text-sm font-semibold"
            >
              + Add Medicine
            </button>

            {medicines.length > 0 && (
              <div className="mt-4 flex justify-between items-center border-t pt-3">
                <p className="font-semibold text-gray-700">Total</p>
                <p className="text-xl font-bold text-emerald-700">₹ {total.toFixed(2)}</p>
              </div>
            )}
          </div>

          {/* Print button */}
          <button
            onClick={handlePrint}
            className="w-full bg-gray-800 text-white py-3 rounded-2xl font-semibold text-base"
          >
            🖨️ Print Bill
          </button>
        </div>
      </main>

      {/* ── PRINT LAYOUT ── */}
      <div className="print-only p-6">
        {/* Letterhead */}
        <div className="flex items-start justify-between mb-4 border-b-2 border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            {clinicInfo?.clinic_logo && (
              <img
                src={clinicInfo.clinic_logo}
                alt="logo"
                className="h-16 w-16 object-contain"
              />
            )}
            <div>
              <p className="text-xl font-bold text-gray-900">{clinicInfo?.name || 'Clinic'}</p>
              {clinicInfo?.doctor_name && (
                <p className="text-sm font-semibold text-gray-700">{clinicInfo.doctor_name}</p>
              )}
              {clinicInfo?.qualification && (
                <p className="text-xs text-gray-500">{clinicInfo.qualification}</p>
              )}
              {clinicInfo?.clinic_address && (
                <p className="text-xs text-gray-500">{clinicInfo.clinic_address}</p>
              )}
              {clinicInfo?.clinic_phone && (
                <p className="text-xs text-gray-500">📞 {clinicInfo.clinic_phone}</p>
              )}
            </div>
          </div>
          <div className="text-right text-xs text-gray-500">
            <p className="font-bold text-base text-gray-800">WALK-IN BILL</p>
            <p>{new Date(billDate).toLocaleDateString('en-IN')}</p>
            <p>{new Date(billDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>

        {/* Patient */}
        {(patientName || patientPhone) && (
          <div className="mb-4 text-sm">
            {patientName && <p><strong>Patient:</strong> {patientName}</p>}
            {patientPhone && <p><strong>Phone:</strong> {patientPhone}</p>}
          </div>
        )}

        {/* Table */}
        <table className="w-full text-sm border-collapse mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left border border-gray-300 px-2 py-1.5">#</th>
              <th className="text-left border border-gray-300 px-2 py-1.5">Brand / Salt</th>
              <th className="text-right border border-gray-300 px-2 py-1.5">Qty</th>
              <th className="text-right border border-gray-300 px-2 py-1.5">Price</th>
              <th className="text-right border border-gray-300 px-2 py-1.5">Amount</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((m, i) => (
              <tr key={i} className="border-b border-gray-200">
                <td className="border border-gray-300 px-2 py-1">{i + 1}</td>
                <td className="border border-gray-300 px-2 py-1">
                  <p className="font-medium">{m.brand || m.salt || '—'}</p>
                  {m.brand && m.salt && (
                    <p className="text-xs text-gray-400">({m.salt})</p>
                  )}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-right">{m.qty || 1}</td>
                <td className="border border-gray-300 px-2 py-1 text-right">₹{m.price || 0}</td>
                <td className="border border-gray-300 px-2 py-1 text-right font-semibold">
                  ₹{((parseFloat(m.price) || 0) * (parseFloat(m.qty) || 1)).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50">
              <td colSpan={4} className="border border-gray-300 px-2 py-2 text-right font-bold">
                Total
              </td>
              <td className="border border-gray-300 px-2 py-2 text-right font-bold text-emerald-700">
                ₹{total.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>

        <p className="text-xs text-gray-400 text-center mt-6">
          Thank you · {clinicInfo?.name}
        </p>
      </div>

      <BottomNav role="pharmacy" />
    </>
  );
}