"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Upload } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function StudentsPage() {
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
    } catch {
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

      const res = await fetch(`${API_BASE}/students`, {
        method: "POST",
        body: submitData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || data.error || "Failed to add student");
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
    } catch (err) {
      setError(err.message || "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectedClass = classes.find(
    (c) => String(c.class_id) === String(formData.class_id)
  );

  return (
    <section className="flex-1 bg-[#f1f5f9] px-4 py-8 overflow-y-auto">
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
              onClick={() =>
                setActiveDropdown(activeDropdown === "class" ? null : "class")
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-200 flex items-center justify-between bg-white hover:border-gray-300 transition-colors"
            >
              <span
                className={
                  selectedClass ? "text-gray-900 font-medium" : "text-gray-300"
                }
              >
                {selectedClass ? selectedClass.class_name : "Select class"}
              </span>
              <ChevronDown
                size={18}
                className={`text-gray-400 transition-transform ${
                  activeDropdown === "class" ? "rotate-180" : ""
                }`}
              />
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
                          setFormData((prev) => ({
                            ...prev,
                            class_id: item.class_id,
                          }));
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
              onClick={() =>
                setActiveDropdown(activeDropdown === "shift" ? null : "shift")
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-200 flex items-center justify-between bg-white hover:border-gray-300 transition-colors"
            >
              <span
                className={
                  formData.shift ? "text-gray-900 font-medium" : "text-gray-300"
                }
              >
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
              <label className="text-sm font-bold text-gray-900">
                Auto Section
              </label>
              <div className="px-4 py-3 rounded-xl border border-gray-200 bg-slate-50 text-sm font-semibold text-slate-700 min-h-[48px] flex items-center">
                {section || (
                  <span className="text-gray-300 font-normal">
                    Enter roll first
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">Subjects</label>
              <div className="px-4 py-3 rounded-xl border border-gray-200 bg-slate-50 min-h-[48px] flex flex-wrap gap-1.5 items-center">
                {subjects.length > 0 ? (
                  subjects.map((sub) => (
                    <span
                      key={sub.subject_id}
                      className="px-2 py-0.5 bg-green-50 text-green-600 text-[11px] font-bold rounded-md uppercase tracking-wider"
                    >
                      {sub.subject_name}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-300 text-sm">
                    Select a class first
                  </span>
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

          {/* Photo Upload */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900">
              Student Photo
            </label>
            <div className="flex items-center justify-between p-2 border border-gray-200 rounded-2xl bg-white group hover:border-green-500/50 transition-colors">
              <label className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl cursor-pointer transition-all active:scale-95">
                <Upload size={18} />
                Choose File
                <input
                  id="studentPicture"
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

          {/* Section rule info */}
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <span className="font-bold">Section rule:</span> Roll 1–5 = Section
            A &nbsp;|&nbsp; Roll 6–10 = Section B
          </div>

          {error && (
            <p className="text-sm font-medium text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 transition-all active:scale-[0.98] mt-4 disabled:opacity-70"
          >
            {loading ? "Adding..." : "Add Student"}
          </button>
        </form>
      </div>
    </section>
  );
}