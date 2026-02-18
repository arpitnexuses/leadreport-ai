"use client";

import { useEffect, useState, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingOverlay } from "@/components/dashboard/LoadingOverlay";
import { AISectionContent } from "@/components/report/AISectionContent";
import { NewsContent } from "@/components/report/NewsContent";
import { LeadQualification } from "@/components/report/LeadQualification";
import { 
  Mail, Phone, Linkedin, MapPin, Globe, Star, Briefcase, Calendar, 
  FileText, Check, MessageCircle, User, Building2, Banknote, Users2, 
  Landmark, Zap, Send, Clock, Target, Lightbulb, 
  AlertOctagon, History, Video, X, Download, Loader2, Newspaper, RefreshCw
} from "lucide-react";
import {
  LEAD_STATUS_ORDER,
  LEAD_STATUS_UI,
  getLeadStatusLabel,
  normalizeLeadStatus
} from "@/lib/lead-status";

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
    score?: number;
    qualificationCriteria: Record<string, string>;
  };
  notes?: { id: string; content: string; createdAt: Date; updatedAt: Date }[];
  engagementTimeline?: { id: string; type: 'call' | 'email' | 'meeting' | 'note'; content: string; createdAt: Date }[];
  tags?: string[];
  status?: string;
  nextFollowUp?: string;
  customFields?: { [key: string]: string };
  leadIndustry?: string;
  leadDesignation?: string;
  leadBackground?: string;
  companyOverview?: string;
  companyWebsite?: string;
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
      linkedin_url?: string;
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
  meetingName?: string;
  meetingObjective?: string;
  problemPitch?: string;
  meetingAgenda?: string;
  participants?: { name: string; title: string; organization: string; isClient?: boolean }[];
  nextSteps?: { description: string; dueDate: string; priority: string; completed: boolean }[];
  recommendedActions?: { title: string; description: string; actionType: string }[];
  followUpTimeline?: { title: string; day: string; description: string; isCompleted: boolean }[];
  talkingPoints?: { title: string; content: string }[];
  aiContent?: Record<string, any>;
  companyNews?: {
    articles: {
      title: string;
      description?: string;
      url: string;
      source: string;
      publishedAt: string;
      urlToImage?: string;
    }[];
    totalResults: number;
  };
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

// Toggle to temporarily disable PDF downloads on shared report page.
const SHOW_SHARED_PDF_DOWNLOAD = false;

