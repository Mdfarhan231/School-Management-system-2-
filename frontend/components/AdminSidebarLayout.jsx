"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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
  Trash2,
  Layers,
} from "lucide-react";
import CreateSession from "./CreateSession";
import { useSession } from "@/context/SessionContext";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { label: "Students", icon: GraduationCap, href: "/admin/students" },
  { label: "Manage Subjects", icon: BookOpen, href: "/admin/subjects" },
  { label: "Manage Classes", icon: Layers, href: "/admin/classes" },
  { label: "Manage Sections", icon: Layers, href: "/admin/sections" },
  { label: "All Students", icon: ListChecks, href: "/admin/all-students" },
  { label: "Teachers", icon: Users, href: "/admin/teachers" },
  { label: "All Teachers", icon: UserCheck, href: "/admin/all-teachers" },
  { label: "Exam Routine", icon: Calendar, href: "/admin/exam-routines" },
  { label: "Mark Approvals", icon: CheckSquare, href: "/admin/mark-approvals" },
  { label: "Notices", icon: Megaphone, href: "/admin/notices" },
];

const SIDEBAR_EXPANDED_W = 272;
const SIDEBAR_COLLAPSED_W = 72;

export default function AdminSidebarLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  // ── Use session context ──
  const { 
    sessions, 
    selectedSessionId, 
    selectedSession,
    selectSession,
    createSession,
    deleteSession,
    refreshSessions,
    isLoading: sessionsLoading 
  } = useSession();

  // ── Local state ──
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [isSessionOpen, setIsSessionOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const isAuthPage = pathname === "/admin/login" || pathname === "/admin/signup";

  // ── Auth guard ──
  useEffect(() => {
    if (isAuthPage) return;
    const saved = localStorage.getItem("admin");
    if (!saved) {
      router.replace("/admin/login");
      return;
    }
    try {
      setAdmin(JSON.parse(saved));
    } catch {
      localStorage.removeItem("admin");
      router.replace("/admin/login");
    }
  }, [router, isAuthPage]);

  // ── Handle logout ──
  const handleLogout = () => {
    localStorage.removeItem("admin");
    router.replace("/admin/login");
    router.refresh();
  };

  // ── Scroll handler ──
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

  // ── Handle create session ──
  const handleCreateSession = async (newSession) => {
    try {
      await createSession(newSession);
      setIsCreateModalOpen(false);
      // Refresh sessions list
      await refreshSessions();
    } catch (error) {
      console.error('Failed to create session:', error);
      alert(error.message || 'Failed to create session');
    }
  };

  
 // ── Handle delete session ──
const handleDeleteSession = async (sessionId, e) => {
    // Prevent click from selecting the session
    e.stopPropagation();
    
    const sessionToDelete = sessions.find(s => s.id === sessionId);
    if (!sessionToDelete) return;
    
    // Get the session label for confirmation message
    const sessionLabel = sessionToDelete.session_label || sessionToDelete.label || sessionId;
    
    // Don't allow deleting the only session
    if (sessions.length <= 1) {
        alert("Cannot delete the last session. You need at least one session.");
        return;
    }
    
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete session "${sessionLabel}"?`)) {
        return;
    }
    
    try {
        console.log('🟢 Deleting session:', sessionId);
        const success = await deleteSession(sessionId);
        
        if (success) {
            console.log('🟢 Session deleted successfully');
            // Refresh sessions list
            await refreshSessions();
        } else {
            alert('Failed to delete session. Please try again.');
        }
    } catch (error) {
        console.error('🔴 Failed to delete session:', error);
        alert(error.message || 'Failed to delete session');
    }
};

  // ── Get current session label ──
  const getCurrentSessionLabel = () => {
    return selectedSession?.session_label || selectedSession?.label || "Select Session";
  };

  // ── Get current session status ──
  const getCurrentSessionStatus = () => {
    return selectedSession?.session_status || selectedSession?.status || "";
  };

  // ── Early returns ──
  if (isAuthPage) return <>{children}</>;
  
  if (sessionsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-500">Loading Session Data…</p>
        </div>
      </div>
    );
  }

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
          TOP NAVBAR
      ══════════════════════════════════════ */}
      <motion.header
        initial={false}
        animate={{ y: showHeader ? 0 : -48 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 left-0 right-0 z-[60] flex h-12 shrink-0 items-center justify-between border-b border-[#1a3a6b] bg-[#1e3a5f] px-5 shadow-sm"
      >
        {/* Left: Admin Portal Badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-0.5 text-[11px] font-semibold text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-white/70 animate-pulse" />
            Admin Portal
          </span>
        </div>

        {/* Right: Session Selector + Notifications + Avatar */}
        <div className="flex items-center gap-4">
          {/* Session Dropdown Selector */}
          <div className="relative">
            <button
              onClick={() => setIsSessionOpen(!isSessionOpen)}
              className="flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg text-[11px] font-bold uppercase tracking-wider text-white transition-all active:scale-[0.98] min-w-[150px] justify-between"
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-blue-200" />
                <span>Session: {getCurrentSessionLabel()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {getCurrentSessionStatus() === "Active" ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ) : getCurrentSessionStatus() === "Upcoming" ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                )}
                <ChevronDown className={`h-3 w-3 text-white/70 transition-transform duration-200 ${isSessionOpen ? "rotate-180" : ""}`} />
              </div>
            </button>

            <AnimatePresence>
              {isSessionOpen && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsSessionOpen(false)} />
                  
                  {/* Dropdown Menu */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 mt-2 w-56 bg-[#0F172B] border border-slate-800 rounded-xl shadow-xl py-2 z-50 overflow-hidden max-h-80 overflow-y-auto"
                  >
                    <div className="px-4 py-1.5 border-b border-slate-800/80 mb-1 sticky top-0 bg-[#0F172B] z-10">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Select Academic Session</p>
                    </div>
                    
                    {sessions.length === 0 ? (
                      <div className="px-4 py-6 text-center">
                        <p className="text-xs text-slate-400">No sessions found</p>
                        <p className="text-[10px] text-slate-500 mt-1">Create a new session below</p>
                      </div>
                    ) : (
                      sessions.map((session) => {
                        const sessionLabel = session.session_label || session.label;
                        const sessionStatus = session.session_status || session.status;
                        const isCurrent = session.is_current || session.isCurrent;
                        const isArchived = sessionStatus === 'Archived';
                        
                        return (
                          <button
                            key={session.id}
                            onClick={() => {
                              selectSession(session.id);
                              setIsSessionOpen(false);
                            }}
                            className={`group w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-white/5 transition-colors ${
                              selectedSessionId == session.id ? 'text-indigo-400 font-bold' : 'text-slate-300'
                            } ${isArchived ? 'opacity-75' : ''}`}
                          >
                            <div className="flex items-center gap-2">
                              <Calendar className={`h-3.5 w-3.5 ${selectedSessionId == session.id ? 'text-indigo-400' : 'text-slate-500'}`} />
                              <span className="text-xs font-semibold uppercase tracking-wider">{sessionLabel}</span>
                            </div>

                            {/* Status Badge + Delete Button */}
                            <div className="relative flex items-center justify-end w-14 h-5">
                              {/* Status Badge */}
                              <span className={`absolute right-0 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider transition-all duration-200 ${
                                isArchived ? 'group-hover:opacity-0 group-hover:scale-75' : 'group-hover:opacity-0 group-hover:scale-75'
                              } ${
                                isCurrent 
                                  ? 'bg-emerald-500/15 text-emerald-400' 
                                  : sessionStatus === 'Upcoming'
                                  ? 'bg-amber-500/15 text-amber-400'
                                  : 'bg-white/5 text-slate-400'
                              }`}>
                                {sessionStatus}
                              </span>

                              {/* Delete Button - Only show for non-archived sessions and if more than 1 session */}
{/* Delete Button - Show for ALL sessions if more than 1 session exists */}
                                {sessions.length > 1 && (
                                <span
                                onClick={(e) => handleDeleteSession(session.id, e)}
                                  title="Delete Session"
                                  className="absolute right-0 p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/15 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 cursor-pointer"
                                      >
                                      <Trash2 className="h-3.5 w-3.5" />
                                     </span>
                                  )}
                            </div>
                          </button>
                        );
                      })
                    )}

                    {/* Create Session Footer */}
                    <div className="border-t border-slate-800/80 mt-1.5 pt-1.5 px-2 sticky bottom-0 bg-[#0F172B]">
                      <button
                        onClick={() => {
                          setIsSessionOpen(false);
                          setIsCreateModalOpen(true);
                        }}
                        className="w-full px-3 py-2 flex items-center gap-2 rounded-lg text-left text-xs font-bold text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Create New Session</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Notification Bell */}
          <button className="relative rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full border border-[#1e3a5f] bg-rose-400" />
          </button>

          {/* Admin Avatar */}
          <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg border border-white/20 bg-white/10 shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt="Admin"
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Admin Name */}
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

      {/* ══════════════════════════════════════
          CREATE SESSION MODAL
      ══════════════════════════════════════ */}
      <CreateSession
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateSession}
        existingSessions={sessions}
      />

      {/* ══════════════════════════════════════
          SIDEBAR + MAIN CONTENT
      ══════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
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
          {/* Brand Row */}
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
                      {getCurrentSessionLabel()}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-10 z-50 flex h-6 w-6 items-center justify-center rounded-full shadow-md border border-slate-600 bg-[#0F172B] text-slate-300 hover:bg-slate-700 transition-colors"
          >
            {isCollapsed
              ? <ChevronRight className="h-3.5 w-3.5" />
              : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>

          {/* Navigation */}
          <nav className="mt-2 flex-1 space-y-1 px-3 overflow-y-auto overflow-x-hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
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

          {/* Bottom Section */}
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

        {/* Main Content */}
        <main
          className={cn(
            "flex min-w-0 flex-1 flex-col transition-all duration-300",
            !isCollapsed && "blur-sm pointer-events-none select-none"
          )}
          style={{ paddingLeft: SIDEBAR_COLLAPSED_W }}
        >
          <div 
            onScroll={handleScroll}
            className="flex flex-1 flex-col overflow-y-auto relative"
          >
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
