"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Clock,
  BookOpen,
  LogOut,
  Bell,
  Search,
  Menu,
  ChevronLeft,
  ChevronRight,
  User
} from "lucide-react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/teacher/dashboard" },
  { label: "Exam Routine", icon: Calendar, href: "/teacher/exam-routine" },
  { label: "Take Attendance", icon: CheckSquare, href: "/teacher/attendance" },
  { label: "Attendance History", icon: Clock, href: "/teacher/attendance-history" },
  { label: "Marks Entry", icon: BookOpen, href: "/teacher/marks-entry" },
];

export default function TeacherSidebarLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [teacher, setTeacher] = useState(null);

  // Exclude login and signup pages from having the sidebar
  const isAuthPage = pathname === "/teacher/login" || pathname === "/teacher/signup";

  useEffect(() => {
    if (isAuthPage) return;

    const savedTeacher = localStorage.getItem("teacher");
    if (!savedTeacher) {
      router.replace("/teacher/login");
      return;
    }
    try {
      setTeacher(JSON.parse(savedTeacher));
    } catch {
      localStorage.removeItem("teacher");
      router.replace("/teacher/login");
    }
  }, [router, isAuthPage]);

  const handleLogout = () => {
    localStorage.removeItem("teacher");
    router.replace("/teacher/login");
    router.refresh();
  };

  const getTeacherImage = (picture) => {
    if (!picture) return "/teacher-demo.png";
    return picture;
  };

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (!teacher) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-medium text-slate-500">Loading Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-hidden">
      {/* ── Sidebar Navigation (Collapsible) ── */}
      <aside
        className={cn(
          "relative z-50 flex flex-col text-slate-300 shadow-xl transition-all duration-300 ease-in-out shrink-0",
          isSidebarOpen ? "w-72" : "w-20"
        )}
        style={{ backgroundColor: "#0F172B" }}
      >
        <div className={cn("flex items-center p-6 h-20 shrink-0", isSidebarOpen ? "justify-between" : "justify-center px-0")}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div
              className={cn(
                "transition-all duration-300 whitespace-nowrap overflow-hidden flex flex-col justify-center",
                isSidebarOpen ? "w-auto opacity-100" : "w-0 opacity-0"
              )}
            >
              <h2 className="text-lg font-bold leading-tight text-white">
                Global Knowledge
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                School System
              </p>
            </div>
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-7 flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-[#0F172B] shadow-sm hover:bg-slate-800 z-50 text-slate-400 transition-transform"
        >
          {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        <nav className="mt-4 flex-1 space-y-2 px-4 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.label}
                href={item.href}
                title={!isSidebarOpen ? item.label : undefined}
                className={cn(
                  "group flex items-center rounded-xl py-3.5 transition-all overflow-hidden",
                  isSidebarOpen ? "px-4 gap-3 w-full" : "justify-center px-0 w-12 mx-auto",
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive
                      ? "text-white"
                      : "text-slate-400 group-hover:text-white"
                  )}
                />
                <span
                  className={cn(
                    "text-sm font-medium whitespace-nowrap transition-all duration-300",
                    isSidebarOpen ? "w-auto opacity-100" : "w-0 opacity-0 hidden"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 shrink-0">
          <div className={cn("rounded-2xl border border-white/10 bg-white/5 transition-all duration-300", isSidebarOpen ? "p-5" : "p-2 flex justify-center")}>
            <div
              className={cn(
                "flex items-center gap-3 overflow-hidden transition-all duration-300",
                isSidebarOpen ? "mb-4 h-10 opacity-100" : "h-0 opacity-0 mb-0 hidden"
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                <User className="h-5 w-5 text-slate-300" />
              </div>
              <div className="whitespace-nowrap">
                <p className="text-sm font-bold text-white">Teacher Portal</p>
                <p className="text-xs text-slate-400">Faculty Access</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title={!isSidebarOpen ? "Logout" : undefined}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl bg-rose-500/10 text-rose-400 transition-all hover:bg-rose-500 hover:text-white",
                isSidebarOpen ? "w-full py-3 text-xs font-bold" : "h-10 w-10 shrink-0"
              )}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span
                className={cn(
                  "whitespace-nowrap transition-all duration-300",
                  isSidebarOpen ? "w-auto opacity-100" : "w-0 opacity-0 hidden"
                )}
              >
                Logout System
              </span>
            </button>
          </div>

          <p
            className={cn(
              "text-center text-[10px] font-medium text-slate-500 whitespace-nowrap transition-all duration-300 overflow-hidden",
              isSidebarOpen ? "mt-6 opacity-100 h-auto" : "mt-0 opacity-0 h-0 m-0"
            )}
          >
            © 2026 Global Knowledge
          </p>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#f8fafc]">
        {/* Header */}
        <header className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 lg:px-10 shadow-sm">
          <div className="flex items-center gap-6">
            {!isSidebarOpen && (
              <div className="md:hidden">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="rounded-xl p-2.5 transition-colors hover:bg-slate-100"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </div>
            )}
            <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search students, classes..."
                className="w-80 rounded-xl border-none bg-slate-50 py-2.5 pl-12 pr-6 text-sm transition-all focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
               {/* Teacher Profile Info */}
          <div className="flex items-center gap-5">
            <button className="relative rounded-xl p-2.5 text-slate-500 transition-colors hover:bg-slate-50">
              <Bell className="h-5 w-5" />
              <span className="absolute right-3 top-3 h-2 w-2 rounded-full border-2 border-white bg-rose-500" />
            </button>

            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-indigo-100 bg-indigo-50 shadow-sm">
              <img
                src={getTeacherImage(teacher?.picture)}
                alt={teacher?.name}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
               {/* Teacher Text Info */}
            <div className="hidden sm:block">
              <p className="leading-none text-sm font-bold text-slate-900">
                Welcome, {teacher?.name?.split(' ')[0] || "Teacher"}
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Faculty Member
              </p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
