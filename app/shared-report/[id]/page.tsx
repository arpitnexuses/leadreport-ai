"use client";

import { useEffect, useState, use } from "react";
import { ReportSidebar } from "@/components/report/ReportSidebar";
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
} from "@/components/report/Sections";
import { AISectionContent } from "@/components/report/AISectionContent";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingOverlay } from "@/components/dashboard/LoadingOverlay";
import { ProfilePictureEditor } from "@/components/report/ProfilePictureEditor";
import { MeetingDetailsCard } from "@/components/report/MeetingDetailsCard";
import { NextStepsContent } from "@/components/report/NextStepsContent";
import { Mail, Phone, Linkedin, MapPin, Globe, Star, Briefcase, AlertCircle, CheckCircle2, X, Sparkles, Calendar, Shield, Users, Cpu, Newspaper, ArrowRight, FileText, Menu, X as CloseIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LeadReport {
  _id: string;
  email: string;
  apolloData: any;
  report: string;
  leadData: any;
  createdAt: string;
  status: string;
  error?: string;
  meetingDate?: string;
  meetingTime?: string;
  meetingPlatform?: string;
  problemPitch?: string;
  meetingAgenda?: string;
  participants?: any[];
  nextSteps?: any[];
  recommendedActions?: any[];
  followUpTimeline?: any[];
  talkingPoints?: any[];
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

export default function SharedReportPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the Promise using React.use()
  const { id } = use(params);
  const [report, setReport] = useState<LeadReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Function to handle section navigation with scrolling
  const handleSectionNavigation = (sectionId: string) => {
    // Update the active section state
    setActiveSection(sectionId);
    
    // Close mobile sidebar if open
    setSidebarOpen(false);
    
    // Scroll to the appropriate section based on sectionId
    let targetElement;
    
    switch (sectionId) {
      case 'overview':
        // Scroll to top of the page
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      case 'company':
        targetElement = document.getElementById('company-section');
        break;
      case 'meeting':
        targetElement = document.getElementById('meeting-section');
        break;
      case 'interactions':
        targetElement = document.getElementById('interactions-section');
        break;
      case 'competitors':
        targetElement = document.getElementById('competitors-section');
        break;
      case 'techStack':
        targetElement = document.getElementById('techStack-section');
        break;
      case 'news':
        targetElement = document.getElementById('news-section');
        break;
      case 'nextSteps':
        targetElement = document.getElementById('nextSteps-section');
        break;
      default:
        targetElement = document.getElementById(`${sectionId}-section`);
    }
    
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/reports/${id}`);
        const data = await res.json();
        if (data.status === "completed" && data.data) {
          setReport(data.data);
        } else if (data.status === "failed") {
          setError(data.error || "Failed to load report.");
      } else {
          setError("Report is still processing or unavailable.");
        }
      } catch (e) {
        setError("Failed to load report.");
    } finally {
        setLoading(false);
    }
  };
    fetchReport();
  }, [id]);

  if (loading) {
    return <LoadingOverlay isVisible={true} statusMessage="Loading shared report..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="text-red-500 text-4xl mb-4">❌</div>
        <h3 className="text-2xl font-semibold text-red-600 mb-2">Unable to load report</h3>
        <p className="text-base text-gray-600 max-w-md text-center mb-6">{error}</p>
      </div>
    );
  }

  if (!report) return null;

  const sections = report.sections || {
    overview: true,
    company: true,
    meeting: true,
    interactions: true,
    competitors: true,
    techStack: true,
    news: true,
    nextSteps: true,
  };

  const aiContent = report.aiContent || {};
  const leadData = report.leadData || {};
  const apolloData = report.apolloData || {};

  // Helper for status badge
  const getStatusBadge = (status: string | undefined) => {
    if (!status) return { color: "bg-blue-500 hover:bg-blue-600", icon: <Briefcase className="h-3.5 w-3.5" /> };
    switch (status) {
      case "hot": return { color: "bg-red-500 hover:bg-red-600", icon: <Sparkles className="h-3.5 w-3.5" /> };
      case "warm": return { color: "bg-orange-500 hover:bg-orange-600", icon: <Briefcase className="h-3.5 w-3.5" /> };
      case "cold": return { color: "bg-blue-500 hover:bg-blue-600", icon: <AlertCircle className="h-3.5 w-3.5" /> };
      case "meeting_done": return { color: "bg-green-500 hover:bg-green-600", icon: <CheckCircle2 className="h-3.5 w-3.5" /> };
      case "qualified": return { color: "bg-purple-500 hover:bg-purple-600", icon: <Star className="h-3.5 w-3.5" /> };
      case "disqualified": return { color: "bg-gray-500 hover:bg-gray-600", icon: <X className="h-3.5 w-3.5" /> };
      default: return { color: "bg-blue-500 hover:bg-blue-600", icon: <Briefcase className="h-3.5 w-3.5" /> };
    }
  };
  const statusBadge = getStatusBadge(leadData.status);

  // Function to handle PDF download
  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/generate-pdf-shared/${id}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || 'Failed to generate PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${leadData.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-shared-report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to download PDF';
      alert(`PDF generation failed: ${errorMessage}. Please try again.`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed md:static inset-y-0 left-0 z-50 md:z-10 bg-white border-r transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } w-[280px]`}>
        <ReportSidebar
          activeSection={activeSection}
          onNavigate={handleSectionNavigation}
          onRemind={undefined}
          onSave={undefined}
          isSaving={false}
          completion={100}
          lastUpdated={report.createdAt ? new Date(report.createdAt).toLocaleString() : ""}
          createdBy={report.email || ""}
        />
        {/* Close button for mobile */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <CloseIcon className="h-4 w-4" />
        </Button>
              </div>
              
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-30 md:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarOpen(true)}
          className="bg-white shadow-md"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>
      

              
      {/* Main Content */}
      <main className="flex-1 w-full p-4 md:p-8 overflow-y-auto md:ml-0">
        {/* Header Section */}
        <div className="flex flex-col gap-6 mb-8">
          {/* Profile Card */}
          <Card className="shadow-md border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex gap-6 items-start">
                  <ProfilePictureEditor
                    currentPhoto={leadData.photo}
                    isEditing={false}
                    onPhotoChange={() => {}}
                    alt={leadData.name}
                  />
            <div>
                    <h2 className="text-3xl font-bold">{leadData.name}</h2>
                    <p className="text-blue-100 text-lg">{leadData.position}</p>
                    <p className="text-blue-100">{leadData.companyName}</p>
                    <div className="flex flex-wrap gap-3 mt-3">
                      {leadData.companyDetails?.industry && (
                        <Badge className="bg-blue-500/30 text-white border border-blue-400/30">
                      {leadData.companyDetails.industry}
                    </Badge>
                  )}
                      {leadData.companyDetails?.employees && (
                        <Badge className="bg-blue-500/30 text-white border border-blue-400/30">
                      {leadData.companyDetails.employees} employees
                    </Badge>
                  )}
                </div>
              </div>
                    </div>
                <div className="flex flex-col items-end gap-2 mt-4 md:mt-0">
                  {/* Download PDF button in header */}
                  <Button
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className="bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50 transition-all duration-200 flex items-center gap-2 px-4 py-2 rounded-lg mb-2 shadow-lg hover:shadow-xl"
                  >
                    {isDownloading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4" />
                        Download PDF
                      </>
                    )}
                  </Button>
                  <div className="flex items-center gap-1 bg-white/10 text-white px-3 py-1 rounded-lg">
                    <Star className="h-5 w-5 text-yellow-300 fill-yellow-300" />
                    <span className="font-bold">{leadData.leadScoring?.rating || "N/A"}</span>
                    <span className="text-sm text-blue-100">Lead Score</span>
                    </div>
                  <Badge className={`text-sm flex items-center gap-1.5 ${statusBadge.color}`}>
                    {statusBadge.icon}
                    {leadData.status
                      ? leadData.status.charAt(0).toUpperCase() + leadData.status.slice(1).replace('_', ' ')
                      : "Warm"}
                  </Badge>
                    </div>
              </div>
        </div>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-6">
                {leadData.contactDetails?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <a href={`mailto:${leadData.contactDetails.email}`} className="text-gray-800 hover:text-blue-600">
                      {leadData.contactDetails.email}
                    </a>
                  </div>
                )}
                {leadData.contactDetails?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <a href={`tel:${leadData.contactDetails.phone}`} className="text-gray-800 hover:text-blue-600">
                      {leadData.contactDetails.phone}
                    </a>
                  </div>
                )}
                {leadData.contactDetails?.linkedin && (
                  <div className="flex items-center gap-2">
                    <Linkedin className="h-5 w-5 text-blue-600" />
                    <a href={leadData.contactDetails.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:text-blue-600">
                      LinkedIn Profile
                    </a>
                  </div>
                )}
                {leadData.companyDetails?.headquarters && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-800">{leadData.companyDetails.headquarters}</span>
                  </div>
                )}
                {leadData.companyDetails?.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <a href={leadData.companyDetails.website} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:text-blue-600">
                      {leadData.companyDetails.website}
                    </a>
                  </div>
            )}
          </div>
            </CardContent>
          </Card>
        </div>

        {/* Company & Lead Qualification Grid */}
        <div id="company-section" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Company Info */}
          <Card className="shadow-lg border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 border-b-0 pb-6">
              <div className="flex flex-row items-center justify-between space-y-0 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-white font-semibold">Company Information</CardTitle>
                    <p className="text-blue-100 text-sm mt-1">Business profile and details</p>
              </div>
                      </div>
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 px-3 py-1 rounded-full">
                    <span className="text-white text-xs font-medium">Profile</span>
                </div>
              </div>
                  </div>
            </CardHeader>
            <CardContent className="p-8 bg-gradient-to-br from-gray-50 to-white">
              <CompanyInfoCard
                companyName={leadData.companyName || apolloData?.person?.organization?.name || ""}
                industry={leadData.companyDetails?.industry || apolloData?.person?.organization?.industry || ""}
                employees={leadData.companyDetails?.employees || apolloData?.person?.organization?.employee_count || ""}
                headquarters={leadData.companyDetails?.headquarters || apolloData?.person?.organization?.location?.city || ""}
                website={leadData.companyDetails?.website || apolloData?.person?.organization?.website_url || ""}
                companyLogo={apolloData?.person?.organization?.logo_url}
                companyDescription={apolloData?.person?.organization?.description}
                fundingStage={apolloData?.person?.organization?.funding_stage}
                fundingTotal={apolloData?.person?.organization?.funding_total}
                isEditing={false}
              />
            </CardContent>
          </Card>
          {/* Lead Qualification */}
          <Card className="shadow-lg border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 border-b-0 pb-6">
              <div className="flex flex-row items-center justify-between space-y-0 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Star className="h-5 w-5 text-white" />
              </div>
                  <div>
                    <CardTitle className="text-xl text-white font-semibold">Lead Qualification</CardTitle>
                    <p className="text-blue-100 text-sm mt-1">Scoring and qualification criteria</p>
                      </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 px-3 py-1 rounded-full">
                    <span className="text-white text-xs font-medium">Scoring</span>
              </div>
                  </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 bg-gradient-to-br from-gray-50 to-white">
              {leadData.leadScoring?.qualificationCriteria && Object.keys(leadData.leadScoring.qualificationCriteria).length > 0 ? (
                <>
                  {Object.entries(leadData.leadScoring.qualificationCriteria).map(([key, value]: [string, any], index) => (
                    <div key={index} className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <span className="font-medium text-gray-700 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                      <Badge className={
                        typeof value === 'string' && (value.toLowerCase() === "high" || value.toLowerCase() === "yes")
                          ? "bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-800"
                          : typeof value === 'string' && value.toLowerCase() === "medium"
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 hover:text-yellow-800"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-gray-800"
                      }>{value as string}</Badge>
                          </div>
                  ))}
                  <div className="flex items-center gap-2 mt-6 pt-2 border-t border-gray-200">
                    <div className="text-xl font-bold text-gray-900">Overall Score:</div>
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-bold flex items-center">
                      {leadData.leadScoring?.rating || "N/A"}
                      {leadData.leadScoring?.rating && Number(leadData.leadScoring.rating) > 0 && (
                        <span className="ml-2 flex">
                          {Array.from({ length: Number(leadData.leadScoring.rating) }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </span>
                      )}
                          </div>
                          </div>
                  <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                          </div>
                          <div>
                        <p className="text-base text-yellow-800 font-medium mb-1">Research-Based Assessment</p>
                        <p className="text-sm text-yellow-700 leading-relaxed mb-1">This qualification is based on research, industry data, and our expert insights.</p>
                        <p className="text-sm text-yellow-700 leading-relaxed">Our AI analyzes multiple data points to provide accurate lead scoring and recommendations.</p>
                          </div>
                        </div>
                  </div>
                </>
              ) : (
                <div className="text-gray-500 italic py-4">No qualification criteria available</div>
                      )}
            </CardContent>
          </Card>
                  </div>
                  
        {/* Analytics & Meeting Details Grid */}
        <div id="meeting-section" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* AI Company Analytics */}
          <Card className="shadow-lg border-0 overflow-hidden flex flex-col">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 border-b-0 pb-6">
              <div className="flex flex-row items-center justify-between space-y-0 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Cpu className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-white font-semibold">AI Company Analytics</CardTitle>
                    <p className="text-blue-100 text-sm mt-1">Intelligent business analysis</p>
                              </div>
                                  </div>
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 px-3 py-1 rounded-full">
                    <span className="text-white text-xs font-medium">Analytics</span>
                                </div>
                                </div>
                                </div>
            </CardHeader>
            <CardContent className="p-8 bg-gradient-to-br from-gray-50 to-white flex-1">
              <AISectionContent
                section="company"
                leadData={leadData}
                apolloData={apolloData}
                existingContent={aiContent.company}
                isEditing={false}
                showSectionHeader={false}
              />
            </CardContent>
          </Card>
          {/* Meeting Details */}
          <Card className="shadow-lg border-0 overflow-hidden flex flex-col">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 border-b-0 pb-6">
              <div className="flex flex-row items-center justify-between space-y-0 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-white" />
                              </div>
                  <div>
                    <CardTitle className="text-xl text-white font-semibold">Meeting Details</CardTitle>
                    <p className="text-blue-100 text-sm mt-1">Scheduled meetings and agenda</p>
                            </div>
                          </div>
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 px-3 py-1 rounded-full">
                    <span className="text-white text-xs font-medium">Schedule</span>
                      </div>
                      </div>
                  </div>
            </CardHeader>
            <CardContent className="p-8 bg-gradient-to-br from-gray-50 to-white flex-1">
              <MeetingDetailsCard
                date={report.meetingDate || "Not specified"}
                time={report.meetingTime || "Not specified"}
                platform={report.meetingPlatform || "Not specified"}
                agenda={report.meetingAgenda || "No agenda specified"}
                isEditing={false}
                onUpdate={() => {}}
              />
            </CardContent>
          </Card>
                </div>
                
        {/* AI Insights Section */}
        <div id="overview-section" className="mb-8">
          <Card className="shadow-lg border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 border-b-0 pb-6">
              <div className="flex flex-row items-center justify-between space-y-0 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-white font-semibold">AI Insights</CardTitle>
                    <p className="text-blue-100 text-sm mt-1">Intelligent analysis and recommendations</p>
                    </div>
                  </div>
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 px-3 py-1 rounded-full">
                    <span className="text-white text-xs font-medium">AI Powered</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 bg-gradient-to-br from-gray-50 to-white">
              <AISectionContent
                section="overview"
                leadData={leadData}
                apolloData={apolloData}
                existingContent={aiContent.overview}
                isEditing={false}
                showSectionHeader={false}
              />
            </CardContent>
          </Card>
        </div>

        {/* Interactions Section */}
        <div id="interactions-section">
          <InteractionsSection visible={sections.interactions}>
            <Card className="shadow-lg border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 border-b-0 pb-6">
                <div className="flex flex-row items-center justify-between space-y-0 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                  </div>
                    <div>
                      <CardTitle className="text-xl text-white font-semibold">Interactions</CardTitle>
                      <p className="text-blue-100 text-sm mt-1">Communication history and engagement</p>
              </div>
                      </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-white/20 px-3 py-1 rounded-full">
                      <span className="text-white text-xs font-medium">Engagement</span>
                </div>
              </div>
                  </div>
              </CardHeader>
              <CardContent className="p-8 bg-gradient-to-br from-gray-50 to-white">
                <AISectionContent
                  section="interactions"
                  leadData={leadData}
                  apolloData={apolloData}
                  existingContent={aiContent.interactions}
                  isEditing={false}
                  showSectionHeader={false}
                />
              </CardContent>
            </Card>
          </InteractionsSection>
              </div>

        {/* Competitors Section */}
        <div id="competitors-section">
          <CompetitorsSection visible={sections.competitors}>
            <Card className="shadow-lg border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 border-b-0 pb-6">
                <div className="flex flex-row items-center justify-between space-y-0 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Shield className="h-5 w-5 text-white" />
                      </div>
                    <div>
                      <CardTitle className="text-xl text-white font-semibold">Competitive Analysis</CardTitle>
                      <p className="text-blue-100 text-sm mt-1">Market positioning and competitive landscape</p>
                </div>
              </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-white/20 px-3 py-1 rounded-full">
                      <span className="text-white text-xs font-medium">Market Intel</span>
                  </div>
              </div>
                      </div>
              </CardHeader>
              <CardContent className="p-8 bg-gradient-to-br from-gray-50 to-white">
                <AISectionContent
                  section="competitors"
                  leadData={leadData}
                  apolloData={apolloData}
                  existingContent={aiContent.competitors}
                  isEditing={false}
                  showSectionHeader={false}
                />
              </CardContent>
            </Card>
          </CompetitorsSection>
                </div>

        {/* Tech Stack Section */}
        <div id="techStack-section">
          <TechStackSection visible={sections.techStack}>
            <Card className="shadow-lg border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 border-b-0 pb-6">
                <div className="flex flex-row items-center justify-between space-y-0 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Cpu className="h-5 w-5 text-white" />
                  </div>
                    <div>
                      <CardTitle className="text-xl text-white font-semibold">Tech Stack</CardTitle>
                      <p className="text-blue-100 text-sm mt-1">Technology and tools used</p>
              </div>
                      </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-white/20 px-3 py-1 rounded-full">
                      <span className="text-white text-xs font-medium">Technology</span>
                </div>
              </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 bg-gradient-to-br from-gray-50 to-white">
                <AISectionContent
                  section="techStack"
                  leadData={leadData}
                  apolloData={apolloData}
                  existingContent={aiContent.techStack}
                  isEditing={false}
                  showSectionHeader={false}
                />
              </CardContent>
            </Card>
          </TechStackSection>
        </div>

        {/* News Section */}
        <div id="news-section">
          <NewsSection visible={sections.news}>
            <Card className="shadow-lg border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 border-b-0 pb-6">
                <div className="flex flex-row items-center justify-between space-y-0 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Newspaper className="h-5 w-5 text-white" />
                  </div>
                    <div>
                      <CardTitle className="text-xl text-white font-semibold">News</CardTitle>
                      <p className="text-blue-100 text-sm mt-1">Recent news and updates</p>
              </div>
                      </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-white/20 px-3 py-1 rounded-full">
                      <span className="text-white text-xs font-medium">Updates</span>
                </div>
              </div>
        </div>
              </CardHeader>
              <CardContent className="p-8 bg-gradient-to-br from-gray-50 to-white">
                <AISectionContent
                  section="news"
                  leadData={leadData}
                  apolloData={apolloData}
                  existingContent={aiContent.news}
                  isEditing={false}
                  showSectionHeader={false}
                />
              </CardContent>
            </Card>
          </NewsSection>
        </div>

        {/* Next Steps Section */}
        <div id="nextSteps-section">
          <NextStepsSection visible={sections.nextSteps}>
            <Card className="shadow-lg border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 border-b-0 pb-6">
                <div className="flex flex-row items-center justify-between space-y-0 gap-3">
              <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <ArrowRight className="h-5 w-5 text-white" />
                </div>
                <div>
                      <CardTitle className="text-xl text-white font-semibold">Next Steps</CardTitle>
                      <p className="text-blue-100 text-sm mt-1">Recommended actions and follow-ups</p>
                </div>
              </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-white/20 px-3 py-1 rounded-full">
                      <span className="text-white text-xs font-medium">Actions</span>
              </div>
            </div>
            </div>
              </CardHeader>
              <CardContent className="p-8 bg-gradient-to-br from-gray-50 to-white">
                {aiContent.nextSteps && aiContent.nextSteps.recommendedActions && aiContent.nextSteps.recommendedActions.length > 0 ? (
                  <NextStepsContent content={aiContent.nextSteps} />
                ) : aiContent.nextSteps ? (
                  <AISectionContent
                    section="nextSteps"
                    leadData={leadData}
                    apolloData={apolloData}
                    existingContent={aiContent.nextSteps}
                    isEditing={false}
                    showSectionHeader={false}
                  />
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                      <ArrowRight className="h-12 w-12 mx-auto" />
          </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Next Steps Available</h3>
                    <p className="text-gray-500">AI-generated next steps will appear here once available.</p>
        </div>
                )}
              </CardContent>
            </Card>
          </NextStepsSection>
        </div>
      </main>
    </div>
  );
} 
