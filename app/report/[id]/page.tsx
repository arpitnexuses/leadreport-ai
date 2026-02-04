"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import { AdaptiveImage } from "@/components/ui/adaptive-image";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { ReportSidebar } from "@/components/report/ReportSidebar";
import { LeadQualification } from "@/components/report/LeadQualification";
import { ReportRenderer } from "@/components/report/ReportRenderer";
import { ReportInfoSection } from "@/components/report/ReportInfoSection";
// BACKUP: Old components removed from UI but preserved for future use
// import { MeetingDetailsCard } from "@/components/report/MeetingDetailsCard";
import { SectionToggle } from "@/components/report/SectionToggle";
import { EditableField } from "@/components/report/EditableField";
import { ProfilePictureEditor } from "@/components/report/ProfilePictureEditor";
import { AISectionContent } from "@/components/report/AISectionContent";
// import { CompanyAnalysis } from "@/components/report/CompanyAnalysis";
// import {
//   CompanyInfoCard,
// } from "@/components/report/Sections";
import {
  Building2,
  Mail,
  Phone,
  Linkedin,
  Globe,
  MapPin,
  Users,
  Briefcase,
  Calendar,
  Video,
  Tag,
  Clock,
  Edit,
  Save,
  Plus,
  X,
  FileText,
  CheckCircle2,
  Star,
  Share2,
  AlertCircle,
  Info,
  ChevronRight,
  ChevronDown,
  Shield,
  Cpu,
  Newspaper,
  ArrowRight,
  Sparkles,
  Loader2,
  Zap,
  Send,
  Banknote,
  Users2,
  Landmark,
  Fingerprint,
  MessageCircle,
  Lightbulb,
  AlertOctagon,
  History,
  Check,
  Paperclip,
  Target,
  Bell,
  User,
  ArrowLeft
} from "lucide-react";
import dynamic from "next/dynamic";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LeadData {
  name: string;
  position: string;
  companyName: string;
  photo: string | null;
  contactDetails: {
    email: string;
    phone: string;
    linkedin: string;
  };
  companyDetails: {
    industry: string;
    employees: string;
    headquarters: string;
    website: string;
  };
  leadScoring: {
    rating: string;
    qualificationCriteria: Record<string, string>;
  };
  notes?: { id: string; content: string; createdAt: Date; updatedAt: Date }[];
  engagementTimeline?: { id: string; type: 'call' | 'email' | 'meeting' | 'note'; content: string; createdAt: Date }[];
  tags?: string[];
  status?: string;
  nextFollowUp?: string;
  customFields?: { [key: string]: string };
}

interface ApolloResponse {
  person: {
    name?: string;
    title?: string;
    photo_url?: string;
    phone_number?: string;
    linkedin_url?: string;
    email?: string;
    organization?: {
      name?: string;
      website_url?: string;
      industry?: string;
      employee_count?: string;
      location?: {
        city?: string;
        state?: string;
        country?: string;
      };
      description?: string;
      logo_url?: string;
      funding_stage?: string;
      funding_total?: number | string;
    };
    employment_history?: Array<{
      id?: string;
      title?: string;
      organization_name?: string;
      start_date?: string;
      end_date?: string;
      current?: boolean;
      kind?: string;
      organization?: {
        logo_url?: string;
      };
    }>;
    skills?: string[];
    languages?: Array<{
      language?: string;
      name?: string;
      proficiency?: string;
      level?: string;
    }>;
  };
}

interface LeadReport {
  _id: string;
  email: string;
  reportOwnerName?: string;
  apolloData: ApolloResponse;
  report: string;
  leadData: LeadData;
  createdAt: Date;
  status: string;
  error?: string;
  meetingDate?: string;
  meetingTime?: string;
  meetingTimezone?: string;
  meetingPlatform?: string;
  meetingLink?: string;
  meetingLocation?: string;
  meetingObjective?: string;
  problemPitch?: string;
  meetingAgenda?: string;
  participants?: { name: string; title: string; organization: string; isClient?: boolean }[];
  nextSteps?: { description: string; dueDate: string; priority: string; completed: boolean }[];
  recommendedActions?: { title: string; description: string; actionType: string }[];
  followUpTimeline?: { title: string; day: string; description: string; isCompleted: boolean }[];
  talkingPoints?: { title: string; content: string }[];
  aiContent?: Record<string, any>;
  sections?: {
    overview: boolean;
    company: boolean;
    meeting: boolean;
    interactions: boolean;
    competitors: boolean;
    techStack: boolean;
    news: boolean;
    nextSteps: boolean;
  };
}

