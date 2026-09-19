"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const steps = [
  [
    "1",
    "Capture",
    "Structured reports with location, evidence, and essential incident details.",
  ],
  [
    "2",
    "Route",
    "Match reports to verified responders who cover the affected area.",
  ],
  [
    "3",
    "Respond",
    "Give teams one clear incident view and meaningful status updates.",
  ],
];

export default function HomePage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="overflow-hidden bg-[#f8f7f2] text-[#17362c]">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label="WildCare home"
        >
          <span className="grid size-10 place-items-center rounded-full bg-[#1f6b52] text-lg text-white">
            ✦
          </span>
          <span className="text-xl font-bold tracking-tight">WildCare</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-[#416156] md:flex">
          <a href="#how-it-works" className="transition hover:text-[#1f6b52]">
            How it works
          </a>
          <a href="#partners" className="transition hover:text-[#1f6b52]">
            Partners
          </a>
          <a href="#contact" className="transition hover:text-[#1f6b52]">
            Contact
          </a>
        </nav>
        <Link
          href="/login"
          className="rounded-full bg-[#17362c] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#285646]"
        >
          Dashboard login
        </Link>
      </header>

      <section className="relative mx-auto grid max-w-7xl gap-12 px-6 pb-24 pt-16 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pb-32 lg:pt-24">
        <div className="relative z-10 max-w-2xl">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#b8d2ba] bg-[#eef6e9] px-4 py-2 text-sm font-semibold text-[#286042]">
            <span className="size-2 rounded-full bg-[#61aa52]" /> Wildlife
            response, better connected
          </p>
          <h1 className="text-5xl font-bold leading-[1.04] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            Every wildlife emergency deserves a faster path to help.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-[#526c61]">
            WildCare helps citizens report incidents safely and connects them
            with verified local responders equipped to act.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <a
              href="#contact"
              className="rounded-full bg-[#e87d3f] px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_25px_rgba(232,125,63,.22)] transition hover:-translate-y-0.5 hover:bg-[#cf6830]"
            >
              Partner with WildCare
            </a>
            <a
              href="#how-it-works"
              className="rounded-full border border-[#b9c9bc] bg-white px-6 py-3.5 text-sm font-bold transition hover:border-[#1f6b52]"
            >
              See how it works
            </a>
          </div>
          <div className="mt-12 flex items-center gap-4 text-sm text-[#526c61]">
            <div className="flex -space-x-2">
              {["#d47c55", "#5b9573", "#d7aa4c", "#6689a3"].map(color => (
                <span
                  key={color}
                  className="size-8 rounded-full border-2 border-[#f8f7f2]"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            Built for government, NGOs, and local rescue teams.
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-lg lg:mt-3">
          <div className="absolute -right-16 -top-16 size-52 rounded-full bg-[#d8eac7] blur-3xl" />
          <div className="relative overflow-hidden rounded-[2rem] bg-[#1f6b52] p-5 shadow-[0_30px_80px_rgba(28,82,60,.26)]">
            <div className="rounded-[1.4rem] bg-[#f8f7f2] p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">Incoming incident</span>
                <span className="rounded-full bg-[#fbe4d1] px-3 py-1 text-xs font-bold text-[#b95522]">
                  HIGH PRIORITY
                </span>
              </div>
              <div className="mt-5 rounded-2xl bg-[#d8e6d4] p-5">
                <p className="text-xs font-bold uppercase tracking-[.15em] text-[#52715d]">
                  Possible injured animal
                </p>
                <p className="mt-2 text-2xl font-bold">
                  Location shared securely
                </p>
                <div className="mt-5 h-28 rounded-xl bg-[radial-gradient(circle_at_34%_44%,#f6e8b9_0_8%,transparent_9%),radial-gradient(circle_at_70%_45%,#5f8a5c_0_10%,transparent_11%),linear-gradient(135deg,#9dba80,#d8c278)]" />
              </div>
              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[#dce5d9] p-4">
                <span className="grid size-10 place-items-center rounded-full bg-[#eaf4e7] text-[#276347]">
                  ✓
                </span>
                <div>
                  <p className="font-bold">Responder matched</p>
                  <p className="text-sm text-[#587064]">
                    Aligarh Wildlife Rescue
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#dce5d9] p-4">
                <span className="grid size-10 place-items-center rounded-full bg-[#fff0e4] text-[#c4622d]">
                  →
                </span>
                <div>
                  <p className="font-bold">Ready to dispatch</p>
                  <p className="text-sm text-[#587064]">
                    Your team&apos;s preferred channel
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-[#17362c] py-20 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[.18em] text-[#b5d7a8]">
            One connected response loop
          </p>
          <div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h2 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
              From a concerned citizen to the right local responder.
            </h2>
            <p className="max-w-sm text-[#b9cfc4]">
              Clear information helps teams spend less time chasing details and
              more time responding.
            </p>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {steps.map(([number, title, description]) => (
              <article
                key={number}
                className="rounded-3xl border border-white/15 bg-white/5 p-7"
              >
                <span className="text-4xl font-bold text-[#b5d7a8]">
                  {number}
                </span>
                <h3 className="mt-10 text-2xl font-bold">{title}</h3>
                <p className="mt-3 leading-7 text-[#c7d8d0]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="partners" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.18em] text-[#579266]">
              Made for response networks
            </p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              One platform, flexible ways to respond.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              "Government department",
              "Wildlife NGO",
              "Private rescue team",
            ].map((type, index) => (
              <article
                key={type}
                className="rounded-3xl border border-[#dbe4d9] bg-white p-6"
              >
                <span className="text-2xl">{["🏛", "🌿", "✚"][index]}</span>
                <h3 className="mt-10 text-lg font-bold">{type}</h3>
                <p className="mt-3 text-sm leading-6 text-[#60776c]">
                  Receive relevant incidents through the WildCare dashboard or
                  your existing communication channel.
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="bg-[#e8f1e2] py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.18em] text-[#579266]">
              Join the response network
            </p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Let&apos;s make sure help can find the right place.
            </h2>
            <p className="mt-6 max-w-md text-lg leading-8 text-[#526c61]">
              Tell us about your organization and the best way to reach your
              team. We&apos;ll help you explore how WildCare fits your response
              process.
            </p>
            <div className="mt-10 rounded-2xl border border-[#cce0c8] bg-white/70 p-5 text-sm text-[#426256]">
              <strong className="block text-[#17362c]">
                Your workflow stays yours.
              </strong>
              Use the dashboard, email, WhatsApp, voice alerts, or a connected
              system—WildCare is designed to work around your operations.
            </div>
          </div>
          <form
            onSubmit={handleSubmit}
            className="rounded-[2rem] bg-white p-6 shadow-[0_20px_60px_rgba(55,93,59,.12)] sm:p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold">
                Organization name
                <input
                  required
                  name="organizationName"
                  className="mt-2 w-full rounded-xl border border-[#d7e1d4] px-4 py-3 font-normal outline-none transition focus:border-[#1f6b52] focus:ring-2 focus:ring-[#b5d7a8]"
                  placeholder="Your organization"
                />
              </label>
              <label className="text-sm font-semibold">
                Organization type
                <select
                  required
                  name="organizationType"
                  defaultValue=""
                  className="mt-2 w-full rounded-xl border border-[#d7e1d4] bg-white px-4 py-3 font-normal outline-none transition focus:border-[#1f6b52] focus:ring-2 focus:ring-[#b5d7a8]"
                >
                  <option value="" disabled>
                    Select one
                  </option>
                  <option>Government department</option>
                  <option>Wildlife NGO</option>
                  <option>Private rescue team</option>
                  <option>Veterinary organization</option>
                  <option>Other</option>
                </select>
              </label>
              <label className="text-sm font-semibold">
                Contact name
                <input
                  required
                  name="contactName"
                  className="mt-2 w-full rounded-xl border border-[#d7e1d4] px-4 py-3 font-normal outline-none transition focus:border-[#1f6b52] focus:ring-2 focus:ring-[#b5d7a8]"
                  placeholder="Your full name"
                />
              </label>
              <label className="text-sm font-semibold">
                Email address
                <input
                  required
                  type="email"
                  name="email"
                  className="mt-2 w-full rounded-xl border border-[#d7e1d4] px-4 py-3 font-normal outline-none transition focus:border-[#1f6b52] focus:ring-2 focus:ring-[#b5d7a8]"
                  placeholder="you@organization.org"
                />
              </label>
            </div>
            <label className="mt-5 block text-sm font-semibold">
              How can we reach your team?
              <textarea
                required
                name="message"
                rows={4}
                className="mt-2 w-full resize-none rounded-xl border border-[#d7e1d4] px-4 py-3 font-normal outline-none transition focus:border-[#1f6b52] focus:ring-2 focus:ring-[#b5d7a8]"
                placeholder="Share your service area, preferred contact method, and anything we should know."
              />
            </label>
            <button
              type="submit"
              className="mt-6 w-full rounded-xl bg-[#1f6b52] px-5 py-3.5 font-bold text-white transition hover:bg-[#17362c]"
            >
              Request a conversation
            </button>
            {submitted && (
              <p
                className="mt-4 rounded-xl bg-[#edf7e9] p-3 text-sm font-medium text-[#276347]"
                role="status"
              >
                Thank you. Your partnership request is ready for review.
              </p>
            )}
          </form>
        </div>
      </section>
      <footer className="bg-[#17362c] py-8 text-sm text-[#b9cfc4]">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-6 sm:flex-row lg:px-8">
          <span>
            © {new Date().getFullYear()} WildCare. Better connected wildlife
            response.
          </span>
          <Link
            href="/login"
            className="font-semibold text-white hover:text-[#b5d7a8]"
          >
            Dashboard login →
          </Link>
        </div>
      </footer>
    </main>
  );
}
