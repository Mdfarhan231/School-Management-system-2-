"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

export default function TeacherAttendanceHistoryPage() {
  const router = useRouter();

  const [teacher, setTeacher] = useState(null);
  const [classes, setClasses] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    class_id: "",
    shift: "",
    roll: "",
    date_from: "",
    date_to: "",
  });

  useEffect(() => {
    const savedTeacher = localStorage.getItem("teacher");

    if (!savedTeacher) {
      router.replace("/teacher/login");
      return;
    }

    setTeacher(JSON.parse(savedTeacher));
    fetchClasses();
  }, [router]);

  const fetchClasses = async () => {
    try {
      const data = await apiRequest("/classes");
      setClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
      setClasses([]);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);

      const data = await apiRequest("/attendance/history", "POST", filters);
      setRows(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch attendance history:", error);
      setRows([]);
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
        <div className="mx-auto max-w-6xl rounded-[28px] bg-[#e5e7eb] p-6 shadow-[-10px_-10px_20px_rgba(255,255,255,0.85),10px_10px_22px_rgba(163,177,198,0.5)]">
          <h2 className="mb-6 text-[22px] font-bold text-black">
            Attendance History / Report
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] md:items-end">
            <div>
              <label className="mb-2 block text-[14px] font-semibold text-black">
                Class
              </label>
              <select
                value={filters.class_id}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, class_id: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none focus:border-blue-500"
              >
                <option value="">All</option>
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
                value={filters.shift}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, shift: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none focus:border-blue-500"
              >
                <option value="">All</option>
                <option value="Morning">Morning</option>
                <option value="Day">Day</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-[14px] font-semibold text-black">
                Roll
              </label>
              <input
                type="number"
                placeholder="e.g. 12"
                value={filters.roll}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, roll: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-gray-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-[14px] font-semibold text-black">
                Date From
              </label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, date_from: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-[14px] font-semibold text-black">
                Date To
              </label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, date_to: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="button"
              onClick={handleSearch}
              className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
            >
              Search
            </button>
          </div>

          <div className="mt-6 overflow-x-auto rounded-xl">
            <table className="w-full min-w-[1050px] border-collapse overflow-hidden rounded-xl">
              <thead>
                <tr className="bg-slate-200 text-left text-sm font-bold text-black">
                  <th className="px-5 py-3">Class</th>
                  <th className="px-5 py-3">Shift</th>
                  <th className="px-5 py-3">Roll</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr className="bg-white">
                    <td colSpan="6" className="px-5 py-6 text-center text-sm text-gray-500">
                      Loading attendance history...
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
                      <td className="px-5 py-4">{row.roll}</td>
                      <td className="px-5 py-4">{row.name}</td>
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
                    <td colSpan="6" className="px-5 py-6 text-center text-sm text-gray-500">
                      No attendance history found.
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