"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { initiateReport } from "@/app/actions";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, Mail, Users, LineChart, Sparkles, ArrowRight, CheckCircle } from "lucide-react";
import { MeetingDetailsForm } from '@/components/ui/input';

export default function Home() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  async function handleGenerateReport(formData: FormData) {
    setIsLoading(true);
    startTransition(async () => {
      try {
        const meetingDate = formData.get('meetingDate');
        const meetingTime = formData.get('meetingTime');
        const meetingPlatform = formData.get('meetingPlatform');
        const problemPitch = formData.get('problemPitch');

        formData.append('meetingDate', meetingDate as string);
        formData.append('meetingTime', meetingTime as string);
        formData.append('meetingPlatform', meetingPlatform as string);
        formData.append('problemPitch', problemPitch as string);

        const result = await initiateReport(formData);
        if (result.success) {
          window.open(`/report/${result.reportId}`, '_blank');
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to generate report:", error);
        setIsLoading(false);
      }
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* Background Patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-[1000px] h-[1000px] rounded-full bg-gradient-to-b from-blue-100/20 to-purple-100/20 dark:from-blue-900/20 dark:to-purple-900/20 blur-3xl transform rotate-12"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-[1000px] h-[1000px] rounded-full bg-gradient-to-t from-blue-100/20 to-purple-100/20 dark:from-blue-900/20 dark:to-purple-900/20 blur-3xl transform -rotate-12"></div>
      </div>

      {/* Loading Overlay */}
      {(isLoading || isPending) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-md mx-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
              <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600 h-8 w-8" />
            </div>
            <div className="space-y-3 text-center mt-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Generating Lead Report
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Please wait while we analyze the data and generate your comprehensive report...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
                LeadRepo
              </span>
             
            </div>
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => {
                  setIsNavigating(true);
                  router.push('/history');
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-medium px-6 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
                disabled={isNavigating}
              >
                {isNavigating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    View History
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <div className="pt-28 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Left Column - Content */}
              <div className="space-y-10">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
                    <Sparkles className="h-4 w-4" />
                    <span>AI-Powered Lead Intelligence</span>
                  </div>
                  <h1 className="text-5xl sm:text-6xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
                    Generate Professional{" "}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
                      Lead Reports
                    </span>{" "}
                    in Seconds
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl">
                    Transform email addresses into comprehensive lead reports with verified data, insights, and engagement strategies.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                    <div className="h-14 w-14 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                      <Users className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        10M+
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Verified Contacts
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                    <div className="h-14 w-14 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                      <LineChart className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        99%
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Data Accuracy
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Real-time data verification</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>AI-powered insights</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Engagement strategies</span>
                  </div>
                </div>
              </div>

              {/* Right Column - Form */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/30 to-purple-500/30 rounded-3xl blur-3xl"></div>
                <div className="relative">
                  <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
                    <CardContent className="p-8 relative">
                      <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Generate Your Report</h2>
                        <p className="text-gray-600 dark:text-gray-300">Fill in the details below to get started</p>
                      </div>
                      <form action={handleGenerateReport} className="space-y-6">
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
                            className="pl-12 h-14 text-lg rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-900"
                          />
                        </div>
                        <MeetingDetailsForm />
                        <Button
                          type="submit"
                          className="w-full h-14 text-lg rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 transition-all duration-200 shadow-lg hover:shadow-xl"
                          disabled={isLoading || isPending}
                        >
                          {isLoading || isPending ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                              <span>Generating Report...</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <span>Generate Report</span>
                              <ArrowRight className="h-5 w-5" />
                            </div>
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-5 bg-gradient-to-b from-white to-blue-50 dark:from-gray-800 dark:to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Everything you need to convert leads
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Powerful features to help you understand and engage with your leads more effectively.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group p-8 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  Instant Analysis
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Get detailed lead information and analysis powered by AI in seconds.
                </p>
                <div className="mt-6 flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <span className="text-sm font-medium">Learn more</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <div className="group p-8 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  Verified Data
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Access accurate contact information and professional profiles.
                </p>
                <div className="mt-6 flex items-center gap-2 text-purple-600 dark:text-purple-400">
                  <span className="text-sm font-medium">Learn more</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <div className="group p-8 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                  <LineChart className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  Smart Insights
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Get actionable insights and engagement strategies.
                </p>
                <div className="mt-6 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <span className="text-sm font-medium">Learn more</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
