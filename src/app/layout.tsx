import './globals.css';

export const metadata = {
  title: 'meddelivery',
  description: 'MedDelivery application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  );
}
