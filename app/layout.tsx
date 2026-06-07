import './globals.css';

export const metadata = {
  title: 'SP Digital Bridge',
  description: 'Bridging the gap to corporate roles',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}