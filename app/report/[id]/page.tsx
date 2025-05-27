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
import { ReportDetailCard } from "@/components/report/ReportDetailCard";
import { ReportInfoSection } from "@/components/report/ReportInfoSection";
import { MeetingDetailsCard } from "@/components/report/MeetingDetailsCard";
import { SectionToggle } from "@/components/report/SectionToggle";
import {
  OverviewSection,
  CompanySection,
  MeetingSection,
  InteractionsSection,
  CompetitorsSection,
  TechStackSection,
  NewsSection,
  NextStepsSection,
  CompanyInfoCard,
  ReportGridLayout
} from "@/components/report/Sections";
import { AISectionContent } from "@/components/report/AISectionContent";
import { CompanyAnalysis } from "@/components/report/CompanyAnalysis";
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
  Download,
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
  Loader2
} from "lucide-react";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AIGenerateAll } from "@/components/report/AIGenerateAll";
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
  apolloData: ApolloResponse;
  report: string;
  leadData: LeadData;
  createdAt: Date;
  status: string;
  error?: string;
  meetingDate?: string;
  meetingTime?: string;
  meetingPlatform?: string;
  problemPitch?: string;
  meetingAgenda?: string;
  participants?: { name: string; title: string; organization: string; isClient?: boolean }[];
  nextSteps?: { description: string; dueDate: string; priority: string; completed: boolean }[];
  recommendedActions?: { title: string; description: string; actionType: string }[];
  followUpTimeline?: { title: string; day: string; description: string; isCompleted: boolean }[];
  talkingPoints?: { title: string; content: string }[];
  aiContent?: Record<string, any>;
}

const ReportLoader = dynamic(
  () => import("./ReportLoader").then((mod) => mod.ReportLoader),
  { ssr: false }
);

