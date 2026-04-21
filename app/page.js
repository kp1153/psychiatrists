import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <h1 className="text-3xl font-bold text-indigo-800 text-center">Clinic Management</h1>
      <p className="text-gray-500">Select your role to continue</p>
      <div className="grid grid-cols-1 gap-4 w-full max-w-xs">
        <Link href="/receptionist/login"
          className="bg-indigo-600 text-white text-center py-4 px-6 rounded-2xl text-lg font-semibold shadow hover:bg-indigo-700 active:scale-95 transition">
          Receptionist
        </Link>
        <Link href="/login"
          className="bg-emerald-600 text-white text-center py-4 px-6 rounded-2xl text-lg font-semibold shadow hover:bg-emerald-700 active:scale-95 transition">
          Doctor
        </Link>
        <Link href="/pharmacy/login"
          className="bg-orange-500 text-white text-center py-4 px-6 rounded-2xl text-lg font-semibold shadow hover:bg-orange-600 active:scale-95 transition">
          Pharmacy
        </Link>
        <Link href="/psychologist/login"
          className="bg-purple-600 text-white text-center py-4 px-6 rounded-2xl text-lg font-semibold shadow hover:bg-purple-700 active:scale-95 transition">
          Psychologist
        </Link>
      </div>
    </main>
  );
}