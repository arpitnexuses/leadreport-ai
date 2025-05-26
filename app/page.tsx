"use client";

import { initiateReport, getReports } from "@/app/actions";
import { useState, useTransition, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { LoadingOverlay } from "@/components/dashboard/LoadingOverlay";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { LeadGenerationForm } from "@/components/dashboard/LeadGenerationForm";
import { PipelineTable } from "@/components/dashboard/PipelineTable";
import { SettingsView } from "@/components/dashboard/SettingsView";
import { Report, TabType } from "@/types/dashboard";

export default function Home() {
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const data = await getReports();
        setReports(data);
      } catch (error) {
        console.error('Failed to load reports:', error);
      }
    };

    loadReports();
  }, []);

  async function handleGenerateReport(formData: FormData) {
    setIsLoading(true);
    startTransition(async () => {
      try {
        const meetingDate = formData.get('meetingDate');
        const meetingTime = formData.get('meetingTime');
        const meetingPlatform = formData.get('meetingPlatform');
        const problemPitch = formData.get('problemPitch');
        const project = formData.get('project');

        formData.append('meetingDate', meetingDate as string);
        formData.append('meetingTime', meetingTime as string);
        formData.append('meetingPlatform', meetingPlatform as string);
        formData.append('problemPitch', problemPitch as string);
        formData.append('project', project as string);

        const result = await initiateReport(formData);
        if (result.success) {
          window.open(`/report/${result.reportId}`, '_blank');
          setIsLoading(false);
          // Refresh reports after generating a new one
          const updatedReports = await getReports();
          setReports(updatedReports);
        }
      } catch (error) {
        console.error("Failed to generate report:", error);
        setIsLoading(false);
      }
    });
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView reports={reports} />;
      case 'generate':
        return (
          <LeadGenerationForm
            onSubmit={handleGenerateReport}
            isLoading={isLoading}
            isPending={isPending}
          />
        );
      case 'pipeline':
        return <PipelineTable reports={reports} />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView reports={reports} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <LoadingOverlay isVisible={isLoading || isPending} />

      <div className="flex h-screen">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {renderActiveTab()}
          </div>
        </div>
      </div>
    </div>
  );
}