export default function ReportPage({ params }: { params: { id: string } }) {
  const [report, setReport] = useState<LeadReport | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<{
    notes: { id: string; content: string; createdAt: Date; updatedAt: Date }[];
    tags: string[];
    status: string;
    nextFollowUp: string;
    customFields: { [key: string]: string };
  }>({
    notes: [],
    tags: [],
    status: "warm",
    nextFollowUp: "",
    customFields: {},
  });
  const [newNote, setNewNote] = useState("");
  const [newTag, setNewTag] = useState("");
  const [selectedTab, setSelectedTab] = useState<
    "overview" | "company" | "experience" | "interaction"
  >("overview");
  const [editedLeadData, setEditedLeadData] = useState<LeadData | null>(null);
  const [editedSkills, setEditedSkills] = useState<string[]>([]);
  const [editedLanguages, setEditedLanguages] = useState<
    { name: string; level: string }[]
  >([]);
  const [newSkill, setNewSkill] = useState("");
  const [newLanguage, setNewLanguage] = useState({ name: "", level: "" });
  const [reportExpanded, setReportExpanded] = useState(false);
  const [reportPreview, setReportPreview] = useState("");
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
  const [isSaving, setIsSaving] = useState(false);
  const [aiContent, setAiContent] = useState<Record<string, any>>({});
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    if (report) {
      // Get skills from report if they exist or initialize as empty
      const skillsFromData = ((report.apolloData?.person as any)?.skills || []).map(
        (s: string) => s
      );
      const skillsData = skillsFromData.length > 0 ? skillsFromData : [];
      
      // Get languages from report if they exist or initialize as empty
      const languagesFromData = ((report.apolloData?.person as any)?.languages || []).map(
        (l: any) => ({
          name: l.language || l.name || "",
          level: l.proficiency || l.level || "",
        })
      );
      const languagesData = languagesFromData.length > 0 ? languagesFromData : [];
      
      setEditedData({
        notes: report.leadData.notes || [],
        tags: report.leadData.tags || [],
        status: report.leadData.status || "warm",
        nextFollowUp: report.leadData.nextFollowUp
          ? new Date(report.leadData.nextFollowUp).toISOString().split("T")[0]
          : "",
        customFields: report.leadData.customFields || {},
      });
      
      // Create a deep copy of leadData to avoid reference issues
      setEditedLeadData(JSON.parse(JSON.stringify(report.leadData)));
      
      setEditedSkills(skillsData);
      setEditedLanguages(languagesData);
      
      // Initialize AI content if available
      if (report.aiContent) {
        setAiContent(report.aiContent);
      }
      
      // Generate a preview for the report
      if (report.report) {
        const lines = report.report.split('\n');
        const firstParagraphs = lines.filter(line => line.trim() !== '')
          .slice(0, 3)
          .join('\n\n');
        setReportPreview(firstParagraphs + '...');
      }
    }
  }, [report]);

  const handleReportReady = (loadedReport: LeadReport) => {
    setReport(loadedReport);
    
    // Check if the report doesn't have AI content yet
    if (loadedReport && (!loadedReport.aiContent || Object.keys(loadedReport.aiContent).length === 0)) {
      setIsGeneratingAI(true);
      generateAllAIContent(loadedReport);
    }
  };

  // Function to automatically generate AI content for all sections
  const generateAllAIContent = async (reportData: LeadReport) => {
    if (!reportData || !reportData.leadData) return;
    
    setIsGeneratingAI(true);
    console.log("Automatically generating AI content for all sections");
    
    // Get list of active sections - ensure they are valid section keys
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
      // Generate content for each section
      for (const section of sectionKeys) {
        // Call the AI generate endpoint for each section
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
        } else {
          console.error(`Failed to generate content for ${section} section`);
        }
      }
      
      // Update the state with all generated content
      setAiContent(newContent);
      
      // Save the generated content to the database
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
      
      console.log("Successfully generated and saved AI content for all sections");
    } catch (error) {
      console.error('Error in automatic AI generation:', error);
    } finally {
      setIsSaving(false);
      setIsGeneratingAI(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      console.log("Saving data:", {
        leadData: editedLeadData,
        skills: editedSkills,
        languages: editedLanguages,
        aiContent: aiContent
      });
      
      const response = await fetch(`/api/reports/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadData: editedLeadData,
          skills: editedSkills,
          languages: editedLanguages,
          aiContent: aiContent
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update report");
      }

      const updatedReport = await response.json();
      console.log("Updated report from server:", updatedReport);
      setReport(updatedReport);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating report:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    setEditedData((prev) => ({
      ...prev,
      notes: [
        ...prev.notes,
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

  const addTag = () => {
    if (!newTag.trim()) return;
    setEditedData((prev) => ({
      ...prev,
      tags: [...prev.tags, newTag],
    }));
    setNewTag("");
  };

  const handleSectionToggle = (section: string, value: boolean) => {
    setSections(prev => ({
      ...prev,
      [section]: value
    }));
  };

  const handleAiContentUpdate = (section: string, content: Record<string, any>) => {
    console.log(`AI content updated for ${section}:`, content);
    setAiContent(prev => ({
      ...prev,
      [section]: content
    }));
  };

  // Create a function to handle sharing
  const handleShare = () => {
    const shareUrl = `${window.location.origin}/shared-report/${params.id}`;
    
    // Copy the URL to clipboard
    navigator.clipboard.writeText(shareUrl);
    setShowShareTooltip(true);
    setTimeout(() => setShowShareTooltip(false), 2000);
    
    // Open the URL in a new tab
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  // Fix the handleCompanyInfoUpdate function
  const handleCompanyInfoUpdate = (field: string, value: string) => {
    if (!isEditing || !editedLeadData) return;
    
    const updatedData = {...editedLeadData};
    
    // Update the appropriate field based on the field name
    switch (field) {
      case 'industry':
        updatedData.companyDetails.industry = value;
        break;
      case 'employees':
        updatedData.companyDetails.employees = value;
        break;
      case 'headquarters':
        updatedData.companyDetails.headquarters = value;
        break;
      case 'website':
        updatedData.companyDetails.website = value;
        break;
      // Other fields like fundingStage and fundingTotal might need to be 
      // handled differently as they're from Apollo data
      default:
        break;
    }
    
    setEditedLeadData(updatedData);
  };

  // Fix the handleMeetingUpdate function
  const handleMeetingUpdate = (field: string, value: string | any[]) => {
    if (!isEditing || !report) return;
    
    // Create a properly typed copy of the report
    const updatedReport: LeadReport = { ...report };
    
    // Update the appropriate field
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
      case 'participants':
        updatedReport.participants = value as any[];
        break;
      default:
        break;
    }
    
    setReport(updatedReport);
  };

  // Function to handle section navigation
  const handleSectionNavigation = (sectionId: string) => {
    // Update the active section state
    setActiveSection(sectionId);
    
    // Find the section element and scroll to it
    const sectionElement = document.getElementById(`${sectionId}-section`);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!report) {
    return (
      <ReportLoader reportId={params.id} onReportReady={handleReportReady} />
    );
  }

  const leadData = report.leadData;

  // Apollo data for About Lead and Experience
  const apolloPerson = report?.apolloData?.person;
  const employment =
    apolloPerson &&
    "employment_history" in apolloPerson &&
    Array.isArray((apolloPerson as any).employment_history)
      ? (apolloPerson as any).employment_history
      : [];
  const currentRole = employment.find((e: any) => e.current) || employment[0];
  const previousRoles = employment.filter((e: any) => !e.current);
  const education = employment.filter((e: any) => e.kind === "education");

  // Get skills from report if they exist or initialize as empty
  const skillsFromData = ((apolloPerson as any)?.skills || []).map(
    (s: string) => s
  );
  const skills = skillsFromData.length > 0 ? skillsFromData : [];

  // Get languages from report if they exist or initialize as empty
  const languagesFromData = ((apolloPerson as any)?.languages || []).map(
    (l: any) => ({
      name: l.language || l.name || "",
      level: l.proficiency || l.level || "",
    })
  );
  const languages = languagesFromData.length > 0 ? languagesFromData : [];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ReportSidebar
        completion={
          report?.leadData
            ? Math.floor(
                (Object.values(report.leadData).filter(Boolean).length /
                  Object.keys(report.leadData).length) *
                  100
              )
            : 0
        }
        lastUpdated={
          report?.createdAt ? new Date(report.createdAt).toLocaleString() : "-"
        }
        createdBy={report?.email?.split("@")[0] || "User"}
        onRemind={() => {}}
        onSave={handleSave}
        isSaving={isSaving}
        onNavigate={handleSectionNavigation}
        activeSection={activeSection}
      />
      <main className="flex-1 p-8">
        {/* AI Generation Banner */}
        {isGeneratingAI && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
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
              <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
        )}

        {/* Header Section with Actions */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-8 w-8 text-blue-600" />
              Lead Report: {leadData.name}
            </h1>
            <div className="text-gray-500 flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4" />
              {report?.createdAt
                ? new Date(report.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "No date available"}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <SectionToggle sections={sections} onToggle={handleSectionToggle} />
            
            <AIGenerateAll 
              sections={sections}
              leadData={leadData}
              apolloData={report?.apolloData}
              onContentGenerated={(newContent) => setAiContent(prevContent => ({...prevContent, ...newContent}))}
              onSave={handleSave}
              isEditing={isEditing}
              isGeneratingInitial={isGeneratingAI}
            />
            
            <TooltipProvider>
              <Tooltip open={showShareTooltip}>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="gap-2" 
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share link copied and opened in new tab!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Button variant="outline" className="gap-2" onClick={() => {}}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              variant={isEditing ? "default" : "outline"}
              className="gap-2"
              disabled={isSaving}
              onClick={() => {
                if (isEditing) {
                  handleSave();
                } else {
                  setIsEditing(true);
                }
              }}
            >
              {isEditing ? (
                isSaving ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )
              ) : (
                <>
                <Edit className="h-4 w-4" />
                  <span>Edit Report</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="mb-8 shadow-md border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
            <div className="flex items-start justify-between">
              <div className="flex gap-6">
                <div className="h-24 w-24 rounded-xl overflow-hidden bg-white/20 flex-shrink-0">
                  <AdaptiveImage
                    src={leadData.photo || apolloPerson?.photo_url || ""}
                    alt={leadData.name}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                    placeholderType="user"
                    showPlaceholder={
                      !leadData.photo && !apolloPerson?.photo_url
                    }
                  />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{leadData.name}</h2>
                  <p className="text-blue-100 text-lg">{leadData.position}</p>
                  <p className="text-blue-100">{leadData.companyName}</p>
                  <div className="flex gap-3 mt-3">
                    <Badge className="bg-blue-500/30 text-white hover:bg-blue-500/40 border border-blue-400/30">
                      {leadData.companyDetails.industry}
                    </Badge>
                    <Badge className="bg-blue-500/30 text-white hover:bg-blue-500/40 border border-blue-400/30">
                      {leadData.companyDetails.employees} employees
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-1 bg-white/10 text-white px-3 py-1 rounded-lg">
                  <Star className="h-5 w-5 text-yellow-300 fill-yellow-300" />
                  <span className="font-bold">
                    {leadData.leadScoring?.rating || "N/A"}
                  </span>
                  <span className="text-sm text-blue-100">Lead Score</span>
                </div>
                <Badge
                  className={`text-sm flex items-center gap-1.5 ${
                    report.leadData.status === "hot"
                      ? "bg-red-500 hover:bg-red-600"
                      : report.leadData.status === "warm"
                      ? "bg-orange-500 hover:bg-orange-600"
                      : report.leadData.status === "cold"
                      ? "bg-blue-500 hover:bg-blue-600"
                      : report.leadData.status === "meeting_done"
                      ? "bg-green-500 hover:bg-green-600"
                      : report.leadData.status === "qualified"
                      ? "bg-purple-500 hover:bg-purple-600"
                      : report.leadData.status === "disqualified"
                      ? "bg-gray-500 hover:bg-gray-600" 
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {report.leadData.status === "hot" && <Sparkles className="h-3.5 w-3.5" />}
                  {report.leadData.status === "warm" && <Briefcase className="h-3.5 w-3.5" />}
                  {report.leadData.status === "cold" && <AlertCircle className="h-3.5 w-3.5" />}
                  {report.leadData.status === "meeting_done" && <CheckCircle2 className="h-3.5 w-3.5" />}
                  {report.leadData.status === "qualified" && <Star className="h-3.5 w-3.5" />}
                  {report.leadData.status === "disqualified" && <X className="h-3.5 w-3.5" />}
                  {!report.leadData.status && <Briefcase className="h-3.5 w-3.5" />}
                  {report.leadData.status
                    ? report.leadData.status.charAt(0).toUpperCase() +
                      report.leadData.status.slice(1).replace('_', ' ')
                    : "Warm"}
                </Badge>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                <a
                  href={`mailto:${leadData.contactDetails.email}`}
                  className="text-gray-800 hover:text-blue-600"
                >
                  {leadData.contactDetails.email}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-blue-600" />
                <a
                  href={`tel:${leadData.contactDetails.phone}`}
                  className="text-gray-800 hover:text-blue-600"
                >
                  {leadData.contactDetails.phone || "No phone available"}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Linkedin className="h-5 w-5 text-blue-600" />
                <a
                  href={leadData.contactDetails.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-800 hover:text-blue-600"
                >
                  LinkedIn Profile
                </a>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span className="text-gray-800">
                  {leadData.companyDetails.headquarters ||
                    "Location unavailable"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                <a
                  href={leadData.companyDetails.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-800 hover:text-blue-600"
                >
                  {leadData.companyDetails.website || "Website unavailable"}
                </a>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="gap-2">
                <Phone className="h-4 w-4" />
                Call
              </Button>
              <Button variant="outline" className="gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Button>
              <Button variant="outline" className="gap-2">
                <Calendar className="h-4 w-4" />
                Schedule Meeting
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Report Sections */}
        <OverviewSection visible={sections.overview}>
                  <div className="space-y-4">
              {/* Lead Qualification */}
              <ReportDetailCard
                title="Lead Qualification"
                description="Qualification criteria and scoring"
                icon={<Star className="h-5 w-5" />}
                bgColor="bg-blue-50"
              >
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
                    console.log(`Criteria change in parent: ${key} = ${value}`);
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
                      console.log("Updated lead data:", updatedData.leadScoring.qualificationCriteria);
                      setEditedLeadData(updatedData);
                    }
                  }}
                  onRatingChange={(rating) => {
                    console.log(`Rating change in parent: ${rating}`);
                    if (isEditing && editedLeadData) {
                      const updatedData = {
                        ...editedLeadData,
                        leadScoring: {
                          ...editedLeadData.leadScoring,
                          rating
                        }
                      };
                      console.log("Updated rating:", updatedData.leadScoring.rating);
                      setEditedLeadData(updatedData);
                    }
                  }}
                />
              ) : (
                <div className="text-gray-500 italic py-4">
                  No qualification criteria available
                  </div>
                )}
              </ReportDetailCard>
            
            {/* AI Overview Content */}
            <Card className="shadow-sm border">
              <CardHeader className="bg-blue-50 border-b pb-4 flex flex-row items-center space-y-0 gap-2">
                <span className="text-blue-600"><Star className="h-5 w-5" /></span>
                <CardTitle className="text-xl">AI Insights</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <AISectionContent 
                  section="overview" 
                  leadData={leadData} 
                  apolloData={apolloPerson}
                  isEditing={isEditing}
                  showSectionHeader={false}
                  existingContent={aiContent?.overview}
                  onContentUpdate={(content: Record<string, any>) => handleAiContentUpdate('overview', content)}
                />
              </CardContent>
            </Card>
          </div>
        </OverviewSection>

        <CompanySection visible={sections.company}>
          <div className="space-y-6">
            <Card className="shadow-sm border">
              <CardHeader className="bg-blue-50 border-b pb-4 flex flex-row items-center space-y-0 gap-2">
                <span className="text-blue-600"><Building2 className="h-5 w-5" /></span>
                <CardTitle className="text-xl">Company Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
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
                  onUpdate={handleCompanyInfoUpdate}
                />
              </CardContent>
            </Card>
            
            {/* AI Company Content */}
            <CompanyAnalysis
              leadData={leadData}
              apolloData={apolloPerson}
              isEditing={isEditing}
              existingContent={aiContent?.company}
              onContentUpdate={(content: Record<string, any>) => handleAiContentUpdate('company', content)}
            />
          </div>
        </CompanySection>

        <MeetingSection visible={sections.meeting}>
          <MeetingDetailsCard
            date={report.meetingDate || "Not specified"}
            time={report.meetingTime || "Not specified"}
            platform={report.meetingPlatform || "Not specified"}
            agenda={report.meetingAgenda || "No agenda specified"}
            participants={report.participants || []}
            isEditing={isEditing}
            onUpdate={handleMeetingUpdate}
          />
        </MeetingSection>

        <InteractionsSection visible={sections.interactions}>
          <Card className="shadow-sm border">
            <CardHeader className="bg-blue-50 border-b pb-4 flex flex-row items-center space-y-0 gap-2">
              <span className="text-blue-600"><Users className="h-5 w-5" /></span>
              <CardTitle className="text-xl">Interactions</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <AISectionContent 
                section="interactions" 
                leadData={leadData} 
                apolloData={apolloPerson}
                isEditing={isEditing}
                showSectionHeader={false}
                existingContent={aiContent?.interactions}
                onContentUpdate={(content: Record<string, any>) => handleAiContentUpdate('interactions', content)}
              />
              
              <div className="mt-6 space-y-4">
                {report.talkingPoints && report.talkingPoints.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Talking Points</h3>
                    {report.talkingPoints.map((point, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardHeader className="bg-gray-50 p-4">
                          <CardTitle className="text-lg">{point.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <p>{point.content}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 italic py-4">
                    No talking points available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </InteractionsSection>

        <CompetitorsSection visible={sections.competitors}>
          <Card className="shadow-sm border">
            <CardHeader className="bg-blue-50 border-b pb-4 flex flex-row items-center space-y-0 gap-2">
              <span className="text-blue-600"><Shield className="h-5 w-5" /></span>
              <CardTitle className="text-xl">Competitive Analysis</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <AISectionContent 
                section="competitors" 
                leadData={leadData} 
                apolloData={apolloPerson}
                isEditing={isEditing}
                showSectionHeader={false}
                existingContent={aiContent?.competitors}
                onContentUpdate={(content: Record<string, any>) => handleAiContentUpdate('competitors', content)}
              />
            </CardContent>
          </Card>
        </CompetitorsSection>

        <TechStackSection visible={sections.techStack}>
          <Card className="shadow-sm border">
            <CardHeader className="bg-blue-50 border-b pb-4 flex flex-row items-center space-y-0 gap-2">
              <span className="text-blue-600"><Cpu className="h-5 w-5" /></span>
              <CardTitle className="text-xl">Technology Stack</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <AISectionContent 
                section="techStack" 
                leadData={leadData} 
                apolloData={apolloPerson}
                isEditing={isEditing}
                showSectionHeader={false}
                existingContent={aiContent?.techStack}
                onContentUpdate={(content: Record<string, any>) => handleAiContentUpdate('techStack', content)}
              />
            </CardContent>
          </Card>
        </TechStackSection>

        <NewsSection visible={sections.news}>
          <Card className="shadow-sm border">
            <CardHeader className="bg-blue-50 border-b pb-4 flex flex-row items-center space-y-0 gap-2">
              <span className="text-blue-600"><Newspaper className="h-5 w-5" /></span>
              <CardTitle className="text-xl">News & Updates</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <AISectionContent 
                section="news" 
                leadData={leadData} 
                apolloData={apolloPerson}
                isEditing={isEditing}
                showSectionHeader={false}
                existingContent={aiContent?.news}
                onContentUpdate={(content: Record<string, any>) => handleAiContentUpdate('news', content)}
              />
            </CardContent>
          </Card>
        </NewsSection>

        <NextStepsSection visible={sections.nextSteps}>
          <Card className="shadow-sm border">
            <CardHeader className="bg-blue-50 border-b pb-4 flex flex-row items-center space-y-0 gap-2">
              <span className="text-blue-600"><ArrowRight className="h-5 w-5" /></span>
              <CardTitle className="text-xl">AI Recommended Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <AISectionContent 
                section="nextSteps" 
                leadData={leadData} 
                apolloData={apolloPerson}
                isEditing={isEditing}
                showSectionHeader={false}
                existingContent={aiContent?.nextSteps}
                onContentUpdate={(content: Record<string, any>) => handleAiContentUpdate('nextSteps', content)}
              />
            </CardContent>
          </Card>
        </NextStepsSection>
      </main>
    </div>
  );
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleString("default", { month: "short", year: "numeric" });
}

function getDuration(startDate: string) {
  if (!startDate) return "";
  const start = new Date(startDate);
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  return `${years} yrs ${months} mos`;
}

function calculateDuration(startDate: Date, endDate: Date) {
  if (!startDate || !endDate) return "";
  let years = endDate.getFullYear() - startDate.getFullYear();
  let months = endDate.getMonth() - startDate.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }

  if (years === 0) {
    return months === 1 ? "1 month" : `${months} months`;
  } else if (years === 1 && months === 0) {
    return "1 year";
  } else if (months === 0) {
    return `${years} years`;
  } else {
    return `${years} yrs ${months} mos`;
  }
}
