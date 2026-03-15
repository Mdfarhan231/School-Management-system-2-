"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function MarkApprovalsPage() {
  const API = "http://127.0.0.1:8000/api";

  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("admin");
    window.location.href = "/admin/login";
  };

  useEffect(() => {
    fetchPendingMarks();
  }, []);

  const fetchPendingMarks = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/student-marks/pending`);
      const data = await res.json();
      setMarks(data);
    } catch (err) {
      console.error("Failed to fetch pending marks:", err);
      setMarks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setApprovingId(id);

      const res = await fetch(`${API}/student-marks/${id}/approve`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Approval failed");
        return;
      }

      fetchPendingMarks();
    } catch (err) {
      alert("Server error while approving");
    } finally {
      setApprovingId(null);
    }
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

          <Link href="/admin/exam-routines" className="hover:text-blue-600">
            📝 Exam Routine
          </Link>

          <Link href="/admin/mark-approvals" className="hover:text-blue-600">
            ✅ Mark Approvals
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
            Pending Marks Approval
          </h2>

          <div className="rounded-[24px] bg-[#e5e7eb] p-5 shadow-[-8px_-8px_16px_rgba(255,255,255,0.85),8px_8px_18px_rgba(163,177,198,0.45)]">
            <h3 className="mb-4 text-[20px] font-bold text-black">
              Teacher Submitted Marks
            </h3>

            <div className="overflow-x-auto rounded-xl">
              <table className="w-full min-w-[1500px] border-collapse overflow-hidden rounded-xl">
                <thead>
                  <tr className="bg-blue-700 text-left text-sm font-bold text-white">
                    <th className="px-5 py-3">Exam</th>
                    <th className="px-5 py-3">Class</th>
                    <th className="px-5 py-3">Subject</th>
                    <th className="px-5 py-3">Student</th>
                    <th className="px-5 py-3">Roll</th>
                    <th className="px-5 py-3">Section</th>
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
                    <th className="px-5 py-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr className="bg-white">
                      <td
                        colSpan="17"
                        className="px-5 py-6 text-center text-sm text-gray-500"
                      >
                        Loading pending marks...
                      </td>
                    </tr>
                  ) : marks.length > 0 ? (
                    marks.map((mark) => (
                      <tr
                        key={mark.id}
                        className="border-b border-gray-200 bg-white text-sm text-black"
                      >
                        <td className="px-5 py-4">{mark.exam_name}</td>
                        <td className="px-5 py-4">{mark.class_name}</td>
                        <td className="px-5 py-4">{mark.subject_name}</td>
                        <td className="px-5 py-4">{mark.student_name}</td>
                        <td className="px-5 py-4">{mark.roll}</td>
                        <td className="px-5 py-4">{mark.section}</td>
                        <td className="px-5 py-4">{mark.written_marks}</td>
                        <td className="px-5 py-4">{mark.mcq_marks}</td>
                        <td className="px-5 py-4">{mark.practical_marks}</td>
                        <td className="px-5 py-4">{mark.viva_marks}</td>
                        <td className="px-5 py-4">{mark.assignment_marks}</td>
                        <td className="px-5 py-4">{mark.class_test_marks}</td>
                        <td className="px-5 py-4 font-semibold">
                          {mark.total_marks}
                        </td>
                        <td className="px-5 py-4 font-semibold">{mark.grade}</td>
                        <td className="px-5 py-4 font-semibold">{mark.gpa}</td>
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                            {mark.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => handleApprove(mark.id)}
                            disabled={approvingId === mark.id}
                            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-70"
                          >
                            {approvingId === mark.id ? "Approving..." : "Approve"}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="bg-white">
                      <td
                        colSpan="17"
                        className="px-5 py-6 text-center text-sm text-gray-500"
                      >
                        No pending marks found.
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