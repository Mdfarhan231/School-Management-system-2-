"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Upload, Calendar } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function TeachersPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    shift: "",
    subjects: [],
    designation: "",
    joiningDate: "",
    picture: null,
  });

  const [activeDropdown, setActiveDropdown] = useState(null);

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [error, setError] = useState("");

  const shifts = ["Morning", "Day", "Evening"];
  const subjectOptions = ["Bangla", "English", "Math", "Science", "Drawing", "Physics", "Chemistry", "Biology"];
  const designations = ["Senior Teacher", "Junior Teacher", "Lecturer", "Senior Lecturer", "Professor", "Trainee", "Head of Dept"];

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setTableLoading(true);
      const data = await apiRequest("/teachers");
      setTeachers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch teachers:", err);
      setTeachers([]);
    } finally {
      setTableLoading(false);
    }
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
      submitData.append("designation", formData.designation);
      submitData.append("joiningDate", formData.joiningDate);

      if (formData.picture) {
        submitData.append("picture", formData.picture);
      }

      await apiRequest("/teachers", "POST", submitData);

      setFormData({
        name: "",
        email: "",
        phone: "",
        shift: "",
        subjects: [],
        designation: "",
        joiningDate: "",
        picture: null,
      });

      const fileInput = document.getElementById("teacherPicture");
      if (fileInput) fileInput.value = "";

      fetchTeachers();
    } catch (err) {
      setError(err.message || "Failed to add teacher");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiRequest(`/teachers/${id}`, "DELETE");
      fetchTeachers();
    } catch (err) {
      alert(err.message || "Delete failed");
    }
  };

  const getTeacherImage = (picture) => {
    if (!picture) return "/teacher-demo.png";
    return picture;
  };

  return (
    <section className="flex-1 bg-[#e5e7eb] px-4 py-8">
      <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white shadow-xl overflow-hidden border border-gray-100">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-center bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Add Teacher</h2>
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
              placeholder="e.g. MD. Shoisob Jahan Shaikat"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all placeholder:text-gray-300"
            />
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. teacher@gmail.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all placeholder:text-gray-300"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 01XXXXXXXXX"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all placeholder:text-gray-300"
              />
            </div>
          </div>

          {/* Designation Dropdown */}
          <div className="space-y-2 relative">
            <label className="text-sm font-bold text-gray-900">Designation</label>
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'designation' ? null : 'designation')}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 flex items-center justify-between bg-white hover:border-gray-300 transition-colors"
            >
              <span className={formData.designation ? 'text-gray-900 font-medium' : 'text-gray-300'}>
                {formData.designation || 'Select designation'}
              </span>
              <ChevronDown size={18} className={`text-gray-400 transition-transform ${activeDropdown === 'designation' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {activeDropdown === 'designation' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden py-2"
                >
                  {designations.map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, designation: d });
                        setActiveDropdown(null);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-600 hover:bg-green-50 hover:text-green-600 transition-colors"
                    >
                      {d}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Shift Dropdown */}
          <div className="space-y-2 relative">
            <label className="text-sm font-bold text-gray-900">Shift</label>
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'shift' ? null : 'shift')}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 flex items-center justify-between bg-white hover:border-gray-300 transition-colors"
            >
              <span className={formData.shift ? 'text-gray-900 font-medium' : 'text-gray-300'}>
                {formData.shift || 'Select shift'}
              </span>
              <ChevronDown size={18} className={`text-gray-400 transition-transform ${activeDropdown === 'shift' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {activeDropdown === 'shift' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden py-2"
                >
                  {shifts.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        handleShiftSelect(s);
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

          {/* Subject Dropdown (multi-select) */}
          <div className="space-y-2 relative">
            <label className="text-sm font-bold text-gray-900">Subject</label>
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'subjects' ? null : 'subjects')}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 flex items-center justify-between bg-white hover:border-gray-300 transition-colors text-left"
            >
              <div className="flex flex-wrap gap-2 overflow-hidden">
                {formData.subjects.length > 0 ? (
                  formData.subjects.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-green-50 text-green-600 text-[11px] font-bold rounded-md uppercase tracking-wider">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-300">Select subjects</span>
                )}
              </div>
              <ChevronDown size={18} className={`text-gray-400 transition-transform flex-shrink-0 ${activeDropdown === 'subjects' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {activeDropdown === 'subjects' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden p-3"
                >
                  <div className="grid grid-cols-2 gap-2">
                    {subjectOptions.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleSubjectToggle(s)}
                        className={`px-4 py-2 text-left text-sm font-medium rounded-lg transition-colors ${
                          formData.subjects.includes(s)
                            ? 'bg-green-600 text-white'
                            : 'text-gray-600 hover:bg-green-50'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Joining Date */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900">Joining Date</label>
            <div className="relative">
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all font-medium"
              />
              <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Teacher Photo */}
          <div className="space-y-4">
            <label className="text-sm font-bold text-gray-900">Teacher Photo</label>
            <div className="flex items-center justify-between p-2 border border-gray-200 rounded-2xl bg-white group hover:border-green-500/50 transition-colors">
              <label className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl cursor-pointer transition-all active:scale-95">
                <Upload size={18} />
                Choose File
                <input
                  id="teacherPicture"
                  type="file"
                  name="picture"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                />
              </label>
              <span className="text-xs font-bold text-gray-400 px-4 truncate max-w-[200px]">
                {formData.picture ? formData.picture.name : 'No file chosen'}
              </span>
            </div>
          </div>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 transition-all active:scale-[0.98] mt-4 disabled:opacity-70"
          >
            {loading ? 'Adding...' : 'Add Teacher'}
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
  );
}