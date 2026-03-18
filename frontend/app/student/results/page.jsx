"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

export default function StudentResultsPage() {
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  const [student, setStudent] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedStudent = localStorage.getItem("student");

    if (!savedStudent) {
      router.replace("/student/login");
      return;
    }

    const parsedStudent = JSON.parse(savedStudent);
    setStudent(parsedStudent);
    fetchResults(parsedStudent.student_id);
  }, [router]);

  // ✅ UPDATED
  const fetchResults = async (studentId) => {
    try {
      const data = await apiRequest(`/student-results/${studentId}`);
      setResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch student results:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const groupedResults = useMemo(() => {
    const groups = {};
    results.forEach((item) => {
      const examName = item.exam_name || "Unknown Exam";
      if (!groups[examName]) groups[examName] = [];
      groups[examName].push(item);
    });
    return groups;
  }, [results]);

  const handleLogout = () => {
    localStorage.removeItem("student");
    router.replace("/student/login");
  };

  // ✅ UPDATED IMAGE URL
  const getStudentImage = (picture) => {
    if (!picture) return "/student-demo.png";
    return `${API_BASE.replace("/api", "")}/students/${picture}`;
  };

  if (!student) {
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
          <Link href="/student/dashboard" className="hover:text-blue-600">
            🏠 Dashboard
          </Link>

          <Link href="/student/exam-routine" className="hover:text-blue-600">
            📝 Exam Routine
          </Link>

          <Link href="/student/results" className="hover:text-blue-600">
            📊 Results
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
          <div className="mb-8 rounded-[28px] bg-[#e5e7eb] p-6 shadow-[-10px_-10px_20px_rgba(255,255,255,0.85),10px_10px_22px_rgba(163,177,198,0.5)]">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              <div className="shrink-0">
                <img
                  src={getStudentImage(student.picture)}
                  alt={student.name}
                  className="h-24 w-24 rounded-full object-cover shadow-md"
                />
              </div>

              <div className="w-full text-center sm:text-left">
                <h2 className="mb-3 text-[24px] font-bold text-[#1f2937]">
                  Student Results
                </h2>

                <p className="text-[15px] font-semibold text-[#374151]">
                  Name: <span className="font-normal">{student.name || "-"}</span>
                </p>

                <p className="text-[15px] font-semibold text-[#374151]">
                  Student ID:{" "}
                  <span className="font-normal">{student.student_id || "-"}</span>
                </p>

                <p className="text-[15px] font-semibold text-[#374151]">
                  Class: <span className="font-normal">{student.class_name || "-"}</span>
                </p>

                <p className="text-[15px] font-semibold text-[#374151]">
                  Roll: <span className="font-normal">{student.roll || "-"}</span>
                </p>

                <p className="text-[15px] font-semibold text-[#374151]">
                  Section: <span className="font-normal">{student.section || "-"}</span>
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="rounded-[28px] bg-[#e5e7eb] p-8 text-center text-black shadow-[-10px_-10px_20px_rgba(255,255,255,0.85),10px_10px_22px_rgba(163,177,198,0.5)]">
              Loading results...
            </div>
          ) : Object.keys(groupedResults).length > 0 ? (
            <div className="space-y-8">
              {Object.entries(groupedResults).map(([examName, examRows]) => (
                <div
                  key={examName}
                  className="rounded-[28px] bg-[#e5e7eb] p-5 shadow-[-10px_-10px_20px_rgba(255,255,255,0.85),10px_10px_22px_rgba(163,177,198,0.5)]"
                >
                  <h3 className="mb-4 text-[22px] font-bold text-black">
                    {examName} Result
                  </h3>

                  <div className="overflow-x-auto rounded-xl">
                    <table className="w-full min-w-[1300px] border-collapse overflow-hidden rounded-xl">
                      <thead>
                        <tr className="bg-blue-700 text-left text-sm font-bold text-white">
                          <th className="px-5 py-3">Subject</th>
                          <th className="px-5 py-3">Written</th>
                          <th className="px-5 py-3">MCQ</th>
                          <th className="px-5 py-3">Practical</th>
                          <th className="px-5 py-3">Viva</th>
                          <th className="px-5 py-3">Assignment</th>
                          <th className="px-5 py-3">Class Test</th>
                          <th className="px-5 py-3">Total</th>
                          <th className="px-5 py-3">Grade</th>
                          <th className="px-5 py-3">GPA</th>
                          <th className="px-5 py-3">Status</th>
                        </tr>
                      </thead>

                      <tbody>
                        {examRows.map((row) => (
                          <tr
                            key={row.id}
                            className="border-b border-gray-200 bg-white text-sm text-black"
                          >
                            <td className="px-5 py-4">{row.subject_name}</td>
                            <td className="px-5 py-4">{row.written_marks}</td>
                            <td className="px-5 py-4">{row.mcq_marks}</td>
                            <td className="px-5 py-4">{row.practical_marks}</td>
                            <td className="px-5 py-4">{row.viva_marks}</td>
                            <td className="px-5 py-4">{row.assignment_marks}</td>
                            <td className="px-5 py-4">{row.class_test_marks}</td>
                            <td className="px-5 py-4 font-semibold">{row.total_marks}</td>
                            <td className="px-5 py-4 font-semibold">{row.grade}</td>
                            <td className="px-5 py-4 font-semibold">{row.gpa}</td>
                            <td className="px-5 py-4">
                              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] bg-[#e5e7eb] p-8 text-center text-gray-600 shadow-[-10px_-10px_20px_rgba(255,255,255,0.85),10px_10px_22px_rgba(163,177,198,0.5)]">
              No approved results found yet.
            </div>
          )}
        </div>
      </section>

      <footer className="bg-[#17172f] px-4 py-6 text-center text-xs font-semibold text-white">
        © 2026 Global Knowledge School
      </footer>
    </main>
  );
}
