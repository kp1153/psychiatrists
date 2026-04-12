import '@fontsource/baloo-2/400.css';
import '@fontsource/baloo-2/600.css';
import '@fontsource/baloo-2/700.css';
import './globals.css';

export const metadata = {
  title: 'Psychiatrist Clinic',
  description: 'Clinic management system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="hi">
      <body className="font-baloo bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}