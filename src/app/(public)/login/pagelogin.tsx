const trustPoints = [
  "Insurance verification built in",
  "Location-based pharmacy matching",
  "Prescription-safe delivery workflow"
];

const accessCards = [
  { title: "Patients", detail: "Track medicine requests, insurance, and delivery." },
  { title: "Pharmacists", detail: "Validate prescriptions and confirm dispensing." },
  { title: "Pharmacies", detail: "Coordinate stock, approvals, and fulfillment." },
  { title: "Super Admin", detail: "Review pharmacy onboarding and activate the network." }
];

const socialProviders = [
  {
    name: "Google",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M21.6 12.23c0-.68-.06-1.33-.17-1.95H12v3.69h5.39a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.97-4.34 2.97-7.26Z"
        />
        <path
          fill="#34A853"
          d="M12 22c2.7 0 4.96-.9 6.61-2.43l-3.24-2.5c-.9.6-2.06.96-3.37.96-2.59 0-4.79-1.75-5.57-4.1H3.08v2.58A9.99 9.99 0 0 0 12 22Z"
        />
        <path
          fill="#FBBC05"
          d="M6.43 13.93A5.98 5.98 0 0 1 6.12 12c0-.67.11-1.31.31-1.93V7.49H3.08A9.99 9.99 0 0 0 2 12c0 1.61.39 3.13 1.08 4.51l3.35-2.58Z"
        />
        <path
          fill="#EA4335"
          d="M12 5.97c1.47 0 2.8.5 3.84 1.49l2.88-2.88C16.95 2.94 14.69 2 12 2a9.99 9.99 0 0 0-8.92 5.49l3.35 2.58c.78-2.35 2.98-4.1 5.57-4.1Z"
        />
      </svg>
    )
  },
  {
    name: "Microsoft",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path fill="#F25022" d="M3 3h8.5v8.5H3z" />
        <path fill="#7FBA00" d="M12.5 3H21v8.5h-8.5z" />
        <path fill="#00A4EF" d="M3 12.5h8.5V21H3z" />
        <path fill="#FFB900" d="M12.5 12.5H21V21h-8.5z" />
      </svg>
    )
  },
  {
    name: "Yahoo",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          fill="#6001D2"
          d="M16.8 3h3.42l-4.12 9.17L17.95 21h-3.3l-1.24-6.14L9.87 21H6.52l5.03-8.95L8.1 3h3.37l2.04 5.64L16.8 3Zm.27 18h2.75l.57-3.22h-2.75L17.07 21Z"
        />
      </svg>
    )
  }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,160,0.12),transparent_34%),linear-gradient(135deg,#edf5f8_0%,#f7f9fc_45%,#eef6f7_100%)] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative flex overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(14,165,160,0.28),transparent_28%),linear-gradient(180deg,#11192f_0%,#0b1326_100%)] px-5 py-8 text-white sm:px-8 lg:min-h-screen lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute -right-16 -top-24 h-76 w-76 rounded-full bg-[rgba(14,165,160,0.22)] blur-xl" />
          <div className="pointer-events-none absolute -left-16 bottom-12 h-64 w-64 rounded-full bg-[rgba(14,165,160,0.12)] blur-xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-br from-teal-400 via-teal-500 to-cyan-600 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)]">
                <svg viewBox="0 0 48 48" className="h-8 w-8" aria-hidden="true">
                  <rect x="6" y="17" width="21" height="11" rx="3.5" fill="white" opacity="0.96" />
                  <path
                    d="M27 20h7.2c1.4 0 2.74.63 3.66 1.72L41 25.6V31h-4.2"
                    fill="none"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12.5 12h5v3.4h3.5v5h-3.5v3.4h-5v-3.4H9v-5h3.5V12Z"
                    fill="#0f766e"
                  />
                  <path
                    d="M10 22.5h13"
                    fill="none"
                    stroke="#0f766e"
                    strokeWidth="2.3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M31 20v7.2h9.2"
                    fill="none"
                    stroke="#0f766e"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6.5 31h2.7M38.8 31H41"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                  <circle cx="14" cy="31.5" r="4.2" fill="#0f172a" />
                  <circle cx="34" cy="31.5" r="4.2" fill="#0f172a" />
                  <circle cx="14" cy="31.5" r="1.7" fill="white" opacity="0.9" />
                  <circle cx="34" cy="31.5" r="1.7" fill="white" opacity="0.9" />
                  <path
                    d="M4.8 18.5c2-.2 3.55-1.08 4.64-2.64M4.2 22.6c2.6-.13 4.55-1.12 5.86-2.98"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    opacity="0.82"
                  />
                </svg>
              </div>

              <div>
                <p className="text-base font-bold">MedDelivery</p>
                <p className="mt-1 text-sm text-white/65">Trusted digital healthcare access</p>
              </div>
            </div>

            <div className="relative z-10 mt-12 max-w-2xl lg:mt-16">
              <span className="inline-flex min-h-9 items-center rounded-full border border-white/10 bg-white/5 px-4 text-sm text-white/75">
                Care network for patients, pharmacies and pharmacists
              </span>

              <h1 className="mt-6 text-5xl leading-none font-semibold tracking-[-0.06em] sm:text-6xl lg:text-[4.6rem]">
                Smarter medicine access,
                <br />
                <span className="text-teal-400">designed for trust.</span>
              </h1>

              <p className="mt-4 max-w-xl text-base leading-7 text-white/70 sm:text-[1.05rem]">
                A secure digital front door for insurance-ready medicine delivery, prescription
                validation, and nearby pharmacy coordination.
              </p>
            </div>

            <ul className="relative z-10 mt-9 grid gap-4">
              {trustPoints.map((item) => (
                <li key={item} className="flex items-center gap-3 text-white/85">
                  <span className="h-4 w-4 rounded-full border border-teal-300/80 shadow-[inset_0_0_0_4px_rgba(26,196,189,0.18)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="relative z-10 mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {accessCards.map((card) => (
                <article
                  key={card.title}
                  className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                >
                  <p className="font-bold">{card.title}</p>
                  <span className="mt-2 block text-sm leading-6 text-white/70">{card.detail}</span>
                </article>
              ))}
            </div>
          </div>

          <p className="relative z-10 mt-8 text-sm text-white/40 lg:mt-10">
            2026 MedDelivery. Safe delivery, verified every step.
          </p>
        </section>

        <section className="grid place-items-center px-5 py-8 sm:px-8">
          <div className="w-full max-w-xl rounded-4xl border border-white/70 bg-white/85 p-6 shadow-[0_30px_70px_rgba(11,19,39,0.18)] backdrop-blur-xl sm:p-9">
            <div className="grid grid-cols-3 gap-2" aria-hidden="true">
              <span className="h-1 rounded-full bg-linear-to-r from-teal-400 to-teal-600" />
              <span className="h-1 rounded-full bg-slate-200" />
              <span className="h-1 rounded-full bg-slate-200" />
            </div>

            <div className="mt-7">
              <p className="text-xs font-bold tracking-[0.14em] text-teal-700 uppercase">
                User sign in
              </p>
              <h2 className="mt-3 text-4xl leading-none font-semibold tracking-tighter text-slate-900 sm:text-[2.65rem]">
                Welcome back to MedDelivery
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">
                Use a social account for faster access, or continue with phone and OTP once the
                backend is connected.
              </p>
            </div>

            <form className="mt-8 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-bold text-slate-600">Phone number</span>
                <input
                  type="tel"
                  placeholder="+250 7XX XXX XXX"
                  className="min-h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-slate-600">User role</span>
                <select
                  defaultValue="patient"
                  className="min-h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15"
                >
                  <option value="patient">Patient</option>
                  <option value="pharmacist">Pharmacist</option>
                  <option value="pharmacy">Pharmacy manager</option>
                  <option value="super-admin">Super admin</option>
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-slate-600">One-time password</span>
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    className="min-h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15"
                  />
                  <button
                    type="button"
                    className="min-h-14 rounded-2xl bg-teal-600/10 px-5 font-bold text-teal-700 transition hover:-translate-y-0.5 hover:bg-teal-600/15"
                  >
                    Send OTP
                  </button>
                </div>
              </label>

              <button
                type="submit"
                className="min-h-14 rounded-2xl bg-linear-to-br from-teal-500 to-teal-600 font-bold text-white shadow-[0_18px_30px_rgba(14,165,160,0.22)] transition hover:-translate-y-0.5"
              >
                Sign in
              </button>
            </form>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {socialProviders.map((provider) => (
                <button
                  key={provider.name}
                  type="button"
                  className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 font-semibold text-slate-900 transition hover:-translate-y-0.5"
                >
                  {provider.icon}
                  <span>{provider.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
