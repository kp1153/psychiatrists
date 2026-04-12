import '@fontsource/baloo-2/400.css';
import '@fontsource/baloo-2/600.css';
import '@fontsource/baloo-2/700.css';
import './globals.css';

export const metadata = {
  title: 'Psychiatrist Pro',
  description: 'Clinic Management System',
  manifest: '/manifest.json',
  themeColor: '#4f46e5',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Psychiatrist Pro',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="hi">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4f46e5" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Psychiatrist Pro" />
      </head>
      <body className="font-baloo bg-gray-50 min-h-screen">
        <script dangerouslySetInnerHTML={{
          __html: `if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js');`
        }} />
        {children}
      </body>
    </html>
  );
}