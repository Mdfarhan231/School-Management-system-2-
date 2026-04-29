"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Info,
  Filter,
  Search,
  Download,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/api";

// ─── Grade colour helper ────────────────────────────────────────────────────
function gradeColor(grade) {
  if (!grade) return "text-slate-400";
  if (grade === "A+") return "text-emerald-600";
  if (grade === "A") return "text-green-600";
  if (grade === "A-") return "text-teal-600";
  if (grade === "B") return "text-blue-600";
  if (grade === "C") return "text-amber-600";
  if (grade === "D") return "text-orange-600";
  return "text-red-600";
}

export default function MarkApprovalsPage() {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionId, setActionId] = useState(null); // id being approved/rejected
  const [approvingAll, setApprovingAll] = useState(false);

  useEffect(() => {
    fetchPendingMarks();
  }, []);

  const fetchPendingMarks = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/student-marks/pending");
      setMarks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch pending marks:", err);
      setMarks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setActionId(id);
      await apiRequest(`/student-marks/${id}/approve`, "POST");
      setMarks((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      alert(err.message || "Approval failed");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setActionId(id);
      await apiRequest(`/student-marks/${id}/reject`, "POST");
      setMarks((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      alert(err.message || "Rejection failed");
    } finally {
      setActionId(null);
    }
  };

  const handleApproveAll = async () => {
    if (!confirm(`Approve all ${marks.length} pending marks?`)) return;
    try {
      setApprovingAll(true);
      await apiRequest("/student-marks/approve-all", "POST");
      setMarks([]);
    } catch (err) {
      alert(err.message || "Approve all failed");
    } finally {
      setApprovingAll(false);
    }
  };

  const handleExport = () => {
    if (marks.length === 0) return;
    const headers = [
      "Exam", "Class", "Subject", "Teacher", "Student",
      "Roll", "Section", "Written", "MCQ", "Practical",
      "Viva", "Assignment", "Class Test", "Total", "Grade", "GPA",
    ];
    const rows = marks.map((m) => [
      m.exam_name, m.class_name, m.subject_name, m.teacher_name || "-",
      m.student_name, m.roll, m.section,
      m.written_marks, m.mcq_marks, m.practical_marks,
      m.viva_marks, m.assignment_marks, m.class_test_marks,
      m.total_marks, m.grade, m.gpa,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pending_marks.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = marks.filter(
    (m) =>
      m.student_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.teacher_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.subject_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.exam_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 p-6 space-y-6 bg-[#f1f5f9] overflow-y-auto">
      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Pending Marks Approval
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Review and authorize academic records submitted by teachers.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-200 transition-colors"
          >
            <Download size={16} />
            Export CSV
          </button>
          <button
            onClick={handleApproveAll}
            disabled={approvingAll || marks.length === 0}
            className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-60"
          >
            <CheckCircle2 size={16} />
            {approvingAll ? "Approving…" : "Approve All"}
          </button>
        </div>
      </header>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
            Total Pending
          </p>
          <h3 className="text-3xl font-black text-slate-900">
            {loading ? "—" : marks.length}
          </h3>
          <p className="text-xs text-amber-500 font-bold mt-2 flex items-center gap-1">
            <Info size={12} />
            Requires immediate attention
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
            Review Accuracy
          </p>
          <h3 className="text-3xl font-black text-slate-900">99.2%</h3>
          <p className="text-xs text-emerald-500 font-bold mt-2">
            Historical data correlation
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
            Avg. Response Time
          </p>
          <h3 className="text-3xl font-black text-slate-900">4.2h</h3>
          <p className="text-xs text-indigo-500 font-bold mt-2">
            Submission to publication
          </p>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
        {/* Table toolbar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <h4 className="font-bold text-sm">Teacher Submitted Marks</h4>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                size={14}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student, teacher, exam…"
                className="bg-slate-800 border-none rounded-lg py-1.5 pl-9 pr-4 text-xs focus:ring-1 focus:ring-indigo-400 w-52 outline-none text-white placeholder:text-slate-500"
              />
            </div>
            <button className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors">
              <Filter size={16} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1300px]">
            <thead>
              <tr className="bg-indigo-600 text-white text-[10px] uppercase font-black tracking-widest">
                <th className="px-6 py-4">Exam</th>
                <th className="px-4 py-4">Class</th>
                <th className="px-4 py-4">Subject</th>
                <th className="px-6 py-4">Teacher</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-4 py-4 text-center">Roll</th>
                <th className="px-4 py-4 text-center">Section</th>
                <th className="px-3 py-4 text-center bg-indigo-700/30">
                  Written
                </th>
                <th className="px-3 py-4 text-center bg-indigo-700/30">MCQ</th>
                <th className="px-3 py-4 text-center bg-indigo-700/30">
                  Prac.
                </th>
                <th className="px-3 py-4 text-center bg-indigo-700/30">
                  Viva
                </th>
                <th className="px-3 py-4 text-center bg-indigo-700/30">
                  Assign.
                </th>
                <th className="px-3 py-4 text-center bg-indigo-700/30">
                  C.Test
                </th>
                <th className="px-3 py-4 text-center bg-indigo-700/30 font-black">
                  Total
                </th>
                <th className="px-3 py-4 text-center">Grade</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="16"
                    className="px-6 py-12 text-center text-slate-400 text-sm"
                  >
                    Loading pending marks…
                  </td>
                </tr>
              ) : filtered.length === 0 && !loading ? null : (
                filtered.map((item) => (
                  <motion.tr
                    layout
                    key={item.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <span className="font-bold text-slate-900 text-sm">
                        {item.exam_name}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-sm font-medium text-slate-600">
                      {item.class_name}
                    </td>
                    <td className="px-4 py-5 font-bold text-slate-800 text-sm whitespace-nowrap">
                      {item.subject_name}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-xs leading-tight">
                          {item.teacher_name || "—"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                          Teacher
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-indigo-600">
                      {item.student_name}
                    </td>
                    <td className="px-4 py-5 text-center font-mono font-bold text-slate-400">
                      {item.roll}
                    </td>
                    <td className="px-4 py-5 text-center font-bold text-slate-600">
                      {item.section}
                    </td>
                    <td className="px-3 py-5 text-center font-bold text-slate-800">
                      {item.written_marks ?? 0}
                    </td>
                    <td className="px-3 py-5 text-center font-bold text-slate-800">
                      {item.mcq_marks ?? 0}
                    </td>
                    <td className="px-3 py-5 text-center font-bold text-slate-800">
                      {item.practical_marks ?? 0}
                    </td>
                    <td className="px-3 py-5 text-center font-bold text-slate-800">
                      {item.viva_marks ?? 0}
                    </td>
                    <td className="px-3 py-5 text-center font-bold text-slate-800">
                      {item.assignment_marks ?? 0}
                    </td>
                    <td className="px-3 py-5 text-center font-bold text-slate-800">
                      {item.class_test_marks ?? 0}
                    </td>
                    <td className="px-3 py-5 text-center text-indigo-700 font-black text-base">
                      {item.total_marks}
                    </td>
                    <td
                      className={`px-3 py-5 text-center font-black text-sm ${gradeColor(item.grade)}`}
                    >
                      {item.grade}
                    </td>
                    <td className="px-6 py-5 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleApprove(item.id)}
                          disabled={actionId === item.id}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-emerald-500 hover:text-white transition-all shadow-sm disabled:opacity-50"
                        >
                          {actionId === item.id ? "…" : "Approve"}
                        </button>
                        <button
                          onClick={() => handleReject(item.id)}
                          disabled={actionId === item.id}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-50"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        <AnimatePresence>
          {!loading && filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="p-20 text-center flex flex-col items-center justify-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h5 className="text-xl font-bold text-slate-900">
                  {search ? "No results found" : "All Marks Approved"}
                </h5>
                <p className="text-slate-500 mt-1">
                  {search
                    ? "Try a different search term."
                    : "There are no pending submissions at this time."}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}