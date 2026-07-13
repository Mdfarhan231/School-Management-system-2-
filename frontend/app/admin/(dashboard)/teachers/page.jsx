"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiRequest } from "@/lib/api";
import { 
  User, 
  Briefcase, 
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
  Mail,
  Calendar,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function toArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.subjects)) return payload.subjects;
  return [];
}

function normalizeSubject(item) {
  return {
    id: String(item.subject_id ?? item.id),
    subject_id: item.subject_id ?? item.id,
    name: item.subject_name ?? item.name ?? "Untitled Subject",
    code: item.subject_code ?? item.code ?? `SUB-${item.subject_id ?? item.id}`,
  };
}

export default function TeacherManagementView({ session }) {
  // Active Tab/Tier Navigation
  const [activeFormTab, setActiveFormTab] = useState('basic');

  // Input States
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDesignation, setFormDesignation] = useState('');
  const [formShift, setFormShift] = useState('');
  const [formSubjects, setFormSubjects] = useState([]); // Multiple selection array
  const [formJoiningDate, setFormJoiningDate] = useState('');
  const [formPhoto, setFormPhoto] = useState('');
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [formPhotoFile, setFormPhotoFile] = useState(null);
  const [isSubjectsLoading, setIsSubjectsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // UI Flow States
  const [validationError, setValidationError] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [lastEnrolledName, setLastEnrolledName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Interface Visual Theme
  const [portalTheme, setPortalTheme] = useState('light');

  const loadSubjects = useCallback(async () => {
    try {
      setIsSubjectsLoading(true);
      setValidationError("");

      const payload = await apiRequest("/subjects");
      setAvailableSubjects(toArray(payload).map(normalizeSubject));
    } catch (err) {
      setValidationError(err.message || "Failed to load subjects.");
    } finally {
      setIsSubjectsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  // Preset Option Data
  const designations = [
    "Headmaster",
    "Assistant Headmaster",
    "Senior Teacher",
    "Junior Teacher",
    "Lecturer",
    "Assistant Lecturer",
    "Physical Education Trainer",
    "Creative Arts Educator",
    "Music Instructor"
  ];

  const shifts = [
    { label: "Morning Shift", value: "Morning" },
    { label: "Day Shift", value: "Day" },
  ];

  // Drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handlePhotoUpload = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setValidationError("Please upload an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setValidationError("File size exceeds 2MB limit.");
      return;
    }

    setFormPhotoFile(file);
    setFormPhoto(URL.createObjectURL(file));
    setValidationError("");
  };

  // Validate fields for current tab selection
  const validateTab = (tabId) => {
    if (tabId === 'basic') {
      if (!formName.trim()) return "Full Name is required.";
      if (!formEmail.trim()) return "Email address is required.";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formEmail)) return "Please enter a valid email address.";
      if (!formPhone.trim()) return "Primary mobile phone is required.";
    }
    if (tabId === 'work') {
      if (!formDesignation) return "Please choose a professional designation.";
      if (!formShift) return "Please select a shift.";
      if (formSubjects.length === 0) return "Please choose at least one interest subject.";
      if (!formJoiningDate) return "Please specify a joining date.";
    }
    return '';
  };

  // Switch tabs & validate
  const handleTabChange = (targetTabId) => {
    setValidationError('');
    const activeTabs = ['basic', 'work', 'photo'];
    const currentIndex = activeTabs.indexOf(activeFormTab);
    const targetIndex = activeTabs.indexOf(targetTabId);

    if (targetIndex > currentIndex) {
      for (let i = currentIndex; i < targetIndex; i++) {
        const error = validateTab(activeTabs[i]);
        if (error) {
          setValidationError(`[${activeTabs[i].toUpperCase()} INFO] ${error}`);
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
    const activeTabs = ['basic', 'work', 'photo'];
    const currentIndex = activeTabs.indexOf(activeFormTab);

    const error = validateTab(activeFormTab);
    if (error) {
      setValidationError(error);
      return;
    }

    if (currentIndex < activeTabs.length - 1) {
      setActiveFormTab(activeTabs[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    setValidationError('');
    const activeTabs = ['basic', 'work', 'photo'];
    const currentIndex = activeTabs.indexOf(activeFormTab);
    if (currentIndex > 0) {
      setActiveFormTab(activeTabs[currentIndex - 1]);
    }
  };

  // Toggle interest subjects selection
  const handleSubjectToggle = (subjectId) => {
    const id = String(subjectId);

    if (formSubjects.includes(id)) {
      setFormSubjects(formSubjects.filter((item) => item !== id));
    } else {
      setFormSubjects([...formSubjects, id]);
    }
  };

  // Handle Form Submission
  const handleSubmitEnrollment = async (e) => {
    if (e) e.preventDefault();

    setValidationError('');

    const basicError = validateTab('basic');
    if (basicError) {
      setValidationError(`[BASIC INFO] ${basicError}`);
      setActiveFormTab('basic');
      return;
    }

    const workError = validateTab('work');
    if (workError) {
      setValidationError(`[PROFESSIONAL INFO] ${workError}`);
      setActiveFormTab('work');
      return;
    }

    try {
      setIsSaving(true);

      const submitData = new FormData();

      submitData.append("name", formName.trim());
      submitData.append("email", formEmail.trim());
      submitData.append("phone", formPhone.trim());
      submitData.append("designation", formDesignation);
      submitData.append("shift", formShift);
      submitData.append("joiningDate", formJoiningDate);

      formSubjects.forEach((subjectId) => {
        submitData.append("subject_ids[]", subjectId);
      });

      if (formPhotoFile) {
        submitData.append("picture", formPhotoFile);
      }

      await apiRequest("/teachers", "POST", submitData);

      setLastEnrolledName(formName.trim());
      setShowSuccessToast(true);

      setFormName("");
      setFormEmail("");
      setFormPhone("");
      setFormDesignation("");
      setFormShift("");
      setFormSubjects([]);
      setFormJoiningDate("");
      setFormPhoto("");
      setFormPhotoFile(null);
      setActiveFormTab("basic");

      setTimeout(() => {
        setShowSuccessToast(false);
      }, 6000);
    } catch (err) {
      setValidationError(err.message || "Teacher add failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const getThemeClasses = () => {
    switch (portalTheme) {
      case 'dark':
        return {
          tier1Bg: 'bg-[#121214] border-[#1C1C22]',
          tier1IconActive: 'bg-indigo-600 text-white shadow-md shadow-indigo-900',
          tier1IconInactive: 'text-slate-400 hover:bg-slate-900 hover:text-white',
          tier2Bg: 'bg-[#09090B]',
          tier2Header: 'text-white font-extrabold',
          tier2Sub: 'text-slate-400',
          tier2ItemActive: 'bg-indigo-600 text-white border border-indigo-500 font-bold shadow-lg shadow-indigo-950/40',
          tier2ItemInactive: 'text-slate-400 hover:bg-slate-900 hover:text-white',
          tier2SectionHeader: 'text-slate-500 border-slate-800',
          mainBg: 'bg-[#09090B] text-slate-100',
          cardBg: 'bg-[#18181B] border-slate-800 shadow-2xl',
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
      } p-6 flex flex-col justify-between lg:h-[calc(100vh-140px)] lg:min-h-[550px] h-auto shrink-0 transition-all duration-300`}>
        
        <div className="space-y-6">
          {/* Header context with theme selector */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className={`text-base font-bold tracking-tight ${theme.tier2Header}`}>Add Teacher</h3>
              <p className={`text-xs mt-0.5 leading-relaxed ${theme.tier2Sub}`}>Workspace Portal for Faculty Onboarding.</p>
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

          {/* Search Bar */}
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
                Onboarding Form Tiers
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

                {/* 2. Professional Work Info */}
                <button
                  type="button"
                  onClick={() => handleTabChange('work')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[13px] transition-all duration-200 ${
                    activeFormTab === 'work' ? theme.tier2ItemActive : theme.tier2ItemInactive
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-4.5 w-4.5" />
                    <span className="font-semibold">My Professional Info</span>
                  </div>
                  {validateTab('work') === '' && formDesignation && (
                    <span className="bg-emerald-500 text-white rounded-full p-0.5">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </button>

                {/* 3. Photo avatar */}
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
                  <span className="text-[10px] opacity-60">Step 3</span>
                </button>
              </div>
            </div>

            {/* Quick Helper Widget */}
            <div className={`p-4 rounded-2xl border ${
              portalTheme === 'light' 
                ? 'bg-emerald-50/50 border-emerald-100 text-emerald-950' 
                : 'bg-emerald-950/25 border-emerald-900/60 text-emerald-100'
            }`}>
              <div className="flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600">Faculty Registration</h4>
                  <p className="text-[11px] opacity-75 mt-1 leading-relaxed">
                    Set professional records, shifts, and assign active curriculum subjects effortlessly.
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
          <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-extrabold tracking-tight">{session}</span>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          TIER 3 MAIN FORM CONTENT VIEW AREA (RIGHT COLUMN)
          ────────────────────────────────────────────────────────── */}
      <div className={`flex-1 ${theme.mainBg} rounded-3xl border ${
        portalTheme === 'light' ? 'border-slate-200/80 shadow-xl' : 'border-slate-800/80 shadow-2xl shadow-slate-950/40'
      } flex flex-col lg:h-[calc(100vh-140px)] lg:min-h-[550px] h-auto relative overflow-hidden transition-all duration-300 z-10`}>
        
        {/* Absolute Background Gradient Grid Flare */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none z-0" />
        
        {/* Form Container */}
        <form onSubmit={handleSubmitEnrollment} noValidate className="flex flex-col h-full w-full max-w-4xl mx-auto z-10 relative">
          
          {/* Header of Content Frame (Pinned) */}
          <div className="p-8 md:p-10 pb-5 border-b border-slate-200/50 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-black text-emerald-600 uppercase tracking-widest">
                  <Sparkles className="h-4 w-4" />
                  <span>Section Level {activeFormTab.toUpperCase()}</span>
                </div>
                <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight mt-1.5 ${theme.headingColor}`}>
                  {activeFormTab === 'basic' && 'Provide Teacher Identification'}
                  {activeFormTab === 'work' && 'Configure Professional Details'}
                  {activeFormTab === 'photo' && 'Upload Profile Photo'}
                </h2>
                <p className={`text-sm ${theme.subColor} mt-1.5 leading-relaxed`}>
                  {activeFormTab === 'basic' && 'Provide full name, contact information, and institutional email.'}
                  {activeFormTab === 'work' && 'Define teacher role, active schedules, and interest subjects.'}
                  {activeFormTab === 'photo' && 'Upload a professional high-quality faculty avatar.'}
                </p>
              </div>

              {/* Quick Reset Option */}
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Are you sure you want to reset all form inputs?")) {
                    setFormName('');
                    setFormEmail('');
                    setFormPhone('');
                    setFormDesignation('');
                    setFormShift('');
                    setFormSubjects([]);
                    setFormJoiningDate('');
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
                    <span className="font-black">Teacher Registered Successfully!</span>
                    <p className="opacity-90 mt-0.5">
                      Teacher <strong className="text-emerald-950 font-bold">{lastEnrolledName}</strong> has been successfully added to the database.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ──────────────────────────────────────────────────────────
                TAB CONTENT SECTIONS
                ────────────────────────────────────────────────────────── */}
            <div className="min-h-[220px]">
            
            {/* 1. Basic Info */}
            {activeFormTab === 'basic' && (
              <div className="space-y-6 md:space-y-7 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <label className={`text-xs font-black uppercase tracking-wider block ${theme.labelColor}`}>
                    Full Name <span className="text-indigo-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. MD. Shoisob Jahan Shaikat"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-bold shadow-sm ${theme.inputBg}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-7">
                  <div className="space-y-2">
                    <label className={`text-xs font-black uppercase tracking-wider block ${theme.labelColor}`}>
                      Email <span className="text-indigo-500">*</span>
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
                      <input
                        type="email"
                        required
                        placeholder="e.g. teacher@gmail.com"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-bold shadow-sm ${theme.inputBg}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className={`text-xs font-black uppercase tracking-wider block ${theme.labelColor}`}>
                      Phone <span className="text-indigo-500">*</span>
                    </label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 01XXXXXXXXX"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-mono font-bold shadow-sm ${theme.inputBg}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Professional/Work Details mapping */}
            {activeFormTab === 'work' && (
              <div className="space-y-6 md:space-y-7 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-7">
                  {/* Designation Dropdown */}
                  <div className="space-y-2">
                    <label className={`text-xs font-black uppercase tracking-wider block ${theme.labelColor}`}>
                      Designation <span className="text-indigo-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formDesignation}
                        onChange={(e) => setFormDesignation(e.target.value)}
                        className={`w-full pl-4 pr-10 py-3 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer shadow-sm ${theme.inputBg}`}
                      >
                        <option value="">Select designation</option>
                        {designations.map((desig) => (
                          <option key={desig} value={desig}>
                            💼 {desig}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-450">
                        <ChevronRight className="h-4 w-4 rotate-90" />
                      </div>
                    </div>
                  </div>

                  {/* Shift Dropdown */}
                  <div className="space-y-2">
                    <label className={`text-xs font-black uppercase tracking-wider block ${theme.labelColor}`}>
                      Shift <span className="text-indigo-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formShift}
                        onChange={(e) => setFormShift(e.target.value)}
                        className={`w-full pl-4 pr-10 py-3 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer shadow-sm ${theme.inputBg}`}
                      >
                        <option value="">Select shift</option>
                        {shifts.map((s) => (
                          <option key={s.value} value={s.value}>
                            ☀️ {s.label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-450">
                        <ChevronRight className="h-4 w-4 rotate-90" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interest Subjects Choice (Multi-Select Tags) */}
                <div className="space-y-3">
                  <label className={`text-xs font-black uppercase tracking-wider block ${theme.labelColor}`}>
                    Interest Subjects <span className="text-indigo-500">*</span>
                  </label>
                  <p className={`text-[11px] ${theme.mutedColor} leading-relaxed`}>Select one or more academic disciplines of interest:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {isSubjectsLoading ? (
                      <div className="col-span-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-500">
                        Loading subjects...
                      </div>
                    ) : availableSubjects.length > 0 ? (
                      availableSubjects.map((subject) => {
                        const isSelected = formSubjects.includes(subject.id);

                        return (
                          <button
                            key={subject.id}
                            type="button"
                            onClick={() => handleSubjectToggle(subject.id)}
                            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all text-left ${
                              isSelected
                                ? "bg-emerald-600 border-emerald-500 text-white shadow-sm"
                                : portalTheme === "light"
                                  ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                                  : "bg-[#18181B] hover:bg-[#202024] border-slate-800 text-slate-300"
                            }`}
                          >
                            <BookOpen className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{subject.name}</span>
                          </button>
                        );
                      })
                    ) : (
                      <div className="col-span-full rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-700">
                        Create subjects first from the Manage Subjects tab.
                      </div>
                    )}
                  </div>
                </div>

                {/* Joining Date */}
                <div className="space-y-2">
                  <label className={`text-xs font-black uppercase tracking-wider block ${theme.labelColor}`}>
                    Joining Date <span className="text-indigo-500">*</span>
                  </label>
                  <div className="relative group">
                    <input
                      type="date"
                      required
                      value={formJoiningDate}
                      onChange={(e) => setFormJoiningDate(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-bold shadow-sm ${theme.inputBg}`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. Photo Upload */}
            {activeFormTab === 'photo' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <label className={`text-xs font-black uppercase tracking-wider block ${theme.labelColor}`}>
                    Teacher Photo
                  </label>
                </div>
                
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 relative ${
                    isDragging 
                      ? 'border-emerald-500 bg-emerald-500/5' 
                      : formPhoto 
                        ? 'border-slate-200 bg-slate-50/20' 
                        : 'border-slate-300 hover:border-emerald-400 bg-slate-50/50'
                  }`}
                >
                  <input
                    type="file"
                    id="teacher-photo-upload"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />

                  {!formPhoto ? (
                    <div className="flex flex-col items-center justify-center py-6 space-y-4">
                      <label htmlFor="teacher-photo-upload" className="p-4 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors rounded-full cursor-pointer">
                        <Upload className="h-8 w-8 animate-bounce" />
                      </label>
                      <div className="space-y-2 w-full max-w-md">
                        <p className={`text-sm font-bold ${theme.headingColor}`}>
                          Drag & drop teacher photo here, or <label htmlFor="teacher-photo-upload" className="text-emerald-600 hover:text-emerald-700 cursor-pointer underline font-black">browse files</label>
                        </p>
                        <p className={`text-xs ${theme.subColor}`}>
                          Supports PNG, JPG, JPEG, or GIF (Maximum file size: 2MB)
                        </p>

                        {/* Traditional styled Choose File bar matching layout perfectly */}
                        <div className="pt-4 max-w-sm mx-auto">
                          <div className={`flex items-center justify-between border border-slate-200/80 bg-white rounded-xl p-1.5 pl-3 text-xs`}>
                            <span className="text-slate-400 truncate pr-2">No file chosen</span>
                            <label 
                              htmlFor="teacher-photo-upload" 
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200/85 text-slate-700 rounded-lg font-bold transition-all cursor-pointer inline-flex items-center gap-1 shrink-0"
                            >
                              <Upload className="h-3 w-3" />
                              <span>Choose File</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-5">
                      {/* Interactive Preview Container */}
                      <div className="relative group">
                        <div className="w-40 h-40 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-slate-100 ring-1 ring-slate-200">
                          <img 
                            src={formPhoto} 
                            alt="Teacher Portrait Preview" 
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
                          Faculty Portrait Uploaded Successfully
                        </p>
                        <p className={`text-xs ${theme.subColor}`}>
                          You can drag a different image here or re-upload to overwrite.
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-3">
                        <label 
                          htmlFor="teacher-photo-upload" 
                          className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          <span>Change Photo</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setFormPhoto("");
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
                className="flex items-center gap-2.5 px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/25 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Continue Step</span>
                <ArrowRight className="h-4 w-4 animate-pulse" />
              </button>
            ) : (
              <button
                key="btn-submit"
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2.5 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/25 active:scale-[0.98] transition-all cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{isSaving ? "Adding..." : "Add Teacher"}</span>
              </button>
            )}
          </div>

        </form>

        {/* Dynamic Horizontal Progress Bar indicator */}
        <div className="w-full h-1.5 bg-slate-200/40 relative">
          <div 
            className="absolute left-0 top-0 h-full bg-emerald-600 transition-all duration-300"
            style={{
              width: 
                activeFormTab === 'basic' ? '33.3%' :
                activeFormTab === 'work' ? '66.6%' : '100%'
            }}
          />
        </div>

      </div>

    </div>
  );
}
