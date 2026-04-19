"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BottomNav from "@/components/BottomNav";

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFirst = searchParams.get("first") === "1";

  const [clinic, setClinic] = useState(null);
  const [clinicName, setClinicName] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [qualification, setQualification] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [clinicPhone, setClinicPhone] = useState("");
  const [pinR, setPinR] = useState("");
  const [pinP, setPinP] = useState("");
  const [showPinR, setShowPinR] = useState(false);
  const [showPinP, setShowPinP] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => {
        if (r.status === 401) { window.location.href = "/login"; return null; }
        if (r.status === 403) { window.location.href = "/expired"; return null; }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        setClinic(data);
        setClinicName(data.name || "");
        setDoctorName(data.doctor_name || "");
        setQualification(data.qualification || "");
        setClinicAddress(data.clinic_address || "");
        setClinicPhone(data.clinic_phone || "");
        setPinR(data.pin_receptionist || "");
        setPinP(data.pin_pharmacy || "");
      });
  }, []);

  async function handleSave() {
    if (pinR.length !== 4 || pinP.length !== 4) {
      alert("PINs must be 4 digits");
      return;
    }
    if (pinR === "1234" || pinP === "5678") {
      alert("Please change the default PINs for security");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: clinicName,
        doctor_name: doctorName,
        qualification,
        clinic_address: clinicAddress,
        clinic_phone: clinicPhone,
        pin_receptionist: pinR,
        pin_pharmacy: pinP,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      alert("Save failed. Try again.");
      return;
    }
    if (isFirst) {
      window.location.href = "/doctor";
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!clinic)
    return <p className="text-center mt-20 text-gray-400">Loading...</p>;

  return (
    <>
      <main className="min-h-screen bg-gray-50 p-4 pb-20">
        <div className="max-w-md mx-auto">
          {!isFirst && (
            <button
              onClick={() => router.back()}
              className="text-indigo-700 text-sm mb-4 mt-2"
            >
              ← Back
            </button>
          )}

          {isFirst && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 mb-4 mt-2">
              <p className="font-semibold text-amber-900 text-sm">
                Welcome! Please complete your clinic setup.
              </p>
              <p className="text-xs text-amber-800 mt-1">
                Fill clinic details and set staff PINs. Share Clinic ID + PINs
                with receptionist and pharmacy staff.
              </p>
            </div>
          )}

          <h1 className="text-2xl font-bold text-gray-800 mb-4">Settings</h1>

          {/* Clinic ID */}
          <div className="bg-white rounded-2xl shadow p-5 mb-4">
            <p className="text-xs text-gray-400 mb-1">Clinic ID (share with staff)</p>
            <div className="bg-indigo-50 text-indigo-800 font-bold text-2xl text-center py-3 rounded-xl tracking-widest">
              {clinic.id}
            </div>
          </div>

          {/* Clinic Details */}
          <div className="bg-white rounded-2xl shadow p-5 mb-4 flex flex-col gap-4">
            <p className="font-semibold text-gray-700 text-sm">Clinic Details</p>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Clinic Name
              </label>
              <input
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                placeholder="e.g. City Mind Clinic"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Doctor Name
              </label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="e.g. Dr. Rajesh Kumar"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Qualification
              </label>
              <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="e.g. MBBS, MD (Psychiatry)"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Clinic Phone
              </label>
              <input
                type="tel"
                inputMode="numeric"
                value={clinicPhone}
                onChange={(e) => setClinicPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Clinic Address
              </label>
              <textarea
                value={clinicAddress}
                onChange={(e) => setClinicAddress(e.target.value)}
                placeholder="e.g. 12, Gandhi Nagar, Varanasi - 221001"
                rows={2}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
            </div>
          </div>

          {/* Staff PINs */}
          <div className="bg-white rounded-2xl shadow p-5 mb-4 flex flex-col gap-4">
            <p className="font-semibold text-gray-700 text-sm">Staff PINs</p>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Receptionist PIN
              </label>
              <div className="relative">
                <input
                  type={showPinR ? "text" : "password"}
                  value={pinR}
                  onChange={(e) => setPinR(e.target.value)}
                  maxLength={4}
                  placeholder="4-digit PIN"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPinR((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xl"
                >
                  {showPinR ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Pharmacy PIN
              </label>
              <div className="relative">
                <input
                  type={showPinP ? "text" : "password"}
                  value={pinP}
                  onChange={(e) => setPinP(e.target.value)}
                  maxLength={4}
                  placeholder="4-digit PIN"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPinP((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xl"
                >
                  {showPinP ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
          </div>

          {saved && (
            <p className="text-green-600 text-sm text-center mb-3">
              ✓ Saved successfully
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-indigo-600 text-white py-3 rounded-2xl font-semibold text-base hover:bg-indigo-700 disabled:opacity-60 transition mb-4"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>

          
            href="/api/auth/logout"
            className="block text-center text-sm text-red-400 hover:text-red-600 transition"
          >
            Logout
          </a>
        </div>
      </main>
      <BottomNav role="doctor" />
    </>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<p className="text-center mt-20 text-gray-400">Loading...</p>}>
      <SettingsContent />
    </Suspense>
  );
}