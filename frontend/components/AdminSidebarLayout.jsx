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
  UserCheck,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  ListChecks,
} from "lucide-react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { label: "Students", icon: GraduationCap, href: "/admin/students" },
  { label: "All Students", icon: ListChecks, href: "/admin/all-students" },
  { label: "Teachers", icon: Users, href: "/admin/teachers" },
  { label: "All Teachers", icon: UserCheck, href: "/admin/all-teachers" },
  { label: "Exam Routine", icon: Calendar, href: "/admin/exam-routines" },
  { label: "Mark Approvals", icon: CheckSquare, href: "/admin/mark-approvals" },
  { label: "Notices", icon: Megaphone, href: "/admin/notices" },
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
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* ── Sidebar Navigation (Collapsible) ── */}
      <aside
        className={cn(
          "relative z-50 flex flex-col border-r border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-300 ease-in-out shrink-0",
          isSidebarOpen ? "w-72" : "w-20"
        )}
      >
        <div className={cn("flex items-center p-6 h-20 shrink-0", isSidebarOpen ? "justify-between" : "justify-center px-0")}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div
              className={cn(
                "transition-all duration-300 whitespace-nowrap overflow-hidden flex flex-col justify-center",
                isSidebarOpen ? "w-auto opacity-100" : "w-0 opacity-0"
              )}
            >
              <h2 className="text-lg font-bold leading-tight text-slate-900">
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
          className="absolute -right-3 top-7 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50 z-50 text-slate-500 transition-transform"
        >
          {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        <nav className="mt-4 flex-1 space-y-2 px-4 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                title={!isSidebarOpen ? item.label : undefined}
                className={cn(
                  "group flex items-center rounded-xl py-3.5 transition-all overflow-hidden",
                  isSidebarOpen ? "px-4 gap-3 w-full" : "justify-center px-0 w-12 mx-auto",
                  isActive
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive
                      ? "text-white"
                      : "text-slate-400 group-hover:text-slate-900"
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
          <div className={cn("rounded-2xl border border-slate-200 bg-slate-50 transition-all duration-300", isSidebarOpen ? "p-5" : "p-2 flex justify-center")}>
            <div
              className={cn(
                "flex items-center gap-3 overflow-hidden transition-all duration-300",
                isSidebarOpen ? "mb-4 h-10 opacity-100" : "h-0 opacity-0 mb-0 hidden"
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200">
                <UserCheck className="h-5 w-5 text-slate-600" />
              </div>
              <div className="whitespace-nowrap">
                <p className="text-sm font-bold text-slate-900">Admin Portal</p>
                <p className="text-xs text-slate-400">Super Admin Access</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title={!isSidebarOpen ? "Logout" : undefined}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl bg-rose-50 text-rose-500 transition-all hover:bg-rose-500 hover:text-white",
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
              "text-center text-[10px] font-medium text-slate-600 whitespace-nowrap transition-all duration-300 overflow-hidden",
              isSidebarOpen ? "mt-6 opacity-100 h-auto" : "mt-0 opacity-0 h-0 m-0"
            )}
          >
            © 2026 Global Knowledge
          </p>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-slate-50">
        {/* Header */}
        <header className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 lg:px-10">
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
        <div className="flex flex-1 flex-col overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
