"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Trash2,
  BookOpen,
  X,
  AlertTriangle,
  GraduationCap,
  Layers,
  CheckCircle,
  ChevronDown,
  BookMarked,
  RefreshCw,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { apiRequest } from "@/lib/api";
import { useSession } from "@/context/SessionContext";

const UNASSIGNED_TEACHER = "unassigned";

function toArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.classes)) return payload.classes;
  if (Array.isArray(payload?.subjects)) return payload.subjects;
  if (Array.isArray(payload?.teachers)) return payload.teachers;
  return [];
}

function apiId(id) {
  const numeric = Number(id);
  return Number.isNaN(numeric) ? id : numeric;
}

function normalizeClass(item) {
  return {
    id: String(item.class_id ?? item.id),
    name: item.class_name ?? item.name ?? `Class ${item.class_id ?? item.id}`,
  };
}

function normalizeSubject(item) {
  return {
    id: String(item.subject_id ?? item.id),
    name: item.subject_name ?? item.name ?? "Untitled Subject",
    code:
      item.subject_code ??
      item.code ??
      item.short_code ??
      `SUB-${item.subject_id ?? item.id}`,
  };
}

function normalizeTeacher(item) {
  return {
    id: String(item.teacher_id ?? item.id),
    name: item.name ?? item.teacher_name ?? "Unnamed Teacher",
    email: item.email ?? "",
  };
}

function normalizeClassSubject(item, classId) {
  const subject = normalizeSubject(item);

  return {
    id: String(
      item.class_subject_id ??
        item.mapping_id ??
        item.id ??
        `${classId}-${subject.id}`
    ),
    classId: String(item.class_id ?? classId),
    subjectId: subject.id,
    teacherId: item.teacher_id ? String(item.teacher_id) : UNASSIGNED_TEACHER,
    subject,
  };
}

