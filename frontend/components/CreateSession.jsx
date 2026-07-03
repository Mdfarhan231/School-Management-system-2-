"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, X, AlertCircle } from "lucide-react";

export default function CreateSession({ isOpen, onClose, onCreate, existingSessions = [] }) {
  const [newSessionLabel, setNewSessionLabel] = useState("");
  const [newSessionStatus, setNewSessionStatus] = useState("Active");
  const [isNewSessionCurrent, setIsNewSessionCurrent] = useState(false);
  const [createError, setCreateError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setNewSessionLabel("");
      setNewSessionStatus("Active");
      setIsNewSessionCurrent(false);
      setCreateError("");
      setStartDate("");
      setEndDate("");
    }
  }, [isOpen]);

  // Auto-generate session label from dates
  useEffect(() => {
    if (startDate && endDate) {
      const startYear = new Date(startDate).getFullYear();
      const endYear = new Date(endDate).getFullYear();
      if (startYear && endYear && startYear !== endYear) {
        const suggested = `${startYear}-${String(endYear).slice(-2)}`;
        if (!existingSessions.some(s => s.label === suggested)) {
          setNewSessionLabel(suggested);
        }
      }
    }
  }, [startDate, endDate, existingSessions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const label = newSessionLabel.trim();
    
    if (!label) {
      setCreateError("Session name is required");
      return;
    }

    // Check for existing session
    if (existingSessions.some((s) => s.label.toLowerCase() === label.toLowerCase())) {
      setCreateError("This session already exists");
      return;
    }

    const newSession = {
      id: label.toLowerCase().replace(/\s+/g, "-"),
      label: label,
      status: newSessionStatus,
      isCurrent: isNewSessionCurrent,
      startDate: startDate || null,
      endDate: endDate || null,
      createdAt: new Date().toISOString(),
    };

    onCreate(newSession);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          {/* Modal Body */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 md:p-8 z-55 overflow-hidden"
          >
            <div className="absolute top-4 right-4">
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Create Session</h3>
                <p className="text-xs text-slate-500">Configure a new academic calendar period</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {createError && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-semibold">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              {/* Session Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Session Name / Year</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2027-28 or 2028 Spring"
                  value={newSessionLabel}
                  onChange={(e) => setNewSessionLabel(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
                <p className="text-[10px] text-slate-400">Format: YYYY-YY (e.g., 2027-28)</p>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Initial Status</label>
                <div className="grid grid-cols-3 gap-3">
                  {["Active", "Upcoming", "Archived"].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setNewSessionStatus(status)}
                      className={`py-2 px-3 rounded-xl border text-center text-xs font-bold transition-all capitalize ${
                        newSessionStatus === status
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Session Toggle */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="space-y-0.5 pr-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block">Set as Current Session</label>
                  <span className="text-[10px] text-slate-400 block leading-tight">Automatically switches the administrative context to this period.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewSessionCurrent(!isNewSessionCurrent)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isNewSessionCurrent ? "bg-indigo-600" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isNewSessionCurrent ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/15 active:scale-98 transition-all"
                >
                  Create Session
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}