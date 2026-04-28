"use client"
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NoticeForm } from './NoticeForm';
import { NoticeList } from './NoticeList';
import { Tabs } from './ui';
import { Plus } from 'lucide-react';
import { Notice } from '@/types';
import { cn } from '@/lib/utils';

const INITIAL_NOTICES: Notice[] = [
  {
    id: '1',
    title: 'Annual Sports Meet 2024',
    content: 'The annual sports meet for the academic year 2024 will be held on May 15th. All students must participate in at least one event.',
    category: 'event',
    priority: 'high',
    status: 'published',
    date: new Date().toISOString(),
    author: 'Principal',
    targetAudience: ['Students', 'Teachers'],
  },
  {
    id: '2',
    title: 'Mid-term Results Declaration',
    content: 'The mid-term results for grades 8-12 will be published on the portal next Monday. Parents are requested to check and sign the digital report.',
    category: 'academic',
    priority: 'urgent',
    status: 'published',
    date: new Date(Date.now() - 86400000).toISOString(),
    author: 'Examination Cell',
    targetAudience: ['Students', 'Parents'],
  },
  {
    id: '3',
    title: 'Summer Vacation Schedule',
    content: 'Summer holidays will commence from June 1st to July 15th. The school will reopen on July 16th with a revised timetable.',
    category: 'holiday',
    priority: 'medium',
    status: 'draft',
    date: new Date(Date.now() - 172800000).toISOString(),
    author: 'Management',
    targetAudience: ['Students', 'Staff'],
  }
];

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>(INITIAL_NOTICES);
  const [activeTab, setActiveTab] = useState('list');

  const handleSaveNotice = (newNotice: Partial<Notice>) => {
    const notice: Notice = {
      ...newNotice as Notice,
      id: Math.random().toString(36).substr(2, 9),
    };
    setNotices([notice, ...notices]);
    setActiveTab('list');
  };

  const handleDeleteNotice = (id: string) => {
    setNotices(notices.filter(n => n.id !== id));
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl font-black text-slate-900 tracking-tight"
            >
                Announcements
            </motion.h2>
            <p className="text-slate-500 font-medium mt-1">Manage official school notices and student communications.</p>
          </div>

          <div className="flex bg-white/50 p-1 rounded-2xl border border-slate-200 shadow-sm backdrop-blur-sm">
             <button
                onClick={() => setActiveTab('list')}
                className={cn(
                    "px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300",
                    activeTab === 'list' ? "bg-white text-indigo-600 shadow-md transform scale-[1.02]" : "text-slate-400 hover:text-slate-600"
                )}
             >
                View History
             </button>
             <button
                onClick={() => setActiveTab('add')}
                className={cn(
                    "px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2",
                    activeTab === 'add' ? "bg-white text-indigo-600 shadow-md transform scale-[1.02]" : "text-slate-400 hover:text-slate-600"
                )}
             >
                <Plus className="w-4 h-4" /> New Notice
             </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <NoticeList 
                notices={notices} 
                onDelete={handleDeleteNotice}
                onEdit={(n) => { console.log('Edit', n); setActiveTab('add'); }} 
                onView={(n) => console.log('View', n)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="add"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4, type: 'spring', damping: 20 }}
            >
              <NoticeForm 
                onSave={handleSaveNotice}
                onCancel={() => setActiveTab('list')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
