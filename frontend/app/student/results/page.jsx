"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { motion } from "motion/react";
import {
  Award,
  TrendingUp,
  BookOpen,
  User,
  Hash,
  Layers,
  Loader2,
  FileX2,
} from "lucide-react";

/* ── helpers ── */
function getStatusStyle(status) {
  if (!status) return "bg-gray-100 text-gray-700";
  const s = String(status).toLowerCase();
  if (s === "pass") return "bg-emerald-100 text-emerald-700";
  if (s === "fail") return "bg-red-100 text-red-700";
  return "bg-blue-100 text-blue-700";
}

/* Grade style — covers all official letter grades */
function getGradeStyle(grade) {
  if (!grade) return "bg-slate-100 text-slate-700";
  if (grade === "A+")  return "bg-emerald-100 text-emerald-700";
  if (grade === "A")   return "bg-indigo-100  text-indigo-700";
  if (grade === "A-")  return "bg-indigo-100  text-indigo-700";
  if (grade === "B+")  return "bg-sky-100     text-sky-700";
  if (grade === "B")   return "bg-sky-100     text-sky-700";
  if (grade === "B-")  return "bg-sky-100     text-sky-700";
  if (grade === "C+")  return "bg-amber-100   text-amber-700";
  if (grade === "C")   return "bg-amber-100   text-amber-700";
  if (grade === "D")   return "bg-orange-100  text-orange-700";
  if (grade === "F")   return "bg-red-100     text-red-700";
  return "bg-slate-100 text-slate-700";
}

/* NOTE: Grade & GPA computation lives entirely in
   backend/app/Services/MarkCalculationService.php.
   The frontend only renders values returned by the API. */

function getStudentImage(picture) {
  return picture || "/student-demo.png";
}

/* ── Results table sub-component ── */
function ResultsTable({ results }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-200/20 overflow-hidden"
    >
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em]">Subject</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-center">Written</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-center">MCQ</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-center">Practical</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-center">Viva</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-center">Assignment</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-center">Class Test</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-center">Total</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-center">Grade</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-center">GPA</th>
              <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {results.map((row, idx) => (
              <motion.tr
                key={row.id ?? `${row.subject_name}-${idx}`}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="group hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BookOpen size={16} />
                    </div>
                    <span className="font-bold text-slate-700">{row.subject_name || "-"}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-center font-bold text-slate-600">{row.written_marks ?? "-"}</td>
                <td className="px-4 py-4 text-center font-bold text-slate-600">{row.mcq_marks ?? "-"}</td>
                <td className="px-4 py-4 text-center font-bold text-slate-600">{row.practical_marks ?? "-"}</td>
                <td className="px-4 py-4 text-center font-bold text-slate-600">{row.viva_marks ?? "-"}</td>
                <td className="px-4 py-4 text-center font-bold text-slate-600">{row.assignment_marks ?? "-"}</td>
                <td className="px-4 py-4 text-center font-bold text-slate-600">{row.class_test_marks ?? "-"}</td>
                <td className="px-4 py-4 text-center font-black text-slate-900">{row.total_marks ?? "-"}</td>
                <td className="px-4 py-4 text-center">
                  <span className={`px-3 py-1 rounded-lg text-xs font-black ${getGradeStyle(row.grade)}`}>
                    {row.grade || "-"}
                  </span>
                </td>
                <td className="px-4 py-4 text-center font-bold text-slate-600">
                  {row.gpa != null ? Number(row.gpa).toFixed(2) : "-"}
                </td>
                <td className="px-5 py-4 text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(row.status)}`}>
                    {row.status || "-"}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function StudentResultsPage() {
  const router = useRouter();

  const [student, setStudent] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedStudent = localStorage.getItem("student");
    if (!savedStudent) { router.replace("/student/login"); return; }

    try {
      const parsed = JSON.parse(savedStudent);
      setStudent(parsed);
      if (parsed?.student_id) {
        fetchResults(parsed.student_id);
      } else {
        setResults([]);
        setLoading(false);
      }
    } catch {
      localStorage.removeItem("student");
      router.replace("/student/login");
    }
  }, [router]);

  const fetchResults = async (studentId) => {
    try {
      setLoading(true);
      const data = await apiRequest(`/student-results/${studentId}`);
      setResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch student results:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  /* Group results by exam name */
  const groupedResults = useMemo(() => {
    const groups = {};
    results.forEach((item) => {
      const examName = item.exam_name || "Unknown Exam";
      if (!groups[examName]) groups[examName] = [];
      groups[examName].push(item);
    });
    return groups;
  }, [results]);

  /* ── Loading state ── */
  if (!student) {
    return (
      <div className="flex flex-1 items-center justify-center p-10">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm font-medium text-slate-500">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12 max-w-6xl mx-auto p-6 lg:p-10">
      {/* ── Student Profile Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200/60 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 blur-[100px] -mr-32 -mt-32 rounded-full group-hover:bg-indigo-100/50 transition-colors duration-500" />

        <div className="relative flex flex-col md:flex-row items-center gap-8">
          {/* Avatar */}
          <div className="relative">
            <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-white shadow-2xl shadow-indigo-600/10">
              <img
                src={getStudentImage(student.picture)}
                className="w-full h-full object-cover"
                alt={student.name || "Student"}
              />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white border-4 border-white shadow-lg">
              <Award size={20} />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {student.name || "Student"}
              </h2>
              <p className="text-indigo-600 font-black uppercase tracking-widest text-[10px] mt-1">
                Student Results Portal
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Hash size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">ID</p>
                  <p className="font-bold text-slate-700">{student.student_id || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Layers size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Class</p>
                  <p className="font-bold text-slate-700">{student.class_name || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <BookOpen size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Roll</p>
                  <p className="font-bold text-slate-700">{student.roll || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Section</p>
                  <p className="font-bold text-slate-700">{student.section || "-"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Results Content ── */}
      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 gap-4"
        >
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading results…</p>
        </motion.div>
      ) : Object.keys(groupedResults).length > 0 ? (
        <div className="space-y-10">
          {Object.entries(groupedResults).map(([examName, examRows], groupIdx) => {
            /* Avg GPA badge — simple arithmetic only; all grade values come from
               the Laravel MarkCalculationService (backend). No grade logic here. */
            const validGpas = examRows
              .filter((r) => r.gpa != null)
              .map((r) => Number(r.gpa));
            const avgGpa = validGpas.length > 0
              ? validGpas.reduce((a, b) => a + b, 0) / validGpas.length
              : null;

            const isFirst = groupIdx === 0;
            const iconBg     = isFirst ? "bg-indigo-600" : "bg-emerald-600";
            const iconShadow = isFirst ? "shadow-indigo-600/20" : "shadow-emerald-600/20";
            const IconComponent = isFirst ? TrendingUp : Award;

            return (
              <div key={examName} className="space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl ${iconBg} text-white flex items-center justify-center shadow-lg ${iconShadow}`}>
                      <IconComponent size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
                        {examName} Result
                      </h3>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        Academic Performance
                      </p>
                    </div>
                  </div>

                  {avgGpa !== null && (
                    <div className="px-5 py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                      Avg GPA: {avgGpa.toFixed(2)}
                    </div>
                  )}
                </div>

                <ResultsTable results={examRows} />
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty state */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-slate-200/60 shadow-sm"
        >
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
            <FileX2 size={32} />
          </div>
          <h3 className="text-lg font-black text-slate-700 uppercase tracking-tight">No Results Found</h3>
          <p className="text-sm text-slate-400 mt-1">No approved results have been published yet.</p>
        </motion.div>
      )}
    </div>
  );
}