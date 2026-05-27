import './globals.css';

export const metadata = {
  title: 'Pairing Notes',
  description: 'A sommelier\'s digital cellar book.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
