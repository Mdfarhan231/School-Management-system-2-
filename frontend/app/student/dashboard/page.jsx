"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StudentDashboardPage() {
  const router = useRouter();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const savedStudent = localStorage.getItem("student");

    if (!savedStudent) {
      router.replace("/student/login");
      return;
    }

    try {
      setStudent(JSON.parse(savedStudent));
    } catch (error) {
      localStorage.removeItem("student");
      router.replace("/student/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("student");
    router.replace("/student/login");
  };

  const getStudentImage = (picture) => {
    if (!picture) return "/student-demo.png";
    return picture;
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
        <h1 className="flex items-center justify-center text-[15px] font-medium sm:text-xl">
          School Management System
        </h1>
      </header>

      <section className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-3xl rounded-[28px] bg-[#e5e7eb] p-8 shadow-[-10px_-10px_20px_rgba(255,255,255,0.85),10px_10px_22px_rgba(163,177,198,0.5)]">
          <h1 className="mb-8 text-center text-[20px] font-bold text-[#1f2937] sm:text-[22px]">
            Student Dashboard
          </h1>

          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="shrink-0">
              <img
                src={getStudentImage(student.picture)}
                alt={student.name || "Student"}
                className="h-24 w-24 rounded-full object-cover shadow-md"
              />
            </div>

            <div className="w-full text-center sm:text-left">
              <p className="text-[16px] font-semibold text-[#374151]">
                Name: <span className="font-normal">{student.name || "-"}</span>
              </p>

              <p className="text-[16px] font-semibold text-[#374151]">
                Student ID:{" "}
                <span className="font-normal">{student.student_id || "-"}</span>
              </p>

              <p className="text-[16px] font-semibold text-[#374151]">
                Father's Name:{" "}
                <span className="font-normal">{student.father_name || "-"}</span>
              </p>

              <p className="text-[16px] font-semibold text-[#374151]">
                Mother's Name:{" "}
                <span className="font-normal">{student.mother_name || "-"}</span>
              </p>

              <p className="text-[16px] font-semibold text-[#374151]">
                Phone: <span className="font-normal">{student.phone || "-"}</span>
              </p>

              <p className="text-[16px] font-semibold text-[#374151]">
                Class: <span className="font-normal">{student.class_name || "-"}</span>
              </p>

              <p className="text-[16px] font-semibold text-[#374151]">
                Shift: <span className="font-normal">{student.shift || "-"}</span>
              </p>

              <p className="text-[16px] font-semibold text-[#374151]">
                Roll: <span className="font-normal">{student.roll || "-"}</span>
              </p>

              <p className="text-[16px] font-semibold text-[#374151]">
                Section: <span className="font-normal">{student.section || "-"}</span>
              </p>

              <p className="text-[16px] font-semibold text-[#374151]">
                Subjects:{" "}
                <span className="font-normal">
                  {Array.isArray(student.subjects)
                    ? student.subjects.join(", ")
                    : student.subjects || "-"}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/student/exam-routine"
              className="rounded-lg bg-[#5b5b5b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4b4b4b]"
            >
              Exam Routine
            </Link>

            <Link
              href="/student/attendance"
              className="rounded-lg bg-[#5b5b5b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4b4b4b]"
            >
              Attendance
            </Link>

            <Link
              href="/student/results"
              className="rounded-lg bg-[#5b5b5b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4b4b4b]"
            >
              Results
            </Link>

            <Link
              href="/student/notices"
              className="rounded-lg bg-[#5b5b5b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4b4b4b]"
            >
              Notice Board
            </Link>
          </div>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={handleLogout}
              className="text-[15px] font-medium text-red-500 hover:text-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-[#17172f] px-4 py-6 text-center text-xs font-semibold text-white">
        © 2026 Global Knowledge School
      </footer>
    </main>
  );
}