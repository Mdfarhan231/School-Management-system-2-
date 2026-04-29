"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Download,
  Share2,
  Plus,
  Trash2,
  ChevronDown,
  BookOpen,
  GraduationCap,
  FileText,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

// ─── Colour palette per index ───────────────────────────────────────────────
const CARD_COLORS = [
  { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100" },
  { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
  { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-100" },
  { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100" },
  { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100" },
  { bg: "bg-sky-50", text: "text-sky-600", border: "border-sky-100" },
];

function colorFor(idx) {
  return CARD_COLORS[idx % CARD_COLORS.length];
}

function formatTime(t) {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hr = parseInt(h, 10);
  const ampm = hr >= 12 ? "PM" : "AM";
  return `${hr % 12 || 12}:${m} ${ampm}`;
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Custom Select ───────────────────────────────────────────────────────────
function SelectField({ label, name, value, onChange, options, placeholder, disabled }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => String(o.value) === String(value));

  return (
    <div className="space-y-2 relative">
      <label className="text-sm font-bold text-gray-900">{label}</label>
      <button
        type="button"
        onClick={() => !disabled && setOpen((p) => !p)}
        className={`w-full px-4 py-3 rounded-xl border flex items-center justify-between transition-colors ${
          disabled
            ? "border-gray-100 bg-slate-50 cursor-not-allowed"
            : "border-gray-200 bg-white hover:border-gray-300"
        }`}
      >
        <span className={selected ? "text-gray-900 font-medium" : "text-gray-300"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform ${open ? "rotate-180" : ""} ${
            disabled ? "text-gray-200" : "text-gray-400"
          }`}
        />
      </button>
      <AnimatePresence>
        {open && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute z-30 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden py-1"
          >
            {options.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-400 text-center">No subjects found</p>
            ) : (
              options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(name, opt.value);
                    setOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                    String(value) === String(opt.value)
                      ? "bg-indigo-600 text-white"
                      : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                  }`}
                >
                  {opt.label}
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function ExamRoutinePage() {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const [routines, setRoutines] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [form, setForm] = useState({
    exam_id: "",
    class_id: "",
    subject_id: "",
    exam_date: "",
    start_time: "",
    end_time: "",
  });

  useEffect(() => {
    fetchRoutines();
    fetchClasses();
    fetchExams();
  }, []);

  const fetchRoutines = async () => {
    try {
      const data = await apiRequest("/exam-routines");
      setRoutines(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch routines:", err);
    }
  };

  const fetchClasses = async () => {
    try {
      const data = await apiRequest("/classes");
      setClasses(data);
    } catch {}
  };

  const fetchSubjectsByClass = async (classId) => {
    try {
      const data = await apiRequest(`/classes/${classId}/subjects`);
      setSubjects(Array.isArray(data) ? data : []);
    } catch {
      setSubjects([]);
    }
  };

  const fetchExams = async () => {
    try {
      const data = await apiRequest("/exams");
      setExams(data);
    } catch {}
  };

  const handleSelect = (name, value) => {
    if (name === "class_id") {
      // Reset subject and load subjects for chosen class
      setSubjects([]);
      setForm((prev) => ({ ...prev, class_id: value, subject_id: "" }));
      fetchSubjectsByClass(value);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiRequest("/exam-routines", "POST", form);
      setForm({
        exam_id: "",
        class_id: "",
        subject_id: "",
        exam_date: "",
        start_time: "",
        end_time: "",
      });
      setShowForm(false);
      fetchRoutines();
    } catch (err) {
      alert(err.message || "Failed to add routine");
    } finally {
      setLoading(false);
    }
  };

  const deleteRoutine = async (id) => {
    if (!confirm("Delete this exam routine?")) return;
    try {
      setDeletingId(id);
      await apiRequest(`/exam-routines/${id}`, "DELETE");
      setRoutines((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportCSV = () => {
    if (!routines.length) return;
    const headers = ["Exam", "Class", "Subject", "Date", "Start Time", "End Time"];
    const rows = routines.map((r) => [
      r.exam_name, r.class_name, r.subject_name,
      r.exam_date, r.start_time, r.end_time,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exam_routine.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const examOptions = exams.map((e) => ({ value: e.exam_id, label: e.exam_name }));
  const classOptions = classes.map((c) => ({ value: c.class_id, label: c.class_name }));
  const subjectOptions = subjects.map((s) => ({ value: s.subject_id, label: s.subject_name }));

  return (
    <div className="flex-1 p-6 space-y-6 bg-[#f1f5f9] overflow-y-auto">
      {/* ── Header ── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Exam Routine</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Upcoming Semester Examinations — 2026
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Export CSV"
          >
            <Share2 size={20} />
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-all"
          >
            <Download size={16} />
            Export CSV
          </button>
          <button
            onClick={() => setShowForm((p) => !p)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
          >
            <Plus size={16} />
            Add Routine
          </button>
        </div>
      </header>

      {/* ── Add Form (collapsible) ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden"
          >
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg">New Exam Routine</h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SelectField
                  label="Exam"
                  name="exam_id"
                  value={form.exam_id}
                  onChange={handleSelect}
                  options={examOptions}
                  placeholder="Select exam"
                />
                <SelectField
                  label="Class"
                  name="class_id"
                  value={form.class_id}
                  onChange={handleSelect}
                  options={classOptions}
                  placeholder="Select class"
                />
                <SelectField
                  label="Subject"
                  name="subject_id"
                  value={form.subject_id}
                  onChange={handleSelect}
                  options={subjectOptions}
                  placeholder={form.class_id ? "Select subject" : "Select class first"}
                  disabled={!form.class_id}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">Exam Date</label>
                  <input
                    type="date"
                    name="exam_date"
                    value={form.exam_date}
                    onChange={handleChange}
                    min={today}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">Start Time</label>
                  <input
                    type="time"
                    name="start_time"
                    value={form.start_time}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">End Time</label>
                  <input
                    type="time"
                    name="end_time"
                    value={form.end_time}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? "Adding…" : "Add Exam Routine"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Routine Cards Grid ── */}
      {routines.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-400 flex items-center justify-center">
            <Calendar size={32} />
          </div>
          <div className="text-center">
            <h5 className="text-xl font-bold text-slate-900">No Routines Yet</h5>
            <p className="text-slate-500 mt-1 text-sm">
              Click "Add Routine" to schedule the first exam.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence>
            {routines.map((routine, idx) => {
              const col = colorFor(idx);
              return (
                <motion.div
                  key={routine.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`bg-white rounded-3xl border ${col.border} p-6 shadow-sm hover:shadow-md transition-shadow group`}
                >
                  {/* Card top row */}
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className={`w-12 h-12 rounded-2xl ${col.bg} ${col.text} flex items-center justify-center font-black text-lg group-hover:scale-110 transition-transform`}
                    >
                      {idx + 1}
                    </div>
                    <button
                      onClick={() => deleteRoutine(routine.id)}
                      disabled={deletingId === routine.id}
                      className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Subject */}
                  <h3 className="text-xl font-bold text-slate-900 mb-1">
                    {routine.subject_name}
                  </h3>

                  {/* Exam + Class badges */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${col.bg} ${col.text}`}
                    >
                      <FileText size={9} />
                      {routine.exam_name}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500">
                      <GraduationCap size={9} />
                      {routine.class_name}
                    </span>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-50">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                        <Calendar size={10} /> Date
                      </span>
                      <p className="font-semibold text-slate-700 text-sm">
                        {formatDate(routine.exam_date)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                        <Clock size={10} /> Time
                      </span>
                      <p className="font-semibold text-slate-700 text-sm">
                        {formatTime(routine.start_time)} – {formatTime(routine.end_time)}
                      </p>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="mt-2 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                      <BookOpen size={10} /> Instructions
                    </span>
                    <p className="text-xs text-slate-500 italic font-medium leading-relaxed">
                      Students must arrive 15 minutes before the start time. No
                      digital devices allowed in the examination hall.
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ── Notice Banner ── */}
      {routines.length > 0 && (
        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200/50">
          <h4 className="font-bold text-amber-800 flex items-center gap-2 mb-2">
            Internal Notice
          </h4>
          <p className="text-sm text-amber-700/80 leading-relaxed font-medium">
            Teachers assigned for invigilation must report to the administrative
            building 30 minutes prior to the session. Please ensure all answer
            sheets are properly coded and collected.
          </p>
        </div>
      )}
    </div>
  );
}