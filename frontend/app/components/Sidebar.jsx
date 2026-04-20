"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  CheckSquare,
  LogOut,
  X,
  BookOpen,
  UserCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen }) {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const savedAdmin = localStorage.getItem("admin");
    if (savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin));
      } catch {
        // ignore
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin");
    router.replace("/admin/login");
    router.refresh();
  };

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
    { label: "Students", icon: GraduationCap, href: "/admin/students" },
    { label: "Teachers", icon: Users, href: "/admin/teachers" },
    { label: "Exam Routine", icon: Calendar, href: "/admin/exam-routines" },
    { label: "Mark Approvals", icon: CheckSquare, href: "/admin/mark-approvals" },
  ];

  return (
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

            {/* Mobile close button */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="rounded-lg p-2 transition-colors hover:bg-white/10 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-4 space-y-1 px-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              // Check if the current route matches the link href so it highlights correctly!
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

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
  );
}