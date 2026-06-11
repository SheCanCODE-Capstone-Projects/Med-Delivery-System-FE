'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import heroImage from '@/assets/image.png';
import MedDeliveryLogo from "@/components/brand/MedDeliveryLogo";

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface NavLink { label: string; href: string }
interface StepItem { icon: React.ReactNode; title: string; description: string }
interface FeatureItem { icon: React.ReactNode; title: string; description: string }
interface TestimonialItem {
  stars: number; quote: string;
  name: string; role: string; initial: string;
}
interface FooterColumn { heading: string; links: { label: string; href: string }[] }

/* ─── Data ──────────────────────────────────────────────────────────────── */

const navLinks: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Benefits', href: '#features' },
  { label: 'Reviews', href: '#reviews' },
];

const steps: StepItem[] = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
    title: 'Register',
    description: 'Create your account and set up your patient profile quickly.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M16 8H8M16 12H8M12 16H8" />
      </svg>
    ),
    title: 'Upload Prescription',
    description: 'Snap a photo or upload your prescription directly in the app.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    title: 'Choose Pharmacy',
    description: 'Pick from nearby verified pharmacies that carry your medication.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Pharmacist Confirms',
    description: 'A licensed pharmacist reviews your order and confirms it safely.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    title: 'Delivered',
    description: 'Your medication arrives at your door, tracked every step of the way.',
  },
];

const features: FeatureItem[] = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: '100% Verified',
    description: 'Every single order is thoroughly reviewed and approved by experienced, certified pharmacists before it dispatches from our partner pharmacies.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: '24/7 Available',
    description: 'Upload your prescription at any time of the day or night. We process your requests around the clock for maximum convenience.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: 'Private & Discreet',
    description: 'Your medical information is kept strictly confidential, and all deliveries are made in discreetly branded packaging for your privacy.',
  },
];

const testimonials: TestimonialItem[] = [
  {
    stars: 5,
    quote: '"MedDelivery has been an absolute lifesaver. Uploading my prescription is so easy, and the delivery is always exactly on time. I never have to wait in line again."',
    name: 'Amina Uwase',
    role: 'Verified Patient',
    initial: 'AU',
  },
  {
    stars: 4,
    quote: '"I love that I can choose my preferred local pharmacy and have it delivered right to my door. Highly recommended this app to all my friends and family who struggle with errands."',
    name: 'Jean-Pierre Habimana',
    role: 'Verified Patient',
    initial: 'JH',
  },
  {
    stars: 5,
    quote: '"MedDelivery has given me the healthcare delivery I need. It is fast, secure, and extremely convenient service that I will definitely continue using."',
    name: 'Marie-Claire Mukamana',
    role: 'Verified Patient',
    initial: 'MC',
  },
];

