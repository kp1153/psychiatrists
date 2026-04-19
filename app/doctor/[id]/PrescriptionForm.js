"use client";
import { useState, useMemo } from "react";
import { MEDICINES_BY_CONDITION, CONDITIONS } from "@/lib/medicines";

const MEDICINE_TIMINGS = ["Morning", "Afternoon", "Evening", "Night", "HS", "SOS"];
const DURATIONS = ["3 days", "5 days", "7 days", "10 days", "14 days", "1 month", "2 months", "3 months"];
const FOOD_OPTIONS = ["After food", "Before food", "Empty stomach", "—"];

const MSE_DEFAULT = { appearance: "", mood: "", affect: "", thought: "", perception: "", cognition: "", insight: "", judgement: "" };
const MOOD_OPTIONS = ["Euthymic", "Depressed", "Elated", "Anxious", "Irritable", "Labile"];
const AFFECT_OPTIONS = ["Normal", "Blunted", "Flat", "Restricted", "Labile", "Inappropriate"];
const INSIGHT_OPTIONS = ["Grade I", "Grade II", "Grade III", "Grade IV", "Grade V", "Grade VI"];
const JUDGEMENT_OPTIONS = ["Intact", "Impaired", "Poor"];

function splitDoses(doseStr) {
  return (doseStr || "").split(",").map((s) => s.trim()).filter(Boolean);
}

function doseOptionsFor(medName) {
  const base = (medName || "").toLowerCase().trim();
  for (const cond of CONDITIONS) {
    const list = MEDICINES_BY_CONDITION[cond] || [];
    const hit = list.find((m) => m.name.toLowerCase() === base);
    if (hit) return splitDoses(hit.dose);
  }
  return [];
}

