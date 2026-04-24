"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

import {
  Users,
  GraduationCap,
  Calendar,
  CheckSquare,
  Clock,
  MoreHorizontal,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const attendanceData = [
  { name: "Mon", students: 95, teachers: 98 },
  { name: "Tue", students: 92, teachers: 96 },
  { name: "Wed", students: 98, teachers: 100 },
  { name: "Thu", students: 94, teachers: 97 },
  { name: "Fri", students: 90, teachers: 95 },
];

const studentDistribution = [
  { name: "Primary", value: 400, color: "#4f46e5" },
  { name: "Secondary", value: 300, color: "#10b981" },
  { name: "Higher Secondary", value: 200, color: "#f59e0b" },
];



function StatCard({ title, value, subtext, icon: Icon, colorClass }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-1 text-3xl font-bold text-slate-900">{value}</h3>
          <p className="mt-1 text-xs font-medium text-slate-400">{subtext}</p>
        </div>
        <div className={cn("rounded-xl p-3 transition-colors", colorClass)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminDashboardPage() {
  const [admin, setAdmin] = useState(null);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [examsLoading, setExamsLoading] = useState(true);

  const [approvalSummary, setApprovalSummary] = useState({
    total_pending: 0,
    recent_pending: [],
  });
  const [approvalLoading, setApprovalLoading] = useState(true);

  useEffect(() => {
    const savedAdmin = localStorage.getItem("admin");
    if (savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin));
        fetchPendingSummary();
        fetchUpcomingExams();
      } catch {
        // Layout handles auth redirect
      }
    }
  }, []);

  const fetchPendingSummary = async () => {
    try {
      setApprovalLoading(true);
      const data = await apiRequest("/student-marks/pending-summary");

      setApprovalSummary({
        total_pending: data?.total_pending || 0,
        recent_pending: Array.isArray(data?.recent_pending) ? data.recent_pending : [],
      });
    } catch (error) {
      console.error("Failed to load pending summary:", error.message);
      setApprovalSummary({
        total_pending: 0,
        recent_pending: [],
      });
    } finally {
      setApprovalLoading(false);
    }
  };

  const fetchUpcomingExams = async () => {
    try {
      setExamsLoading(true);
      const data = await apiRequest("/exam-routines");
      setUpcomingExams(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch exam routines:", error.message);
      setUpcomingExams([]);
    } finally {
      setExamsLoading(false);
    }
  };

  return (
    <div className="space-y-10 p-6 lg:p-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-8 shadow-sm"
      >
        <div className="relative z-10">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Welcome, {admin?.name || "admin"}
          </h1>
          <p className="mt-2 max-w-2xl text-lg text-slate-500">
            Use the menu on the left to manage students, teachers, and other aspects of the school management system.
          </p>
        </div>
        <div className="absolute right-0 top-0 -mr-32 -mt-32 h-64 w-64 rounded-full bg-indigo-50 opacity-50 blur-3xl" />
      </motion.div>

      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            School Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage students, teachers, and other aspects of the school management system.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <img
                key={i}
                src={`https://picsum.photos/seed/student-${i}/40/40`}
                alt={`Student ${i}`}
                className="h-8 w-8 rounded-full border-2 border-white shadow-sm"
                referrerPolicy="no-referrer"
              />
            ))}
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-bold text-slate-500">
              +12
            </div>
          </div>

          <button className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700">
            New Registration
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value="1,284"
          subtext="+42 new this month"
          icon={GraduationCap}
          colorClass="bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white"
        />
        <StatCard
          title="Total Teachers"
          value="86"
          subtext="4 on leave today"
          icon={Users}
          colorClass="bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white"
        />
        <StatCard
          title="Average Attendance"
          value="94.2%"
          subtext="Across all grades"
          icon={TrendingUp}
          colorClass="bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white"
        />
        <StatCard
          title="Pending Approvals"
          value={approvalSummary.total_pending}
          subtext="Requires your attention"
          icon={CheckSquare}
          colorClass="bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm lg:col-span-2">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Weekly Attendance</h3>
              <p className="text-xs font-medium text-slate-400">
                Comparison between students and teachers
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-indigo-500" />
                <span className="text-xs font-bold text-slate-500">Students</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-slate-500">Teachers</span>
              </div>
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceData}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTeachers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 600 }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="students"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorStudents)"
                />
                <Area
                  type="monotone"
                  dataKey="teachers"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorTeachers)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
          <h3 className="mb-2 text-lg font-bold text-slate-900">Student Distribution</h3>
          <p className="mb-8 text-xs font-medium text-slate-400">By academic level</p>

          <div className="relative h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={studentDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {studentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-900">900</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Total
              </span>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {studentDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs font-bold text-slate-600">{item.name}</span>
                </div>
                <span className="text-xs font-black text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-50 p-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Exam Routine</h3>
              <p className="text-xs font-medium text-slate-400">
                Upcoming scheduled assessments
              </p>
            </div>
            <button className="rounded-xl p-2 transition-colors hover:bg-slate-50">
              <Calendar className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          <div className={`space-y-3 p-4 ${upcomingExams.length > 2 ? "max-h-[280px] overflow-y-auto" : ""}`} style={upcomingExams.length > 2 ? { scrollbarWidth: "thin", scrollbarColor: "#c7d2fe transparent" } : {}}>
            {examsLoading ? (
              <div className="p-6 text-sm text-slate-400">
                Loading exam routines...
              </div>
            ) : upcomingExams.length === 0 ? (
              <div className="p-6 text-sm text-slate-400">
                No upcoming exams found.
              </div>
            ) : (
              upcomingExams.map((exam) => {
                const dateObj = new Date(exam.exam_date);
                const monthStr = dateObj.toLocaleString("en-US", { month: "short" }).toUpperCase();
                const dayStr = dateObj.getDate();

                const formatTime = (timeStr) => {
                  if (!timeStr) return "";
                  const [h, m] = timeStr.split(":");
                  const hour = parseInt(h, 10);
                  const suffix = hour >= 12 ? "PM" : "AM";
                  const displayHour = hour % 12 || 12;
                  return `${String(displayHour).padStart(2, "0")}:${m} ${suffix}`;
                };

                return (
                  <div
                    key={exam.id}
                    className="group flex items-center justify-between rounded-2xl border border-transparent bg-slate-50 p-4 transition-all hover:border-indigo-100 hover:bg-white"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl border border-slate-100 bg-white shadow-sm">
                        <span className="text-[10px] font-bold uppercase text-indigo-500">
                          {monthStr}
                        </span>
                        <span className="text-sm font-black text-slate-900">
                          {dayStr}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{exam.subject_name}</h4>
                        <p className="text-xs font-medium text-slate-500">{exam.class_name}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(exam.start_time)}
                      </div>
                      <Link
                        href="/admin/exam-routines"
                        className="mt-1 inline-block text-[10px] font-black uppercase tracking-widest text-indigo-600 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-50 p-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Mark Approvals</h3>
              <p className="text-xs font-medium text-slate-400">
                Total pending marks: {approvalSummary.total_pending}
              </p>
            </div>
            <button className="rounded-xl p-2 transition-colors hover:bg-slate-50">
              <MoreHorizontal className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          <div className="space-y-3 p-4">
            {approvalLoading ? (
              <div className="p-6 text-sm text-slate-400">
                Loading pending approvals...
              </div>
            ) : approvalSummary.recent_pending.length === 0 ? (
              <div className="p-6 text-sm text-slate-400">
                No pending approvals found.
              </div>
            ) : (
              approvalSummary.recent_pending.map((approval) => (
                <div
                  key={approval.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 p-5 transition-all hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-400">
                      {approval.subject_name?.charAt(0)}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {approval.subject_name} - {approval.class_name}
                      </h4>
                      <p className="text-xs font-medium text-slate-500">
                        Submitted by {approval.teacher_name || "Unknown Teacher"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600">
                      {approval.status}
                    </span>
                    <Link
                      href="/admin/mark-approvals"
                      className="rounded-lg bg-indigo-50 p-2 text-indigo-600 transition-all hover:bg-indigo-600 hover:text-white"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}

            <div className="px-4 pt-4">
              <Link
                href="/admin/mark-approvals"
                className="block w-full rounded-2xl border-2 border-dashed border-slate-200 py-3 text-center text-xs font-bold text-slate-400 transition-all hover:border-indigo-300 hover:text-indigo-500"
              >
                View All Pending Requests
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}