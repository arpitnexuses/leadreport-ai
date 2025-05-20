"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
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
} from "lucide-react";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { ReportSidebar } from "@/components/report/ReportSidebar";

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
    };
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
    status: 'new',
    nextFollowUp: '',
    customFields: {},
  });
  const [newNote, setNewNote] = useState('');
  const [newTag, setNewTag] = useState('');
  const [selectedTab, setSelectedTab] = useState<'contact' | 'about' | 'experience'>('contact');
  const [editedLeadData, setEditedLeadData] = useState<LeadData | null>(null);
  const [editedSkills, setEditedSkills] = useState<string[]>([]);
  const [editedLanguages, setEditedLanguages] = useState<{name: string, level: string}[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState({ name: '', level: '' });

  useEffect(() => {
    if (report) {
      setEditedData({
        notes: report.leadData.notes || [],
        tags: report.leadData.tags || [],
        status: report.leadData.status || 'new',
        nextFollowUp: report.leadData.nextFollowUp ? new Date(report.leadData.nextFollowUp).toISOString().split('T')[0] : '',
        customFields: report.leadData.customFields || {},
      });
      setEditedLeadData(report.leadData);
      setEditedSkills(skills);
      setEditedLanguages(languages);
    }
  }, [report]);

  const handleReportReady = (loadedReport: LeadReport) => {
    setReport(loadedReport);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/reports/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadData: editedLeadData,
          skills: editedSkills,
          languages: editedLanguages,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update report');
      }

      const updatedReport = await response.json();
      setReport(updatedReport);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating report:', error);
    }
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    setEditedData(prev => ({
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
    setNewNote('');
  };

  const addTag = () => {
    if (!newTag.trim()) return;
    setEditedData(prev => ({
      ...prev,
      tags: [...prev.tags, newTag],
    }));
    setNewTag('');
  };

  if (!report) {
    return (
      <ReportLoader reportId={params.id} onReportReady={handleReportReady} />
    );
  }

  const leadData = report.leadData;

  // Apollo data for About Lead and Experience
  const apolloPerson = report?.apolloData?.person;
  const employment = (apolloPerson && 'employment_history' in apolloPerson && Array.isArray((apolloPerson as any).employment_history)) ? (apolloPerson as any).employment_history : [];
  const currentRole = employment.find((e: any) => e.current) || employment[0];
  const previousRoles = employment.filter((e: any) => !e.current);
  const education = employment.filter((e: any) => e.kind === 'education');
  const skills = [
    'Strategic Planning',
    'Team Leadership',
    'Contract Negotiation',
    'Financial Services',
    'Logistics',
  ];
  const languages = [
    { name: 'English', level: 'Fluent' },
    { name: 'Cantonese', level: 'Native' },
    { name: 'Mandarin', level: 'Proficient' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ReportSidebar
        completion={85}
        lastUpdated={report?.createdAt ? new Date(report.createdAt).toLocaleString() : "-"}
        createdBy={"Sarah Johnson"}
        onRemind={() => {}}
        onSave={handleSave}
      />
      <main className="flex-1">
        <div className="p-6">
          <div className="rounded-2xl shadow-lg bg-white overflow-hidden">
            {/* Header Section */}
            <div className="bg-[#0a47b1] px-10 py-8 flex flex-col md:flex-row md:items-center justify-between rounded-t-2xl relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-blue-800/50 mix-blend-multiply rounded-t-2xl"></div>
              <Image
                src="/header-pattern.png"
                alt="Header Pattern"
                layout="fill"
                objectFit="cover"
                className="opacity-10 rounded-t-2xl"
              />
              <div className="relative z-10">
                <div className="text-white text-lg font-medium mb-2 uppercase tracking-wide">
                  {isEditing ? (
                    <Input
                      value={editedLeadData?.companyName || ""}
                      onChange={(e) => setEditedLeadData(prev => ({ ...prev!, companyName: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  ) : (
                    leadData.companyName || "Company Name"
                  )}
                </div>
                <div className="text-white text-base mb-1">
                  {isEditing ? (
                    <Input
                      value={editedLeadData?.position || ""}
                      onChange={(e) => setEditedLeadData(prev => ({ ...prev!, position: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  ) : (
                    leadData.position || "Position"
                  )}
                </div>
                <div className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                  {isEditing ? (
                    <Input
                      value={editedLeadData?.name || ""}
                      onChange={(e) => setEditedLeadData(prev => ({ ...prev!, name: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-4xl"
                    />
                  ) : (
                    leadData.name || "Lead Name"
                  )}
                </div>
              </div>
              <div className="flex flex-row gap-3 mt-6 md:mt-0 items-center relative z-10">
                <span className="bg-yellow-400 text-black font-semibold px-4 py-1 rounded-full text-sm">Lead Score: 5/5</span>
                <span className="bg-green-500 text-white font-semibold px-4 py-1 rounded-full text-sm">Qualified</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            {/* Content Section */}
            <div className="flex flex-col md:flex-row gap-8 px-10 py-8 bg-white">
              {/* Profile Photo */}
              <div className="flex-shrink-0 flex justify-center md:justify-start">
                <div className="w-48 h-48 rounded-xl overflow-hidden shadow-lg bg-gray-100 flex items-center justify-center">
                  <Image
                    src={leadData.photo || `/placeholder.png`}
                    alt={leadData.name}
                    width={192}
                    height={192}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
              {/* Tabbed Details */}
              <div className="flex-1">
                <div className="mb-4 flex gap-2">
                  <button
                    className={`px-4 py-2 rounded-lg font-semibold shadow-sm ${selectedTab === 'contact' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-100'}`}
                    onClick={() => setSelectedTab('contact')}
                  >
                    Contact Details
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg font-semibold shadow-sm ${selectedTab === 'about' ? 'bg-white border border-gray-300 text-gray-900' : 'text-gray-500 hover:bg-gray-100'}`}
                    onClick={() => setSelectedTab('about')}
                  >
                    About Lead
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg font-semibold shadow-sm ${selectedTab === 'experience' ? 'bg-white border border-gray-300 text-gray-900' : 'text-gray-500 hover:bg-gray-100'}`}
                    onClick={() => setSelectedTab('experience')}
                  >
                    Experience
                  </button>
                </div>
                {/* Tab Content */}
                {selectedTab === 'contact' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-gray-800 text-lg">
                        <Phone className="h-5 w-5 text-blue-700" />
                        {isEditing ? (
                          <Input
                            value={editedLeadData?.contactDetails.phone || ""}
                            onChange={(e) => setEditedLeadData(prev => ({
                              ...prev!,
                              contactDetails: { ...prev!.contactDetails, phone: e.target.value }
                            }))}
                            className="flex-1"
                          />
                        ) : (
                          <span>{leadData.contactDetails.phone || "+852 9123 4567"}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-gray-800 text-lg">
                        <Linkedin className="h-5 w-5 text-blue-700" />
                        {isEditing ? (
                          <Input
                            value={editedLeadData?.contactDetails.linkedin || ""}
                            onChange={(e) => setEditedLeadData(prev => ({
                              ...prev!,
                              contactDetails: { ...prev!.contactDetails, linkedin: e.target.value }
                            }))}
                            className="flex-1"
                          />
                        ) : (
                          <span>{leadData.contactDetails.linkedin}</span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" className="flex items-center gap-2"><Phone className="h-4 w-4" /> Call</Button>
                        <Button variant="outline" className="flex items-center gap-2"><Mail className="h-4 w-4" /> Email</Button>
                        <Button variant="outline" className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Schedule</Button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-gray-800 text-lg">
                        <Mail className="h-5 w-5 text-blue-700" />
                        {isEditing ? (
                          <Input
                            value={editedLeadData?.contactDetails.email || ""}
                            onChange={(e) => setEditedLeadData(prev => ({
                              ...prev!,
                              contactDetails: { ...prev!.contactDetails, email: e.target.value }
                            }))}
                            className="flex-1"
                          />
                        ) : (
                          <span>{leadData.contactDetails.email}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-gray-800 text-lg">
                        <MapPin className="h-5 w-5 text-blue-700" />
                        {isEditing ? (
                          <Input
                            value={editedLeadData?.companyDetails.headquarters || ""}
                            onChange={(e) => setEditedLeadData(prev => ({
                              ...prev!,
                              companyDetails: { ...prev!.companyDetails, headquarters: e.target.value }
                            }))}
                            className="flex-1"
                          />
                        ) : (
                          <span>{leadData.companyDetails.headquarters}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {selectedTab === 'about' && (
                  <div className="space-y-6">
                    <div className="text-lg text-gray-900">
                      {isEditing ? (
                        <Textarea
                          value={typeof (apolloPerson as any)?.headline === 'string' && (apolloPerson as any).headline.trim().length > 0
                            ? (apolloPerson as any).headline
                            : `${editedLeadData?.name} is the ${editedLeadData?.position} at ${editedLeadData?.companyName}.`}
                          onChange={(e) => {
                            if (apolloPerson) {
                              (apolloPerson as any).headline = e.target.value;
                            }
                          }}
                          className="min-h-[100px]"
                        />
                      ) : (
                        typeof (apolloPerson as any)?.headline === 'string' && (apolloPerson as any).headline.trim().length > 0
                          ? (apolloPerson as any).headline
                          : `${leadData.name} is the ${leadData.position} at ${leadData.companyName}.`
                      )}
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-semibold text-gray-900">Skills</div>
                        {isEditing && (
                          <div className="flex gap-2">
                            <Input
                              value={newSkill}
                              onChange={(e) => setNewSkill(e.target.value)}
                              placeholder="Add skill"
                              className="w-40"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (newSkill.trim()) {
                                  setEditedSkills([...editedSkills, newSkill.trim()]);
                                  setNewSkill('');
                                }
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {editedSkills.map((skill, index) => (
                          <div key={index} className="bg-gray-100 px-4 py-1 rounded-full font-semibold text-gray-800 text-base border border-gray-200 flex items-center gap-2">
                            {skill}
                            {isEditing && (
                              <button
                                onClick={() => setEditedSkills(editedSkills.filter((_, i) => i !== index))}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-semibold text-gray-900">Languages</div>
                        {isEditing && (
                          <div className="flex gap-2">
                            <Input
                              value={newLanguage.name}
                              onChange={(e) => setNewLanguage({ ...newLanguage, name: e.target.value })}
                              placeholder="Language"
                              className="w-32"
                            />
                            <Input
                              value={newLanguage.level}
                              onChange={(e) => setNewLanguage({ ...newLanguage, level: e.target.value })}
                              placeholder="Level"
                              className="w-32"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (newLanguage.name.trim() && newLanguage.level.trim()) {
                                  setEditedLanguages([...editedLanguages, { name: newLanguage.name.trim(), level: newLanguage.level.trim() }]);
                                  setNewLanguage({ name: '', level: '' });
                                }
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {editedLanguages.map((lang, index) => (
                          <div key={index} className="bg-gray-100 px-4 py-1 rounded-full font-semibold text-gray-800 text-base border border-gray-200 flex items-center gap-2">
                            {lang.name} ({lang.level})
                            {isEditing && (
                              <button
                                onClick={() => setEditedLanguages(editedLanguages.filter((_, i) => i !== index))}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {selectedTab === 'experience' && (
                  <div className="space-y-8">
                    {currentRole && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={currentRole.organization && currentRole.organization.logo_url ? currentRole.organization.logo_url : "/dhl-logo.png"}
                            alt={currentRole.organization_name + ' Logo'}
                            className="w-14 h-14 rounded-md object-contain bg-white border"
                          />
                          <div className="flex-1">
                            {isEditing ? (
                              <div className="space-y-2">
                                <Input
                                  value={currentRole.title || ""}
                                  onChange={(e) => {
                                    const updatedRole = { ...currentRole, title: e.target.value };
                                    const updatedEmployment = employment.map((role: { title: string; organization_name: string }) =>
                                      role === currentRole ? updatedRole : role
                                    );
                                    if (apolloPerson) {
                                      (apolloPerson as any).employment_history = updatedEmployment;
                                    }
                                  }}
                                  className="font-bold text-lg"
                                />
                                <Input
                                  value={currentRole.organization_name || ""}
                                  onChange={(e) => {
                                    const updatedRole = { ...currentRole, organization_name: e.target.value };
                                    const updatedEmployment = employment.map((role: { title: string; organization_name: string }) =>
                                      role === currentRole ? updatedRole : role
                                    );
                                    if (apolloPerson) {
                                      (apolloPerson as any).employment_history = updatedEmployment;
                                    }
                                  }}
                                  className="text-gray-700"
                                />
                              </div>
                            ) : (
                              <>
                                <div className="font-bold text-lg">{currentRole.title}</div>
                                <div className="text-gray-700">{currentRole.organization_name}, Full-time</div>
                              </>
                            )}
                            <div className="text-gray-500 text-sm">
                              {currentRole.start_date ? `${formatDate(currentRole.start_date)} - Present` : ''} • 
                              {currentRole.start_date ? getDuration(currentRole.start_date) : ''}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-gray-900 mb-2">Previous Roles</div>
                      <div className="space-y-2">
                        {previousRoles.length > 0 ? previousRoles.map((role: any) => (
                          <div key={role.id} className="flex items-center gap-4 border-l-2 border-gray-300 pl-4">
                            <img
                              src={role.organization && role.organization.logo_url ? role.organization.logo_url : "/dhl-logo.png"}
                              alt={role.organization_name + ' Logo'}
                              className="w-10 h-10 rounded-md object-contain bg-white border"
                            />
                            <div>
                              <div className="font-medium">{role.title}</div>
                              <div className="text-gray-600 text-sm">{role.organization_name} • {role.start_date ? formatDate(role.start_date) : ''}{role.end_date ? ` - ${formatDate(role.end_date)}` : ''}</div>
                            </div>
                          </div>
                        )) : <div className="text-gray-500">No previous roles found.</div>}
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 mb-2">Education</div>
                      <div className="space-y-2">
                        {education.length > 0 ? education.map((edu: any) => (
                          <div key={edu.id}>
                            <div className="font-medium">{edu.degree}{edu.major ? `, ${edu.major}` : ''}</div>
                            <div className="text-gray-600 text-sm">{edu.organization_name} • {edu.end_date ? formatDate(edu.end_date) : ''}</div>
                          </div>
                        )) : <div className="text-gray-500">No education info found.</div>}
                      </div>
                    </div>
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

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('default', { month: 'short', year: 'numeric' });
}

function getDuration(startDate: string) {
  if (!startDate) return '';
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
