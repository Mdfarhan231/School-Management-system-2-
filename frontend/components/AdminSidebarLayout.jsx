/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  CheckSquare,
  LogOut,
  Bell,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  ListChecks,
  UserCheck,
  User,
  ChevronDown,
  Plus,
} from "lucide-react";
import CreateSession from "./CreateSession";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const navItems = [
  { label: "Dashboard",      icon: LayoutDashboard, href: "/admin/dashboard" },
  { label: "Students",       icon: GraduationCap,   href: "/admin/students" },
  { label: "All Students",   icon: ListChecks,      href: "/admin/all-students" },
  { label: "Teachers",       icon: Users,           href: "/admin/teachers" },
  { label: "All Teachers",   icon: UserCheck,       href: "/admin/all-teachers" },
  { label: "Exam Routine",   icon: Calendar,        href: "/admin/exam-routines" },
  { label: "Mark Approvals", icon: CheckSquare,     href: "/admin/mark-approvals" },
  { label: "Notices",        icon: Megaphone,       href: "/admin/notices" },
];

const SIDEBAR_EXPANDED_W = 272;
const SIDEBAR_COLLAPSED_W = 72;

export default function AdminSidebarLayout({ children, activePath = "/admin/dashboard", onPathChange }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [admin, setAdmin]             = useState(null);
  const [selectedSession, setSelectedSession] = useState("2026-27");
  const [isSessionOpen, setIsSessionOpen] = useState(false);

  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem("gks_sessions");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      { id: "2026-27", label: "2026-27", status: "Active", isCurrent: true },
      { id: "2025-26", label: "2025-26", status: "Archived", isCurrent: false },
      { id: "2024-25", label: "2024-25", status: "Archived", isCurrent: false },
      { id: "2023-24", label: "2023-24", status: "Archived", isCurrent: false },
    ];
  });

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem("gks_sessions", JSON.stringify(sessions));
  }, [sessions]);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateSession = (newSession) => {
    let updatedSessions = [...sessions];
    if (newSession.isCurrent) {
      updatedSessions = updatedSessions.map((s) => ({
        ...s,
        isCurrent: false,
        status: s.status === "Active" ? "Archived" : s.status,
      }));
    }

    updatedSessions = [newSession, ...updatedSessions];
    setSessions(updatedSessions);
    setSelectedSession(newSession.id);

    if (onPathChange) {
      onPathChange(activePath, newSession.id);
    }
  };

  /* ── Auth guard / seed mock admin ── */
  useEffect(() => {
    const saved = localStorage.getItem("admin");
    if (!saved) {
      const defaultAdmin = { name: "System Controller Admin" };
      localStorage.setItem("admin", JSON.stringify(defaultAdmin));
      setAdmin(defaultAdmin);
    } else {
      try {
        setAdmin(JSON.parse(saved));
      } catch {
        const defaultAdmin = { name: "System Controller Admin" };
        setAdmin(defaultAdmin);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin");
    // Simulated logout
    alert("Simulated logout from admin panel.");
  };

  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleScroll = (e) => {
    const currentScrollY = e.currentTarget.scrollTop;
    
    // Always show at the very top
    if (currentScrollY <= 50) {
      setShowHeader(true);
      setLastScrollY(currentScrollY);
      return;
    }

    const diff = currentScrollY - lastScrollY;
    
    if (diff > 10) {
      // Scrolling down
      setShowHeader(false);
      setLastScrollY(currentScrollY);
    } else if (diff < -10) {
      // Scrolling up
      setShowHeader(true);
      setLastScrollY(currentScrollY);
    }
  };

  if (!admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-500">Loading Admin Panel…</p>
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
            Admin Portal
          </span>
        </div>

        {/* Right: session selector + bell + avatar + name */}
        <div className="flex items-center gap-4">
          {/* Session Dropdown Selector */}
          <div className="relative">
            <button
              onClick={() => setIsSessionOpen(!isSessionOpen)}
              className="flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg text-[11px] font-bold uppercase tracking-wider text-white transition-all active:scale-[0.98]"
            >
              <Calendar className="h-3.5 w-3.5 text-blue-200" />
              <span>Session: {selectedSession}</span>
              {selectedSession === "2026-27" ? (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              )}
              <ChevronDown className={`h-3 w-3 text-white/70 transition-transform duration-200 ${isSessionOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {isSessionOpen && (
                <>
                  <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsSessionOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 mt-2 w-56 bg-[#0F172B] border border-slate-800 rounded-xl shadow-xl py-2 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-1.5 border-b border-slate-800/80 mb-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Select Academic Session</p>
                    </div>
                    {sessions.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => {
                          setSelectedSession(session.id);
                          setIsSessionOpen(false);
                          if (onPathChange) {
                            onPathChange(activePath, session.id);
                          }
                        }}
                        className={`w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-white/5 transition-colors ${
                          selectedSession === session.id ? 'text-indigo-400 font-bold' : 'text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className={`h-3.5 w-3.5 ${selectedSession === session.id ? 'text-indigo-400' : 'text-slate-500'}`} />
                          <span className="text-xs font-semibold uppercase tracking-wider">{session.label}</span>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider ${
                          session.isCurrent 
                            ? 'bg-emerald-500/15 text-emerald-400' 
                            : 'bg-white/5 text-slate-400'
                        }`}>
                          {session.status}
                        </span>
                      </button>
                    ))}

                    <div className="border-t border-slate-800/80 mt-1.5 pt-1.5 px-2">
                      <button
                        onClick={() => {
                          setIsSessionOpen(false);
                          setIsCreateModalOpen(true);
                        }}
                        className="w-full px-3 py-2 flex items-center gap-2 rounded-lg text-left text-xs font-bold text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Create Session</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <button className="relative rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full border border-[#1e3a5f] bg-rose-400 animate-pulse" />
          </button>

          <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg border border-white/20 bg-white/10 shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt="Admin"
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="hidden sm:block leading-none">
            <p className="text-xs font-bold text-white">
              {admin?.name?.split(" ")[0] || "Admin"}
            </p>
            <p className="text-[9px] font-bold uppercase tracking-wider text-blue-200">
              System Controller
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
          {/* ── Brand / Logo Row (Smaller for top-aligned sidebar) ── */}
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
                <BookOpen className="h-4 w-4 text-white" />
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
                      GKS Admin
                    </p>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">
                      System Controller
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
              const isActive = activePath === item.href;

              return (
                <button
                  key={item.label}
                  onClick={() => onPathChange && onPathChange(item.href, selectedSession)}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    "group flex items-center rounded-xl py-2.5 transition-all duration-200 overflow-hidden w-full text-left",
                    isCollapsed ? "justify-center px-0 w-10 mx-auto" : "px-4 gap-3",
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold"
                      : isCollapsed
                        ? "text-slate-400 hover:bg-white/5 hover:text-white"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0 transition-colors",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-white"
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
                        className="text-xs font-bold uppercase tracking-wider whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
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
                      <p className="text-sm font-bold text-white">Admin Portal</p>
                      <p className="text-[10px] text-slate-400">Super Admin</p>
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
          className="flex min-w-0 flex-1 flex-col transition-all duration-300"
          style={{ paddingLeft: isCollapsed ? SIDEBAR_COLLAPSED_W : SIDEBAR_EXPANDED_W }}
        >
          {/* ── Page Content ── */}
          <div 
            onScroll={handleScroll}
            className="flex flex-1 flex-col overflow-y-auto relative p-6 md:p-10"
          >
            {/* Spacer to prevent content from hiding under the fixed header when at the top */}
            <div className="h-12 shrink-0 w-full" />
            <div className="flex flex-1 flex-col">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* ══════════════════════════════════════
          CREATE SESSION MODAL
      ══════════════════════════════════════ */}
      <CreateSession
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateSession}
        existingSessions={sessions}
      />
    </div>
  );
}
