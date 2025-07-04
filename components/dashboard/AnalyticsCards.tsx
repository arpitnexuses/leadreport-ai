"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, Briefcase, CheckCircle, Star, TrendingUp } from "lucide-react";

interface Report {
  _id: string;
  email: string;
  createdAt: string;
  isCompleted: boolean;
  leadData?: {
    project?: string;
    status?: 'hot' | 'warm' | 'meeting_scheduled' | 'meeting_rescheduled' | 'meeting_done';
  };
}

interface AnalyticsCardsProps {
  reports: Report[];
}

export function AnalyticsCards({ reports }: AnalyticsCardsProps) {
  const totalProjectLeads = reports.filter(r => {
    const project = r.leadData?.project?.trim().toLowerCase();
    return project && 
           project !== '' && 
           project !== 'n/a' && 
           project !== 'na' && 
           project !== 'not applicable' &&
           project !== '-';
  }).length;

  const activeProjects = new Set(
    reports
      .filter(r => !r.isCompleted)
      .map(r => r.leadData?.project?.trim().toLowerCase())
      .filter(project => 
        project && 
        project !== '' && 
        project !== 'n/a' && 
        project !== 'na' && 
        project !== 'not applicable' &&
        project !== '-'
      )
  ).size;

  const completedReports = reports.filter(r => r.leadData?.status === 'meeting_done').length;

  const analyticsData = [
    {
      title: "Total Project Leads",
      value: totalProjectLeads,
      icon: Users,
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      change: "12% increase",
      changeColor: "text-green-500",
      note: "*Only counting leads with valid project names"
    },
    {
      title: "Active Projects",
      value: activeProjects,
      icon: Briefcase,
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
      change: "8% increase",
      changeColor: "text-green-500",
      note: "*Only counting unique active projects with valid project names"
    },
    {
      title: "Completed Reports",
      value: completedReports,
      icon: CheckCircle,
      bgColor: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
      change: "15% increase",
      changeColor: "text-green-500",
      note: "*Only counting leads with 'meeting_done' status"
    },
    {
      title: "Success Rate",
      value: "85%",
      icon: Star,
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      change: "5% increase",
      changeColor: "text-green-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {analyticsData.map((item, index) => (
        <Card key={index} className="bg-white dark:bg-gray-800 border-2 border-blue-500 shadow-lg rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{item.title}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {item.value}
                </h3>
              </div>
              <div className={`h-12 w-12 ${item.bgColor} rounded-full flex items-center justify-center`}>
                <item.icon className={`h-6 w-6 ${item.iconColor}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className={`${item.changeColor} font-medium`}>{item.change}</span>
              <span className="text-gray-600 dark:text-gray-400 ml-2">from last month</span>
            </div>
            {item.note && (
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {item.note}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 