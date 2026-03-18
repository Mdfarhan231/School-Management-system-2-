"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

export default function TeacherMarksEntryPage() {
  const router = useRouter();

  const [teacher, setTeacher] = useState(null);
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [savedMarks, setSavedMarks] = useState([]);
  const [marksMap, setMarksMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState({
    exam_id: "",
    class_id: "",
    subject_id: "",
  });

  useEffect(() => {
    const savedTeacher = localStorage.getItem("teacher");

    if (!savedTeacher) {
      router.replace("/teacher/login");
      return;
    }

    const parsedTeacher = JSON.parse(savedTeacher);
    setTeacher(parsedTeacher);

    fetchExams();
    fetchClasses();
    fetchSubjects(parsedTeacher.subjects || "");
  }, [router]);

  useEffect(() => {
    if (filter.class_id) {
      fetchStudents(filter.class_id);
    } else {
      setStudents([]);
      setMarksMap({});
    }
  }, [filter.class_id]);

  useEffect(() => {
    if (filter.exam_id && filter.class_id && filter.subject_id) {
      fetchSavedMarks();
    } else {
      setSavedMarks([]);
      setMarksMap({});
    }
  }, [filter.exam_id, filter.class_id, filter.subject_id]);

  const teacherSubjectList = useMemo(() => {
    if (!teacher?.subjects) return [];
    return teacher.subjects.split(",").map((item) => item.trim().toLowerCase());
  }, [teacher]);

  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) =>
      teacherSubjectList.includes(subject.subject_name.toLowerCase())
    );
  }, [subjects, teacherSubjectList]);

  const handleLogout = () => {
    localStorage.removeItem("teacher");
    router.replace("/teacher/login");
  };

  const fetchExams = async () => {
    try {
      const data = await apiRequest("/exams");
      setExams(data);
    } catch (err) {
      console.error("Failed to fetch exams:", err);
      setExams([]);
    }
  };

  const fetchClasses = async () => {
    try {
      const data = await apiRequest("/classes");
      setClasses(data);
    } catch (err) {
      console.error("Failed to fetch classes:", err);
      setClasses([]);
    }
  };

  const fetchSubjects = async () => {
    try {
      const data = await apiRequest("/subjects");
      setSubjects(data);
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
      setSubjects([]);
    }
  };

  const fetchStudents = async (classId) => {
    try {
      setTableLoading(true);
      const data = await apiRequest(`/students/by-class/${classId}`);
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch students:", err);
      setStudents([]);
    } finally {
      setTableLoading(false);
    }
  };

  const fetchSavedMarks = async () => {
    try {
      const data = await apiRequest("/student-marks/filter", "POST", filter);
      setSavedMarks(Array.isArray(data) ? data : []);

      const nextMap = {};
      (Array.isArray(data) ? data : []).forEach((item) => {
        nextMap[item.student_id] = {
          written_marks: item.written_marks ?? "",
          mcq_marks: item.mcq_marks ?? "",
          practical_marks: item.practical_marks ?? "",
          assignment_marks: item.assignment_marks ?? "",
          viva_marks: item.viva_marks ?? "",
        };
      });
      setMarksMap(nextMap);
    } catch (err) {
      console.error("Failed to fetch saved marks:", err);
      setSavedMarks([]);
      setMarksMap({});
    }
  };

  const handleFilterChange = (e) => {
    setFilter((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
  };

  const handleMarkChange = (studentId, field, value) => {
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {
          written_marks: "",
          mcq_marks: "",
          practical_marks: "",
          assignment_marks: "",
          viva_marks: "",
        }),
        [field]: value,
      },
    }));
  };

  const handleSaveOne = async (studentId) => {
    if (!filter.exam_id || !filter.class_id || !filter.subject_id) {
      setError("Please select exam, class and subject first.");
      return;
    }

    const row = marksMap[studentId] || {};

    try {
      setLoading(true);
      setError("");

      const payload = {
        exam_id: filter.exam_id,
        class_id: filter.class_id,
        subject_id: filter.subject_id,
        student_id: studentId,
        written_marks: row.written_marks || 0,
        mcq_marks: row.mcq_marks || 0,
        practical_marks: row.practical_marks || 0,
        assignment_marks: row.assignment_marks || 0,
        viva_marks: row.viva_marks || 0,
      };

      await apiRequest("/student-marks", "POST", payload);

      fetchSavedMarks();
      alert("Marks saved successfully.");
    } catch (err) {
      setError(err.message || "Failed to save marks");
    } finally {
      setLoading(false);
    }
  };

  if (!teacher) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#e5e7eb]">
        <p className="text-black">Loading...</p>
      </main>
    );
  }


  return (
    <main className="flex min-h-screen flex-col bg-[#e5e7eb]">
      <header className="bg-[#17172f] px-4 py-3 text-white shadow">
        <h1 className="text-[15px] font-medium sm:text-xl">
          School Management System
        </h1>
      </header>

      <nav className="border-b border-gray-300 bg-white">
        <div className="flex items-center justify-end gap-6 px-6 py-3 text-[14px] font-semibold text-[#17172f]">
          <Link href="/teacher/dashboard" className="hover:text-blue-600">
            🏠 Dashboard
          </Link>

          <Link href="/teacher/exam-routine" className="hover:text-blue-600">
            📝 Exam Routine
          </Link>

          <Link href="/teacher/marks-entry" className="hover:text-blue-600">
            📊 Marks Entry
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
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-6 text-[28px] font-bold text-black">
            Teacher Marks Entry
          </h2>

          <div className="rounded-[24px] bg-[#e5e7eb] p-6 shadow-[-8px_-8px_16px_rgba(255,255,255,0.85),8px_8px_18px_rgba(163,177,198,0.45)]">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <select
                name="exam_id"
                value={filter.exam_id}
                onChange={handleFilterChange}
                className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none focus:border-blue-500"
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
                value={filter.class_id}
                onChange={handleFilterChange}
                className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none focus:border-blue-500"
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
                value={filter.subject_id}
                onChange={handleFilterChange}
                className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none focus:border-blue-500"
              >
                <option value="">Select Subject</option>
                {filteredSubjects.map((subject) => (
                  <option key={subject.subject_id} value={subject.subject_id}>
                    {subject.subject_name}
                  </option>
                ))}
              </select>
            </div>

            <p className="mt-4 text-sm text-gray-700">
              You can enter marks only for your assigned subjects:{" "}
              <span className="font-semibold">{teacher.subjects || "-"}</span>
            </p>

            {error && (
              <p className="mt-3 text-sm font-medium text-red-600">{error}</p>
            )}
          </div>

          <div className="mt-8 rounded-[24px] bg-[#e5e7eb] p-5 shadow-[-8px_-8px_16px_rgba(255,255,255,0.85),8px_8px_18px_rgba(163,177,198,0.45)]">
            <h3 className="mb-4 text-[20px] font-bold text-black">
              Students Marks Table
            </h3>

            <div className="overflow-x-auto rounded-xl">
              <table className="w-full min-w-[1400px] border-collapse overflow-hidden rounded-xl">
                <thead>
                  <tr className="bg-blue-700 text-left text-sm font-bold text-white">
                    <th className="px-5 py-3">Student ID</th>
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Roll</th>
                    <th className="px-5 py-3">Section</th>
                    <th className="px-5 py-3">Shift</th>
                    <th className="px-5 py-3">Written</th>
                    <th className="px-5 py-3">MCQ</th>
                    <th className="px-5 py-3">Practical</th>
                    <th className="px-5 py-3">Assignment</th>
                    <th className="px-5 py-3">Viva</th>
                    <th className="px-5 py-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {tableLoading ? (
                    <tr className="bg-white">
                      <td
                        colSpan="11"
                        className="px-5 py-6 text-center text-sm text-gray-500"
                      >
                        Loading students...
                      </td>
                    </tr>
                  ) : students.length > 0 ? (
                    students.map((student) => {
                      const row = marksMap[student.student_id] || {
                        written_marks: "",
                        mcq_marks: "",
                        practical_marks: "",
                        assignment_marks: "",
                        viva_marks: "",
                      };

                      return (
                        <tr
                          key={student.student_id}
                          className="border-b border-gray-200 bg-white text-sm text-black"
                        >
                          <td className="px-5 py-4">{student.student_id}</td>
                          <td className="px-5 py-4">{student.name}</td>
                          <td className="px-5 py-4">{student.roll}</td>
                          <td className="px-5 py-4">{student.section}</td>
                          <td className="px-5 py-4">{student.shift}</td>

                          <td className="px-3 py-4">
                            <input placeholder="Max 70"
                              type="number"
                              min="0"
                              max="70"

                              value={row.written_marks}
                              onChange={(e) =>
                                handleMarkChange(
                                  student.student_id,
                                  "written_marks",
                                  e.target.value
                                )
                              }
                              className=" w-24 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-blue-500"
                            />
                          </td>

                          <td className="px-3 py-4">
                            <input placeholder="Max 10"
                              type="number"
                              min="0"
                              max="10"
                              value={row.mcq_marks}
                              onChange={(e) =>
                                handleMarkChange(
                                  student.student_id,
                                  "mcq_marks",
                                  e.target.value
                                )
                              }
                              className="w-24 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-blue-500"
                            />
                          </td>

                          <td className="px-3 py-4">
                            <input placeholder="Max 10"
                              type="number"
                              min="0"
                              max="10"
                              value={row.practical_marks}
                              onChange={(e) =>
                                handleMarkChange(
                                  student.student_id,
                                  "practical_marks",
                                  e.target.value
                                )
                              }
                              className="w-24 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-blue-500"
                            />
                          </td>

                          <td className="px-3 py-4">
                            <input placeholder="Max 5"
                              type="number"
                              min="0"
                              max="5"
                              value={row.assignment_marks}
                              onChange={(e) =>
                                handleMarkChange(
                                  student.student_id,
                                  "assignment_marks",
                                  e.target.value
                                )
                              }
                              className="w-24 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-blue-500"
                            />
                          </td>

                          <td className="px-3 py-4">
                            <input placeholder="Max 5"
                              type="number"
                              min="0"
                              max="5"
                              value={row.viva_marks}
                              onChange={(e) =>
                                handleMarkChange(
                                  student.student_id,
                                  "viva_marks",
                                  e.target.value
                                )
                              }
                              className="w-24 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-blue-500"
                            />
                          </td>

                          <td className="px-5 py-4">
                            <button
                              type="button"
                              onClick={() => handleSaveOne(student.student_id)}
                              disabled={loading}
                              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-70"
                            >
                              Save
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr className="bg-white">
                      <td
                        colSpan="11"
                        className="px-5 py-6 text-center text-sm text-gray-500"
                      >
                        Select class to load students.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#17172f] px-4 py-6 text-center text-xs font-semibold text-white">
        © 2026 Global Knowledge School
      </footer>
    </main>
  );
}