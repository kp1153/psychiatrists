'use client';
import { useEffect, useState, use } from 'react';

export default function PsychologistAssessmentPage({ params }) {
  const { id } = use(params); // Next.js params is now a Promise
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  // Assessment fields
  const [mood, setMood] = useState(5);
  const [history, setHistory] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetch(`/api/psychologist/assessment?prescription_id=${id}`)
      .then(r => {
        if (r.status === 401) { window.location.href = '/psychologist/login'; return null; }
        return r.json();
      })
      .then(data => {
        if (!data) return;
        setPrescription(data.prescription);
        if (data.assessment) {
          setMood(data.assessment.mood ?? 5);
          setHistory(data.assessment.history || '');
          setSymptoms(data.assessment.symptoms || '');
          setNotes(data.assessment.notes || '');
        }
        setLoading(false);
      });
  }, [id]);

  async function handleSendToDoctor() {
    setSaving(true);
    // Save assessment
    await fetch('/api/psychologist/assessment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prescription_id: parseInt(id),
        mood,
        history,
        symptoms,
        notes,
      }),
    });
    // Update prescription status to 'waiting' (doctor queue)
    await fetch(`/api/prescriptions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'waiting' }),
    });
    setSaving(false);
    setDone(true);
    setTimeout(() => { window.location.href = '/psychologist'; }, 1200);
  }

  if (loading) return <p className="text-center mt-20 text-gray-400">Loading...</p>;
  if (!prescription) return <p className="text-center mt-20 text-red-400">Not found</p>;

  return (
    <main className="min-h-screen bg-purple-50 p-4 pb-10">
      <div className="max-w-md mx-auto">
        <a href="/psychologist" className="text-sm text-purple-600 mb-4 inline-block">← Back to Queue</a>

        <div className="bg-white rounded-2xl shadow p-4 mb-4">
          <p className="font-bold text-gray-800 text-lg">{prescription.patient_name}</p>
          <p className="text-sm text-gray-500">{prescription.patient_phone}</p>
          {prescription.complaints && (
            <p className="text-xs text-gray-400 mt-1">Chief complaint: {prescription.complaints}</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow p-4 mb-4 flex flex-col gap-4">
          <p className="font-semibold text-gray-700">Psychological Assessment</p>

          {/* Mood */}
          <div>
            <label className="text-xs text-gray-500">Mood (1 = very low, 10 = very good)</label>
            <div className="flex items-center gap-3 mt-2">
              <input
                type="range"
                min={1}
                max={10}
                value={mood}
                onChange={e => setMood(Number(e.target.value))}
                className="flex-1 accent-purple-600"
              />
              <span className="text-lg font-bold text-purple-700 w-6 text-center">{mood}</span>
            </div>
          </div>

          {/* History */}
          <div>
            <label className="text-xs text-gray-500">Patient History</label>
            <textarea
              value={history}
              onChange={e => setHistory(e.target.value)}
              rows={3}
              placeholder="Previous episodes, family history..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mt-1 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Symptoms */}
          <div>
            <label className="text-xs text-gray-500">Current Symptoms</label>
            <textarea
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
              rows={3}
              placeholder="Sleep issues, anxiety, mood swings..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mt-1 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs text-gray-500">Psychologist Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Assessment notes for doctor..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mt-1 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
        </div>

        {done && (
          <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl p-3 mb-3 text-center">
            ✓ Sent to Doctor queue
          </div>
        )}

        <button
          onClick={handleSendToDoctor}
          disabled={saving || done}
          className="w-full bg-purple-600 text-white py-3 rounded-2xl font-semibold text-base hover:bg-purple-700 disabled:opacity-60 transition"
        >
          {saving ? 'Saving...' : 'Send to Doctor →'}
        </button>
      </div>
    </main>
  );
}