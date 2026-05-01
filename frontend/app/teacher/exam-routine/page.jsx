"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import {
  Calendar,
  Search,
  Clock3,
  CalendarDays,
  ArrowRightCircle,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Safely format a time string regardless of whether it's already 12h or raw 24h
function formatTime(t) {
  if (!t) return "—";
  const upper = t.toString().toUpperCase();
  if (upper.includes("AM") || upper.includes("PM")) {
    return t
      .toString()
      .replace(/\s*(AM|PM)\s*/i, (_, p) => ` ${p.toUpperCase()}`)
      .trim();
  }
  const [h, m] = t.split(":");
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
}

export default function TeacherExamRoutinePage() {
  const router = useRouter();
  const [teacher, setTeacher] = useState(null);
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState("all");

  useEffect(() => {
    const savedTeacher = localStorage.getItem("teacher");

    if (!savedTeacher) {
      router.replace("/teacher/login");
      return;
    }

    const parsedTeacher = JSON.parse(savedTeacher);
    setTeacher(parsedTeacher);

    fetchTeacherRoutine(parsedTeacher.teacher_id || parsedTeacher.id);
  }, [router]);

  const fetchTeacherRoutine = async (teacherId) => {
    try {
      const data = await apiRequest(`/teacher/exam-routines/${teacherId}`);
      setRoutines(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch teacher exam routines:", error);
      setRoutines([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter routines based on search and filter mode
  const filteredExams = routines.filter((exam) => {
    const subjectName = (exam.subject_name || exam.subject || "").toLowerCase();
    const matchesSearch = subjectName.includes(searchTerm.toLowerCase());

    const examDate = new Date(exam.exam_date || exam.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filterMode === "upcoming") return matchesSearch && examDate >= today;
    if (filterMode === "past") return matchesSearch && examDate < today;
    return matchesSearch;
  });

  if (!teacher) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 p-4 md:p-8">
      {/* Dynamic Header */}
      <header className="relative p-8 rounded-[2.5rem] bg-slate-900 overflow-hidden shadow-2xl shadow-indigo-900/20">
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[80px] -ml-32 -mb-32 rounded-full" />

        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-[10px] font-black uppercase tracking-widest">
              <CalendarDays size={12} />
              Session 2026-27
            </div>
            <h2 className="text-4xl font-black text-white tracking-tight">
              Exam Routine
            </h2>
            <p className="text-slate-400 text-sm max-w-md font-medium">
              Your upcoming invigilation schedule and examination dates for{" "}
              {teacher.subjects || "assigned subjects"}.
            </p>
          </div>


        </div>
      </header>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
            size={18}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by subject name..."
            className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all shadow-sm"
          />
        </div>

        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          {["all", "upcoming", "past"].map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filterMode === mode
                  ? "bg-slate-900 text-white shadow-lg"
                  : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Exam List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium">
              Loading exam routine...
            </p>
          </div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              {filteredExams.map((exam, idx) => {
                const rawDate = exam.exam_date || exam.date;
                const examDate = new Date(rawDate);
                const todayStr = new Date().toDateString();
                const isToday = examDate.toDateString() === todayStr;
                const isPast =
                  examDate <
                  new Date(new Date().setHours(0, 0, 0, 0));

                return (
                  <motion.div
                    layout
                    key={
                      (exam.subject_name || exam.subject || "") +
                      (exam.exam_date || exam.date || idx)
                    }
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className={`group relative bg-white rounded-3xl border transition-all duration-300 ${
                      isToday
                        ? "border-indigo-500 ring-4 ring-indigo-500/5 shadow-xl shadow-indigo-600/10"
                        : "border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-slate-200/50"
                    }`}
                  >
                    {isToday && (
                      <div className="absolute -top-3 left-8 px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg z-10 animate-bounce">
                        Happening Today
                      </div>
                    )}

                    <div className="flex flex-col lg:flex-row lg:items-center p-2 lg:p-4 gap-4">
                      {/* Left Column: Date */}
                      <div
                        className={`p-6 lg:w-48 rounded-2xl flex flex-col items-center justify-center text-center transition-colors ${
                          isToday
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-50 text-slate-900 group-hover:bg-indigo-50"
                        }`}
                      >
                        <span
                          className={`text-[10px] font-black uppercase tracking-[0.3em] mb-1 ${
                            isToday ? "text-indigo-200" : "text-slate-400"
                          }`}
                        >
                          {examDate.toLocaleDateString(undefined, {
                            weekday: "short",
                          })}
                        </span>
                        <span className="text-3xl font-black mb-1">
                          {examDate.getDate()}
                        </span>
                        <span
                          className={`text-xs font-black uppercase tracking-widest ${
                            isToday ? "text-indigo-200" : "text-slate-400"
                          }`}
                        >
                          {examDate.toLocaleDateString(undefined, {
                            month: "short",
                          })}
                        </span>
                      </div>

                      {/* Middle: Info */}
                      <div className="flex-1 px-4 lg:px-2 py-4 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-200">
                            Class{" "}
                            {exam.class_name || exam.class || "N/A"}
                          </span>
                          {exam.exam_name && (
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-100">
                              {exam.exam_name}
                            </span>
                          )}
                        </div>

                        <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {exam.subject_name ||
                            exam.subject ||
                            "Unknown Subject"}{" "}
                          Examination
                        </h3>

                        <div className="flex flex-wrap items-center gap-6 text-slate-500">
                          <div className="flex items-center gap-2">
                            <Clock3
                              className="text-indigo-500"
                              size={16}
                            />
                            <span className="text-sm font-bold">
                              {formatTime(exam.start_time)}
                              {exam.end_time &&
                                ` – ${formatTime(exam.end_time)}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="p-4 lg:p-6 border-t lg:border-t-0 lg:border-l border-slate-100 flex items-center justify-between lg:flex-col lg:justify-center gap-4">
                        <button className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors text-[10px] font-black uppercase tracking-widest">
                          <Info size={14} /> Details
                        </button>
                        <button
                          className={`p-4 rounded-2xl flex items-center justify-center transition-all ${
                            isPast
                              ? "bg-slate-100 text-slate-300 cursor-default"
                              : "bg-slate-900 text-white hover:bg-indigo-600 shadow-lg shadow-slate-900/10"
                          }`}
                        >
                          <ArrowRightCircle
                            size={22}
                            className={isPast ? "rotate-90" : ""}
                          />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredExams.length === 0 && !loading && (
              <div className="py-20 text-center flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-slate-200 rounded-[2.5rem]">
                <div className="w-20 h-20 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center">
                  <Calendar size={40} />
                </div>
                <div>
                  <h5 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
                    No Examinations Found
                  </h5>
                  <p className="text-slate-500 font-medium">
                    Try adjusting your search or filters to find what
                    you&apos;re looking for.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Note */}
      <footer className="bg-amber-50 rounded-3xl p-8 border border-amber-100 flex flex-col md:flex-row items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
          <Info size={32} />
        </div>
        <div className="space-y-1">
          <h4 className="text-lg font-black text-amber-900 uppercase tracking-tighter">
            Invigilation Protocol
          </h4>
          <p className="text-sm text-amber-800/70 leading-relaxed font-medium">
            Teachers must collect exam kernels from the control room 45 minutes
            prior to the session. Ensure all student IDs are verified before
            allowing entry into the examination hall. In case of any
            discrepancies, contact the HOD immediately at ext. 402.
          </p>
        </div>
      </footer>
    </div>
  );
}