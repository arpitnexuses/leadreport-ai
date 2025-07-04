"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Flame, Thermometer, Calendar, RotateCcw, CheckCircle } from "lucide-react";

interface Report {
  _id: string;
  email: string;
  createdAt: string;
  isCompleted: boolean;
  companyName?: string;
  leadData?: {
    name?: string;
    companyName?: string;
    project?: string;
    status?: 'hot' | 'warm' | 'meeting_scheduled' | 'meeting_rescheduled' | 'meeting_done';
  };
}

interface RecentLeadsTableProps {
  reports: Report[];
}

export function RecentLeadsTable({ reports }: RecentLeadsTableProps) {
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
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700';
      case 'warm':
        return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-700';
      case 'meeting_scheduled':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700';
      case 'meeting_rescheduled':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700';
      case 'meeting_done':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'hot':
        return <Flame className="w-3 h-3" />;
      case 'warm':
        return <Thermometer className="w-3 h-3" />;
      case 'meeting_scheduled':
        return <Calendar className="w-3 h-3" />;
      case 'meeting_rescheduled':
        return <RotateCcw className="w-3 h-3" />;
      case 'meeting_done':
        return <CheckCircle className="w-3 h-3" />;
      default:
        return <Thermometer className="w-3 h-3" />;
    }
  };

  const formatStatusLabel = (status: string) => {
    switch (status) {
      case 'hot':
        return 'Hot Lead';
      case 'warm':
        return 'Warm Lead';
      case 'meeting_scheduled':
        return 'Meeting Scheduled';
      case 'meeting_rescheduled':
        return 'Rescheduled';
      case 'meeting_done':
        return 'Completed';
      default:
        return 'Warm Lead';
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg rounded-xl h-full">
      <CardHeader className="pb-2 bg-[#1E3FAC] text-white rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-white">Recent Leads</CardTitle>
              <p className="text-sm text-blue-100 mt-1">
                Latest lead activities
              </p>
            </div>
          </div>
          <div className="flex items-center text-sm text-white bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-lg">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>Active</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-4">
          <div className="h-[400px] overflow-y-auto">
            <div className="space-y-3">
              {reports.map((report) => {
                const leadStatus = report.leadData?.status || 'warm';
                return (
                  <div key={report._id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {report.leadData?.name || report.email?.split('@')[0]}
                          </p>
                          <span className="text-sm text-gray-500">•</span>
                          <p className="text-sm text-gray-500">{formatDate(report.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-3 text-sm mt-0.5">
                          <span className="text-gray-600 dark:text-gray-400 truncate">
                            {report.leadData?.companyName || report.companyName || 'Unknown Company'}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span className="text-blue-600 dark:text-blue-400 truncate">
                            {report.leadData?.project || 'No Project'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs font-medium border ${getStatusColor(leadStatus)} flex items-center gap-1.5 px-2.5 py-1`}
                    >
                      {getStatusIcon(leadStatus)}
                      {formatStatusLabel(leadStatus)}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 