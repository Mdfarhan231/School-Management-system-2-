"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  ClipboardList,
  CheckSquare,
  Search,
  Bell,
  CalendarDays,
  Clock3,
  LogOut,
  UserCircle2,
  TrendingUp,
  ArrowUpRight,
  MoreHorizontal,
} from "lucide-react";

const weeklyAttendance = [
  { day: "Mon", students: 95, teachers: 98 },
  { day: "Tue", students: 92, teachers: 96 },
  { day: "Wed", students: 98, teachers: 100 },
  { day: "Thu", students: 94, teachers: 97 },
  { day: "Fri", students: 90, teachers: 95 },
];

const examRoutines = [
  {
    id: 1,
    date: "OCT 15",
    subject: "Mathematics",
    grade: "Grade 10",
    time: "09:00 AM",
  },
  {
    id: 2,
    date: "OCT 16",
    subject: "Physics",
    grade: "Grade 12",
    time: "10:30 AM",
  },
  {
    id: 3,
    date: "OCT 18",
    subject: "English Literature",
    grade: "Grade 9",
    time: "01:00 PM",
  },
];

const markApprovals = [
  {
    id: 1,
    title: "Biology - Grade 11",
    teacher: "Submitted by Dr. Sarah Smith",
    status: "Pending",
  },
  {
    id: 2,
    title: "History - Grade 8",
    teacher: "Submitted by Mr. James Wilson",
    status: "Pending",
  },
];

