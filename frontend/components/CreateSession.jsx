/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, X, PlusCircle } from "lucide-react";

export default function CreateSession({ isOpen, onClose, onCreate, existingSessions = [] }) {
  const [newSessionLabel, setNewSessionLabel] = useState("");
  const [createError, setCreateError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Reset form when modal opens ──
  useEffect(() => {
    if (isOpen) {
      setNewSessionLabel("");
      setCreateError("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const label = newSessionLabel.trim();
    
    if (!label) {
      setCreateError("Session name is required");
      return;
    }

    // Check for duplicate session
    const duplicate = existingSessions.some(
      (s) => (s.session_label || s.label).toLowerCase() === label.toLowerCase()
    );
    
    if (duplicate) {
      setCreateError(`Session "${label}" already exists`);
      return;
    }

    setIsSubmitting(true);

    try {
      // ── Create session object ──
      const newSession = {
        session_label: label,
        label: label,
        session_status: "Active",
        status: "Active",
        is_current: false,
        isCurrent: false,
      };

      console.log('🟢 CreateSession: Submitting:', newSession); // DEBUG

      // ── Call the parent's onCreate function ──
      await onCreate(newSession);

      console.log('🟢 CreateSession: Success!'); // DEBUG

      // Reset and close
      setNewSessionLabel("");
      setCreateError("");
      setIsSubmitting(false);
      onClose();

    } catch (error) {
      console.error('🔴 CreateSession: Error:', error);
      setCreateError(error.message || 'Failed to create session');
      setIsSubmitting(false);
    }
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md"
          />
          
          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="relative w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-xl p-6 md:p-8 z-55 overflow-hidden"
          >
            {/* Header Close button */}
            <div className="absolute top-4 right-4">
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-3.5 mb-6">
              <div className="p-2.5 bg-indigo-50/60 text-indigo-600 rounded-xl">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Create Academic Session</h3>
                <p className="text-xs text-slate-500 mt-0.5">Configure a new academic calendar period</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {createError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-semibold">
                  {createError}
                </div>
              )}

              {/* Session Name Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Session Name / Year
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2027-28 or 2028 Spring"
                    value={newSessionLabel}
                    onChange={(e) => setNewSessionLabel(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-800"
                    autoFocus
                    disabled={isSubmitting}
                  />
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Recommended format: <span className="font-mono bg-slate-50 px-1 py-0.5 rounded text-slate-500">YYYY-YY</span> (e.g., 2027-28).
                </p>
              </div>

              {/* Status Badge Block */}
              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Initial Status
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    New sessions are initialized as active.
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  Active
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 px-4 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider transition-all"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span>Create</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}