export default function SubjectManagementPage() {
  const { selectedSession } = useSession();

  const sessionLabel =
    selectedSession?.session_label ||
    selectedSession?.label ||
    "Current Session";

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classSubjects, setClassSubjects] = useState([]);

  const [selectedClassId, setSelectedClassId] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isClassSubjectsLoading, setIsClassSubjectsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isAddMappingOpen, setIsAddMappingOpen] = useState(false);
  const [mappingSubjectId, setMappingSubjectId] = useState("");
  const [mappingTeacherId, setMappingTeacherId] = useState(UNASSIGNED_TEACHER);
  const [mappingError, setMappingError] = useState("");

  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectError, setSubjectError] = useState("");
  const [subjectSearch, setSubjectSearch] = useState("");

  const [deleteMappingConfirm, setDeleteMappingConfirm] = useState(null);
  const [deleteSubjectConfirm, setDeleteSubjectConfirm] = useState(null);

  const selectedClass = useMemo(() => {
    return classes.find((item) => item.id === selectedClassId);
  }, [classes, selectedClassId]);

  const mappedSubjectIds = useMemo(() => {
    return new Set(classSubjects.map((item) => item.subjectId));
  }, [classSubjects]);

  const filteredSubjects = useMemo(() => {
    const search = subjectSearch.trim().toLowerCase();

    if (!search) return subjects;

    return subjects.filter((subject) => {
      return (
        subject.name.toLowerCase().includes(search) ||
        subject.code.toLowerCase().includes(search)
      );
    });
  }, [subjects, subjectSearch]);

  const getTeacherName = useCallback(
    (teacherId) => {
      if (!teacherId || teacherId === UNASSIGNED_TEACHER) {
        return "Unassigned";
      }

      return teachers.find((teacher) => teacher.id === String(teacherId))?.name || "Unknown Teacher";
    },
    [teachers]
  );

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setError("");
  };

  const showError = (message) => {
    setError(message);
    setSuccess("");
  };

  const loadClassSubjects = useCallback(async (classId) => {
    if (!classId) {
      setClassSubjects([]);
      return;
    }

    try {
      setIsClassSubjectsLoading(true);
      setError("");

      const payload = await apiRequest(`/classes/${classId}/subjects`);
      const normalized = toArray(payload).map((item) =>
        normalizeClassSubject(item, classId)
      );

      setClassSubjects(normalized);
    } catch (err) {
      setClassSubjects([]);
      showError(err.message || "Failed to load class subjects.");
    } finally {
      setIsClassSubjectsLoading(false);
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const [classesPayload, subjectsPayload, teachersPayload] =
        await Promise.all([
          apiRequest("/classes"),
          apiRequest("/subjects"),
          apiRequest("/teachers"),
        ]);

      const normalizedClasses = toArray(classesPayload).map(normalizeClass);
      const normalizedSubjects = toArray(subjectsPayload).map(normalizeSubject);
      const normalizedTeachers = toArray(teachersPayload).map(normalizeTeacher);

      setClasses(normalizedClasses);
      setSubjects(normalizedSubjects);
      setTeachers(normalizedTeachers);

      if (normalizedClasses.length > 0) {
        setSelectedClassId((current) => current || normalizedClasses[0].id);
      }
    } catch (err) {
      showError(err.message || "Failed to load subject management data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (!selectedClassId && classes.length > 0) {
      setSelectedClassId(classes[0].id);
      return;
    }

    if (
      selectedClassId &&
      classes.length > 0 &&
      !classes.some((item) => item.id === selectedClassId)
    ) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  useEffect(() => {
    if (selectedClassId) {
      loadClassSubjects(selectedClassId);
    }
  }, [selectedClassId, loadClassSubjects]);

  const handleRefresh = async () => {
    await loadInitialData();
    if (selectedClassId) {
      await loadClassSubjects(selectedClassId);
    }
  };

  const handleOpenAddMapping = () => {
    clearMessages();

    if (!selectedClassId) {
      showError("Please select a class first.");
      return;
    }

    const firstAvailableSubject =
      subjects.find((subject) => !mappedSubjectIds.has(subject.id)) ||
      subjects[0];

    setMappingSubjectId(firstAvailableSubject?.id || "");
    setMappingTeacherId(UNASSIGNED_TEACHER);
    setMappingError("");
    setIsAddMappingOpen(true);
  };

  const handleCreateSubject = async () => {
    setSubjectError("");
    clearMessages();

    const trimmedName = subjectName.trim();
    const trimmedCode = subjectCode.trim().toUpperCase();

    if (!trimmedName || !trimmedCode) {
      setSubjectError("Subject name and subject code are required.");
      return;
    }

    const duplicateCode = subjects.some(
      (subject) => subject.code.toLowerCase() === trimmedCode.toLowerCase()
    );

    if (duplicateCode) {
      setSubjectError(`Subject code "${trimmedCode}" is already in use.`);
      return;
    }

    try {
      setIsSaving(true);

      const payload = await apiRequest("/subjects", "POST", {
        subject_name: trimmedName,
        subject_code: trimmedCode,
      });

      const createdSubject = payload?.subject
        ? normalizeSubject(payload.subject)
        : payload?.subject_id || payload?.id
          ? normalizeSubject(payload)
          : null;

      if (createdSubject) {
        setSubjects((current) => [...current, createdSubject]);
        setMappingSubjectId(createdSubject.id);
      } else {
        await loadInitialData();
      }

      setSubjectName("");
      setSubjectCode("");
      showSuccess("Subject created successfully.");
    } catch (err) {
      setSubjectError(err.message || "Failed to create subject.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSubject = async () => {
    if (!deleteSubjectConfirm) return;

    try {
      setIsSaving(true);
      clearMessages();

      await apiRequest(`/subjects/${deleteSubjectConfirm.id}`, "DELETE");

      setSubjects((current) =>
        current.filter((subject) => subject.id !== deleteSubjectConfirm.id)
      );

      setClassSubjects((current) =>
        current.filter((item) => item.subjectId !== deleteSubjectConfirm.id)
      );

      if (mappingSubjectId === deleteSubjectConfirm.id) {
        setMappingSubjectId("");
      }

      setDeleteSubjectConfirm(null);
      showSuccess("Subject deleted successfully.");
    } catch (err) {
      showError(err.message || "Failed to delete subject.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddMappingSubmit = async (event) => {
    event.preventDefault();

    setMappingError("");
    clearMessages();

    if (!selectedClassId) {
      setMappingError("Please select a class first.");
      return;
    }

    if (!mappingSubjectId) {
      setMappingError("Please select a subject.");
      return;
    }

    const isDuplicate = classSubjects.some(
      (item) => item.subjectId === mappingSubjectId
    );

    if (isDuplicate) {
      const subjectName =
        subjects.find((subject) => subject.id === mappingSubjectId)?.name ||
        "This subject";

      setMappingError(`${subjectName} is already assigned to this class.`);
      return;
    }

    try {
      setIsSaving(true);

      await apiRequest(`/classes/${selectedClassId}/subjects`, "POST", {
        subject_id: apiId(mappingSubjectId),
        teacher_id:
          mappingTeacherId === UNASSIGNED_TEACHER
            ? null
            : apiId(mappingTeacherId),
      });

      await loadClassSubjects(selectedClassId);

      setIsAddMappingOpen(false);
      showSuccess("Subject assigned to class successfully.");
    } catch (err) {
      setMappingError(err.message || "Failed to assign subject.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateTeacher = async (subjectId, teacherId) => {
    const previous = classSubjects;

    setClassSubjects((current) =>
      current.map((item) =>
        item.subjectId === subjectId ? { ...item, teacherId } : item
      )
    );

    try {
      clearMessages();

      await apiRequest(
        `/classes/${selectedClassId}/subjects/${subjectId}/teacher`,
        "PUT",
        {
          teacher_id:
            teacherId === UNASSIGNED_TEACHER ? null : apiId(teacherId),
        }
      );

      showSuccess("Teacher assignment updated.");
    } catch (err) {
      setClassSubjects(previous);
      showError(err.message || "Failed to update teacher assignment.");
    }
  };

  const handleDeleteMapping = async () => {
    if (!deleteMappingConfirm || !selectedClassId) return;

    try {
      setIsSaving(true);
      clearMessages();

      await apiRequest(
        `/classes/${selectedClassId}/subjects/${deleteMappingConfirm.subjectId}`,
        "DELETE"
      );

      setClassSubjects((current) =>
        current.filter(
          (item) => item.subjectId !== deleteMappingConfirm.subjectId
        )
      );

      setDeleteMappingConfirm(null);
      showSuccess("Subject mapping removed successfully.");
    } catch (err) {
      showError(err.message || "Failed to remove subject mapping.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-full bg-[#f8fafc] px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600">
              <BookOpen className="h-4 w-4" />
              <span>Academic Setup</span>
            </div>

            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
              Manage Subjects
            </h1>

            <p className="mt-1 text-xs font-medium text-slate-500">
              Create academic subjects, assign them to classes, and connect teachers.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading || isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-600 shadow-sm transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <BookMarked className="h-5 w-5" />
            </div>

            <div>
              <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                Total Subjects
              </span>
              <span className="mt-1 block text-xl font-black text-slate-900">
                {subjects.length}
              </span>
              <span className="mt-0.5 block text-[10px] text-slate-400">
                Academic subject directory
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <CheckCircle className="h-5 w-5" />
            </div>

            <div>
              <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                Selected Class Mappings
              </span>
              <span className="mt-1 block text-xl font-black text-slate-900">
                {classSubjects.length}
              </span>
              <span className="mt-0.5 block text-[10px] text-slate-400">
                Subjects assigned to selected class
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Users className="h-5 w-5" />
            </div>

            <div>
              <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                Teachers Loaded
              </span>
              <span className="mt-1 block text-xl font-black text-slate-900">
                {teachers.length}
              </span>
              <span className="mt-0.5 block text-[10px] text-indigo-600">
                Session: {sessionLabel}
              </span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-slate-200 bg-white">
            <div className="flex flex-col items-center">
              <div className="mb-3 h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
              <p className="text-sm font-semibold text-slate-500">
                Loading subject management data...
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h2 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-800">
                  <Layers className="h-3.5 w-3.5 text-indigo-500" />
                  Select Class
                </h2>

                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500">
                  {classes.length} Classes
                </span>
              </div>

              {classes.length > 0 ? (
                <div className="max-h-[420px] space-y-1.5 overflow-y-auto pr-1">
                  {classes.map((classItem) => (
                    <button
                      key={classItem.id}
                      type="button"
                      onClick={() => setSelectedClassId(classItem.id)}
                      className={`flex w-full cursor-pointer items-center justify-between rounded-xl border p-3 text-left transition-all ${
                        selectedClassId === classItem.id
                          ? "border-indigo-200 bg-indigo-50 text-indigo-900 shadow-sm"
                          : "border-slate-100 text-slate-700 hover:border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`rounded-lg p-1.5 ${
                            selectedClassId === classItem.id
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <GraduationCap className="h-4 w-4" />
                        </div>

                        <div>
                          <span className="text-xs font-bold">
                            {classItem.name}
                          </span>
                          <span className="mt-0.5 block text-[9px] text-slate-400">
                            ID: {classItem.id}
                          </span>
                        </div>
                      </div>

                      {selectedClassId === classItem.id && (
                        <span className="rounded-md bg-indigo-200/50 px-2 py-0.5 text-[10px] font-bold text-indigo-800">
                          Active
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 py-10 text-center text-slate-400">
                  <GraduationCap className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="text-xs font-semibold text-slate-500">
                    No classes found.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4 lg:col-span-8">
              <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
                <div>
                  <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    Mapping Hub
                  </span>

                  <h2 className="mt-1.5 text-lg font-black tracking-tight text-slate-800">
                    {selectedClass
                      ? `Subjects assigned to ${selectedClass.name}`
                      : "No Class Selected"}
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Define which subjects are studied by this class and assign teachers.
                  </p>
                </div>

                {selectedClass && (
                  <button
                    type="button"
                    onClick={handleOpenAddMapping}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-indigo-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Subject
                  </button>
                )}
              </div>

              {isClassSubjectsLoading ? (
                <div className="flex min-h-[250px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
                  <div className="flex flex-col items-center">
                    <div className="mb-3 h-9 w-9 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                    <p className="text-xs font-semibold text-slate-500">
                      Loading assigned subjects...
                    </p>
                  </div>
                </div>
              ) : selectedClassId ? (
                classSubjects.length > 0 ? (
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="divide-y divide-slate-100">
                      {classSubjects.map((mapping) => (
                        <div
                          key={mapping.id}
                          className="flex flex-col justify-between gap-4 p-4 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:p-5"
                        >
                          <div className="flex items-start gap-3">
                            <div className="shrink-0 rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                              <BookOpen className="h-4 w-4" />
                            </div>

                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-bold text-slate-800">
                                  {mapping.subject.name}
                                </span>

                                <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-slate-500">
                                  {mapping.subject.code}
                                </span>
                              </div>

                              <p className="mt-0.5 text-[10px] text-slate-400">
                                Teacher: {getTeacherName(mapping.teacherId)}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-start gap-3.5 sm:flex-row sm:items-center">
                            <div className="w-full space-y-1 sm:w-[230px]">
                              <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400">
                                Assigned Teacher
                              </label>

                              <div className="relative">
                                <select
                                  value={mapping.teacherId}
                                  onChange={(event) =>
                                    handleUpdateTeacher(
                                      mapping.subjectId,
                                      event.target.value
                                    )
                                  }
                                  className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-bold text-slate-700 transition-all hover:border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                                >
                                  <option value={UNASSIGNED_TEACHER}>
                                    Choose Teacher Later
                                  </option>

                                  {teachers.map((teacher) => (
                                    <option key={teacher.id} value={teacher.id}>
                                      {teacher.name}
                                    </option>
                                  ))}
                                </select>

                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                                  <ChevronDown className="h-3.5 w-3.5" />
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setDeleteMappingConfirm({
                                  subjectId: mapping.subjectId,
                                  subjectName: mapping.subject.name,
                                })
                              }
                              className="rounded-xl border border-slate-100 bg-slate-50 p-2 text-slate-400 transition-all hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600"
                              title="Remove subject assignment"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-12 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-500">
                      <BookMarked className="h-6 w-6" />
                    </div>

                    <div className="mx-auto max-w-md">
                      <h3 className="text-sm font-bold text-slate-800">
                        No assigned subjects
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        There are no subjects assigned to {selectedClass?.name} yet.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenAddMapping}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-indigo-700"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Assign First Subject
                    </button>
                  </div>
                )
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                  <p className="text-sm font-medium text-slate-500">
                    Please select a class first.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <AnimatePresence>
          {isAddMappingOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAddMappingOpen(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-md"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 8 }}
                className="relative z-[101] flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl md:flex-row"
              >
                <div className="absolute right-4 top-4 z-10">
                  <button
                    type="button"
                    onClick={() => setIsAddMappingOpen(false)}
                    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex-1 space-y-6 border-b border-slate-100 p-6 md:border-b-0 md:border-r md:p-8">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-indigo-50 p-2.5 text-indigo-600">
                      <Layers className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="text-base font-black tracking-tight text-slate-900">
                        Assign Subject to Class
                      </h3>

                      <p className="mt-0.5 text-xs text-slate-400">
                        Map an academic subject to {selectedClass?.name}.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleAddMappingSubmit} className="space-y-4">
                    {mappingError && (
                      <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs font-semibold text-rose-600">
                        {mappingError}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Select Subject
                      </label>

                      <div className="relative">
                        <select
                          value={mappingSubjectId}
                          onChange={(event) =>
                            setMappingSubjectId(event.target.value)
                          }
                          className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3.5 pr-10 text-xs font-bold text-slate-700 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                        >
                          {subjects.length > 0 ? (
                            subjects.map((subject) => (
                              <option key={subject.id} value={subject.id}>
                                {subject.name} ({subject.code})
                              </option>
                            ))
                          ) : (
                            <option value="">No subjects found</option>
                          )}
                        </select>

                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Assigned Teacher
                      </label>

                      <div className="relative">
                        <select
                          value={mappingTeacherId}
                          onChange={(event) =>
                            setMappingTeacherId(event.target.value)
                          }
                          className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3.5 pr-10 text-xs font-bold text-slate-700 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                        >
                          <option value={UNASSIGNED_TEACHER}>
                            Choose Teacher Later
                          </option>

                          {teachers.map((teacher) => (
                            <option key={teacher.id} value={teacher.id}>
                              {teacher.name}
                            </option>
                          ))}
                        </select>

                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsAddMappingOpen(false)}
                        className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 transition-all hover:bg-slate-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={isSaving || subjects.length === 0}
                        className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-indigo-600/10 transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isSaving ? "Saving..." : "Assign Subject"}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="flex flex-1 flex-col justify-between space-y-6 bg-slate-50/50 p-6 md:p-8">
                  <div>
                    <div className="mb-4 flex items-start gap-3">
                      <div className="rounded-2xl bg-emerald-50 p-2.5 text-emerald-600">
                        <BookOpen className="h-5 w-5" />
                      </div>

                      <div>
                        <h3 className="text-base font-black tracking-tight text-slate-900">
                          Create & Manage Directory
                        </h3>

                        <p className="mt-0.5 text-xs text-slate-400">
                          Define new academic subjects or delete old ones.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <h4 className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-indigo-600">
                        <Plus className="h-3 w-3" />
                        New Subject
                      </h4>

                      {subjectError && (
                        <div className="rounded-lg border border-rose-100 bg-rose-50 p-2 text-[11px] font-semibold text-rose-500">
                          {subjectError}
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-400">
                            Subject Name
                          </label>

                          <input
                            type="text"
                            placeholder="e.g. Physics"
                            value={subjectName}
                            onChange={(event) =>
                              setSubjectName(event.target.value)
                            }
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-400">
                            Subject Code
                          </label>

                          <input
                            type="text"
                            placeholder="e.g. PHY-201"
                            value={subjectCode}
                            onChange={(event) =>
                              setSubjectCode(event.target.value)
                            }
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-xs font-medium uppercase text-slate-800 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleCreateSubject}
                        disabled={isSaving}
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Create Subject
                      </button>
                    </div>
                  </div>

                  <div className="flex max-h-[230px] min-h-[190px] flex-1 flex-col space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Available Subjects ({subjects.length})
                      </span>

                      <div className="relative w-36">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 text-slate-400">
                          <Search className="h-3 w-3" />
                        </div>

                        <input
                          type="text"
                          placeholder="Search..."
                          value={subjectSearch}
                          onChange={(event) =>
                            setSubjectSearch(event.target.value)
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white py-1 pl-6 pr-2 text-[10px] font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
                        />
                      </div>
                    </div>

                    <div className="min-h-0 flex-1 divide-y divide-slate-50 overflow-y-auto rounded-2xl border border-slate-200 bg-white">
                      {filteredSubjects.length > 0 ? (
                        filteredSubjects.map((subject) => {
                          const isSelected = mappingSubjectId === subject.id;
                          const isMapped = mappedSubjectIds.has(subject.id);

                          return (
                            <div
                              key={subject.id}
                              onClick={() => setMappingSubjectId(subject.id)}
                              className={`flex cursor-pointer items-center justify-between gap-2 px-3 py-2 transition-all ${
                                isSelected
                                  ? "border-l-2 border-indigo-500 bg-indigo-50/70"
                                  : "hover:bg-slate-50"
                              }`}
                            >
                              <div className="min-w-0">
                                <span className="block truncate text-xs font-bold text-slate-800">
                                  {subject.name}
                                </span>

                                <span className="font-mono text-[9px] font-bold uppercase text-slate-400">
                                  {subject.code}
                                </span>

                                {isMapped && (
                                  <span className="ml-2 rounded bg-emerald-50 px-1.5 py-0.5 text-[8px] font-black uppercase text-emerald-600">
                                    Mapped
                                  </span>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setDeleteSubjectConfirm(subject);
                                }}
                                className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-500"
                                title="Delete subject"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-8 text-center text-xs font-semibold text-slate-400">
                          No subjects found.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {deleteMappingConfirm && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDeleteMappingConfirm(null)}
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
                  Remove Subject Assignment
                </h3>

                <p className="mt-2 text-xs text-slate-500">
                  Remove "{deleteMappingConfirm.subjectName}" from {selectedClass?.name}?
                </p>

                <div className="mt-5 flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDeleteMappingConfirm(null)}
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 transition-all hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteMapping}
                    disabled={isSaving}
                    className="flex-1 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-rose-600/10 transition-all hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {deleteSubjectConfirm && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDeleteSubjectConfirm(null)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-md"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="relative z-[121] w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-xl"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 p-3 text-rose-600">
                  <AlertTriangle className="h-6 w-6" />
                </div>

                <h3 className="text-sm font-bold tracking-tight text-slate-900">
                  Delete Subject
                </h3>

                <p className="mt-2 text-xs text-slate-500">
                  Delete "{deleteSubjectConfirm.name}" permanently? This should only be allowed by backend if the subject is not used in marks, routines, or class mappings.
                </p>

                <div className="mt-5 flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDeleteSubjectConfirm(null)}
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 transition-all hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteSubject}
                    disabled={isSaving}
                    className="flex-1 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-rose-600/10 transition-all hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Delete
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