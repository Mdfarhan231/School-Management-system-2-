"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  Layers,
  X,
  AlertTriangle,
  GraduationCap,
  Users,
  ChevronDown,
  BookOpen,
  Sliders,
  CheckCircle,
  PlusCircle,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { apiRequest } from "@/lib/api";
import { useSession } from "@/context/SessionContext";

const UNASSIGNED_TEACHER = "unassigned";

function toArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.classes)) return payload.classes;
  if (Array.isArray(payload?.teachers)) return payload.teachers;
  if (Array.isArray(payload?.sections)) return payload.sections;
  if (Array.isArray(payload?.subjects)) return payload.subjects;
  return [];
}

function apiId(value) {
  if (!value || value === UNASSIGNED_TEACHER) return null;
  const numeric = Number(value);
  return Number.isNaN(numeric) ? value : numeric;
}

function normalizeClass(item) {
  return {
    id: String(item.class_id ?? item.id),
    class_id: item.class_id ?? item.id,
    name: item.class_name ?? item.name ?? `Class ${item.class_id ?? item.id}`,
  };
}

function normalizeTeacher(item) {
  return {
    id: String(item.teacher_id ?? item.id),
    teacher_id: item.teacher_id ?? item.id,
    name: item.name ?? item.teacher_name ?? "Unnamed Teacher",
    email: item.email ?? "",
  };
}

function normalizeSection(item) {
  const subjectTeachers = {};

  if (Array.isArray(item.subject_teachers)) {
    item.subject_teachers.forEach((mapping) => {
      const subjectId = mapping.subject_id ?? mapping.subjectId;
      const teacherId = mapping.teacher_id ?? mapping.teacherId;

      if (subjectId) {
        subjectTeachers[String(subjectId)] = teacherId
          ? String(teacherId)
          : UNASSIGNED_TEACHER;
      }
    });
  } else if (item.subject_teachers && typeof item.subject_teachers === "object") {
    Object.entries(item.subject_teachers).forEach(([subjectId, teacherId]) => {
      subjectTeachers[String(subjectId)] = teacherId
        ? String(teacherId)
        : UNASSIGNED_TEACHER;
    });
  }

  return {
    id: String(item.section_id ?? item.id),
    section_id: item.section_id ?? item.id,
    classId: String(item.class_id ?? item.classId),
    class_id: item.class_id ?? item.classId,
    name: item.section_name ?? item.name ?? item.section ?? "",
    section_name: item.section_name ?? item.name ?? item.section ?? "",
    studentLimit: Number(item.student_limit ?? item.studentLimit ?? 40),
    student_limit: Number(item.student_limit ?? item.studentLimit ?? 40),
    className: item.class_name ?? item.className ?? "",
    subjectTeachers,
  };
}

function normalizeClassSubject(item) {
  const availableTeachers = Array.isArray(item.available_teachers)
    ? item.available_teachers.map((teacher) => ({
        id: String(teacher.teacher_id ?? teacher.id),
        teacher_id: teacher.teacher_id ?? teacher.id,
        name: teacher.name ?? teacher.teacher_name ?? "Unnamed Teacher",
        email: teacher.email ?? "",
      }))
    : [];

  return {
    id: String(item.class_subject_id ?? item.id ?? `${item.class_id}-${item.subject_id}`),
    classSubjectId: item.class_subject_id ?? item.id,
    classId: String(item.class_id ?? item.classId),
    subjectId: String(item.subject_id ?? item.subjectId),
    subjectName:
      item.subject_name ??
      item.subject?.subject_name ??
      item.subject?.name ??
      "Unknown Subject",
    subjectCode:
      item.subject_code ??
      item.subject?.subject_code ??
      item.subject?.code ??
      "",
    teacherId: item.teacher_id ? String(item.teacher_id) : UNASSIGNED_TEACHER,
    teacherName: item.teacher_name ?? "",
    teacherLabel:
      item.teacher_label ??
      (item.teacher_id ? item.teacher_name : "No teacher assigned yet"),
    teacherStatus:
      item.teacher_status ??
      (item.teacher_id ? "assigned" : "not_assigned"),
    availableTeachers,
  };
}

