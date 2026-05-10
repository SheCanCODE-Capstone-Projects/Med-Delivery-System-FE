'use client';

import React, { useState } from 'react';

// ─── Types ────────────────────────────────────────────────
interface NavLink {
  label: string;
  href: string;
}

interface StatItem {
  value: string;
  label: string;
}

interface MockupStat {
  value: string;
  label: string;
}

interface OrderItem {
  initial: string;
  name: string;
  orderId: string;
  status: 'NEW' | 'VALIDATED';
}

interface FeatureItem {
  title: string;
  description: string;
  iconPath: string;
}

interface StepItem {
  number: number;
  title: string;
  description: string;
}

interface PortalItem {
  number: string;
  name: string;
  description: string;
}

interface FooterColumn {
  heading: string;
  links: { label: string; href: string }[];
}

// ─── Data ─────────────────────────────────────────────────
const navLinks: NavLink[] = [
  { label: 'Features',       href: '#features'   },
  { label: 'Portals',        href: '#portals'    },
  { label: 'How it works',   href: '#how'        },
  { label: 'For pharmacies', href: '#pharmacies' },
];

const stats: StatItem[] = [
  { value: '48+',   label: 'Partner Pharmacies' },
  { value: '2.8K',  label: 'Active Patients'    },
  { value: '14K',   label: 'Orders Monthly'     },
  { value: '99.4%', label: 'Fulfillment SLA'    },
];

const mockupStats: MockupStat[] = [
  { value: '23',  label: "Today's Orders" },
  { value: '94%', label: 'Fulfillment'    },
  { value: '4',   label: 'On Shift'       },
];

const barHeights: string[] = ['44%','62%','50%','78%','92%','65%','72%'];

const orders: OrderItem[] = [
  { initial: 'S', name: 'Sarah J.', orderId: 'ORD-2847', status: 'NEW'       },
  { initial: 'M', name: 'Mike R.',  orderId: 'ORD-2846', status: 'VALIDATED' },
];

const avatars: { initials: string; bg: string }[] = [
  { initials: 'SJ', bg: 'bg-[#0ABFBC]' },
  { initials: 'MR', bg: 'bg-[#0E7490]' },
  { initials: 'AK', bg: 'bg-[#155E75]' },
  { initials: '+',  bg: 'bg-[#1E4A5A]' },
];

const features: FeatureItem[] = [
  {
    title: 'Location-aware routing',
    description: 'Parallel matching across nearby pharmacies with live coverage windows.',
    iconPath: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  },
  {
    title: 'Insurance verification',
    description: 'Card upload, eligibility checks, copay handling — built into the flow.',
    iconPath: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  },
  {
    title: 'Real-time tracking',
    description: 'From prescription upload to courier pickup, visible at every step.',
    iconPath: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z M12 6v6l4 2',
  },
  {
    title: 'Pharmacist validation',
    description: 'Licensed reviewers approve, substitute, or escalate every prescription safely.',
    iconPath: 'M22 12h-4l-3 9L9 3l-3 9H2',
  },
  {
    title: 'Multi-pharmacy network',
    description: 'Smart fan-out to multiple stores; first-to-confirm wins the order automatically.',
    iconPath: 'M2 3h20v14H2z M8 21h8 M12 17v4',
  },
  {
    title: 'Audit & compliance',
    description: 'Complete action log per prescription with pharmacist ID, timestamps, and history.',
    iconPath: 'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
  },
];

const steps: StepItem[] = [
  {
    number: 1,
    title: 'Request',
    description: 'Upload your prescription or shop privately. Add your insurance details if you have them.',
  },
  {
    number: 2,
    title: 'Validate',
    description: 'A licensed pharmacist reviews, validates and prepares the order at the nearest store.',
  },
  {
    number: 3,
    title: 'Deliver',
    description: 'Track your order in real time, all the way from pickup to your door.',
  },
];

const portals: PortalItem[] = [
  { number: '01', name: 'Patient',     description: 'Order, track and manage your prescriptions from anywhere.'           },
  { number: '02', name: 'Pharmacy',    description: 'Run your store, dispatch orders, manage staff and inventory.'        },
  { number: '03', name: 'Pharmacist',  description: 'Validate prescriptions and dispense safely with a full audit trail.' },
  { number: '04', name: 'Super Admin', description: 'Approve pharmacies and oversee the entire network at a glance.'     },
];

