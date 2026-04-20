"use client";
import { useState, useMemo } from "react";
import { MEDICINES_BY_TIER, CONDITIONS, getMedicineDefaults } from "@/lib/medicines";

const MEDICINE_TIMINGS = ["Morning", "Afternoon", "Evening", "Night", "HS", "SOS"];
const DURATIONS = ["3 days", "5 days", "7 days", "10 days", "14 days", "1 month", "2 months", "3 months"];
const FOOD_OPTIONS = ["After food", "Before food", "Empty stomach", "—"];

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
    const { latest, common } = MEDICINES_BY_TIER[cond];
    const hit = [...latest, ...common].find((m) => m.name.toLowerCase() === base);
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
  const [tierTab, setTierTab] = useState("all");
  const [pickedSalts, setPickedSalts] = useState({});

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

  function togglePick(med) {
    const key = med.name.toLowerCase();
    setPickedSalts((prev) => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = med;
      return next;
    });
  }

  function addAllPicked() {
    const toAdd = Object.values(pickedSalts);
    if (toAdd.length === 0) return;
    const newEntries = toAdd.map((m) => {
      const firstDose = splitDoses(m.dose)[0] || "";
      const def = getMedicineDefaults(m.name) || { timing: [], food: "After food", duration: "7 days" };
      return {
        name: m.name,
        dose: firstDose,
        timing: def.timing,
        duration: def.duration,
        food: def.food,
      };
    });
    setMedicines((prev) => {
      const isEmptyFirst = prev.length === 1 && !prev[0].name && !prev[0].dose && prev[0].timing.length === 0;
      const base = isEmptyFirst ? [] : prev;
      const existing = new Set(base.map((m) => m.name.toLowerCase()));
      const filtered = newEntries.filter((m) => !existing.has(m.name.toLowerCase()));
      return [...base, ...filtered];
    });
    setPickedSalts({});
  }

  function quickFollowup(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setFollowupDate(d.toISOString().slice(0, 10));
  }

  const pickerList = useMemo(() => {
    const q = search.trim().toLowerCase();
    const conds = selectedCondition === "All" ? CONDITIONS : [selectedCondition];
    const arr = [];
    for (const cond of conds) {
      const { latest, common } = MEDICINES_BY_TIER[cond];
      if (tierTab === "all" || tierTab === "latest") {
        for (const m of latest) arr.push({ ...m, condition: cond, tier: "latest" });
      }
      if (tierTab === "all" || tierTab === "common") {
        for (const m of common) arr.push({ ...m, condition: cond, tier: "common" });
      }
    }
    const dedup = {};
    for (const m of arr) {
      const k = `${m.name.toLowerCase()}|${m.condition}`;
      if (!dedup[k]) dedup[k] = m;
    }
    let list = Object.values(dedup);
    if (q) list = list.filter((m) => m.name.toLowerCase().includes(q) || (m.class || "").toLowerCase().includes(q));
    return list;
  }, [selectedCondition, search, tierTab]);

  const addedNames = useMemo(() => {
    const s = new Set();
    for (const m of medicines) {
      if (m.name) s.add(m.name.toLowerCase());
    }
    return s;
  }, [medicines]);

  const pickedCount = Object.keys(pickedSalts).length;

  const parseMeds = (raw) => {
    if (!raw) return [];
    try {
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.filter((m) => m.name) : [];
    } catch { return []; }
  };

  return (
    <div className="flex flex-col gap-4 pb-20">

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
                      {v.diagnosis && <p className="text-xs text-gray-500">{v.diagnosis}</p>}
                    </div>
                  </div>
                  {v.complaints && <p className="text-xs text-gray-600 mb-1"><span className="font-semibold">Complaints:</span> {v.complaints}</p>}
                  {pastMeds.length > 0 && (
                    <div className="mt-2">
                      <p className="text-[11px] font-semibold text-gray-500 uppercase mb-1">Medicines</p>
                      <ul className="text-xs text-gray-700 space-y-0.5">
                        {pastMeds.map((m, i) => (
                          <li key={i}>• {m.name} {m.dose} — {(m.timing || []).join(", ")} ({m.duration})</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {v.notes && <p className="text-xs text-gray-600 mt-2"><span className="font-semibold">Notes:</span> {v.notes}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MSE */}
      <div className="bg-white rounded-2xl shadow p-4">
        <div className="flex justify-between items-center">
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
          <label className="font-semibold text-gray-700">Add Medicines</label>
          <button type="button" onClick={() => setShowPicker((p) => !p)}
            className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg font-semibold">
            {showPicker ? "Hide" : "Show"}
          </button>
        </div>
        {showPicker && (
          <>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search salt name or class..."
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />

            {/* Tier sub-tabs */}
            <div className="flex gap-1 mb-2">
              <button type="button" onClick={() => setTierTab("all")}
                className={`flex-1 text-xs py-1.5 rounded-lg font-semibold border ${tierTab === "all" ? "bg-gray-800 text-white border-gray-800" : "border-gray-300 text-gray-600"}`}>
                All
              </button>
              <button type="button" onClick={() => setTierTab("latest")}
                className={`flex-1 text-xs py-1.5 rounded-lg font-semibold border ${tierTab === "latest" ? "bg-amber-500 text-white border-amber-500" : "border-gray-300 text-gray-600"}`}>
                🆕 Latest
              </button>
              <button type="button" onClick={() => setTierTab("common")}
                className={`flex-1 text-xs py-1.5 rounded-lg font-semibold border ${tierTab === "common" ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-300 text-gray-600"}`}>
                🔹 प्रचलित
              </button>
            </div>

            {/* Condition tabs */}
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

            <p className="text-[11px] text-gray-500 mb-2">Tick multiple salts → tap &quot;Add Selected&quot; once</p>

            {/* Medicine list grouped by class */}
            {(() => {
              const grouped = {};
              for (const med of pickerList) {
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
                      <div className="grid grid-cols-1 gap-1.5">
                        {grouped[cls].map((med, idx) => {
                          const key = `${med.name.toLowerCase()}`;
                          const picked = !!pickedSalts[key];
                          const already = addedNames.has(med.name.toLowerCase());
                          return (
                            <button
                              key={`${cls}-${med.name}-${idx}`}
                              type="button"
                              onClick={() => togglePick(med)}
                              disabled={already}
                              className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-left transition ${
                                already ? "bg-emerald-50 border-emerald-300 opacity-70 cursor-not-allowed" :
                                picked ? "bg-indigo-600 border-indigo-600 text-white" :
                                "border-gray-200 bg-white"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className={`w-4 h-4 flex items-center justify-center rounded border text-[10px] shrink-0 ${
                                  already ? "bg-emerald-500 border-emerald-500 text-white" :
                                  picked ? "bg-white border-white text-indigo-600" :
                                  "border-gray-300"
                                }`}>
                                  {(picked || already) && "✓"}
                                </span>
                                <span className="text-sm font-semibold truncate">{med.name}</span>
                                {med.tier === "latest" && <span className="text-[9px] px-1 rounded bg-amber-400 text-white shrink-0">NEW</span>}
                              </div>
                              <span className={`text-[10px] shrink-0 ${picked ? "text-indigo-100" : "text-gray-400"}`}>{med.condition}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Sticky Add Selected bar */}
            {pickedCount > 0 && (
              <div className="sticky bottom-0 mt-3 -mx-4 -mb-4 px-4 py-3 bg-white border-t border-gray-200 flex gap-2">
                <button type="button" onClick={() => setPickedSalts({})}
                  className="px-3 py-2 text-xs border border-gray-300 rounded-lg text-gray-600">Clear</button>
                <button type="button" onClick={addAllPicked}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold text-sm">
                  Add {pickedCount} Selected →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Prescription List */}
      <div className="bg-white rounded-2xl shadow p-4">
        <div className="flex justify-between items-center mb-3">
          <label className="font-semibold text-gray-700">Prescription ({medicines.filter((m) => m.name).length})</label>
          <button onClick={addMedicine} className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg font-semibold">+ Manual</button>
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