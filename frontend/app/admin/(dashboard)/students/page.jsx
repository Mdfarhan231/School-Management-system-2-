"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiRequest } from "@/lib/api";
import { useSession } from "@/context/SessionContext";
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
  Settings,
  Grid,
  Code,
  Folder,
  Calendar,
  Palette,
  ArrowRight,
  Sparkles,
  RefreshCw,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
    name: item.class_name ?? item.name ?? `Class ${item.class_id ?? item.id}`,
  };
}

function normalizeSection(item) {
  return {
    id: String(item.section_id ?? item.id),
    classId: String(item.class_id ?? item.classId),
    name: item.section_name ?? item.name ?? item.section ?? "",
    studentLimit: Number(item.student_limit ?? item.studentLimit ?? 40),
  };
}

function normalizeStudent(item) {
  return {
    id: String(item.student_id ?? item.id),
    roll: String(item.roll ?? ""),
    classId: String(item.class_id ?? item.classId),
    sectionId: item.section_id ? String(item.section_id) : "",
    academicSession: item.academic_session ?? "",
  };
}

function apiId(value) {
  const numeric = Number(value);
  return Number.isNaN(numeric) ? value : numeric;
}

export default function StudentManagementView({ session: propSession }) {
  const { selectedSession } = useSession();

  const session =
    propSession ||
    selectedSession?.session_label ||
    selectedSession?.label ||
    selectedSession?.name ||
    "Current Session";
  // Database States
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  // Active Tab/Tier Navigation
  const [activeFormTab, setActiveFormTab] = useState('basic');

  // Input States
  const [formName, setFormName] = useState('');
  const [formRoll, setFormRoll] = useState('');
  const [formGender, setFormGender] = useState('Male');
  const [formDob, setFormDob] = useState('2016-04-12');
  const [formEmail, setFormEmail] = useState('');
  const [formClassId, setFormClassId] = useState('');
  const [formSectionId, setFormSectionId] = useState('');
  const [formParentName, setFormParentName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAltPhone, setFormAltPhone] = useState('');
  const [formPhoto, setFormPhoto] = useState('');
  const [formPhotoFile, setFormPhotoFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Family Info States
  const [formFatherName, setFormFatherName] = useState('');
  const [formMotherName, setFormMotherName] = useState('');
  const [formAddress, setFormAddress] = useState('');

  // UI Flow States
  const [validationError, setValidationError] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [lastEnrolledName, setLastEnrolledName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Interface Visual Theme
  // 'light' (pure white), 'dark' (pure slate black), 'blue' (navy blue premium)
  const [portalTheme, setPortalTheme] = useState('light');

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

  // Update Section when Class selection changes
  useEffect(() => {
    if (formClassId) {
      const activeSecs = sections.filter(sec => sec.classId === String(formClassId));
      if (activeSecs.length > 0) {
        // Automatically select first section if none is active or mismatch
        if (!activeSecs.some(s => s.id === formSectionId)) {
          setFormSectionId(activeSecs[0].id);
        }
      } else {
        setFormSectionId('');
      }
    } else {
      setFormSectionId('');
    }
  }, [formClassId, sections, formSectionId]);

  // Dynamic Filtering based on school classes active for selected session
  const activeClasses = classes;
  const formClassSections = sections.filter(
    (sec) => sec.classId === String(formClassId)
  );

  // Validate fields for current tab selection
  const validateTab = (tabId) => {
    if (tabId === 'basic') {
      if (!formName.trim()) return "Student full name is required.";
      if (!formFatherName.trim()) return "Father's name is required.";
      if (!formMotherName.trim()) return "Mother's name is required.";
      if (!formPhone.trim()) return "Primary phone number is required.";
      if (!/^\d{11}$/.test(formPhone.replace(/\D/g, ""))) {
        return "Primary phone number must be exactly 11 digits.";
      }
      if (formAltPhone.trim() && !/^\d{11}$/.test(formAltPhone.replace(/\D/g, ""))) {
        return "Alternative phone number must be exactly 11 digits if provided.";
      }
      if (!formAddress.trim()) return "Present/permanent address is required.";
    }

    if (tabId === 'class') {
      if (!formClassId) return "Please select an academic class level.";
      if (!formSectionId) return "Please select a class section.";
      if (!formRoll.trim()) return "Roll/ID number is required.";

      const rollExists = students.some((student) =>
        student.academicSession === session &&
        student.classId === String(formClassId) &&
        student.sectionId === String(formSectionId) &&
        student.roll === formRoll.trim()
      );

      if (rollExists) {
        return `Roll/ID number "${formRoll}" is already assigned in this class and section.`;
      }
    }

    return '';
  };

  // Switch tabs & validate
  const handleTabChange = (targetTabId) => {
    setValidationError('');
    // Ensure chronological steps can be clicked only if previous are validated
    const activeTabs = ['basic', 'class', 'photo'];
    const currentIndex = activeTabs.indexOf(activeFormTab);
    const targetIndex = activeTabs.indexOf(targetTabId);

    if (targetIndex > currentIndex) {
      // Validate all tabs between current and target
      for (let i = currentIndex; i < targetIndex; i++) {
        const error = validateTab(activeTabs[i]);
        if (error) {
          setValidationError(`[${activeTabs[i].toUpperCase()}] ${error}`);
          setActiveFormTab(activeTabs[i]);
          return;
        }
      }
    }
    setActiveFormTab(targetTabId);
  };

  // Navigation handlers
  const handleNext = () => {
    setValidationError('');
    const error = validateTab(activeFormTab);
    if (error) {
      setValidationError(error);
      return;
    }

    if (activeFormTab === 'basic') setActiveFormTab('class');
    else if (activeFormTab === 'class') setActiveFormTab('photo');
  };

  const handlePrev = () => {
    setValidationError('');
    if (activeFormTab === 'photo') setActiveFormTab('class');
    else if (activeFormTab === 'class') setActiveFormTab('basic');
  };

  // Keep a local preview while retaining the real File for Laravel/Supabase.
  const processPhotoFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setValidationError("Invalid file type. Please upload a valid image file (PNG, JPG, JPEG, or GIF).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setValidationError("Image file is too large. Please select a photo smaller than 2MB.");
      return;
    }
    setFormPhotoFile(file);
    setFormPhoto(URL.createObjectURL(file));
    setValidationError('');
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processPhotoFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      processPhotoFile(file);
    }
  };

  // Handle Enrollment Submission
  const handleSubmitEnrollment = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setValidationError('');

    // Prevent submission if not on the final 'photo' tab; instead advance to the next step
    if (activeFormTab !== 'photo') {
      handleNext();
      return;
    }

    // Double check all tabs
    const basicErr = validateTab('basic');
    if (basicErr) { setActiveFormTab('basic'); setValidationError(basicErr); return; }

    const classErr = validateTab('class');
    if (classErr) { setActiveFormTab('class'); setValidationError(classErr); return; }

    try {
      setIsSaving(true);

      const submitData = new FormData();
      submitData.append('name', formName.trim());
      submitData.append('father_name', formFatherName.trim());
      submitData.append('mother_name', formMotherName.trim());
      submitData.append('parents_phone', formPhone.trim());
      submitData.append('parent_name', formParentName.trim() || formFatherName.trim());
      submitData.append('phone', formPhone.trim());
      submitData.append('alt_phone', formAltPhone.trim());
      submitData.append('address', formAddress.trim());
      submitData.append('gender', formGender);
      submitData.append('dob', formDob);
      submitData.append('email', formEmail.trim());
      submitData.append('class_id', apiId(formClassId));
      submitData.append('section_id', apiId(formSectionId));
      submitData.append('roll', formRoll.trim());
      submitData.append('academic_session', session);

      if (formPhotoFile) {
        submitData.append('picture', formPhotoFile);
      }

      const payload = await apiRequest('/students', 'POST', submitData);

      setStudents((current) => [
        ...current,
        {
          id: String(payload?.student_id ?? Date.now()),
          roll: formRoll.trim(),
          classId: String(formClassId),
          sectionId: String(formSectionId),
          academicSession: session,
        },
      ]);

      setLastEnrolledName(formName);
      setShowSuccessToast(true);
      setFormName('');
      setFormRoll(parseInt(formRoll, 10) ? String(parseInt(formRoll, 10) + 1) : '');
      setFormGender('Male');
      setFormDob('2016-04-12');
      setFormEmail('');
      setFormParentName('');
      setFormPhone('');
      setFormAltPhone('');
      setFormFatherName('');
      setFormMotherName('');
      setFormAddress('');
      setFormPhoto('');
      setFormPhotoFile(null);
      setActiveFormTab('basic');

      setTimeout(() => {
        setShowSuccessToast(false);
      }, 5000);
    } catch (err) {
      setValidationError(err.message || 'Failed to enroll student.');
    } finally {
      setIsSaving(false);
    }
  };

  // Determine styles dynamically according to active theme
  // themes: 'light', 'dark', 'blue'
  const getThemeClasses = () => {
    switch (portalTheme) {
      case 'dark':
        return {
          tier1Bg: 'bg-[#0F0F12] border-[#1C1C22]',
          tier1IconActive: 'bg-indigo-600 text-white shadow-md shadow-black/30',
          tier1IconInactive: 'text-slate-400 hover:bg-[#1A1A22] hover:text-slate-200',
          tier2Bg: 'bg-[#0F0F12]',
          tier2Header: 'text-white font-extrabold',
          tier2Sub: 'text-slate-400/90',
          tier2ItemActive: 'bg-white text-[#0F0F12] shadow-lg shadow-white/5 border border-white font-bold',
          tier2ItemInactive: 'text-slate-200/80 hover:bg-[#1A1A22] hover:text-white transition-colors duration-200',
          tier2SectionHeader: 'text-slate-500 border-[#1E1E24]',
          mainBg: 'bg-[#050507] text-slate-100',
          cardBg: 'bg-[#121216] border-[#1D1D22]',
          inputBg: 'bg-[#09090B] border-[#1C1C22] focus:border-indigo-500 text-white',
          labelColor: 'text-slate-350 font-bold',
          headingColor: 'text-white',
          subColor: 'text-slate-450',
          mutedColor: 'text-slate-500',
        };
      case 'blue':
        return {
          tier1Bg: 'bg-[#0B1528] border-[#152542]',
          tier1IconActive: 'bg-indigo-600 text-white shadow-md shadow-black/30',
          tier1IconInactive: 'text-indigo-300 hover:bg-[#13233F] hover:text-indigo-100',
          tier2Bg: 'bg-[#0B1528]',
          tier2Header: 'text-white font-extrabold',
          tier2Sub: 'text-slate-200/80',
          tier2ItemActive: 'bg-white text-[#0B1528] shadow-lg shadow-white/5 border border-white font-bold',
          tier2ItemInactive: 'text-slate-200/80 hover:bg-[#13233F] hover:text-white transition-colors duration-200',
          tier2SectionHeader: 'text-indigo-400/80 border-[#152542]',
          mainBg: 'bg-[#060B14] text-indigo-50',
          cardBg: 'bg-[#101F38] border-[#182C4E]',
          inputBg: 'bg-[#070D18] border-[#162947] focus:border-indigo-400 text-white',
          labelColor: 'text-indigo-200 font-bold',
          headingColor: 'text-white',
          subColor: 'text-indigo-200/80',
          mutedColor: 'text-indigo-300/60',
        };
      case 'light':
      default:
        return {
          tier1Bg: 'bg-white border-slate-100',
          tier1IconActive: 'bg-indigo-600 text-white shadow-md shadow-indigo-100',
          tier1IconInactive: 'text-slate-450 hover:bg-slate-50 hover:text-slate-900',
          tier2Bg: 'bg-white',
          tier2Header: 'text-slate-900 font-extrabold',
          tier2Sub: 'text-slate-500',
          tier2ItemActive: 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 border border-indigo-500/10 font-bold',
          tier2ItemInactive: 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-900',
          tier2SectionHeader: 'text-slate-400 border-slate-150',
          mainBg: 'bg-white text-slate-800',
          cardBg: 'bg-white border-slate-200/80 shadow-sm',
          inputBg: 'bg-slate-50 border-slate-200/80 focus:border-indigo-600 text-slate-850',
          labelColor: 'text-slate-500 font-bold',
          headingColor: 'text-slate-900',
          subColor: 'text-slate-500',
          mutedColor: 'text-slate-400',
        };
    }
  };

  const theme = getThemeClasses();

  return (
    <div className="min-h-[76vh] flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch w-full transition-all duration-300">
      
      {/* ──────────────────────────────────────────────────────────
          SUB-SIDEBAR (SECTION TAB CATEGORIES NEXT TO MAIN SIDEBAR)
          ────────────────────────────────────────────────────────── */}
      <div className={`w-full lg:w-80 ${theme.tier2Bg} rounded-3xl border ${
        portalTheme === 'light' ? 'border-slate-200/70 shadow-xl' : 'border-slate-800/80 shadow-2xl shadow-slate-950/40'
      } p-6 flex flex-col justify-between lg:h-[700px] h-auto shrink-0 transition-all duration-300`}>
        
        <div className="space-y-6">
          {/* Header context with theme selector */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className={`text-base font-bold tracking-tight ${theme.tier2Header}`}>Add Student</h3>
              <p className={`text-xs mt-0.5 leading-relaxed ${theme.tier2Sub}`}>Workspace Portal for Student Registration.</p>
            </div>
            <button 
              type="button" 
              onClick={() => {
                if (portalTheme === 'light') setPortalTheme('dark');
                else if (portalTheme === 'dark') setPortalTheme('blue');
                else setPortalTheme('light');
              }}
              title="Cycle Theme Style" 
              className={`p-2 rounded-lg border transition-all shrink-0 ${
                portalTheme === 'light' 
                  ? 'border-slate-200 hover:bg-slate-200/55 text-slate-500' 
                  : 'border-slate-800 hover:bg-slate-850 text-slate-400'
              }`}
            >
              <Palette className="h-4 w-4" />
            </button>
          </div>

          {/* Search Bar / Search Indicator (directly matches the search style in user's layout) */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search sections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder-slate-400/75 ${theme.inputBg}`}
            />
          </div>

          {/* Section Categories */}
          <div className="space-y-5">
            <div className="space-y-2">
              <span className={`text-[10px] font-black uppercase tracking-widest block pb-1 border-b ${theme.tier2SectionHeader}`}>
                Admission Form Tiers
              </span>
              
              <div className="space-y-1.5">
                {/* 1. Basic Info */}
                <button
                  type="button"
                  onClick={() => handleTabChange('basic')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[13px] transition-all duration-200 ${
                    activeFormTab === 'basic' ? theme.tier2ItemActive : theme.tier2ItemInactive
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <User className="h-4.5 w-4.5" />
                    <span className="font-semibold">My Basic Info</span>
                  </div>
                  {validateTab('basic') === '' && formName.trim() && (
                    <span className="bg-emerald-500 text-white rounded-full p-0.5">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </button>

                {/* 2. Class placement */}
                <button
                  type="button"
                  onClick={() => handleTabChange('class')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[13px] transition-all duration-200 ${
                    activeFormTab === 'class' ? theme.tier2ItemActive : theme.tier2ItemInactive
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-4.5 w-4.5" />
                    <span className="font-semibold">My Class & Section</span>
                  </div>
                  {validateTab('class') === '' && formClassId && (
                    <span className="bg-emerald-500 text-white rounded-full p-0.5">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </button>



                {/* 4. Photo avatar */}
                <button
                  type="button"
                  onClick={() => handleTabChange('photo')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[13px] transition-all duration-200 ${
                    activeFormTab === 'photo' ? theme.tier2ItemActive : theme.tier2ItemInactive
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Image className="h-4.5 w-4.5" />
                    <span className="font-semibold">My Photo Profile</span>
                  </div>
                  <span className="text-[10px] opacity-60">Step 4</span>
                </button>
              </div>
            </div>

            {/* Quick Helper Widget in Tier 2 */}
            <div className={`p-4 rounded-2xl border ${
              portalTheme === 'light' 
                ? 'bg-indigo-50/50 border-indigo-100 text-indigo-950' 
                : 'bg-indigo-950/25 border-indigo-900/60 text-indigo-100'
            }`}>
              <div className="flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-500 animate-pulse">Fast Enrollment</h4>
                  <p className="text-[11px] opacity-75 mt-1 leading-relaxed">
                    Choose standard pre-set templates or pick avatars for fast mock registration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Session Metadata Tag */}
        <div className={`pt-4 border-t text-[11px] font-black uppercase tracking-wider flex items-center justify-between ${
          portalTheme === 'light' ? 'border-slate-150 text-slate-400' : 'border-slate-800 text-slate-500'
        }`}>
          <span>Active Session</span>
          <span className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-extrabold tracking-tight">{session}</span>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          TIER 3 MAIN FORM CONTENT VIEW AREA (RIGHT COLUMN)
          ────────────────────────────────────────────────────────── */}
      <div className={`flex-1 ${theme.mainBg} rounded-3xl border ${
        portalTheme === 'light' ? 'border-slate-200/80 shadow-xl' : 'border-slate-800/80 shadow-2xl shadow-slate-950/40'
      } flex flex-col lg:h-[700px] h-auto relative overflow-hidden transition-all duration-300 z-10`}>
        
        {/* Absolute Background Gradient Grid Flare (Fidelity accent) */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none z-0" />
        
        {/* Form Container */}
        <form onSubmit={handleSubmitEnrollment} noValidate className="flex flex-col h-full w-full max-w-4xl mx-auto z-10 relative">
          
          {/* Header of Content Frame (Pinned) */}
          <div className="p-8 md:p-10 pb-5 border-b border-slate-200/50 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-black text-indigo-600 uppercase tracking-widest">
                  <Sparkles className="h-4 w-4" />
                  <span>Section Level {activeFormTab.toUpperCase()}</span>
                </div>
                <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight mt-1.5 ${theme.headingColor}`}>
                  {activeFormTab === 'basic' && 'Provide Student Identification'}
                  {activeFormTab === 'class' && 'Configure Academic Level'}
                  {activeFormTab === 'photo' && 'Upload Profile Photo'}
                </h2>
                <p className={`text-sm ${theme.subColor} mt-1.5 leading-relaxed`}>
                  {activeFormTab === 'basic' && 'Assign a name, unique class roll number, and verify general fields.'}
                  {activeFormTab === 'class' && 'Pick an existing class and section mapping for this student record.'}
                  {activeFormTab === 'photo' && 'Upload a professional high-quality student portrait.'}
                </p>
              </div>

              {/* Quick Reset Option */}
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Are you sure you want to reset all form inputs?")) {
                    setFormName('');
                    setFormRoll('');
                    setFormEmail('');
                    setFormParentName('');
                    setFormPhone('');
                    setFormAltPhone('');
                    setFormFatherName('');
                    setFormMotherName('');
                    setFormAddress('');
                    setFormPhoto('');
                    setFormPhotoFile(null);
                    setValidationError('');
                    setActiveFormTab('basic');
                  }
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border transition-all hover:shadow-sm ${
                  portalTheme === 'light' 
                    ? 'border-slate-200 hover:bg-slate-50 text-slate-500' 
                    : 'border-slate-800 hover:bg-slate-900 text-slate-450'
                }`}
              >
                <RefreshCw className="h-3 w-3" />
                <span>Reset Fields</span>
              </button>
            </div>
          </div>

          {/* Scrollable Form Body Container */}
          <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-8 scrollbar-thin">
            {/* Validation Error Alerts */}
            {validationError && (
              <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-semibold flex items-start gap-2.5 animate-in fade-in zoom-in-95 duration-200">
                <AlertTriangle className="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Validation Issue Found</span>
                  <p className="opacity-90 mt-0.5 font-medium">{validationError}</p>
                </div>
              </div>
            )}

            {/* Success toast after saving */}
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
                      Student <strong className="text-emerald-950 font-bold">{lastEnrolledName}</strong> has been successfully enrolled into the database for session <strong className="font-bold">{session}</strong>.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* WARNING: Class levels missing message */}
            {activeClasses.length === 0 && (
              <div className="p-4 bg-amber-50 border border-amber-100 text-amber-800 rounded-2xl text-xs flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">No Classes Configured</span>
                  <p className="opacity-95 mt-0.5">
                    You must configure classes and section levels in other tabs before registering new students.
                  </p>
                </div>
              </div>
            )}

            {/* ──────────────────────────────────────────────────────────
                TAB CONTENT SECTIONS
                ────────────────────────────────────────────────────────── */}
            <div className="min-h-[220px]">
            {/* 1. Basic Info */}
            {activeFormTab === 'basic' && (
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
                    onChange={(e) => setFormName(e.target.value)}
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
                    onChange={(e) => setFormFatherName(e.target.value)}
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
                    onChange={(e) => setFormMotherName(e.target.value)}
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
                    onChange={(e) => setFormPhone(e.target.value)}
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
                    onChange={(e) => setFormAltPhone(e.target.value)}
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
                    onChange={(e) => setFormAddress(e.target.value)}
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
                      onChange={(e) => setFormGender(e.target.value)}
                      className={`w-full pl-4 pr-10 py-3 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer shadow-sm ${theme.inputBg}`}
                    >
                      <option value="Male">👦 Male</option>
                      <option value="Female">👧 Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-450">
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
                    onChange={(e) => setFormDob(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-bold shadow-sm ${theme.inputBg}`}
                  />
                </div>

                <div className="space-y-2">
                  <label className={`text-xs font-black uppercase tracking-wider block ${theme.labelColor}`}>
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. student@school.edu"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-bold shadow-sm ${theme.inputBg}`}
                  />
                </div>
              </div>
            )}

            {/* 2. Class & Section mapping */}
            {activeFormTab === 'class' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <label className={`text-xs font-black uppercase tracking-wider block ${theme.labelColor}`}>
                    Academic Class Level <span className="text-indigo-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formClassId}
                      onChange={(e) => setFormClassId(e.target.value)}
                      className={`w-full pl-4 pr-10 py-3 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer shadow-sm ${theme.inputBg}`}
                    >
                      <option value="">-- Choose Class Placement --</option>
                      {activeClasses.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          📚 Class {cls.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-450">
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
                      onChange={(e) => setFormSectionId(e.target.value)}
                      disabled={!formClassId}
                      className={`w-full pl-4 pr-10 py-3 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer disabled:bg-slate-100/55 disabled:cursor-not-allowed shadow-sm ${theme.inputBg}`}
                    >
                      <option value="">-- Choose Physical Section --</option>
                      {formClassSections.map((sec) => (
                        <option key={sec.id} value={sec.id}>
                          🗺️ Section {sec.name} (Limit: {sec.studentLimit} Students)
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-450">
                      <ChevronRight className="h-4 w-4 rotate-90" />
                    </div>
                  </div>
                  {formClassId && formClassSections.length === 0 && (
                    <div className="flex items-center gap-1.5 mt-2 text-amber-600 text-xs font-bold">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>No active sections found for this class in session {session}. Please configure a section in the Sections tab.</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className={`text-xs font-black uppercase tracking-wider block ${theme.labelColor}`}>
                    Roll / ID Number <span className="text-indigo-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 101"
                    value={formRoll}
                    onChange={(e) => setFormRoll(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-mono font-bold shadow-sm ${theme.inputBg}`}
                  />
                </div>
              </div>
            )}



            {/* 4. Photo Upload */}
            {activeFormTab === 'photo' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 relative ${
                    isDragging 
                      ? 'border-indigo-500 bg-indigo-500/5' 
                      : formPhoto 
                        ? 'border-slate-200 bg-slate-50/20' 
                        : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50'
                  }`}
                >
                  <input
                    type="file"
                    id="photo-file-upload"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />

                  {!formPhoto ? (
                    <div className="flex flex-col items-center justify-center py-6 space-y-4">
                      <label htmlFor="photo-file-upload" className="p-4 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors rounded-full cursor-pointer">
                        <Upload className="h-8 w-8 animate-bounce" />
                      </label>
                      <div className="space-y-1.5">
                        <p className={`text-sm font-bold ${theme.headingColor}`}>
                          Drag & drop student photo here, or <label htmlFor="photo-file-upload" className="text-indigo-600 hover:text-indigo-700 cursor-pointer underline font-black">browse files</label>
                        </p>
                        <p className={`text-xs ${theme.subColor}`}>
                          Supports PNG, JPG, JPEG, or GIF (Maximum file size: 2MB)
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-5">
                      {/* Interactive Preview Container */}
                      <div className="relative group">
                        <div className="w-40 h-40 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-slate-100 ring-1 ring-slate-200">
                          <img 
                            src={formPhoto} 
                            alt="Student Portrait Preview" 
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        {/* Status Check badge */}
                        <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-1.5 shadow-md border-2 border-white">
                          <Check className="h-4 w-4" />
                        </div>
                      </div>

                      <div className="space-y-1 text-center">
                        <p className={`text-sm font-bold ${theme.headingColor}`}>
                          Portrait Uploaded Successfully
                        </p>
                        <p className={`text-xs ${theme.subColor}`}>
                          You can drag a different image here or re-upload to overwrite.
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-3">
                        <label 
                          htmlFor="photo-file-upload" 
                          className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          <span>Change Photo</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setFormPhoto('');
                            setFormPhotoFile(null);
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-colors border border-rose-100 cursor-pointer"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span>Remove Photo</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            </div>
          </div>

          {/* ──────────────────────────────────────────────────────────
              FOOTER ACTION CONTROLS
              ────────────────────────────────────────────────────────── */}
          <div className="p-8 md:p-10 pt-5 border-t border-slate-200/50 shrink-0 flex items-center justify-between">
            {/* Previous Step Button */}
            <button
              type="button"
              onClick={handlePrev}
              disabled={activeFormTab === 'basic'}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-35 disabled:cursor-not-allowed ${
                portalTheme === 'light' 
                  ? 'hover:bg-slate-100 text-slate-600' 
                  : 'hover:bg-slate-900 text-slate-350'
              }`}
            >
              Backwards
            </button>

            {/* Next / Submit Trigger */}
            {activeFormTab !== 'photo' ? (
              <button
                key="btn-continue"
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2.5 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/25 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Continue Step</span>
                <ArrowRight className="h-4 w-4 animate-pulse" />
              </button>
            ) : (
              <button
                key="btn-submit"
                type="button"
                onClick={handleSubmitEnrollment}
                disabled={isSaving}
                className="flex items-center gap-2.5 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/25 active:scale-[0.98] transition-all cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{isSaving ? "Saving..." : "Complete Enrollment"}</span>
              </button>
            )}
          </div>

        </form>

        {/* Dynamic Horizontal Progress Bar indicator */}
        <div className="w-full h-1.5 bg-slate-200/40 relative">
          <div 
            className="absolute left-0 top-0 h-full bg-indigo-600 transition-all duration-300"
            style={{
              width: 
                activeFormTab === 'basic' ? '33.3%' :
                activeFormTab === 'class' ? '66.6%' : '100%'
            }}
          />
        </div>

      </div>

    </div>
  );
}
