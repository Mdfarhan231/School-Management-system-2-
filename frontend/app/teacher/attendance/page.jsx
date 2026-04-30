"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Calendar,
  Users,
  Save,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

const ATTENDANCE_LIMIT_SECONDS = 60;

export default function TeacherAttendancePage() {
  const router = useRouter();

  /* ── state ──────────────────────────────────────────────── */
  const [teacher, setTeacher]               = useState(null);
  const [classes, setClasses]               = useState([]);
  const [students, setStudents]             = useState([]);
  const [attendanceMap, setAttendanceMap]   = useState({});
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedShift, setSelectedShift]   = useState("");
  const [attendanceDate, setAttendanceDate] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving]                 = useState(false);
  const [message, setMessage]               = useState({ text: "", ok: true });
  const [isLoaded, setIsLoaded]             = useState(false);

  // Timer
  const [pageStartTime, setPageStartTime]   = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  /* ── init ────────────────────────────────────────────────── */
  useEffect(() => {
    const saved = localStorage.getItem("teacher");
    if (!saved) { router.replace("/teacher/login"); return; }

    setTeacher(JSON.parse(saved));
    fetchClasses();

    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Dhaka",
      year: "numeric", month: "2-digit", day: "2-digit",
    }).format(new Date());

    setAttendanceDate(today);
    setPageStartTime(Date.now());
  }, [router]);

  /* ── elapsed timer ───────────────────────────────────────── */
  useEffect(() => {
    if (!pageStartTime) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - pageStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [pageStartTime]);

  const timerExpired = elapsedSeconds > ATTENDANCE_LIMIT_SECONDS;

  const formatTimer = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  /* ── derived stats ───────────────────────────────────────── */
  const stats = useMemo(() => ({
    present: Object.values(attendanceMap).filter(v => v === "present").length,
    absent:  Object.values(attendanceMap).filter(v => v === "absent").length,
    late:    Object.values(attendanceMap).filter(v => v === "late").length,
    pending: Object.values(attendanceMap).filter(v => !v).length,
  }), [attendanceMap]);

  /* ── API helpers ─────────────────────────────────────────── */
  const fetchClasses = async () => {
    try {
      const data = await apiRequest("/classes");
      setClasses(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch classes:", e);
      setClasses([]);
    }
  };

  const fetchStudents = async () => {
    if (!selectedClassId || !selectedShift || !attendanceDate) {
      setMessage({ text: "Please select class, shift and date.", ok: false });
      return;
    }
    try {
      setLoadingStudents(true);
      setMessage({ text: "Loading students…", ok: true });

      const data = await apiRequest("/attendance/students", "POST", {
        class_id: Number(selectedClassId),
        shift: selectedShift,
      });

      if (!Array.isArray(data) || data.length === 0) {
        setStudents([]);
        setAttendanceMap({});
        setIsLoaded(false);
        setMessage({ text: "No students found for this class and shift.", ok: false });
        return;
      }

      setStudents(data);
      const init = {};
      data.forEach(s => { init[s.student_id] = ""; });
      setAttendanceMap(init);
      setIsLoaded(true);
      setMessage({ text: "Students loaded. Select status then save.", ok: true });
    } catch (e) {
      console.error("Failed to load students:", e);
      setStudents([]);
      setAttendanceMap({});
      setIsLoaded(false);
      setMessage({ text: "Failed to load students.", ok: false });
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleAttendanceChange = (studentId, value) => {
    // If timer has not expired: allow present / absent only
    // If timer expired: allow late only
    if (!timerExpired && value === "late") return;
    if (timerExpired && value !== "late") return;
    setAttendanceMap(prev => ({ ...prev, [studentId]: value }));
  };

  const handleSaveAttendance = async () => {
    if (!teacher?.teacher_id) {
      setMessage({ text: "Teacher session not found.", ok: false }); return;
    }
    if (!selectedClassId || !selectedShift || !attendanceDate) {
      setMessage({ text: "Please select class, shift and date.", ok: false }); return;
    }
    if (students.length === 0) {
      setMessage({ text: "No students loaded to save.", ok: false }); return;
    }

    const attendance = students
      .map(s => ({ student_id: s.student_id, status: attendanceMap[s.student_id] || "" }))
      .filter(r => r.status !== "");

    if (attendance.length === 0) {
      setMessage({ text: "Please mark at least one student before saving.", ok: false }); return;
    }

    try {
      setSaving(true);
      const data = await apiRequest("/attendance/store", "POST", {
        teacher_id: teacher.teacher_id,
        class_id: Number(selectedClassId),
        shift: selectedShift,
        attendance_date: attendanceDate,
        timer_expired: timerExpired,
        attendance,
      });
      setMessage({ text: data.message || "Attendance saved successfully.", ok: true });
    } catch (e) {
      console.error("Failed to save attendance:", e);
      setMessage({ text: e.message || "Server error while saving attendance.", ok: false });
    } finally {
      setSaving(false);
    }
  };

  /* ── loading guard ───────────────────────────────────────── */
  if (!teacher) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-slate-500 font-medium text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  /* ── render ──────────────────────────────────────────────── */
  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-500 p-6 lg:p-8">

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Take Attendance</h2>
          <div className="flex items-center gap-2 mt-1">
            <Calendar size={13} className="text-slate-400" />
            <span className="text-slate-500 text-sm font-medium">
              {new Date().toLocaleDateString(undefined, {
                weekday: "long", month: "long", day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Session Timer badge */}
        <div className="flex items-center gap-3 bg-blue-50/60 border border-blue-100 px-4 py-2.5 rounded-2xl">
          <div className={`p-2 rounded-full transition-colors ${
            timerExpired ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600 animate-pulse"
          }`}>
            <Clock size={15} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 leading-none">
              Session Timer
            </span>
            <span className="font-mono font-bold text-slate-700">{formatTimer(elapsedSeconds)}</span>
          </div>
          <div className="h-8 w-px bg-blue-200 mx-1 hidden sm:block" />
          <p className="text-xs font-bold hidden sm:block whitespace-nowrap">
            {timerExpired
              ? <span className="text-emerald-600">Late Present unlocked</span>
              : <span className="text-blue-600">Present / Absent allowed</span>}
          </p>
        </div>
      </header>

      {/* ── Control Panel ──────────────────────────────────── */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">

        {/* Filters row */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Class */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Select Class
            </label>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            >
              <option value="">-- Select Class --</option>
              {classes.map(c => (
                <option key={c.class_id} value={c.class_id}>{c.class_name}</option>
              ))}
            </select>
          </div>

          {/* Shift */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Shift
            </label>
            <select
              value={selectedShift}
              onChange={e => setSelectedShift(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            >
              <option value="">-- Select Shift --</option>
              <option value="Morning">Morning</option>
              <option value="Day">Day</option>
            </select>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Attendance Date
            </label>
            <input
              type="date"
              value={attendanceDate}
              onChange={e => setAttendanceDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={fetchStudents}
              disabled={loadingStudents}
              className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-60"
            >
              {loadingStudents ? "Loading…" : "Load Students"}
            </button>
            <button
              type="button"
              onClick={handleSaveAttendance}
              disabled={saving || !isLoaded}
              className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Save size={13} />
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>

        {/* Stats row — only shown when students are loaded */}
        {isLoaded && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { label: "Present", count: stats.present, color: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-100" },
              { label: "Absent",  count: stats.absent,  color: "text-rose-600",    bg: "bg-rose-50",    ring: "ring-rose-100" },
              { label: "Late",    count: stats.late,    color: "text-amber-600",   bg: "bg-amber-50",   ring: "ring-amber-100" },
              { label: "Pending", count: stats.pending, color: "text-slate-400",   bg: "bg-slate-50",   ring: "ring-slate-100" },
            ].map(stat => (
              <div key={stat.label} className={`${stat.bg} ${stat.color} p-4 rounded-2xl shadow-sm ring-1 ${stat.ring}`}>
                <div className="text-[10px] uppercase font-black tracking-widest opacity-60 mb-1">{stat.label}</div>
                <div className="text-2xl font-black">{stat.count}</div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Feedback message */}
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold ${
                message.ok
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  : "bg-rose-50 text-rose-700 border border-rose-100"
              }`}
            >
              {message.ok
                ? <CheckCircle size={16} className="shrink-0" />
                : <AlertCircle size={16} className="shrink-0" />}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Student Table / Empty State ────────────────────── */}
      <AnimatePresence mode="wait">
        {isLoaded ? (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-900 text-white text-[10px] uppercase font-black tracking-widest">
                    <th className="px-6 py-4">Roll</th>
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4 text-center">Shift</th>
                    <th className="px-6 py-4 text-right">Status Selection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map(student => {
                    const status = attendanceMap[student.student_id] || "";
                    return (
                      <tr key={student.student_id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Roll */}
                        <td className="px-6 py-5 font-mono font-bold text-slate-400 text-sm">
                          #{String(student.roll).padStart(2, "0")}
                        </td>

                        {/* Name */}
                        <td className="px-6 py-5 font-bold text-slate-900">{student.name}</td>

                        {/* Shift */}
                        <td className="px-6 py-5 text-center">
                          <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                            {student.shift || selectedShift}
                          </span>
                        </td>

                        {/* Status buttons */}
                        <td className="px-6 py-5">
                          <div className="flex justify-end items-center gap-2">

                            {/* Present — available before timer expires */}
                            <button
                              disabled={timerExpired}
                              onClick={() => handleAttendanceChange(student.student_id, "present")}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                status === "present"
                                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                                  : timerExpired
                                    ? "bg-slate-50 text-slate-200 cursor-not-allowed opacity-40"
                                    : "bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                              }`}
                            >
                              Present
                            </button>

                            {/* Absent — available before timer expires */}
                            <button
                              disabled={timerExpired}
                              onClick={() => handleAttendanceChange(student.student_id, "absent")}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                status === "absent"
                                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                                  : timerExpired
                                    ? "bg-slate-50 text-slate-200 cursor-not-allowed opacity-40"
                                    : "bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                              }`}
                            >
                              Absent
                            </button>

                            {/* Late — locked until timer expires */}
                            <div className="relative group">
                              <button
                                disabled={!timerExpired}
                                onClick={() => handleAttendanceChange(student.student_id, "late")}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                  status === "late"
                                    ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                                    : !timerExpired
                                      ? "bg-slate-50 text-slate-200 cursor-not-allowed opacity-50"
                                      : "bg-slate-100 text-slate-400 hover:bg-amber-50 hover:text-amber-600"
                                }`}
                              >
                                Late
                              </button>
                              {/* Tooltip when locked */}
                              {!timerExpired && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-36 bg-slate-900 text-white text-[10px] p-2 rounded-lg text-center shadow-xl z-10 font-bold whitespace-nowrap pointer-events-none">
                                  Unlocks in {ATTENDANCE_LIMIT_SECONDS - elapsedSeconds}s
                                </div>
                              )}
                            </div>

                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-20 text-center flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-slate-200 rounded-3xl"
          >
            <div className="w-16 h-16 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center">
              <Users size={32} />
            </div>
            <div>
              <h5 className="text-xl font-bold text-slate-900">No Students Displayed</h5>
              <p className="text-slate-500 mt-1 text-sm">
                Select class and shift, then click "Load Students" to begin.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}