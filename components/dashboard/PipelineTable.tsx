"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Search, Flame, Thermometer, Calendar, RotateCcw, CheckCircle, Filter, Pencil, Trash2, User, X, Eye, Clock, XCircle, UserCheck, UserX, Loader2, Download, ChevronDown, FileSpreadsheet, FileText } from "lucide-react";
import { updateLeadStatus, updateReportOwner, deleteReportById } from "@/app/actions";
import { LEAD_STATUS_ORDER, LEAD_STATUS_UI, getLeadStatusLabel, normalizeLeadStatus, type LeadStatus } from "@/lib/lead-status";
import { getSharedReportUrl } from "@/lib/brand";
import { exportPipelineTablePdf } from "@/lib/export-pipeline-pdf";
import { exportPipelineTableCsv } from "@/lib/export-pipeline-csv";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Link from "next/link";

const getMonthKey = (dateStr: string) => {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const formatMonthLabel = (monthKey: string) => {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

interface Report {
  _id: string;
  email: string;
  reportOwnerName?: string;
  createdAt: string;
  meetingDate?: string;
  meetingPlatform?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  leadData?: {
    name?: string;
    companyName?: string;
    position?: string;
    project?: string;
    solutions?: string[];
    status?: 'hot' | 'warm' | 'meeting_scheduled' | 'meeting_rescheduled' | 'meeting_done' | 'contact_later' | 'client_manage' | 'client_unavailable' | 'client_rejected' | 'lost';
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
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [editingOwnerId, setEditingOwnerId] = useState<string | null>(null);
  const [ownerDraft, setOwnerDraft] = useState('');
  const [isOwnerSaving, setIsOwnerSaving] = useState(false);
  const [deletingReportId, setDeletingReportId] = useState<string | null>(null);
  const [savingSolutionsId, setSavingSolutionsId] = useState<string | null>(null);
  const [exportingFormat, setExportingFormat] = useState<"csv" | "pdf" | null>(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

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

  const getStatusDotColor = (status: LeadStatus) => LEAD_STATUS_UI[status].chartColor;

  const getStatusBadgeClass = (status: string) => {
    const normalizedStatus = normalizeLeadStatus(status);
    return `${LEAD_STATUS_UI[normalizedStatus].badgeClass} dark:bg-opacity-20`;
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

  const saveSolutions = async (reportId: string, solutions: string[], previousSolutions: string[]) => {
    try {
      setSavingSolutionsId(reportId);
      const updateResponse = await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ solutions }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update solutions');
      }
    } catch (error) {
      console.error('Failed to update solutions:', error);
      setTableReports((prev) =>
        prev.map((item) =>
          item._id === reportId
            ? {
                ...item,
                leadData: {
                  ...item.leadData,
                  solutions: previousSolutions,
                },
              }
            : item
        )
      );
    } finally {
      setSavingSolutionsId(null);
    }
  };

  const exportFilters = {
    searchQuery,
    selectedProject,
    selectedSolution,
    selectedOwner,
    selectedMonth,
    formatMonthLabel,
  };

  const handleExportTablePdf = async () => {
    if (filteredReports.length === 0) return;

    try {
      setExportingFormat("pdf");
      setExportMenuOpen(false);
      await exportPipelineTablePdf(
        filteredReports,
        exportFilters,
        window.location.origin
      );
    } catch (error) {
      console.error("Failed to export pipeline PDF:", error);
      alert(error instanceof Error ? error.message : "Failed to export pipeline PDF");
    } finally {
      setExportingFormat(null);
    }
  };

  const handleExportTableCsv = () => {
    if (filteredReports.length === 0) return;

    try {
      setExportingFormat("csv");
      setExportMenuOpen(false);
      exportPipelineTableCsv(
        filteredReports,
        exportFilters,
        window.location.origin
      );
    } catch (error) {
      console.error("Failed to export pipeline CSV:", error);
      alert(error instanceof Error ? error.message : "Failed to export pipeline CSV");
    } finally {
      setExportingFormat(null);
    }
  };

  const handleSolutionToggle = async (report: Report, solution: string) => {
    if (!canAssignSolutions) return;

    const previousSolutions = report.leadData?.solutions || [];
    const nextSolutions = previousSolutions.includes(solution)
      ? previousSolutions.filter((value) => value !== solution)
      : [...previousSolutions, solution];

    setTableReports((prev) =>
      prev.map((item) =>
        item._id === report._id
          ? {
              ...item,
              leadData: {
                ...item.leadData,
                solutions: nextSolutions,
              },
            }
          : item
      )
    );

    await saveSolutions(report._id, nextSolutions, previousSolutions);
  };

  const handleAddSolution = async (report: Report, solutionText: string) => {
    if (!canAssignSolutions) return;

    const trimmed = solutionText.trim();
    if (!trimmed) return;

    const previousSolutions = report.leadData?.solutions || [];
    if (previousSolutions.includes(trimmed)) return;

    const nextSolutions = [...previousSolutions, trimmed];

    setTableReports((prev) =>
      prev.map((item) =>
        item._id === report._id
          ? {
              ...item,
              leadData: {
                ...item.leadData,
                solutions: nextSolutions,
              },
            }
          : item
      )
    );

    await saveSolutions(report._id, nextSolutions, previousSolutions);
  };

  const getProjectSolutionOptions = (report: Report) => {
    const projectName = report.leadData?.project?.trim() || '';
    return projectName ? (projectSolutions[projectName] || []) : [];
  };

  const getSolutionSuggestions = (report: Report) => {
    const projectOptions = getProjectSolutionOptions(report);
    return Array.from(new Set([...projectOptions, ...uniqueSolutions])).sort();
  };

  const renderSolutionTags = (solutions: string[], report?: Report) => (
    <div className="flex flex-wrap items-center gap-1">
      {solutions.map((solution) => (
        <span
          key={solution}
          className="group/tag inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
        >
          {solution}
          {canAssignSolutions && report && (
            <span
              role="button"
              tabIndex={0}
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onClick={(event) => {
                event.stopPropagation();
                void handleSolutionToggle(report, solution);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  event.stopPropagation();
                  void handleSolutionToggle(report, solution);
                }
              }}
              className="rounded p-0.5 opacity-0 group-hover/tag:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity cursor-pointer"
              aria-label={`Remove ${solution}`}
            >
              <X className="w-2.5 h-2.5" />
            </span>
          )}
        </span>
      ))}
    </div>
  );

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
    contact_later: {
      icon: Clock,
      accentClass: 'hover:bg-purple-50 dark:hover:bg-purple-950/50 focus:bg-purple-50 dark:focus:bg-purple-950/50 data-[state=checked]:bg-purple-100 dark:data-[state=checked]:bg-purple-950/70',
      iconWrapClass: 'bg-purple-500/10 dark:bg-purple-500/20',
      iconClass: 'text-purple-600 dark:text-purple-400',
      subtitle: 'Follow up later',
    },
    client_manage: {
      icon: UserCheck,
      accentClass: 'hover:bg-cyan-50 dark:hover:bg-cyan-950/50 focus:bg-cyan-50 dark:focus:bg-cyan-950/50 data-[state=checked]:bg-cyan-100 dark:data-[state=checked]:bg-cyan-950/70',
      iconWrapClass: 'bg-cyan-500/10 dark:bg-cyan-500/20',
      iconClass: 'text-cyan-600 dark:text-cyan-400',
      subtitle: 'Client managing internally',
    },
    client_unavailable: {
      icon: UserX,
      accentClass: 'hover:bg-indigo-50 dark:hover:bg-indigo-950/50 focus:bg-indigo-50 dark:focus:bg-indigo-950/50 data-[state=checked]:bg-indigo-100 dark:data-[state=checked]:bg-indigo-950/70',
      iconWrapClass: 'bg-indigo-500/10 dark:bg-indigo-500/20',
      iconClass: 'text-indigo-600 dark:text-indigo-400',
      subtitle: 'Client not reachable',
    },
    client_rejected: {
      icon: X,
      accentClass: 'hover:bg-rose-50 dark:hover:bg-rose-950/50 focus:bg-rose-50 dark:focus:bg-rose-950/50 data-[state=checked]:bg-rose-100 dark:data-[state=checked]:bg-rose-950/70',
      iconWrapClass: 'bg-rose-500/10 dark:bg-rose-500/20',
      iconClass: 'text-rose-600 dark:text-rose-400',
      subtitle: 'Rejected by client',
    },
    lost: {
      icon: XCircle,
      accentClass: 'hover:bg-gray-50 dark:hover:bg-gray-950/50 focus:bg-gray-50 dark:focus:bg-gray-950/50 data-[state=checked]:bg-gray-100 dark:data-[state=checked]:bg-gray-950/70',
      iconWrapClass: 'bg-gray-500/10 dark:bg-gray-500/20',
      iconClass: 'text-gray-600 dark:text-gray-400',
      subtitle: 'No longer pursuing',
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

  const availableMonths = Array.from(
    new Set(
      tableReports
        .map((report) => getMonthKey(report.createdAt))
        .filter(Boolean)
    )
  ).sort((a, b) => b.localeCompare(a));

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
    const fullName = `${report.firstName || ''} ${report.lastName || ''}`.trim();
    const leadName = report.leadData?.name || '';
    const companyName = report.leadData?.companyName || report.companyName || '';
    const searchLower = searchQuery.toLowerCase();
    
    const matchesSearch = 
      fullName.toLowerCase().includes(searchLower) ||
      leadName.toLowerCase().includes(searchLower) ||
      companyName.toLowerCase().includes(searchLower);
    
    const matchesProject = selectedProject === 'all' || report.leadData?.project?.trim() === selectedProject;
    const matchesSolution = selectedSolution === 'all' || (report.leadData?.solutions || []).includes(selectedSolution);
    const matchesOwner = selectedOwner === 'all' || report.reportOwnerName?.trim() === selectedOwner;
    const matchesMonth = selectedMonth === 'all' || getMonthKey(report.createdAt) === selectedMonth;
    return matchesSearch && matchesProject && matchesSolution && matchesOwner && matchesMonth;
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
    },
    contact_later: {
      label: 'Contact Later',
      icon: Clock,
      iconBgColor: 'bg-purple-50 dark:bg-purple-950/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      textColor: 'text-purple-700 dark:text-purple-300',
      borderColor: 'border-purple-200 dark:border-purple-700',
    },
    client_manage: {
      label: 'Client Manage',
      icon: UserCheck,
      iconBgColor: 'bg-cyan-50 dark:bg-cyan-950/30',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      textColor: 'text-cyan-700 dark:text-cyan-300',
      borderColor: 'border-cyan-200 dark:border-cyan-700',
    },
    client_unavailable: {
      label: 'Client Unavailable',
      icon: UserX,
      iconBgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      textColor: 'text-indigo-700 dark:text-indigo-300',
      borderColor: 'border-indigo-200 dark:border-indigo-700',
    },
    client_rejected: {
      label: 'Client Rejected',
      icon: X,
      iconBgColor: 'bg-rose-50 dark:bg-rose-950/30',
      iconColor: 'text-rose-600 dark:text-rose-400',
      textColor: 'text-rose-700 dark:text-rose-300',
      borderColor: 'border-rose-200 dark:border-rose-700',
    },
    lost: {
      label: 'Lost',
      icon: XCircle,
      iconBgColor: 'bg-gray-50 dark:bg-gray-950/30',
      iconColor: 'text-gray-600 dark:text-gray-400',
      textColor: 'text-gray-700 dark:text-gray-300',
      borderColor: 'border-gray-200 dark:border-gray-700',
    }
  } as const;

  const statusCards = LEAD_STATUS_ORDER.map((status) => {
    const meta = statusCardMeta[status];
    return {
      status,
      label: meta.label,
      count: statusCounts[status] || 0,
      icon: meta.icon,
      iconBgColor: meta.iconBgColor,
      iconColor: meta.iconColor,
      textColor: meta.textColor,
      borderColor: meta.borderColor
    };
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Lead Pipeline</h1>
          <p className="text-gray-600 dark:text-gray-300">Track and manage your lead reports</p>
        </div>
        <Popover open={exportMenuOpen} onOpenChange={setExportMenuOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-11 shrink-0 rounded-xl border-gray-200 dark:border-gray-700"
              disabled={exportingFormat !== null || filteredReports.length === 0}
            >
              {exportingFormat ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting {exportingFormat.toUpperCase()}...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export ({filteredReports.length})
                  <ChevronDown className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-52 p-1 dark:bg-gray-900 dark:border-gray-700">
            <button
              type="button"
              onClick={() => void handleExportTableCsv()}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => void handleExportTablePdf()}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <FileText className="h-4 w-4" />
              Export PDF
            </button>
          </PopoverContent>
        </Popover>
      </div>

      {/* Compact Status Overview */}
      <div className="mb-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Status Distribution
          </p>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Total: <span className="font-semibold text-gray-700 dark:text-gray-200">{totalLeads}</span>
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-2">
        {statusCards.map((card) => {
          const IconComponent = card.icon;

          return (
            <div
              key={card.status}
              className={`min-w-[170px] ${card.borderColor} border rounded-lg bg-gray-50/70 dark:bg-gray-900/40 px-3 py-2`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`p-1.5 rounded-md ${card.iconBgColor}`}>
                    <IconComponent className={`w-3.5 h-3.5 ${card.iconColor}`} />
                  </div>
                  <p className={`text-xs font-semibold truncate ${card.textColor}`} title={card.label}>
                    {card.label}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-2xl leading-none font-bold text-gray-900 dark:text-white">{card.count}</p>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* Filters Section */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name or company..."
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

          {/* Month Filter */}
          <div className="relative sm:w-56">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="h-12 rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-900">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {selectedMonth === 'all' ? 'All Months' : formatMonthLabel(selectedMonth)}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent className="w-56 max-h-60 rounded-xl border shadow-xl bg-white dark:bg-gray-900">
                <SelectItem value="all" className="rounded-lg p-3 pr-10 cursor-pointer">
                  <div className="font-medium text-gray-900 dark:text-white">All Months</div>
                </SelectItem>
                {availableMonths.map((monthKey) => (
                  <SelectItem key={monthKey} value={monthKey} className="rounded-lg p-3 pr-10 cursor-pointer">
                    <div className="font-medium text-gray-900 dark:text-white">{formatMonthLabel(monthKey)}</div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Active Filters Display */}
        {((userRole === 'admin' && selectedProject !== 'all') || selectedSolution !== 'all' || selectedOwner !== 'all' || selectedMonth !== 'all' || searchQuery) && (
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
            {selectedMonth !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300">
                Month: {formatMonthLabel(selectedMonth)}
                <button
                  onClick={() => setSelectedMonth('all')}
                  className="ml-1 hover:text-slate-900 dark:hover:text-slate-100"
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
                setSelectedMonth('all');
                setSearchQuery('');
              }}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80">
                <th className="h-9 px-3 text-left text-xs font-normal text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  First Name
                </th>
                <th className="h-9 px-3 text-left text-xs font-normal text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  Last Name
                </th>
                <th className="h-9 px-3 text-left text-xs font-normal text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  Company
                </th>
                <th className="h-9 px-3 text-left text-xs font-normal text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  Title
                </th>
                <th className="h-9 px-3 text-left text-xs font-normal text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  Lead Status
                </th>
                <th className="h-9 px-3 text-left text-xs font-normal text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  Project
                </th>
                <th className="h-9 px-3 text-left text-xs font-normal text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  Solutions
                </th>
                <th className="h-9 px-3 text-left text-xs font-normal text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  Report Owner
                </th>
                <th className="h-9 px-3 text-left text-xs font-normal text-gray-500 dark:text-gray-400 whitespace-nowrap w-[100px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => {
                const leadStatus = normalizeLeadStatus(report.leadData?.status);
                return (
                  <tr
                    key={report._id.toString()}
                    className="group border-b border-gray-100 dark:border-gray-800 last:border-b-0 hover:bg-[#f7f6f3] dark:hover:bg-gray-800/60 transition-colors"
                  >
                    <td className="h-9 px-3 text-[13px] text-gray-900 dark:text-gray-100 whitespace-nowrap">
                      {report.firstName || report.leadData?.name?.split(' ')[0] || '-'}
                    </td>
                    <td className="h-9 px-3 text-[13px] text-gray-900 dark:text-gray-100 whitespace-nowrap">
                      {report.lastName || report.leadData?.name?.split(' ').slice(1).join(' ') || '-'}
                    </td>
                    <td className="h-9 px-3 text-[13px] text-gray-900 dark:text-gray-100 whitespace-nowrap max-w-[180px] truncate">
                      {report.leadData?.companyName || report.companyName || '-'}
                    </td>
                    <td className="h-9 px-3 text-[13px] text-gray-600 dark:text-gray-400 whitespace-nowrap max-w-[140px] truncate">
                      {report.leadData?.position || '-'}
                    </td>
                    <td className="h-9 px-3">
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
                        <SelectTrigger className={`h-7 w-auto min-w-[130px] max-w-[170px] rounded px-2 border-0 shadow-none ring-0 focus:ring-1 focus:ring-gray-200 dark:focus:ring-gray-600 ${getStatusBadgeClass(leadStatus)}`}>
                          <div className="flex items-center gap-1.5">
                            <span
                              className="h-1.5 w-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: getStatusDotColor(leadStatus) }}
                            />
                            <span className="text-xs font-medium truncate">
                              {getLeadStatusLabel(leadStatus)}
                            </span>
                          </div>
                        </SelectTrigger>
                        <SelectContent className="w-56 rounded-md border border-gray-200 dark:border-gray-700 shadow-md bg-white dark:bg-gray-900 p-1">
                          {LEAD_STATUS_ORDER.map((status) => {
                            const statusConfig = statusMeta[status];
                            return (
                              <SelectItem
                                key={status}
                                value={status}
                                className={`select-item-no-indicator rounded px-2 py-1.5 cursor-pointer transition-colors border-0 ${statusConfig.accentClass}`}
                                style={{ position: 'relative' }}
                              >
                                <div className="flex items-center gap-2 w-full" style={{ position: 'relative', zIndex: 1 }}>
                                  <span
                                    className="h-1.5 w-1.5 rounded-full shrink-0"
                                    style={{ backgroundColor: LEAD_STATUS_UI[status].chartColor }}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                      {getLeadStatusLabel(status)}
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="h-9 px-3 text-[13px] text-gray-600 dark:text-gray-400 whitespace-nowrap max-w-[120px] truncate">
                      {report.leadData?.project || '-'}
                    </td>
                    <td className="h-9 px-3 min-w-[180px] max-w-[280px]">
                      {canAssignSolutions ? (
                        <div className="flex flex-wrap items-center gap-1 min-h-[24px] rounded px-1 py-0.5 -mx-1 hover:bg-gray-50 dark:hover:bg-gray-800/60">
                          {renderSolutionTags(report.leadData?.solutions || [], report)}
                          <input
                            type="text"
                            list={`pipeline-solution-suggestions-${report._id}`}
                            disabled={savingSolutionsId === report._id}
                            placeholder={
                              (report.leadData?.solutions?.length ?? 0) > 0
                                ? 'Add more...'
                                : 'Type solution...'
                            }
                            className="min-w-[72px] flex-1 bg-transparent text-[11px] text-gray-900 placeholder:text-gray-400 outline-none disabled:opacity-50 dark:text-gray-100"
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') {
                                event.preventDefault();
                                const value = event.currentTarget.value;
                                event.currentTarget.value = '';
                                void handleAddSolution(report, value);
                              }
                            }}
                            onBlur={(event) => {
                              const value = event.target.value;
                              if (!value.trim()) return;
                              event.target.value = '';
                              void handleAddSolution(report, value);
                            }}
                          />
                          <datalist id={`pipeline-solution-suggestions-${report._id}`}>
                            {getSolutionSuggestions(report).map((solution) => (
                              <option key={solution} value={solution} />
                            ))}
                          </datalist>
                          {savingSolutionsId === report._id && (
                            <Loader2 className="w-3 h-3 shrink-0 animate-spin text-gray-400" />
                          )}
                        </div>
                      ) : (report.leadData?.solutions?.length ?? 0) > 0 ? (
                        renderSolutionTags(report.leadData?.solutions || [])
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600">-</span>
                      )}
                    </td>
                    <td className="h-9 px-3 text-[13px] text-gray-900 dark:text-gray-100">
                      {editingOwnerId === report._id ? (
                        <div className="w-[280px] rounded-md border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900">
                          <div className="relative">
                            <User className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
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
                              className="h-7 border-gray-200 bg-white pl-7 text-xs dark:border-gray-700 dark:bg-gray-800"
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
                                  className="rounded px-1.5 py-0.5 text-[11px] font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                                >
                                  {owner}
                                </button>
                              ))}
                            </div>
                          )}

                          <div className="mt-1.5 flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-[11px] text-gray-500"
                              onClick={() => {
                                setEditingOwnerId(null);
                                setOwnerDraft('');
                              }}
                              disabled={isOwnerSaving}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-[11px] text-gray-900 dark:text-gray-100"
                              onClick={() => handleOwnerSave(report._id)}
                              disabled={isOwnerSaving || !ownerDraft.trim()}
                            >
                              {isOwnerSaving ? 'Saving...' : 'Save'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="truncate max-w-[120px]">{report.reportOwnerName || '-'}</span>
                          {canManageOwnerAndDelete && (
                            <button
                              onClick={() => handleOwnerEditStart(report)}
                              className="opacity-40 group-hover:opacity-100 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-opacity"
                              aria-label="Edit report owner"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="h-9 px-3">
                      <div className="flex items-center gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-gray-500 hover:text-gray-900 hover:bg-gray-200/60 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700"
                          onClick={() => window.open(getSharedReportUrl(window.location.origin, report._id), '_blank')}
                          title="Open public report"
                          aria-label="Open public report"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        {canManageOwnerAndDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-7 w-7 p-0 text-gray-500 hover:text-gray-900 hover:bg-gray-200/60 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700"
                          >
                            <Link
                              href={`/report/${report._id}?edit=true`}
                              title="Edit report"
                              aria-label="Edit report"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Link>
                          </Button>
                        )}
                        {canManageOwnerAndDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-950/30"
                            onClick={() => handleDeleteReport(report._id)}
                            disabled={deletingReportId === report._id}
                            title={deletingReportId === report._id ? 'Deleting...' : 'Delete Report'}
                            aria-label={deletingReportId === report._id ? 'Deleting report' : 'Delete report'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
    </div>
  );
} 