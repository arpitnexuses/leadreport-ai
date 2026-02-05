"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import { Mail, Briefcase, Sparkles, CheckCircle2 } from "lucide-react";
import { MeetingDetailsForm } from '@/components/ui/input';
import { useState, useEffect } from "react";

interface LeadGenerationFormProps {
  onSubmit: (formData: FormData) => void;
  isLoading: boolean;
  isPending: boolean;
}

export function LeadGenerationForm({ onSubmit, isLoading, isPending }: LeadGenerationFormProps) {
  const [projects, setProjects] = useState<string[]>([]);
  const [reportOwners, setReportOwners] = useState<string[]>([]);

  useEffect(() => {
    // Fetch existing projects and report owners
    fetch('/api/form-options')
      .then(res => res.json())
      .then(data => {
        setProjects(data.projects || []);
        setReportOwners(data.reportOwners || []);
      })
      .catch(error => {
        console.error('Error fetching form options:', error);
      });
  }, []);
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
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-xl rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              <form action={onSubmit} className="space-y-8">
                <div className="space-y-6">
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
                  <AutocompleteInput
                    name="project"
                    placeholder="Select or enter project name"
                    options={projects}
                    disabled={isLoading || isPending}
                    icon={<Briefcase className="h-5 w-5 text-gray-400" />}
                  />
                  <MeetingDetailsForm reportOwners={reportOwners} disabled={isLoading || isPending} />
                </div>
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading || isPending}
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isLoading || isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Generating Report...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        <span>Generate Lead Report</span>
                      </div>
                    )}
                  </Button>
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