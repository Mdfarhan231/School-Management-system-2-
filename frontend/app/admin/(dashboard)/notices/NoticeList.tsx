"use client"
import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, Badge, Button } from './ui';
import { CalendarIcon, Eye, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Notice } from '@/types';

interface NoticeListProps {
  notices: Notice[];
  onDelete: (id: string) => void;
  onEdit: (notice: Notice) => void;
}

export const NoticeList: React.FC<NoticeListProps> = ({ notices, onDelete, onEdit }) => {
  const priorityColors: Record<string, string> = {
    low: 'bg-blue-100 text-blue-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700',
    published: 'bg-emerald-100 text-emerald-700',
  };

  if (notices.length === 0) {
    return (
      <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200">
        <p className="text-slate-500 font-medium">No notices found. Create one to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {notices.map((notice, index) => (
        <motion.div
          key={notice.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300 border-slate-200/60 bg-white/80 backdrop-blur-sm group overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row items-start md:items-center p-6 gap-6">
                
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={cn("border-none capitalize px-3 py-1", priorityColors[notice.priority])}>
                      {notice.priority} priority
                    </Badge>
                    {/* category is an array — render each as a badge */}
                    {Array.isArray(notice.category)
                      ? notice.category.map(cat => (
                          <Badge key={cat} variant="outline" className="capitalize px-3 py-1 bg-white">
                            {cat}
                          </Badge>
                        ))
                      : notice.category ? (
                          <Badge variant="outline" className="capitalize px-3 py-1 bg-white">
                            {notice.category}
                          </Badge>
                        ) : null}
                    <Badge className={cn("border-none capitalize px-3 py-1 ml-auto md:ml-0", statusColors[notice.status])}>
                      {notice.status}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
                      {notice.title}
                    </h3>
                    <p className="text-slate-500 line-clamp-2 mt-1 text-sm">
                      {notice.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon className="w-4 h-4" />
                      {format(new Date(notice.date), "MMM do, yyyy")}
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 border-l border-slate-200 pl-4">
                      <span className="opacity-70">To:</span>
                      {Array.isArray(notice.category) && notice.category.length
                        ? notice.category.join(', ')
                        : Array.isArray(notice.targetAudience) && notice.targetAudience.length
                        ? notice.targetAudience.join(', ')
                        : 'All'}
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col gap-2 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6 justify-end">

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 md:flex-none justify-start text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                    onClick={() => onEdit(notice)}
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 md:flex-none justify-start text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                    onClick={() => onDelete(notice.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </Button>
                </div>

              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
