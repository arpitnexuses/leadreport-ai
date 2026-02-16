export interface Report {
  _id: string;
  email: string;
  reportOwnerName?: string;
  createdAt: string;
  isCompleted: boolean;
  meetingDate?: string;
  meetingTime?: string;
  meetingTimezone?: string;
  meetingPlatform?: string;
  meetingLink?: string;
  meetingLocation?: string;
  meetingObjective?: string;
  companyName?: string;
  leadData?: {
    name?: string;
    companyName?: string;
    project?: string;
    status?: 'hot' | 'warm' | 'meeting_scheduled' | 'meeting_rescheduled' | 'meeting_done';
    leadIndustry?: string;
    leadDesignation?: string;
    leadBackground?: string;
    companyOverview?: string;
    companyWebsite?: string;
    engagementTimeline?: {
      id: string;
      type: 'call' | 'email' | 'meeting' | 'note';
      content: string;
      createdAt: Date | string;
    }[];
    notes?: {
      id: string;
      content: string;
      createdAt: Date | string;
      updatedAt: Date | string;
    }[];
  };
}

export interface ProjectLead {
  project: string;
  count: number;
}

export type TabType = 'dashboard' | 'generate' | 'pipeline' | 'settings' | 'users'; 