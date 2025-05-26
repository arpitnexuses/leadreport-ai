"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Search, Flame, Thermometer, Calendar, RotateCcw, CheckCircle, ChevronDown, Filter } from "lucide-react";
import { updateLeadStatus } from "@/app/actions";

interface Report {
  _id: string;
  email: string;
  createdAt: string;
  meetingDate?: string;
  meetingPlatform?: string;
  leadData?: {
    project?: string;
    status?: 'hot' | 'warm' | 'meeting_scheduled' | 'meeting_rescheduled' | 'meeting_done';
  };
}

interface PipelineTableProps {
  reports: Report[];
}

export function PipelineTable({ reports }: PipelineTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('all');

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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
    switch (status) {
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
      // Optionally add a toast notification here
      window.location.reload(); // Simple way to refresh the data
    } catch (error) {
      console.error('Failed to update status:', error);
      // Optionally add error toast here
    }
  };

  const formatStatusLabel = (status: string) => {
    switch (status) {
      case 'meeting_scheduled':
        return 'Meeting Scheduled';
      case 'meeting_rescheduled':
        return 'Meeting Rescheduled';
      case 'meeting_done':
        return 'Meeting Done';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Get unique projects for filter dropdown
  const uniqueProjects = Array.from(
    new Set(
      reports
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

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = selectedProject === 'all' || report.leadData?.project?.trim() === selectedProject;
    return matchesSearch && matchesProject;
  });

  // Calculate status counts based on filtered reports
  const statusCounts = filteredReports.reduce((acc, report) => {
    const status = report.leadData?.status || 'warm';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalLeads = filteredReports.length;

  const statusCards = [
    {
      status: 'hot',
      label: 'Hot Leads',
      count: statusCounts.hot || 0,
      icon: Flame,
      color: 'red',
      bgColor: 'bg-white dark:bg-gray-800',
      iconBgColor: 'bg-red-50 dark:bg-red-950/30',
      iconColor: 'text-red-600 dark:text-red-400',
      textColor: 'text-red-700 dark:text-red-300',
      borderColor: 'border-red-200 dark:border-red-700',
      countColor: 'text-gray-900 dark:text-white'
    },
    {
      status: 'warm',
      label: 'Warm Leads',
      count: statusCounts.warm || 0,
      icon: Thermometer,
      color: 'orange',
      bgColor: 'bg-white dark:bg-gray-800',
      iconBgColor: 'bg-orange-50 dark:bg-orange-950/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      textColor: 'text-orange-700 dark:text-orange-300',
      borderColor: 'border-orange-200 dark:border-orange-700',
      countColor: 'text-gray-900 dark:text-white'
    },
    {
      status: 'meeting_scheduled',
      label: 'Meetings Scheduled',
      count: statusCounts.meeting_scheduled || 0,
      icon: Calendar,
      color: 'blue',
      bgColor: 'bg-white dark:bg-gray-800',
      iconBgColor: 'bg-blue-50 dark:bg-blue-950/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      textColor: 'text-blue-700 dark:text-blue-300',
      borderColor: 'border-blue-200 dark:border-blue-700',
      countColor: 'text-gray-900 dark:text-white'
    },
    {
      status: 'meeting_rescheduled',
      label: 'Rescheduled',
      count: statusCounts.meeting_rescheduled || 0,
      icon: RotateCcw,
      color: 'yellow',
      bgColor: 'bg-white dark:bg-gray-800',
      iconBgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      textColor: 'text-yellow-700 dark:text-yellow-300',
      borderColor: 'border-yellow-200 dark:border-yellow-700',
      countColor: 'text-gray-900 dark:text-white'
    },
    {
      status: 'meeting_done',
      label: 'Completed',
      count: statusCounts.meeting_done || 0,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-white dark:bg-gray-800',
      iconBgColor: 'bg-green-50 dark:bg-green-950/30',
      iconColor: 'text-green-600 dark:text-green-400',
      textColor: 'text-green-700 dark:text-green-300',
      borderColor: 'border-green-200 dark:border-green-700',
      countColor: 'text-gray-900 dark:text-white'
    }
  ];

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
          
          {/* Project Filter */}
          <div className="relative sm:w-80">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="h-12 rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-900">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {selectedProject === 'all' ? 'All Projects' : selectedProject}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent className="w-80 max-h-60 rounded-xl border shadow-xl bg-white dark:bg-gray-900">
                <SelectItem 
                  value="all" 
                  className="rounded-lg p-3 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 focus:bg-gray-50 dark:focus:bg-gray-800"
                >
                  <div className="flex items-center gap-3">
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
                    className="rounded-lg p-3 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 focus:bg-gray-50 dark:focus:bg-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/30">
                        <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                          {project.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 dark:text-white truncate">{project}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {reports.filter(r => r.leadData?.project?.trim() === project).length} leads
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
        {(selectedProject !== 'all' || searchQuery) && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Active filters:</span>
            {selectedProject !== 'all' && (
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
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Meeting Date
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Platform
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Project
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Lead Status
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredReports.map((report) => {
                const leadStatus = report.leadData?.status || 'warm';
                return (
                  <tr key={report._id.toString()} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-4 px-6 text-sm text-gray-900 dark:text-white">
                      {formatDate(report.createdAt)}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900 dark:text-white">
                      {report.email}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900 dark:text-white">
                      {report.meetingDate ? formatDate(report.meetingDate) : '-'}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900 dark:text-white">
                      {report.meetingPlatform || '-'}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900 dark:text-white">
                      {report.leadData?.project || '-'}
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
                              {formatStatusLabel(leadStatus)}
                            </span>
                          </div>
                        </SelectTrigger>
                        <SelectContent className="w-64 rounded-lg border shadow-xl bg-white dark:bg-gray-900 p-2">
                          <SelectItem 
                            value="hot" 
                            className="select-item-no-indicator rounded-md p-3 cursor-pointer transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-950/50 focus:bg-red-50 dark:focus:bg-red-950/50 border-0 data-[state=checked]:bg-red-100 dark:data-[state=checked]:bg-red-950/70"
                            style={{ position: 'relative' }}
                          >
                            <div className="flex items-center gap-3 w-full" style={{ position: 'relative', zIndex: 1 }}>
                              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-red-500/10 dark:bg-red-500/20 flex-shrink-0">
                                <Flame className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-gray-900 dark:text-white whitespace-nowrap">Hot Lead</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">High priority</div>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem 
                            value="warm" 
                            className="select-item-no-indicator rounded-md p-3 cursor-pointer transition-all duration-200 hover:bg-orange-50 dark:hover:bg-orange-950/50 focus:bg-orange-50 dark:focus:bg-orange-950/50 border-0 data-[state=checked]:bg-orange-100 dark:data-[state=checked]:bg-orange-950/70"
                            style={{ position: 'relative' }}
                          >
                            <div className="flex items-center gap-3 w-full" style={{ position: 'relative', zIndex: 1 }}>
                              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-orange-500/10 dark:bg-orange-500/20 flex-shrink-0">
                                <Thermometer className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-gray-900 dark:text-white whitespace-nowrap">Warm Lead</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Interested</div>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem 
                            value="meeting_scheduled" 
                            className="select-item-no-indicator rounded-md p-3 cursor-pointer transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 focus:bg-blue-50 dark:focus:bg-blue-950/50 border-0 data-[state=checked]:bg-blue-100 dark:data-[state=checked]:bg-blue-950/70"
                            style={{ position: 'relative' }}
                          >
                            <div className="flex items-center gap-3 w-full" style={{ position: 'relative', zIndex: 1 }}>
                              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-500/10 dark:bg-blue-500/20 flex-shrink-0">
                                <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-gray-900 dark:text-white whitespace-nowrap">Meeting Scheduled</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Confirmed</div>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem 
                            value="meeting_rescheduled" 
                            className="select-item-no-indicator rounded-md p-3 cursor-pointer transition-all duration-200 hover:bg-yellow-50 dark:hover:bg-yellow-950/50 focus:bg-yellow-50 dark:focus:bg-yellow-950/50 border-0 data-[state=checked]:bg-yellow-100 dark:data-[state=checked]:bg-yellow-950/70"
                            style={{ position: 'relative' }}
                          >
                            <div className="flex items-center gap-3 w-full" style={{ position: 'relative', zIndex: 1 }}>
                              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-yellow-500/10 dark:bg-yellow-500/20 flex-shrink-0">
                                <RotateCcw className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-gray-900 dark:text-white whitespace-nowrap">Rescheduled</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">New time</div>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem 
                            value="meeting_done" 
                            className="select-item-no-indicator rounded-md p-3 cursor-pointer transition-all duration-200 hover:bg-green-50 dark:hover:bg-green-950/50 focus:bg-green-50 dark:focus:bg-green-950/50 border-0 data-[state=checked]:bg-green-100 dark:data-[state=checked]:bg-green-950/70"
                            style={{ position: 'relative' }}
                          >
                            <div className="flex items-center gap-3 w-full" style={{ position: 'relative', zIndex: 1 }}>
                              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-green-500/10 dark:bg-green-500/20 flex-shrink-0">
                                <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-gray-900 dark:text-white whitespace-nowrap">Completed</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Finished</div>
                              </div>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900 dark:text-white">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        onClick={() => window.open(`/report/${report._id}`, '_blank')}
                      >
                        View Report
                      </Button>
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