"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Upload, Calendar, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/api";

function toArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.subjects)) return payload.subjects;
  return [];
}

function normalizeSubject(item) {
  return {
    id: String(item.subject_id ?? item.id),
    subject_id: item.subject_id ?? item.id,
    name: item.subject_name ?? item.name ?? "Untitled Subject",
    code: item.subject_code ?? item.code ?? `SUB-${item.subject_id ?? item.id}`,
  };
}

export default function TeachersPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    shift: "",
    subject_ids: [],
    designation: "",
    joiningDate: "",
    picture: null,
  });

  const [subjects, setSubjects] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const [loading, setLoading] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [error, setError] = useState("");

  const shifts = ["Morning", "Day"];
  const today = new Date().toISOString().split("T")[0];

  const designations = [
    "Senior Teacher",
    "Junior Teacher",
    "Lecturer",
    "Senior Lecturer",
    "Professor",
    "Trainee",
    "Head of Dept",
  ];

  const selectedSubjectNames = useMemo(() => {
    return formData.subject_ids
      .map((id) => subjects.find((subject) => subject.id === String(id))?.name)
      .filter(Boolean);
  }, [formData.subject_ids, subjects]);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setSubjectsLoading(true);
        setError("");

        const payload = await apiRequest("/subjects");
        setSubjects(toArray(payload).map(normalizeSubject));
      } catch (err) {
        setError(err.message || "Failed to load subjects.");
      } finally {
        setSubjectsLoading(false);
      }
    };

    loadSubjects();
  }, []);

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

  const handleSubjectToggle = (subjectId) => {
    setFormData((prev) => {
      const id = String(subjectId);
      const exists = prev.subject_ids.includes(id);

      return {
        ...prev,
        subject_ids: exists
          ? prev.subject_ids.filter((item) => item !== id)
          : [...prev.subject_ids, id],
      };
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      shift: "",
      subject_ids: [],
      designation: "",
      joiningDate: "",
      picture: null,
    });

    const fileInput = document.getElementById("teacherPicture");
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.subject_ids.length === 0) {
      setError("Please select at least one interest subject.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("email", formData.email);
      submitData.append("phone", formData.phone);
      submitData.append("shift", formData.shift);
      submitData.append("designation", formData.designation);
      submitData.append("joiningDate", formData.joiningDate);

      formData.subject_ids.forEach((subjectId) => {
        submitData.append("subject_ids[]", subjectId);
      });

      submitData.append("subjects", selectedSubjectNames.join(","));

      if (formData.picture) {
        submitData.append("picture", formData.picture);
      }

      await apiRequest("/teachers", "POST", submitData);

      resetForm();
    } catch (err) {
      setError(err.message || "Failed to add teacher");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex-1 bg-[#f1f5f9] px-4 py-8">
      <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white shadow-xl overflow-hidden border border-gray-100">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-center bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Add Teacher</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
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

          <div className="space-y-2 relative">
            <label className="text-sm font-bold text-gray-900">Designation</label>
            <button
              type="button"
              onClick={() =>
                setActiveDropdown(activeDropdown === "designation" ? null : "designation")
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-200 flex items-center justify-between bg-white hover:border-gray-300 transition-colors"
            >
              <span className={formData.designation ? "text-gray-900 font-medium" : "text-gray-300"}>
                {formData.designation || "Select designation"}
              </span>
              <ChevronDown
                size={18}
                className={`text-gray-400 transition-transform ${
                  activeDropdown === "designation" ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {activeDropdown === "designation" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden py-2"
                >
                  {designations.map((designation) => (
                    <button
                      key={designation}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, designation }));
                        setActiveDropdown(null);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-600 hover:bg-green-50 hover:text-green-600 transition-colors"
                    >
                      {designation}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
              <ChevronDown
                size={18}
                className={`text-gray-400 transition-transform ${
                  activeDropdown === "shift" ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {activeDropdown === "shift" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden py-2"
                >
                  {shifts.map((shift) => (
                    <button
                      key={shift}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, shift }));
                        setActiveDropdown(null);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-600 hover:bg-green-50 hover:text-green-600 transition-colors"
                    >
                      {shift}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-2 relative">
            <label className="text-sm font-bold text-gray-900">
              Interest Subjects
            </label>

            <button
              type="button"
              onClick={() =>
                setActiveDropdown(activeDropdown === "subjects" ? null : "subjects")
              }
              disabled={subjectsLoading}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 flex items-center justify-between bg-white hover:border-gray-300 transition-colors text-left disabled:opacity-60"
            >
              <div className="flex flex-wrap gap-2 overflow-hidden">
                {selectedSubjectNames.length > 0 ? (
                  selectedSubjectNames.map((name) => (
                    <span
                      key={name}
                      className="px-2 py-0.5 bg-green-50 text-green-600 text-[11px] font-bold rounded-md uppercase tracking-wider"
                    >
                      {name}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-300">
                    {subjectsLoading ? "Loading subjects..." : "Select interest subjects"}
                  </span>
                )}
              </div>

              <ChevronDown
                size={18}
                className={`text-gray-400 transition-transform flex-shrink-0 ${
                  activeDropdown === "subjects" ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {activeDropdown === "subjects" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden p-3"
                >
                  {subjects.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {subjects.map((subject) => {
                        const selected = formData.subject_ids.includes(subject.id);

                        return (
                          <button
                            key={subject.id}
                            type="button"
                            onClick={() => handleSubjectToggle(subject.id)}
                            className={`px-4 py-2 text-left text-sm font-medium rounded-lg transition-colors ${
                              selected
                                ? "bg-green-600 text-white"
                                : "text-gray-600 hover:bg-green-50"
                            }`}
                          >
                            <span className="block">{subject.name}</span>
                            <span className="block text-[10px] opacity-70">
                              {subject.code}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs font-semibold text-amber-700">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>Create subjects first from the Manage Subjects tab.</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900">Joining Date</label>
            <div className="relative">
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                required
                min={today}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all font-medium"
              />
              <Calendar
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>

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
                {formData.picture ? formData.picture.name : "No file chosen"}
              </span>
            </div>
          </div>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading || subjects.length === 0}
            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 transition-all active:scale-[0.98] mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Adding..." : "Add Teacher"}
          </button>
        </form>
      </div>
    </section>
  );
}