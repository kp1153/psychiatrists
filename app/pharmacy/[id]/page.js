"use client";
import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";

export default function PharmacyPrescriptionPage() {
  const { id } = useParams();
  const router = useRouter();

  const [prescription, setPrescription] = useState(null);
  const [patient, setPatient] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/prescriptions/${id}`);
      if (!res.ok) {
        if (res.status === 401) { window.location.href = "/login"; return; }
        if (res.status === 403) { window.location.href = "/expired"; return; }
        return;
      }
      const data = await res.json();
      setPrescription(data);
      if (data.status === "dispensed") setDone(true);

      const qRes = await fetch(`/api/prescriptions?patient_id=${data.patient_id}`);
      if (!qRes.ok) {
        if (qRes.status === 401) { window.location.href = "/login"; return; }
        if (qRes.status === 403) { window.location.href = "/expired"; return; }
        return;
      }
      const qData = await qRes.json();
      if (qData.length > 0) setPatient({ name: qData[0].patient_name, phone: qData[0].patient_phone });

      if (data.medicines && data.medicines !== "") {
        try {
          const meds = JSON.parse(data.medicines);
          setMedicines(meds.map((m) => ({
            name: m.name || "",
            dose: m.dose || "",
            timing: Array.isArray(m.timing) ? m.timing : [],
            duration: m.duration || "",
            food: m.food || "After food",
            brand: m.brand || "",
            qty: m.qty || "",
            price: m.price || "",
            dispensed: m.dispensed || false,
          })));
        } catch {}
      }
    }
    load();
  }, [id]);

  function updateField(i, field, value) {
    setMedicines((prev) => prev.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)));
  }

  function toggleDispensed(i) {
    setMedicines((prev) => prev.map((m, idx) => (idx === i ? { ...m, dispensed: !m.dispensed } : m)));
  }

  const total = useMemo(() => {
    let sum = 0;
    for (const m of medicines) {
      const q = parseFloat(m.qty) || 0;
      const p = parseFloat(m.price) || 0;
      sum += q * p;
    }
    return sum;
  }, [medicines]);

  async function markDone() {
    setSaving(true);
    const res = await fetch(`/api/prescriptions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "dispensed",
        medicines: JSON.stringify(medicines),
      }),
    });
    setSaving(false);
    if (!res.ok) {
      if (res.status === 401) { window.location.href = "/login"; return; }
      if (res.status === 403) { window.location.href = "/expired"; return; }
      return;
    }
    setDone(true);
  }

  function printBill() {
    window.print();
  }

  if (!prescription) return <p className="text-center mt-20 text-gray-400">Loading...</p>;

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
        }
      `}</style>

      <main className="min-h-screen bg-orange-50 p-4 pb-24 no-print">
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
            <p className="font-semibold text-gray-700 mb-3">Medicines</p>
            <div className="flex flex-col gap-3">
              {medicines.map((m, i) => (
                <div key={i} className={`p-3 rounded-xl border transition ${m.dispensed ? "bg-green-50 border-green-300" : "bg-gray-50 border-gray-200"}`}>
                  <div className="flex items-start gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => !done && toggleDispensed(i)}
                      className={`w-5 h-5 rounded-full border-2 mt-0.5 flex-shrink-0 transition ${m.dispensed ? "bg-green-500 border-green-500" : "border-gray-300"}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800">
                        {m.name} {m.dose && `— ${m.dose}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {m.timing?.join(", ") || "—"}
                        {m.food ? ` · ${m.food}` : ""}
                        {m.duration ? ` · ${m.duration}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="text-[10px] text-gray-500">Brand dispensed</label>
                    <input
                      type="text"
                      value={m.brand}
                      onChange={(e) => updateField(i, "brand", e.target.value)}
                      disabled={done}
                      placeholder="e.g. Nexito 10 / Zoloft / Rivotril"
                      className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400 disabled:bg-gray-100"
                    />
                  </div>

                  <div className="flex gap-2 mt-2">
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-500">Qty</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={m.qty}
                        onChange={(e) => updateField(i, "qty", e.target.value)}
                        disabled={done}
                        placeholder="e.g. 10"
                        className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400 disabled:bg-gray-100"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-500">Price (₹)</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={m.price}
                        onChange={(e) => updateField(i, "price", e.target.value)}
                        disabled={done}
                        placeholder="Per unit"
                        className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400 disabled:bg-gray-100"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-500">Subtotal</label>
                      <div className="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white font-semibold text-gray-700">
                        ₹{((parseFloat(m.qty) || 0) * (parseFloat(m.price) || 0)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 mt-4 pt-3 flex justify-between items-center">
              <span className="font-semibold text-gray-700">Total</span>
              <span className="text-xl font-bold text-orange-600">₹{total.toFixed(2)}</span>
            </div>
          </div>

          {prescription.notes && (
            <div className="bg-white rounded-2xl shadow p-4 mb-4">
              <p className="font-semibold text-gray-700 mb-1">Doctor Notes</p>
              <p className="text-sm text-gray-600">{prescription.notes}</p>
            </div>
          )}

          {done ? (
            <div className="flex flex-col gap-3">
              <div className="bg-green-50 border border-green-200 text-green-800 text-center rounded-xl p-4 font-semibold">
                ✓ Medicines Dispensed
              </div>
              <button
                onClick={printBill}
                className="w-full bg-gray-800 text-white py-3 rounded-xl font-semibold text-base hover:bg-gray-900 transition"
              >
                Print Bill
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={markDone}
                disabled={saving}
                className="bg-orange-500 text-white py-3 rounded-xl font-semibold text-sm hover:bg-orange-600 disabled:opacity-60 transition"
              >
                {saving ? "Saving..." : "Mark Dispensed"}
              </button>
              <button
                onClick={printBill}
                className="bg-gray-800 text-white py-3 rounded-xl font-semibold text-sm hover:bg-gray-900 transition"
              >
                Print Bill
              </button>
            </div>
          )}
        </div>
      </main>

      <div className="hidden print:block p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Pharmacy Bill</h2>
          <p className="text-gray-500 text-sm">Psychiatrist Clinic</p>
        </div>
        <div className="flex justify-between mb-4 text-sm">
          <div>
            <p><strong>Patient:</strong> {patient?.name}</p>
            <p><strong>Phone:</strong> {patient?.phone}</p>
          </div>
          <div className="text-right">
            <p><strong>Token:</strong> #{prescription.id}</p>
            <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <table className="w-full text-sm border-collapse mt-4">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="text-left py-2">#</th>
              <th className="text-left py-2">Salt</th>
              <th className="text-left py-2">Brand</th>
              <th className="text-left py-2">Dose</th>
              <th className="text-right py-2">Qty</th>
              <th className="text-right py-2">Rate</th>
              <th className="text-right py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((m, i) => {
              const q = parseFloat(m.qty) || 0;
              const p = parseFloat(m.price) || 0;
              return (
                <tr key={i} className="border-b border-gray-300">
                  <td className="py-2">{i + 1}</td>
                  <td className="py-2">{m.name}</td>
                  <td className="py-2">{m.brand || "-"}</td>
                  <td className="py-2">{m.dose}</td>
                  <td className="text-right py-2">{m.qty || "-"}</td>
                  <td className="text-right py-2">{m.price ? `₹${p.toFixed(2)}` : "-"}</td>
                  <td className="text-right py-2">₹{(q * p).toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-black font-bold">
              <td colSpan={6} className="text-right py-2">Total</td>
              <td className="text-right py-2">₹{total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-12 text-right text-sm">
          <p>Pharmacist&apos;s Signature</p>
          <div className="mt-6 border-t border-gray-400 w-40 ml-auto"></div>
        </div>
      </div>
      <BottomNav role="pharmacy" />
    </>
  );
}