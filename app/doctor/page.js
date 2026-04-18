'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';

export default function DoctorQueuePage() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchQueue() {
    setLoading(true);
    const res = await fetch('/api/prescriptions?status=pending');
    if (!res.ok) {
      if (res.status === 401) window.location.href = '/login';
      setLoading(false);
      return;
    }
    const data = await res.json();
    setQueue(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { fetchQueue(); }, []);

  return (
    <>
      <main className="min-h-screen bg-emerald-50 p-4 pb-16">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mt-4 mb-6">
            <h1 className="text-2xl font-bold text-emerald-800">Patient Queue</h1>
            <button onClick={fetchQueue} className="text-sm text-emerald-600 border border-emerald-300 px-3 py-1 rounded-lg">
              Refresh
            </button>
          </div>

          {loading && <p className="text-gray-400 text-center mt-10">Loading...</p>}

          {!loading && queue.length === 0 && (
            <p className="text-gray-400 text-center mt-10">No pending patients</p>
          )}

          <div className="flex flex-col gap-3">
            {queue.map(p => (
              <Link key={p.id} href={`/doctor/${p.id}`}
                className="bg-white rounded-2xl shadow p-4 flex flex-col gap-1 hover:shadow-md active:scale-95 transition">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">{p.patient_name}</span>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Pending</span>
                </div>
                <span className="text-sm text-gray-500">{p.patient_phone}</span>
                {p.complaints && <span className="text-sm text-gray-600 mt-1">&quot;{p.complaints}&quot;</span>}
                <span className="text-xs text-gray-400 mt-1">Token #{p.id} · {p.visit_date?.slice(0, 16)}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <BottomNav role="doctor" />
    </>
  );
}