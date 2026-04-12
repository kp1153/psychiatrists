export default function InactivePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-3xl shadow p-8 w-full max-w-sm text-center flex flex-col gap-4">
        <div className="text-4xl">🔒</div>
        <h1 className="text-xl font-bold text-gray-800">Account Not Activated</h1>
        <p className="text-gray-500 text-sm">
          Please complete your purchase to activate your clinic account.
        </p>
        <a href="https://nishantsoftwares.in/psychiatrist-pro"
          className="bg-indigo-600 text-white py-3 rounded-2xl font-semibold text-base hover:bg-indigo-700 transition">
          Buy Now — ₹4,999
        </a>
        <a href="/api/auth/logout" className="text-sm text-gray-400 hover:text-gray-600">
          Logout
        </a>
      </div>
    </main>
  );
}