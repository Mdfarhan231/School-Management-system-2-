"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Phone, Clock, Book, User, ArrowRight, CalendarCheck, GraduationCap, Heart, UserCircle2, Bell, LogOut } from 'lucide-react';
import { apiRequest } from '@/lib/api';

export default function StudentDashboardPage() {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [exams, setExams] = useState([]);
  const [notices, setNotices] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const savedStudent = localStorage.getItem("student");
        if (!savedStudent) {
          router.replace("/student/login");
          return;
        }

        const studentData = JSON.parse(savedStudent);
        setStudent(studentData);

        const studentId = studentData.student_id || studentData.id;

        const [examsData, resultsData, noticesData] = await Promise.all([
          studentId ? apiRequest(`/student/exam-routines/${studentId}`).catch(() => []) : Promise.resolve([]),
          studentId ? apiRequest(`/student-results/${studentId}`).catch(() => []) : Promise.resolve([]),
          apiRequest('/notices').catch(() => [])
        ]);

        const sortedExams = Array.isArray(examsData) ? examsData.slice(0, 3) : [];
        setExams(sortedExams);

        const sortedResults = Array.isArray(resultsData) ? resultsData.slice(0, 3) : [];
        setResults(sortedResults);

        const filteredNotices = Array.isArray(noticesData)
          ? noticesData.filter(n => {
              const cat = Array.isArray(n.category) ? n.category : [];
              // Also fall back to targetAudience for older notices
              const audience = Array.isArray(n.targetAudience) ? n.targetAudience : [];
              return (
                cat.length === 0 ||
                cat.includes('ALL') ||
                cat.includes('Student') ||
                audience.includes('ALL') ||
                audience.includes('Students')
              );
            })
          : [];
        setNotices(filteredNotices.slice(0, 3));

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("student");
    router.replace("/student/login");
  };

  const getStudentImage = (picture) => {
    if (!picture) return "/student-demo.png";
    return picture;
  };

  if (loading || !student) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // Parse subjects
  const subjectsList = typeof student.subjects === 'string'
    ? student.subjects.split(',').map(s => s.trim()).filter(Boolean)
    : Array.isArray(student.subjects) ? student.subjects : ['Unassigned'];

  return (
    <div className="max-w-6xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
        <header className="flex flex-col sm:flex-row justify-between sm:items-end pb-4 border-b border-slate-200 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Student Dashboard</h2>
            <p className="text-slate-500 mt-1">Welcome back, {student.name?.split(' ')[0]}!</p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-rose-500 hover:text-rose-600 font-semibold text-sm transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-widest">
              Academic Year 2026-27
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
            <div className="md:w-1/3 bg-slate-900 flex flex-col items-center justify-center p-8 text-center border-r border-slate-800">
              <div className="relative group">
                 <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                 <img 
                   src={getStudentImage(student.picture)} 
                   alt={student.name} 
                   className="relative w-32 h-32 rounded-full border-4 border-slate-800 object-cover shadow-2xl bg-white"
                   referrerPolicy="no-referrer"
                 />
              </div>
              <h3 className="text-xl font-bold text-white mt-4">{student.name}</h3>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-bold mt-2 uppercase tracking-wide border border-blue-500/20">
                Student ID: #{student.student_id || student.id}
              </span>
            </div>

            <div className="p-8 flex-1 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Father's Name</label>
                <div className="flex items-center gap-2 text-slate-700 font-medium truncate">
                  <UserCircle2 size={16} className="text-slate-400 shrink-0" />
                  <span className="truncate" title={student.father_name || 'N/A'}>{student.father_name || 'N/A'}</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Mother's Name</label>
                <div className="flex items-center gap-2 text-slate-700 font-medium truncate">
                  <Heart size={16} className="text-slate-400 shrink-0" />
                  <span className="truncate" title={student.mother_name || 'N/A'}>{student.mother_name || 'N/A'}</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Phone</label>
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <Phone size={16} className="text-slate-400" />
                  <span>{student.phone || 'N/A'}</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Class & Section</label>
                <div className="flex items-center gap-2 text-slate-700 font-medium truncate">
                  <GraduationCap size={16} className="text-slate-400 shrink-0" />
                  <span className="truncate">{student.class_name || 'N/A'} - {student.section || 'N/A'} (Roll: {student.roll || 'N/A'})</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Shift</label>
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <Clock size={16} className="text-slate-400" />
                  <span>{student.shift || 'N/A'} Session</span>
                </div>
              </div>
              <div className="md:col-span-2 space-y-2 pt-2">
                <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Subjects</label>
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

          {/* Notice Board Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Bell size={20} />
              </div>
              <h4 className="font-bold text-slate-900">Notice Board</h4>
            </div>
            
            <div className="space-y-4 flex-1">
              {notices.length > 0 ? notices.map((notice, idx) => (
                 <div key={notice.id || idx} className={`p-4 rounded-2xl ${idx === 0 ? 'bg-blue-50/50 border-blue-100' : 'bg-slate-50 border-slate-100'} border relative group`}>
                    <div className="flex justify-between items-start mb-2">
                       <span className={`text-[10px] font-black uppercase tracking-widest ${idx === 0 ? 'text-blue-500' : 'text-slate-400'}`}>
                          {notice.targetAudience ? (Array.isArray(notice.targetAudience) ? notice.targetAudience.join(', ') : notice.targetAudience) : 'Notice'}
                       </span>
                    </div>
                    <h5 className={`text-sm font-bold ${idx === 0 ? 'text-slate-800 group-hover:text-blue-700' : 'text-slate-700 group-hover:text-slate-900'} leading-snug transition-colors cursor-pointer line-clamp-2`} title={notice.title}>
                      {notice.title}
                    </h5>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{notice.content}</p>
                 </div>
              )) : (
                 <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center text-sm text-slate-500 italic">
                    No recent notices.
                 </div>
              )}
            </div>

            <button className="mt-4 w-full py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-transparent hover:border-blue-100">
               View All Notices
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h4 className="text-lg font-bold text-slate-900">Upcoming Exams</h4>
                <Link href="/student/exam-routine" className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                  Full Schedule <ArrowRight size={14} />
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
                        <h5 className="font-bold text-slate-800">{exam.subject_name || exam.subject}</h5>
                        <p className="text-xs text-slate-500 font-medium">Class: {exam.class_name || exam.class} | {exam.start_time}</p>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-sm text-slate-500 italic">No upcoming exams scheduled.</p>
                )}
             </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h4 className="text-lg font-bold text-slate-900">Recent Results</h4>
                <Link href="/student/results" className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                  Report Card <ArrowRight size={14} />
                </Link>
             </div>
             <div className="space-y-4">
                {results.length > 0 ? results.map((res, idx) => {
                  const totalMarks = (Number(res.written_marks) || 0) + (Number(res.mcq_marks) || 0) + (Number(res.practical_marks) || 0) + (Number(res.assignment_marks) || 0) + (Number(res.viva_marks) || 0) + (Number(res.class_test_marks) || 0);
                  
                  let grade = 'F';
                  if (totalMarks >= 80) grade = 'A+';
                  else if (totalMarks >= 70) grade = 'A';
                  else if (totalMarks >= 60) grade = 'A-';
                  else if (totalMarks >= 50) grade = 'B';
                  else if (totalMarks >= 40) grade = 'C';
                  else if (totalMarks >= 33) grade = 'D';

                  return (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
                      <div className="flex items-center gap-3">
                         <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                            grade === 'A+' ? 'bg-emerald-100 text-emerald-600' : 
                            grade === 'F' ? 'bg-rose-100 text-rose-600' :
                            'bg-blue-100 text-blue-600'
                         }`}>
                            {grade}
                         </div>
                         <div>
                            <h5 className="font-bold text-slate-800 text-sm">{res.subject_name || res.subject || 'Subject'}</h5>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{res.exam_name || 'Exam'}</p>
                         </div>
                      </div>
                      <div className="text-sm font-bold text-slate-600">{totalMarks} / 100</div>
                    </div>
                  );
                }) : (
                  <p className="text-sm text-slate-500 italic">No recent results found.</p>
                )}
             </div>
          </div>
        </div>

      </div>
  );
}