export default function ManageSectionsPage() {
  const { selectedSession, selectedSessionId } = useSession();

  const sessionLabel =
    selectedSession?.session_label ||
    selectedSession?.label ||
    selectedSession?.name ||
    "Current Session";

const [sections, setSections] = useState([]);
const [classes, setClasses] = useState([]);
const [teachers, setTeachers] = useState([]);
const [classSubjects, setClassSubjects] = useState([]);
const [classSubjectsByClass, setClassSubjectsByClass] = useState({});

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState("all");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubjectsLoading, setIsSubjectsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingSection, setEditingSection] = useState(null);

  const [formClassId, setFormClassId] = useState("");
  const [formName, setFormName] = useState("");
  const [formStudentLimit, setFormStudentLimit] = useState(40);
  const [formSubjectTeachers, setFormSubjectTeachers] = useState({});
  const [formError, setFormError] = useState("");

  const [deleteConfirmSection, setDeleteConfirmSection] = useState(null);

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

  const getClassName = useCallback(
    (classId) => {
      return classes.find((item) => item.id === String(classId))?.name || "Unknown Class";
    },
    [classes]
  );

  const getTeacherName = useCallback(
    (teacherId) => {
      if (!teacherId || teacherId === UNASSIGNED_TEACHER) return "Unassigned";
      return teachers.find((item) => item.id === String(teacherId))?.name || "Unknown Teacher";
    },
    [teachers]
  );

