"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, Button, Input, Textarea, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge, Calendar, Popover, PopoverContent, PopoverTrigger } from './ui';
import { CalendarIcon, Send, AlertCircle, CheckSquare, Square } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Notice, NoticeCategory, NoticePriority } from '@/types';

interface NoticeFormProps {
  onSave: (notice: Partial<Notice>) => void;
  onCancel?: () => void;
  initialData?: Partial<Notice>;
}

// All available audience / visibility options
const AUDIENCE_OPTIONS: { value: string; label: string; description: string; color: string }[] = [
  { value: 'ALL',      label: 'All',      description: 'Everyone (Homepage + Students + Teachers)', color: 'indigo' },
  { value: 'Homepage', label: 'Homepage', description: 'Show on the public homepage notice bar',   color: 'violet' },
  { value: 'Student',  label: 'Students', description: 'Visible on the student dashboard',          color: 'blue'   },
  { value: 'Teacher',  label: 'Teachers', description: 'Visible on the teacher dashboard',          color: 'emerald'},
];

function normalizeCategory(raw: any): string[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    // handle PostgreSQL-style "{ALL,Student}" strings
    const trimmed = raw.trim().replace(/^\{/, '').replace(/\}$/, '');
    return trimmed ? trimmed.split(',').map(s => s.trim()) : [];
  }
  return [];
}

