import './globals.css';

export const metadata = {
  title: 'Pairing Notes',
  description: "A sommelier's digital cellar book.",
  manifest: '/manifest.json',
  themeColor: '#080808',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Pairing Notes',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#080808" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Pairing Notes" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
