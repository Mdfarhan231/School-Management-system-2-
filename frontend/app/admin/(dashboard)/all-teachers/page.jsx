"use client";

import { useEffect, useState } from "react";
import { Search, Mail, Phone, Trash2, Download } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function AllTeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/teachers");
      const list = Array.isArray(data) ? data : [];
      setTeachers(list);
      if (list.length > 0) setSelected(list[0]);
    } catch (err) {
      console.error("Failed to fetch teachers:", err);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this teacher?")) return;
    try {
      await apiRequest(`/teachers/${id}`, "DELETE");
      const updated = teachers.filter((t) => t.teacher_id !== id);
      setTeachers(updated);
      setSelected(updated.length > 0 ? updated[0] : null);
    } catch (err) {
      alert(err.message || "Delete failed");
    }
  };

  const getImage = (picture) =>
    picture && picture.startsWith("http")
      ? picture
      : `https://api.dicebear.com/7.x/avataaars/svg?seed=${picture || "default"}`;

  const filtered = teachers.filter(
    (t) =>
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const headers = ["ID", "Name", "Email", "Phone", "Shift", "Subjects", "Designation", "Joining Date"];
    const rows = teachers.map((t) => [
      t.teacher_id,
      t.name,
      t.email,
      t.phone,
      t.shift || "",
      t.subjects || "",
      t.designation || "",
      t.joining_date || "",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "teachers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="flex flex-1 overflow-hidden bg-[#f1f5f9]">
      {/* ── Left Panel: List ── */}
      <div className="flex w-full flex-col overflow-hidden lg:w-[58%] xl:w-[62%]">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-4">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
          >
            <Download size={15} />
            Export CSV
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
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
                <th className="px-6 py-4">Teacher ID</th>
                <th className="px-6 py-4">Email Address</th>
                <th className="px-6 py-4">Shift</th>
                <th className="px-6 py-4">Designation</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    Loading teachers...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    No teachers found.
                  </td>
                </tr>
              ) : (
                filtered.map((teacher) => {
                  const isActive = selected?.teacher_id === teacher.teacher_id;
                  return (
                    <tr
                      key={teacher.teacher_id}
                      onClick={() => setSelected(teacher)}
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
                            src={getImage(teacher.picture)}
                            alt={teacher.name}
                            className="h-8 w-8 rounded-full object-cover flex-shrink-0 border border-slate-200"
                          />
                          <span className="font-semibold leading-tight">
                            {teacher.name}
                          </span>
                        </div>
                      </td>
                      <td className={`px-6 py-3 font-mono text-xs ${isActive ? "text-blue-100" : "text-slate-400"}`}>
                        {teacher.teacher_id}
                      </td>
                      <td className={`px-6 py-3 ${isActive ? "text-blue-100" : "text-slate-500"}`}>
                        {teacher.email}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            isActive
                              ? "bg-blue-500 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {teacher.shift || "—"}
                        </span>
                      </td>
                      <td className={`px-6 py-3 text-xs ${isActive ? "text-blue-100" : "text-slate-500"}`}>
                        {teacher.designation || "—"}
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
            {/* Teacher ID badge */}
            <div className="flex items-center justify-between px-8 pt-8">
              <span className="text-2xl font-black text-slate-800">
                #{selected.teacher_id}
              </span>
              <button
                onClick={() => handleDelete(selected.teacher_id)}
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
                  src={getImage(selected.picture)}
                  alt={selected.name}
                  className="h-28 w-28 rounded-full object-cover border-4 border-white shadow-xl"
                />
                <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{selected.name}</h2>
              <p className="mt-1 text-sm text-slate-400">
                {selected.designation || "Teacher"}
              </p>
            </div>

            {/* Contact Icons */}
            <div className="flex justify-center gap-3 px-8 pb-6">
              <a
                href={`mailto:${selected.email}`}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 shadow-sm transition hover:bg-slate-50"
              >
                <Mail size={16} />
              </a>
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
                <InfoBlock label="Email" value={selected.email} />
                <InfoBlock label="Phone" value={selected.phone} />
                <InfoBlock label="Shift" value={selected.shift || "—"} />
                <InfoBlock
                  label="Joining Date"
                  value={
                    selected.joining_date
                      ? new Date(selected.joining_date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"
                  }
                />
              </div>

              {/* Subjects */}
              {selected.subjects && (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                    Subjects
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selected.subjects.split(",").map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600"
                      >
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-slate-400 text-sm">
            Select a teacher to view details
          </div>
        )}
      </div>
    </section>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-slate-700 break-all">{value}</p>
    </div>
  );
}