const loadClassSubjects = useCallback(async (classId) => {
  if (!classId) {
    setClassSubjects([]);
    setFormSubjectTeachers({});
    return;
  }

  try {
    setIsSubjectsLoading(true);

    const payload = await apiRequest(`/classes/${classId}/subjects`);
    const normalized = toArray(payload).map(normalizeClassSubject);

    setClassSubjects(normalized);

    setClassSubjectsByClass((current) => ({
      ...current,
      [String(classId)]: normalized,
    }));

    setFormSubjectTeachers((current) => {
      const next = {};

      normalized.forEach((mapping) => {
        next[mapping.subjectId] =
          current[mapping.subjectId] ||
          mapping.teacherId ||
          UNASSIGNED_TEACHER;
      });

      return next;
    });
  } catch (err) {
    setClassSubjects([]);
    showError(err.message || "Failed to load class subjects.");
  } finally {
    setIsSubjectsLoading(false);
  }
}, []);

  const loadClassSubjectsForClasses = useCallback(async (classList) => {
  const entries = await Promise.all(
    classList.map(async (classItem) => {
      try {
        const payload = await apiRequest(`/classes/${classItem.id}/subjects`);
        const normalized = toArray(payload).map(normalizeClassSubject);

        return [classItem.id, normalized];
      } catch {
        return [classItem.id, []];
      }
    })
  );

  setClassSubjectsByClass(Object.fromEntries(entries));
}, []);

  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      clearMessages();

      const [classesPayload, teachersPayload, sectionsPayload] =
        await Promise.all([
          apiRequest("/classes"),
          apiRequest("/teachers"),
          apiRequest("/sections"),
        ]);

      const normalizedClasses = toArray(classesPayload).map(normalizeClass);
      const normalizedTeachers = toArray(teachersPayload).map(normalizeTeacher);
      const normalizedSections = toArray(sectionsPayload).map(normalizeSection);

      setClasses(normalizedClasses);
      setTeachers(normalizedTeachers);
      setSections(normalizedSections);

      await loadClassSubjectsForClasses(normalizedClasses);
    } catch (err) {
      showError(err.message || "Failed to load section management data.");
    } finally {
      setIsLoading(false);
    }
  }, [loadClassSubjectsForClasses]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (isModalOpen && formClassId) {
      loadClassSubjects(formClassId);
    }
  }, [isModalOpen, formClassId, loadClassSubjects]);

  const filteredSections = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();

    return sections.filter((section) => {
      const parentClassName = getClassName(section.classId);

      const matchesSearch =
        !search ||
        section.name.toLowerCase().includes(search) ||
        parentClassName.toLowerCase().includes(search);

      const matchesClass =
        selectedClassFilter === "all" ||
        section.classId === selectedClassFilter;

      return matchesSearch && matchesClass;
    });
  }, [sections, searchQuery, selectedClassFilter, getClassName]);

  const averageCapacity = useMemo(() => {
    if (filteredSections.length === 0) return 0;

    const total = filteredSections.reduce(
      (sum, section) => sum + Number(section.studentLimit || 0),
      0
    );

    return Math.round(total / filteredSections.length);
  }, [filteredSections]);

  const handleRefresh = async () => {
    await loadInitialData();

    if (formClassId) {
      await loadClassSubjects(formClassId);
    }
  };

  const handleOpenCreate = () => {
    clearMessages();
    setFormError("");
    setModalMode("create");
    setEditingSection(null);
    setFormName("");
    setFormStudentLimit(40);
    setFormSubjectTeachers({});

    const firstClassId = classes[0]?.id || "";
    setFormClassId(firstClassId);

    setIsModalOpen(true);
  };

  const handleOpenEdit = (section) => {
    clearMessages();
    setFormError("");
    setModalMode("edit");
    setEditingSection(section);
    setFormClassId(section.classId);
    setFormName(section.name);
    setFormStudentLimit(section.studentLimit || 40);
    setFormSubjectTeachers(section.subjectTeachers || {});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSaving) return;

    setIsModalOpen(false);
    setEditingSection(null);
    setFormClassId("");
    setFormName("");
    setFormStudentLimit(40);
    setFormSubjectTeachers({});
    setFormError("");
    setClassSubjects([]);
  };

  const validateForm = () => {
    const trimmedName = formName.trim().toUpperCase();

    if (!formClassId) {
      setFormError("Please select a parent class.");
      return null;
    }

    if (!trimmedName) {
      setFormError("Section name is required.");
      return null;
    }

    if (Number(formStudentLimit) < 1) {
      setFormError("Student limit must be at least 1.");
      return null;
    }

    const duplicate = sections.some((section) => {
      const sameClass = section.classId === String(formClassId);
      const sameName = section.name.toLowerCase() === trimmedName.toLowerCase();
      const sameSection =
        editingSection && String(section.id) === String(editingSection.id);

      return sameClass && sameName && !sameSection;
    });

    if (duplicate) {
      setFormError(
        `Section "${trimmedName}" already exists for ${getClassName(formClassId)}.`
      );
      return null;
    }

    return trimmedName;
  };

  const buildSubjectTeachersPayload = () => {
    return Object.entries(formSubjectTeachers).map(([subjectId, teacherId]) => ({
      subject_id: apiId(subjectId),
      teacher_id: apiId(teacherId),
    }));
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
        class_id: apiId(formClassId),
        section_name: trimmedName,
        student_limit: Number(formStudentLimit),
        subject_teachers: buildSubjectTeachersPayload(),
      };

      if (selectedSessionId) {
        body.session_id = selectedSessionId;
      }

      if (modalMode === "create") {
        await apiRequest("/sections", "POST", body);
        showSuccess("Section created successfully.");
      } else {
        await apiRequest(`/sections/${editingSection.section_id}`, "PUT", body);
        showSuccess("Section updated successfully.");
      }

      handleCloseModal();
      await loadInitialData();
    } catch (err) {
      setFormError(err.message || "Failed to save section.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSection = async () => {
    if (!deleteConfirmSection) return;

    try {
      setIsSaving(true);
      clearMessages();

      await apiRequest(`/sections/${deleteConfirmSection.section_id}`, "DELETE");

      setDeleteConfirmSection(null);
      showSuccess("Section deleted successfully.");
      await loadInitialData();
    } catch (err) {
      showError(err.message || "Failed to delete section.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-full bg-[#f8fafc] px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600">
              <Layers className="h-4 w-4" />
              <span>Academic Infrastructure</span>
            </div>

            <h1 className="mt-0.5 text-2xl font-black tracking-tight text-slate-900">
              Manage Sections
            </h1>

            <p className="text-xs font-medium text-slate-500">
              Create sections for classes, set student capacity, and assign section-wise subject teachers.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading || isSaving}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 shadow-sm transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>

            <button
              type="button"
              onClick={handleOpenCreate}
              disabled={classes.length === 0}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-indigo-600/10 transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={14} />
              New Section
            </button>
          </div>
        </header>

        {classes.length === 0 && !isLoading && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-amber-800">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <span>No classes have been defined yet.</span>
              <p className="mt-1 font-medium text-slate-500">
                Please create a class in Manage Classes before creating sections.
              </p>
            </div>
          </div>
        )}

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
            <div className="rounded-xl bg-indigo-50 p-3.5 text-indigo-600">
              <Layers className="h-6 w-6" />
            </div>

            <div>
              <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                Active Sections
              </span>
              <span className="mt-1 block text-2xl font-black text-slate-900">
                {filteredSections.length}
              </span>
              <span className="mt-0.5 block text-[10px] text-slate-400">
                Session: {sessionLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="rounded-xl bg-emerald-50 p-3.5 text-emerald-600">
              <Users className="h-6 w-6" />
            </div>

            <div>
              <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                Average Capacity
              </span>
              <span className="mt-1 block text-2xl font-black text-slate-900">
                {averageCapacity}
                <span className="text-xs text-slate-400"> Students</span>
              </span>
              <span className="mt-0.5 block text-[10px] text-slate-400">
                Per section threshold
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="rounded-xl bg-violet-50 p-3.5 text-violet-600">
              <GraduationCap className="h-6 w-6" />
            </div>

            <div>
              <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                Classes Loaded
              </span>
              <span className="mt-1 block text-2xl font-black text-slate-900">
                {classes.length}
              </span>
              <span className="mt-0.5 block text-[10px] text-slate-400">
                Available classes to map
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row">
          <div className="relative w-full md:flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Search className="h-4 w-4" />
            </div>

            <input
              type="text"
              placeholder="Search sections or parent classes..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 transition-all hover:border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
            />
          </div>

          <div className="flex w-full items-center gap-2 md:w-64">
            <span className="shrink-0 text-xs font-black uppercase tracking-wider text-slate-400">
              Class:
            </span>

            <div className="relative w-full">
              <select
                value={selectedClassFilter}
                onChange={(event) => setSelectedClassFilter(event.target.value)}
                className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3.5 pr-10 text-xs font-bold text-slate-700 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
              >
                <option value="all">All Classes</option>
                {classes.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </option>
                ))}
              </select>

              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="flex flex-col items-center">
              <div className="mb-3 h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
              <p className="text-sm font-semibold text-slate-500">
                Loading sections...
              </p>
            </div>
          </div>
        ) : filteredSections.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSections.map((section) => (
              <motion.div
                layout
                key={section.id}
                className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-indigo-200 hover:shadow-lg"
              >
                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                        <Layers className="h-5 w-5" />
                      </div>

                      <div>
                        <h2 className="text-base font-black leading-tight text-slate-900">
                          Section {section.name}
                        </h2>

                        <span className="mt-0.5 block text-xs font-bold uppercase tracking-wider text-slate-400">
                          {getClassName(section.classId)}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-lg bg-slate-100 px-2.5 py-1 text-right">
                      <span className="block text-[8px] font-black uppercase text-slate-400">
                        Student Limit
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-700">
                        {section.studentLimit}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <h3 className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
                      <BookOpen className="h-3 w-3 text-indigo-500" />
                      Subject Teacher Overrides
                    </h3>

                 {(() => {
  const subjectsForClass = classSubjectsByClass[section.classId] || [];
  const noTeacherCount = subjectsForClass.filter(
    (mapping) => mapping.teacherId === UNASSIGNED_TEACHER
  ).length;

  if (subjectsForClass.length === 0) {
    return (
      <div className="py-4 text-center text-[11px] font-bold text-slate-400">
        Create subject first.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {noTeacherCount > 0 && (
        <div className="rounded-lg border border-amber-100 bg-amber-50 px-2.5 py-2 text-[10px] font-bold text-amber-700">
          {noTeacherCount} subject{noTeacherCount > 1 ? "s" : ""} have no teacher assigned yet.
        </div>
      )}

      <div className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
        {subjectsForClass.map((mapping) => {
          const sectionTeacherId = section.subjectTeachers?.[mapping.subjectId];

          const effectiveTeacherId =
            sectionTeacherId && sectionTeacherId !== UNASSIGNED_TEACHER
              ? sectionTeacherId
              : mapping.teacherId;

          const hasTeacher =
            effectiveTeacherId && effectiveTeacherId !== UNASSIGNED_TEACHER;

          return (
            <div
              key={mapping.subjectId}
              className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2 py-1.5 text-xs"
            >
              <span className="truncate text-[11px] font-bold text-slate-700">
                {mapping.subjectName}
              </span>

              <span
                className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold ${
                  hasTeacher
                    ? "bg-indigo-50 text-indigo-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {hasTeacher
                  ? getTeacherName(effectiveTeacherId)
                  : "No teacher assigned yet"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
})()}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4 border-t border-slate-100 bg-slate-50/70 px-5 py-3">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(section)}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition-colors hover:text-indigo-600"
                  >
                    <Edit2 className="h-3 w-3" />
                    Edit Section
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteConfirmSection(section)}
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
              <Layers className="h-7 w-7 text-indigo-500" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800">
                No sections found
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                No sections are available from the backend for your current filter.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenCreate}
              disabled={classes.length === 0}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={12} />
              New Section
            </button>
          </div>
        )}

        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4">
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
                className="relative z-[101] flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl md:flex-row"
              >
                <div className="absolute right-4 top-4 z-10">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isSaving}
                    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
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
                      <h2 className="text-base font-black tracking-tight text-slate-900">
                        {modalMode === "create"
                          ? "Create Section"
                          : "Edit Section"}
                      </h2>

                      <p className="mt-0.5 text-xs text-slate-400">
                        Define a section, set capacity, and bind teachers.
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
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Parent Class
                      </label>

                      <div className="relative">
                        <select
                          value={formClassId}
                          onChange={(event) => {
                            setFormClassId(event.target.value);
                            setFormSubjectTeachers({});
                          }}
                          disabled={modalMode === "edit"}
                          className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3.5 pr-10 text-xs font-bold text-slate-700 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                        >
                          {classes.map((classItem) => (
                            <option key={classItem.id} value={classItem.id}>
                              {classItem.name}
                            </option>
                          ))}
                        </select>

                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </div>

                      {modalMode === "edit" && (
                        <p className="text-[9px] text-slate-400">
                          Parent class cannot be reassigned after creation.
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Section Name
                      </label>

                      <input
                        type="text"
                        required
                        placeholder="e.g. A, B, Gold, Lotus"
                        value={formName}
                        onChange={(event) => setFormName(event.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-300 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Student Limit Capacity
                      </label>

                      <input
                        type="number"
                        required
                        min={1}
                        max={200}
                        value={formStudentLimit}
                        onChange={(event) =>
                          setFormStudentLimit(Number(event.target.value) || 0)
                        }
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                      />

                      <p className="text-[10px] text-slate-400">
                        Limits the maximum students allowed in this section.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        disabled={isSaving}
                        className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={isSaving}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-indigo-600/10 transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <PlusCircle className="h-4 w-4" />
                        {isSaving
                          ? "Saving..."
                          : modalMode === "create"
                            ? "Create Section"
                            : "Save Section"}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="flex flex-1 flex-col justify-between space-y-6 bg-slate-50/50 p-6 md:p-8">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-emerald-50 p-2.5 text-emerald-600">
                        <BookOpen className="h-5 w-5" />
                      </div>

                      <div>
                        <h2 className="text-base font-black tracking-tight text-slate-900">
                          Subject Teachers Mapping
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-400">
                          Assign or override the teacher for each subject in this section.
                        </p>
                      </div>
                    </div>

                    <div className="max-h-[320px] space-y-3.5 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <h3 className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-indigo-600">
                        <Sliders className="h-3 w-3" />
                        Class Subjects
                      </h3>

                      {isSubjectsLoading ? (
                        <div className="py-8 text-center text-xs font-semibold text-slate-400">
                          Loading subjects...
                        </div>
                      ) : formClassId && classSubjects.length > 0 ? (
                        <div className="space-y-4 divide-y divide-slate-100">
                          {classSubjects.map((mapping, index) => (
                            <div
                              key={mapping.id}
                              className={`${index > 0 ? "pt-3.5" : ""} space-y-2`}
                            >
                              <div>
                                <span className="block text-xs font-extrabold text-slate-800">
                                  {mapping.subjectName}
                                </span>

                                <span className="block font-mono text-[9px] font-bold uppercase text-slate-400">
                                  {mapping.subjectCode || `SUB-${mapping.subjectId}`} •{" "}
                                  {mapping.teacherId === UNASSIGNED_TEACHER
                                    ? "No teacher assigned yet"
                                    : `Assigned Teacher: ${mapping.teacherName || getTeacherName(mapping.teacherId)}`}
                                </span>
                              </div>

                              <div className="relative">
                                <select
                                  value={
                                    formSubjectTeachers[mapping.subjectId] ||
                                    mapping.teacherId ||
                                    UNASSIGNED_TEACHER
                                  }
                                  disabled={mapping.teacherId === UNASSIGNED_TEACHER}
                                  onChange={(event) => {
                                    setFormSubjectTeachers((current) => ({
                                      ...current,
                                      [mapping.subjectId]: event.target.value,
                                    }));
                                  }}
                                  className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3.5 pr-10 text-[11px] font-bold text-slate-700 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                                >
                                  {mapping.teacherId === UNASSIGNED_TEACHER ? (
                                    <option value={UNASSIGNED_TEACHER}>
                                      No teacher available right now
                                    </option>
                                  ) : (
                                    <option value={mapping.teacherId}>
                                      {mapping.teacherName || getTeacherName(mapping.teacherId)}
                                    </option>
                                  )}
                                </select>

                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                                  <ChevronDown className="h-3.5 w-3.5" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2 py-6 text-center text-xs text-slate-400">
                          <HelpCircle className="mx-auto h-6 w-6 text-slate-300" />
                          <p className="font-bold">
                            No subjects mapped to this class.
                          </p>
                          <p className="text-[10px] font-medium leading-relaxed">
                            Go to Manage Subjects first and assign subjects to this class.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />

                    <div className="text-[10px] font-medium leading-relaxed text-slate-600">
                      <span className="mb-0.5 block font-bold uppercase tracking-wider text-indigo-900">
                        Section Binding Advice
                      </span>
                      <span>
                        Assigning a teacher here overrides the class-level subject teacher only for this section. Leaving it as default uses the class-level teacher.
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {deleteConfirmSection && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDeleteConfirmSection(null)}
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
                  Delete Section
                </h3>

                <p className="mt-2 text-xs text-slate-500">
                  Are you sure you want to delete Section{" "}
                  <span className="font-bold text-slate-700">
                    {deleteConfirmSection.name}
                  </span>
                  ? Backend should block this if students or attendance records depend on it.
                </p>

                <div className="mt-5 flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmSection(null)}
                    disabled={isSaving}
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Keep Section
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteSection}
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
