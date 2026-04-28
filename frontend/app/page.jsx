"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";


export default function HomePage() {
  /* 
     SLIDER DATA (Body Section)
   */
  const slides = useMemo(
    () => [
      { src: "/slides/slide-1.png", alt: "School image 1", caption: "From Outside" },
      { src: "/slides/slide-2.png", alt: "School image 2", caption: "Campus View" },
    ],
    []
  
  );

  // active slide index (0 or 1 for 2 slides)
  const [activeIndex, setActiveIndex] = useState(0);

  /* -----------------------------------------
     AUTO PLAY LOGIC (4second)
     */
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) =>  (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [slides.length]);

  // Arrow controls
  const goPrev = () =>
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  const goNext = () => setActiveIndex((prev) => (prev + 1) % slides.length);

  return (
    <main className="min-h-screen bg-[#F8F8F8]">
      {/* 
           TOP INFO BAR
          - Shows phone + email (top dark strip)
          */}
      <TopInfoBar />

      {/* 
          2) HEADER + NAVBAR + PORTALS
          */}
      <HeaderAndNavbar />

      {/* 
          3) BODY SLIDER
         = */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="overflow-hidden rounded-xl bg-white shadow">
          <div className="relative h-[260px] w-full sm:h-[520px]">
            {/* Slide image */}
            <Image
              src={slides[activeIndex].src}
              alt={slides[activeIndex].alt}
              fill
              className="object-cover"
              priority
            />

            {/* Prev Arrow */}
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/30 px-3 py-2 text-white hover:bg-black/50"
              aria-label="Previous slide"
            >
              ‹
            </button>

            {/* Next Arrow */}
            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/30 px-3 py-2 text-white hover:bg-black/50"
              aria-label="Next slide"
            >
              ›
            </button>

            {/* Caption Overlay like your screenshot */}
            <div className="absolute bottom-6 left-1/2 w-[80%] -translate-x-1/2 rounded bg-black/35 px-4 py-3 text-center text-white backdrop-blur-sm">
              <p className="text-sm font-semibold sm:text-base">
                {slides[activeIndex].caption}
              </p>

              {/* Dots (click to go to specific slide) */}
              <div className="mt-2 flex items-center justify-center gap-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`h-2 w-6 rounded-full ${
                      idx === activeIndex ? "bg-white" : "bg-white/40"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

     
      <Footer />
    </main>
  );
}

/* ==========================================================
   COMPONENT: TopInfoBar
   - Used by HomePage (called at top)
   - Keeps HomePage clean & organized
   ========================================================== */
function TopInfoBar() {
  return (
    <div className="w-full bg-slate-800 text-slate-100">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 text-xs sm:text-sm">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <span>📞</span>
            <span>01804587213</span>
          </span>

          <span className="flex items-center gap-2">
            <span>✉️</span>
            <span>gks@gmail.com</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* 
   COMPONENT: HeaderAndNavbar
   - Called by HomePage
   - Contains:
     1) Logo + school name + small buttons
     2) NOTICE bar
     3) Navbar links
     4) Portal buttons row
   */
