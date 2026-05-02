"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { CalendarIcon, Megaphone } from "lucide-react";
import { apiRequest } from "@/lib/api";

/* ── tiny helpers ── */
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

const priorityColors = {
  low: "bg-blue-100 text-blue-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

const statusColors = {
  draft: "bg-slate-100 text-slate-700",
  published: "bg-emerald-100 text-emerald-700",
};

/* ══════════════════════════════════════════════
   Teacher — All Notices  (read-only view)
   Mirrors the admin/notices list style WITHOUT
   "View History" / "New Notice" tabs or actions.
══════════════════════════════════════════════ */
export default function TeacherNoticesPage() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await apiRequest("/notices");
        if (Array.isArray(data)) {
          // Keep only notices visible to teachers
          const filtered = data.filter((n) => {
            const cat = Array.isArray(n.category) ? n.category : [];
            const audience = Array.isArray(n.targetAudience)
              ? n.targetAudience
              : [];
            return (
              cat.length === 0 ||
              cat.includes("ALL") ||
              cat.includes("Teacher") ||
              audience.includes("ALL") ||
              audience.includes("Teachers")
            );
          });
          setNotices(filtered);
        }
      } catch (err) {
        console.error("Failed to fetch notices:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="p-8 max-w-[1400px] mx-auto w-full space-y-6">
        <div className="h-10 w-56 rounded-xl bg-slate-200 animate-pulse" />
        <div className="h-5 w-80 rounded-lg bg-slate-100 animate-pulse" />
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-32 w-full rounded-2xl bg-white border border-slate-200 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto w-full">
      {/* ── Page header ── */}
      <div className="mb-8">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-black text-slate-900 tracking-tight"
        >
          Announcements
        </motion.h2>
        <p className="text-slate-500 font-medium mt-1">
          Official school notices and communications.
        </p>
      </div>

      {/* ── Notice list ── */}
      {notices.length === 0 ? (
        <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200">
          <Megaphone className="mx-auto h-10 w-10 text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">
            No notices available at the moment.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {notices.map((notice, index) => (
            <motion.div
              key={notice.id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="hover:shadow-lg transition-all duration-300 border border-slate-200/60 bg-white/80 backdrop-blur-sm group overflow-hidden rounded-xl shadow">
                <div className="flex flex-col md:flex-row items-start md:items-center p-6 gap-6">
                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    {/* Badges row */}
                    <div className="flex flex-wrap items-center gap-2">
                      {notice.priority && (
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold capitalize",
                            priorityColors[notice.priority] ||
                              "bg-slate-100 text-slate-700"
                          )}
                        >
                          {notice.priority} priority
                        </span>
                      )}

                      {/* Category badges */}
                      {Array.isArray(notice.category)
                        ? notice.category.map((cat) => (
                            <span
                              key={cat}
                              className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-semibold capitalize text-slate-900"
                            >
                              {cat}
                            </span>
                          ))
                        : notice.category && (
                            <span className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-semibold capitalize text-slate-900">
                              {notice.category}
                            </span>
                          )}

                      {notice.status && (
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold capitalize ml-auto md:ml-0",
                            statusColors[notice.status] ||
                              "bg-slate-100 text-slate-700"
                          )}
                        >
                          {notice.status}
                        </span>
                      )}
                    </div>

                    {/* Title & content */}
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
                        {notice.title}
                      </h3>
                      <p className="text-slate-500 line-clamp-2 mt-1 text-sm">
                        {notice.content}
                      </p>
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="w-4 h-4" />
                        {formatDate(notice.date)}
                      </div>
                      <div className="hidden sm:flex items-center gap-1.5 border-l border-slate-200 pl-4">
                        <span className="opacity-70">To:</span>
                        {Array.isArray(notice.category) &&
                        notice.category.length
                          ? notice.category.join(", ")
                          : Array.isArray(notice.targetAudience) &&
                            notice.targetAudience.length
                          ? notice.targetAudience.join(", ")
                          : "All"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