export default function PrescriptionForm({
  complaints, setComplaints,
  diagnosis, setDiagnosis,
  mse, setMse,
  tests, setTests,
  medicines, setMedicines,
  notes, setNotes,
  followupDate, setFollowupDate,
  history,
  saving, saved,
  onSave,
}) {
  const [showMSE, setShowMSE] = useState(false);
  const [showPicker, setShowPicker] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("All");
  const [expandedKey, setExpandedKey] = useState(null);

  function updateMSE(field, value) {
    setMse((prev) => ({ ...prev, [field]: value }));
  }

  function addMedicine() {
    setMedicines((prev) => [...prev, { name: "", dose: "", timing: [], duration: "7 days", food: "After food" }]);
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
    setMedicines((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length === 0 ? [{ name: "", dose: "", timing: [], duration: "7 days", food: "After food" }] : next;
    });
  }

  function addWithDose(med, chosenDose) {
    const newEntry = { name: med.name, dose: chosenDose, timing: [], duration: "7 days", food: "After food" };
    setMedicines((prev) => {
      const isEmptyFirst = prev.length === 1 && !prev[0].name && !prev[0].dose && prev[0].timing.length === 0;
      return isEmptyFirst ? [newEntry] : [...prev, newEntry];
    });
    setExpandedKey(null);
  }

  function quickFollowup(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setFollowupDate(d.toISOString().slice(0, 10));
  }

  const allMedicines = useMemo(() => {
    const arr = [];
    for (const cond of CONDITIONS) {
      for (const m of MEDICINES_BY_CONDITION[cond] || []) {
        arr.push({ ...m, condition: cond });
      }
    }
    return arr;
  }, []);

  const filteredPicker = useMemo(() => {
    let list = selectedCondition === "All"
      ? allMedicines
      : (MEDICINES_BY_CONDITION[selectedCondition] || []).map((m) => ({ ...m, condition: selectedCondition }));
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((m) => m.name.toLowerCase().includes(q) || (m.class || "").toLowerCase().includes(q));
    return list.slice(0, 80);
  }, [allMedicines, selectedCondition, search]);

  const addedNames = useMemo(() => {
    const s = new Set();
    for (const m of medicines) {
      if (m.name) s.add(m.name.toLowerCase().split(" ")[0]);
    }
    return s;
  }, [medicines]);

  const parseMeds = (raw) => {
    if (!raw) return [];
    try {
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.filter((m) => m.name) : [];
    } catch { return []; }
  };

  return (
    <div className="flex flex-col gap-4">

      {/* Complaints */}
      <div className="bg-white rounded-2xl shadow p-4">
        <label className="block font-semibold text-gray-700 mb-2">Chief Complaints</label>
        <textarea
          value={complaints}
          onChange={(e) => setComplaints(e.target.value)}
          placeholder="Patient complaints..."
          rows={2}
          className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      {/* Diagnosis */}
      <div className="bg-white rounded-2xl shadow p-4">
        <label className="block font-semibold text-gray-700 mb-2">Diagnosis</label>
        <input
          type="text"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          placeholder="e.g. F20 Schizophrenia, F32 Depression..."
          className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      {/* Previous Visits */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl shadow p-4">
          <p className="font-semibold text-gray-700 mb-3">Previous Visits ({history.length})</p>
          <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
            {history.map((v) => {
              const pastMeds = parseMeds(v.medicines);
              return (
                <div key={v.id} className="border border-gray-200 rounded-xl p-3 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{v.visit_date?.slice(0, 10)}</p>
                      {v.complaints && <p className="text-xs text-gray-600 mt-1"><strong>C/O:</strong> {v.complaints}</p>}
                      {v.diagnosis && <p className="text-xs text-gray-600"><strong>Dx:</strong> {v.diagnosis}</p>}
                    </div>
                    {pastMeds.length > 0 && (
                      <button type="button" onClick={() => setMedicines(pastMeds)}
                        className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg font-semibold shrink-0">
                        ↻ Repeat Rx
                      </button>
                    )}
                  </div>
                  {pastMeds.length > 0 && (
                    <table className="w-full text-xs mt-2">
                      <tbody>
                        {pastMeds.map((m, i) => (
                          <tr key={i} className="border-b border-gray-100 last:border-0">
                            <td className="py-1 pr-2 font-medium text-gray-700">{m.name}</td>
                            <td className="py-1 pr-2 text-indigo-700">{m.dose}</td>
                            <td className="py-1 pr-2 text-gray-600">{m.timing?.join("-") || "—"}</td>
                            <td className="py-1 text-gray-500">{m.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MSE */}
      <div className="bg-white rounded-2xl shadow p-4">
        <div className="flex justify-between items-center mb-2">
          <label className="font-semibold text-gray-700">Mental Status Examination</label>
          <button type="button" onClick={() => setShowMSE((p) => !p)}
            className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg font-semibold">
            {showMSE ? "Hide" : "Show"}
          </button>
        </div>
        {showMSE && (
          <div className="flex flex-col gap-3 mt-2">
            <div>
              <label className="text-xs text-gray-500">Appearance & Behaviour</label>
              <input type="text" value={mse.appearance} onChange={(e) => updateMSE("appearance", e.target.value)}
                placeholder="Well-kempt, cooperative..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Mood</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {MOOD_OPTIONS.map((m) => (
                  <button key={m} type="button" onClick={() => updateMSE("mood", mse.mood === m ? "" : m)}
                    className={`text-xs px-2 py-1 rounded-full border ${mse.mood === m ? "bg-emerald-500 text-white border-emerald-500" : "border-gray-300 text-gray-600"}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">Affect</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {AFFECT_OPTIONS.map((m) => (
                  <button key={m} type="button" onClick={() => updateMSE("affect", mse.affect === m ? "" : m)}
                    className={`text-xs px-2 py-1 rounded-full border ${mse.affect === m ? "bg-emerald-500 text-white border-emerald-500" : "border-gray-300 text-gray-600"}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">Thought</label>
              <input type="text" value={mse.thought} onChange={(e) => updateMSE("thought", e.target.value)}
                placeholder="Goal-directed, no delusions..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Perception</label>
              <input type="text" value={mse.perception} onChange={(e) => updateMSE("perception", e.target.value)}
                placeholder="No hallucinations..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Cognition</label>
              <input type="text" value={mse.cognition} onChange={(e) => updateMSE("cognition", e.target.value)}
                placeholder="Oriented x3..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500">Insight</label>
                <select value={mse.insight} onChange={(e) => updateMSE("insight", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none">
                  <option value="">—</option>
                  {INSIGHT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Judgement</label>
                <select value={mse.judgement} onChange={(e) => updateMSE("judgement", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none">
                  <option value="">—</option>
                  {JUDGEMENT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tests */}
      <div className="bg-white rounded-2xl shadow p-4">
        <label className="block font-semibold text-gray-700 mb-2">Tests / Investigations</label>
        <textarea value={tests} onChange={(e) => setTests(e.target.value)}
          placeholder="e.g. CBC, LFT, TSH..." rows={2}
          className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400" />
      </div>

      {/* Medicine Picker */}
      <div className="bg-white rounded-2xl shadow p-4">
        <div className="flex justify-between items-center mb-3">
          <label className="font-semibold text-gray-700">Add Medicine</label>
          <button type="button" onClick={() => setShowPicker((p) => !p)}
            className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg font-semibold">
            {showPicker ? "Hide" : "Show"}
          </button>
        </div>
        {showPicker && (
          <>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search salt or drug class..."
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            <div className="flex gap-1 overflow-x-auto mb-2 pb-1">
              <button type="button" onClick={() => setSelectedCondition("All")}
                className={`text-xs px-3 py-1 rounded-full whitespace-nowrap border ${selectedCondition === "All" ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-300 text-gray-600"}`}>
                All
              </button>
              {CONDITIONS.map((c) => (
                <button key={c} type="button" onClick={() => setSelectedCondition(c)}
                  className={`text-xs px-3 py-1 rounded-full whitespace-nowrap border ${selectedCondition === c ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-300 text-gray-600"}`}>
                  {c}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-500 mb-2">Tap medicine → choose dose</p>
            {(() => {
              const grouped = {};
              for (const med of filteredPicker) {
                const cls = med.class || "Other";
                if (!grouped[cls]) grouped[cls] = [];
                grouped[cls].push(med);
              }
              return (
                <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto">
                  {Object.keys(grouped).length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">No match.</p>
                  )}
                  {Object.keys(grouped).map((cls) => (
                    <div key={cls}>
                      <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide mb-1 sticky top-0 bg-white py-1">{cls}</p>
                      <div className="flex flex-col gap-2">
                        {grouped[cls].map((med, idx) => {
                          const key = `${med.condition}-${cls}-${med.name}-${idx}`;
                          const saltAdded = addedNames.has(med.name.toLowerCase().split(" ")[0]);
                          const isExpanded = expandedKey === key;
                          const doses = splitDoses(med.dose);
                          return (
                            <div key={key} className={`border rounded-lg transition ${saltAdded ? "bg-emerald-50 border-emerald-300" : isExpanded ? "bg-indigo-50 border-indigo-400" : "border-gray-200"}`}>
                              <button type="button" onClick={() => setExpandedKey(isExpanded ? null : key)} className="w-full text-left px-3 py-2">
                                <div className="flex justify-between items-start gap-2">
                                  <p className="font-semibold text-sm text-gray-800 truncate flex items-center gap-1">
                                    {saltAdded && <span className="text-emerald-600">✓</span>}
                                    {med.name}
                                  </p>
                                  <p className="text-[10px] text-gray-400 shrink-0">{med.condition}</p>
                                </div>
                              </button>
                              {isExpanded && doses.length > 0 && (
                                <div className="px-3 pb-3 pt-1 border-t border-indigo-200">
                                  <div className="flex flex-wrap gap-1">
                                    {doses.map((d) => (
                                      <button key={d} type="button" onClick={() => addWithDose(med, d)}
                                        className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-semibold">
                                        {d}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {isExpanded && doses.length === 0 && (
                                <div className="px-3 pb-3 pt-1 border-t border-indigo-200">
                                  <button type="button" onClick={() => addWithDose(med, "")}
                                    className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-semibold">Add</button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </>
        )}
      </div>

      {/* Prescription List */}
      <div className="bg-white rounded-2xl shadow p-4">
        <div className="flex justify-between items-center mb-3">
          <label className="font-semibold text-gray-700">Prescription ({medicines.filter((m) => m.name).length})</label>
          <button onClick={addMedicine} className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg font-semibold">+ Manual Add</button>
        </div>
        <div className="flex flex-col gap-4">
          {medicines.map((med, i) => {
            const doseOpts = doseOptionsFor(med.name);
            return (
              <div key={i} className="border border-gray-200 rounded-xl p-3 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-400">#{i + 1}</span>
                  <button onClick={() => removeMedicine(i)} className="text-red-400 text-xs">Remove</button>
                </div>
                <input type="text" value={med.name} onChange={(e) => updateMedicine(i, "name", e.target.value)}
                  placeholder="Salt name"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400" />
                <div className="flex gap-2">
                  {doseOpts.length > 0 && med.dose !== "__custom__" ? (
                    <select value={doseOpts.includes(med.dose) ? med.dose : ""}
                      onChange={(e) => updateMedicine(i, "dose", e.target.value)}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                      <option value="">Select dose</option>
                      {doseOpts.map((d) => <option key={d} value={d}>{d}</option>)}
                      <option value="__custom__">Custom...</option>
                    </select>
                  ) : (
                    <input type="text" value={med.dose === "__custom__" ? "" : med.dose}
                      onChange={(e) => updateMedicine(i, "dose", e.target.value)}
                      placeholder="Dose (e.g. 10mg)"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400" />
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {MEDICINE_TIMINGS.map((t) => (
                    <button key={t} onClick={() => toggleTiming(i, t)}
                      className={`text-xs px-2 py-1 rounded-full border transition ${med.timing.includes(t) ? "bg-emerald-500 text-white border-emerald-500" : "border-gray-300 text-gray-600"}`}>
                      {t}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <select value={med.food} onChange={(e) => updateMedicine(i, "food", e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none">
                    {FOOD_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <select value={med.duration} onChange={(e) => updateMedicine(i, "duration", e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none">
                    {DURATIONS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Follow-up */}
      <div className="bg-white rounded-2xl shadow p-4">
        <label className="block font-semibold text-gray-700 mb-2">Follow-up Date</label>
        <input type="date" value={followupDate} onChange={(e) => setFollowupDate(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        <div className="flex flex-wrap gap-1 mt-2">
          {[7, 14, 30, 60].map((d) => (
            <button key={d} type="button" onClick={() => quickFollowup(d)}
              className="text-xs border border-gray-300 rounded-full px-3 py-1 text-gray-600">
              +{d}d
            </button>
          ))}
          <button type="button" onClick={() => setFollowupDate("")}
            className="text-xs border border-gray-300 rounded-full px-3 py-1 text-gray-600">Clear</button>
        </div>
        {followupDate && (
          <p className="text-xs text-emerald-700 mt-2">Reminder will be sent on {followupDate}</p>
        )}
      </div>

      {/* Notes */}
      <div className="bg-white rounded-2xl shadow p-4">
        <label className="block font-semibold text-gray-700 mb-2">Doctor Notes / Advice</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="Follow-up instructions, diet advice..." rows={3}
          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400" />
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl p-3 text-center">
          ✓ Prescription saved — visible in pharmacy queue
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => onSave(false)} disabled={saving}
          className="bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-emerald-700 disabled:opacity-60 transition">
          {saving ? "Saving..." : "Save"}
        </button>
        <button onClick={() => onSave(true)} disabled={saving}
          className="bg-gray-800 text-white py-3 rounded-xl font-semibold text-sm hover:bg-gray-900 disabled:opacity-60 transition">
          Save & Print
        </button>
      </div>
    </div>
  );
}