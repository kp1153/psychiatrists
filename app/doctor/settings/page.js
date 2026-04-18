"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";

export default function SettingsPage() {
  const router = useRouter();
  const [clinic, setClinic] = useState(null);
  const [pinR, setPinR] = useState("");
  const [pinP, setPinP] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setClinic(data);
        setClinicName(data.name || "");
        setPinR(data.pin_receptionist || "");
        setPinP(data.pin_pharmacy || "");
      });
  }, []);

  async function handleSave() {
    if (pinR.length !== 4 || pinP.length !== 4) {
      alert("PINs must be 4 digits");
      return;
    }
    setSaving(true);
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pin_receptionist: pinR,
        pin_pharmacy: pinP,
        name: clinicName,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!clinic)
    return <p className="text-center mt-20 text-gray-400">Loading...</p>;

  return (
    <>
      <main className="min-h-screen bg-gray-50 p-4 pb-20">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => router.back()}
            className="text-indigo-700 text-sm mb-4 mt-2"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

          <div className="bg-white rounded-2xl shadow p-5 flex flex-col gap-5">
            <div>
              <p className="text-xs text-gray-400 mb-1">
                Clinic ID (share with staff)
              </p>
              <div className="bg-indigo-50 text-indigo-800 font-bold text-2xl text-center py-3 rounded-xl tracking-widest">
                {clinic.id}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Clinic Name
              </label>
              <input
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Receptionist PIN
              </label>
              <input
                type="password"
                value={pinR}
                onChange={(e) => setPinR(e.target.value)}
                maxLength={4}
                placeholder="4-digit PIN"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Pharmacy PIN
              </label>
              <input
                type="password"
                value={pinP}
                onChange={(e) => setPinP(e.target.value)}
                maxLength={4}
                placeholder="4-digit PIN"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {saved && (
              <p className="text-green-600 text-sm text-center">
                ✓ Saved successfully
              </p>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-600 text-white py-3 rounded-2xl font-semibold text-base hover:bg-indigo-700 disabled:opacity-60 transition"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>

            <a
              href="/api/auth/logout"
              className="text-center text-sm text-red-400 hover:text-red-600 transition"
            >
              Logout
            </a>
          </div>
        </div>
      </main>
      <BottomNav role="doctor" />
    </>
  );
}
