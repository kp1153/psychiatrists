"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { MEDICINES_BY_CONDITION, CONDITIONS } from "@/lib/medicines";
import BottomNav from "@/components/BottomNav";

const MEDICINE_TIMINGS = ["Morning", "Afternoon", "Evening", "Night"];
const DURATIONS = ["3 days", "5 days", "7 days", "10 days", "14 days", "1 month", "2 months"];

export default function DoctorPrescriptionPage() {
  const { id } = useParams();
  const router = useRouter();
  const printRef = useRef();

  const [prescription, setPrescription] = useState(null);
  const [patient, setPatient] = useState(null);
  const [tests, setTests] = useState("");
  const [notes, setNotes] = useState("");
  const [medicines, setMedicines] = useState([{ name: "", dose: "", timing: [], duration: "7 days" }]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState("");
  const [showPicker, setShowPicker] = useState(false);

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

      const qRes = await fetch(`/api/prescriptions?patient_id=${data.patient_id}`);
      if (!qRes.ok) {
        if (qRes.status === 401) { window.location.href = "/login"; return; }
        if (qRes.status === 403) { window.location.href = "/expired"; return; }
        return;
      }
      const qData = await qRes.json();
      if (qData.length > 0) setPatient({ name: qData[0].patient_name, phone: qData[0].patient_phone });

      if (data.medicines && data.medicines !== "") {
        try { setMedicines(JSON.parse(data.medicines)); } catch {}
      }
      if (data.tests) setTests(data.tests);
      if (data.notes) setNotes(data.notes);
    }
    load();
  }, [id]);

  function addMedicine() {
    setMedicines((prev) => [...prev, { name: "", dose: "", timing: [], duration: "7 days" }]);
  }

  function updateMedicine(index, field, value) {
    setMedicines((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  }

  function toggleTiming(index, timing) {
    setMedicines((prev) =>
      prev.map((m, i) => {
        if (i !== index) return m;
        const exists = m.timing.includes(timing);
        return { ...m, timing: exists ? m.timing.filter((t) => t !== timing) : [...m.timing, timing] };
      })
    );
  }

  function removeMedicine(index) {
    setMedicines((prev) => prev.filter((_, i) => i !== index));
  }

  function addFromPicker(med) {
    const displayName = `${med.name} (${med.brand.split(",")[0].trim()})`;
    const newEntry = { name: displayName, dose: med.dose, timing: [], duration: "7 days" };
    setMedicines((prev) => {
      if (prev.length === 1 && !prev[0].name && !prev[0].dose && prev[0].timing.length === 0) {
        return [newEntry];
      }
      return [...prev, newEntry];
    });
  }

  async function handleSave(andPrint = false) {
    setSaving(true);
    const res = await fetch(`/api/prescriptions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tests,
        medicines: JSON.stringify(medicines),
        notes,
        status: "doctor_done",
      }),
    });
    setSaving(false);
    if (!res.ok) {
      if (res.status === 401) { window.location.href = "/login"; return; }
      if (res.status === 403) { window.location.href = "/expired"; return; }
      return;
    }
    setSaved(true);
    if (andPrint) window.print();
  }

  if (!prescription) return <p className="text-center mt-20 text-gray-400">Loading...</p>;

  const pickerList = selectedCondition ? (MEDICINES_BY_CONDITION[selectedCondition] || []) : [];

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-area { box-shadow: none !important; }
          body { background: white; }
        }
      `}</style>

      <main className="min-h-screen bg-emerald-50 p-4 pb-20 no-print" ref={printRef}>
        <div className="max-w-lg mx-auto">
          <button onClick={() => router.back()} className="no-print text-emerald-700 text-sm mb-4 mt-2 flex items-center gap-1">
            ← Back to Queue
          </button>

          <div className="bg-white rounded-2xl shadow p-4 mb-4 print-area">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-lg text-gray-800">{patient?.name}</p>
                <p className="text-sm text-gray-500">{patient?.phone}</p>
                {prescription.complaints && (
                  <p className="text-sm text-gray-600 mt-1">Complaints: {prescription.complaints}</p>
                )}
              </div>
              <span className="text-xs text-gray-400">Token #{prescription.id}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-4 mb-4">
            <label className="block font-semibold text-gray-700 mb-2">Tests / Investigations</label>
            <textarea
              value={tests}
              onChange={(e) => setTests(e.target.value)}
              placeholder="e.g. CBC, LFT, Blood sugar..."
              rows={2}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <div className="bg-white rounded-2xl shadow p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <label className="font-semibold text-gray-700">Quick Add by Condition</label>
              <button type="button" onClick={() => setShowPicker((p) => !p)} className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg font-semibold">
                {showPicker ? "Hide" : "Show"}
              </button>
            </div>

            {showPicker && (
              <>
                <select value={selectedCondition} onChange={(e) => setSelectedCondition(e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  <option value="">-- Select condition --</option>
                  {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>

                {selectedCondition && pickerList.length > 0 && (
                  <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
                    {pickerList.map((med, idx) => (
                      <button key={`${selectedCondition}-${idx}`} type="button" onClick={() => addFromPicker(med)} className="text-left border border-gray-200 rounded-lg px-3 py-2 hover:bg-indigo-50 active:scale-[0.98] transition">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-gray-800 truncate">{med.name}</p>
                            <p className="text-xs text-gray-500 truncate">{med.brand}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-semibold text-indigo-700">{med.dose}</p>
                            <p className="text-[10px] text-gray-400">{med.class}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {selectedCondition && pickerList.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-2">No medicines listed for this condition.</p>
                )}
              </>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <label className="font-semibold text-gray-700">Medicines</label>
              <button onClick={addMedicine} className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg font-semibold">+ Add</button>
            </div>

            <div className="flex flex-col gap-4">
              {medicines.map((med, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input type="text" value={med.name} onChange={(e) => updateMedicine(i, "name", e.target.value)} placeholder="Medicine name" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400" />
                    <input type="text" value={med.dose} onChange={(e) => updateMedicine(i, "dose", e.target.value)} placeholder="Dose" className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400" />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {MEDICINE_TIMINGS.map((t) => (
                      <button key={t} onClick={() => toggleTiming(i, t)} className={`text-xs px-2 py-1 rounded-full border transition ${med.timing.includes(t) ? "bg-emerald-500 text-white border-emerald-500" : "border-gray-300 text-gray-600"}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <select value={med.duration} onChange={(e) => updateMedicine(i, "duration", e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none">
                      {DURATIONS.map((d) => <option key={d}>{d}</option>)}
                    </select>
                    <button onClick={() => removeMedicine(i)} className="text-red-400 text-xs">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-4 mb-4">
            <label className="block font-semibold text-gray-700 mb-2">Doctor Notes / Advice</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Follow-up instructions, diet advice..." rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>

          {saved && (
            <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl p-3 mb-3 text-center">
              ✓ Prescription saved — visible in pharmacy queue
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 no-print">
            <button onClick={() => handleSave(false)} disabled={saving} className="bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-emerald-700 disabled:opacity-60 transition">
              {saving ? "Saving..." : "Save"}
            </button>
            <button onClick={() => handleSave(true)} disabled={saving} className="bg-gray-800 text-white py-3 rounded-xl font-semibold text-sm hover:bg-gray-900 disabled:opacity-60 transition">
              Save & Print
            </button>
          </div>
        </div>
      </main>

      <div className="hidden print:block p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Psychiatrist Clinic</h2>
          <p className="text-gray-500 text-sm">Prescription</p>
        </div>
        <div className="flex justify-between mb-4 text-sm">
          <div>
            <p><strong>Patient:</strong> {patient?.name}</p>
            <p><strong>Phone:</strong> {patient?.phone}</p>
          </div>
          <div className="text-right">
            <p><strong>Token:</strong> #{prescription.id}</p>
            <p><strong>Date:</strong> {prescription.visit_date?.slice(0, 10)}</p>
          </div>
        </div>
        {prescription.complaints && <p className="text-sm mb-3"><strong>Complaints:</strong> {prescription.complaints}</p>}
        {tests && <p className="text-sm mb-3"><strong>Tests:</strong> {tests}</p>}
        {medicines.length > 0 && (
          <div className="mb-3">
            <p className="font-semibold text-sm mb-1">Medicines:</p>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1">Medicine</th>
                  <th className="text-left py-1">Dose</th>
                  <th className="text-left py-1">Timing</th>
                  <th className="text-left py-1">Duration</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((m, i) => (
                  <tr key={i} className="border-b border-gray-200">
                    <td className="py-1">{m.name}</td>
                    <td className="py-1">{m.dose}</td>
                    <td className="py-1">{m.timing.join(", ")}</td>
                    <td className="py-1">{m.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {notes && <p className="text-sm mt-3"><strong>Notes:</strong> {notes}</p>}
        <div className="mt-10 text-right text-sm">
          <p>Doctor&apos;s Signature</p>
          <div className="mt-6 border-t border-gray-400 w-40 ml-auto"></div>
        </div>
      </div>
      <BottomNav role="doctor" />
    </>
  );
}