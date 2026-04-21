"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  CheckSquare,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  UserCheck,
  BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { label: "Students", icon: GraduationCap, href: "/admin/students" },
  { label: "Teachers", icon: Users, href: "/admin/teachers" },
  { label: "Exam Routine", icon: Calendar, href: "/admin/exam-routines" },
  { label: "Mark Approvals", icon: CheckSquare, href: "/admin/mark-approvals" },
];

export default function AdminSidebarLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const savedAdmin = localStorage.getItem("admin");
    if (!savedAdmin) {
      router.replace("/admin/login");
      return;
    }
    try {
      setAdmin(JSON.parse(savedAdmin));
    } catch {
      localStorage.removeItem("admin");
      router.replace("/admin/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin");
    router.replace("/admin/login");
    router.refresh();
  };

  if (!admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm font-medium text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* ── Sidebar Navigation (unchanged from dashboard) ── */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-[#1a1c2e] text-slate-300 shadow-2xl lg:relative"
          >
            <div className="flex items-center justify-between p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/20">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold leading-tight text-white">
                    Global Knowledge
                  </h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    School System
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsSidebarOpen(false)}
                className="rounded-lg p-2 transition-colors hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-4 space-y-1 px-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all",
                      isActive
                        ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 transition-colors",
                        isActive
                          ? "text-white"
                          : "text-slate-500 group-hover:text-slate-300"
                      )}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20">
                    <UserCheck className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Admin Portal</p>
                    <p className="text-xs text-slate-500">Super Admin Access</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500/10 py-3 text-xs font-bold text-rose-400 transition-all hover:bg-rose-500 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  Logout System
                </button>
              </div>

              <p className="mt-6 text-center text-[10px] font-medium text-slate-600">
                © 2026 Global Knowledge School
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main Content Area ── */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 lg:px-10">
          <div className="flex items-center gap-6">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="rounded-xl p-2.5 transition-colors hover:bg-slate-100"
              >
                <Menu className="h-6 w-6" />
              </button>
            )}

            <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search students, teachers, records..."
                className="w-80 rounded-xl border-none bg-slate-50 py-2.5 pl-12 pr-6 text-sm transition-all focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
               {/* Admin Profile Picture */}
          <div className="flex items-center gap-5">
            <button className="relative rounded-xl p-2.5 text-slate-500 transition-colors hover:bg-slate-50">
              <Bell className="h-5 w-5" />
              <span className="absolute right-3 top-3 h-2 w-2 rounded-full border-2 border-white bg-rose-500" />
            </button>

            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-indigo-100 bg-indigo-50 shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="Admin"
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
               {/* Admin Text Info */}
            <div className="hidden sm:block">
              <p className="leading-none text-sm font-bold text-slate-900">
                Welcome, {admin?.name || "admin"}
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                System Controller
              </p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
