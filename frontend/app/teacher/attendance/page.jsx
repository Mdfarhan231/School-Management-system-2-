"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TeacherAttendancePage() {
  const router = useRouter();
  const API = "http://127.0.0.1:8000/api";
  const ATTENDANCE_LIMIT_SECONDS = 60;

  const [teacher, setTeacher] = useState(null);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedShift, setSelectedShift] = useState("");
  const [attendanceDate, setAttendanceDate] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", ok: true });
  const [pageStartTime, setPageStartTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const savedTeacher = localStorage.getItem("teacher");

    if (!savedTeacher) {
      router.replace("/teacher/login");
      return;
    }

    const parsedTeacher = JSON.parse(savedTeacher);
    setTeacher(parsedTeacher);
    fetchClasses();

    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Dhaka",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    setAttendanceDate(today);
    setPageStartTime(Date.now());
  }, [router]);

  useEffect(() => {
    if (!pageStartTime) return;

    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - pageStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [pageStartTime]);

  const timerExpired = elapsedSeconds > ATTENDANCE_LIMIT_SECONDS;

  const timerText = useMemo(() => {
    const m = Math.floor(elapsedSeconds / 60);
    const s = elapsedSeconds % 60;
    const text = `${m}:${String(s).padStart(2, "0")}`;

    if (!timerExpired) {
      return `⏱ Attendance running ${text} — Present/Absent allowed`;
    }

    return `⏱ Attendance running ${text} — Late only`;
  }, [elapsedSeconds, timerExpired]);

  const fetchClasses = async () => {
    try {
      const res = await fetch(`${API}/classes`);
      const data = await res.json();
      setClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
      setClasses([]);
    }
  };

  const fetchStudents = async () => {
    if (!selectedClassId || !selectedShift || !attendanceDate) {
      setMessage({ text: "Please select class, shift and date.", ok: false });
      return;
    }

    try {
      setLoadingStudents(true);
      setMessage({ text: "Loading students...", ok: true });

      const res = await fetch(`${API}/attendance/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          class_id: Number(selectedClassId),
          shift: selectedShift,
        }),
      });

      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        setStudents([]);
        setAttendanceMap({});
        setMessage({ text: "No students found for this class and shift.", ok: false });
        return;
      }

      setStudents(data);

      const initialMap = {};
      data.forEach((student) => {
        initialMap[student.student_id] = "";
      });
      setAttendanceMap(initialMap);

      setMessage({ text: "Students loaded. Select status then save.", ok: true });
    } catch (error) {
      console.error("Failed to load students:", error);
      setStudents([]);
      setAttendanceMap({});
      setMessage({ text: "Failed to load students.", ok: false });
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleAttendanceChange = (studentId, value) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  const handleSaveAttendance = async () => {
    if (!teacher?.teacher_id) {
      setMessage({ text: "Teacher session not found.", ok: false });
      return;
    }

    if (!selectedClassId || !selectedShift || !attendanceDate) {
      setMessage({ text: "Please select class, shift and date.", ok: false });
      return;
    }

    if (students.length === 0) {
      setMessage({ text: "No students loaded to save.", ok: false });
      return;
    }

    const attendance = students
      .map((student) => ({
        student_id: student.student_id,
        status: attendanceMap[student.student_id] || "",
      }))
      .filter((row) => row.status !== "");

    if (attendance.length === 0) {
      setMessage({ text: "Please select attendance status for at least one student.", ok: false });
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(`${API}/attendance/store`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          teacher_id: teacher.teacher_id,
          class_id: Number(selectedClassId),
          shift: selectedShift,
          attendance_date: attendanceDate,
          timer_expired: timerExpired,
          attendance,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ text: data.message || "Failed to save attendance.", ok: false });
        return;
      }

      setMessage({ text: data.message || "Attendance saved successfully.", ok: true });
    } catch (error) {
      console.error("Failed to save attendance:", error);
      setMessage({ text: "Server error while saving attendance.", ok: false });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("teacher");
    router.replace("/teacher/login");
  };

  const availableOptions = timerExpired
    ? [{ value: "late", label: "Late" }]
    : [
        { value: "present", label: "Present" },
        { value: "absent", label: "Absent" },
      ];

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

          <Link href="/teacher/attendance" className="hover:text-blue-600">
            🕒 Take Attendance
          </Link>

          <Link href="/teacher/attendance-history" className="hover:text-blue-600">
            📋 Attendance History
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
        <div className="mx-auto max-w-5xl rounded-[28px] bg-[#e5e7eb] p-6 shadow-[-10px_-10px_20px_rgba(255,255,255,0.85),10px_10px_22px_rgba(163,177,198,0.5)]">
          <h2 className="mb-4 text-[22px] font-bold text-black">
            Take Attendance
          </h2>

          <p className="mb-4 text-[18px] font-semibold text-blue-600">
            {timerText}
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_1fr_auto_auto] md:items-end">
            <div>
              <label className="mb-2 block text-[14px] font-semibold text-black">
                Class
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none focus:border-blue-500"
              >
                <option value="">-- Select Class --</option>
                {classes.map((item) => (
                  <option key={item.class_id} value={item.class_id}>
                    {item.class_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-[14px] font-semibold text-black">
                Shift
              </label>
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none focus:border-blue-500"
              >
                <option value="">-- Select Shift --</option>
                <option value="Morning">Morning</option>
                <option value="Day">Day</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-[14px] font-semibold text-black">
                Date
              </label>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="button"
              onClick={fetchStudents}
              disabled={loadingStudents}
              className="rounded-xl bg-gray-500 px-5 py-3 text-sm font-bold text-white hover:bg-gray-600 disabled:opacity-70"
            >
              {loadingStudents ? "Loading..." : "Load Students"}
            </button>

            <button
              type="button"
              onClick={handleSaveAttendance}
              disabled={saving}
              className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save Attendance"}
            </button>
          </div>

          {message.text && (
            <p className={`mt-4 text-[18px] font-semibold ${message.ok ? "text-emerald-700" : "text-red-600"}`}>
              {message.text}
            </p>
          )}

          <div className="mt-6 overflow-x-auto rounded-xl">
            <table className="w-full min-w-[700px] border-collapse overflow-hidden rounded-xl">
              <thead>
                <tr className="bg-slate-200 text-left text-sm font-bold text-black">
                  <th className="px-5 py-3">Roll</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Shift</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {students.length > 0 ? (
                  students.map((student) => (
                    <tr
                      key={student.student_id}
                      className="border-b border-gray-200 bg-white text-sm text-black"
                    >
                      <td className="px-5 py-4">{student.roll}</td>
                      <td className="px-5 py-4">{student.name}</td>
                      <td className="px-5 py-4">{student.shift}</td>
                      <td className="px-5 py-4">
                        <select
                          value={attendanceMap[student.student_id] || ""}
                          onChange={(e) =>
                            handleAttendanceChange(student.student_id, e.target.value)
                          }
                          className="w-[180px] rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-blue-500"
                        >
                          <option value="">-- Select --</option>
                          {availableOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="bg-white">
                    <td
                      colSpan="4"
                      className="px-5 py-6 text-center text-sm text-gray-500"
                    >
                      Select class, shift and click “Load Students”.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <footer className="bg-[#17172f] px-4 py-6 text-center text-xs font-semibold text-white">
        © 2026 Global Knowledge School
      </footer>
    </main>
  );
}