'use client';
import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin')
      .then(r => {
        if (r.status === 401) { window.location.href = '/login'; return null; }
        if (r.status === 403) { window.location.href = '/'; return null; }
        return r.json();
      })
      .then(d => {
        if (!d) return;
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center mt-20 text-gray-400">Loading...</p>;

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mt-6 mb-6">🛠️ Admin Panel</h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl shadow p-4 text-center">
            <p className="text-3xl font-bold text-gray-800">{data.total}</p>
            <p className="text-xs text-gray-500 mt-1">Total Clinics</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4 text-center">
            <p className="text-3xl font-bold text-emerald-600">{data.activeCount}</p>
            <p className="text-xs text-gray-500 mt-1">Active</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4 text-center">
            <p className="text-3xl font-bold text-orange-500">{data.trialCount}</p>
            <p className="text-xs text-gray-500 mt-1">Trial</p>
          </div>
        </div>

        {/* Clinic List */}
        <div className="flex flex-col gap-3">
          {data.clinics.map(c => (
            <div key={c.id} className="bg-white rounded-2xl shadow p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-gray-800">{c.name || '—'}</p>
                  <p className="text-sm text-gray-500">{c.email}</p>
                  <p className="text-xs text-gray-400 mt-1">ID: {c.id} · Joined: {c.created_at?.slice(0, 10)}</p>
                  {c.expiry_date && (
                    <p className="text-xs text-gray-400">Expiry: {c.expiry_date?.slice(0, 10)}</p>
                  )}
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  c.active ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-600'
                }`}>
                  {c.active ? 'Active' : 'Trial'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}