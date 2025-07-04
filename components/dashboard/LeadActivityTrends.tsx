import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { TrendingUp, Calendar, Activity } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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

interface LeadActivityTrendsProps {
  reports: Report[];
}

export function LeadActivityTrends({ reports }: LeadActivityTrendsProps) {
  // Helper function to check if project name is valid
  const hasValidProject = (report: Report) => {
    const project = report.leadData?.project?.trim();
    return project && 
           project !== 'N/A' && 
           project !== 'NA' && 
           project !== 'not applicable' && 
           project !== '-' && 
           project.toLowerCase() !== 'n/a' &&
           project.toLowerCase() !== 'na' &&
           project.toLowerCase() !== 'not applicable';
  };

  // Get last 7 days of data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const dailyLeads = last7Days.map(date => {
    const dayReports = reports.filter(report => {
      const reportDate = new Date(report.createdAt);
      return reportDate.toDateString() === date.toDateString() && hasValidProject(report);
    });
    return dayReports.length;
  });

  const dailyCompleted = last7Days.map(date => {
    const dayReports = reports.filter(report => {
      const reportDate = new Date(report.createdAt);
      return reportDate.toDateString() === date.toDateString() && 
             hasValidProject(report) && 
             report.leadData?.status === 'meeting_done';
    });
    return dayReports.length;
  });

  const labels = last7Days.map(date => 
    date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  );

  const data = {
    labels,
    datasets: [
      {
        label: 'Total Leads',
        data: dailyLeads,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Completed',
        data: dailyCompleted,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
      },
      y: {
        display: true,
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  const totalThisWeek = dailyLeads.reduce((sum, count) => sum + count, 0);
  const completedThisWeek = dailyCompleted.reduce((sum, count) => sum + count, 0);
  const completionRate = totalThisWeek > 0 ? Math.round((completedThisWeek / totalThisWeek) * 100) : 0;

  return (
    <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg rounded-xl h-full">
      <CardHeader className="pb-2 bg-[#1E3FAC] text-white rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-white">Lead Activity Trends</CardTitle>
              <p className="text-sm text-blue-100 mt-1">
                Last 7 days activity overview
              </p>
            </div>
          </div>
          <div className="flex items-center text-sm text-white bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-lg">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>{completionRate}% completion</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-[30px]">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalThisWeek}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Leads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{completedThisWeek}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{completionRate}%</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Success Rate</div>
            </div>
          </div>
          
          <div className="h-[280px]">
            {reports.length > 0 ? (
              <Line data={data} options={options} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No activity data available</p>
                  <p className="text-sm">Start generating leads to see trends</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 