export default function SharedReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [report, setReport] = useState<LeadReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRefreshingNews, setIsRefreshingNews] = useState(false);

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
      a.download = `${report?.leadData.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-shared-report.pdf`;
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

  const handleRefreshNews = async () => {
    if (!report) return;
    
    setIsRefreshingNews(true);
    try {
      const response = await fetch(`/api/refresh-news/${id}`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success && data.companyNews) {
        // Update the report with fresh news
        setReport({
          ...report,
          companyNews: data.companyNews
        });
        alert(`✅ Successfully refreshed news! Found ${data.companyNews.articles.length} articles.`);
      } else if (data.success && data.companyNews?.articles.length === 0) {
        alert('ℹ️ No recent news articles found for this company.');
      } else {
        throw new Error(data.error || 'Failed to refresh news');
      }
    } catch (error) {
      console.error('Error refreshing news:', error);
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Failed to refresh news'}`);
    } finally {
      setIsRefreshingNews(false);
    }
  };

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

  const leadData = report.leadData;
  const apolloPerson = report?.apolloData?.person;
  const aiContent = report.aiContent || {};
  const isMeaningfulValue = (value?: string | null) =>
    Boolean(value && value.trim() && value.trim().toLowerCase() !== "n/a");
  const normalizeExternalUrl = (url: string) =>
    /^https?:\/\//i.test(url) ? url : `https://${url}`;
  const rawCompanyWebsite =
    (isMeaningfulValue(leadData.companyDetails?.website) && leadData.companyDetails.website) ||
    (isMeaningfulValue(leadData.companyWebsite) && leadData.companyWebsite) ||
    (isMeaningfulValue(apolloPerson?.organization?.website_url) && apolloPerson?.organization?.website_url) ||
    "";
  const companyWebsiteHref = rawCompanyWebsite
    ? normalizeExternalUrl(rawCompanyWebsite)
    : "";
  const companySlug = leadData.companyName?.toLowerCase().replace(/\s+/g, "-") || "";
  const defaultCompanyLinkedin = companySlug ? `https://linkedin.com/company/${companySlug}` : "";
  const rawCompanyLinkedin =
    (isMeaningfulValue(leadData.customFields?.companyLinkedin) && leadData.customFields?.companyLinkedin) ||
    (isMeaningfulValue(apolloPerson?.organization?.linkedin_url) && apolloPerson?.organization?.linkedin_url) ||
    defaultCompanyLinkedin;
  const companyLinkedinHref = rawCompanyLinkedin ? normalizeExternalUrl(rawCompanyLinkedin) : "";
  const currentEmail =
    (isMeaningfulValue(leadData.contactDetails?.email) && leadData.contactDetails.email) ||
    (isMeaningfulValue(apolloPerson?.email) && apolloPerson.email) ||
    "";
  const currentPhone =
    (isMeaningfulValue(leadData.contactDetails?.phone) && leadData.contactDetails.phone) ||
    (isMeaningfulValue(apolloPerson?.phone_number) && apolloPerson.phone_number) ||
    "";
  const rawLinkedinUrl =
    (isMeaningfulValue(leadData.contactDetails?.linkedin) && leadData.contactDetails.linkedin) ||
    (isMeaningfulValue(apolloPerson?.linkedin_url) && apolloPerson.linkedin_url) ||
    "";
  const linkedinHref = rawLinkedinUrl ? normalizeExternalUrl(rawLinkedinUrl) : "";
  const whatsappHref = currentPhone ? `https://wa.me/${currentPhone.replace(/\D/g, "")}` : "";
  const emailHref = currentEmail ? `mailto:${currentEmail}` : "";
  const leadScore = leadData.leadScoring?.score ?? (parseInt(leadData.leadScoring?.rating || "0") > 10 ? parseInt(leadData.leadScoring?.rating || "0") : 88);
  const currentLeadStatus = normalizeLeadStatus(leadData.status || "warm");
  const pipelineStages = LEAD_STATUS_ORDER;
  const currentStageIndex = Math.max(pipelineStages.indexOf(currentLeadStatus), 0);
  const currentStageAppearance = LEAD_STATUS_UI[currentLeadStatus];

  return (
    <div className="h-screen flex flex-col overflow-hidden print:h-auto print:overflow-visible" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", backgroundColor: '#F5F5F7', color: '#1D1D1F' }}>
      {/* Glass Header */}
      <header className="glass h-14 flex items-center justify-between px-6 fixed w-full z-50 print:hidden" style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
      }}>
        <div className="flex items-center gap-4">
          <img 
            src="https://cdn-nexlink.s3.us-east-2.amazonaws.com/Nexuses-full-logo-dark_8d412ea3-bf11-4fc6-af9c-bee7e51ef494.png" 
            alt="Nexuses Logo" 
            className="h-5"
          />
        </div>
        <div className="flex gap-3">
          {SHOW_SHARED_PDF_DOWNLOAD && (
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="px-4 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="inline w-3 h-3 mr-1 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="inline w-3 h-3 mr-1" />
                  Download PDF
                </>
              )}
            </button>
          )}
        </div>
      </header>
      


      {/* Main Content */}
      <main className="flex-1 mt-14 p-6 overflow-y-auto max-w-[1600px] mx-auto w-full">
        {/* Three Column Grid */}
        <div className="grid grid-cols-12 gap-5">
          {/* LEFT SIDEBAR: Lead & CRM Context */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-5">
            {/* Lead Profile Card */}
            <div className="apple-card p-5">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative mb-3">
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
                </div>
                <h2 className="text-base font-black text-gray-900 tracking-tight">{leadData.name}</h2>
                <p className="text-sm font-bold text-[#0071E3] mt-0.5">{leadData.position}</p>
                <p className="text-sm font-medium text-gray-500 mb-2">{leadData.companyName}</p>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <MapPin className="w-3 h-3" />
                  <span className="text-xs font-bold uppercase tracking-wide">
                    {leadData.companyDetails.headquarters || 'Location N/A'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 flex items-center justify-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 rounded-xl text-[#128C7E] transition shadow-sm border border-[#25D366]/20"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span className="text-xs font-black uppercase tracking-widest">WhatsApp</span>
                  </a>
                ) : (
                  <div className="w-full py-2 flex items-center justify-center gap-2 bg-gray-100 rounded-xl text-gray-400 shadow-sm border border-gray-200 cursor-not-allowed">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span className="text-xs font-black uppercase tracking-widest">WhatsApp</span>
                  </div>
                )}
                {emailHref ? (
                  <a
                    href={emailHref}
                    className="w-full py-2 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 rounded-xl text-[#0071E3] transition shadow-sm border border-blue-100"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span className="text-xs font-black uppercase tracking-widest">Email</span>
                  </a>
                ) : (
                  <div className="w-full py-2 flex items-center justify-center gap-2 bg-gray-100 rounded-xl text-gray-400 shadow-sm border border-gray-200 cursor-not-allowed">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="text-xs font-black uppercase tracking-widest">Email</span>
                  </div>
                )}
              </div>

              {linkedinHref ? (
                <a
                  href={linkedinHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 flex items-center justify-center gap-2 bg-[#0A66C2] hover:bg-[#084e96] rounded-xl text-white transition-all shadow-sm"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span className="text-xs font-black uppercase tracking-widest">LinkedIn Profile</span>
                </a>
              ) : (
                <div className="w-full py-2.5 flex items-center justify-center gap-2 bg-gray-100 rounded-xl text-gray-400 transition-all shadow-sm border border-gray-200 cursor-not-allowed">
                  <Linkedin className="w-3.5 h-3.5" />
                  <span className="text-xs font-black uppercase tracking-widest">LinkedIn Profile</span>
                </div>
              )}
            </div>

            {/* Contact Details */}
            <div className="apple-card p-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Contact Details</h3>
              <div className="space-y-4">
                <div className="section-tint">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 font-bold uppercase">Email</p>
                      <p className="text-sm font-bold text-gray-900 truncate">{currentEmail || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 font-bold uppercase">Phone</p>
                      <p className="text-sm font-bold text-gray-900">{currentPhone || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
                      <Linkedin className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 font-bold uppercase">LinkedIn</p>
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {rawLinkedinUrl ? rawLinkedinUrl.replace(/^https?:\/\//i, "") : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CRM Intelligence */}
            <div className="apple-card p-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">CRM Intelligence</h3>
              <div className="space-y-4">
                <div className="section-tint">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase">Lead Stage</p>
                      <p className="text-sm font-bold text-gray-900">
                        {getLeadStatusLabel(currentLeadStatus)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                      <Send className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase">Source</p>
                      <p className="text-sm font-bold text-gray-900">Shared Report</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase">Created</p>
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
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Company Context</h3>
              <div className="space-y-4">
                <div className="section-tint">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                      <Banknote className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase">Industry</p>
                      <p className="text-sm font-bold text-gray-900">{leadData.companyDetails.industry}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                      <Users2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase">Employees</p>
                      <p className="text-sm font-bold text-gray-900">{leadData.companyDetails.employees}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <Landmark className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase">Location</p>
                      <p className="text-sm font-bold text-gray-900">{leadData.companyDetails.headquarters}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase">Website</p>
                      {companyWebsiteHref ? (
                        <a
                          href={companyWebsiteHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-bold text-blue-600 hover:underline"
                        >
                          {rawCompanyWebsite.replace(/^https?:\/\//i, "")}
                        </a>
                      ) : (
                        <p className="text-sm font-bold text-gray-500">N/A</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#E8F4FD] flex items-center justify-center text-[#0A66C2]">
                      <Linkedin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase">LinkedIn</p>
                      <p className="text-sm font-bold text-gray-900">
                        {rawCompanyLinkedin || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {(apolloPerson?.organization?.description || leadData.customFields?.companyDescription) && (
                  <div className="section-tint mt-4">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-3 tracking-widest">Company Description</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {leadData.customFields?.companyDescription ||
                        (apolloPerson?.organization?.description 
                          ? (apolloPerson.organization.description.substring(0, 150) + 
                             (apolloPerson.organization.description.length > 150 ? '...' : ''))
                          : '')}
                    </p>
                  </div>
                )}

                {/* Technology Stack */}
                {aiContent?.techStack && (aiContent.techStack.technologies || aiContent.techStack.tools) && (
                  <div className="section-tint mt-4">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-3 tracking-widest">Technology Stack</p>
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
                              className={`px-2 py-1 ${colors[idx % colors.length]} text-sm font-bold rounded-lg border`}
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
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Lead Qualification</h3>
              {leadData.leadScoring?.qualificationCriteria &&
              Object.keys(leadData.leadScoring.qualificationCriteria).length > 0 ? (
                <LeadQualification
                  qualificationCriteria={leadData.leadScoring?.qualificationCriteria || {}}
                  rating={leadData.leadScoring?.rating || ""}
                  isEditing={false}
                  onCriteriaChange={() => {}}
                  onRatingChange={() => {}}
                />
              ) : (
                <div className="text-gray-500 italic text-sm py-4">
                  No qualification criteria available
                </div>
              )}
            </div>
          </div>

          {/* CENTER COLUMN: Main Content */}
          <div className="col-span-12 lg:col-span-6 flex flex-col gap-5">
            {/* Upcoming Meeting */}
            {report.meetingDate && report.meetingTime && (
              <div className="apple-card p-0 overflow-hidden flex shadow-sm min-h-[100px]">
                <div className="bg-gradient-to-b from-[#0071E3] to-[#47aeff] w-20 flex flex-col items-center justify-center text-white p-2 text-center relative">
                  <span className="text-xl font-bold">
                    {new Date(report.meetingDate).getDate()}
                  </span>
                  <span className="text-sm font-medium uppercase opacity-90">
                    {new Date(report.meetingDate).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span className="text-xs font-bold uppercase opacity-75 mt-0.5">
                    {new Date(report.meetingDate).toLocaleDateString('en-US', { year: 'numeric' })}
                  </span>
                </div>
                <div className="p-4 flex-1 flex justify-between items-center bg-white relative">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      <span className="text-sm font-bold text-gray-400 uppercase tracking-wide">
                        {report.meetingTime}
                        {report.meetingTimezone && ` ${report.meetingTimezone}`}
                        {' • '}
                        {report.meetingLocation ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            Physical Meeting
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <Video className="w-3 h-3" />
                            {report.meetingPlatform || 'Video Call'}
                          </span>
                        )}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">
                      {report.meetingName || 'Meeting Scheduled'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {report.meetingLocation ? (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {report.meetingLocation}
                        </span>
                      ) : (
                        report.meetingPlatform || 'Video Call'
                      )}
                    </p>
                  </div>
                  {(report.meetingLocation || report.meetingLink) && (
                    <a
                      href={
                        report.meetingLocation 
                          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(report.meetingLocation)}`
                          : report.meetingLink
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        console.log('Button clicked - meetingLocation:', report.meetingLocation);
                        console.log('Button clicked - meetingLink:', report.meetingLink);
                        console.log('Navigating to:', e.currentTarget.href);
                      }}
                      className={`${
                        report.meetingLocation 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' 
                          : 'bg-[#0071E3] hover:bg-blue-600'
                      } text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm flex items-center gap-2`}
                    >
                      {report.meetingLocation ? (
                        <>
                          <MapPin className="w-4 h-4" />
                          View Map
                        </>
                      ) : (
                        <>
                          <Video className="w-4 h-4" />
                          Join
                        </>
                      )}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Pipeline Stage & Metrics */}
            <div className="apple-card p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Pipeline Stage
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-black ${currentStageAppearance.textClass}`}>
                      {getLeadStatusLabel(currentLeadStatus)}
                    </span>
                    <span className={`px-2 py-0.5 text-sm font-bold rounded-md ${currentStageAppearance.badgeClass}`}>
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
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter mt-0.5">
                        Score
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2 h-2 mb-3">
                {pipelineStages.map((stage, index) => {
                  const stageStyle = LEAD_STATUS_UI[stage];
                  const isReached = index <= currentStageIndex;
                  return (
                    <div
                      key={stage}
                      className={`rounded-full transition-all ${isReached ? stageStyle.activeSegmentClass : stageStyle.inactiveSegmentClass}`}
                    />
                  );
                })}
              </div>
              <div className="grid grid-cols-5 gap-2 px-0.5">
                {pipelineStages.map((stage, index) => {
                  const stageStyle = LEAD_STATUS_UI[stage];
                  const isCurrent = index === currentStageIndex;
                  const isPast = index < currentStageIndex;
                  return (
                    <span
                      key={stage}
                      className={`text-xs uppercase text-center ${isCurrent ? `font-black underline underline-offset-2 ${stageStyle.textClass}` : isPast ? `font-bold ${stageStyle.textClass}` : "font-bold text-gray-400"}`}
                    >
                      {getLeadStatusLabel(stage)}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* About Section Grid */}
            <div className="apple-card p-0 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* About Lead */}
                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">
                      About {leadData.name.split(' ')[0]}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {leadData.customFields?.aboutLead || 
                        `${leadData.position} at ${leadData.companyName}, focused on driving business growth and operational efficiency.`}
                    </p>
                    
                    {(leadData.companyDetails?.industry || leadData.position) && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {leadData.companyDetails?.industry && (
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-sm font-bold rounded-lg border border-blue-100">
                            {leadData.companyDetails.industry}
                          </span>
                        )}
                        {leadData.position && (
                          <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-sm font-bold rounded-lg border border-purple-100">
                            {leadData.position}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {aiContent?.overview?.keyInsights && (
                      <ul className="space-y-1.5 text-sm text-gray-500 list-disc pl-4 marker:text-blue-400">
                        {aiContent.overview.keyInsights.slice(0, 3).map((insight: string, idx: number) => (
                          <li key={idx}>{insight}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* About Company */}
                <div className="p-5 sm:p-6 md:p-8 bg-[#FBFBFC] border-t md:border-t-0 md:border-l border-gray-100">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">
                      About {leadData.companyName}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {leadData.customFields?.aboutCompany ||
                        (apolloPerson?.organization?.description 
                          ? (apolloPerson.organization.description.substring(0, 120) + 
                             (apolloPerson.organization.description.length > 120 ? '...' : ''))
                          : `${leadData.companyName} is a growing company in the ${leadData.companyDetails.industry} industry.`)}
                    </p>
                    
                    {aiContent?.company?.keyPoints && (
                      <ul className="space-y-1.5 text-sm text-gray-500 list-disc pl-4 marker:text-indigo-400">
                        {aiContent.company.keyPoints.slice(0, 3).map((point: string, idx: number) => (
                          <li key={idx}>{point}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-200/60 flex flex-col sm:flex-row gap-3 sm:gap-4">
                    {companyWebsiteHref ? (
                      <a
                        href={companyWebsiteHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 transition shadow-sm"
                      >
                        <Globe className="w-3.5 h-3.5 text-gray-400" />
                        Official Website
                      </a>
                    ) : (
                      <div className="flex-1 py-1.5 flex items-center justify-center gap-2 bg-gray-100 rounded-xl border border-gray-200 text-sm font-bold text-gray-400 shadow-sm cursor-not-allowed">
                        <Globe className="w-3.5 h-3.5 text-gray-300" />
                        Website Unavailable
                      </div>
                    )}
                    {companyLinkedinHref ? (
                      <a
                        href={companyLinkedinHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 flex items-center justify-center gap-2 bg-[#0A66C2] hover:bg-[#084e96] rounded-xl text-sm font-bold text-white transition shadow-sm"
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                        LinkedIn
                      </a>
                    ) : (
                      <div className="flex-1 py-1.5 flex items-center justify-center gap-2 bg-gray-100 rounded-xl border border-gray-200 text-sm font-bold text-gray-400 shadow-sm cursor-not-allowed">
                        <Linkedin className="w-3.5 h-3.5 text-gray-300" />
                        LinkedIn Unavailable
                      </div>
                    )}
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
                  <h3 className="text-sm font-bold text-gray-900">Strategic Meeting Brief</h3>
                </div>
                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-sm font-black rounded-lg border border-amber-100 uppercase tracking-widest">
                  High Stakes
                </span>
              </div>

              <div className="space-y-6">
                {/* Meeting Agenda/Objective */}
                {(report.meetingAgenda || report.meetingObjective) && (
                  <section className="bg-purple-50/50 p-5 rounded-2xl border border-purple-100/50">
                    <h4 className="text-xs font-black text-purple-600 uppercase tracking-widest mb-2">
                      Meeting Agenda
                    </h4>
                    <p className="text-sm text-gray-800 leading-relaxed font-medium">
                      {report.meetingAgenda || report.meetingObjective}
                    </p>
                  </section>
                )}

                {/* Problem/Pitch */}
                {report.problemPitch && (
                  <section className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100/50">
                    <h4 className="text-xs font-black text-orange-600 uppercase tracking-widest mb-2">
                      Problem/Pitch
                    </h4>
                    <p className="text-sm text-gray-800 leading-relaxed font-medium">
                      {report.problemPitch}
                    </p>
                  </section>
                )}

                <section>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    AI-Generated Primary Objective
                  </h4>
                  {aiContent?.strategicBrief ? (
                    <p className="text-sm text-gray-800 leading-relaxed font-medium">
                      {aiContent.strategicBrief.primaryObjective}
                    </p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-500 italic">
                        Strategic brief not available for this shared report
                      </p>
                    </div>
                  )}
                </section>

                {aiContent?.strategicBrief && (
                  <>
                    <section className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-4 h-4 text-blue-600" />
                        <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest">
                          Recommended Approach
                        </h4>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed mb-4 italic font-medium">
                        {aiContent.strategicBrief.recommendedApproach}
                      </p>
                      
                      {aiContent.strategicBrief.keyBenefits && aiContent.strategicBrief.keyBenefits.length > 0 && (
                        <div className="grid grid-cols-3 gap-3">
                          {aiContent.strategicBrief.keyBenefits.slice(0, 3).map((point: string, idx: number) => (
                            <div key={idx} className="bg-white p-3 rounded-xl shadow-sm border border-blue-100/30">
                              <p className="text-xs font-black text-blue-600 uppercase mb-1">
                                {String(idx + 1).padStart(2, '0')}
                              </p>
                              <p className="text-sm font-bold text-gray-900 leading-tight">
                                {point}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>

                    {aiContent.strategicBrief.criticalDiscipline && (
                      <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                        <div className="flex items-center gap-2 mb-1.5 text-rose-700">
                          <AlertOctagon className="w-3.5 h-3.5" />
                          <h4 className="text-xs font-black uppercase tracking-widest">CRITICAL DISCIPLINE</h4>
                        </div>
                        <p className="text-sm text-rose-800 font-medium">
                          {aiContent.strategicBrief.criticalDiscipline}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Company News Section */}
            <div className="apple-card p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">
                    <Newspaper className="h-4 w-4 text-orange-600" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">Company News & Updates</h3>
                </div>
                {/* Refresh News Button */}
                <button
                  onClick={handleRefreshNews}
                  disabled={isRefreshingNews}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Fetch latest news"
                >
                  {isRefreshingNews ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Refreshing...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Refresh News</span>
                    </>
                  )}
                </button>
              </div>
              {(report.companyNews || aiContent?.news) ? (
                <NewsContent
                  content={aiContent?.news}
                  companyNews={report.companyNews}
                  isEditing={false}
                />
              ) : (
                <div className="text-center py-8">
                  <Newspaper className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 mb-4">No news available for this report yet.</p>
                  <button
                    onClick={handleRefreshNews}
                    disabled={isRefreshingNews}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
                  >
                    {isRefreshingNews ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Fetching News...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span>Fetch Company News</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Engagement Timeline */}
            <div className="apple-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
                    <History className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">Engagement Timeline</h3>
                </div>
              </div>

              {Array.isArray(leadData.engagementTimeline) && leadData.engagementTimeline.length > 0 ? (
                <div className="space-y-4 relative pl-8" style={{
                  borderLeft: '2px solid rgba(0, 0, 0, 0.08)',
                  marginLeft: '14px'
                }}>
                  {leadData.engagementTimeline
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
                        <div key={activity.id} className="relative hover:bg-gray-50/50 p-3 -m-3 rounded-xl transition-all">
                          <div className={`absolute -left-[27px] top-3 w-4 h-4 rounded-full ${idx === 0 ? typeConfig.color : 'bg-slate-200'} border-4 border-white shadow-sm z-10 flex items-center justify-center`}>
                            {idx === 0 && <IconComponent className="w-2 h-2 text-white" />}
                          </div>
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                  activity.type === 'call' ? 'bg-green-100 text-green-700' :
                                  activity.type === 'email' ? 'bg-blue-100 text-blue-700' :
                                  activity.type === 'meeting' ? 'bg-purple-100 text-purple-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {typeConfig.label}
                                </span>
                                <span className="text-xs font-bold text-gray-400 uppercase">
                                  {new Date(activity.createdAt).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: new Date(activity.createdAt).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                                  })}
                                </span>
                              </div>
                              <p className="text-sm font-bold text-gray-900">
                                {activity.content}
                              </p>
                            </div>
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
                  <p className="text-sm text-gray-500">No engagement activities yet</p>
                </div>
              )}
            </div>
          </div>
          {/* RIGHT SIDEBAR */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-5">
            {/* SDR Owner Card */}
            <div className="apple-card p-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Report Owner</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {report.reportOwnerName ? report.reportOwnerName.charAt(0).toUpperCase() : report.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {report.reportOwnerName || report.email.split('@')[0]}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Strategic Timeline */}
            <div className="apple-card p-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                Strategic Timeline
              </h3>

              <div className="grid grid-cols-1 gap-3 mb-5">
                <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/50 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-emerald-600 font-black uppercase tracking-widest">
                      Last Updated
                    </p>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">
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
                      <p className="text-xs text-amber-600 font-black uppercase tracking-widest">
                        Next Follow-up
                      </p>
                      <p className="text-sm font-bold text-gray-800 mt-0.5">
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
            <div className="apple-card p-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                Internal Notes
              </h3>

              <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto pr-1 custom-scroll">
                {leadData.notes && leadData.notes.length > 0 ? (
                  leadData.notes.map((note) => (
                    <div key={note.id} className="bg-[#FFFDF2] p-4 rounded-xl border border-[#EEE1A8]/50 shadow-sm">
                      <p className="text-sm font-bold text-gray-800 mb-1">
                        {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • Note
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">{note.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-500 text-center">No notes yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
