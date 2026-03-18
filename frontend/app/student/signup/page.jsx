"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

export default function StudentSignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    student_id: "",
    phone: "",
    roll: "",
    password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // ✅ optional validation (good practice)
    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // ✅ UPDATED
      const data = await apiRequest("/student/signup", "POST", formData);

      setSuccess(data.message || "Account created successfully.");

      setFormData({
        student_id: "",
        phone: "",
        roll: "",
        password: "",
        confirm_password: "",
      });

      setTimeout(() => {
        router.push("/student/login");
      }, 1200);

    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="flex min-h-screen flex-col bg-[#e5e7eb]">
      <header className="bg-[#17172f] px-4 py-3 text-white shadow">
        <h1 className="text-[15px] font-medium sm:text-xl">
          School Management System
        </h1>
      </header>

      <section className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-[390px] rounded-xl bg-[#f3f4f6] px-8 py-10 shadow-[0_8px_20px_rgba(0,0,0,0.12)]">
          <h2 className="mb-2 text-center text-3xl font-semibold text-[#1f2937]">
            Student Sign Up
          </h2>

          <p className="mb-6 text-center text-sm text-gray-600">
            Only students added by admin can create an account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="number"
              name="student_id"
              placeholder="Student ID"
              value={formData.student_id}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none placeholder:text-gray-500 focus:border-blue-500"
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none placeholder:text-gray-500 focus:border-blue-500"
            />

            <input
              type="number"
              name="roll"
              placeholder="Roll"
              value={formData.roll}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none placeholder:text-gray-500 focus:border-blue-500"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none placeholder:text-gray-500 focus:border-blue-500"
            />

            <input
              type="password"
              name="confirm_password"
              placeholder="Confirm Password"
              value={formData.confirm_password}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none placeholder:text-gray-500 focus:border-blue-500"
            />

            {error && (
              <p className="text-sm font-medium text-red-600">{error}</p>
            )}

            {success && (
              <p className="text-sm font-medium text-green-600">{success}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-blue-600 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-70"
            >
              {loading ? "Creating..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-700">
            Already have an account?{" "}
            <Link
              href="/student/login"
              className="font-semibold text-blue-600 hover:underline"
            >
              Login
            </Link>
          </p>

          <p className="mt-3 text-center text-sm text-gray-700">
            <Link
              href="/"
              className="font-semibold text-blue-600 hover:underline"
            >
              Back to Home
            </Link>
          </p>
        </div>
      </section>

      <footer className="bg-[#17172f] px-4 py-6 text-center text-xs font-semibold text-white">
        © 2026 Global Knowledge School
      </footer>
    </main>
  );
}