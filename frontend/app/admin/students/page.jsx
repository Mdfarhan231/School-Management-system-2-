"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function StudentsPage() {
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
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [error, setError] = useState("");

  const shiftOptions = ["Morning", "Day"];

  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (formData.class_id) {
      fetchSubjects(formData.class_id);
    } else {
      setSubjects([]);
    }
  }, [formData.class_id]);

  const section = useMemo(() => {
    const roll = Number(formData.roll);

    if (!roll || roll < 1 || roll > 10) return "";
    if (roll >= 1 && roll <= 5) return "A";
    return "B";
  }, [formData.roll]);

  const fetchClasses = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/classes");
      const data = await res.json();
      setClasses(data);
    } catch (err) {
      console.error("Failed to fetch classes:", err);
    }
  };

  const fetchSubjects = async (classId) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/classes/${classId}/subjects`);
      const data = await res.json();
      setSubjects(data);
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
      setSubjects([]);
    }
  };

  const fetchStudents = async () => {
    try {
      setTableLoading(true);
      const res = await fetch("http://127.0.0.1:8000/api/students");
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error("Failed to fetch students:", err);
    } finally {
      setTableLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin");
    window.location.href = "/admin/login";
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "picture") {
      setFormData((prev) => ({
        ...prev,
        picture: files?.[0] || null,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClassSelect = (classId) => {
    setFormData((prev) => ({
      ...prev,
      class_id: classId,
    }));
  };

  const handleShiftSelect = (shift) => {
    setFormData((prev) => ({
      ...prev,
      shift,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const roll = Number(formData.roll);

    if (!formData.name || !formData.class_id || !formData.shift || !roll) {
      setError("Please fill the required fields.");
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

      if (formData.picture) {
        submitData.append("picture", formData.picture);
      }

      const res = await fetch("http://127.0.0.1:8000/api/students", {
        method: "POST",
        body: submitData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to add student");
        return;
      }

      setFormData({
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

      setSubjects([]);

      const fileInput = document.getElementById("studentPicture");
      if (fileInput) fileInput.value = "";

      fetchStudents();
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (studentId) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/students/${studentId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Delete failed");
        return;
      }

      fetchStudents();
    } catch (err) {
      alert("Server error while deleting");
    }
  };

  const getStudentImage = (picture) => {
    if (!picture) return "/student-demo.png";
    return `http://127.0.0.1:8000/students/${picture}`;
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
        <div className="mx-auto w-full max-w-[700px] rounded-2xl bg-[#f3f4f6] px-5 py-5 shadow">
          <h2 className="mb-5 text-center text-[22px] font-bold text-black">
            Add Student
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
                placeholder="e.g. Rahim Hasan"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-gray-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-[14px] font-semibold text-black">
                  Father Name
                </label>
                <input
                  type="text"
                  name="father_name"
                  value={formData.father_name}
                  onChange={handleChange}
                  placeholder="e.g. Karim Uddin"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-gray-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-[14px] font-semibold text-black">
                  Mother Name
                </label>
                <input
                  type="text"
                  name="mother_name"
                  value={formData.mother_name}
                  onChange={handleChange}
                  placeholder="e.g. Ayesha Begum"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-gray-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

              <div>
                <label className="mb-2 block text-[14px] font-semibold text-black">
                  Roll Number
                </label>
                <input
                  type="number"
                  name="roll"
                  min="1"
                  max="10"
                  value={formData.roll}
                  onChange={handleChange}
                  placeholder="1 to 10"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-gray-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[14px] font-semibold text-black">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Student address"
                rows={3}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-gray-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-[14px] font-semibold text-black">
                Class
              </label>
              <div className="flex flex-wrap gap-2">
                {classes.map((item) => {
                  const active = String(formData.class_id) === String(item.class_id);

                  return (
                    <button
                      key={item.class_id}
                      type="button"
                      onClick={() => handleClassSelect(item.class_id)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        active
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {item.class_name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[14px] font-semibold text-black">
                Shift
              </label>
              <div className="flex flex-wrap gap-2">
                {shiftOptions.map((shift) => {
                  const active = formData.shift === shift;

                  return (
                    <button
                      key={shift}
                      type="button"
                      onClick={() => handleShiftSelect(shift)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        active
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {shift}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-[14px] font-semibold text-black">
                  Auto Section
                </label>
                <div className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-black">
                  {section || "Enter roll number first"}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[14px] font-semibold text-black">
                  Student Photo
                </label>
                <input
                  id="studentPicture"
                  type="file"
                  name="picture"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-black outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-gray-200 file:px-4 file:py-2 file:font-semibold file:text-black hover:file:bg-gray-300"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[14px] font-semibold text-black">
                Subjects for Selected Class
              </label>
              <div className="flex min-h-[52px] flex-wrap gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3">
                {subjects.length > 0 ? (
                  subjects.map((subject) => (
                    <span
                      key={subject.subject_id}
                      className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white"
                    >
                      {subject.subject_name}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">
                    Select a class to see subjects
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-black">
              <p>
                <span className="font-bold">Section rule:</span> Roll 1-5 = A, Roll
                6-10 = B
              </p>
            </div>

            {error && <p className="text-sm font-medium text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-70"
            >
              {loading ? "Adding..." : "Add Student"}
            </button>
          </form>
        </div>

        <div className="mx-auto mt-6 w-full max-w-6xl rounded-2xl bg-[#f3f4f6] p-4 shadow">
          <h3 className="mb-4 text-[18px] font-bold text-black">All Students</h3>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] border-collapse">
              <thead>
                <tr className="bg-blue-700 text-left text-sm font-bold text-white">
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Father</th>
                  <th className="px-5 py-3">Mother</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Class</th>
                  <th className="px-5 py-3">Shift</th>
                  <th className="px-5 py-3">Roll</th>
                  <th className="px-5 py-3">Section</th>
                  <th className="px-5 py-3">Subjects</th>
                  <th className="px-5 py-3">Pic</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {tableLoading ? (
                  <tr>
                    <td colSpan="12" className="px-5 py-6 text-center text-sm text-gray-500">
                      Loading students...
                    </td>
                  </tr>
                ) : students.length > 0 ? (
                  students.map((student) => (
                    <tr
                      key={student.student_id}
                      className="border-b border-gray-200 text-sm text-black"
                    >
                      <td className="px-5 py-4">{student.student_id}</td>
                      <td className="px-5 py-4">{student.name}</td>
                      <td className="px-5 py-4">{student.father_name || "-"}</td>
                      <td className="px-5 py-4">{student.mother_name || "-"}</td>
                      <td className="px-5 py-4">{student.phone || "-"}</td>
                      <td className="px-5 py-4">{student.class_name}</td>
                      <td className="px-5 py-4">{student.shift}</td>
                      <td className="px-5 py-4">{student.roll}</td>
                      <td className="px-5 py-4">{student.section}</td>
                      <td className="px-5 py-4">
                        {Array.isArray(student.subjects) ? student.subjects.join(", ") : "-"}
                      </td>
                      <td className="px-5 py-4">
                        <img
                          src={getStudentImage(student.picture)}
                          alt={student.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleDelete(student.student_id)}
                          className="font-semibold text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="12" className="px-5 py-6 text-center text-sm text-gray-500">
                      No students added yet.
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