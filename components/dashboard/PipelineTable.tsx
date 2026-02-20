"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Flame, Thermometer, Calendar, RotateCcw, CheckCircle, Filter, Pencil, Trash2, User, Check, X, Tags, Eye } from "lucide-react";
import { updateLeadStatus, updateReportOwner, deleteReportById } from "@/app/actions";
import { LEAD_STATUS_ORDER, getLeadStatusLabel, normalizeLeadStatus } from "@/lib/lead-status";

interface Report {
  _id: string;
  email: string;
  reportOwnerName?: string;
  createdAt: string;
  meetingDate?: string;
  meetingPlatform?: string;
  leadData?: {
    project?: string;
    solutions?: string[];
    status?: 'hot' | 'warm' | 'meeting_scheduled' | 'meeting_rescheduled' | 'meeting_done';
  };
}

interface PipelineTableProps {
  reports: Report[];
  userRole: 'admin' | 'project_user' | 'client';
}

export function PipelineTable({ reports, userRole }: PipelineTableProps) {
  const canManageOwnerAndDelete = userRole !== 'client';
  const canAssignSolutions = userRole !== 'client';
  const [tableReports, setTableReports] = useState<Report[]>(reports);
  const [projectSolutions, setProjectSolutions] = useState<Record<string, string[]>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedSolution, setSelectedSolution] = useState<string>('all');
  const [selectedOwner, setSelectedOwner] = useState<string>('all');
  const [editingOwnerId, setEditingOwnerId] = useState<string | null>(null);
  const [ownerDraft, setOwnerDraft] = useState('');
  const [isOwnerSaving, setIsOwnerSaving] = useState(false);
  const [deletingReportId, setDeletingReportId] = useState<string | null>(null);
  const [assigningReport, setAssigningReport] = useState<Report | null>(null);
  const [assigningSolutions, setAssigningSolutions] = useState<string[]>([]);
  const [isAssigningSaving, setIsAssigningSaving] = useState(false);

  useEffect(() => {
    setTableReports(reports);
  }, [reports]);

  useEffect(() => {
    const loadProjectSolutions = async () => {
      try {
        const response = await fetch('/api/form-options', {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) return;
        const data = await response.json();
        setProjectSolutions(data.projectSolutions || {});
      } catch (error) {
        console.error('Failed to load project solutions for pipeline actions:', error);
      }
    };

    loadProjectSolutions();
  }, []);

  useEffect(() => {
    setSelectedSolution('all');
  }, [selectedProject]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = normalizeLeadStatus(status);
    switch (normalizedStatus) {
      case 'hot':
        return 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200 dark:from-red-900/20 dark:to-red-800/20 dark:text-red-300 dark:border-red-700';
      case 'warm':
        return 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 dark:text-orange-300 dark:border-orange-700';
      case 'meeting_scheduled':
        return 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 dark:text-blue-300 dark:border-blue-700';
      case 'meeting_rescheduled':
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 border-yellow-200 dark:from-yellow-900/20 dark:to-yellow-800/20 dark:text-yellow-300 dark:border-yellow-700';
      case 'meeting_done':
        return 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200 dark:from-green-900/20 dark:to-green-800/20 dark:text-green-300 dark:border-green-700';
      default:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200 dark:from-gray-900/20 dark:to-gray-800/20 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    const normalizedStatus = normalizeLeadStatus(status);
    switch (normalizedStatus) {
      case 'hot':
        return <Flame className="w-4 h-4" />;
      case 'warm':
        return <Thermometer className="w-4 h-4" />;
      case 'meeting_scheduled':
        return <Calendar className="w-4 h-4" />;
      case 'meeting_rescheduled':
        return <RotateCcw className="w-4 h-4" />;
      case 'meeting_done':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Thermometer className="w-4 h-4" />;
    }
  };

  const handleStatusUpdate = async (reportId: string, newStatus: string) => {
    try {
      await updateLeadStatus(reportId, newStatus);
      setTableReports((prev) =>
        prev.map((report) =>
          report._id === reportId
            ? {
                ...report,
                leadData: {
                  ...report.leadData,
                  status: normalizeLeadStatus(newStatus),
                },
              }
            : report
        )
      );
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleOwnerEditStart = (report: Report) => {
    if (!canManageOwnerAndDelete) return;
    setEditingOwnerId(report._id);
    setOwnerDraft(report.reportOwnerName || '');
  };

  const handleOwnerSave = async (reportId: string) => {
    if (!canManageOwnerAndDelete) return;
    const trimmedOwner = ownerDraft.trim();
    if (!trimmedOwner) return;

    try {
      setIsOwnerSaving(true);
      await updateReportOwner(reportId, trimmedOwner);
      setTableReports((prev) =>
        prev.map((report) =>
          report._id === reportId
            ? { ...report, reportOwnerName: trimmedOwner }
            : report
        )
      );
      setEditingOwnerId(null);
      setOwnerDraft('');
    } catch (error) {
      console.error('Failed to update report owner:', error);
    } finally {
      setIsOwnerSaving(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!canManageOwnerAndDelete) return;
    const shouldDelete = window.confirm('Delete this report from pipeline? This cannot be undone.');
    if (!shouldDelete) return;

    try {
      setDeletingReportId(reportId);
      await deleteReportById(reportId);
      setTableReports((prev) => prev.filter((report) => report._id !== reportId));
    } catch (error) {
      console.error('Failed to delete report:', error);
    } finally {
      setDeletingReportId(null);
    }
  };

  const openAssignSolutionsDialog = (report: Report) => {
    if (!canAssignSolutions) return;
    setAssigningReport(report);
    setAssigningSolutions(report.leadData?.solutions || []);
  };

  const handleAssignSolutionToggle = (solution: string) => {
    setAssigningSolutions((prev) =>
      prev.includes(solution)
        ? prev.filter((value) => value !== solution)
        : [...prev, solution]
    );
  };

  const handleAssignSolutionsSave = async () => {
    if (!assigningReport) return;

    try {
      setIsAssigningSaving(true);
      const updateResponse = await fetch(`/api/reports/${assigningReport._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          solutions: assigningSolutions,
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to assign solutions');
      }

      setTableReports((prev) =>
        prev.map((item) =>
          item._id === assigningReport._id
            ? {
                ...item,
                leadData: {
                  ...item.leadData,
                  solutions: assigningSolutions,
                },
              }
            : item
        )
      );

      setAssigningReport(null);
      setAssigningSolutions([]);
    } catch (error) {
      console.error('Failed to assign solutions:', error);
      alert('Failed to assign solutions for this lead');
    } finally {
      setIsAssigningSaving(false);
    }
  };

  const statusMeta = {
    hot: {
      icon: Flame,
      accentClass: 'hover:bg-red-50 dark:hover:bg-red-950/50 focus:bg-red-50 dark:focus:bg-red-950/50 data-[state=checked]:bg-red-100 dark:data-[state=checked]:bg-red-950/70',
      iconWrapClass: 'bg-red-500/10 dark:bg-red-500/20',
      iconClass: 'text-red-600 dark:text-red-400',
      subtitle: 'High priority',
    },
    warm: {
      icon: Thermometer,
      accentClass: 'hover:bg-orange-50 dark:hover:bg-orange-950/50 focus:bg-orange-50 dark:focus:bg-orange-950/50 data-[state=checked]:bg-orange-100 dark:data-[state=checked]:bg-orange-950/70',
      iconWrapClass: 'bg-orange-500/10 dark:bg-orange-500/20',
      iconClass: 'text-orange-600 dark:text-orange-400',
      subtitle: 'Interested',
    },
    meeting_scheduled: {
      icon: Calendar,
      accentClass: 'hover:bg-blue-50 dark:hover:bg-blue-950/50 focus:bg-blue-50 dark:focus:bg-blue-950/50 data-[state=checked]:bg-blue-100 dark:data-[state=checked]:bg-blue-950/70',
      iconWrapClass: 'bg-blue-500/10 dark:bg-blue-500/20',
      iconClass: 'text-blue-600 dark:text-blue-400',
      subtitle: 'Confirmed',
    },
    meeting_rescheduled: {
      icon: RotateCcw,
      accentClass: 'hover:bg-yellow-50 dark:hover:bg-yellow-950/50 focus:bg-yellow-50 dark:focus:bg-yellow-950/50 data-[state=checked]:bg-yellow-100 dark:data-[state=checked]:bg-yellow-950/70',
      iconWrapClass: 'bg-yellow-500/10 dark:bg-yellow-500/20',
      iconClass: 'text-yellow-600 dark:text-yellow-400',
      subtitle: 'New time',
    },
    meeting_done: {
      icon: CheckCircle,
      accentClass: 'hover:bg-green-50 dark:hover:bg-green-950/50 focus:bg-green-50 dark:focus:bg-green-950/50 data-[state=checked]:bg-green-100 dark:data-[state=checked]:bg-green-950/70',
      iconWrapClass: 'bg-green-500/10 dark:bg-green-500/20',
      iconClass: 'text-green-600 dark:text-green-400',
      subtitle: 'Finished',
    },
  } as const;

  // Get unique projects for filter dropdown
  const uniqueProjects = Array.from(
    new Set(
      tableReports
        .map(report => report.leadData?.project?.trim())
        .filter((project): project is string => 
          project !== undefined &&
          project !== '' && 
          project !== 'N/A' && 
          project !== 'NA' && 
          project !== 'not applicable' && 
          project !== '-'
        )
    )
  ).sort();

  // Get unique owners (report owner names) for filter dropdown
  const uniqueOwners = Array.from(
    new Set(
      tableReports
        .map(report => report.reportOwnerName?.trim())
        .filter((ownerName): ownerName is string => 
          ownerName !== undefined && ownerName !== ''
        )
    )
  ).sort();

  const uniqueSolutions = Array.from(
    new Set(
      tableReports
        .filter((report) => selectedProject === 'all' || report.leadData?.project?.trim() === selectedProject)
        .flatMap((report) => report.leadData?.solutions || [])
        .map((solution) => solution?.trim())
        .filter((solution): solution is string => !!solution)
    )
  ).sort();

  const ownerSuggestions = uniqueOwners
    .filter((owner) =>
      owner.toLowerCase().includes(ownerDraft.toLowerCase()) &&
      owner.toLowerCase() !== ownerDraft.toLowerCase()
    )
    .slice(0, 6);

  const filteredReports = tableReports.filter(report => {
    const matchesSearch = report.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = selectedProject === 'all' || report.leadData?.project?.trim() === selectedProject;
    const matchesSolution = selectedSolution === 'all' || (report.leadData?.solutions || []).includes(selectedSolution);
    const matchesOwner = selectedOwner === 'all' || report.reportOwnerName?.trim() === selectedOwner;
    return matchesSearch && matchesProject && matchesSolution && matchesOwner;
  });

  // Calculate status counts based on filtered reports
  const statusCounts = filteredReports.reduce((acc, report) => {
    const status = report.leadData?.status || 'warm';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalLeads = filteredReports.length;
  const statusCardMeta = {
    hot: {
      label: 'Hot Leads',
      icon: Flame,
      iconBgColor: 'bg-red-50 dark:bg-red-950/30',
      iconColor: 'text-red-600 dark:text-red-400',
      textColor: 'text-red-700 dark:text-red-300',
      borderColor: 'border-red-200 dark:border-red-700',
    },
    warm: {
      label: 'Warm Leads',
      icon: Thermometer,
      iconBgColor: 'bg-orange-50 dark:bg-orange-950/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      textColor: 'text-orange-700 dark:text-orange-300',
      borderColor: 'border-orange-200 dark:border-orange-700',
    },
    meeting_scheduled: {
      label: 'Meetings Scheduled',
      icon: Calendar,
      iconBgColor: 'bg-blue-50 dark:bg-blue-950/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      textColor: 'text-blue-700 dark:text-blue-300',
      borderColor: 'border-blue-200 dark:border-blue-700',
    },
    meeting_rescheduled: {
      label: 'Rescheduled',
      icon: RotateCcw,
      iconBgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      textColor: 'text-yellow-700 dark:text-yellow-300',
      borderColor: 'border-yellow-200 dark:border-yellow-700',
    },
    meeting_done: {
      label: 'Completed',
      icon: CheckCircle,
      iconBgColor: 'bg-green-50 dark:bg-green-950/30',
      iconColor: 'text-green-600 dark:text-green-400',
      textColor: 'text-green-700 dark:text-green-300',
      borderColor: 'border-green-200 dark:border-green-700',
    }
  } as const;

  const statusCards = LEAD_STATUS_ORDER.map((status) => {
    const meta = statusCardMeta[status];
    return {
      status,
      label: meta.label,
      count: statusCounts[status] || 0,
      icon: meta.icon,
      bgColor: 'bg-white dark:bg-gray-800',
      iconBgColor: meta.iconBgColor,
      iconColor: meta.iconColor,
      textColor: meta.textColor,
      borderColor: meta.borderColor,
      countColor: 'text-gray-900 dark:text-white'
    };
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Lead Pipeline</h1>
        <p className="text-gray-600 dark:text-gray-300">Track and manage your lead reports</p>
      </div>

      {/* Status Count Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {statusCards.map((card) => {
          const IconComponent = card.icon;
          const percentage = totalLeads > 0 ? Math.round((card.count / totalLeads) * 100) : 0;
          
          return (
            <div
              key={card.status}
              className={`${card.bgColor} ${card.borderColor} border-2 rounded-xl p-6 transition-all duration-200 hover:shadow-lg hover:scale-105 shadow-sm`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${card.iconBgColor}`}>
                  <IconComponent className={`w-6 h-6 ${card.iconColor}`} />
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${card.countColor}`}>
                    {card.count}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {percentage}% of total
                  </div>
                </div>
              </div>
              <div>
                <h3 className={`font-semibold text-sm ${card.textColor}`}>
                  {card.label}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {card.count === 1 ? 'lead' : 'leads'} in pipeline
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters Section */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-900"
            />
          </div>
          
          {/* Project Filter (Admin only) */}
          {userRole === 'admin' && (
            <div className="relative sm:w-56">
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="h-12 rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-900">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {selectedProject === 'all' ? 'All Projects' : selectedProject}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent className="w-56 max-h-60 rounded-xl border shadow-xl bg-white dark:bg-gray-900">
                  <SelectItem
                    value="all"
                    className="rounded-lg p-3 pr-10 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 focus:bg-gray-50 dark:focus:bg-gray-800"
                  >
                    <div className="flex items-center gap-3 pr-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30">
                        <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">All Projects</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Show all leads</div>
                      </div>
                    </div>
                  </SelectItem>
                  {uniqueProjects.map((project) => (
                    <SelectItem
                      key={project}
                      value={project}
                      className="rounded-lg p-3 pr-10 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 focus:bg-gray-50 dark:focus:bg-gray-800"
                    >
                      <div className="flex items-center gap-3 pr-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/30">
                          <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                            {project.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900 dark:text-white truncate">{project}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {tableReports.filter(r => r.leadData?.project?.trim() === project).length} leads
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Solution Filter */}
          <div className="relative sm:w-56">
            <Select
              value={selectedSolution}
              onValueChange={setSelectedSolution}
            >
              <SelectTrigger className="h-12 rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-900">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {selectedSolution === 'all' ? 'All Solutions' : selectedSolution}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent className="w-56 max-h-60 rounded-xl border shadow-xl bg-white dark:bg-gray-900">
                <SelectItem value="all" className="rounded-lg p-3 pr-10 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 focus:bg-gray-50 dark:focus:bg-gray-800">
                  <div className="font-medium text-gray-900 dark:text-white">All Solutions</div>
                </SelectItem>
                {uniqueSolutions.map((solution) => (
                  <SelectItem
                    key={solution}
                    value={solution}
                    className="rounded-lg p-3 pr-10 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 focus:bg-gray-50 dark:focus:bg-gray-800"
                  >
                    <div className="flex items-center justify-between gap-3 pr-2">
                      <div className="font-medium text-gray-900 dark:text-white truncate">{solution}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {tableReports.filter((r) => (r.leadData?.solutions || []).includes(solution)).length}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Owner Filter */}
          <div className="relative sm:w-56">
            <Select value={selectedOwner} onValueChange={setSelectedOwner}>
              <SelectTrigger className="h-12 rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-900">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {selectedOwner === 'all' ? 'All Owners' : selectedOwner}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent className="w-56 max-h-60 rounded-xl border shadow-xl bg-white dark:bg-gray-900">
                <SelectItem 
                  value="all" 
                  className="rounded-lg p-3 pr-10 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 focus:bg-gray-50 dark:focus:bg-gray-800"
                >
                  <div className="flex items-center gap-3 pr-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30">
                      <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">All Owners</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Show all leads</div>
                    </div>
                  </div>
                </SelectItem>
                {uniqueOwners.map((owner) => (
                  <SelectItem 
                    key={owner} 
                    value={owner}
                    className="rounded-lg p-3 pr-10 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 focus:bg-gray-50 dark:focus:bg-gray-800"
                  >
                    <div className="flex items-center gap-3 pr-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/30">
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                          {owner.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 dark:text-white truncate">{owner}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {tableReports.filter(r => r.reportOwnerName?.trim() === owner).length} leads
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Active Filters Display */}
        {((userRole === 'admin' && selectedProject !== 'all') || selectedSolution !== 'all' || selectedOwner !== 'all' || searchQuery) && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Active filters:</span>
            {userRole === 'admin' && selectedProject !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                Project: {selectedProject}
                <button
                  onClick={() => setSelectedProject('all')}
                  className="ml-1 hover:text-purple-900 dark:hover:text-purple-100"
                >
                  ×
                </button>
              </span>
            )}
            {selectedSolution !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                Solution: {selectedSolution}
                <button
                  onClick={() => setSelectedSolution('all')}
                  className="ml-1 hover:text-amber-900 dark:hover:text-amber-100"
                >
                  ×
                </button>
              </span>
            )}
            {selectedOwner !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                Owner: {selectedOwner}
                <button
                  onClick={() => setSelectedOwner('all')}
                  className="ml-1 hover:text-green-900 dark:hover:text-green-100"
                >
                  ×
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                Search: &quot;{searchQuery}&quot;
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedProject('all');
                setSelectedSolution('all');
                setSelectedOwner('all');
                setSearchQuery('');
              }}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Created
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Email
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Report Owner
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Project
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Solutions
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Lead Status
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredReports.map((report) => {
                const leadStatus = normalizeLeadStatus(report.leadData?.status);
                return (
                  <tr key={report._id.toString()} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-4 px-6 text-sm text-gray-900 dark:text-white">
                      {formatDate(report.createdAt)}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900 dark:text-white">
                      {report.email}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900 dark:text-white">
                      {editingOwnerId === report._id ? (
                        <div className="w-[340px] rounded-xl border border-blue-100 bg-blue-50/40 p-2.5 shadow-sm">
                          <div className="relative">
                            <User className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                            <Input
                              value={ownerDraft}
                              onChange={(e) => setOwnerDraft(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleOwnerSave(report._id);
                                }
                                if (e.key === 'Escape') {
                                  setEditingOwnerId(null);
                                  setOwnerDraft('');
                                }
                              }}
                              list="pipeline-owner-suggestions"
                              className="h-8 border-blue-200 bg-white pl-8"
                              placeholder="Type owner name..."
                              autoFocus
                            />
                            <datalist id="pipeline-owner-suggestions">
                              {uniqueOwners.map((owner) => (
                                <option key={owner} value={owner} />
                              ))}
                            </datalist>
                          </div>

                          {ownerSuggestions.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {ownerSuggestions.map((owner) => (
                                <button
                                  key={owner}
                                  type="button"
                                  onClick={() => setOwnerDraft(owner)}
                                  className="rounded-full border border-blue-200 bg-white px-2 py-0.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                                >
                                  {owner}
                                </button>
                              ))}
                            </div>
                          )}

                          <div className="mt-2 flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs"
                              onClick={() => {
                                setEditingOwnerId(null);
                                setOwnerDraft('');
                              }}
                              disabled={isOwnerSaving}
                            >
                              <X className="w-3.5 h-3.5 mr-1" />
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => handleOwnerSave(report._id)}
                              disabled={isOwnerSaving || !ownerDraft.trim()}
                            >
                              <Check className="w-3.5 h-3.5 mr-1" />
                              {isOwnerSaving ? 'Saving...' : 'Save'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>{report.reportOwnerName || '-'}</span>
                          {canManageOwnerAndDelete && (
                            <button
                              onClick={() => handleOwnerEditStart(report)}
                              className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                              aria-label="Edit report owner"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900 dark:text-white">
                      {report.leadData?.project || '-'}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900 dark:text-white">
                      {report.leadData?.solutions && report.leadData.solutions.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {report.leadData.solutions.map((solution) => (
                            <span key={solution} className="inline-flex items-center rounded-md bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 text-xs dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800">
                              {solution}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <style jsx>{`
                        [data-radix-select-item-indicator] {
                          display: none !important;
                        }
                        .select-item-no-indicator [data-radix-select-item-indicator] {
                          display: none !important;
                        }
                        .select-item-no-indicator > span:last-child {
                          display: none !important;
                        }
                      `}</style>
                      <Select
                        value={leadStatus}
                        onValueChange={(value) => handleStatusUpdate(report._id, value)}
                      >
                        <SelectTrigger className={`w-48 h-9 rounded-lg border-0 shadow-sm transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-blue-500/20 focus:shadow-lg ${getStatusColor(leadStatus)}`}>
                          <div className="flex items-center gap-2.5">
                            {getStatusIcon(leadStatus)}
                            <span className="font-medium text-sm whitespace-nowrap">
                              {getLeadStatusLabel(leadStatus)}
                            </span>
                          </div>
                        </SelectTrigger>
                        <SelectContent className="w-64 rounded-lg border shadow-xl bg-white dark:bg-gray-900 p-2">
                          {LEAD_STATUS_ORDER.map((status) => {
                            const statusConfig = statusMeta[status];
                            const StatusIcon = statusConfig.icon;
                            return (
                              <SelectItem
                                key={status}
                                value={status}
                                className={`select-item-no-indicator rounded-md p-3 cursor-pointer transition-all duration-200 border-0 ${statusConfig.accentClass}`}
                                style={{ position: 'relative' }}
                              >
                                <div className="flex items-center gap-3 w-full" style={{ position: 'relative', zIndex: 1 }}>
                                  <div className={`flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0 ${statusConfig.iconWrapClass}`}>
                                    <StatusIcon className={`w-3.5 h-3.5 ${statusConfig.iconClass}`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm text-gray-900 dark:text-white whitespace-nowrap">
                                      {getLeadStatusLabel(status)}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                      {statusConfig.subtitle}
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 border border-blue-200 bg-blue-50/50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-900/40 dark:hover:text-blue-300"
                          onClick={() => window.open(`/report/${report._id}`, '_blank')}
                          title="View Report"
                          aria-label="View report"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {canAssignSolutions && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 border border-amber-200 bg-amber-50/50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400 dark:hover:bg-amber-900/40 dark:hover:text-amber-300"
                            onClick={() => openAssignSolutionsDialog(report)}
                            title="Assign Solutions"
                            aria-label="Assign solutions"
                          >
                            <Tags className="w-4 h-4" />
                          </Button>
                        )}
                        {canManageOwnerAndDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 border border-red-200 bg-red-50/50 text-red-600 hover:bg-red-100 hover:text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/40 dark:hover:text-red-300"
                            onClick={() => handleDeleteReport(report._id)}
                            disabled={deletingReportId === report._id}
                            title={deletingReportId === report._id ? 'Deleting...' : 'Delete Report'}
                            aria-label={deletingReportId === report._id ? 'Deleting report' : 'Delete report'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog
        open={!!assigningReport}
        onOpenChange={(open) => {
          if (!open) {
            setAssigningReport(null);
            setAssigningSolutions([]);
          }
        }}
      >
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle>Assign Solutions</DialogTitle>
          </DialogHeader>

          {assigningReport && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Select one or more solutions for <span className="font-medium">{assigningReport.email}</span>.
              </p>
              <div className="rounded-lg border p-3 max-h-64 overflow-y-auto space-y-2">
                {(() => {
                  const projectName = assigningReport.leadData?.project?.trim() || '';
                  const options = projectName ? (projectSolutions[projectName] || []) : [];
                  if (options.length === 0) {
                    return (
                      <p className="text-sm text-gray-500">
                        No configured solutions for this project. Add them in Project Settings first.
                      </p>
                    );
                  }

                  return options.map((solution) => (
                    <label key={solution} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={assigningSolutions.includes(solution)}
                        onChange={() => handleAssignSolutionToggle(solution)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{solution}</span>
                    </label>
                  ));
                })()}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setAssigningReport(null);
                    setAssigningSolutions([]);
                  }}
                  disabled={isAssigningSaving}
                >
                  Cancel
                </Button>
                <Button onClick={handleAssignSolutionsSave} disabled={isAssigningSaving}>
                  {isAssigningSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 