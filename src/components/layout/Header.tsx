import React from 'react';
import Link from 'next/link';
import MedDeliveryLogo from '../brand/MedDeliveryLogo';

export default function Header() {
  return (
    <header className="bg-[#040F1A] text-white px-[6%] h-[72px] flex justify-between items-center shadow-[0_4px_20px_rgba(10,191,188,0.1)] border-b border-[rgba(10,191,188,0.1)] relative z-40">
      <MedDeliveryLogo href="/" theme="dark" size="sm" showTagline={false} />
      <nav className="flex items-center gap-6">
        <Link href="/auth/pharmacy-signup" className="text-[#7AABB0] text-sm font-medium hover:text-[#0ABFBC] transition-colors">For Pharmacies</Link>
        <div className="h-4 w-px bg-[rgba(10,191,188,0.2)]"></div>
        <Link href="/auth/login" className="text-[#7AABB0] text-sm font-medium border border-[rgba(10,191,188,0.30)] px-4 py-2 rounded-lg transition-all hover:border-[#0ABFBC] hover:text-white hover:bg-[rgba(10,191,188,0.07)]">Log In</Link>
        <Link href="/auth/signup" className="bg-[#0ABFBC] text-[#040F1A] text-sm font-bold px-4 py-2 rounded-lg transition-all hover:bg-[#5EDEDD] hover:shadow-[0_0_22px_rgba(10,191,188,0.45)]">Sign Up</Link>
      </nav>
    </header>
  );
}
