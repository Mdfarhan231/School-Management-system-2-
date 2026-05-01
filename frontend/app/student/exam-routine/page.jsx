"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

export default function StudentExamRoutinePage() {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedStudent = localStorage.getItem("student");

    if (!savedStudent) {
      router.replace("/student/login");
      return;
    }

    const parsedStudent = JSON.parse(savedStudent);
    setStudent(parsedStudent);
    fetchStudentRoutine(parsedStudent.student_id);
  }, [router]);

  const fetchStudentRoutine = async (studentId) => {
    try {
      const data = await apiRequest(`/student/exam-routines/${studentId}`);
      setRoutines(data);
    } catch (error) {
      console.error("Failed to fetch student exam routine:", error);
      setRoutines([]);
    } finally {
      setLoading(false);
    }
  };



  if (!student) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#e5e7eb]">
        <p className="text-black">Loading...</p>
      </main>
    );
  }


  return (
    <section className="px-4 py-8">
        <div className="mx-auto max-w-5xl rounded-[24px] bg-[#e5e7eb] p-5 shadow-[-8px_-8px_16px_rgba(255,255,255,0.85),8px_8px_18px_rgba(163,177,198,0.45)]">
          <h2 className="mb-2 text-[24px] font-bold text-black">
            My Exam Routine
          </h2>

          <p className="mb-5 text-sm text-gray-700">
            Class: {student.class_name || "-"} | Roll: {student.roll || "-"} |
            {" "}Section: {student.section || "-"}
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
                        {routine.start_time && routine.end_time
                          ? `${routine.start_time} - ${routine.end_time}`
                          : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="bg-white">
                    <td
                      colSpan="5"
                      className="px-5 py-6 text-center text-sm text-gray-500"
                    >
                      No exam routine found for your class.
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