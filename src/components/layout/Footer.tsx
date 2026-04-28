import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-slate-300 p-8 text-center mt-auto">
      <p>&copy; {new Date().getFullYear()} MedDelivery. All rights reserved.</p>
    </footer>
  );
}