const footerColumns: FooterColumn[] = [
  {
    heading: 'Product',
    links: [
      { label: 'How it Works', href: '#how' },
      { label: 'Pharmacies', href: '/auth/pharmacy-signup' },
      { label: 'Pricing', href: '#' },
      { label: 'Security', href: '#features' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Us', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Partners', href: '#' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
    ],
  },
];

const trustStats = [
  { value: '500+', label: 'Patients Served' },
  { value: '20+', label: 'Partner Pharmacies' },
  { value: '24/7', label: 'Support Available' },
];

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-[2px] mb-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="w-4 h-4" fill={i < count ? '#F59E0B' : '#d1d5db'}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

/* ─── Navbar ─────────────────────────────────────────────────────────────── */

function Navbar(): React.JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-[6%] h-[68px]"
        style={{ background: '#0E9384', borderBottom: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 2px 12px rgba(14,147,132,0.25)' }}
      >
        <MedDeliveryLogo theme="dark" size="sm" showTagline={true} />

        <ul className="hidden md:flex items-center gap-9 list-none p-0 m-0">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium no-underline transition-colors"
                style={{ color: 'rgba(255,255,255,0.85)' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-sm font-medium no-underline px-5 py-2 rounded-lg transition-all"
            style={{ color: '#fff', background: 'transparent', border: '1px solid rgba(255,255,255,0.45)' }}
          >
            Log In
          </Link>
          <Link
            href="/auth/signup"
            className="text-sm font-bold no-underline px-5 py-2 rounded-lg transition-all"
            style={{ background: '#fff', color: '#0E9384' }}
          >
            Sign Up
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex md:hidden flex-col gap-[5px] bg-transparent border-none cursor-pointer p-1"
        >
          {[0, 1, 2].map((i) => (
            <span key={i} className="block w-[22px] h-[2px] rounded-sm" style={{ background: '#fff' }} />
          ))}
        </button>
      </nav>

      {menuOpen && (
        <div
          className="fixed top-[68px] left-0 right-0 z-40 flex flex-col px-[6%] pb-6 pt-3"
          style={{ background: '#fff', borderBottom: '1px solid #e8f5f3', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="no-underline text-base font-medium py-4 transition-colors"
              style={{ color: '#4B5563', borderBottom: '1px solid #f3f4f6' }}
            >
              {link.label}
            </a>
          ))}
          <div className="flex gap-3 mt-4">
            <Link href="/auth/login" onClick={() => setMenuOpen(false)}
              className="text-sm font-medium no-underline px-4 py-2 rounded-lg border"
              style={{ color: '#374151', borderColor: '#e5e7eb' }}>
              Log In
            </Link>
            <Link href="/auth/signup" onClick={() => setMenuOpen(false)}
              className="text-sm font-bold no-underline px-4 py-2 rounded-lg"
              style={{ background: '#02C39A', color: '#fff' }}>
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Hero ───────────────────────────────────────────────────────────────── */

function Hero(): React.JSX.Element {
  return (
    <section
      className="flex flex-col md:flex-row items-center justify-between px-[6%] pt-[100px] pb-[72px] gap-10 relative overflow-hidden"
      style={{ background: '#fff', minHeight: '100vh' }}
    >
      {/* Subtle background accent */}
      <div
        className="absolute top-0 left-0 w-[600px] h-[600px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 0% 0%, rgba(2,195,154,0.08) 0%, transparent 70%)',
          zIndex: 0,
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-[400px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 100% 100%, rgba(14,147,132,0.06) 0%, transparent 70%)',
          zIndex: 0,
        }}
      />

      {/* Left – Copy */}
      <div className="flex-1 max-w-[520px] relative z-10">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
          style={{ background: 'rgba(2,195,154,0.1)', color: '#0E9384', border: '1px solid rgba(2,195,154,0.25)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
          Now available in Rwanda
        </div>

        <h1 className="font-bold leading-[1.15] tracking-tight mb-5" style={{ fontSize: 'clamp(2rem,4vw,2.9rem)', color: '#0F172A' }}>
          Your Pharmacy,<br />
          <span style={{ color: '#02C39A' }}>Delivered to Your Door</span>
        </h1>
        <p className="leading-[1.75] mb-8 max-w-[440px]" style={{ color: '#6B7280', fontSize: '1rem' }}>
          Order your prescription medicines online safely and securely. Our licensed pharmacists review every order before it gets dispatched directly to you.
        </p>

        <div className="flex gap-3 flex-wrap mb-8">
          <Link
            href="/auth/signup"
            className="font-bold no-underline px-7 py-3 rounded-lg transition-all inline-flex items-center gap-2"
            style={{ background: '#02C39A', color: '#fff', fontSize: '0.95rem', boxShadow: '0 4px 14px rgba(2,195,154,0.35)' }}
          >
            Order Now
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
          <Link
            href="/auth/pharmacy-signup"
            className="font-medium no-underline px-7 py-3 rounded-lg transition-all inline-flex items-center border"
            style={{ color: '#0E9384', borderColor: '#0E9384', background: 'transparent', fontSize: '0.95rem' }}
          >
            For Pharmacies
          </Link>
        </div>

        {/* Trust stats */}
        <div className="flex flex-wrap gap-5">
          {trustStats.map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#02C39A' }} />
              <span className="text-sm font-bold" style={{ color: '#0F172A' }}>{s.value}</span>
              <span className="text-sm" style={{ color: '#9CA3AF' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right – Image */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        <div
          className="rounded-3xl overflow-hidden w-full relative"
          style={{ maxHeight: '500px', boxShadow: '0 20px 60px rgba(14,147,132,0.15), 0 4px 16px rgba(0,0,0,0.08)' }}
        >
          <img
            src={heroImage.src}
            alt="Pharmacy delivery person handing a package"
            className="w-full h-full object-cover"
            style={{ maxHeight: '500px' }}
          />
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works ────────────────────────────────────────────────────────── */

function HowItWorks(): React.JSX.Element {
  return (
    <section id="how" className="px-[6%] py-[90px]" style={{ background: '#0E9384' }}>
      <div className="text-center mb-16">
        <h2 className="font-bold mb-3" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', color: '#fff' }}>
          How It Works
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '1rem' }}>
          Receive your medication safely and securely in a few simple steps.
        </p>
      </div>

      <div className="relative flex flex-col md:flex-row items-start justify-center gap-8">
        {/* Dotted connector – desktop only */}
        <div className="hidden md:block absolute top-[28px] left-[12%] right-[12%] h-[2px] z-0"
          style={{ borderTop: '2px dashed rgba(255,255,255,0.3)' }}
        />

        {steps.map((step, idx) => (
          <div key={idx} className="flex flex-col items-center text-center z-10 flex-1" style={{ maxWidth: '180px', margin: '0 auto' }}>
            {/* Step number */}
            <div className="text-xs font-black mb-2 tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
              STEP {idx + 1}
            </div>
            {/* Icon circle */}
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
              style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', border: '2px solid rgba(255,255,255,0.35)' }}
            >
              {step.icon}
            </div>
            <h3 className="font-bold text-sm mb-2" style={{ color: '#fff' }}>{step.title}</h3>
            <p className="text-xs leading-[1.65]" style={{ color: 'rgba(255,255,255,0.75)' }}>{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Why Choose ─────────────────────────────────────────────────────────── */

function WhyChoose(): React.JSX.Element {
  return (
    <section id="features" className="px-[6%] py-[90px]" style={{ background: '#fff' }}>
      <div className="text-center mb-12">
        <h2 className="font-bold mb-3" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', color: '#0F172A' }}>
          Why Choose MedDelivery?
        </h2>
        <p style={{ color: '#6B7280', fontSize: '1rem' }}>
          We prioritize your health, privacy, and convenience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feat, idx) => (
          <div
            key={idx}
            className="rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1"
            style={{
              background: '#f8fffe',
              border: '1px solid #d8f5ef',
              borderLeft: '4px solid #02C39A',
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
              style={{ background: 'rgba(2,195,154,0.12)', color: '#02C39A' }}
            >
              {feat.icon}
            </div>
            <h3 className="font-bold text-base mb-3" style={{ color: '#0F172A' }}>{feat.title}</h3>
            <p className="text-sm leading-[1.7]" style={{ color: '#6B7280' }}>{feat.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Testimonials ───────────────────────────────────────────────────────── */

function Testimonials(): React.JSX.Element {
  return (
    <section id="reviews" className="px-[6%] py-[90px]" style={{ background: '#f8fffe', borderTop: '1px solid #e8f5f3' }}>
      <div className="text-center mb-12">
        <h2 className="font-bold mb-3" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', color: '#0F172A' }}>
          Patient Success Stories
        </h2>
        <div className="flex items-center justify-center gap-1">
          {[0, 1, 2, 3, 4].map(i => (
            <svg key={i} viewBox="0 0 20 20" fill="#F59E0B" className="w-4 h-4">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="ml-2 text-sm font-medium" style={{ color: '#6B7280' }}>5.0 · 200+ reviews</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, idx) => (
          <div
            key={idx}
            className="rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
            style={{ background: '#fff', border: '1px solid #d8f5ef', boxShadow: '0 2px 12px rgba(14,147,132,0.07)' }}
          >
            <div>
              <StarRating count={t.stars} />
              <p className="text-sm leading-[1.75] mb-6" style={{ color: '#374151' }}>{t.quote}</p>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: '#0E9384' }}
              >
                {t.initial}
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: '#0F172A' }}>{t.name}</div>
                <div className="text-xs" style={{ color: '#9CA3AF' }}>{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── CTA Strip ──────────────────────────────────────────────────────────── */

function CTAStrip(): React.JSX.Element {
  return (
    <section className="px-[6%] py-[72px]" style={{ background: '#0E9384' }}>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="font-bold mb-3" style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', color: '#fff' }}>
          Ready to get started?
        </h2>
        <p className="mb-8" style={{ color: 'rgba(255,255,255,0.82)', fontSize: '1rem' }}>
          No prescription delays, no queues. Your medication delivered in minutes.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/auth/signup"
            className="font-bold no-underline px-8 py-3 rounded-lg transition-all inline-flex items-center gap-2"
            style={{ background: '#fff', color: '#0E9384', fontSize: '0.95rem', boxShadow: '0 4px 14px rgba(0,0,0,0.12)' }}
          >
            Order Now
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
          <Link
            href="/auth/pharmacy-signup"
            className="font-medium no-underline px-8 py-3 rounded-lg transition-all inline-flex items-center border"
            style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.55)', background: 'transparent', fontSize: '0.95rem' }}
          >
            Register Your Pharmacy
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────────────── */

function Footer(): React.JSX.Element {
  return (
    <footer className="px-[6%] pt-14 pb-8" style={{ background: '#fff', borderTop: '1px solid #e8f5f3' }}>
      <div className="flex flex-wrap justify-between gap-10 mb-12">
        {/* Brand */}
        <div className="max-w-[260px]">
          <MedDeliveryLogo theme="light" size="sm" showTagline={false} className="mb-4" />
          <p className="text-sm leading-[1.75]" style={{ color: '#6B7280' }}>
            Your Pharmacy, Delivered to Your Door. <br />Safe, secure, and completely discreet.
          </p>
        </div>

        {footerColumns.map((col) => (
          <div key={col.heading}>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#111827' }}>
              {col.heading}
            </h4>
            {col.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block text-sm no-underline mb-3 transition-colors"
                style={{ color: '#6B7280' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#02C39A')}
                onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}
              >
                {link.label}
              </a>
            ))}
          </div>
        ))}
      </div>

      <div
        className="pt-6 flex flex-wrap justify-between gap-4 text-xs"
        style={{ borderTop: '1px solid #f3f4f6', color: '#9CA3AF' }}
      >
        <span>© 2026 MedDelivery. All rights reserved.</span>
        <span style={{ color: '#d1d5db' }}>Made with ❤️ for Rwanda</span>
      </div>
    </footer>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function LandingPage(): React.JSX.Element {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#fff', color: '#0F172A', scrollBehavior: 'smooth' }}>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <WhyChoose />
        <Testimonials />
        <CTAStrip />
      </main>
      <Footer />
    </div>
  );
}
