import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, TrendingUp, Users, ArrowUp } from 'lucide-react';
import ProjectDistributionPieChart from './ProjectDistributionPieChart';

interface ProjectLeadCount {
  project: string;
  count: number;
}

interface ProjectLeadScoreProps {
  projectLeads: ProjectLeadCount[];
}

export function ProjectLeadScore({ projectLeads }: ProjectLeadScoreProps) {
  const maxCount = Math.max(...projectLeads.map(p => p.count));
  const totalLeads = projectLeads.reduce((sum, p) => sum + p.count, 0);

  return (
    <div className="flex flex-col gap-6">
      <ProjectDistributionPieChart projectLeads={projectLeads} />
      <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg rounded-xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <Star className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl">Project Lead Distribution</CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {totalLeads} total leads this month
                </p>
              </div>
            </div>
            <div className="flex items-center text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2.5 py-1 rounded-lg">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+{Math.round((totalLeads / maxCount) * 100)}%</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mt-4">
            <div className="overflow-hidden">
              {projectLeads.map((item, index) => {
                const percentage = Math.round((item.count / totalLeads) * 100);
                const isHighest = item.count === maxCount;
                
                return (
                  <div 
                    key={index} 
                    className={`group relative flex items-center gap-4 p-4 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl ${
                      index !== projectLeads.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
                    }`}
                  >
                    <div className={`flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center ${
                      isHighest ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <span className="text-lg font-semibold">{index + 1}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate">
                          {item.project}
                        </h4>
                        {isHighest && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Top Project
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {item.count} leads ({percentage}%)
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${
                          isHighest ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                        }`}>
                          {item.count}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400 flex items-center justify-end">
                          <ArrowUp className="h-3 w-3 mr-0.5" />
                          {Math.round((item.count / maxCount) * 100)}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {projectLeads.length === 0 && (
                <div className="text-center py-8">
                  <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-gray-900 dark:text-white font-medium mb-1">No Project Leads</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No project leads are available for this month
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}