import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale);

interface ProjectLeadCount {
  project: string;
  count: number;
}

interface ProjectDistributionPieChartProps {
  projectLeads: ProjectLeadCount[];
}

const ProjectDistributionPieChart: React.FC<ProjectDistributionPieChartProps> = ({ projectLeads }) => {
  const totalLeads = projectLeads.reduce((sum, p) => sum + p.count, 0);

  const data = {
    labels: projectLeads.map(p => p.project),
    datasets: [
      {
        data: projectLeads.map(p => p.count),
        backgroundColor: [
          '#3B82F6', // blue-500
          '#10B981', // emerald-500
          '#F59E0B', // amber-500
          '#EF4444', // red-500
          '#8B5CF6', // violet-500
          '#EC4899', // pink-500
          '#14B8A6', // teal-500
          '#F97316', // orange-500
        ],
        borderWidth: 0,
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '50%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.raw;
            const percentage = Math.round((value / totalLeads) * 100);
            return `${context.label}: ${value} leads (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg rounded-xl h-400px">
      <CardHeader className="pb-2 bg-[#1E3FAC] text-white rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div>
            <CardTitle className="text-xl text-white">Project Distribution</CardTitle>
            <p className="text-sm text-blue-100 mt-1">
              Visual breakdown of leads by project
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-[30px]">
          <div className="h-[350px]">
            {projectLeads.length > 0 ? (
              <Doughnut data={data} options={options} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                No data available
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectDistributionPieChart; 