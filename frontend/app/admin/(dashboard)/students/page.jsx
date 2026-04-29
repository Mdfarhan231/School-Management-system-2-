"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Upload, Search, Trash2, Phone, User, BookOpen, Plus } from "lucide-react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

// ─── Helper ────────────────────────────────────────────────────────────────
function InfoBlock({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-700 break-all">{value || "—"}</p>
    </div>
  );
}

function getStudentImage(picture) {
  if (!picture) return "/student-demo.png";
  return picture;
}

// ─── Add Student Form ───────────────────────────────────────────────────────
function AddStudentForm({ onSuccess }) {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  const [formData, setFormData] = useState({
    name: "",
    father_name: "",
    mother_name: "",
    phone: "",
    address: "",
    class_id: "",
    shift: "",
    roll: "",
    picture: null,
  });

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);

  const shiftOptions = ["Morning", "Day"];

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (formData.class_id) fetchSubjects(formData.class_id);
    else setSubjects([]);
  }, [formData.class_id]);

  const section = useMemo(() => {
    const roll = Number(formData.roll);
    if (!roll || roll < 1 || roll > 10) return "";
    return roll >= 1 && roll <= 5 ? "A" : "B";
  }, [formData.roll]);

  const fetchClasses = async () => {
    try {
      const data = await apiRequest("/classes");
      setClasses(data);
    } catch (err) {
      console.error("Failed to fetch classes:", err);
    }
  };

  const fetchSubjects = async (classId) => {
    try {
      const data = await apiRequest(`/classes/${classId}/subjects`);
      setSubjects(data);
    } catch (err) {
      setSubjects([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "picture") {
      setFormData((prev) => ({ ...prev, picture: files?.[0] || null }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const roll = Number(formData.roll);
    if (!formData.name || !formData.class_id || !formData.shift || !roll) {
      setError("Please fill all required fields.");
      return;
    }
    if (roll < 1 || roll > 10) {
      setError("Roll number must be between 1 and 10.");
      return;
    }
    try {
      setLoading(true);
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("father_name", formData.father_name);
      submitData.append("mother_name", formData.mother_name);
      submitData.append("phone", formData.phone);
      submitData.append("address", formData.address);
      submitData.append("class_id", formData.class_id);
      submitData.append("shift", formData.shift);
      submitData.append("roll", formData.roll);
      if (formData.picture) submitData.append("picture", formData.picture);

      const res = await fetch(`${API_BASE}/students`, { method: "POST", body: submitData });
      const data = await res.json();
      if (!res.ok) { setError(data.message || data.error || "Failed to add student"); return; }

      setFormData({ name: "", father_name: "", mother_name: "", phone: "", address: "", class_id: "", shift: "", roll: "", picture: null });
      setSubjects([]);
      const fileInput = document.getElementById("studentPicture");
      if (fileInput) fileInput.value = "";
      onSuccess?.();
    } catch (err) {
      setError(err.message || "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectedClass = classes.find((c) => String(c.class_id) === String(formData.class_id));

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white shadow-xl overflow-hidden border border-gray-100">
      <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-center bg-white">
        <h2 className="text-2xl font-bold text-gray-900">Add Student</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {/* Full Name */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-900">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Rahim Hasan"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all placeholder:text-gray-300"
          />
        </div>

        {/* Father & Mother */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900">Father Name</label>
            <input
              type="text"
              name="father_name"
              value={formData.father_name}
              onChange={handleChange}
              placeholder="e.g. Karim Uddin"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all placeholder:text-gray-300"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900">Mother Name</label>
            <input
              type="text"
              name="mother_name"
              value={formData.mother_name}
              onChange={handleChange}
              placeholder="e.g. Ayesha Begum"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* Phone & Roll */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. 01XXXXXXXXX"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all placeholder:text-gray-300"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900">Roll Number</label>
            <input
              type="number"
              name="roll"
              min="1"
              max="10"
              value={formData.roll}
              onChange={handleChange}
              placeholder="1 to 10"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* Class Dropdown */}
        <div className="space-y-2 relative">
          <label className="text-sm font-bold text-gray-900">Class</label>
          <button
            type="button"
            onClick={() => setActiveDropdown(activeDropdown === "class" ? null : "class")}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 flex items-center justify-between bg-white hover:border-gray-300 transition-colors"
          >
            <span className={selectedClass ? "text-gray-900 font-medium" : "text-gray-300"}>
              {selectedClass ? selectedClass.class_name : "Select class"}
            </span>
            <ChevronDown size={18} className={`text-gray-400 transition-transform ${activeDropdown === "class" ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {activeDropdown === "class" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden p-3"
              >
                <div className="grid grid-cols-3 gap-2">
                  {classes.map((item) => (
                    <button
                      key={item.class_id}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, class_id: item.class_id }));
                        setActiveDropdown(null);
                      }}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        String(formData.class_id) === String(item.class_id)
                          ? "bg-green-600 text-white"
                          : "text-gray-600 hover:bg-green-50"
                      }`}
                    >
                      {item.class_name}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Shift Dropdown */}
        <div className="space-y-2 relative">
          <label className="text-sm font-bold text-gray-900">Shift</label>
          <button
            type="button"
            onClick={() => setActiveDropdown(activeDropdown === "shift" ? null : "shift")}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 flex items-center justify-between bg-white hover:border-gray-300 transition-colors"
          >
            <span className={formData.shift ? "text-gray-900 font-medium" : "text-gray-300"}>
              {formData.shift || "Select shift"}
            </span>
            <ChevronDown size={18} className={`text-gray-400 transition-transform ${activeDropdown === "shift" ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {activeDropdown === "shift" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden py-2"
              >
                {shiftOptions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, shift: s }));
                      setActiveDropdown(null);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-600 hover:bg-green-50 hover:text-green-600 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Auto Section & Subjects */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900">Auto Section</label>
            <div className="px-4 py-3 rounded-xl border border-gray-200 bg-slate-50 text-sm font-semibold text-slate-600">
              {section || <span className="text-gray-300 font-normal">Enter roll first</span>}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900">Subjects</label>
            <div className="px-4 py-3 rounded-xl border border-gray-200 bg-slate-50 min-h-[48px] flex flex-wrap gap-1.5">
              {subjects.length > 0 ? (
                subjects.map((sub) => (
                  <span key={sub.subject_id} className="px-2 py-0.5 bg-green-50 text-green-600 text-[11px] font-bold rounded-md uppercase tracking-wider">
                    {sub.subject_name}
                  </span>
                ))
              ) : (
                <span className="text-gray-300 text-sm">Select a class first</span>
              )}
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-900">Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Student address"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all placeholder:text-gray-300 resize-none"
          />
        </div>

        {/* Photo */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-900">Student Photo</label>
          <div className="flex items-center justify-between p-2 border border-gray-200 rounded-2xl bg-white group hover:border-green-500/50 transition-colors">
            <label className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl cursor-pointer transition-all active:scale-95">
              <Upload size={18} />
              Choose File
              <input id="studentPicture" type="file" name="picture" accept="image/*" onChange={handleChange} className="hidden" />
            </label>
            <span className="text-xs font-bold text-gray-400 px-4 truncate max-w-[200px]">
              {formData.picture ? formData.picture.name : "No file chosen"}
            </span>
          </div>
        </div>

        {/* Section rule info */}
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <span className="font-bold">Section rule:</span> Roll 1–5 = Section A &nbsp;|&nbsp; Roll 6–10 = Section B
        </div>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 transition-all active:scale-[0.98] mt-4 disabled:opacity-70"
        >
          {loading ? "Adding..." : "Add Student"}
        </button>
      </form>
    </div>
  );
}

// ─── All Students Panel ─────────────────────────────────────────────────────
function AllStudentsPanel({ refreshKey }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, [refreshKey]);

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
      {/* Left Panel */}
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
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">Loading students...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">No students found.</td>
                </tr>
              ) : (
                filtered.map((student) => {
                  const isActive = selected?.student_id === student.student_id;
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
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={getStudentImage(student.picture)}
                            alt={student.name}
                            className="h-8 w-8 rounded-full object-cover flex-shrink-0 border border-slate-200"
                          />
                          <span className="font-semibold leading-tight">{student.name}</span>
                        </div>
                      </td>
                      <td className={`px-6 py-3 font-mono text-xs ${isActive ? "text-blue-100" : "text-slate-400"}`}>
                        {student.student_id}
                      </td>
                      <td className={`px-6 py-3 ${isActive ? "text-blue-100" : "text-slate-500"}`}>
                        {student.class_name}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          isActive ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-600"
                        }`}>
                          {student.shift || "—"}
                        </span>
                      </td>
                      <td className={`px-6 py-3 text-xs ${isActive ? "text-blue-100" : "text-slate-500"}`}>
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

      {/* Right Panel – Detail */}
      <div className="hidden lg:flex w-[42%] xl:w-[38%] flex-col border-l border-slate-200 bg-white overflow-y-auto">
        {selected ? (
          <>
            {/* ID + Delete */}
            <div className="flex items-center justify-between px-8 pt-8">
              <span className="text-2xl font-black text-slate-800">#{selected.student_id}</span>
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
              <h2 className="text-xl font-bold text-slate-900">{selected.name}</h2>
              <p className="mt-1 text-sm text-slate-400">{selected.class_name || "Student"}</p>
            </div>

            {/* Contact icons */}
            <div className="flex justify-center gap-3 px-8 pb-6">
              <a
                href={`tel:${selected.phone}`}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 shadow-sm transition hover:bg-slate-50"
              >
                <Phone size={16} />
              </a>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 shadow-sm">
                <User size={16} />
              </div>
            </div>

            <div className="mx-8 border-t border-slate-100" />

            {/* About */}
            <div className="px-8 py-6 space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">About</h3>
              <div className="grid grid-cols-2 gap-4">
                <InfoBlock label="Father" value={selected.father_name} />
                <InfoBlock label="Mother" value={selected.mother_name} />
                <InfoBlock label="Phone" value={selected.phone} />
                <InfoBlock label="Shift" value={selected.shift} />
                <InfoBlock label="Roll" value={selected.roll} />
                <InfoBlock label="Section" value={selected.section} />
                <InfoBlock label="Address" value={selected.address} />
              </div>

              {/* Subjects */}
              {Array.isArray(selected.subjects) && selected.subjects.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen size={12} className="text-slate-400" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Subjects</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selected.subjects.map((s) => (
                      <span key={s} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
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

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function StudentsPage() {
  const [tab, setTab] = useState("add");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleStudentAdded = () => {
    setRefreshKey((k) => k + 1);
    setTab("all");
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-slate-200 bg-white px-6 pt-4">
        <button
          onClick={() => setTab("add")}
          className={`px-5 py-2.5 text-sm font-bold rounded-t-lg transition-colors ${
            tab === "add"
              ? "bg-green-600 text-white"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
          }`}
        >
          Add Student
        </button>
        <button
          onClick={() => setTab("all")}
          className={`px-5 py-2.5 text-sm font-bold rounded-t-lg transition-colors ${
            tab === "all"
              ? "bg-blue-600 text-white"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
          }`}
        >
          All Students
        </button>
      </div>

      {/* Content */}
      {tab === "add" ? (
        <section className="flex-1 bg-[#e5e7eb] px-4 py-8 overflow-y-auto">
          <AddStudentForm onSuccess={handleStudentAdded} />
        </section>
      ) : (
        <AllStudentsPanel refreshKey={refreshKey} />
      )}
    </div>
  );
}