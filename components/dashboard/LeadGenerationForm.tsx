"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mail, Briefcase, Sparkles, CheckCircle2, Globe } from "lucide-react";
import { MeetingDetailsForm } from '@/components/ui/input';
import { useState, useEffect, useRef } from "react";

interface LeadGenerationFormProps {
  onSubmit: (formData: FormData) => void;
  isLoading: boolean;
  isPending: boolean;
  projects?: string[];
  reportOwners?: string[];
}

export function LeadGenerationForm({ onSubmit, isLoading, isPending, projects = [], reportOwners = [] }: LeadGenerationFormProps) {
  const [localProjects, setLocalProjects] = useState<string[]>(projects);
  const [localReportOwners, setLocalReportOwners] = useState<string[]>(reportOwners);
  const [currentStep, setCurrentStep] = useState(1);
  const [reportOwnerMode, setReportOwnerMode] = useState<"existing" | "new">("existing");
  const [existingReportOwner, setExistingReportOwner] = useState("");
  const [newReportOwnerName, setNewReportOwnerName] = useState("");
  const [projectMode, setProjectMode] = useState<"existing" | "new">("existing");
  const [existingProject, setExistingProject] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);
  const submitIntentRef = useRef(false);
  const totalSteps = 3;

  const stepLabels = [
    "Report Owner",
    "Lead Information",
    "Meeting & Notes",
  ];

  // Update local state when props change
  useEffect(() => {
    if (projects.length > 0) {
      console.log('LeadGenerationForm: Updating projects from props:', projects.length);
      setLocalProjects(projects);
    }
  }, [projects]);

  useEffect(() => {
    if (reportOwners.length > 0) {
      console.log('LeadGenerationForm: Updating report owners from props:', reportOwners.length);
      setLocalReportOwners(reportOwners);
    }
  }, [reportOwners]);

  // Fallback: Fetch from API if props are empty (for backwards compatibility)
  useEffect(() => {
    if (projects.length === 0 && reportOwners.length === 0) {
      console.log('LeadGenerationForm: Props empty, fetching form options from /api/form-options');
      fetch('/api/form-options', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(res => {
          console.log('LeadGenerationForm: Response status:', res.status);
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          console.log('LeadGenerationForm: Received data:', data);
          console.log('LeadGenerationForm: Projects count:', data.projects?.length || 0);
          console.log('LeadGenerationForm: Report owners count:', data.reportOwners?.length || 0);
          setLocalProjects(data.projects || []);
          setLocalReportOwners(data.reportOwners || []);
        })
        .catch(error => {
          console.error('LeadGenerationForm: Error fetching form options:', error);
          console.error('LeadGenerationForm: Error details:', error.message);
        });
    }
  }, [projects.length, reportOwners.length]);

  useEffect(() => {
    if (localProjects.length === 0 && projectMode === "existing") {
      setProjectMode("new");
    }
  }, [localProjects.length, projectMode]);

  useEffect(() => {
    if (localReportOwners.length === 0 && reportOwnerMode === "existing") {
      setReportOwnerMode("new");
    }
  }, [localReportOwners.length, reportOwnerMode]);

  const validateCurrentStep = () => {
    const currentStepRef = stepRefs.current[currentStep - 1];
    if (!currentStepRef) {
      return true;
    }

    const requiredElements = currentStepRef.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("[required]");
    for (const element of requiredElements) {
      if (!element.checkValidity()) {
        element.reportValidity();
        return false;
      }
    }

    return true;
  };

  const handleNextStep = (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    event?.stopPropagation();

    if (!validateCurrentStep()) {
      return;
    }

    setCurrentStep((previousStep) => Math.min(previousStep + 1, totalSteps));
  };

  const handlePreviousStep = (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    event?.stopPropagation();
    setCurrentStep((previousStep) => Math.max(previousStep - 1, 1));
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (currentStep < totalSteps || !submitIntentRef.current) {
      event.preventDefault();
      submitIntentRef.current = false;

      if (currentStep < totalSteps) {
        handleNextStep();
      }
      return;
    }

    submitIntentRef.current = false;
  };

  const projectValue = projectMode === "existing"
    ? existingProject
    : newProjectName.trim();
  const reportOwnerValue = reportOwnerMode === "existing"
    ? existingReportOwner
    : newReportOwnerName.trim();

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Generate Lead Report</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl">
          Create comprehensive lead reports with AI-powered insights and professional analysis
        </p>
      </div>

      {/* Lead Generation Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-xl rounded-2xl">
            <CardContent className="p-8">
              <form action={onSubmit} onSubmit={handleFormSubmit} className="space-y-8">
                <div className="space-y-6">
                  <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Step {currentStep} of {totalSteps}: {stepLabels[currentStep - 1]}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <span className="text-red-500">*</span> Required fields
                      </p>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-gray-100 dark:bg-gray-700">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div
                    ref={(el) => {
                      stepRefs.current[0] = el;
                    }}
                    className={currentStep === 1 ? "space-y-5" : "hidden"}
                  >
                    <div className="space-y-3 rounded-xl border border-blue-100 bg-blue-50/60 p-5">
                      <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wide">Report Owner (Internal)</h3>
                    <p className="text-sm text-blue-700">
                        Keep this as your information only. Lead details are in the next step.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Report Owner Name <span className="text-red-500">*</span>
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Choose one path: select an existing report owner or create a new one.
                      </p>
                      <div className="space-y-3 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                        <label className="flex items-center gap-3 text-sm font-medium text-gray-800 dark:text-gray-200">
                          <input
                            type="radio"
                            name="reportOwnerMode"
                            value="existing"
                            checked={reportOwnerMode === "existing"}
                            onChange={() => setReportOwnerMode("existing")}
                            disabled={isLoading || isPending || localReportOwners.length === 0}
                            className="h-4 w-4 text-blue-600"
                          />
                          Select Existing Report Owner
                        </label>

                        <div className={reportOwnerMode === "existing" ? "space-y-2" : "hidden"}>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            </div>
                            <select
                              name="existingReportOwner"
                              value={existingReportOwner}
                              onChange={(event) => setExistingReportOwner(event.target.value)}
                              required={reportOwnerMode === "existing"}
                              disabled={isLoading || isPending || reportOwnerMode !== "existing"}
                              className="pl-12 h-14 w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-900"
                            >
                              <option value="">Select a report owner</option>
                              {localReportOwners.map((owner) => (
                                <option key={owner} value={owner}>
                                  {owner}
                                </option>
                              ))}
                            </select>
                          </div>
                          {localReportOwners.length === 0 && (
                            <p className="text-xs text-amber-700 dark:text-amber-400">
                              No existing report owners found. Switch to create a new one.
                            </p>
                          )}
                        </div>

                        <label className="flex items-center gap-3 text-sm font-medium text-gray-800 dark:text-gray-200 pt-2">
                          <input
                            type="radio"
                            name="reportOwnerMode"
                            value="new"
                            checked={reportOwnerMode === "new"}
                            onChange={() => setReportOwnerMode("new")}
                            disabled={isLoading || isPending}
                            className="h-4 w-4 text-blue-600"
                          />
                          Create New Report Owner
                        </label>

                        <div className={reportOwnerMode === "new" ? "space-y-2" : "hidden"}>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            </div>
                            <Input
                              type="text"
                              name="newReportOwnerName"
                              value={newReportOwnerName}
                              onChange={(event) => setNewReportOwnerName(event.target.value)}
                              placeholder="Enter a new report owner name"
                              required={reportOwnerMode === "new"}
                              disabled={isLoading || isPending || reportOwnerMode !== "new"}
                              className="pl-12 h-14 text-sm rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-900 shadow-sm placeholder:text-gray-500 dark:placeholder:text-gray-400"
                            />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            This name will be added as a new report owner.
                          </p>
                        </div>
                      </div>
                      <input type="hidden" name="reportOwnerName" value={reportOwnerValue} />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Project <span className="text-red-500">*</span>
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Choose one path: select an existing project or create a new one.
                      </p>
                      <div className="space-y-3 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                        <label className="flex items-center gap-3 text-sm font-medium text-gray-800 dark:text-gray-200">
                          <input
                            type="radio"
                            name="projectMode"
                            value="existing"
                            checked={projectMode === "existing"}
                            onChange={() => setProjectMode("existing")}
                            disabled={isLoading || isPending || localProjects.length === 0}
                            className="h-4 w-4 text-blue-600"
                          />
                          Select Existing Project
                        </label>

                        <div className={projectMode === "existing" ? "space-y-2" : "hidden"}>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Briefcase className="h-5 w-5 text-gray-400" />
                            </div>
                            <select
                              name="existingProject"
                              value={existingProject}
                              onChange={(event) => setExistingProject(event.target.value)}
                              required={projectMode === "existing"}
                              disabled={isLoading || isPending || projectMode !== "existing"}
                              className="pl-12 h-14 w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-900"
                            >
                              <option value="">Select a project</option>
                              {localProjects.map((project) => (
                                <option key={project} value={project}>
                                  {project}
                                </option>
                              ))}
                            </select>
                          </div>
                          {localProjects.length === 0 && (
                            <p className="text-xs text-amber-700 dark:text-amber-400">
                              No existing projects found. Switch to create a new project.
                            </p>
                          )}
                        </div>

                        <label className="flex items-center gap-3 text-sm font-medium text-gray-800 dark:text-gray-200 pt-2">
                          <input
                            type="radio"
                            name="projectMode"
                            value="new"
                            checked={projectMode === "new"}
                            onChange={() => setProjectMode("new")}
                      disabled={isLoading || isPending}
                            className="h-4 w-4 text-blue-600"
                          />
                          Create New Project
                        </label>

                        <div className={projectMode === "new" ? "space-y-2" : "hidden"}>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Briefcase className="h-5 w-5 text-gray-400" />
                            </div>
                            <Input
                              type="text"
                              name="newProjectName"
                              value={newProjectName}
                              onChange={(event) => setNewProjectName(event.target.value)}
                              placeholder="Enter a new project name"
                              required={projectMode === "new"}
                              disabled={isLoading || isPending || projectMode !== "new"}
                              className="pl-12 h-14 text-sm rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-900 shadow-sm placeholder:text-gray-500 dark:placeholder:text-gray-400"
                            />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            A new project will be created automatically with this name.
                          </p>
                        </div>
                      </div>
                      <input type="hidden" name="project" value={projectValue} />
                    </div>
                  </div>

                  <div
                    ref={(el) => {
                      stepRefs.current[1] = el;
                    }}
                    className={currentStep === 2 ? "space-y-5" : "hidden"}
                  >
                    <div className="space-y-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-5">
                      <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-wide">Lead Information</h3>
                      <p className="text-sm text-emerald-700">
                        Enter lead contact details and business context for the report.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Business Email <span className="text-red-500">*</span>
                      </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      type="email"
                      name="email"
                      placeholder="Enter business email address"
                      required
                      disabled={isLoading || isPending}
                      className="pl-12 h-14 text-sm rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-900 shadow-sm placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    />
                  </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Company Website
                      </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Globe className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      type="text"
                      name="companyWebsite"
                      placeholder="Company website/domain (optional, e.g. acme.com)"
                      disabled={isLoading || isPending}
                      className="pl-12 h-14 text-sm rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-900 shadow-sm placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    />
                  </div>
                    </div>

                    <MeetingDetailsForm
                      disabled={isLoading || isPending}
                      visibleSections={["lead-information", "lead-company-context"]}
                    />
                  </div>

                  <div
                    ref={(el) => {
                      stepRefs.current[2] = el;
                    }}
                    className={currentStep === 3 ? "space-y-5" : "hidden"}
                  >
                    <div className="space-y-3 rounded-xl border border-violet-100 bg-violet-50/60 p-5">
                      <h3 className="text-sm font-bold text-violet-900 uppercase tracking-wide">Meeting & Notes</h3>
                      <p className="text-sm text-violet-700">
                        Add upcoming meeting details and optional internal notes.
                      </p>
                    </div>

                    <MeetingDetailsForm
                    disabled={isLoading || isPending}
                      visibleSections={["meeting-details", "internal-notes"]}
                  />
                  </div>
                </div>
                <div className="pt-4">
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                    <Button
                      type="button"
                        onClick={(event) => handlePreviousStep(event)}
                      disabled={isLoading || isPending || currentStep === 1}
                      variant="outline"
                      className="h-12 px-6 rounded-xl"
                    >
                      Back
                    </Button>

                    {currentStep < totalSteps ? (
                      <Button
                        type="button"
                        onClick={(event) => handleNextStep(event)}
                        disabled={isLoading || isPending}
                        className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Continue
                      </Button>
                    ) : (
                  <Button
                    type="submit"
                    onClick={() => {
                      submitIntentRef.current = true;
                    }}
                    disabled={isLoading || isPending}
                        className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isLoading || isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Generating Report...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                            <span>Start Generating</span>
                      </div>
                    )}
                  </Button>
                    )}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-0 shadow-xl rounded-2xl overflow-hidden h-full">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100">What you&apos;ll get</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-blue-600/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">Comprehensive Profile</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Detailed lead profile with professional background and company analysis</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-blue-600/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">AI-Powered Insights</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Smart recommendations and engagement strategies</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-blue-600/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">Professional Analysis</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">In-depth company research and market positioning</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 