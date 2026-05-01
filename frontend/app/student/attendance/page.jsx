"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

export default function StudentAttendancePage() {
  const router = useRouter();

  const [student, setStudent] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedStudent = localStorage.getItem("student");

    if (!savedStudent) {
      router.replace("/student/login");
      return;
    }

    const parsedStudent = JSON.parse(savedStudent);
    setStudent(parsedStudent);
    fetchAttendance(parsedStudent.student_id);
  }, [router]);

  const fetchAttendance = async (studentId) => {
    try {
      setLoading(true);

      const data = await apiRequest(`/student/attendance/${studentId}`);
      setRows(Array.isArray(data) ? data : []);

    } catch (error) {
      console.error("Failed to fetch student attendance:", error);
      setRows([]);
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
    <section className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-5xl rounded-[28px] bg-[#e5e7eb] p-6 shadow-[-10px_-10px_20px_rgba(255,255,255,0.85),10px_10px_22px_rgba(163,177,198,0.5)]">
          <h2 className="mb-4 text-[22px] font-bold text-black">
            My Attendance History
          </h2>

          <p className="mb-5 text-sm text-gray-700">
            Class: <span className="font-semibold">{student.class_name || "-"}</span>
            {" | "}
            Roll: <span className="font-semibold">{student.roll || "-"}</span>
            {" | "}
            Shift: <span className="font-semibold">{student.shift || "-"}</span>
          </p>

          <div className="overflow-x-auto rounded-xl">
            <table className="w-full min-w-[850px] border-collapse overflow-hidden rounded-xl">
              <thead>
                <tr className="bg-slate-200 text-left text-sm font-bold text-black">
                  <th className="px-5 py-3">Class</th>
                  <th className="px-5 py-3">Shift</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr className="bg-white">
                    <td colSpan="4" className="px-5 py-6 text-center text-sm text-gray-500">
                      Loading attendance.....
                    </td>
                  </tr>
                ) : rows.length > 0 ? (
                  rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-gray-200 bg-white text-sm text-black"
                    >
                      <td className="px-5 py-4">{row.class_name}</td>
                      <td className="px-5 py-4">{row.shift}</td>
                      <td className="px-5 py-4">{row.attendance_date}</td>
                      <td className="px-5 py-4">
                        {row.status === "late" && row.late_time ? (
                          <span className="font-semibold text-pink-600">
                            Late ({row.late_time})
                          </span>
                        ) : row.status === "present" ? (
                          <span className="font-semibold text-emerald-600">Present</span>
                        ) : row.status === "absent" ? (
                          <span className="font-semibold text-red-600">Absent</span>
                        ) : (
                          row.status
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="bg-white">
                    <td colSpan="4" className="px-5 py-6 text-center text-sm text-gray-500">
                      No attendance history found.
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