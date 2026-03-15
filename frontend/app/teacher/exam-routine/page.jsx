"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TeacherExamRoutinePage() {
  const router = useRouter();
  const [teacher, setTeacher] = useState(null);
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedTeacher = localStorage.getItem("teacher");

    if (!savedTeacher) {
      router.replace("/teacher/login");
      return;
    }

    const parsedTeacher = JSON.parse(savedTeacher);
    setTeacher(parsedTeacher);

    fetchTeacherRoutine(parsedTeacher.teacher_id);
  }, [router]);

  const fetchTeacherRoutine = async (teacherId) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/teacher/exam-routines/${teacherId}`
      );
      const data = await res.json();
      setRoutines(data);
    } catch (error) {
      console.error("Failed to fetch teacher exam routines:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("teacher");
    router.replace("/teacher/login");
  };

  if (!teacher) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#e5e7eb]">
        <p className="text-black">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#e5e7eb]">
      <header className="bg-[#17172f] px-4 py-3 text-white shadow">
        <h1 className="text-[15px] font-medium">School Management System</h1>
      </header>

      <nav className="border-b border-gray-300 bg-white">
        <div className="flex items-center justify-end gap-6 px-6 py-3 text-[14px] font-semibold text-[#17172f]">
          <Link href="/teacher/dashboard" className="hover:text-blue-600">
            🏠 Dashboard
          </Link>

          <Link href="/teacher/exam-routine" className="hover:text-blue-600">
            📝 Exam Routine
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

      <section className="px-4 py-8">
        <div className="mx-auto max-w-5xl rounded-[24px] bg-[#e5e7eb] p-5 shadow-[-8px_-8px_16px_rgba(255,255,255,0.85),8px_8px_18px_rgba(163,177,198,0.45)]">
          <h2 className="mb-2 text-[24px] font-bold text-black">
            My Exam Routine
          </h2>

          <p className="mb-5 text-sm text-gray-700">
            Showing exam routine for subjects: {teacher.subjects || "-"}
          </p>

          <div className="overflow-x-auto rounded-xl">
            <table className="w-full min-w-[850px] border-collapse overflow-hidden rounded-xl">
              <thead>
                <tr className="bg-blue-700 text-left text-sm font-bold text-white">
                  <th className="px-5 py-3">Exam</th>
                  <th className="px-5 py-3">Class</th>
                  <th className="px-5 py-3">Subject</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Time</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr className="bg-white">
                    <td
                      colSpan="5"
                      className="px-5 py-6 text-center text-sm text-gray-500"
                    >
                      Loading exam routine...
                    </td>
                  </tr>
                ) : routines.length > 0 ? (
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
                    </tr>
                  ))
                ) : (
                  <tr className="bg-white">
                    <td
                      colSpan="5"
                      className="px-5 py-6 text-center text-sm text-gray-500"
                    >
                      No exam routine found for your subjects.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}