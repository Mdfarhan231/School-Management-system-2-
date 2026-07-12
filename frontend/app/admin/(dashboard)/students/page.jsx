"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  User,
  GraduationCap,
  Phone,
  Image,
  Check,
  CheckCircle2,
  Upload,
  ChevronRight,
  AlertTriangle,
  Search,
  Palette,
  ArrowRight,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { apiRequest } from "@/lib/api";
import { useSession } from "@/context/SessionContext";

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&q=80",
  "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&h=150&fit=crop&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&q=80",
];

function toArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.classes)) return payload.classes;
  if (Array.isArray(payload?.sections)) return payload.sections;
  if (Array.isArray(payload?.students)) return payload.students;
  return [];
}

function normalizeClass(item) {
  return {
    id: String(item.class_id ?? item.id),
    class_id: item.class_id ?? item.id,
    name: item.class_name ?? item.name ?? `Class ${item.class_id ?? item.id}`,
  };
}

function normalizeSection(item) {
  return {
    id: String(item.section_id ?? item.id),
    section_id: item.section_id ?? item.id,
    classId: String(item.class_id ?? item.classId),
    class_id: item.class_id ?? item.classId,
    name: item.section_name ?? item.name ?? item.section ?? "",
    studentLimit: Number(item.student_limit ?? item.studentLimit ?? 40),
  };
}

function normalizeStudent(item) {
  return {
    id: String(item.student_id ?? item.id),
    student_id: item.student_id ?? item.id,
    name: item.name ?? "",
    roll: String(item.roll ?? ""),
    classId: String(item.class_id ?? item.classId),
    sectionId: item.section_id ? String(item.section_id) : "",
    academicSession: item.academic_session ?? item.session ?? "",
  };
}

function apiId(value) {
  const numeric = Number(value);
  return Number.isNaN(numeric) ? value : numeric;
}

