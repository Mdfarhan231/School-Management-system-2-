"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  Shield,
  User,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { apiRequest } from "@/lib/api";

export default function TeacherSignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    teacher_id: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const requirements = [
    { label: "Minimum 8 characters", met: formData.password.length >= 8 },
    { label: "At least 1 uppercase letter", met: /[A-Z]/.test(formData.password) },
    { label: "At least 1 lowercase letter", met: /[a-z]/.test(formData.password) },
    { label: "At least 1 digit", met: /[0-9]/.test(formData.password) },
    { label: "At least 1 special character", met: /[!@#$%^&*(),.?":{}|<>_]/.test(formData.password) },
  ];

  const allRequirementsMet = requirements.every((requirement) => requirement.met);
  const passwordsDoNotMatch = Boolean(
    formData.confirm_password && formData.password !== formData.confirm_password
  );
  const isSubmitDisabled =
    loading ||
    !allRequirementsMet ||
    !formData.confirm_password ||
    passwordsDoNotMatch;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!allRequirementsMet) {
      setError("Please fulfill all password requirements");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const data = await apiRequest("/teacher/signup", "POST", formData);

      setSuccess(data.message || "Account created successfully");

      setFormData({
        teacher_id: "",
        email: "",
        phone: "",
        password: "",
        confirm_password: "",
      });

      setTimeout(() => {
        router.push("/teacher/login");
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl rounded-[2rem] border border-slate-100 bg-white p-6 shadow-2xl shadow-slate-300/50 sm:p-10"
        >
          <div className="mb-10 space-y-3 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
              Teacher Sign Up
            </h2>
            <p className="mx-auto max-w-[280px] text-sm leading-relaxed text-slate-500">
              Only teachers added by admin can create an account.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="group relative">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600"
                  size={20}
                />
                <input
                  type="number"
                  name="teacher_id"
                  placeholder="Teacher ID"
                  value={formData.teacher_id}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-sm font-medium text-black outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5"
                />
              </div>

              <div className="group relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600"
                  size={20}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-sm font-medium text-black outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5"
                />
              </div>

              <div className="group relative">
                <Phone
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600"
                  size={20}
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-sm font-medium text-black outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5"
                />
              </div>

              <div className="space-y-3">
                <div className="group relative">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600"
                    size={20}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white py-4 pl-12 pr-12 text-sm font-medium text-black outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <Shield
                      size={16}
                      className={allRequirementsMet ? "text-emerald-500" : "text-slate-400"}
                    />
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                      Security Check
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {requirements.map((requirement) => (
                      <div key={requirement.label} className="flex items-center gap-3">
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full transition-all duration-300 ${
                            requirement.met
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-rose-50 text-rose-400"
                          }`}
                        >
                          {requirement.met ? (
                            <Check size={12} strokeWidth={3} />
                          ) : (
                            <X size={12} strokeWidth={3} />
                          )}
                        </div>
                        <span
                          className={`text-xs font-bold transition-colors duration-300 ${
                            requirement.met ? "text-emerald-600" : "text-rose-500"
                          }`}
                        >
                          {requirement.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="group relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600"
                  size={20}
                />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm_password"
                  placeholder="Confirm Password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white py-4 pl-12 pr-12 text-sm font-medium text-black outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                  aria-label={
                    showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {passwordsDoNotMatch && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 px-1 text-rose-500"
                >
                  <AlertCircle size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Passwords do not match
                  </span>
                </motion.div>
              )}
            </div>

            {error && (
              <p className="text-sm font-medium text-red-600">{error}</p>
            )}

            {success && (
              <p className="text-sm font-medium text-green-600">{success}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitDisabled}
              className={`mt-4 w-full rounded-xl py-4 text-sm font-bold uppercase tracking-widest shadow-lg transition-all active:scale-[0.98] ${
                isSubmitDisabled
                  ? "cursor-not-allowed bg-slate-100 text-slate-400 shadow-none"
                  : "bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700"
              }`}
            >
              {loading ? "Creating..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm font-medium text-slate-500">
            Already have an account?{" "}
            <Link
              href="/teacher/login"
              className="font-bold text-blue-600 transition-all hover:underline"
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
        </motion.div>
      </section>

      <footer className="bg-[#17172f] px-4 py-6 text-center text-xs font-semibold text-white">
        &copy; 2026 Global Knowledge School
      </footer>
    </main>
  );
}