function StatCard({ title, value, subtitle, icon: Icon, iconBg }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-slate-400">{title}</p>
          <h3 className="mt-2 text-[32px] font-bold leading-none text-slate-900">
            {value}
          </h3>
          <p className="mt-2 text-xs text-slate-400">{subtitle}</p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconBg}`}
        >
          <Icon size={18} className="text-slate-700" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const savedAdmin = localStorage.getItem("admin");

    if (!savedAdmin) {
      router.replace("/admin/login");
      return;
    }

    try {
      setAdmin(JSON.parse(savedAdmin));
    } catch (error) {
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
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fc]">
        <p className="text-sm font-medium text-slate-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900">
      <div className="flex">
        {/* Sidebar */}
        <aside className="min-h-screen w-[220px] shrink-0 bg-[#151933] text-white flex flex-col justify-between">
          <div>
            <div className="border-b border-white/10 px-5 py-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-lg font-bold">
                  G
                </div>
                <div>
                  <h2 className="text-sm font-semibold leading-tight">
                    Global Knowledge
                  </h2>
                  <p className="text-[10px] uppercase tracking-wider text-white/60">
                    School System
                  </p>
                </div>
              </div>
            </div>

            <nav className="space-y-2 p-4">
              <Link
                href="/admin/dashboard"
                className="flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3 text-sm text-white shadow-lg"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>

              <Link
                href="/admin/students"
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/80 transition hover:bg-white/5"
              >
                <GraduationCap size={18} />
                Students
              </Link>

              <Link
                href="/admin/teachers"
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/80 transition hover:bg-white/5"
              >
                <Users size={18} />
                Teachers
              </Link>

              <Link
                href="/admin/exam-routines"
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/80 transition hover:bg-white/5"
              >
                <ClipboardList size={18} />
                Exam Routine
              </Link>

              <Link
                href="/admin/mark-approvals"
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/80 transition hover:bg-white/5"
              >
                <CheckSquare size={18} />
                Mark Approvals
              </Link>
            </nav>
          </div>

          <div className="p-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/20">
                  <UserCircle2 size={18} className="text-indigo-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Admin Portal</p>
                  <p className="text-xs text-white/60">Super Admin Access</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500/90 px-4 py-2.5 text-sm font-medium hover:bg-rose-500"
              >
                <LogOut size={16} />
                Logout System
              </button>
            </div>

            <p className="mt-4 text-center text-[10px] text-white/35">
              © 2026 Global Knowledge School
            </p>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1">
          {/* Top Bar */}
          <div className="flex items-center justify-between gap-4 px-8 py-5">
            <div className="relative w-full max-w-md">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search students, teachers, records..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            <div className="flex items-center gap-5">
              <button className="relative text-slate-500 hover:text-slate-700">
                <Bell size={18} />
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-rose-500" />
              </button>

              <div className="flex items-center gap-3">
                <img
                  src="https://i.pravatar.cc/100?img=12"
                  alt="Admin"
                  className="h-10 w-10 rounded-xl object-cover"
                />
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800">
                    Welcome, {admin?.name || "admin"}
                  </p>
                  <p className="text-[11px] uppercase tracking-wider text-slate-400">
                    System Controller
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 pb-8">
            {/* Welcome Card */}
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <h1 className="text-[20px] font-extrabold text-slate-900 md:text-[24px]">
                Welcome, {admin?.name || "admin"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
                Use the menu on the left to manage students, teachers, and other
                aspects of the school management system.
              </p>
            </div>

            {/* Overview */}
            <section className="mt-8">
              <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="text-[28px] font-extrabold text-slate-900">
                    School Overview
                  </h2>
                  <p className="text-sm text-slate-400">
                    Manage students, teachers, and other aspects of the school
                    management system.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex -space-x-2">
                    <img
                      src="https://i.pravatar.cc/40?img=1"
                      alt=""
                      className="h-9 w-9 rounded-full border-2 border-white"
                    />
                    <img
                      src="https://i.pravatar.cc/40?img=2"
                      alt=""
                      className="h-9 w-9 rounded-full border-2 border-white"
                    />
                    <img
                      src="https://i.pravatar.cc/40?img=3"
                      alt=""
                      className="h-9 w-9 rounded-full border-2 border-white"
                    />
                    <img
                      src="https://i.pravatar.cc/40?img=4"
                      alt=""
                      className="h-9 w-9 rounded-full border-2 border-white"
                    />
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[10px] font-semibold text-slate-500">
                      +12
                    </div>
                  </div>

                  <button className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-md hover:opacity-95">
                    New Registration
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Total Students"
                  value="1,284"
                  subtitle="+42 new this month"
                  icon={GraduationCap}
                  iconBg="bg-indigo-100"
                />
                <StatCard
                  title="Total Teachers"
                  value="86"
                  subtitle="4 on leave today"
                  icon={Users}
                  iconBg="bg-emerald-100"
                />
                <StatCard
                  title="Average Attendance"
                  value="94.2%"
                  subtitle="Across all grades"
                  icon={TrendingUp}
                  iconBg="bg-amber-100"
                />
                <StatCard
                  title="Pending Approvals"
                  value="12"
                  subtitle="Requires your attention"
                  icon={ArrowUpRight}
                  iconBg="bg-rose-100"
                />
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
                {/* Weekly Attendance */}
                <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        Weekly Attendance
                      </h3>
                      <p className="text-xs text-slate-400">
                        Comparison between students and teachers
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                        Students
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        Teachers
                      </div>
                    </div>
                  </div>

                  <div className="h-[290px]">
                    <div className="flex h-full items-end justify-between gap-6">
                      {weeklyAttendance.map((item) => (
                        <div
                          key={item.day}
                          className="flex flex-1 flex-col items-center"
                        >
                          <div className="flex h-[230px] items-end gap-2">
                            <div
                              className="w-12 rounded-t-xl bg-indigo-500"
                              style={{ height: `${item.students * 2.1}px` }}
                            />
                            <div
                              className="w-12 rounded-t-xl bg-emerald-500"
                              style={{ height: `${item.teachers * 2.1}px` }}
                            />
                          </div>
                          <span className="mt-3 text-xs text-slate-400">
                            {item.day}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Student Distribution */}
                <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Student Distribution
                    </h3>
                    <p className="text-xs text-slate-400">By academic level</p>
                  </div>

                  <div className="flex items-center justify-center py-8">
                    <div className="relative h-40 w-40 rounded-full bg-[conic-gradient(#4f46e5_0deg_144deg,#10b981_144deg_252deg,#f59e0b_252deg_360deg)] p-4">
                      <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white">
                        <span className="text-3xl font-bold text-slate-900">
                          900
                        </span>
                        <span className="text-[11px] font-semibold tracking-wide text-slate-400">
                          TOTAL
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                        <span className="text-slate-500">Primary</span>
                      </div>
                      <span className="font-semibold text-slate-900">400</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <span className="text-slate-500">Secondary</span>
                      </div>
                      <span className="font-semibold text-slate-900">300</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                        <span className="text-slate-500">Higher Secondary</span>
                      </div>
                      <span className="font-semibold text-slate-900">200</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
                {/* Exam Routine */}
                <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        Exam Routine
                      </h3>
                      <p className="text-xs text-slate-400">
                        Upcoming scheduled assessments
                      </p>
                    </div>
                    <CalendarDays size={18} className="text-slate-400" />
                  </div>

                  <div className="space-y-4">
                    {examRoutines.map((exam) => (
                      <div
                        key={exam.id}
                        className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 flex-col items-center justify-center rounded-xl bg-white text-[10px] font-bold text-indigo-600 shadow-sm">
                            <span>{exam.date.split(" ")[0]}</span>
                            <span>{exam.date.split(" ")[1]}</span>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold text-slate-900">
                              {exam.subject}
                            </h4>
                            <p className="text-xs text-slate-400">{exam.grade}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                          <Clock3 size={14} />
                          {exam.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mark Approvals */}
                <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        Mark Approvals
                      </h3>
                      <p className="text-xs text-slate-400">
                        Results waiting for verification
                      </p>
                    </div>
                    <MoreHorizontal size={18} className="text-slate-400" />
                  </div>

                  <div className="space-y-4">
                    {markApprovals.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-400">
                            {item.title.charAt(0)}
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold text-slate-900">
                              {item.title}
                            </h4>
                            <p className="text-xs text-slate-400">{item.teacher}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-600">
                            {item.status}
                          </span>
                          <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500 hover:bg-indigo-100">
                            ›
                          </button>
                        </div>
                      </div>
                    ))}

                    <button className="mt-2 w-full rounded-2xl border border-dashed border-slate-300 py-3 text-sm font-medium text-slate-400 hover:bg-slate-50">
                      View All Pending Requests
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}