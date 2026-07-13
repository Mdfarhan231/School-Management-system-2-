"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Phone, Trash2, Plus, BookOpen } from "lucide-react";
import { apiRequest } from "@/lib/api";

function toArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.students)) return payload.students;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function normalizeStudent(item) {
  const sectionName =
    item.section_name ??
    item.section ??
    item.sectionName ??
    "";

  return {
    id: String(item.student_id ?? item.id),
    student_id: item.student_id ?? item.id,

    name: item.name ?? "",
    father_name: item.father_name ?? "",
    mother_name: item.mother_name ?? "",
    phone: item.phone ?? "",
    alt_phone: item.alt_phone ?? "",
    address: item.address ?? "",

    gender: item.gender ?? "",
    dob: item.dob ?? "",
    email: item.email ?? "",

    roll: item.roll ?? "",
    picture: item.picture ?? item.photo ?? "",

    class_id: item.class_id ?? "",
    class_name: item.class_name ?? item.className ?? "",

    section_id: item.section_id ?? "",
    section: sectionName,
    section_name: sectionName,
    student_limit: item.student_limit ?? "",

    academic_session:
      item.academic_session ??
      item.session ??
      "",

    subjects: Array.isArray(item.subjects) ? item.subjects : [],
  };
}

function InfoBlock({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 break-all text-sm font-semibold text-slate-700">
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
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const payload = await apiRequest("/students");
      const list = toArray(payload).map(normalizeStudent);

      setStudents(list);
      setSelected(list.length > 0 ? list[0] : null);
    } catch (err) {
      console.error("Failed to fetch students:", err);
      setError(err.message || "Failed to fetch students.");
      setStudents([]);
      setSelected(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
      await apiRequest(`/students/${id}`, "DELETE");

      const updated = students.filter(
        (student) => String(student.student_id) !== String(id)
      );

      setStudents(updated);

      if (String(selected?.student_id) === String(id)) {
        setSelected(updated.length > 0 ? updated[0] : null);
      }
    } catch (err) {
      alert(err.message || "Delete failed");
    }
  };

  const filtered = students.filter((student) => {
    const q = search.trim().toLowerCase();

    if (!q) return true;

    return (
      student.name?.toLowerCase().includes(q) ||
      student.class_name?.toLowerCase().includes(q) ||
      student.section_name?.toLowerCase().includes(q) ||
      String(student.roll ?? "").toLowerCase().includes(q) ||
      String(student.student_id ?? "").toLowerCase().includes(q) ||
      student.phone?.toLowerCase().includes(q) ||
      student.academic_session?.toLowerCase().includes(q)
    );
  });

  return (
    <section className="flex h-[calc(100vh-80px)] min-h-0 flex-1 overflow-hidden bg-[#f1f5f9]">
      <div className="flex min-h-0 w-full flex-col overflow-hidden lg:w-[58%] xl:w-[62%]">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-4">
          <Link
            href="/admin/students"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
          >
            <Plus size={15} />
            Add Student
          </Link>

          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, class, section, roll"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
            />
          </div>
        </div>

        {error && (
          <div className="border-b border-rose-100 bg-rose-50 px-6 py-3 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        <div
          className="min-h-0 flex-1 overflow-y-auto overflow-x-auto pr-1
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar]:h-1.5
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-slate-300
            hover:[&::-webkit-scrollbar-thumb]:bg-slate-400"
        >
          <table className="w-full min-w-[620px] border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-white shadow-sm">
              <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Student ID</th>
                <th className="px-6 py-4">Class</th>
                <th className="px-6 py-4">Section</th>
                <th className="px-6 py-4">Roll / Session</th>
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
                    String(selected?.student_id) === String(student.student_id);

                  return (
                    <tr
                      key={student.id}
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
                            className="h-8 w-8 flex-shrink-0 rounded-full border border-slate-200 object-cover"
                          />
                          <span className="font-semibold leading-tight">
                            {student.name || "Unnamed Student"}
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
                        {student.class_name || "—"}
                      </td>

                      <td className="px-6 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            isActive
                              ? "bg-blue-500 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {student.section_name || "—"}
                        </span>
                      </td>

                      <td
                        className={`px-6 py-3 text-xs ${
                          isActive ? "text-blue-100" : "text-slate-500"
                        }`}
                      >
                        {student.roll || "—"} /{" "}
                        {student.academic_session || "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="hidden w-[42%] flex-col overflow-y-auto border-l border-slate-200 bg-white lg:flex xl:w-[38%]">
        {selected ? (
          <>
            <div className="flex items-center justify-between px-8 pt-8">
              <span className="text-2xl font-black text-slate-800">
                #{selected.student_id}
              </span>

              <button
                onClick={() => handleDelete(selected.student_id)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-red-500 transition-colors hover:bg-red-50"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>

            <div className="flex flex-col items-center px-8 pb-4 pt-6">
              <div className="relative mb-4">
                <img
                  src={getStudentImage(selected.picture)}
                  alt={selected.name}
                  className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-xl"
                />
                <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-400" />
              </div>

              <h2 className="text-xl font-bold text-slate-900">
                {selected.name || "Unnamed Student"}
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                {selected.class_name || "Student"}{" "}
                {selected.section_name ? `• Section ${selected.section_name}` : ""}
              </p>
            </div>

            <div className="flex justify-center gap-3 px-8 pb-6">
              <a
                href={`tel:${selected.phone || ""}`}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 shadow-sm transition hover:bg-slate-50"
              >
                <Phone size={16} />
              </a>
            </div>

            <div className="mx-8 border-t border-slate-100" />

            <div className="space-y-5 px-8 py-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                About
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <InfoBlock label="Father" value={selected.father_name} />
                <InfoBlock label="Mother" value={selected.mother_name} />
                <InfoBlock label="Phone" value={selected.phone} />
                <InfoBlock label="Alt Phone" value={selected.alt_phone} />
                <InfoBlock label="Gender" value={selected.gender} />
                <InfoBlock label="Date of Birth" value={selected.dob} />
                <InfoBlock label="Email" value={selected.email} />
                {/* <InfoBlock label="Class" value={selected.class_name} /> */}
                <InfoBlock label="Section" value={selected.section_name} />
                <InfoBlock label="Roll" value={selected.roll} />
                <InfoBlock
                  label="Session"
                  value={selected.academic_session}
                />
                {/* <InfoBlock
                  label="Section Limit"
                  value={selected.student_limit}
                /> */}
              </div>

              {selected.address && (
                <InfoBlock label="Address" value={selected.address} />
              )}

              {Array.isArray(selected.subjects) &&
                selected.subjects.length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <BookOpen size={12} className="text-slate-400" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Subjects
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {selected.subjects.map((subject, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600"
                        >
                          {typeof subject === "string"
                            ? subject.trim()
                            : subject?.subject_name || subject?.name || "Subject"}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
            Select a student to view details
          </div>
        )}
      </div>
    </section>
  );
}
