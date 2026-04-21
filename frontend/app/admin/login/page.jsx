"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    //setFormData is async function
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/admin/login", "POST", formData);

      localStorage.setItem("admin", JSON.stringify(data.admin));
      router.push("/admin/dashboard");

    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    // UI stays same
    <main className="flex min-h-screen flex-col bg-[#e5e7eb]">
      <header className="bg-[#17172f] px-4 py-3 text-white shadow">
        <h1 className="text-[15px] font-medium sm:text-xl">
          School Management System
        </h1>
      </header>

      <section className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-[345px] rounded-xl bg-[#f3f4f6] px-8 py-10 shadow-[0_8px_20px_rgba(0,0,0,0.12)]">
          <h2 className="mb-8 text-center text-4xl font-semibold text-[#1f2937]">
            Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Username"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-gray-500 focus:border-blue-500"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-gray-500 focus:border-blue-500"
            />

            {error && (
              <p className="text-sm font-medium text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-blue-600 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-70"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            <a href="/" className="text-blue-600 hover:font-bold hover:text-black hover:underline">
              Back to Home
            </a>
          </p>
        </div>
      </section>

      <footer className="bg-[#17172f] px-4 py-6 text-center text-xs font-semibold text-white">
        © 2026 Global Knowledge School
      </footer>
    </main>
  );
}