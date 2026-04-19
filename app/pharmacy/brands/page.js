'use client';
import { useEffect, useState } from 'react';
import BottomNav from '@/components/BottomNav';

export default function BrandsPage() {
  const [brands, setBrands] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newSalt, setNewSalt] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/brands')
      .then((r) => {
        if (r.status === 401) { window.location.href = '/login'; return null; }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        setBrands(data.brands || {});
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    const res = await fetch('/api/brands', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brands }),
    });
    setSaving(false);
    if (!res.ok) { alert('Save failed'); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function addEntry() {
    const salt = newSalt.trim();
    if (!salt) { alert('Salt name required'); return; }
    setBrands((prev) => ({
      ...prev,
      [salt]: { brand: newBrand.trim(), price: newPrice.trim() },
    }));
    setNewSalt('');
    setNewBrand('');
    setNewPrice('');
  }

  function updateEntry(salt, field, value) {
    setBrands((prev) => ({
      ...prev,
      [salt]: { ...prev[salt], [field]: value },
    }));
  }

  function removeEntry(salt) {
    setBrands((prev) => {
      const next = { ...prev };
      delete next[salt];
      return next;
    });
  }

  const entries = Object.entries(brands).filter(([salt]) =>
    salt.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p className="text-center mt-20 text-gray-400">Loading...</p>;

  return (
    <>
      <main className="min-h-screen bg-orange-50 p-4 pb-24">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold text-orange-800 mt-4 mb-1">Brand Manager</h1>
          <p className="text-xs text-gray-500 mb-4">
            Map salt names → your brand names &amp; prices for billing
          </p>

          {/* Add new */}
          <div className="bg-white rounded-2xl shadow p-4 mb-4 flex flex-col gap-2">
            <p className="font-semibold text-gray-700 text-sm">Add / Update Entry</p>
            <input
              type="text"
              value={newSalt}
              onChange={(e) => setNewSalt(e.target.value)}
              placeholder="Salt name (e.g. Olanzapine 5mg)"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <input
              type="text"
              value={newBrand}
              onChange={(e) => setNewBrand(e.target.value)}
              placeholder="Brand name (e.g. Oleanz 5)"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <input
              type="text"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              placeholder="Price per strip/unit (e.g. 85)"
              inputMode="decimal"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <button
              type="button"
              onClick={addEntry}
              className="w-full bg-orange-500 text-white py-2 rounded-xl font-semibold text-sm"
            >
              + Add Entry
            </button>
          </div>

          {/* Search */}
          {Object.keys(brands).length > 4 && (
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search salt..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          )}

          {/* List */}
          <div className="flex flex-col gap-2 mb-4">
            {entries.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-6">No entries yet</p>
            )}
            {entries.map(([salt, val]) => (
              <div key={salt} className="bg-white rounded-2xl shadow p-3 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-gray-700">{salt}</p>
                  <button
                    type="button"
                    onClick={() => removeEntry(salt)}
                    className="text-xs text-red-400"
                  >
                    Remove
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={val.brand || ''}
                    onChange={(e) => updateEntry(salt, 'brand', e.target.value)}
                    placeholder="Brand name"
                    className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
                  />
                  <input
                    type="text"
                    value={val.price || ''}
                    onChange={(e) => updateEntry(salt, 'price', e.target.value)}
                    placeholder="₹ Price"
                    inputMode="decimal"
                    className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
                  />
                </div>
              </div>
            ))}
          </div>

          {saved && (
            <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl p-3 mb-3 text-center">
              ✓ Brands saved
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-indigo-600 text-white py-3 rounded-2xl font-semibold text-base disabled:opacity-60 transition"
          >
            {saving ? 'Saving...' : 'Save All Brands'}
          </button>
        </div>
      </main>
      <BottomNav role="pharmacy" />
    </>
  );
}