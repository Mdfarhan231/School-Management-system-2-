"use client"
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, Button, Input, Textarea, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge, Calendar, Popover, PopoverContent, PopoverTrigger } from './ui';
import { CalendarIcon, Send, Save, Eye, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Notice, NoticeCategory, NoticePriority } from '@/types';

interface NoticeFormProps {
  onSave: (notice: Partial<Notice>) => void;
  onCancel?: () => void;
  initialData?: Partial<Notice>;
}

export const NoticeForm: React.FC<NoticeFormProps> = ({ onSave, onCancel, initialData }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [category, setCategory] = useState<NoticeCategory>((initialData?.category as NoticeCategory) || 'ALL');
  const [priority, setPriority] = useState<NoticePriority>((initialData?.priority as NoticePriority) || 'medium');
  const [date, setDate] = useState<Date>(initialData?.date ? new Date(initialData.date) : new Date());
  const [targetAudience, setTargetAudience] = useState<string[]>(initialData?.targetAudience || []);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleSubmit = (status: 'draft' | 'published') => {
    if (!title || !content) return;
    onSave({
      title,
      content,
      category,
      priority,
      status,
      date: date.toISOString(),
      targetAudience,
      author: 'Admin User', // Hardcoded for now
    });
  };

  const toggleAudience = (audience: string) => {
    setTargetAudience((prev) =>
      prev.includes(audience) ? prev.filter((a) => a !== audience) : [...prev, audience]
    );
  };

  const audiences = ['Students', 'Teachers', 'Homepage'];

  const priorityColors: Record<NoticePriority, string> = {
    low: 'bg-blue-100 text-blue-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 relative z-20">
                <Label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Category</Label>
                <Select value={category} onValueChange={(v: any) => setCategory(v as NoticeCategory)}>
                  <SelectTrigger className="bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">ALL</SelectItem>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Teacher">Teacher</SelectItem>
                    <SelectItem value="Homepage">Homepage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Content</Label>
              <Textarea
                placeholder="Write the detailed announcement here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[200px] bg-slate-50 border-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 items-end">
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
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Target Audience</Label>
                <div className="flex flex-wrap gap-2">
                  {audiences.map((aud) => (
                    <Badge
                      key={aud}
                      variant={targetAudience.includes(aud) ? "default" : "outline"}
                      className="cursor-pointer transition-all duration-200 py-1"
                      onClick={() => toggleAudience(aud)}
                    >
                      {aud}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-slate-100 pt-6">
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onCancel} className="text-slate-500 hover:text-slate-700">
                Cancel
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsPreviewOpen(!isPreviewOpen)} className="gap-2">
                <Eye className="w-4 h-4" /> Preview
              </Button>
              <Button variant="secondary" onClick={() => handleSubmit('draft')} className="gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none">
                <Save className="w-4 h-4" /> Save Draft
              </Button>
              <Button onClick={() => handleSubmit('published')} className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                <Send className="w-4 h-4" /> Publish Notice
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Live Preview Side (Only visible on larger screens) */}
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
                  <div className="flex justify-between items-start">
                    <Badge className="bg-white/20 text-white border-none backdrop-blur-md uppercase tracking-widest text-[10px] px-3 py-1">
                      {category}
                    </Badge>
                    <Badge className={cn("border-none backdrop-blur-md px-3 py-1 uppercase tracking-widest text-[10px] text-white bg-white/20")}>
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
                  <div className="mt-8 flex flex-wrap gap-2 items-center">
                    <span className="text-xs uppercase tracking-widest text-white/50 font-bold">Audience:</span>
                    {targetAudience.length === 0 ? (
                      <span className="text-xs text-white/40 italic">All members</span>
                    ) : (
                      targetAudience.map(t => (
                        <Badge key={t} className="bg-white/20 text-white border-none text-[10px] bg-transparent border">
                          {t}
                        </Badge>
                      ))
                    )}
                  </div>
                </CardContent>
                <CardFooter className="relative z-10 flex flex-col items-start gap-1 border-t border-white/10 pt-4 mt-auto flex-shrink-0">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-white/40">Nexus School Management System</p>
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
