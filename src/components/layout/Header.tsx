import React from 'react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-[#0a4843] text-white p-4 shadow-md flex justify-between items-center">
      <Link href="/" className="text-xl font-bold">MedDelivery</Link>
      <nav className="space-x-6">
        <Link href="/login" className="hover:text-teal-200 transition">Log In</Link>
        <Link href="/signup" className="hover:text-teal-200 transition">Sign Up</Link>
        <Link href="/register-pharmacy" className="hover:text-teal-200 transition">For Pharmacies</Link>
      </nav>
    </header>
  );
}
