"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

export default function TeachersPage() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    shift: "",
    subjects: [],
    picture: null,
  });

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [error, setError] = useState("");

  const shifts = ["Morning", "Day"];
  const subjectOptions = ["Bangla", "English", "Math", "Science", "Drawing"];

  useEffect(() => {
    fetchTeachers();
  }, []);

  // ✅ FETCH TEACHERS
  const fetchTeachers = async () => {
    try {
      setTableLoading(true);
      const data = await apiRequest("/teachers");
      setTeachers(data);
    } catch (err) {
      console.error("Failed to fetch teachers:", err);
    } finally {
      setTableLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin");
    window.location.href = "/admin/login";
  };

  // ✅ HANDLE INPUT
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "picture") {
      setFormData((prev) => ({
        ...prev,
        picture: files[0] || null,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleShiftSelect = (shift) => {
    setFormData((prev) => ({
      ...prev,
      shift,
    }));
  };

  const handleSubjectToggle = (subject) => {
    setFormData((prev) => {
      const exists = prev.subjects.includes(subject);

      return {
        ...prev,
        subjects: exists
          ? prev.subjects.filter((item) => item !== subject)
          : [...prev.subjects, subject],
      };
    });
  };

  // ⚠️ SUBMIT (FormData → keep fetch)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("email", formData.email);
      submitData.append("phone", formData.phone);
      submitData.append("shift", formData.shift);
      submitData.append("subjects", formData.subjects.join(","));

      if (formData.picture) {
        submitData.append("picture", formData.picture);
      }

      const res = await fetch(`${API_BASE}/teachers`, {
        method: "POST",
        body: submitData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to add teacher");
        return;
      }

      // reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        shift: "",
        subjects: [],
        picture: null,
      });

      const fileInput = document.getElementById("teacherPicture");
      if (fileInput) fileInput.value = "";

      fetchTeachers();
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ DELETE
  const handleDelete = async (id) => {
    try {
      await apiRequest(`/teachers/${id}`, "DELETE");
      fetchTeachers();
    } catch (err) {
      alert(err.message || "Delete failed");
    }
  };

  // ✅ IMAGE URL
  const getTeacherImage = (picture) => {
    if (!picture) return "/teacher-demo.png";
    return `${API_BASE.replace("/api", "")}/teachers/${picture}`;
  };


  return (
    <main className="flex min-h-screen flex-col bg-[#e5e7eb]">
      <header className="bg-[#17172f] px-4 py-3 text-white shadow">
        <h1 className="text-[15px] font-medium">School Management System</h1>
      </header>

      <nav className="border-b border-gray-300 bg-white">
        <div className="flex items-center justify-end gap-6 px-6 py-3 text-[14px] font-semibold text-[#17172f]">
          <Link href="/admin/dashboard" className="hover:text-blue-600">
            🏠 Dashboard
          </Link>
          <Link href="/admin/students" className="hover:text-blue-600">
            🎓 Students
          </Link>
          <Link href="/admin/teachers" className="hover:text-blue-600">
            🧑‍🏫 Teachers
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="hover:text-red-600"
          >
            ↪ Logout
          </button>
        </div>
      </nav>

      <section className="flex-1 px-4 py-8">
        <div className="mx-auto w-full max-w-[455px] rounded-2xl bg-[#f3f4f6] px-5 py-5 shadow">
          <h2 className="mb-4 text-center text-[20px] font-bold text-black">
            Add Teacher
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-[14px] font-semibold text-black">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. MD.Shoisob Jahan Shaikat"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-gray-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-[14px] font-semibold text-black">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. teacher@gmail.com"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-gray-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-[14px] font-semibold text-black">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. 01XXXXXXXXX"
                 className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-gray-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[14px] font-semibold text-black">
                Shift
              </label>
              <div className="flex flex-wrap gap-2">
                {shifts.map((shift) => {
                  const active = formData.shift === shift;

                  return (
                    <button
                      key={shift}
                      type="button"
                      onClick={() => handleShiftSelect(shift)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        active
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {shift}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[14px] font-semibold text-black">
                Subject
              </label>
              <div className="flex flex-wrap gap-2">
                {subjectOptions.map((subject) => {
                  const active = formData.subjects.includes(subject);

                  return (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => handleSubjectToggle(subject)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        active
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {subject}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[14px] font-semibold text-black">
                Teacher Photo
              </label>
              <input
                id="teacherPicture"
                type="file"
                name="picture"
                accept="image/*"
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-200 file:px-4 file:py-2 file:font-semibold file:text-black hover:file:bg-gray-300"
              />
            </div>

            {error && <p className="text-sm font-medium text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-70"
            >
              {loading ? "Adding..." : "Add Teacher"}
            </button>
          </form>
        </div>

        <div className="mx-auto mt-6 w-full max-w-5xl rounded-2xl bg-[#f3f4f6] p-4 shadow">
          <h3 className="mb-4 text-[18px] font-bold text-black">All Teachers</h3>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse">
              <thead>
                <tr className="bg-blue-700 text-left text-sm font-bold text-white">
                  <th className="px-5 py-3">Teacher ID</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Shift</th>
                  <th className="px-5 py-3">Subject</th>
                  <th className="px-5 py-3">Pic</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {tableLoading ? (
                  <tr>
                    <td colSpan="8" className="px-5 py-6 text-center text-sm text-gray-500">
                      Loading teachers...
                    </td>
                  </tr>
                ) : teachers.length > 0 ? (
                  teachers.map((teacher) => (
                    <tr
                      key={teacher.teacher_id}
                      className="border-b border-gray-200 text-sm text-black"
                    >
                      <td className="px-5 py-4">{teacher.teacher_id}</td>
                      <td className="px-5 py-4">{teacher.name}</td>
                      <td className="px-5 py-4">{teacher.email}</td>
                      <td className="px-5 py-4">{teacher.phone}</td>
                      <td className="px-5 py-4">{teacher.shift || "-"}</td>
                      <td className="px-5 py-4">{teacher.subjects || "-"}</td>
                      <td className="px-5 py-4">
                        <img
                          src={getTeacherImage(teacher.picture)}
                          alt={teacher.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleDelete(teacher.teacher_id)}
                          className="font-semibold text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-5 py-6 text-center text-sm text-gray-500">
                      No teachers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <footer className="bg-[#17172f] px-4 py-6 text-center text-xs font-semibold text-white">
        © 2026 Global Knowledge School
      </footer>
    </main>
  );
}