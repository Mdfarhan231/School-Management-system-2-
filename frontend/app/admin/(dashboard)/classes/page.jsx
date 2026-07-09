"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  GraduationCap,
  X,
  AlertTriangle,
  Layers,
  PlusCircle,
  Hash,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { apiRequest } from "@/lib/api";
import { useSession } from "@/context/SessionContext";

function toArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.classes)) return payload.classes;
  return [];
}

function normalizeClass(item) {
  return {
    id: String(item.class_id ?? item.id),
    class_id: item.class_id ?? item.id,
    name: item.class_name ?? item.name ?? `Class ${item.class_id ?? item.id}`,
    class_name: item.class_name ?? item.name ?? `Class ${item.class_id ?? item.id}`,
    session_id: item.session_id ?? item.academic_session_id ?? null,
    session_label: item.session_label ?? item.label ?? null,
    student_count: item.student_count ?? item.students_count ?? 0,
  };
}

export default function ManageClassesPage() {
  const {
    selectedSessionId,
    selectedSession,
  } = useSession();

  const sessionLabel =
    selectedSession?.session_label ||
    selectedSession?.label ||
    selectedSession?.name ||
    "Current Session";

  const [classes, setClasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingClass, setEditingClass] = useState(null);

  const [className, setClassName] = useState("");
  const [formError, setFormError] = useState("");

  const [deleteConfirmClass, setDeleteConfirmClass] = useState(null);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const showError = (message) => {
    setError(message);
    setSuccess("");
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setError("");
  };

  const loadClasses = useCallback(async () => {
    try {
      setIsLoading(true);
      clearMessages();

      const payload = await apiRequest("/classes");
      const normalized = toArray(payload).map(normalizeClass);

      setClasses(normalized);
    } catch (err) {
      setClasses([]);
      showError(err.message || "Failed to load classes.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const visibleClasses = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();

    return classes.filter((item) => {
      const matchesSearch =
        !search || item.name.toLowerCase().includes(search);

      if (!selectedSessionId) return matchesSearch;

      const itemSessionId = item.session_id ? String(item.session_id) : null;

      if (!itemSessionId) return matchesSearch;

      return itemSessionId === String(selectedSessionId) && matchesSearch;
    });
  }, [classes, searchQuery, selectedSessionId]);

  const handleOpenCreate = () => {
    clearMessages();
    setModalMode("create");
    setEditingClass(null);
    setClassName("");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (classItem) => {
    clearMessages();
    setModalMode("edit");
    setEditingClass(classItem);
    setClassName(classItem.name);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSaving) return;

    setIsModalOpen(false);
    setEditingClass(null);
    setClassName("");
    setFormError("");
  };

  const validateForm = () => {
    const trimmedName = className.trim();

    if (!trimmedName) {
      setFormError("Class name is required.");
      return null;
    }

    const duplicate = classes.some((item) => {
      const sameName = item.name.toLowerCase() === trimmedName.toLowerCase();
      const sameSession =
        !selectedSessionId ||
        !item.session_id ||
        String(item.session_id) === String(selectedSessionId);

      const sameClass =
        editingClass && String(item.id) === String(editingClass.id);

      return sameName && sameSession && !sameClass;
    });

    if (duplicate) {
      setFormError(`A class named "${trimmedName}" already exists.`);
      return null;
    }

    return trimmedName;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");
    clearMessages();

    const trimmedName = validateForm();

    if (!trimmedName) return;

    try {
      setIsSaving(true);

      const body = {
        class_name: trimmedName,
      };

      if (selectedSessionId) {
        body.session_id = selectedSessionId;
      }

      if (modalMode === "create") {
        await apiRequest("/classes", "POST", body);
        showSuccess("Class created successfully.");
      } else {
        await apiRequest(`/classes/${editingClass.class_id}`, "PUT", body);
        showSuccess("Class updated successfully.");
      }

      setIsModalOpen(false);
      setEditingClass(null);
      setClassName("");

      await loadClasses();
    } catch (err) {
      setFormError(err.message || "Failed to save class.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClass = async () => {
    if (!deleteConfirmClass) return;

    try {
      setIsSaving(true);
      clearMessages();

      await apiRequest(`/classes/${deleteConfirmClass.class_id}`, "DELETE");

      setDeleteConfirmClass(null);
      showSuccess("Class deleted successfully.");

      await loadClasses();
    } catch (err) {
      showError(err.message || "Failed to delete class.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-full bg-[#f8fafc] px-4 py-6 md:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600">
              <Layers className="h-4 w-4" />
              <span>Academic Setup</span>
            </div>

            <h1 className="mt-0.5 text-2xl font-black tracking-tight text-slate-900">
              Manage Classes
            </h1>

            <p className="text-xs font-medium text-slate-500">
              Create and manage academic classes for {sessionLabel}.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={loadClasses}
              disabled={isLoading || isSaving}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 shadow-sm transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-indigo-600/10 transition-all hover:bg-indigo-700 hover:shadow-indigo-600/20 active:scale-[0.98]"
            >
              <Plus size={14} />
              Create Class
            </button>
          </div>
        </header>

        {error && (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="rounded-xl bg-indigo-50 p-3.5 text-indigo-600">
              <GraduationCap className="h-6 w-6" />
            </div>

            <div>
              <span className="block text-[10px] font-black uppercase leading-tight tracking-widest text-slate-400">
                Total Classes
              </span>

              <span className="mt-1 block text-2xl font-black leading-none text-slate-900">
                {visibleClasses.length}
              </span>

              <span className="mt-0.5 block text-[10px] text-slate-400">
                Loaded from backend API
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="rounded-xl bg-emerald-50 p-3.5 text-emerald-600">
              <Hash className="h-6 w-6" />
            </div>

            <div>
              <span className="block text-[10px] font-black uppercase leading-tight tracking-widest text-slate-400">
                Selected Session
              </span>

              <span className="mt-1.5 block text-xl font-bold leading-none text-slate-800">
                {sessionLabel}
              </span>

              <span className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                Active Administrative Context
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <div className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="h-4 w-4" />
            </div>

            <input
              type="text"
              placeholder="Search classes by name..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 transition-all hover:border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="flex flex-col items-center">
              <div className="mb-3 h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
              <p className="text-sm font-semibold text-slate-500">
                Loading classes...
              </p>
            </div>
          </div>
        ) : visibleClasses.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {visibleClasses.map((classItem) => (
              <motion.div
                layout
                key={classItem.id}
                className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-indigo-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                      <GraduationCap className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="text-base font-bold tracking-tight text-slate-800">
                        {classItem.name}
                      </h3>

                      <p className="text-[10px] font-medium text-slate-400">
                        Class ID: {classItem.class_id}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4 border-t border-slate-100 bg-slate-50/70 px-5 py-3">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(classItem)}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition-colors hover:text-indigo-600"
                  >
                    <Edit2 className="h-3 w-3" />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteConfirmClass(classItem)}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 transition-colors hover:text-rose-600"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-slate-400">
              <GraduationCap className="h-7 w-7 text-indigo-500" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800">
                No classes found
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                No classes are available from the backend for your current search.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-indigo-700"
            >
              <Plus size={12} />
              Create Class
            </button>
          </div>
        )}

        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCloseModal}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-md"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 8 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                className="relative z-[101] w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-xl"
              >
                <div className="absolute right-4 top-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isSaving}
                    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mb-6 flex items-start gap-3">
                  <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
                    <GraduationCap className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold tracking-tight text-slate-900">
                      {modalMode === "create"
                        ? "Create Academic Class"
                        : "Edit Class"}
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {modalMode === "create"
                        ? `Define a new class for ${sessionLabel}.`
                        : "Update the class name."}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {formError && (
                    <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs font-semibold text-rose-600">
                      {formError}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Class Name
                    </label>

                    <input
                      type="text"
                      required
                      placeholder="e.g. Class 6"
                      value={className}
                      onChange={(event) => setClassName(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium text-slate-800 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                      autoFocus
                    />

                    <p className="text-[10px] leading-normal text-slate-400">
                      Use names like{" "}
                      <span className="rounded bg-slate-50 px-1 py-0.5 font-mono text-slate-500">
                        Class 10
                      </span>{" "}
                      or{" "}
                      <span className="rounded bg-slate-50 px-1 py-0.5 font-mono text-slate-500">
                        Grade 5
                      </span>
                      .
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      disabled={isSaving}
                      className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-indigo-600/10 transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <PlusCircle className="h-4 w-4" />
                      {isSaving
                        ? "Saving..."
                        : modalMode === "create"
                          ? "Create Class"
                          : "Save"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {deleteConfirmClass && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDeleteConfirmClass(null)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-md"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="relative z-[111] w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-xl"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 p-3 text-rose-600">
                  <AlertTriangle className="h-6 w-6" />
                </div>

                <h3 className="text-sm font-bold tracking-tight text-slate-900">
                  Delete Class
                </h3>

                <p className="mt-2 text-xs text-slate-500">
                  Are you sure you want to delete{" "}
                  <span className="font-bold text-slate-700">
                    {deleteConfirmClass.name}
                  </span>
                  ? Backend should block deletion if students, subjects, marks, or routines depend on this class.
                </p>

                <div className="mt-5 flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmClass(null)}
                    disabled={isSaving}
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Keep Class
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteClass}
                    disabled={isSaving}
                    className="flex-1 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-rose-600/10 transition-all hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}