"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

// Safely format a time string regardless of whether it's already 12h or raw 24h
function formatTime(t) {
  if (!t) return "—";
  const upper = t.toString().toUpperCase();
  if (upper.includes("AM") || upper.includes("PM")) {
    return t.toString().replace(/\s*(AM|PM)\s*/i, (_, p) => ` ${p.toUpperCase()}`).trim();
  }
  const [h, m] = t.split(":");
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
}

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

  // ✅ UPDATED
  const fetchTeacherRoutine = async (teacherId) => {
    try {
      const data = await apiRequest(`/teacher/exam-routines/${teacherId}`);
      setRoutines(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch teacher exam routines:", error);
      setRoutines([]);
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
                        {formatTime(routine.start_time)} – {formatTime(routine.end_time)}
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