export default function StudentsPage() {
  const { selectedSession, selectedSessionId } = useSession();

  const session =
    selectedSession?.session_label ||
    selectedSession?.label ||
    selectedSession?.name ||
    "Current Session";

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  const [activeFormTab, setActiveFormTab] = useState("basic");

  const [formName, setFormName] = useState("");
  const [formRoll, setFormRoll] = useState("");
  const [formGender, setFormGender] = useState("Male");
  const [formDob, setFormDob] = useState("2016-04-12");
  const [formEmail, setFormEmail] = useState("");
  const [formClassId, setFormClassId] = useState("");
  const [formSectionId, setFormSectionId] = useState("");
  const [formParentName, setFormParentName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAltPhone, setFormAltPhone] = useState("");
  const [formPhoto, setFormPhoto] = useState(PRESET_AVATARS[0]);
  const [formPhotoFile, setFormPhotoFile] = useState(null);

  const [formFatherName, setFormFatherName] = useState("");
  const [formMotherName, setFormMotherName] = useState("");
  const [formParentsPhone, setFormParentsPhone] = useState("");
  const [formAddress, setFormAddress] = useState("");

  const [validationError, setValidationError] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [lastEnrolledName, setLastEnrolledName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [portalTheme, setPortalTheme] = useState("light");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      setValidationError("");

      const [classesPayload, sectionsPayload, studentsPayload] =
        await Promise.all([
          apiRequest("/classes"),
          apiRequest("/sections"),
          apiRequest("/students"),
        ]);

      setClasses(toArray(classesPayload).map(normalizeClass));
      setSections(toArray(sectionsPayload).map(normalizeSection));
      setStudents(toArray(studentsPayload).map(normalizeStudent));
    } catch (err) {
      setValidationError(err.message || "Failed to load student form data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (!formClassId) {
      setFormSectionId("");
      return;
    }

    const classSections = sections.filter(
      (section) => section.classId === String(formClassId)
    );

    if (classSections.length === 0) {
      setFormSectionId("");
      return;
    }

    const currentSectionStillValid = classSections.some(
      (section) => section.id === String(formSectionId)
    );

    if (!currentSectionStillValid) {
      setFormSectionId(classSections[0].id);
    }
  }, [formClassId, formSectionId, sections]);

  const activeClasses = classes;

  const formClassSections = useMemo(() => {
    return sections.filter((section) => section.classId === String(formClassId));
  }, [sections, formClassId]);

  const filteredClassSections = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();

    if (!search) return formClassSections;

    return formClassSections.filter((section) =>
      section.name.toLowerCase().includes(search)
    );
  }, [formClassSections, searchQuery]);

  const selectedClass = useMemo(() => {
    return classes.find((item) => item.id === String(formClassId));
  }, [classes, formClassId]);

  const selectedSection = useMemo(() => {
    return sections.find((item) => item.id === String(formSectionId));
  }, [sections, formSectionId]);

  const validateTab = () => {
    // Form validation is temporarily disabled.
    return "";

    /*
    if (tabId === "basic") {
      if (!formName.trim()) return "Student full name is required.";
      if (!formFatherName.trim()) return "Father's name is required.";
      if (!formMotherName.trim()) return "Mother's name is required.";
      if (!formParentsPhone.trim()) return "Parents' phone number is required.";
      if (!/^\d{11}$/.test(formParentsPhone.replace(/\D/g, ""))) {
        return "Parents' phone number must be exactly 11 digits.";
      }
      if (!formAddress.trim()) return "Present/permanent address is required.";
    }

    if (tabId === "class") {
      if (!formClassId) return "Please select an academic class level.";
      if (!formSectionId) return "Please select a class section mapping.";
      if (!formRoll.trim()) return "Roll/ID number is required.";

      const rollExists = students.some((student) => {
        return (
          student.classId === String(formClassId) &&
          student.sectionId === String(formSectionId) &&
          student.roll === formRoll.trim() &&
          (!student.academicSession || student.academicSession === session)
        );
      });

      if (rollExists) {
        return `Roll/ID number "${formRoll}" is already assigned in this class and section.`;
      }
    }

    if (tabId === "phone") {
      if (!formParentName.trim()) return "Parent or guardian's full name is required.";
      if (!formPhone.trim()) return "Primary contact phone number is required.";
      if (!/^\d{11}$/.test(formPhone.replace(/\D/g, ""))) {
        return "Primary phone number must be exactly 11 digits.";
      }
      if (formAltPhone.trim() && !/^\d{11}$/.test(formAltPhone.replace(/\D/g, ""))) {
        return "Alternate contact phone number must be exactly 11 digits if provided.";
      }
    }

    return "";
    */
  };

  const handleTabChange = (targetTabId) => {
    setValidationError("");

    const activeTabs = ["basic", "class", "phone", "photo"];
    const currentIndex = activeTabs.indexOf(activeFormTab);
    const targetIndex = activeTabs.indexOf(targetTabId);

    if (targetIndex > currentIndex) {
      for (let index = currentIndex; index < targetIndex; index += 1) {
        const error = validateTab(activeTabs[index]);

        if (error) {
          setValidationError(`[${activeTabs[index].toUpperCase()}] ${error}`);
          setActiveFormTab(activeTabs[index]);
          return;
        }
      }
    }

    setActiveFormTab(targetTabId);
  };

  const handleNext = () => {
    setValidationError("");

    const error = validateTab(activeFormTab);

    if (error) {
      setValidationError(error);
      return;
    }

    if (activeFormTab === "basic") setActiveFormTab("class");
    else if (activeFormTab === "class") setActiveFormTab("phone");
    else if (activeFormTab === "phone") setActiveFormTab("photo");
  };

  const handlePrev = () => {
    setValidationError("");

    if (activeFormTab === "photo") setActiveFormTab("phone");
    else if (activeFormTab === "phone") setActiveFormTab("class");
    else if (activeFormTab === "class") setActiveFormTab("basic");
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    /* File-size validation is temporarily disabled.
    if (file.size > 2 * 1024 * 1024) {
      setValidationError("Image file is too large. Please select a photo smaller than 2MB.");
      return;
    }
    */

    setFormPhotoFile(file);
    setFormPhoto(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setFormName("");
    setFormRoll("");
    setFormGender("Male");
    setFormDob("2016-04-12");
    setFormEmail("");
    setFormClassId("");
    setFormSectionId("");
    setFormParentName("");
    setFormPhone("");
    setFormAltPhone("");
    setFormFatherName("");
    setFormMotherName("");
    setFormParentsPhone("");
    setFormAddress("");
    setFormPhoto(PRESET_AVATARS[0]);
    setFormPhotoFile(null);
    setValidationError("");
    setActiveFormTab("basic");
  };

  const handleSubmitEnrollment = async (event) => {
    event.preventDefault();
    setValidationError("");

    const basicErr = validateTab("basic");
    if (basicErr) {
      setActiveFormTab("basic");
      setValidationError(basicErr);
      return;
    }

    const classErr = validateTab("class");
    if (classErr) {
      setActiveFormTab("class");
      setValidationError(classErr);
      return;
    }

    const phoneErr = validateTab("phone");
    if (phoneErr) {
      setActiveFormTab("phone");
      setValidationError(phoneErr);
      return;
    }

    try {
      setIsSaving(true);

      const submitData = new FormData();

      submitData.append("name", formName.trim());
      submitData.append("father_name", formFatherName.trim());
      submitData.append("mother_name", formMotherName.trim());
      submitData.append("parents_phone", formParentsPhone.trim());
      submitData.append("address", formAddress.trim());

      submitData.append("gender", formGender);
      submitData.append("dob", formDob);
      submitData.append("email", formEmail.trim());

      submitData.append("class_id", apiId(formClassId));
      submitData.append("section_id", apiId(formSectionId));
      submitData.append("roll", formRoll.trim());
      submitData.append("academic_session", session);

      if (selectedSessionId) {
        submitData.append("session_id", selectedSessionId);
      }

      submitData.append("parent_name", formParentName.trim());
      submitData.append("phone", formPhone.trim());
      submitData.append("alt_phone", formAltPhone.trim());

      if (formPhotoFile) {
        submitData.append("picture", formPhotoFile);
      } else if (formPhoto) {
        submitData.append("picture_url", formPhoto);
      }

      const payload = await apiRequest("/students", "POST", submitData);

      const createdStudent = {
        id: String(payload?.student_id ?? Date.now()),
        student_id: payload?.student_id,
        name: formName.trim(),
        roll: formRoll.trim(),
        classId: String(formClassId),
        sectionId: String(formSectionId),
        academicSession: session,
      };

      setStudents((current) => [...current, createdStudent]);

      setLastEnrolledName(formName.trim());
      setShowSuccessToast(true);

      const nextRoll = parseInt(formRoll, 10)
        ? String(parseInt(formRoll, 10) + 1)
        : "";

      setFormName("");
      setFormRoll(nextRoll);
      setFormGender("Male");
      setFormDob("2016-04-12");
      setFormEmail("");
      setFormParentName("");
      setFormPhone("");
      setFormAltPhone("");
      setFormFatherName("");
      setFormMotherName("");
      setFormParentsPhone("");
      setFormAddress("");
      setFormPhoto(PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)]);
      setFormPhotoFile(null);
      setActiveFormTab("basic");

      setTimeout(() => {
        setShowSuccessToast(false);
      }, 5000);
    } catch (err) {
      setValidationError(err.message || "Failed to enroll student.");
    } finally {
      setIsSaving(false);
    }
  };

  const getThemeClasses = () => {
    switch (portalTheme) {
      case "dark":
        return {
          tier2Bg: "bg-[#0F0F12]",
          tier2Header: "text-white font-extrabold",
          tier2Sub: "text-slate-400/90",
          tier2ItemActive: "bg-white text-[#0F0F12] shadow-lg shadow-white/5 border border-white font-bold",
          tier2ItemInactive: "text-slate-200/80 hover:bg-[#1A1A22] hover:text-white transition-colors duration-200",
          tier2SectionHeader: "text-slate-500 border-[#1E1E24]",
          mainBg: "bg-[#050507] text-slate-100",
          inputBg: "bg-[#09090B] border-[#1C1C22] focus:border-indigo-500 text-white",
          labelColor: "text-slate-300 font-bold",
          headingColor: "text-white",
          subColor: "text-slate-400",
        };

      case "blue":
        return {
          tier2Bg: "bg-[#0B1528]",
          tier2Header: "text-white font-extrabold",
          tier2Sub: "text-slate-200/80",
          tier2ItemActive: "bg-white text-[#0B1528] shadow-lg shadow-white/5 border border-white font-bold",
          tier2ItemInactive: "text-slate-200/80 hover:bg-[#13233F] hover:text-white transition-colors duration-200",
          tier2SectionHeader: "text-indigo-400/80 border-[#152542]",
          mainBg: "bg-[#060B14] text-indigo-50",
          inputBg: "bg-[#070D18] border-[#162947] focus:border-indigo-400 text-white",
          labelColor: "text-indigo-200 font-bold",
          headingColor: "text-white",
          subColor: "text-indigo-200/80",
        };

      case "light":
      default:
        return {
          tier2Bg: "bg-white",
          tier2Header: "text-slate-900 font-extrabold",
          tier2Sub: "text-slate-500",
          tier2ItemActive: "bg-indigo-600 text-white shadow-lg shadow-indigo-100 border border-indigo-500/10 font-bold",
          tier2ItemInactive: "text-slate-600 hover:bg-slate-100/50 hover:text-slate-900",
          tier2SectionHeader: "text-slate-400 border-slate-200",
          mainBg: "bg-white text-slate-800",
          inputBg: "bg-slate-50 border-slate-200 focus:border-indigo-600 text-slate-800",
          labelColor: "text-slate-500 font-bold",
          headingColor: "text-slate-900",
          subColor: "text-slate-500",
        };
    }
  };

  const theme = getThemeClasses();

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center rounded-3xl border border-slate-200 bg-white">
        <div className="flex flex-col items-center">
          <div className="mb-3 h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-500">
            Loading student form...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[76vh] flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch w-full transition-all duration-300">
      <div
        className={`w-full lg:w-80 ${theme.tier2Bg} rounded-3xl border ${
          portalTheme === "light"
            ? "border-slate-200/70 shadow-xl"
            : "border-slate-800/80 shadow-2xl shadow-slate-950/40"
        } p-6 flex flex-col justify-between shrink-0 transition-all duration-300`}
      >
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className={`text-base font-bold tracking-tight ${theme.tier2Header}`}>
                Add Student
              </h3>
              <p className={`text-xs mt-0.5 leading-relaxed ${theme.tier2Sub}`}>
                Workspace Portal for Student Registration.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (portalTheme === "light") setPortalTheme("dark");
                else if (portalTheme === "dark") setPortalTheme("blue");
                else setPortalTheme("light");
              }}
              title="Cycle Theme Style"
              className={`p-2 rounded-lg border transition-all shrink-0 ${
                portalTheme === "light"
                  ? "border-slate-200 hover:bg-slate-200/55 text-slate-500"
                  : "border-slate-800 hover:bg-slate-900 text-slate-400"
              }`}
            >
              <Palette className="h-4 w-4" />
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>

            <input
              type="text"
              placeholder="Search sections..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder-slate-400/75 ${theme.inputBg}`}
            />
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <span
                className={`text-[10px] font-black uppercase tracking-widest block pb-1 border-b ${theme.tier2SectionHeader}`}
              >
                Admission Form Tiers
              </span>

              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => handleTabChange("basic")}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[13px] transition-all duration-200 ${
                    activeFormTab === "basic"
                      ? theme.tier2ItemActive
                      : theme.tier2ItemInactive
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4" />
                    <span className="font-semibold">My Basic Info</span>
                  </div>

                  {validateTab("basic") === "" && formName.trim() && (
                    <span className="bg-emerald-500 text-white rounded-full p-0.5">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange("class")}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[13px] transition-all duration-200 ${
                    activeFormTab === "class"
                      ? theme.tier2ItemActive
                      : theme.tier2ItemInactive
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-4 w-4" />
                    <span className="font-semibold">My Class & Section</span>
                  </div>

                  {validateTab("class") === "" && formClassId && (
                    <span className="bg-emerald-500 text-white rounded-full p-0.5">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange("phone")}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[13px] transition-all duration-200 ${
                    activeFormTab === "phone"
                      ? theme.tier2ItemActive
                      : theme.tier2ItemInactive
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4" />
                    <span className="font-semibold">My Phone Contacts</span>
                  </div>

                  {validateTab("phone") === "" && formPhone.trim() && (
                    <span className="bg-emerald-500 text-white rounded-full p-0.5">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange("photo")}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[13px] transition-all duration-200 ${
                    activeFormTab === "photo"
                      ? theme.tier2ItemActive
                      : theme.tier2ItemInactive
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Image className="h-4 w-4" />
                    <span className="font-semibold">My Photo Profile</span>
                  </div>

                  <span className="text-[10px] opacity-60">Step 4</span>
                </button>
              </div>
            </div>

            <div
              className={`p-4 rounded-2xl border ${
                portalTheme === "light"
                  ? "bg-indigo-50/50 border-indigo-100 text-indigo-950"
                  : "bg-indigo-950/25 border-indigo-900/60 text-indigo-100"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-500 animate-pulse">
                    Fast Enrollment
                  </h4>
                  <p className="text-[11px] opacity-75 mt-1 leading-relaxed">
                    Select real class and section records before enrolling a student.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`pt-4 border-t text-[11px] font-black uppercase tracking-wider flex items-center justify-between ${
            portalTheme === "light"
              ? "border-slate-200 text-slate-400"
              : "border-slate-800 text-slate-500"
          }`}
        >
          <span>Active Session</span>
          <span className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-extrabold tracking-tight">
            {session}
          </span>
        </div>
      </div>

      <div
        className={`flex-1 ${theme.mainBg} rounded-3xl border ${
          portalTheme === "light"
            ? "border-slate-200/80 shadow-xl"
            : "border-slate-800/80 shadow-2xl shadow-slate-950/40"
        } flex flex-col justify-between relative overflow-y-auto min-h-[550px] transition-all duration-300 z-10`}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none z-0" />

        <form
          onSubmit={handleSubmitEnrollment}
          noValidate
          className="p-8 md:p-12 w-full max-w-4xl mx-auto space-y-10 z-10 relative"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/50">
            <div>
              <div className="flex items-center gap-2 text-xs font-black text-indigo-600 uppercase tracking-widest">
                <Sparkles className="h-4 w-4" />
                <span>Section Level {activeFormTab.toUpperCase()}</span>
              </div>

              <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight mt-1.5 ${theme.headingColor}`}>
                {activeFormTab === "basic" && "Provide Student Identification"}
                {activeFormTab === "class" && "Configure Academic Level"}
                {activeFormTab === "phone" && "Primary Contacts & Emergency Lines"}
                {activeFormTab === "photo" && "Upload Profile Photo"}
              </h2>

              <p className={`text-sm ${theme.subColor} mt-1.5 leading-relaxed`}>
                {activeFormTab === "basic" && "Enter student identity, parents, address, and general information."}
                {activeFormTab === "class" && "Pick an existing class and physical section mapping."}
                {activeFormTab === "phone" && "Enter guardian and emergency contact numbers."}
                {activeFormTab === "photo" && "Choose a preset avatar or upload a student photo."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (window.confirm("Are you sure you want to reset all form inputs?")) {
                  resetForm();
                }
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border transition-all hover:shadow-sm ${
                portalTheme === "light"
                  ? "border-slate-200 hover:bg-slate-50 text-slate-500"
                  : "border-slate-800 hover:bg-slate-900 text-slate-400"
              }`}
            >
              <RefreshCw className="h-3 w-3" />
              <span>Reset Fields</span>
            </button>
          </div>

          {validationError && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-semibold flex items-start gap-2.5 animate-in fade-in zoom-in-95 duration-200">
              <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Validation Issue Found</span>
                <p className="opacity-90 mt-0.5 font-medium">{validationError}</p>
              </div>
            </div>
          )}

          <AnimatePresence>
            {showSuccessToast && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl text-xs flex items-start gap-3 shadow-md"
              >
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-black">Enrollment Registered!</span>
                  <p className="opacity-90 mt-0.5">
                    Student{" "}
                    <strong className="text-emerald-950 font-bold">
                      {lastEnrolledName}
                    </strong>{" "}
                    has been successfully enrolled for session{" "}
                    <strong className="font-bold">{session}</strong>.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {activeClasses.length === 0 && (
            <div className="p-4 bg-amber-50 border border-amber-100 text-amber-800 rounded-2xl text-xs flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">No Classes Configured</span>
                <p className="opacity-95 mt-0.5">
                  Create classes and sections before registering new students.
                </p>
              </div>
            </div>
          )}

          <div className="min-h-[220px]">
            {activeFormTab === "basic" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-7 animate-in fade-in duration-300">
                <div className="space-y-2 sm:col-span-2">
                  <label className={`text-xs font-black uppercase tracking-wider block ${theme.labelColor}`}>
                    Student Full Name <span className="text-indigo-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Abdullah Al-Mahmud"
                    value={formName}
                    onChange={(event) => setFormName(event.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-bold shadow-sm ${theme.inputBg}`}
                  />
                </div>

                <div className="space-y-2">
                  <label className={`text-xs font-black uppercase tracking-wider block ${theme.labelColor}`}>
                    Father's Name <span className="text-indigo-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rafiqul Islam"
                    value={formFatherName}
                    onChange={(event) => setFormFatherName(event.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-bold shadow-sm ${theme.inputBg}`}
                  />
                </div>

                <div className="space-y-2">
                  <label className={`text-xs font-black uppercase tracking-wider block ${theme.labelColor}`}>
                    Mother's Name <span className="text-indigo-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Begum Rokeya"
                    value={formMotherName}
                    onChange={(event) => setFormMotherName(event.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-bold shadow-sm ${theme.inputBg}`}
                  />
                </div>

                <div className="space-y-2">
                  <label className={`text-xs font-black uppercase tracking-wider block ${theme.labelColor}`}>
                    Parents' Phone Number <span className="text-indigo-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 01712345678"
                    value={formParentsPhone}
                    onChange={(event) => setFormParentsPhone(event.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-mono font-bold shadow-sm ${theme.inputBg}`}
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className={`text-xs font-black uppercase tracking-wider block ${theme.labelColor}`}>
                    Present / Permanent Address <span className="text-indigo-500">*</span>
                  </label>
                  <textarea
                    required
                    rows="2"
                    placeholder="e.g. House 12, Road 4, Dhanmondi, Dhaka"
                    value={formAddress}
                    onChange={(event) => setFormAddress(event.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-bold shadow-sm ${theme.inputBg}`}
                  />
                </div>

                <div className="space-y-2">
                  <label className={`text-xs font-black uppercase tracking-wider block ${theme.labelColor}`}>
                    Student Gender
                  </label>
                  <div className="relative">
                    <select
                      value={formGender}
                      onChange={(event) => setFormGender(event.target.value)}
                      className={`w-full pl-4 pr-10 py-3 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer shadow-sm ${theme.inputBg}`}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>

                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                      <ChevronRight className="h-4 w-4 rotate-90" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`text-xs font-black uppercase tracking-wider block ${theme.labelColor}`}>
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    required
                    value={formDob}
                    onChange={(event) => setFormDob(event.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-bold shadow-sm ${theme.inputBg}`}
                  />
                </div>

                <div className="space-y-2">
                  <label className={`text-xs font-black uppercase tracking-wider block ${theme.labelColor}`}>
                    Email Address Optional
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. student@school.edu"
                    value={formEmail}
                    onChange={(event) => setFormEmail(event.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-bold shadow-sm ${theme.inputBg}`}
                  />
                </div>
              </div>
            )}

            {activeFormTab === "class" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <label className={`text-xs font-black uppercase tracking-wider block ${theme.labelColor}`}>
                    Academic Class Level <span className="text-indigo-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formClassId}
                      onChange={(event) => {
                        setFormClassId(event.target.value);
                        setFormSectionId("");
                      }}
                      className={`w-full pl-4 pr-10 py-3 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer shadow-sm ${theme.inputBg}`}
                    >
                      <option value="">-- Choose Class Placement --</option>
                      {activeClasses.map((classItem) => (
                        <option key={classItem.id} value={classItem.id}>
                          Class {classItem.name}
                        </option>
                      ))}
                    </select>

                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                      <ChevronRight className="h-4 w-4 rotate-90" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`text-xs font-black uppercase tracking-wider block ${theme.labelColor}`}>
                    Physical Section Placement <span className="text-indigo-500">*</span>
                  </label>

                  <div className="relative">
                    <select
                      value={formSectionId}
                      onChange={(event) => setFormSectionId(event.target.value)}
                      disabled={!formClassId}
                      className={`w-full pl-4 pr-10 py-3 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer disabled:bg-slate-100/55 disabled:cursor-not-allowed shadow-sm ${theme.inputBg}`}
                    >
                      <option value="">-- Choose Physical Section --</option>
                      {filteredClassSections.map((section) => (
                        <option key={section.id} value={section.id}>
                          Section {section.name} - Limit {section.studentLimit} Students
                        </option>
                      ))}
                    </select>

                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                      <ChevronRight className="h-4 w-4 rotate-90" />
                    </div>
                  </div>

                  {formClassId && formClassSections.length === 0 && (
                    <div className="flex items-center gap-1.5 mt-2 text-amber-600 text-xs font-bold">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>
                        No sections found for this class. Please configure a section in Manage Sections.
                      </span>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-xs text-indigo-800">
                  <span className="font-black">Selected placement:</span>{" "}
                  {selectedClass ? `Class ${selectedClass.name}` : "No class selected"}
                  {selectedSection ? `, Section ${selectedSection.name}` : ""}
                </div>

                <div className="space-y-2">
                  <label className={`text-xs font-black uppercase tracking-wider block ${theme.labelColor}`}>
                    Roll / ID Number <span className="text-indigo-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 101"
                    value={formRoll}
                    onChange={(event) => setFormRoll(event.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-mono font-bold shadow-sm ${theme.inputBg}`}
                  />
                </div>
              </div>
            )}

            {activeFormTab === "phone" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-7 animate-in fade-in duration-300">
                <div className="space-y-2 sm:col-span-2">
                  <label className={`text-xs font-black uppercase tracking-wider block ${theme.labelColor}`}>
                    Parent or Guardian Full Name <span className="text-indigo-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mohammad Abu Bakr"
                    value={formParentName}
                    onChange={(event) => setFormParentName(event.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-bold shadow-sm ${theme.inputBg}`}
                  />
                </div>

                <div className="space-y-2">
                  <label className={`text-xs font-black uppercase tracking-wider block ${theme.labelColor}`}>
                    Primary Contact Mobile Phone <span className="text-indigo-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 01712345678"
                    value={formPhone}
                    onChange={(event) => setFormPhone(event.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-mono font-bold shadow-sm ${theme.inputBg}`}
                  />
                </div>

                <div className="space-y-2">
                  <label className={`text-xs font-black uppercase tracking-wider block ${theme.labelColor}`}>
                    Alternative / Emergency Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 01812345679"
                    value={formAltPhone}
                    onChange={(event) => setFormAltPhone(event.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-mono font-bold shadow-sm ${theme.inputBg}`}
                  />
                </div>
              </div>
            )}

            {activeFormTab === "photo" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row gap-6 items-center">
                  <div className="relative shrink-0">
                    <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-md bg-slate-100 flex items-center justify-center">
                      <img
                        src={formPhoto}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <label className="absolute bottom-2 right-2 p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md cursor-pointer transition-colors">
                      <Upload className="h-3 w-3" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="space-y-1.5 text-center sm:text-left">
                    <h4 className={`text-xs font-bold ${theme.headingColor}`}>
                      Customize Profile Photo
                    </h4>
                    <p className={`text-[11px] leading-relaxed max-w-sm ${theme.subColor}`}>
                      Upload a PNG/JPG file under 2MB or choose a preset avatar.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider block ${theme.labelColor}`}>
                    School-issued Preset Icons
                  </span>

                  <div className="grid grid-cols-6 gap-3">
                    {PRESET_AVATARS.map((preset, index) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setFormPhoto(preset);
                          setFormPhotoFile(null);
                        }}
                        className={`aspect-square rounded-xl overflow-hidden border-2 relative transition-all duration-200 cursor-pointer ${
                          formPhoto === preset
                            ? "border-indigo-600 scale-95 shadow-md shadow-indigo-600/20"
                            : "border-transparent hover:scale-105 hover:shadow-sm"
                        }`}
                      >
                        <img
                          src={preset}
                          alt={`Preset ${index + 1}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />

                        {formPhoto === preset && (
                          <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center text-white">
                            <span className="bg-indigo-600 rounded-full p-0.5">
                              <Check className="h-2.5 w-2.5" />
                            </span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-8 border-t border-slate-200/50 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrev}
              disabled={activeFormTab === "basic"}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-35 disabled:cursor-not-allowed ${
                portalTheme === "light"
                  ? "hover:bg-slate-100 text-slate-600"
                  : "hover:bg-slate-900 text-slate-300"
              }`}
            >
              Backwards
            </button>

            {activeFormTab !== "photo" ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2.5 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/25 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Continue Step</span>
                <ArrowRight className="h-4 w-4 animate-pulse" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2.5 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/25 active:scale-[0.98] transition-all cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{isSaving ? "Saving..." : "Complete Enrollment"}</span>
              </button>
            )}
          </div>
        </form>

        <div className="w-full h-1.5 bg-slate-200/40 relative">
          <div
            className="absolute left-0 top-0 h-full bg-indigo-600 transition-all duration-300"
            style={{
              width:
                activeFormTab === "basic"
                  ? "25%"
                  : activeFormTab === "class"
                    ? "50%"
                    : activeFormTab === "phone"
                      ? "75%"
                      : "100%",
            }}
          />
        </div>
      </div>
    </div>
  );
}
