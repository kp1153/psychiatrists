export default function ExpiredPage() {
  return (
    <main className="min-h-screen bg-indigo-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-lg p-10 w-full max-w-md text-center">
        <div className="text-5xl mb-3">⏰</div>
        <h1 className="text-2xl font-bold text-indigo-800 mb-2">Trial खत्म हो गया</h1>
        <p className="text-gray-500 text-sm mb-6">
          आपका 7 दिन का मुफ्त trial समाप्त हो गया है। License लें और काम जारी रखें।
        </p>

        <div className="bg-indigo-50 rounded-2xl p-5 mb-6">
          <p className="text-gray-500 text-xs mb-1">Psychiatrist Pro License</p>
          <p className="text-4xl font-extrabold text-indigo-700 mb-1">
            ₹4,999 <span className="text-sm font-normal text-gray-500">/साल</span>
          </p>
          <p className="text-gray-500 text-xs">Renewal: ₹2,500/साल</p>
        </div>

        <a href="https://nishantsoftwares.in/psy"
          className="block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-base mb-3 transition-colors">
          License खरीदें — ₹4,999
        </a>

        <a href="https://wa.me/919996865069" target="_blank" rel="noopener noreferrer"
          className="block w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl text-base mb-5 transition-colors">
          💬 WhatsApp पर बात करें
        </a>

        <a href="/login" className="text-gray-500 text-xs hover:text-gray-700">
          Login page पर जाएं
        </a>
      </div>
    </main>
  );
}