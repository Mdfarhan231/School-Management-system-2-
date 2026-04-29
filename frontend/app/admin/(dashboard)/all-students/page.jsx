"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Phone, Trash2, Plus, BookOpen } from "lucide-react";
import { apiRequest } from "@/lib/api";

function InfoBlock({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-slate-700 break-all">
        {value || "—"}
      </p>
    </div>
  );
}

function getStudentImage(picture) {
  if (!picture) return "/student-demo.png";
  return picture;
}

export default function AllStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/students");
      const list = Array.isArray(data) ? data : [];
      setStudents(list);
      if (list.length > 0) setSelected(list[0]);
    } catch (err) {
      console.error("Failed to fetch students:", err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      await apiRequest(`/students/${id}`, "DELETE");
      const updated = students.filter((s) => s.student_id !== id);
      setStudents(updated);
      setSelected(updated.length > 0 ? updated[0] : null);
    } catch (err) {
      alert(err.message || "Delete failed");
    }
  };

  const filtered = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.class_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="flex flex-1 overflow-hidden bg-[#f1f5f9]">
      {/* ── Left Panel: List ── */}
      <div className="flex w-full flex-col overflow-hidden lg:w-[58%] xl:w-[62%]">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-4">
          <Link
            href="/admin/students"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
          >
            <Plus size={15} />
            Add Student
          </Link>

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or class"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-white shadow-sm">
              <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Student ID</th>
                <th className="px-6 py-4">Class</th>
                <th className="px-6 py-4">Shift</th>
                <th className="px-6 py-4">Roll / Section</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    Loading students...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    No students found.
                  </td>
                </tr>
              ) : (
                filtered.map((student) => {
                  const isActive =
                    selected?.student_id === student.student_id;
                  return (
                    <tr
                      key={student.student_id}
                      onClick={() => setSelected(student)}
                      className={`cursor-pointer border-b border-slate-100 transition-colors ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {/* Name + Avatar */}
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={getStudentImage(student.picture)}
                            alt={student.name}
                            className="h-8 w-8 rounded-full object-cover flex-shrink-0 border border-slate-200"
                          />
                          <span className="font-semibold leading-tight">
                            {student.name}
                          </span>
                        </div>
                      </td>
                      <td
                        className={`px-6 py-3 font-mono text-xs ${
                          isActive ? "text-blue-100" : "text-slate-400"
                        }`}
                      >
                        {student.student_id}
                      </td>
                      <td
                        className={`px-6 py-3 ${
                          isActive ? "text-blue-100" : "text-slate-500"
                        }`}
                      >
                        {student.class_name}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            isActive
                              ? "bg-blue-500 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {student.shift || "—"}
                        </span>
                      </td>
                      <td
                        className={`px-6 py-3 text-xs ${
                          isActive ? "text-blue-100" : "text-slate-500"
                        }`}
                      >
                        {student.roll} / {student.section || "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Right Panel: Detail ── */}
      <div className="hidden lg:flex w-[42%] xl:w-[38%] flex-col border-l border-slate-200 bg-white overflow-y-auto">
        {selected ? (
          <>
            {/* ID + Delete */}
            <div className="flex items-center justify-between px-8 pt-8">
              <span className="text-2xl font-black text-slate-800">
                #{selected.student_id}
              </span>
              <button
                onClick={() => handleDelete(selected.student_id)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>

            {/* Avatar */}
            <div className="flex flex-col items-center px-8 pt-6 pb-4">
              <div className="relative mb-4">
                <img
                  src={getStudentImage(selected.picture)}
                  alt={selected.name}
                  className="h-28 w-28 rounded-full object-cover border-4 border-white shadow-xl"
                />
                <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {selected.name}
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                {selected.class_name || "Student"}
              </p>
            </div>

            {/* Contact icon */}
            <div className="flex justify-center gap-3 px-8 pb-6">
              <a
                href={`tel:${selected.phone}`}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 shadow-sm transition hover:bg-slate-50"
              >
                <Phone size={16} />
              </a>
            </div>

            {/* Divider */}
            <div className="mx-8 border-t border-slate-100" />

            {/* About */}
            <div className="px-8 py-6 space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                About
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <InfoBlock label="Father" value={selected.father_name} />
                <InfoBlock label="Mother" value={selected.mother_name} />
                <InfoBlock label="Phone" value={selected.phone} />
                <InfoBlock label="Shift" value={selected.shift} />
                <InfoBlock label="Roll" value={selected.roll} />
                <InfoBlock label="Section" value={selected.section} />
              </div>

              {selected.address && (
                <InfoBlock label="Address" value={selected.address} />
              )}

              {/* Subjects */}
              {Array.isArray(selected.subjects) &&
                selected.subjects.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen size={12} className="text-slate-400" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Subjects
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selected.subjects.map((s, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600"
                        >
                          {typeof s === "string" ? s.trim() : s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-slate-400 text-sm">
            Select a student to view details
          </div>
        )}
      </div>
    </section>
  );
}
