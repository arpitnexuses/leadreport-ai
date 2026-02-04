"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2 } from "lucide-react";
import { AnalyticsCards } from "./AnalyticsCards";
import { RecentLeadsTable } from "./RecentLeadsTable";
import { LeadActivityTrends } from "./LeadActivityTrends";
import { ProjectLeadTable } from "./ProjectLeadTable";
import ProjectDistributionPieChart from "./ProjectDistributionPieChart";

interface Report {
  _id: string;
  email: string;
  reportOwnerName?: string;
  createdAt: string;
  isCompleted: boolean;
  companyName?: string;
  leadData?: {
    name?: string;
    companyName?: string;
    project?: string;
  };
}

interface DashboardViewProps {
  reports: Report[];
}

export function DashboardView({ reports }: DashboardViewProps) {
  // Memoize expensive computation - only recalculate when reports change
  const projectLeads = useMemo(() => {
    return Object.entries(
      reports.reduce((acc, report) => {
        const project = report.leadData?.project?.trim();
        
        // Improved filtering logic - include "Unassigned" projects
        if (project && 
            project !== 'N/A' && 
            project !== 'NA' && 
            project !== 'not applicable' && 
            project !== '-' && 
            project !== '' &&
            project.toLowerCase() !== 'n/a' &&
            project.toLowerCase() !== 'na' &&
            project.toLowerCase() !== 'not applicable') {
          acc[project] = (acc[project] || 0) + 1;
        }
        return acc;
      }, {} as { [key: string]: number })
    )
      .map(([project, count]): { project: string; count: number } => ({ 
        project, 
        count: count as number 
      }))
      .sort((a, b) => b.count - a.count);
  }, [reports]);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 mt-[-25px]">Dashboard</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl">
          Overview of your lead reports and analytics
        </p>
      </div>

      {/* Analytics Cards - 4 cards */}
      <div className="mb-8">
        <AnalyticsCards reports={reports} />
      </div>

      {/* Project Distribution and Lead Activity Trends - 2 cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="h-full">
          <ProjectDistributionPieChart projectLeads={projectLeads} />
        </div>
        <div className="h-full">
          <LeadActivityTrends reports={reports} />
        </div>
      </div>

      {/* Project Lead Table and Recent Leads - 2 cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-full">
          <ProjectLeadTable projectLeads={projectLeads} />
        </div>
        <div className="h-full">
          <RecentLeadsTable reports={reports} />
        </div>
      </div>
    </div>
  );
} 