const footerColumns: FooterColumn[] = [
  {
    heading: 'Product',
    links: [
      { label: 'Features',     href: '#features' },
      { label: 'How it works', href: '#how'      },
      { label: 'Security',     href: '#'         },
    ],
  },
  {
    heading: 'Portals',
    links: [
      { label: 'Patient portal',    href: '#portals' },
      { label: 'Pharmacy portal',   href: '#portals' },
      { label: 'Pharmacist portal', href: '#portals' },
      { label: 'Admin portal',      href: '#portals' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About',            href: '#' },
      { label: 'Contact',          href: '#' },
      { label: 'Privacy policy',   href: '#' },
      { label: 'Terms of service', href: '#' },
    ],
  },
];

// ─── Shared: Logo Icon ────────────────────────────────────
function LogoIcon(): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <rect x="1" y="9" width="13" height="8" rx="1.5"
        fill="rgba(255,255,255,0.12)" stroke="white" strokeWidth="1.4" />
      <path d="M14 12h4l2.5 3V17H14V12z"
        stroke="white" strokeWidth="1.4" strokeLinejoin="round"
        fill="rgba(255,255,255,0.08)" />
      <circle cx="5"  cy="17" r="1.5" fill="#0ABFBC" />
      <circle cx="17" cy="17" r="1.5" fill="#0ABFBC" />
      <path d="M6.5 12v2.5M5.2 13.2h2.6"
        stroke="#0ABFBC" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

// ─── Shared: Section Tag ──────────────────────────────────
function SectionTag({ label }: { label: string }): React.JSX.Element {
  return (
    <span className="inline-block bg-[rgba(10,191,188,0.12)] border border-[rgba(10,191,188,0.28)] rounded-full px-4 py-1 text-[0.72rem] font-semibold uppercase tracking-widest text-[#089A97] mb-5">
      {label}
    </span>
  );
}

// ─── Navbar ───────────────────────────────────────────────
function Navbar(): React.JSX.Element {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const closeMenu = (): void => setMenuOpen(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-[6%] h-[72px] bg-[rgba(4,15,26,0.90)] backdrop-blur-xl border-b border-[rgba(10,191,188,0.10)]">

        <a href="#" className="flex items-center gap-3 no-underline group">
          <div className="w-10 h-10 flex-shrink-0 bg-[#0F172A] rounded-[9px] border border-[rgba(10,191,188,0.28)] shadow-[0_0_14px_rgba(10,191,188,0.15)] flex items-center justify-center transition-shadow group-hover:shadow-[0_0_22px_rgba(10,191,188,0.40)]">
            <LogoIcon />
          </div>
          <div className="flex flex-col gap-0">
            <span className="font-bold text-base text-white leading-tight tracking-tight">
              MedDelivery
            </span>
            <span className="text-[0.6rem] text-[#7AABB0] leading-none whitespace-nowrap">
              Your Pharmacy, Delivered to Your Door
            </span>
          </div>
        </a>

        <ul className="hidden md:flex flex-row items-center gap-8 list-none p-0 m-0">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="text-[#7AABB0] no-underline text-sm font-medium transition-colors hover:text-white">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          <a href="#signin" className="text-[#7AABB0] text-sm font-medium border border-[rgba(10,191,188,0.30)] px-4 py-2 rounded-lg no-underline transition-all hover:border-[#0ABFBC] hover:text-white hover:bg-[rgba(10,191,188,0.07)]">
            Sign in
          </a>
          <a href="#signup" className="bg-[#0ABFBC] text-[#040F1A] text-sm font-bold px-4 py-2 rounded-lg no-underline transition-all hover:bg-[#5EDEDD] hover:shadow-[0_0_22px_rgba(10,191,188,0.45)]">
            Get started →
          </a>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex md:hidden flex-col gap-[5px] bg-transparent border-none cursor-pointer p-1"
        >
          <span className="block w-[22px] h-[2px] bg-white rounded-sm" />
          <span className="block w-[22px] h-[2px] bg-white rounded-sm" />
          <span className="block w-[22px] h-[2px] bg-white rounded-sm" />
        </button>
      </nav>

      {menuOpen && (
        <div className="fixed top-[72px] left-0 right-0 z-40 bg-[rgba(4,15,26,0.97)] backdrop-blur-xl border-b border-[rgba(10,191,188,0.10)] flex flex-col px-[6%] pb-8 pt-4">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={closeMenu}
              className="text-[#7AABB0] no-underline text-base font-medium py-4 border-b border-[rgba(10,191,188,0.07)] transition-colors hover:text-[#5EDEDD]">
              {link.label}
            </a>
          ))}
          <div className="flex gap-3 mt-5">
            <a href="#signin" onClick={closeMenu} className="text-[#7AABB0] text-sm font-medium border border-[rgba(10,191,188,0.30)] px-4 py-2 rounded-lg no-underline hover:border-[#0ABFBC] hover:text-white">
              Sign in
            </a>
            <a href="#signup" onClick={closeMenu} className="bg-[#0ABFBC] text-[#040F1A] text-sm font-bold px-4 py-2 rounded-lg no-underline hover:bg-[#5EDEDD]">
              Get started →
            </a>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Hero ─────────────────────────────────────────────────
function Hero(): React.JSX.Element {
  return (
    <section className="relative min-h-screen flex flex-col md:flex-row items-center px-[6%] pt-[120px] pb-[80px] gap-[5%] bg-[#040F1A]">

      <div className="absolute -left-[8%] top-[10%] w-[680px] h-[680px] rounded-full bg-[radial-gradient(ellipse,rgba(10,191,188,0.13)_0%,transparent_68%)] pointer-events-none z-0" />

      {/* LEFT */}
      <div className="flex-1 max-w-[560px] relative z-10">
        <div className="inline-flex items-center gap-2 bg-[rgba(10,191,188,0.10)] border border-[rgba(10,191,188,0.25)] rounded-full px-4 py-[6px] mb-7 text-[0.8rem] text-[#5EDEDD]">
          <span className="w-[6px] h-[6px] rounded-full bg-[#0ABFBC] animate-pulse" />
          Now serving 48 partner pharmacies
        </div>

        <h1 className="font-bold text-[clamp(2.4rem,4.5vw,3.6rem)] leading-[1.1] tracking-tight mb-6 text-white">
          Healthcare delivery,<br />
          <span className="text-[#0ABFBC]">reimagined</span><br />
          for everyone.
        </h1>

        <p className="text-[1.05rem] text-[#7AABB0] leading-[1.75] max-w-[470px] mb-9">
          MedDelivery connects patients, pharmacies and licensed pharmacists
          in one safe, fast, insurance-ready platform — from prescription
          upload to your front door.
        </p>

        <div className="flex gap-4 flex-wrap">
          <a href="#signup" className="bg-[#0ABFBC] text-[#040F1A] font-bold text-base px-8 py-[0.9rem] rounded-xl no-underline inline-flex items-center gap-2 transition-all hover:bg-[#5EDEDD] hover:shadow-[0_0_32px_rgba(10,191,188,0.5)] hover:-translate-y-[2px]">
            Order medicine →
          </a>
          <a href="#pharmacies" className="bg-transparent border border-[rgba(10,191,188,0.35)] text-white font-medium text-base px-8 py-[0.9rem] rounded-xl no-underline inline-flex items-center gap-2 transition-all hover:border-[#0ABFBC] hover:bg-[rgba(10,191,188,0.07)] hover:-translate-y-[2px]">
            Register a pharmacy
          </a>
        </div>

        <div className="flex items-center gap-4 mt-11">
          <div className="flex">
            {avatars.map((av, i) => (
              <span key={av.initials}
                className={`w-[34px] h-[34px] rounded-full border-2 border-[#040F1A] flex items-center justify-center text-[0.68rem] font-bold text-white ${av.bg} ${i === 0 ? 'ml-0' : '-ml-[9px]'}`}>
                {av.initials}
              </span>
            ))}
          </div>
          <div className="text-[0.84rem] text-[#7AABB0]">
            <div className="text-[#F59E0B]">★★★★★</div>
            <span className="text-[#5EDEDD] font-semibold">4.9</span>
            {' · trusted by '}
            <span className="text-[#5EDEDD] font-semibold">2,800+</span> patients
          </div>
        </div>
      </div>

      {/* RIGHT — Mockup */}
      <div className="flex-[1.1] max-w-[560px] relative z-10 flex items-center justify-end pb-9 mt-12 md:mt-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] rounded-full bg-[radial-gradient(ellipse,rgba(10,191,188,0.18)_0%,rgba(10,191,188,0.06)_45%,transparent_72%)] pointer-events-none z-0" />

        <div className="relative z-10 w-full">
          <div className="bg-[#0C2233] border border-[rgba(10,191,188,0.22)] rounded-[18px] overflow-hidden shadow-[0_0_0_1px_rgba(10,191,188,0.10),0_8px_32px_rgba(10,191,188,0.12),0_32px_80px_rgba(0,0,0,0.6)]">

            <div className="bg-[rgba(4,15,26,0.9)] px-4 py-3 flex items-center gap-2 border-b border-[rgba(10,191,188,0.08)]">
              <span className="w-[10px] h-[10px] rounded-full bg-[#FF5F57]" />
              <span className="w-[10px] h-[10px] rounded-full bg-[#FEBC2E]" />
              <span className="w-[10px] h-[10px] rounded-full bg-[#28C840]" />
              <span className="flex-1 text-center text-[0.7rem] text-[#3A6670]">
                app.meddelivery.io/pharmacy
              </span>
            </div>

            <div className="p-[18px]">
              <div className="grid grid-cols-3 gap-[10px] mb-[14px]">
                {mockupStats.map((s) => (
                  <div key={s.label} className="bg-[rgba(10,191,188,0.07)] border border-[rgba(10,191,188,0.13)] rounded-[10px] p-[13px]">
                    <div className="text-[1.45rem] font-bold text-[#0ABFBC]">{s.value}</div>
                    <div className="text-[0.62rem] text-[#7AABB0] mt-[2px] uppercase tracking-wide">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="bg-[rgba(4,15,26,0.5)] border border-[rgba(10,191,188,0.08)] rounded-[10px] p-[14px] mb-[12px]">
                <div className="flex justify-between mb-3">
                  <span className="text-[0.78rem] font-semibold text-white">Weekly orders</span>
                  <span className="text-[0.68rem] text-[#7AABB0]">Apr 8 – Apr 14</span>
                </div>
                <div className="flex items-end gap-[7px] h-[56px]">
                  {barHeights.map((h, i) => (
                    <div key={i}
                      style={{ height: h, background: 'linear-gradient(to top, #089A97, #5EDEDD)' }}
                      className="flex-1 rounded-t-[4px] opacity-90"
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-[7px]">
                {orders.map((order) => (
                  <div key={order.orderId} className="flex items-center gap-[10px] bg-[rgba(4,15,26,0.5)] border border-[rgba(10,191,188,0.08)] rounded-[8px] px-3 py-[9px]">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[0.68rem] font-bold ${order.initial === 'S' ? 'bg-[rgba(10,191,188,0.18)] text-[#0ABFBC]' : 'bg-[rgba(14,116,144,0.25)] text-[#22D3EE]'}`}>
                      {order.initial}
                    </div>
                    <div className="flex-1">
                      <div className="text-[0.76rem] font-semibold text-white">{order.name}</div>
                      <div className="text-[0.62rem] text-[#7AABB0]">{order.orderId}</div>
                    </div>
                    <span className={`text-[0.62rem] font-bold px-2 py-[3px] rounded-full uppercase tracking-wide ${order.status === 'NEW' ? 'bg-[rgba(10,191,188,0.15)] text-[#5EDEDD]' : 'bg-[rgba(34,197,94,0.15)] text-[#4ADE80]'}`}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating toast */}
          <div className="absolute -bottom-5 -left-7 flex items-center gap-[10px] bg-[rgba(10,191,188,0.15)] border border-[rgba(10,191,188,0.35)] rounded-[10px] px-[13px] py-[10px] backdrop-blur-md shadow-[0_8px_32px_rgba(10,191,188,0.2)] min-w-[210px] z-20 animate-[float-toast_3s_ease-in-out_infinite]">
            <div className="w-[22px] h-[22px] rounded-full bg-[#0ABFBC] flex items-center justify-center flex-shrink-0">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <div>
              <strong className="block text-[0.73rem] text-[#5EDEDD]">Prescription validated</strong>
              <span className="text-[0.65rem] text-[#7AABB0]">RX-4820 · 20s ago</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Stats Strip ──────────────────────────────────────────
function StatsStrip(): React.JSX.Element {
  return (
    <div className="bg-[#071828] border-t border-b border-[rgba(10,191,188,0.09)] px-[6%] py-11 grid grid-cols-2 md:grid-cols-4 gap-8">
      {stats.map((stat) => (
        <div key={stat.label}>
          <div className="font-bold text-[2.4rem] text-[#0ABFBC] leading-none tracking-tight">
            {stat.value}
          </div>
          <div className="text-[0.72rem] text-[#7AABB0] mt-[6px] uppercase tracking-widest font-medium">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Features ─────────────────────────────────────────────
function Features(): React.JSX.Element {
  return (
    <section id="features" className="bg-[#F6FAFA] px-[6%] py-[100px] border-t border-[#DFF0F0]">
      <SectionTag label="Platform" />
      <h2 className="font-bold text-[clamp(2.4rem,4.5vw,3.6rem)] leading-[1.1] tracking-tight mb-4 text-[#0F172A]">
        Built for every step of<br />the prescription journey.
      </h2>
      <p className="text-base text-[#4A7A80] leading-[1.75] max-w-[500px] mb-14">
        One platform, four portals. Each one purpose-built for the people who use it every day.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((feat) => (
          <div key={feat.title}
            className="bg-white border border-[#DFF0F0] rounded-2xl p-8 transition-all duration-300 hover:border-[#0ABFBC] hover:-translate-y-[6px] hover:shadow-[0_18px_50px_rgba(10,191,188,0.12)] group">
            <div className="w-[46px] h-[46px] rounded-xl bg-[rgba(10,191,188,0.10)] flex items-center justify-center mb-5 transition-all duration-300 group-hover:bg-[rgba(10,191,188,0.22)] group-hover:scale-110">
              <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" fill="none" stroke="#0ABFBC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={feat.iconPath} />
              </svg>
            </div>
            <h3 className="text-base font-bold text-[#0F172A] mb-[10px]">{feat.title}</h3>
            <p className="text-[0.875rem] text-[#4A7A80] leading-[1.65]">{feat.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────
function HowItWorks(): React.JSX.Element {
  return (
    <section id="how" className="bg-[#EFF9F9] px-[6%] py-[100px] border-t border-[#D5ECEC]">
      <SectionTag label="How it works" />
      <h2 className="font-bold text-[clamp(2.4rem,4.5vw,3.6rem)] leading-[1.1] tracking-tight mb-14 text-[#0F172A]">
        From prescription to<br />doorstep, in three steps.
      </h2>
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-0">
        <div className="hidden md:block absolute top-7 left-[17%] right-[17%] h-[2px] bg-gradient-to-r from-transparent via-[#0ABFBC] to-transparent z-0" />
        {steps.map((step) => (
          <div key={step.number} className="text-center px-6 relative z-10 group">
            <div className="w-14 h-14 rounded-full bg-white border-2 border-[#0ABFBC] flex items-center justify-center font-bold text-base text-[#0ABFBC] mx-auto mb-5 shadow-[0_0_22px_rgba(10,191,188,0.18)] transition-all duration-300 group-hover:bg-[#0ABFBC] group-hover:text-white group-hover:shadow-[0_0_32px_rgba(10,191,188,0.4)] group-hover:scale-110">
              0{step.number}
            </div>
            <h3 className="text-[0.9rem] font-bold text-[#0F172A] mb-2 transition-colors group-hover:text-[#0ABFBC]">
              {step.title}
            </h3>
            <p className="text-[0.8rem] text-[#4A7A80] leading-[1.65]">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Portals ──────────────────────────────────────────────
function Portals(): React.JSX.Element {
  return (
    <section id="portals" className="bg-white px-[6%] py-[100px] border-t border-[#DFF0F0]">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
        <div>
          <SectionTag label="Portals" />
          <h2 className="font-bold text-[clamp(2.4rem,4.5vw,3.6rem)] leading-[1.1] tracking-tight text-[#0F172A]">
            Four experiences,<br />one network.
          </h2>
        </div>
        <p className="text-base text-[#4A7A80] leading-[1.75] max-w-[340px] md:text-right">
          Pick the portal that matches how you&#39;ll use MedDelivery.
          Each one is tailored end-to-end.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {portals.map((portal) => (
          <div key={portal.number}
            className="bg-[#F6FAFA] border border-[#DFF0F0] rounded-2xl p-7 transition-all duration-300 hover:border-[#0ABFBC] hover:-translate-y-[6px] hover:shadow-[0_18px_50px_rgba(10,191,188,0.12)] hover:bg-white">
            <div className="text-[0.72rem] font-bold text-[#089A97] mb-4 tracking-wide">{portal.number}</div>
            <h3 className="font-bold text-[1.15rem] text-[#0F172A] mb-[10px]">{portal.name}</h3>
            <p className="text-[0.84rem] text-[#4A7A80] leading-[1.65]">{portal.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────
function CTA(): React.JSX.Element {
  return (
    <section id="pharmacies" className="bg-[#E4F8F8] border-t border-[#C8E8E8] px-[6%] py-[110px] text-center">
      <SectionTag label="Get started" />
      <h2 className="font-bold text-[clamp(2.4rem,4.5vw,3.6rem)] leading-[1.1] tracking-tight text-[#0F172A] max-w-[620px] mx-auto mb-4">
        Ready to modernise your<br />pharmacy workflow?
      </h2>
      <p className="text-base text-[#4A7A80] leading-[1.75] max-w-[500px] mx-auto mb-11">
        Join 48 partner pharmacies already serving thousands of patients on MedDelivery.
      </p>
      <div className="flex gap-4 justify-center flex-wrap">
        <a href="#signup" className="bg-[#0ABFBC] text-[#040F1A] font-bold text-base px-8 py-[0.9rem] rounded-xl no-underline inline-flex items-center gap-2 transition-all hover:bg-[#089A97] hover:shadow-[0_0_28px_rgba(10,191,188,0.4)] hover:-translate-y-[2px]">
          Sign up free →
        </a>
        <a href="#signin" className="bg-transparent border border-[rgba(8,154,151,0.5)] text-[#0F172A] font-medium text-base px-8 py-[0.9rem] rounded-xl no-underline inline-flex items-center gap-2 transition-all hover:border-[#0ABFBC] hover:bg-[rgba(10,191,188,0.10)] hover:-translate-y-[2px]">
          Log in
        </a>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────
function Footer(): React.JSX.Element {
  return (
    <footer className="bg-[#050E1A] border-t border-[rgba(10,191,188,0.10)] px-[6%] pt-16 pb-8">
      <div className="flex flex-wrap justify-between gap-12 mb-14">
        <div className="max-w-[270px]">
          <a href="#" className="flex items-center gap-3 no-underline mb-4">
            <div className="w-10 h-10 bg-[#0F172A] rounded-[9px] border border-[rgba(10,191,188,0.28)] flex items-center justify-center">
              <LogoIcon />
            </div>
            <div>
              <span className="font-bold text-base text-white block leading-tight">MedDelivery</span>
              <span className="text-[0.6rem] text-[#7AABB0]">Your Pharmacy, Delivered to Your Door</span>
            </div>
          </a>
          <p className="text-[0.875rem] text-[#7AABB0] leading-[1.7]">
            Healthcare delivery, reimagined for everyone. Safe, fast, and insurance-ready.
          </p>
        </div>

        {footerColumns.map((col) => (
          <div key={col.heading}>
            <h4 className="text-[0.8rem] font-bold text-white uppercase tracking-widest mb-4">
              {col.heading}
            </h4>
            {col.links.map((link) => (
              <a key={link.label} href={link.href}
                className="block text-[0.84rem] text-[#7AABB0] no-underline mb-3 transition-all hover:text-[#5EDEDD] hover:pl-[5px]">
                {link.label}
              </a>
            ))}
          </div>
        ))}
      </div>

      <div className="border-t border-[rgba(10,191,188,0.07)] pt-6 flex flex-wrap justify-between gap-4 text-[0.78rem] text-[#3A6670]">
        <span>© 2025 MedDelivery. All rights reserved.</span>
        <span>Built for patients, pharmacies &amp; pharmacists.</span>
      </div>
    </footer>
  );
}

// ─── Main export ──────────────────────────────────────────
/**
 * LandingPage is the main public-facing marketing page.
 * It provides an overview of the platform's features for patients, pharmacies, and partners.
 * 
 * @returns The landing page component.
 */
export default function LandingPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-[#040F1A] text-white overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <StatsStrip />
        <Features />
        <HowItWorks />
        <Portals />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}