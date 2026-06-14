import './globals.css';

export const metadata = {
  title: 'GameyGrid | Indie Matrix',
  description: 'A dynamic geometric advertising hub for video games',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
