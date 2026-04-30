export type NoticeCategory = 'ALL' | 'Student' | 'Teacher' | 'Homepage';
export type NoticePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notice {
  id: string;
  title: string;
  content: string;
  // category is now a multi-select array, e.g. ['Student', 'Homepage']
  // If it contains 'ALL', everyone can see it
  category: string[];
  priority: NoticePriority;
  status: 'draft' | 'published';
  date: string;
  author: string;
  targetAudience: string[];
}
