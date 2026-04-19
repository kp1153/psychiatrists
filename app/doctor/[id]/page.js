"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import PrescriptionForm from "./PrescriptionForm";
import PrintView from "./PrintView";

const MSE_DEFAULT = { appearance: "", mood: "", affect: "", thought: "", perception: "", cognition: "", insight: "", judgement: "" };

function parseMeds(raw) {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((m) => m.name).map((m) => ({
      name: m.name || "",
      dose: m.dose || "",
      timing: Array.isArray(m.timing) ? m.timing : [],
      duration: m.duration || "7 days",
      food: m.food || "After food",
    })) : [];
  } catch { return []; }
}

function parseMSE(raw) {
  if (!raw) return { ...MSE_DEFAULT };
  try { return { ...MSE_DEFAULT, ...JSON.parse(raw) }; }
  catch { return { ...MSE_DEFAULT }; }
}

export default function DoctorPrescriptionPage() {
  const { id } = useParams();
  const router = useRouter();

  const [prescription, setPrescription] = useState(null);
  const [patient, setPatient] = useState(null);
  const [clinic, setClinic] = useState(null);
  const [history, setHistory] = useState([]);

  const [complaints, setComplaints] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [tests, setTests] = useState("");
  const [mse, setMse] = useState({ ...MSE_DEFAULT });
  const [notes, setNotes] = useState("");
  const [followupDate, setFollowupDate] = useState("");
  const [medicines, setMedicines] = useState([{ name: "", dose: "", timing: [], duration: "7 days", food: "After food" }]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/prescriptions/${id}`);
      if (res.status === 401) { window.location.href = "/login"; return; }
      if (res.status === 403) { window.location.href = "/expired"; return; }
      if (!res.ok) return;
      const data = await res.json();
      setPrescription(data);

      if (data.complaints) setComplaints(data.complaints);
      if (data.diagnosis) setDiagnosis(data.diagnosis);
      if (data.tests) setTests(data.tests);
      if (data.mse) setMse(parseMSE(data.mse));
      if (data.notes) setNotes(data.notes);
      if (data.followup_date) setFollowupDate(data.followup_date);
      if (data.medicines) {
        const parsed = parseMeds(data.medicines);
        if (parsed.length > 0) setMedicines(parsed);
      }

      const qRes = await fetch(`/api/prescriptions?patient_id=${data.patient_id}`);
      if (qRes.status === 401) { window.location.href = "/login"; return; }
      if (qRes.status === 403) { window.location.href = "/expired"; return; }
      if (!qRes.ok) return;
      const qData = await qRes.json();
      if (qData.length > 0) setPatient({ name: qData[0].patient_name, phone: qData[0].patient_phone });
      setHistory(
        qData
          .filter((r) => r.id !== Number(id) && r.status === "doctor_done")
          .sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date))
      );

      const sRes = await fetch("/api/settings");
      if (sRes.ok) setClinic(await sRes.json());
    }
    load();
  }, [id]);

  async function handleSave(andPrint = false) {
    setSaving(true);
    const res = await fetch(`/api/prescriptions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        complaints,
        diagnosis,
        tests,
        mse: JSON.stringify(mse),
        medicines: JSON.stringify(medicines),
        notes,
        followup_date: followupDate,
        status: "doctor_done",
      }),
    });
    setSaving(false);
    if (res.status === 401) { window.location.href = "/login"; return; }
    if (res.status === 403) { window.location.href = "/expired"; return; }
    if (!res.ok) return;
    setSaved(true);
    if (andPrint) window.print();
  }

  if (!prescription) return <p className="text-center mt-20 text-gray-400">Loading...</p>;

  return (
    <>
      <style>{`
        @media print { .no-print { display: none !important; } body { background: white; } }
      `}</style>

      <main className="min-h-screen bg-emerald-50 p-4 pb-24 no-print">
        <div className="max-w-lg mx-auto">
          <button onClick={() => router.back()}
            className="text-emerald-700 text-sm mb-4 mt-2 flex items-center gap-1">
            ← Back to Queue
          </button>

          <div className="bg-white rounded-2xl shadow p-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-lg text-gray-800">{patient?.name}</p>
                <p className="text-sm text-gray-500">{patient?.phone}</p>
              </div>
              <span className="text-xs text-gray-400">Token #{prescription.id}</span>
            </div>
          </div>

          <PrescriptionForm
            complaints={complaints} setComplaints={setComplaints}
            diagnosis={diagnosis} setDiagnosis={setDiagnosis}
            mse={mse} setMse={setMse}
            tests={tests} setTests={setTests}
            medicines={medicines} setMedicines={setMedicines}
            notes={notes} setNotes={setNotes}
            followupDate={followupDate} setFollowupDate={setFollowupDate}
            history={history}
            saving={saving} saved={saved}
            onSave={handleSave}
          />
        </div>
      </main>

      <PrintView
        prescription={prescription}
        patient={patient}
        clinic={clinic}
        medicines={medicines}
        mse={mse}
        tests={tests}
        notes={notes}
        followupDate={followupDate}
        complaints={complaints}
        diagnosis={diagnosis}
      />

      <BottomNav role="doctor" />
    </>
  );
}