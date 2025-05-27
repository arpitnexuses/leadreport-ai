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
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [reports, setReports] = useState<Report[]>([]);
  const [generationStatus, setGenerationStatus] = useState("");
  const [reportId, setReportId] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pollStartTime, setPollStartTime] = useState<number>(0);

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

  const handleError = (message: string) => {
    setHasError(true);
    setErrorMessage(message);
    setIsLoading(false);
  };

  const handleRetry = () => {
    setHasError(false);
    setErrorMessage("");
    setGenerationStatus("");
    setReportId(null);
  };

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setHasError(false);
    setGenerationStatus("Initializing report generation...");
    
    startTransition(async () => {
      try {
        const result = await initiateReport(formData);
        
        if (!result || !result.reportId) {
          throw new Error("Failed to create report - no report ID returned");
        }
        
        setReportId(result.reportId);
        
        // Start status polling
        setGenerationStatus("Fetching lead data from Apollo...");
        setPollStartTime(Date.now());
        pollReportStatus(result.reportId);
      } catch (error) {
        console.error("Error submitting form:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        handleError(`Failed to generate report: ${errorMessage}`);
      }
    });
  };

  const pollReportStatus = async (id: string) => {
    try {
      console.log(`Polling status for report ID: ${id}`);
      const statusUrl = `/api/reports/${id}/status`;
      console.log(`Fetching from: ${statusUrl}`);
      
      const response = await fetch(statusUrl);
      console.log(`Status response received: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        let errorMessage = `Status check failed (${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = errorData?.error || errorMessage;
          console.error("Error response data:", errorData);
        } catch (parseError) {
          console.error("Could not parse error response:", parseError);
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log(`Report status data:`, data);
      
      if (data.status === "completed") {
        // Report is done, redirect to it
        console.log(`Report completed, redirecting to /report/${id}`);
        router.push(`/report/${id}`);
      } else if (data.status === "failed") {
        // Report failed
        console.error(`Report generation failed:`, data.error);
        handleError(data.error || "Unknown error during report generation");
      } else {
        // Report is still processing
        if (data.status === "fetching_apollo") {
          setGenerationStatus("Processing lead data...");
        } else if (data.status === "generating_ai") {
          setGenerationStatus("Creating AI insights...");
        } else {
          setGenerationStatus(`Current status: ${data.status || "processing"}...`);
        }
        
        // Continue polling
        console.log(`Scheduling next poll in 1 second for report ID: ${id}`);
        setTimeout(() => pollReportStatus(id), 1000);
      }
    } catch (error) {
      console.error("Error polling status:", error);
      // Try again after a delay unless we've been polling for too long
      const currentTime = Date.now();
      
      if (currentTime - pollStartTime > 60000) { // 1 minute timeout
        handleError(`Report generation timed out: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`);
      } else {
        console.log(`Retrying poll in 2 seconds for report ID: ${id} after error. Polling for ${(currentTime - pollStartTime) / 1000} seconds so far.`);
        setTimeout(() => pollReportStatus(id), 2000); // Retry with longer delay on error
      }
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView reports={reports} />;
      case 'generate':
        return (
          <LeadGenerationForm
            onSubmit={handleSubmit}
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
      <LoadingOverlay isVisible={isLoading || isPending} statusMessage={generationStatus} hasError={hasError} errorMessage={errorMessage} onRetry={handleRetry} />

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
