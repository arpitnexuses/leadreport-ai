export interface Report {
  _id: string;
  email: string;
  createdAt: string;
  isCompleted: boolean;
  meetingDate?: string;
  meetingPlatform?: string;
  companyName?: string;
  leadData?: {
    name?: string;
    companyName?: string;
    project?: string;
    status?: 'hot' | 'warm' | 'meeting_scheduled' | 'meeting_rescheduled' | 'meeting_done';
  };
}

export interface ProjectLead {
  project: string;
  count: number;
}

export type TabType = 'dashboard' | 'generate' | 'pipeline' | 'settings'; 