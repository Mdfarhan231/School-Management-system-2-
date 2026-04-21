"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

export default function ExamRoutinePage() {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const [routines, setRoutines] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    exam_id: "",
    class_id: "",
    subject_id: "",
    exam_date: "",
    start_time: "",
    end_time: "",
  });

  useEffect(() => {
    fetchRoutines();
    fetchClasses();
    fetchSubjects();
    fetchExams();
  }, []);

  const fetchRoutines = async () => {
    try {
      const data = await apiRequest("/exam-routines");
      setRoutines(data);
    } catch (error) {
      console.error("Failed to fetch routines:", error);
    }
  };

  const fetchClasses = async () => {
    try {
      const data = await apiRequest("/classes");
      setClasses(data);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const data = await apiRequest("/subjects");
      setSubjects(data);
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
    }
  };

  const fetchExams = async () => {
    try {
      const data = await apiRequest("/exams");
      setExams(data);
    } catch (error) {
      console.error("Failed to fetch exams:", error);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiRequest("/exam-routines", "POST", form);

      setForm({
        exam_id: "",
        class_id: "",
        subject_id: "",
        exam_date: "",
        start_time: "",
        end_time: "",
      });

      fetchRoutines();
    } catch (error) {
      alert(error.message || "Failed to add routine");
    } finally {
      setLoading(false);
    }
  };

  const deleteRoutine = async (id) => {
    try {
      await apiRequest(`/exam-routines/${id}`, "DELETE");
      fetchRoutines();
    } catch (error) {
      alert(error.message || "Delete failed");
    }
  };

  return (
    <section className="flex-1 bg-[#e5e7eb] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-6 text-[28px] font-bold text-black">
          Exam Routine Management
        </h2>

        <div className="rounded-[24px] bg-[#e5e7eb] p-6 shadow-[-8px_-8px_16px_rgba(255,255,255,0.85),8px_8px_18px_rgba(163,177,198,0.45)]">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <select
              name="exam_id"
              value={form.exam_id}
              onChange={handleChange}
              className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none focus:border-blue-500"
              required
            >
              <option value="">Select Exam</option>
              {exams.map((exam) => (
                <option key={exam.exam_id} value={exam.exam_id}>
                  {exam.exam_name}
                </option>
              ))}
            </select>

            <select
              name="class_id"
              value={form.class_id}
              onChange={handleChange}
              className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none focus:border-blue-500"
              required
            >
              <option value="">Select Class</option>
              {classes.map((item) => (
                <option key={item.class_id} value={item.class_id}>
                  {item.class_name}
                </option>
              ))}
            </select>

            <select
              name="subject_id"
              value={form.subject_id}
              onChange={handleChange}
              className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none focus:border-blue-500"
              required
            >
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
                <option key={subject.subject_id} value={subject.subject_id}>
                  {subject.subject_name}
                </option>
              ))}
            </select>

            <input
              type="date"
              name="exam_date"
              value={form.exam_date}
              onChange={handleChange}
              min={today}
              className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none focus:border-blue-500"
              required
            />

            <input
              type="time"
              name="start_time"
              value={form.start_time}
              onChange={handleChange}
              className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none focus:border-blue-500"
              required
            />

            <input
              type="time"
              name="end_time"
              value={form.end_time}
              onChange={handleChange}
              className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none focus:border-blue-500"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="md:col-span-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-70"
            >
              {loading ? "Adding..." : "Add Routine"}
            </button>
          </form>
        </div>

        <div className="mt-8 rounded-[24px] bg-[#e5e7eb] p-5 shadow-[-8px_-8px_16px_rgba(255,255,255,0.85),8px_8px_18px_rgba(163,177,198,0.45)]">
          <h3 className="mb-4 text-[20px] font-bold text-black">
            All Exam Routines
          </h3>

          <div className="overflow-x-auto rounded-xl">
            <table className="w-full min-w-[900px] border-collapse overflow-hidden rounded-xl">
              <thead>
                <tr className="bg-blue-700 text-left text-sm font-bold text-white">
                  <th className="px-5 py-3">Exam</th>
                  <th className="px-5 py-3">Class</th>
                  <th className="px-5 py-3">Subject</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Time</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {routines.length > 0 ? (
                  routines.map((routine) => (
                    <tr
                      key={routine.id}
                      className="border-b border-gray-200 bg-white text-sm text-black"
                    >
                      <td className="px-5 py-4">{routine.exam_name}</td>
                      <td className="px-5 py-4">{routine.class_name}</td>
                      <td className="px-5 py-4">{routine.subject_name}</td>
                      <td className="px-5 py-4">{routine.exam_date}</td>
                      <td className="px-5 py-4">
                        {routine.start_time} - {routine.end_time}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => deleteRoutine(routine.id)}
                          className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="bg-white">
                    <td
                      colSpan="6"
                      className="px-5 py-6 text-center text-sm text-gray-500"
                    >
                      No exam routine found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}