function HeaderAndNavbar() {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const data = await apiRequest("/notices");
        if (Array.isArray(data)) {
          // Filter notices meant for Homepage
          const homepageNotices = data.filter(notice => 
            notice.category === "Homepage" || 
            notice.category === "ALL" || 
            (notice.target_audience && notice.target_audience.includes("Homepage")) ||
            (notice.targetAudience && notice.targetAudience.includes("Homepage"))
          );
          setNotices(homepageNotices);
        }
      } catch (error) {
        console.error("Failed to fetch notices:", error);
      }
    };
    fetchNotices();
  }, []);

  return (
    <header>
      {/* Header (logo + title + right buttons) */}
      <div className="bg-[#F8F8F8]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          {/* Left: logo + title */}
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-14 overflow-hidden rounded bg-white shadow">
              {/* logo : frontend/public/logo.png */}
              <Image src="/logo.png" alt="School Logo" fill className="object-contain" />
            </div>

            <div>
              <h1 className="text-lg font-semibold text-blue-700 sm:text-xl">
                Global Knowledge School
              </h1>
              <p className="text-xs text-slate-500 sm:text-sm">
                “শিক্ষার মান উন্নয়নে নিরলস প্রচেষ্টা অব্যাহত...”
              </p>
            </div>
          </div>

          {/* Right: small buttons */}
          <div className="flex items-center gap-2">
            <Link
              href=""
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 shadow-sm hover:bg-slate-50"
            >
              👥 সদস্যগণ
            </Link>

            <Link
              href="/admin/login"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 shadow-sm hover:bg-slate-50"
            >
              🧑‍💼 অ্যাডমিন (ড্যাশবোর্ড)
            </Link>
          </div>
        </div>
      </div>

      {/* NOTICE Bar (maroon strip) */}
      <div className="bg-[#6b4b55]">
        <div className="mx-auto max-w-6xl px-4 py-2 flex items-center">
          <span className="inline-block rounded-sm bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600 shadow-sm z-10 relative whitespace-nowrap">
            NOTICE
          </span>
          <div className="flex-1 overflow-hidden ml-4">
            {notices.length > 0 ? (
              <marquee className="text-white text-sm font-medium tracking-wide flex items-center" behavior="scroll" direction="left" scrollamount="5">
                {notices.map((notice, index) => (
                  <span key={notice.id || index} className="mx-8 inline-block">
                    <span className="text-amber-300 font-bold mr-2">✦</span>
                    {notice.title}{notice.content ? ` - ${notice.content}` : ''}
                  </span>
                ))}
              </marquee>
            ) : (
              <marquee className="text-white/70 text-sm font-medium tracking-wide" behavior="scroll" direction="left" scrollamount="5">
                No new notices at the moment.
              </marquee>
            )}
          </div>
        </div>
      </div>

      {/* Navbar (blue strip) */}
      <nav className="bg-[#4f73a8]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-6 px-4 py-3 text-white">
          <NavItem href="" icon="🏠" label="হোম" />
          <NavItem href="" icon="ℹ️" label="আমাদের সম্পর্কে" />
          <NavItem href="" icon="📚" label="একাডেমিক" />
          <NavItem href="" icon="📌" label="নোটিশ বোর্ড" />
          <NavItem href="" icon="🖼️" label="গ্যালারি" />
          <NavItem href="" icon="☎️" label="যোগাযোগ" />
        </div>
      </nav>

      {/* Portal buttons */}
      <div className="bg-[#F8F8F8]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3 px-4 py-4">
          <PillButton href="" label="Latest Notices" color="bg-slate-800" />
          <PillButton href="/teacher/login" label="Teacher Portal" color="bg-emerald-500" />
          <PillButton href="/admin/login" label="Admin login" color="bg-orange-400" />
          <PillButton href="/student/login" label="Student Portal" color="bg-rose-500" />
          {/* <PillButton href="/teacher/login" label="Teacher Portal" color="bg-emerald-500" />
          <PillButton href="/student/login" label="Student Portal" color="bg-rose-500" /> */}
        </div>
      </div>
    </header>
  );
}

/* 
   COMPONENT: NavItem
   - Used by HeaderAndNavbar -> Navbar
   - Reusable Link style for menu items
   */
function NavItem({ href, icon, label }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded px-2 py-1 text-sm font-semibold hover:bg-white/10"
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

/* 
   COMPONENT: PillButton
   - Used by HeaderAndNavbar -> Portal Buttons row
   */
function PillButton({ href, label, color }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold text-white shadow ${color} hover:opacity-90`}
    >
      {label}
    </Link>
  );
}

/* 
   COMPONENT: Footer
   - Called by HomePage at the bottom
   - Layout matches your screenshot: logo + quick links + contact + visitors
 */
function Footer() {
  return (
    <footer className="bg-[#283546] text-slate-200">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-12 sm:grid-cols-3">
        {/* Left: logo + text + socials */}
        <div>
          <div className="flex items-start gap-3">
            <div className="relative h-14 w-14 overflow-hidden rounded bg-white shadow">
              <Image src="/logo.png" alt="Logo" fill className="object-contain" />
            </div>

            <div className="pt-1">
              <p className="text-sm font-semibold">
                “শিক্ষার মান উন্নয়নে নিরলস প্রচেষ্টা অব্যাহত...”
              </p>
            </div>
          </div>

          {/* Social icons placeholders */}
          <div className="mt-5 flex items-center gap-3">
            <SocialIcon label="Facebook" />
            <SocialIcon label="LinkedIn" />
            <SocialIcon label="YouTube" />
          </div>
        </div>

        {/* Middle: quick links */}
        <div>
          <h3 className="text-sm font-bold">Quick Links</h3>
          <div className="mt-2 h-[2px] w-10 bg-orange-400" />

          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li>
              <Link className="hover:text-white" href="/">
                › Home
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/">
                › About Us
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/">
                › Contact Us
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/">
                › Admission
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/">
                › Notices
              </Link>
            </li>
          </ul>
        </div>

        {/* Right: contact + visitors */}
        <div>
          <h3 className="text-sm font-bold">Contact Us</h3>
          <div className="mt-2 h-[2px] w-10 bg-orange-400" />

          <div className="mt-4 text-sm text-slate-300">
            <p className="flex items-center gap-2">
              <span>📍</span>
              <span>Dhaka, Bangladesh</span>
            </p>
          </div>

          {/* Static Visitors badge (later we can make dynamic from backend) */}
          <div className="mt-6 inline-flex items-center gap-2 rounded bg-slate-700/60 px-4 py-2 text-sm text-white">
            <span>📈</span>
            <span>Visitors: 370,417</span>
          </div>
        </div>
      </div>

      {/* Bottom copyright */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-4 text-left text-xs text-slate-300">
          © Global Knowlege School Dhaka. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

/* 
   COMPONENT: SocialIcon
   - simple placeholder circle buttons
   - later can replace with real icons
  */
function SocialIcon({ label }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm hover:bg-white/20"
    >
      ●
    </button>
  );
}
