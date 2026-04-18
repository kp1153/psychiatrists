'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';

export default function PharmacyQueuePage() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchQueue() {
    setLoading(true);
    const res = await fetch('/api/prescriptions?status=doctor_done');
    const data = await res.json();
    setQueue(data);
    setLoading(false);
  }

  useEffect(() => { fetchQueue(); }, []);

  return (
    <>
      <main className="min-h-screen bg-orange-50 p-4 pb-16">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mt-4 mb-6">
            <h1 className="text-2xl font-bold text-orange-800">Pharmacy Queue</h1>
            <button onClick={fetchQueue} className="text-sm text-orange-600 border border-orange-300 px-3 py-1 rounded-lg">
              Refresh
            </button>
          </div>

          {loading && <p className="text-gray-400 text-center mt-10">Loading...</p>}
          {!loading && queue.length === 0 && (
            <p className="text-gray-400 text-center mt-10">No prescriptions ready</p>
          )}

          <div className="flex flex-col gap-3">
            {queue.map(p => (
              <Link key={p.id} href={`/pharmacy/${p.id}`}
                className="bg-white rounded-2xl shadow p-4 flex flex-col gap-1 hover:shadow-md active:scale-95 transition">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">{p.patient_name}</span>
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Ready</span>
                </div>
                <span className="text-sm text-gray-500">{p.patient_phone}</span>
                <span className="text-xs text-gray-400 mt-1">Token #{p.id} · {p.visit_date?.slice(0, 16)}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <BottomNav role="pharmacy" />
    </>
  );
}