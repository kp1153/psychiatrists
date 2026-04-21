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
  const [pinPsy, setPinPsy] = useState("");
  const [showPinR, setShowPinR] = useState(false);
  const [showPinP, setShowPinP] = useState(false);
  const [showPinPsy, setShowPinPsy] = useState(false);
  const [hasPsychologist, setHasPsychologist] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logo, setLogo] = useState("");

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
        setPinPsy(data.pin_psychologist || "");
        setHasPsychologist(!!data.has_psychologist);
        setLogo(data.clinic_logo || "");
      });
  }, []);

  function handleLogoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 200 * 1024) {
      alert("Logo must be under 200KB. Please compress it first.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setLogo(ev.target.result);
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (pinR.length !== 4 || pinP.length !== 4) {
      alert("Receptionist and Pharmacy PINs must be 4 digits");
      return;
    }
    if (hasPsychologist && pinPsy.length !== 4) {
      alert("Psychologist PIN must be 4 digits");
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
        pin_psychologist: pinPsy,
        has_psychologist: hasPsychologist,
        clinic_logo: logo,
      }),
    });
    setSaving(false);
    if (!res.ok) { alert("Save failed. Try again."); return; }
    if (isFirst) { window.location.href = "/doctor"; return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!clinic)
    return <p className="text-center mt-20 text-gray-400">Loading...</p>;

  return (
    <main className="min-h-screen bg-emerald-50 p-4 pb-32">
      <div className="max-w-md mx-auto">
        <h1 className="text-xl font-bold text-emerald-800 mt-4 mb-5">
          {isFirst ? "Setup Your Clinic" : "Settings"}
        </h1>

        {/* Clinic Logo */}
        <div className="bg-white rounded-2xl shadow p-4 mb-4">
          <p className="font-semibold text-gray-700 mb-3">Clinic Logo</p>
          {logo ? (
            <div className="flex flex-col items-center gap-3">
              <img
                src={logo}
                alt="Clinic logo"
                className="h-20 object-contain rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => setLogo("")}
                className="text-xs text-red-400"
              >
                Remove logo
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl py-6 cursor-pointer hover:border-emerald-400 transition">
              <span className="text-2xl mb-1">🖼️</span>
              <span className="text-sm text-gray-500">Tap to upload logo</span>
              <span className="text-xs text-gray-400 mt-1">Max 200KB · PNG/JPG</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            </label>
          )}
        </div>

        {/* Doctor Info */}
        <div className="bg-white rounded-2xl shadow p-4 mb-4 flex flex-col gap-3">
          <p className="font-semibold text-gray-700">Doctor / Clinic Info</p>
          <p className="text-xs text-gray-400">
            Clinic ID: <strong className="text-gray-600">{clinic.id}</strong> —
            Pharmacy/Receptionist login के लिए
          </p>
          <div>
            <label className="text-xs text-gray-500">Clinic Name</label>
            <input
              type="text"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Doctor Name</label>
            <input
              type="text"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              placeholder="Dr. Firstname Lastname"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Qualification</label>
            <input
              type="text"
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
              placeholder="MBBS, MD (Psychiatry)"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Clinic Address</label>
            <textarea
              value={clinicAddress}
              onChange={(e) => setClinicAddress(e.target.value)}
              rows={2}
              placeholder="Full address"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400 mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Phone</label>
            <input
              type="tel"
              value={clinicPhone}
              onChange={(e) => setClinicPhone(e.target.value)}
              placeholder="Clinic contact number"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 mt-1"
            />
          </div>
        </div>

        {/* Staff PINs */}
        <div className="bg-white rounded-2xl shadow p-4 mb-4 flex flex-col gap-3">
          <p className="font-semibold text-gray-700">Staff PINs</p>

          {/* Receptionist PIN */}
          <div>
            <label className="text-xs text-gray-500">Receptionist PIN</label>
            <div className="flex gap-2 mt-1">
              <input
                type={showPinR ? "text" : "password"}
                value={pinR}
                onChange={(e) => setPinR(e.target.value.replace(/\D/g, "").slice(0, 4))}
                maxLength={4}
                inputMode="numeric"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <button
                type="button"
                onClick={() => setShowPinR((p) => !p)}
                className="text-lg px-3 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50"
                aria-label={showPinR ? "Hide PIN" : "Show PIN"}
              >
                {showPinR ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Pharmacy PIN */}
          <div>
            <label className="text-xs text-gray-500">Pharmacy PIN</label>
            <div className="flex gap-2 mt-1">
              <input
                type={showPinP ? "text" : "password"}
                value={pinP}
                onChange={(e) => setPinP(e.target.value.replace(/\D/g, "").slice(0, 4))}
                maxLength={4}
                inputMode="numeric"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <button
                type="button"
                onClick={() => setShowPinP((p) => !p)}
                className="text-lg px-3 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50"
                aria-label={showPinP ? "Hide PIN" : "Show PIN"}
              >
                {showPinP ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Psychologist Toggle */}
          <div className="border-t border-gray-100 pt-3 mt-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Psychologist</p>
                <p className="text-xs text-gray-400">Enable if this clinic has a psychologist</p>
              </div>
              <button
                type="button"
                onClick={() => setHasPsychologist((p) => !p)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  hasPsychologist ? "bg-emerald-500" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    hasPsychologist ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {hasPsychologist && (
              <div className="mt-3">
                <label className="text-xs text-gray-500">Psychologist PIN</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type={showPinPsy ? "text" : "password"}
                    value={pinPsy}
                    onChange={(e) => setPinPsy(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    maxLength={4}
                    inputMode="numeric"
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPinPsy((p) => !p)}
                    className="text-lg px-3 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50"
                    aria-label={showPinPsy ? "Hide PIN" : "Show PIN"}
                  >
                    {showPinPsy ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl p-3 mb-3 text-center">
            ✓ Settings saved
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-indigo-600 text-white py-3 rounded-2xl font-semibold text-base hover:bg-indigo-700 disabled:opacity-60 transition mb-4"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>

        <a
          href="/api/auth/logout"
          className="block text-center text-sm text-red-400 hover:text-red-600 transition"
        >
          Logout
        </a>
      </div>
    </main>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<p className="text-center mt-20 text-gray-400">Loading...</p>}>
      <SettingsContent />
      <BottomNav role="doctor" />
    </Suspense>
  );
}