export const NoticeForm: React.FC<NoticeFormProps> = ({ onSave, onCancel, initialData }) => {
  const [title, setTitle]       = useState(initialData?.title || '');
  const [content, setContent]   = useState(initialData?.content || '');
  const [category, setCategory] = useState<string[]>(normalizeCategory(initialData?.category));
  const [priority, setPriority] = useState<NoticePriority>((initialData?.priority as NoticePriority) || 'medium');
  const [date, setDate]         = useState<Date>(initialData?.date ? new Date(initialData.date) : new Date());

  // When ALL is toggled on, select every option. When toggled off, clear all.
  const toggleOption = (value: string) => {
    if (value === 'ALL') {
      // Toggle ALL: if already selected deselect everything; otherwise select all
      const allSelected = AUDIENCE_OPTIONS.every(o => category.includes(o.value));
      if (allSelected) {
        setCategory([]);
      } else {
        setCategory(AUDIENCE_OPTIONS.map(o => o.value));
      }
      return;
    }

    setCategory(prev => {
      let next: string[];
      if (prev.includes(value)) {
        next = prev.filter(v => v !== value && v !== 'ALL');
      } else {
        next = [...prev.filter(v => v !== 'ALL'), value];
        // Auto-tick ALL if all three non-ALL options are selected
        const nonAll = AUDIENCE_OPTIONS.filter(o => o.value !== 'ALL').map(o => o.value);
        if (nonAll.every(v => next.includes(v))) {
          next = AUDIENCE_OPTIONS.map(o => o.value);
        }
      }
      return next;
    });
  };

  const isAllChecked = AUDIENCE_OPTIONS.every(o => category.includes(o.value));

  const handleSubmit = () => {
    if (!title || !content || category.length === 0) return;
    onSave({
      id: initialData?.id,
      title,
      content,
      category,
      priority,
      status: 'published',
      date: date.toISOString(),
      targetAudience: category,   // keep targetAudience in sync for backward-compat
      author: 'Admin User',
    });
  };

  const priorityColors: Record<NoticePriority, string> = {
    low:    'bg-blue-100 text-blue-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high:   'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
  };

  const optionColorMap: Record<string, string> = {
    indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    violet: 'border-violet-200 bg-violet-50 text-violet-700',
    blue:   'border-blue-200 bg-blue-50 text-blue-700',
    emerald:'border-emerald-200 bg-emerald-50 text-emerald-700',
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold tracking-tight text-slate-800">Create New Notice</CardTitle>
                <CardDescription>Draft and publish announcements for the school community.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Notice Title</Label>
              <Input
                id="title"
                placeholder="e.g., Annual Sports Meet 2024"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-slate-50 border-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              />
            </div>

            {/* Visibility / Category — multi-select checkboxes */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                Visible To <span className="text-rose-500 ml-0.5">*</span>
              </Label>
              <p className="text-xs text-slate-400 -mt-1">Select one or more audiences. Selecting <strong>All</strong> includes Homepage, Students &amp; Teachers.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AUDIENCE_OPTIONS.map(opt => {
                  const checked = category.includes(opt.value);
                  const colorCls = checked ? optionColorMap[opt.color] : 'border-slate-200 bg-white text-slate-600';
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleOption(opt.value)}
                      className={cn(
                        'flex items-start gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all duration-200 hover:shadow-sm',
                        colorCls
                      )}
                    >
                      <span className="mt-0.5 shrink-0">
                        {checked
                          ? <CheckSquare className="w-4 h-4" />
                          : <Square className="w-4 h-4 text-slate-300" />}
                      </span>
                      <span>
                        <span className="block text-sm font-bold leading-tight">{opt.label}</span>
                        <span className="block text-xs opacity-70 mt-0.5 leading-snug">{opt.description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              {category.length === 0 && (
                <p className="text-xs text-rose-500 font-medium">Please select at least one audience.</p>
              )}
            </div>

            {/* Priority */}
            <div className="space-y-2 relative z-10">
              <Label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Priority</Label>
              <Select value={priority} onValueChange={(v: any) => setPriority(v as NoticePriority)}>
                <SelectTrigger className="bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Content</Label>
              <Textarea
                placeholder="Write the detailed announcement here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[160px] bg-slate-50 border-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Notice Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal bg-slate-50 border-slate-200",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d: any) => d && setDate(d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-slate-100 pt-6">
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onCancel} className="text-slate-500 hover:text-slate-700">
                Cancel
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleSubmit()}
                disabled={category.length === 0 || !title || !content}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" /> {initialData?.id ? 'Update Notice' : 'Publish Notice'}
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Live Preview Side */}
        <div className="hidden lg:block">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-8"
            >
              <Card className="border-none shadow-2xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white overflow-hidden min-h-[500px] flex flex-col">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <AlertCircle size={200} />
                </div>
                <CardHeader className="relative z-10 flex-shrink-0">
                  <div className="flex flex-wrap gap-2 items-start">
                    {category.length > 0 ? category.map(c => (
                      <Badge key={c} className="bg-white/20 text-white border-none backdrop-blur-md uppercase tracking-widest text-[10px] px-3 py-1">
                        {c}
                      </Badge>
                    )) : (
                      <Badge className="bg-white/10 text-white/40 border-none text-[10px] px-3 py-1">No audience selected</Badge>
                    )}
                    <Badge className={cn("border-none backdrop-blur-md px-3 py-1 uppercase tracking-widest text-[10px] text-white bg-white/20 ml-auto")}>
                      {priority} priority
                    </Badge>
                  </div>
                  <CardTitle className="text-3xl font-bold mt-4 leading-tight">
                    {title || 'Your Notice Title Here'}
                  </CardTitle>
                  <CardDescription className="text-white/70 italic text-sm mt-2 flex items-center gap-2">
                    <CalendarIcon className="w-3 h-3" />
                    {format(date, "MMMM do, yyyy")} • By Administration
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10 pt-6 flex-grow flex flex-col">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 flex-grow text-white/90 leading-relaxed whitespace-pre-wrap">
                    {content || 'Enter notice content to see how it will look to the community...'}
                  </div>
                  <div className="mt-6 p-4 bg-white/10 rounded-xl">
                    <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-2">Who can see this notice</p>
                    {category.length === 0 ? (
                      <p className="text-xs text-white/40 italic">No audience selected yet</p>
                    ) : category.includes('ALL') ? (
                      <p className="text-xs text-white font-semibold">✓ Everyone — Homepage, Students &amp; Teachers</p>
                    ) : (
                      <ul className="space-y-1">
                        {category.includes('Homepage') && <li className="text-xs text-white/80">✓ Public Homepage</li>}
                        {category.includes('Student')  && <li className="text-xs text-white/80">✓ Student Dashboard</li>}
                        {category.includes('Teacher')  && <li className="text-xs text-white/80">✓ Teacher Dashboard</li>}
                      </ul>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="relative z-10 flex flex-col items-start gap-1 border-t border-white/10 pt-4 mt-auto flex-shrink-0">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-white/40">GKS School Management System</p>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-white/40">Official Announcement Portal</p>
                </CardFooter>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
