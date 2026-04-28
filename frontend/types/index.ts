export type NoticeCategory = 'ALL' | 'Student' | 'Teacher' | 'Homepage';
export type NoticePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: NoticeCategory;
  priority: NoticePriority;
  status: 'draft' | 'published';
  date: string;
  author: string;
  targetAudience: string[];
}
