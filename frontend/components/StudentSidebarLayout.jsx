"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  BookOpen,
  LogOut,
  Bell,
  ChevronLeft,
  ChevronRight,
  User,
  GraduationCap,
  Megaphone,
} from "lucide-react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const navItems = [
  { label: "Dashboard",    icon: LayoutDashboard, href: "/student/dashboard" },
  { label: "Exam Routine", icon: Calendar,        href: "/student/exam-routine" },
  { label: "Attendance",   icon: CheckSquare,     href: "/student/attendance" },
  { label: "Results",      icon: BookOpen,        href: "/student/results" },
  { label: "Notices",      icon: Megaphone,       href: "/student/notices" },
];

const SIDEBAR_EXPANDED_W = 272;
const SIDEBAR_COLLAPSED_W = 72;

export default function StudentSidebarLayout({ children }) {
  const router   = useRouter();
  const pathname = usePathname();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [student, setStudent]         = useState(null);

  const isAuthPage =
    pathname === "/student/login" || pathname === "/student/signup";

  /* ── Auth guard ── */
  useEffect(() => {
    if (isAuthPage) return;
    const saved = localStorage.getItem("student");
    if (!saved) { router.replace("/student/login"); return; }
    try   { setStudent(JSON.parse(saved)); }
    catch { localStorage.removeItem("student"); router.replace("/student/login"); }
  }, [router, isAuthPage]);

  const handleLogout = () => {
    localStorage.removeItem("student");
    router.replace("/student/login");
    router.refresh();
  };

  const getStudentImage = (pic) => pic || "/student-demo.png";

  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleScroll = (e) => {
    const currentScrollY = e.currentTarget.scrollTop;

    if (currentScrollY <= 50) {
      setShowHeader(true);
      setLastScrollY(currentScrollY);
      return;
    }

    const diff = currentScrollY - lastScrollY;

    if (diff > 10) {
      setShowHeader(false);
      setLastScrollY(currentScrollY);
    } else if (diff < -10) {
      setShowHeader(true);
      setLastScrollY(currentScrollY);
    }
  };

  /* ── Early returns ── */
  if (isAuthPage) return <>{children}</>;

  if (!student) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-500">Loading Portal…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[#f8fafc] font-sans text-slate-900 overflow-hidden relative">
      {/* ══════════════════════════════════════
          ANIMATED TOP NAVBAR (Hide on Scroll)
      ══════════════════════════════════════ */}
      <motion.header
        initial={false}
        animate={{ y: showHeader ? 0 : -48 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 left-0 right-0 z-[60] flex h-12 shrink-0 items-center justify-between border-b border-[#1a3a6b] bg-[#1e3a5f] px-5 shadow-sm"
      >
        {/* Left: role badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-0.5 text-[11px] font-semibold text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-white/70 animate-pulse" />
            Student Portal
          </span>
        </div>

        {/* Right: bell + avatar + name */}
        <div className="flex items-center gap-3">
          <button className="relative rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full border border-[#1e3a5f] bg-rose-400" />
          </button>

          <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg border border-white/20 bg-white/10 shadow-sm">
            <img
              src={getStudentImage(student?.picture)}
              alt={student?.name}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="hidden sm:block leading-none">
            <p className="text-xs font-bold text-white">
              {student?.name?.split(" ")[0] || "Student"}
            </p>
            <p className="text-[9px] font-bold uppercase tracking-wider text-blue-200">
              Class {student?.class_name || ""}
            </p>
          </div>
        </div>
      </motion.header>

      <div className="flex flex-1 overflow-hidden">
        {/* ══════════════════════════════════════
            FIXED OVERLAY SIDEBAR (Adjusts on Scroll)
        ══════════════════════════════════════ */}
        <motion.aside
          initial={false}
          animate={{
            width: isCollapsed ? SIDEBAR_COLLAPSED_W : SIDEBAR_EXPANDED_W,
            top: showHeader ? 48 : 0,
            height: showHeader ? "calc(100vh - 48px)" : "100vh",
            boxShadow: isCollapsed
              ? "0 0 0 0 rgba(0,0,0,0)"
              : "8px 0 32px rgba(0,0,0,0.22)",
          }}
          transition={{ type: "spring", stiffness: 320, damping: 34 }}
          className="fixed left-0 z-50 flex flex-col"
          style={{
            overflow: "visible",
            backgroundColor: "#0F172B",
            borderRight: "1px solid rgba(15,23,43,0.8)",
          }}
        >
          {/* ── Brand / Logo Row ── */}
          <div
            className={cn(
              "flex h-12 shrink-0 items-center px-4",
              isCollapsed ? "justify-center" : "justify-between"
            )}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                  isCollapsed ? "bg-white/10" : "bg-indigo-600"
                )}
              >
                <GraduationCap className="h-4 w-4 text-white" />
              </div>

              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    key="brand-text"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.18 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    <p className="text-xs font-bold leading-tight text-white">
                      GKS Student
                    </p>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">
                      Student Portal
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Toggle Button ── */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-10 z-50 flex h-6 w-6 items-center justify-center rounded-full shadow-md border border-slate-600 bg-[#0F172B] text-slate-300 hover:bg-slate-700 transition-colors"
          >
            {isCollapsed
              ? <ChevronRight className="h-3.5 w-3.5" />
              : <ChevronLeft  className="h-3.5 w-3.5" />}
          </button>

          {/* ── Navigation Items ── */}
          <nav className="mt-2 flex-1 space-y-1 px-3 overflow-y-auto overflow-x-hidden">
            {navItems.map((item) => {
              const Icon     = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    "group flex items-center rounded-xl py-2.5 transition-all duration-200 overflow-hidden",
                    isCollapsed ? "justify-center px-0 w-10 mx-auto" : "px-4 gap-3 w-full",
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : isCollapsed
                        ? "text-slate-400 hover:bg-white/5 hover:text-white"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0 transition-colors",
                      isActive ? "text-white" : ""
                    )}
                  />
                  <AnimatePresence initial={false}>
                    {!isCollapsed && (
                      <motion.span
                        key="nav-label"
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.15 }}
                        className="text-sm font-medium whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              );
            })}
          </nav>

          {/* ── Bottom Section ── */}
          <div className="p-3 shrink-0">
            <div
              className={cn(
                "rounded-2xl border transition-all duration-300",
                isCollapsed
                  ? "border-white/10 bg-white/5 p-2 flex justify-center"
                  : "border-white/10 bg-white/5 p-4"
              )}
            >
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    key="profile-card"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="flex items-center gap-3 mb-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                      <User className="h-4 w-4 text-slate-300" />
                    </div>
                    <div className="whitespace-nowrap">
                      <p className="text-sm font-bold text-white">Student Portal</p>
                      <p className="text-[10px] text-slate-400">Student Access</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handleLogout}
                title={isCollapsed ? "Logout" : undefined}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl transition-all",
                  isCollapsed
                    ? "h-10 w-10 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white"
                    : "w-full py-2.5 text-xs font-bold bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white"
                )}
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.span
                      key="logout-label"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="whitespace-nowrap"
                    >
                      Logout System
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>

            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.p
                  key="footer-text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-4 text-center text-[9px] font-medium text-slate-400"
                >
                  © 2026 GK School Systems
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.aside>

        {/* ══════════════════════════════════════
            MAIN CONTENT AREA
        ══════════════════════════════════════ */}
        <main
          className={cn(
            "flex min-w-0 flex-1 flex-col transition-all duration-300",
            !isCollapsed && "blur-sm pointer-events-none select-none"
          )}
          style={{ paddingLeft: SIDEBAR_COLLAPSED_W }}
        >
          {/* ── Page Content ── */}
          <div
            onScroll={handleScroll}
            className="flex flex-1 flex-col overflow-y-auto relative"
          >
            {/* Spacer to prevent content from hiding under the fixed header */}
            <div className="h-12 shrink-0 w-full" />
            <div className="flex flex-1 flex-col">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