const ReportLoader = dynamic(
  () => import("./ReportLoader").then((mod) => mod.ReportLoader),
  { ssr: false }
);

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [report, setReport] = useState<LeadReport | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<{
    notes: { id: string; content: string; createdAt: Date; updatedAt: Date }[];
    engagementTimeline: { id: string; type: 'call' | 'email' | 'meeting' | 'note'; content: string; createdAt: Date }[];
    tags: string[];
    status: string;
    nextFollowUp: string;
    customFields: { [key: string]: string };
  }>({
    notes: [],
    engagementTimeline: [],
    tags: [],
    status: "warm",
    nextFollowUp: "",
    customFields: {},
  });
  const [newNote, setNewNote] = useState("");
  const [editedLeadData, setEditedLeadData] = useState<LeadData | null>(null);
  const [editedSkills, setEditedSkills] = useState<string[]>([]);
  const [editedLanguages, setEditedLanguages] = useState<
    { name: string; level: string }[]
  >([]);
  const [isSaving, setIsSaving] = useState(false);
  const [aiContent, setAiContent] = useState<Record<string, any>>({});
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [sections, setSections] = useState({
    overview: true,
    company: true,
    meeting: true,
    interactions: true,
    competitors: true,
    techStack: true,
    news: true,
    nextSteps: true
  });
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityType, setActivityType] = useState<'call' | 'email' | 'meeting' | 'note'>('call');
  const [activityContent, setActivityContent] = useState('');

  useEffect(() => {
    if (report) {
      const skillsFromData = ((report.apolloData?.person as any)?.skills || []).map(
        (s: string) => s
      );
      const skillsData = skillsFromData.length > 0 ? skillsFromData : [];
      
      const languagesFromData = ((report.apolloData?.person as any)?.languages || []).map(
        (l: any) => ({
          name: l.language || l.name || "",
          level: l.proficiency || l.level || "",
        })
      );
      const languagesData = languagesFromData.length > 0 ? languagesFromData : [];
      
      const loadedNotes = report.leadData.notes || [];
      const loadedTimeline = report.leadData.engagementTimeline || [];
      console.log('Loading notes from report:', loadedNotes);
      console.log('Loading timeline from report:', loadedTimeline);
      
      setEditedData({
        notes: loadedNotes,
        engagementTimeline: loadedTimeline,
        tags: report.leadData.tags || [],
        status: report.leadData.status || "warm",
        nextFollowUp: report.leadData.nextFollowUp
          ? new Date(report.leadData.nextFollowUp).toISOString().split("T")[0]
          : "",
        customFields: report.leadData.customFields || {},
      });
      
      setEditedLeadData(JSON.parse(JSON.stringify(report.leadData)));
      setEditedSkills(skillsData);
      setEditedLanguages(languagesData);
      
      if (report.aiContent) {
        setAiContent(report.aiContent);
      }
      
      if (report.sections) {
        setSections(report.sections);
      }
    }
  }, [report]);

  // Auto-generate strategic brief if not present
  useEffect(() => {
    if (report?.leadData && !aiContent?.strategicBrief && !isGeneratingAI) {
      fetch('/api/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'strategicBrief',
          leadData: report.leadData,
          apolloData: report.apolloData?.person
        })
      })
      .then(res => res.json())
      .then(data => {
        if (!data.insufficient_data && !data.error) {
          handleAiContentUpdate('strategicBrief', data);
        }
      })
      .catch(err => console.error('Failed to generate strategic brief:', err));
    }
  }, [report, aiContent, isGeneratingAI]);

  const handleReportReady = (loadedReport: LeadReport) => {
    setReport(loadedReport);
    
    if (loadedReport && (!loadedReport.aiContent || Object.keys(loadedReport.aiContent).length === 0)) {
      setIsGeneratingAI(true);
      generateAllAIContent(loadedReport);
    }
  };

  const generateAllAIContent = async (reportData: LeadReport) => {
    if (!reportData || !reportData.leadData) return;
    
    setIsGeneratingAI(true);
    
    const validSectionKeys = ['overview', 'company', 'meeting', 'interactions', 'competitors', 'techStack', 'news', 'nextSteps'] as const;
    type SectionKey = typeof validSectionKeys[number];
    
    const sectionKeys = Object.keys(sections)
      .filter(key => validSectionKeys.includes(key as SectionKey) && sections[key as keyof typeof sections]);
    
    const totalSections = sectionKeys.length;
    
    if (totalSections === 0) {
      setIsSaving(false);
      setIsGeneratingAI(false);
      return;
    }
    
    const newContent: Record<string, any> = {};
    
    try {
      for (const section of sectionKeys) {
        const response = await fetch('/api/ai-generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            section,
            leadData: reportData.leadData,
            apolloData: reportData.apolloData
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          newContent[section] = result;
        }
      }
      
      setAiContent(newContent);
      
      const saveResponse = await fetch(`/api/reports/${reportData._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aiContent: newContent
        }),
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to save AI content");
      }
      
      const updatedReportResponse = await saveResponse.json();
      setReport(updatedReportResponse);
    } catch (error) {
      // Error handling
    } finally {
      setIsSaving(false);
      setIsGeneratingAI(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const currentReport = report;
      
      // Merge editedData back into editedLeadData
      const mergedLeadData = {
        ...editedLeadData,
        notes: editedData.notes,
        engagementTimeline: editedData.engagementTimeline,
        tags: editedData.tags,
        status: editedData.status,
        nextFollowUp: editedData.nextFollowUp,
        customFields: editedData.customFields
      };
      
      const response = await fetch(`/api/reports/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadData: mergedLeadData,
          skills: editedSkills,
          languages: editedLanguages,
          aiContent: aiContent,
          sections: sections,
          reportOwnerName: currentReport?.reportOwnerName,
          meetingDate: currentReport?.meetingDate,
          meetingTime: currentReport?.meetingTime,
          meetingTimezone: currentReport?.meetingTimezone,
          meetingPlatform: currentReport?.meetingPlatform,
          meetingLink: currentReport?.meetingLink,
          meetingLocation: currentReport?.meetingLocation,
          meetingObjective: currentReport?.meetingObjective,
          meetingAgenda: currentReport?.meetingAgenda
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update report");
      }

      const updatedReport = await response.json();
      console.log('Updated report after save:', updatedReport);
      console.log('Notes in updated report:', updatedReport.leadData?.notes);
      setReport(updatedReport);
      setIsEditing(false);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    setEditedData((prev) => ({
      ...prev,
      notes: [
        ...(Array.isArray(prev.notes) ? prev.notes : []),
        {
          id: Math.random().toString(36).substr(2, 9),
          content: newNote,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    }));
    setNewNote("");
  };

  const handleAddNote = (content: string) => {
    if (!content.trim()) return;
    const newNote = {
      id: Math.random().toString(36).substr(2, 9),
      content: content.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    console.log('Adding new note:', newNote);
    setEditedData((prev) => {
      const updatedNotes = [
        ...(Array.isArray(prev.notes) ? prev.notes : []),
        newNote,
      ];
      console.log('Updated notes array:', updatedNotes);
      return {
        ...prev,
        notes: updatedNotes,
      };
    });
  };

  const handleSectionToggle = async (section: string, value: boolean) => {
    const newSections = {
      ...sections,
      [section]: value
    };
    
    setSections(newSections);
    
    try {
      const response = await fetch(`/api/reports/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sections: newSections
        }),
      });
      
      if (response.ok) {
        const updatedReport = await response.json();
        setReport(updatedReport);
      }
    } catch (error) {
      // Error handling
    }
  };

  const handleAiContentUpdate = (section: string, content: Record<string, any>) => {
    setAiContent(prev => ({
      ...prev,
      [section]: content
    }));
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/shared-report/${id}`;
    navigator.clipboard.writeText(shareUrl);
    setShowShareTooltip(true);
    setTimeout(() => setShowShareTooltip(false), 2000);
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const handleProfilePictureChange = (photoUrl: string | null) => {
    if (!isEditing || !editedLeadData) return;
    const updatedData = {
      ...editedLeadData,
      photo: photoUrl
    };
    setEditedLeadData(updatedData);
  };

  const handleAddActivity = () => {
    if (!activityContent.trim()) return;
    
    const newActivity = {
      id: Math.random().toString(36).substr(2, 9),
      type: activityType,
      content: activityContent.trim(),
      createdAt: new Date(),
    };
    
    setEditedData(prev => ({
      ...prev,
      engagementTimeline: [
        ...(Array.isArray(prev.engagementTimeline) ? prev.engagementTimeline : []),
        newActivity,
      ],
    }));
    
    // Reset and close modal
    setActivityContent('');
    setActivityType('call');
    setShowActivityModal(false);
  };

  if (!report) {
    return (
      <ReportLoader reportId={id} onReportReady={handleReportReady} />
    );
  }

  const leadData = report.leadData;
  const apolloPerson = report?.apolloData?.person;
  const leadScore = parseInt(leadData.leadScoring?.rating || "0") || 88;

    return (
    <div className="h-screen flex flex-col overflow-hidden print:h-auto print:overflow-visible" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", backgroundColor: '#F5F5F7', color: '#1D1D1F' }}>
      {/* Activity Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add Activity</h3>
              <button
                onClick={() => {
                  setShowActivityModal(false);
                  setActivityContent('');
                  setActivityType('call');
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Activity Type Selection */}
            <div className="mb-6">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 block">Activity Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setActivityType('call')}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    activityType === 'call'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Phone className={`w-5 h-5 ${activityType === 'call' ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className={`text-sm font-semibold ${activityType === 'call' ? 'text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    Call
                  </span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setActivityType('email')}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    activityType === 'email'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Mail className={`w-5 h-5 ${activityType === 'email' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={`text-sm font-semibold ${activityType === 'email' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    Email
                  </span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setActivityType('meeting')}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    activityType === 'meeting'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Video className={`w-5 h-5 ${activityType === 'meeting' ? 'text-purple-600' : 'text-gray-400'}`} />
                  <span className={`text-sm font-semibold ${activityType === 'meeting' ? 'text-purple-700 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    Meeting
                  </span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setActivityType('note')}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    activityType === 'note'
                      ? 'border-gray-500 bg-gray-50 dark:bg-gray-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FileText className={`w-5 h-5 ${activityType === 'note' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <span className={`text-sm font-semibold ${activityType === 'note' ? 'text-gray-700 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    Note
                  </span>
                </button>
              </div>
            </div>
            
            {/* Description Input */}
            <div className="mb-6">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Description</label>
              <textarea
                value={activityContent}
                onChange={(e) => setActivityContent(e.target.value)}
                placeholder="Enter activity details..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 outline-none resize-none"
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowActivityModal(false);
                  setActivityContent('');
                  setActivityType('call');
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddActivity}
                disabled={!activityContent.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Activity
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Glass Header */}
      <header className="glass h-14 flex items-center justify-between px-6 fixed w-full z-50 print:hidden">
            <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors group cursor-pointer"
            aria-label="Go back to dashboard"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600 group-hover:text-black transition-colors" />
            <span className="text-sm font-medium text-gray-600 group-hover:text-black transition-colors">Back</span>
          </Link>
          <div className="h-4 w-[1px] bg-gray-300 mx-2"></div>
          <span className="text-sm font-medium text-gray-500">
            Reports / <span className="text-black font-semibold">{leadData.name}</span>
                    </span>
                  </div>
        <div className="flex gap-3">
            <TooltipProvider>
              <Tooltip open={showShareTooltip}>
                <TooltipTrigger asChild>
                <button
                    onClick={handleShare}
                  className="px-4 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition"
                  >
                  Share Report
                </button>
                </TooltipTrigger>
                <TooltipContent>
                <p>Link copied!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          <button
              onClick={() => {
                if (isEditing) {
                  handleSave();
                } else {
                  setIsEditing(true);
                }
              }}
            disabled={isSaving}
            className="px-4 py-1.5 rounded-full bg-[#0071E3] text-xs font-semibold text-white shadow-sm hover:bg-[#0077ED] transition disabled:opacity-50"
          >
            {isEditing ? (isSaving ? 'Saving...' : 'Save Changes') : 'Edit Profile'}
          </button>
          </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mt-14 p-6 overflow-y-auto max-w-[1600px] mx-auto w-full">
        {/* AI Generation Banner */}
        {isGeneratingAI && (
          <div className="mb-6 apple-card p-4 flex items-center gap-3 bg-blue-50 border-blue-200">
            <div className="p-2 bg-blue-100 rounded-full">
              <Sparkles className="h-5 w-5 text-blue-600" />
        </div>
            <div>
              <h3 className="font-medium text-blue-800">AI Content is Being Generated</h3>
              <p className="text-sm text-blue-600">
                We&apos;re creating AI-powered insights for your report. This may take a minute...
              </p>
            </div>
            <div className="ml-auto">
              <Loader2 className="animate-spin h-5 w-5 text-blue-600" />
            </div>
          </div>
        )}

        {/* Three Column Grid */}
        <div className="grid grid-cols-12 gap-5">
          {/* LEFT SIDEBAR: Lead & CRM Context */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-5">
            {/* Lead Profile Card */}
            <div className="apple-card p-5">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative mb-3">
                  {isEditing ? (
                <ProfilePictureEditor
                      currentPhoto={editedLeadData?.photo || leadData.photo}
                  isEditing={isEditing}
                  onPhotoChange={handleProfilePictureChange}
                  alt={leadData.name}
                />
                  ) : (
                    <>
                      {leadData.photo ? (
                        <img
                          src={leadData.photo}
                          alt={leadData.name}
                          className="w-16 h-16 rounded-full object-cover shadow-sm border-2 border-white"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl border-2 border-white shadow-sm">
                          {leadData.name.charAt(0)}
                  </div>
                      )}
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                </div>
                    </>
                  )}
              </div>
                <h2 className="text-lg font-black text-gray-900 tracking-tight">{leadData.name}</h2>
                <p className="text-[11px] font-bold text-[#0071E3] mt-0.5">{leadData.position}</p>
                <p className="text-[10px] font-medium text-gray-500 mb-2">{leadData.companyName}</p>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <MapPin className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-wide">
                    {leadData.companyDetails.headquarters || 'Location N/A'}
                  </span>
            </div>
          </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <a
                  href={`https://wa.me/${leadData.contactDetails.phone?.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 flex items-center justify-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 rounded-xl text-[#128C7E] transition shadow-sm border border-[#25D366]/20"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">WhatsApp</span>
                </a>
                <a
                  href={`mailto:${leadData.contactDetails.email}`}
                  className="w-full py-2 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 rounded-xl text-[#0071E3] transition shadow-sm border border-blue-100"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Email</span>
                </a>
              </div>

                <a
                  href={leadData.contactDetails.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                className="w-full py-2.5 flex items-center justify-center gap-2 bg-[#0A66C2] hover:bg-[#084e96] rounded-xl text-white transition-all shadow-sm"
                >
                <Linkedin className="w-3.5 h-3.5" />
                <span className="text-[11px] font-black uppercase tracking-widest">LinkedIn Profile</span>
                </a>
              </div>

            {/* CRM Intelligence */}
            <div className="apple-card p-5">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">CRM Intelligence</h3>
              <div className="space-y-4">
                <div className="section-tint">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                      <Zap className="w-4 h-4" />
              </div>
                    <div>
                      <p className="text-[9px] text-gray-500 font-bold uppercase">Lead Stage</p>
                      <p className="text-sm font-bold text-gray-900">
                        {leadData.status?.toUpperCase() || 'WARM'}
                      </p>
              </div>
            </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                      <Send className="w-4 h-4" />
            </div>
                    <div>
                      <p className="text-[9px] text-gray-500 font-bold uppercase">Source</p>
                      <p className="text-sm font-bold text-gray-900">Inbound</p>
          </div>
                  </div>
                    <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600">
                      <Clock className="w-4 h-4" />
                      </div>
                      <div>
                      <p className="text-[9px] text-gray-500 font-bold uppercase">Created</p>
                      <p className="text-sm font-bold text-gray-900">
                        {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      </div>
                    </div>
                      </div>
                    </div>
                  </div>

            {/* Company Context */}
            <div className="apple-card p-5">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Company Context</h3>
              <div className="space-y-4">
                <div className="section-tint">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                      <Banknote className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-500 font-bold uppercase">Industry</p>
                      <p className="text-sm font-bold text-gray-900">{leadData.companyDetails.industry}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                      <Users2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-500 font-bold uppercase">Employees</p>
                      <p className="text-sm font-bold text-gray-900">{leadData.companyDetails.employees}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <Landmark className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-500 font-bold uppercase">Location</p>
                      <p className="text-sm font-bold text-gray-900">{leadData.companyDetails.headquarters}</p>
                    </div>
                  </div>
                    <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-600">
                      <Fingerprint className="w-4 h-4" />
                      </div>
                      <div>
                      <p className="text-[9px] text-gray-500 font-bold uppercase">Ownership</p>
                      <p className="text-sm font-bold text-gray-900">
                        {apolloPerson?.organization?.funding_stage || 'N/A'}
                      </p>
                      </div>
                    </div>
                      </div>

                {apolloPerson?.organization?.description && (
                  <div className="section-tint mt-4">
                    <p className="text-[9px] text-gray-400 font-bold uppercase mb-3 tracking-widest">Company Description</p>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      {apolloPerson.organization.description.substring(0, 150)}
                      {apolloPerson.organization.description.length > 150 ? '...' : ''}
                    </p>
                    </div>
                )}

                {/* Technology Stack */}
                {aiContent?.techStack && (aiContent.techStack.technologies || aiContent.techStack.tools) && (
                  <div className="section-tint mt-4">
                    <p className="text-[9px] text-gray-400 font-bold uppercase mb-3 tracking-widest">Technology Stack</p>
                    <div className="flex flex-wrap gap-2">
                      {(aiContent.techStack.technologies || aiContent.techStack.tools || [])
                        .slice(0, 4)
                        .map((tech: string, idx: number) => {
                          const colors = [
                            'bg-blue-50 text-blue-600 border-blue-100',
                            'bg-orange-50 text-orange-600 border-orange-100',
                            'bg-emerald-50 text-emerald-600 border-emerald-100',
                            'bg-slate-50 text-slate-600 border-slate-100'
                          ];
                          return (
                            <span
                              key={idx}
                              className={`px-2 py-1 ${colors[idx % colors.length]} text-[10px] font-bold rounded-lg border`}
                            >
                              {tech}
                            </span>
                          );
                        })}
                  </div>
                  </div>
                )}
              </div>
            </div>

            {/* Lead Qualification */}
            <div className="apple-card p-5">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Lead Qualification</h3>
                  {leadData.leadScoring?.qualificationCriteria &&
                  Object.keys(leadData.leadScoring.qualificationCriteria).length > 0 ? (
                    <LeadQualification
                      qualificationCriteria={isEditing && editedLeadData 
                        ? editedLeadData.leadScoring?.qualificationCriteria || {} 
                        : leadData.leadScoring?.qualificationCriteria || {}}
                      rating={isEditing && editedLeadData 
                        ? editedLeadData.leadScoring?.rating || "" 
                        : leadData.leadScoring?.rating || ""}
                      isEditing={isEditing}
                      onCriteriaChange={(key, value) => {
                        if (isEditing && editedLeadData) {
                          const updatedData = {
                            ...editedLeadData,
                            leadScoring: {
                              ...editedLeadData.leadScoring,
                              qualificationCriteria: {
                                ...editedLeadData.leadScoring.qualificationCriteria,
                                [key]: value
                              }
                            }
                          };
                          setEditedLeadData(updatedData);
                        }
                      }}
                      onRatingChange={(rating) => {
                        if (isEditing && editedLeadData) {
                          const updatedData = {
                            ...editedLeadData,
                            leadScoring: {
                              ...editedLeadData.leadScoring,
                              rating
                            }
                          };
                          setEditedLeadData(updatedData);
                        }
                      }}
                    />
                  ) : (
                <div className="text-gray-500 italic text-[11px] py-4">
                      No qualification criteria available
                    </div>
                  )}
            </div>
          </div>

          {/* CENTER COLUMN: Main Content */}
          <div className="col-span-12 lg:col-span-6 flex flex-col gap-5">
            {/* Upcoming Meeting */}
            {(report.meetingDate && report.meetingTime) || isEditing ? (
              <div className="apple-card p-0 overflow-hidden flex shadow-sm min-h-[100px]">
                {report.meetingDate ? (
                  <div className="bg-gradient-to-b from-[#0071E3] to-[#47aeff] w-20 flex flex-col items-center justify-center text-white p-2 text-center">
                    <span className="text-2xl font-bold">
                      {new Date(report.meetingDate).getDate()}
                    </span>
                    <span className="text-[10px] font-medium uppercase opacity-90">
                      {new Date(report.meetingDate).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    </div>
                ) : isEditing && (
                  <div className="bg-gray-100 w-20 flex flex-col items-center justify-center p-2 text-center">
                    <Calendar className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="p-4 flex-1 flex justify-between items-center bg-white relative">
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="date"
                            value={report.meetingDate || ''}
                            onChange={(e) => setReport({ ...report, meetingDate: e.target.value })}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          />
                          <input
                            type="time"
                            value={report.meetingTime || ''}
                            onChange={(e) => setReport({ ...report, meetingTime: e.target.value })}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          />
                        </div>
                        <input
                          type="text"
                          value={report.meetingTimezone || ''}
                          onChange={(e) => setReport({ ...report, meetingTimezone: e.target.value })}
                          placeholder="Timezone (e.g., EST, PST, IST)"
                          className="text-xs border border-gray-300 rounded px-2 py-1 w-full"
                        />
                        <input
                          type="text"
                          value={report.meetingPlatform || ''}
                          onChange={(e) => setReport({ ...report, meetingPlatform: e.target.value })}
                          placeholder="Platform (e.g., Zoom, Google Meet)"
                          className="text-xs border border-gray-300 rounded px-2 py-1 w-full"
                        />
                        <input
                          type="text"
                          value={report.meetingLocation || ''}
                          onChange={(e) => setReport({ ...report, meetingLocation: e.target.value })}
                          placeholder="Physical location (if applicable)"
                          className="text-xs border border-gray-300 rounded px-2 py-1 w-full"
                        />
                        <input
                          type="text"
                          value={report.meetingAgenda || report.meetingObjective || ''}
                          onChange={(e) => setReport({ ...report, meetingAgenda: e.target.value })}
                          placeholder="Meeting agenda/objective"
                          className="text-sm font-bold border border-gray-300 rounded px-2 py-1 w-full"
                        />
                      </div>
                    ) : report.meetingDate && report.meetingTime ? (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                            {report.meetingTime}
                            {report.meetingTimezone && ` ${report.meetingTimezone}`}
                            {' • '}
                            {report.meetingPlatform || 'Video Call'}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-gray-900">
                          {report.meetingAgenda || report.meetingObjective || 'Meeting Scheduled'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {report.meetingLocation ? `${report.meetingLocation} • ` : ''}
                          {report.meetingPlatform || 'Video Call'}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No meeting scheduled</p>
                    )}
                  </div>
                  {!isEditing && report.meetingDate && report.meetingTime && (
                    <a
                      href={report.meetingLink || '#'}
                      target={report.meetingLink ? '_blank' : '_self'}
                      rel={report.meetingLink ? 'noopener noreferrer' : ''}
                      className="bg-[#0071E3] hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm"
                    >
                      Join
                    </a>
                  )}
                </div>
              </div>
            ) : null}

            {/* Pipeline Stage & Metrics */}
            <div className="apple-card p-6">
              <div className="flex justify-between items-start mb-6">
                    <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Pipeline Stage
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-[#0071E3]">
                      {leadData.status ? leadData.status.charAt(0).toUpperCase() + leadData.status.slice(1).replace('_', ' ') : 'Qualified'}
                    </span>
                    <span className="px-2 py-0.5 bg-blue-50 text-[#0071E3] text-[10px] font-bold rounded-md">
                      Active
                    </span>
                    </div>
                  </div>
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="5"
                        fill="transparent"
                        className="text-gray-100"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="5"
                        fill="transparent"
                        strokeDasharray="176"
                        strokeDashoffset={176 - (176 * (leadScore || 88)) / 100}
                        className="text-[#0071E3] transition-all duration-1000 ease-out"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-sm font-black text-gray-900 leading-none">
                        {leadScore || 88}
                      </span>
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">
                        Score
                      </span>
                </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 h-2 mb-3">
                <div className="flex-1 bg-emerald-100 rounded-full"></div>
                <div className="flex-1 bg-blue-100 rounded-full"></div>
                <div className="flex-1 bg-[#0071E3] rounded-full shadow-[0_0_10px_rgba(0,113,227,0.2)]"></div>
                <div className="flex-1 bg-gray-100 rounded-full"></div>
                <div className="flex-1 bg-gray-100 rounded-full"></div>
              </div>
              <div className="flex justify-between px-0.5">
                <span className="text-[8px] font-bold text-emerald-600 uppercase">New</span>
                <span className="text-[8px] font-bold text-blue-500 uppercase">Discovery</span>
                <span className="text-[8px] font-black text-[#0071E3] uppercase underline underline-offset-2">
                  Qualified
                </span>
                <span className="text-[8px] font-bold text-gray-400 uppercase">Proposal</span>
                <span className="text-[8px] font-bold text-gray-400 uppercase">Closed</span>
              </div>
            </div>

            {/* About Section Grid */}
            <div className="apple-card p-0 overflow-hidden">
              <div className="grid grid-cols-2">
                {/* About Lead */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">
                      About {leadData.name.split(' ')[0]}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[12px] text-gray-600 leading-relaxed">
                      {leadData.position} at {leadData.companyName}, focused on driving business growth and operational efficiency.
                    </p>
                    
                    {/* Lead Industry & Designation */}
                    {(leadData.companyDetails?.industry || leadData.position) && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {leadData.companyDetails?.industry && (
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-lg border border-blue-100">
                            {leadData.companyDetails.industry}
                          </span>
                        )}
                        {leadData.position && (
                          <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-lg border border-purple-100">
                            {leadData.position}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {aiContent?.overview?.keyInsights && (
                      <ul className="space-y-1.5 text-[11px] text-gray-500 list-disc pl-4 marker:text-blue-400">
                        {aiContent.overview.keyInsights.slice(0, 3).map((insight: string, idx: number) => (
                          <li key={idx}>{insight}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* About Company */}
                <div className="p-8 bg-[#FBFBFC] border-l border-gray-100">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest">
                      About {leadData.companyName}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {/* Company Overview */}
                    <p className="text-[12px] text-gray-600 leading-relaxed">
                      {apolloPerson?.organization?.description?.substring(0, 120) || 
                        `${leadData.companyName} is a growing company in the ${leadData.companyDetails.industry} industry.`}
                      {apolloPerson?.organization?.description && apolloPerson.organization.description.length > 120 ? '...' : ''}
                    </p>
                    
                    {aiContent?.company?.keyPoints && (
                      <ul className="space-y-1.5 text-[11px] text-gray-500 list-disc pl-4 marker:text-indigo-400">
                        {aiContent.company.keyPoints.slice(0, 3).map((point: string, idx: number) => (
                          <li key={idx}>{point}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-200/60 flex gap-4">
                    <a
                      href={leadData.companyDetails.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-1.5 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 rounded-xl border border-gray-200 text-[9px] font-bold text-gray-900 transition shadow-sm"
                    >
                      <Globe className="w-3.5 h-3.5 text-gray-400" />
                      Official Website
                    </a>
                    <a
                      href={`https://linkedin.com/company/${leadData.companyName.toLowerCase().replace(/\s+/g, '-')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-1.5 flex items-center justify-center gap-2 bg-[#0A66C2] hover:bg-[#084e96] rounded-xl text-[9px] font-bold text-white transition shadow-sm"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Strategic Meeting Brief */}
            <div className="apple-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-[#0071E3]">
                    <Target className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">Strategic Meeting Brief</h3>
                </div>
                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[9px] font-black rounded-lg border border-amber-100 uppercase tracking-widest">
                  High Stakes
                </span>
              </div>

              <div className="space-y-6">
                <section>
                  <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    Primary Objective
                  </h4>
                  {aiContent?.strategicBrief ? (
                    <p className="text-[13px] text-gray-800 leading-relaxed font-medium">
                      {aiContent.strategicBrief.primaryObjective}
                    </p>
                  ) : (
                  <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      <button
                        onClick={() => {
                          fetch('/api/ai-generate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              section: 'strategicBrief',
                              leadData,
                              apolloData: apolloPerson
                            })
                          })
                          .then(res => res.json())
                          .then(data => handleAiContentUpdate('strategicBrief', data))
                          .catch(err => console.error('Failed to generate strategic brief:', err));
                        }}
                        className="text-[11px] text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Generate Strategic Brief
                      </button>
                    </div>
                  )}
                </section>

                {aiContent?.strategicBrief && (
                  <>
                    <section className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-4 h-4 text-blue-600" />
                        <h4 className="text-[9px] font-black text-blue-600 uppercase tracking-widest">
                          Recommended Approach
                        </h4>
                  </div>
                      <p className="text-[12px] text-gray-700 leading-relaxed mb-4 italic font-medium">
                        {aiContent.strategicBrief.recommendedApproach}
                      </p>
                      
                      {/* Key Benefits Grid */}
                      {aiContent.strategicBrief.keyBenefits && aiContent.strategicBrief.keyBenefits.length > 0 && (
                        <div className="grid grid-cols-3 gap-3">
                          {aiContent.strategicBrief.keyBenefits.slice(0, 3).map((point: string, idx: number) => (
                            <div key={idx} className="bg-white p-3 rounded-xl shadow-sm border border-blue-100/30">
                              <p className="text-[8px] font-black text-blue-600 uppercase mb-1">
                                {String(idx + 1).padStart(2, '0')}
                              </p>
                              <p className="text-[10px] font-bold text-gray-900 leading-tight">
                                {point}
                              </p>
                </div>
                          ))}
                        </div>
                      )}
                    </section>

                    {/* Critical Discipline Alert */}
                    {aiContent.strategicBrief.criticalDiscipline && (
                      <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                        <div className="flex items-center gap-2 mb-1.5 text-rose-700">
                          <AlertOctagon className="w-3.5 h-3.5" />
                          <h4 className="text-[9px] font-black uppercase tracking-widest">CRITICAL DISCIPLINE</h4>
                        </div>
                        <p className="text-[11px] text-rose-800 font-medium">
                          {aiContent.strategicBrief.criticalDiscipline}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Engagement Timeline */}
            <div className="apple-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
                    <History className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">Engagement Timeline</h3>
                </div>
                {isEditing && (
                  <button 
                    onClick={() => setShowActivityModal(true)}
                    className="text-[10px] font-bold text-[#0071E3] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Activity
                  </button>
                )}
              </div>

              {Array.isArray(editedData.engagementTimeline) && editedData.engagementTimeline.length > 0 ? (
                <div className="space-y-4 relative timeline-line pl-8">
                  {editedData.engagementTimeline
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 10)
                    .map((activity, idx) => {
                      const typeConfig = {
                        call: { icon: Phone, color: 'bg-green-500', label: 'Call' },
                        email: { icon: Mail, color: 'bg-blue-500', label: 'Email' },
                        meeting: { icon: Video, color: 'bg-purple-500', label: 'Meeting' },
                        note: { icon: FileText, color: 'bg-gray-500', label: 'Note' }
                      }[activity.type];
                      const IconComponent = typeConfig.icon;
                      
                      return (
                        <div key={activity.id} className="relative hover:bg-gray-50/50 p-3 -m-3 rounded-xl transition-all group">
                          <div className={`absolute -left-[27px] top-3 w-4 h-4 rounded-full ${idx === 0 ? typeConfig.color : 'bg-slate-200'} border-4 border-white shadow-sm z-10 flex items-center justify-center`}>
                            {idx === 0 && <IconComponent className="w-2 h-2 text-white" />}
                          </div>
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                  activity.type === 'call' ? 'bg-green-100 text-green-700' :
                                  activity.type === 'email' ? 'bg-blue-100 text-blue-700' :
                                  activity.type === 'meeting' ? 'bg-purple-100 text-purple-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {typeConfig.label}
                                </span>
                                <span className="text-[9px] font-bold text-gray-400 uppercase">
                                  {new Date(activity.createdAt).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: new Date(activity.createdAt).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                                  })}
                                </span>
                              </div>
                              <p className="text-[11px] font-bold text-gray-900">
                                {activity.content}
                              </p>
                            </div>
                            {isEditing && (
                              <button
                                onClick={() => {
                                  if (confirm('Delete this activity?')) {
                                    setEditedData(prev => ({
                                      ...prev,
                                      engagementTimeline: (Array.isArray(prev.engagementTimeline) ? prev.engagementTimeline : []).filter(a => a.id !== activity.id)
                                    }));
                                  }
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <History className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-[11px] text-gray-500 mb-3">No engagement activities yet</p>
                  {isEditing && (
                    <button 
                      onClick={() => setShowActivityModal(true)}
                      className="text-[11px] font-bold text-[#0071E3] hover:underline"
                    >
                      Add First Activity
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-5">
            {/* SDR Owner Card */}
            <div className="apple-card p-4">
              <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">Report Owner</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {report.reportOwnerName ? report.reportOwnerName.charAt(0).toUpperCase() : report.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <p className="text-[13px] font-bold text-gray-900">
                    {report.reportOwnerName || report.email.split('@')[0]}
                  </p>
                  <p className="text-[10px] text-gray-500 font-medium">
                    {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Strategic Timeline */}
            <div className="apple-card p-5">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                Strategic Timeline
              </h3>

              <div className="grid grid-cols-1 gap-3 mb-5">
                <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/50 flex items-center justify-between">
                  <div>
                    <p className="text-[8px] text-emerald-600 font-black uppercase tracking-widest">
                      Last Updated
                    </p>
                    <p className="text-[11px] font-bold text-gray-800 mt-0.5">
                      {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Check className="w-4 h-4" />
                  </div>
                </div>
                {leadData.nextFollowUp && (
                  <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-100/50 flex items-center justify-between">
                    <div>
                      <p className="text-[8px] text-amber-600 font-black uppercase tracking-widest">
                        Next Follow-up
                      </p>
                      <p className="text-[11px] font-bold text-gray-800 mt-0.5">
                        {new Date(leadData.nextFollowUp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                      <Calendar className="w-4 h-4" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Internal Notes */}
            <div className="apple-card p-5 flex-1 flex flex-col min-h-[400px]">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                Internal Notes
              </h3>

              <div className="space-y-3 overflow-y-auto pr-1 flex-1 custom-scroll mb-4">
                {editedData.notes && editedData.notes.length > 0 ? (
                  editedData.notes.map((note) => (
                    <div key={note.id} className="bg-[#FFFDF2] p-4 rounded-xl border border-[#EEE1A8]/50 shadow-sm">
                      <p className="text-[10px] font-bold text-gray-800 mb-1">
                        {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • Note
                      </p>
                      <p className="text-[11px] text-gray-700 leading-relaxed">{note.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-[11px] text-gray-500 text-center">No notes yet</p>
                    </div>
                )}
                  </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="relative mb-3">
                  <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={3}
                    className="w-full bg-white rounded-xl border border-gray-200 p-3 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none transition-all"
                    placeholder="Type a new note..."
                  />
                  <Paperclip className="absolute bottom-3 left-3 w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                    </div>
                <button
                  onClick={addNote}
                  className="w-full py-2.5 bg-[#1D1D1F] hover:bg-black text-white text-[11px] font-bold rounded-xl transition-all shadow-sm"
                >
                  Add Note
                </button>
                  </div>
                </div>
          </div>
        </div>

        {/* Company & Lead Qualification Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Company Information */}
          {/* BACKUP: Company Info - Old Component Preserved */}
          {/* <div className="apple-card p-6">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Company Information</h3>
            </div>
            <div>
              <CompanyInfoCard
                companyName={isEditing && editedLeadData ? editedLeadData.companyName : leadData.companyName}
                industry={isEditing && editedLeadData ? editedLeadData.companyDetails.industry : leadData.companyDetails.industry}
                employees={isEditing && editedLeadData ? editedLeadData.companyDetails.employees : leadData.companyDetails.employees}
                headquarters={isEditing && editedLeadData ? editedLeadData.companyDetails.headquarters : leadData.companyDetails.headquarters}
                website={isEditing && editedLeadData ? editedLeadData.companyDetails.website : leadData.companyDetails.website}
                companyLogo={apolloPerson?.organization?.logo_url || ""}
                companyDescription={apolloPerson?.organization?.description || ""}
                fundingStage={apolloPerson?.organization?.funding_stage || ""}
                fundingTotal={apolloPerson?.organization?.funding_total || ""}
                isEditing={isEditing}
                onUpdate={(field: string, value: string) => {
                  if (isEditing && editedLeadData) {
                    const updatedData = {...editedLeadData};
                    if (field in updatedData.companyDetails) {
                      (updatedData.companyDetails as any)[field] = value;
                    }
                    setEditedLeadData(updatedData);
                  }
                }}
              />
            </div>
          </div> */}

        </div>

        {/* BACKUP: Meeting Details & AI Company Analytics Grid - Old Components Preserved */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6"> */}
          {/* Meeting Details */}
          {/* <div className="apple-card p-6">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Meeting Details</h3>
            </div>
            <div>
                <MeetingDetailsCard
                  date={report.meetingDate || "Not specified"}
                  time={report.meetingTime || "Not specified"}
                  platform={report.meetingPlatform || "Not specified"}
                  agenda={report.meetingAgenda || "No agenda specified"}
                  isEditing={isEditing}
                onUpdate={(field: string, value: string | any[]) => {
                  if (!isEditing || !report) return;
                  const updatedReport: any = { ...report };
                  switch (field) {
                    case 'date':
                      updatedReport.meetingDate = value as string;
                      break;
                    case 'time':
                      updatedReport.meetingTime = value as string;
                      break;
                    case 'platform':
                      updatedReport.meetingPlatform = value as string;
                      break;
                    case 'agenda':
                      updatedReport.meetingAgenda = value as string;
                      break;
                  }
                  setReport(updatedReport);
                }}
              />
          </div>
          </div> */}

          {/* AI Company Analytics */}
          {/* <div className="apple-card p-6">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">AI Company Analytics</h3>
                  </div>
                  <div>
              <CompanyAnalysis
                leadData={leadData}
                apolloData={apolloPerson}
                isEditing={isEditing}
                existingContent={aiContent?.company}
                onContentUpdate={(content: Record<string, any>) => handleAiContentUpdate('company', content)}
              />
                  </div>
                </div>
        </div> */}

        {/* Full-Width Content Sections */}
        <div className="space-y-6 mt-6">
          {/* BACKUP: AI Insights Section - Old Component Preserved */}
          {/* {sections.overview && aiContent?.overview && (
            <div className="apple-card p-6">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Star className="h-4 w-4 text-purple-600" />
                  </div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">AI Insights</h3>
                </div>
              <div>
              <AISectionContent 
                section="overview" 
                leadData={leadData} 
                apolloData={apolloPerson}
                isEditing={isEditing}
                showSectionHeader={false}
                existingContent={aiContent?.overview}
                onContentUpdate={(content: Record<string, any>) => handleAiContentUpdate('overview', content)}
              />
        </div>
            </div>
          )} */}

          {/* BACKUP: Interactions Section - Old Component Preserved (info now in Strategic Brief) */}
          {/* {sections.interactions && (
            <div className="apple-card p-6">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600" />
                  </div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Interactions</h3>
                  </div>
              <div>
              <AISectionContent 
                section="interactions" 
                leadData={leadData} 
                apolloData={apolloPerson}
                isEditing={isEditing}
                showSectionHeader={false}
                existingContent={aiContent?.interactions}
                onContentUpdate={(content: Record<string, any>) => handleAiContentUpdate('interactions', content)}
              />
              
              {report.talkingPoints && report.talkingPoints.length > 0 && (
                <div className="mt-8 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                        <MessageCircle className="w-3 h-3 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Talking Points</h3>
                    </div>
                    {report.talkingPoints.map((point, index) => (
                      <Card key={index} className="overflow-hidden border-0 shadow-md">
                        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 border-b border-green-100">
                          <CardTitle className="text-lg text-green-800">{point.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 bg-white">
                          <p className="text-gray-700 leading-relaxed">{point.content}</p>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
                  </div>
                  </div>
          )} */}

          {/* BACKUP: Competitors Section - Old Component Preserved */}
          {/* {sections.competitors && (
            <div className="apple-card p-6">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-red-600" />
                </div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Competitive Analysis</h3>
                  </div>
              <div>
              <AISectionContent 
                section="competitors" 
                leadData={leadData} 
                apolloData={apolloPerson}
                isEditing={isEditing}
                showSectionHeader={false}
                existingContent={aiContent?.competitors}
                onContentUpdate={(content: Record<string, any>) => handleAiContentUpdate('competitors', content)}
              />
                  </div>
                  </div>
          )} */}

          {/* BACKUP: Tech Stack Section - Old Component Preserved */}
          {/* {sections.techStack && (
            <div className="apple-card p-6">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                  <Cpu className="h-4 w-4 text-slate-600" />
                </div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Technology Stack</h3>
                  </div>
              <AISectionContent 
                section="techStack" 
                leadData={leadData} 
                apolloData={apolloPerson}
                isEditing={isEditing}
                showSectionHeader={false}
                existingContent={aiContent?.techStack}
                onContentUpdate={(content: Record<string, any>) => handleAiContentUpdate('techStack', content)}
              />
            </div>
          )} */}

          {/* BACKUP: News Section - Old Component Preserved */}
          {/* {sections.news && (
            <div className="apple-card p-6">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                  <Newspaper className="h-4 w-4 text-orange-600" />
                  </div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">News & Updates</h3>
                  </div>
              <AISectionContent 
                section="news" 
                leadData={leadData} 
                apolloData={apolloPerson}
                isEditing={isEditing}
                showSectionHeader={false}
                existingContent={aiContent?.news}
                onContentUpdate={(content: Record<string, any>) => handleAiContentUpdate('news', content)}
              />
            </div>
          )} */}

          {/* BACKUP: Next Steps Section - Old Component Preserved */}
          {/* {sections.nextSteps && (
            <div className="apple-card p-6">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-green-600" />
                  </div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">AI Recommended Next Steps</h3>
                  </div>
              <div>
              <AISectionContent 
                section="nextSteps" 
                leadData={leadData} 
                apolloData={apolloPerson}
                isEditing={isEditing}
                showSectionHeader={false}
                existingContent={aiContent?.nextSteps}
                onContentUpdate={(content: Record<string, any>) => handleAiContentUpdate('nextSteps', content)}
              />
            </div>
            </div>
          )} */}
        </div>
      </main>
    </div>
  );
}
