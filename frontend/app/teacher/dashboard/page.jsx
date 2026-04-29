"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { Mail, Phone, Clock, Book, User, ArrowRight, CalendarCheck, LogOut } from 'lucide-react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';

const TeacherDashboardPage = () => {
  const router = useRouter();
  const [teacher, setTeacher] = useState(null);
  const [stats, setStats] = useState({ studentCount: 0 });
  const [exams, setExams] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const savedTeacher = localStorage.getItem("teacher");
        if (!savedTeacher) {
          router.replace("/teacher/login");
          return;
        }
        
        const teacherData = JSON.parse(savedTeacher);
        setTeacher(teacherData);

        // Determine teacher ID from localStorage payload
        const teacherId = teacherData.id || teacherData.teacher_id;

        // Fetch stats, exams, and notices concurrently
        const [statsData, examsData, noticesData] = await Promise.all([
          apiRequest('/dashboard/stats').catch(() => ({ student_count: 0 })),
          teacherId ? apiRequest(`/teacher/exam-routines/${teacherId}`).catch(() => []) : Promise.resolve([]),
          apiRequest('/notices').catch(() => [])
        ]);

        setStats({ studentCount: statsData.student_count || 0 });
        
        // Process exams (get top 3 upcoming)
        const sortedExams = Array.isArray(examsData) 
            ? examsData.slice(0, 3) 
            : [];
        setExams(sortedExams);

        // Process notices (get top 2 recent)
        // Filter notices to 'ALL' or 'Teachers' if target_audience is available
        const filteredNotices = Array.isArray(noticesData)
            ? noticesData.filter(n => !n.targetAudience || n.targetAudience.includes('ALL') || n.targetAudience.includes('Teachers') || n.targetAudience.length === 0)
            : [];
        setNotices(filteredNotices.slice(0, 2));

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("teacher");
    router.replace("/teacher/login");
  };

  const getTeacherImage = (picture) => {
    if (!picture) return "/teacher-demo.png";
    return picture;
  };

  if (loading || !teacher) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600 font-medium">Loading Dashboard...</p>
        </div>
      </main>
    );
  }

  // Parse subjects
  const subjectsList = typeof teacher.subjects === 'string' 
    ? teacher.subjects.split(',').map(s => s.trim()).filter(Boolean) 
    : Array.isArray(teacher.subjects) ? teacher.subjects : ['Unassigned'];

  return (
    <main className="flex min-h-screen flex-col bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-6xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
        
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end pb-4 border-b border-slate-200 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Teacher Dashboard</h2>
            <p className="text-slate-500 mt-1">Welcome back, {teacher.name?.split(' ')[0]}!</p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-widest">
              Academic Year 2026-27
            </div>
            <button 
              onClick={handleLogout}
              className="text-xs flex items-center gap-1 text-red-500 hover:text-red-600 font-semibold transition-colors"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
            <div className="md:w-1/3 bg-slate-900 flex flex-col items-center justify-center p-8 text-center border-r border-slate-800">
              <div className="relative group">
                 <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                 <img 
                   src={getTeacherImage(teacher.picture)} 
                   alt={teacher.name} 
                   className="relative w-32 h-32 rounded-full border-4 border-slate-800 object-cover shadow-2xl"
                   referrerPolicy="no-referrer"
                 />
              </div>
              <h3 className="text-xl font-bold text-white mt-4">{teacher.name}</h3>
              <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-bold mt-2 uppercase tracking-wide border border-indigo-500/20">
                Teacher
              </span>
            </div>

            <div className="p-8 flex-1 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Teacher ID</label>
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <User size={16} className="text-slate-400" />
                  <span>#{teacher.teacher_id || teacher.id}</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Shift</label>
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <Clock size={16} className="text-slate-400" />
                  <span>{teacher.shift || 'Morning'} Session</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Email Address</label>
                <div className="flex items-center gap-2 text-slate-700 font-medium truncate">
                  <Mail size={16} className="text-slate-400" />
                  <span className="truncate" title={teacher.email || 'N/A'}>{teacher.email || 'N/A'}</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Contact Number</label>
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <Phone size={16} className="text-slate-400" />
                  <span>{teacher.phone || 'N/A'}</span>
                </div>
              </div>
              <div className="md:col-span-2 space-y-2 pt-2">
                <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Assigned Subjects</label>
                <div className="flex flex-wrap gap-2">
                  {subjectsList.map((subject, idx) => (
                    <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold flex items-center gap-2">
                      <Book size={14} />
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-600/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <User size={80} />
              </div>
              <h4 className="text-indigo-100 text-sm font-semibold uppercase tracking-wider mb-2">Total Students</h4>
              <div className="text-4xl font-bold">{stats.studentCount}</div>
              <div className="mt-4 flex items-center text-xs text-indigo-200">
                Across all classes
              </div>
            </div>
            
            <div className="bg-emerald-500 rounded-3xl p-6 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <CalendarCheck size={80} />
              </div>
              <h4 className="text-emerald-50 text-sm font-semibold uppercase tracking-wider mb-2">Today's Attendance</h4>
              <div className="text-4xl font-bold">--%</div>
              <div className="mt-4 flex items-center text-xs text-emerald-100">
                 Regular session
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Exams */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h4 className="text-lg font-bold text-slate-900">Upcoming Exams</h4>
                <Link href="/teacher/exam-routine" className="text-indigo-600 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                  Full Routine <ArrowRight size={14} />
                </Link>
             </div>
             <div className="space-y-4">
                {exams.length > 0 ? exams.map((exam, idx) => {
                  const examDate = new Date(exam.exam_date || exam.date || new Date());
                  const month = examDate.toLocaleString('default', { month: 'short' });
                  const day = examDate.getDate();
                  return (
                    <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex flex-col items-center justify-center text-slate-700 font-bold leading-none shrink-0">
                        <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">{month}</span>
                        {day}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-bold text-slate-800">{exam.subject_name || exam.subject || 'Unknown Subject'}</h5>
                        <p className="text-xs text-slate-500 font-medium">Class: {exam.class_name || exam.class || 'N/A'} | {exam.start_time || 'N/A'}</p>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-sm text-slate-500 italic">No upcoming exams scheduled.</p>
                )}
             </div>
          </div>

          {/* Recent Notices */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h4 className="text-lg font-bold text-slate-900">Recent Notices</h4>
             </div>
             <div className="space-y-6">
                {notices.length > 0 ? notices.map((notice, idx) => (
                  <div key={notice.id || idx} className={`relative pl-6 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-0.5 ${idx === 0 ? 'before:bg-indigo-500 after:bg-indigo-500' : 'before:bg-slate-200 after:bg-slate-300'} after:absolute after:left-[-3px] after:top-1 after:w-2 after:h-2 after:rounded-full text-slate-400`}>
                    <h5 className={`font-bold text-sm ${idx === 0 ? 'text-slate-800' : 'text-slate-700'}`}>{notice.title}</h5>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{notice.content}</p>
                  </div>
                )) : (
                  <p className="text-sm text-slate-500 italic">No recent notices available.</p>
                )}
             </div>
          </div>
        </div>
        
        {/* Navigation Quick Links */}
        <div className="pt-4 border-t border-slate-200">
           <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Quick Actions</h4>
           <div className="flex flex-wrap gap-3">
              <Link href="/teacher/exam-routine" className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition">Exam Routine</Link>
              <Link href="/teacher/attendance" className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition">Take Attendance</Link>
              <Link href="/teacher/attendance-history" className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition">Attendance History</Link>
              <Link href="/teacher/marks-entry" className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition">Marks Entry</Link>
           </div>
        </div>

      </div>
    </main>
  );
};

export default TeacherDashboardPage;