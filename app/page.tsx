"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { initiateReport, getReports } from "@/app/actions";
import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { Search, Mail, Users, LineChart, Sparkles, ArrowRight, CheckCircle, LayoutDashboard, History, Settings, CheckCircle2, LogOut } from "lucide-react";
import { MeetingDetailsForm } from '@/components/ui/input';
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  const [reports, setReports] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

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

  const getMeetingStatus = (meetingDate: string) => {
    if (!meetingDate) return 'pending';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const meeting = new Date(meetingDate);
    meeting.setHours(0, 0, 0, 0);
    return meeting < today ? 'completed' : 'scheduled';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredReports = reports.filter(report => 
    report.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (res.ok) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Loading Overlay */}
      {(isLoading || isPending) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-md mx-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600 border-t-transparent"></div>
              <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600 h-10 w-10" />
            </div>
            <div className="space-y-4 text-center mt-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Generating Lead Report
              </h3>
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-400">
                  We&aposre analyzing the data and generating your comprehensive report...
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="animate-pulse">•</div>
                  <div className="animate-pulse delay-100">•</div>
                  <div className="animate-pulse delay-200">•</div>
                </div>
              </div>
              <div className="mt-6 space-y-2">
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full animate-[progress_2s_ease-in-out_infinite]"></div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">This may take a few moments</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-72 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 border-r border-blue-700/50 flex flex-col">
          <div className="p-6 border-b border-blue-700/50">
            <div className="flex flex-col items-center gap-2">
              <div className="h-16 w-48 flex items-center justify-center">
                <Image
                  src="https://22527425.fs1.hubspotusercontent-na1.net/hubfs/22527425/Nexuses%20logo%20white.svg"
                  alt="Brand Name"
                  width={180}
                  height={45}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
          <div className="flex-1 p-6">
            <nav className="space-y-6">
              {/* First Group */}
              <div className="space-y-4">
                <button
                  onClick={() => setActiveTab('generate')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === 'generate'
                      ? 'bg-white/10 backdrop-blur-sm text-white shadow-lg ring-1 ring-white/20'
                      : 'text-blue-100 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className={`h-5 w-5 ${activeTab === 'generate' ? 'text-white' : 'text-blue-300'}`} />
                  <span className="font-medium">Generate Lead</span>
                </button>
                <button
                  onClick={() => setActiveTab('pipeline')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === 'pipeline'
                      ? 'bg-white/10 backdrop-blur-sm text-white shadow-lg ring-1 ring-white/20'
                      : 'text-blue-100 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <History className={`h-5 w-5 ${activeTab === 'pipeline' ? 'text-white' : 'text-blue-300'}`} />
                  <span className="font-medium">Pipeline</span>
                </button>
              </div>

              {/* Second Group */}
              <div className="space-y-4">
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === 'settings'
                      ? 'bg-white/10 backdrop-blur-sm text-white shadow-lg ring-1 ring-white/20'
                      : 'text-blue-100 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Settings className={`h-5 w-5 ${activeTab === 'settings' ? 'text-white' : 'text-blue-300'}`} />
                  <span className="font-medium">Preferences</span>
                </button>
              </div>
            </nav>
          </div>
          <div className="p-6 border-t border-blue-700/50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-blue-100 hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-5 w-5 text-blue-300" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {activeTab === 'generate' && (
              <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-12">
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Generate Lead Report</h1>
                  <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl">
                    Create comprehensive lead reports with AI-powered insights and professional analysis
                  </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-xl rounded-2xl overflow-hidden">
                      <CardContent className="p-8">
                        <form action={handleGenerateReport} className="space-y-8">
                          <div className="space-y-6">
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-blue-600" />
                              </div>
                              <Input
                                type="email"
                                name="email"
                                placeholder="Enter business email address"
                                required
                                disabled={isLoading || isPending}
                                className="pl-12 h-14 text-lg rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-900 shadow-sm"
                              />
                            </div>
                            <MeetingDetailsForm />
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
                            <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100">What you&aposll get</h3>
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
            )}

            {activeTab === 'pipeline' && (
              <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Lead Pipeline</h1>
                  <p className="text-gray-600 dark:text-gray-300">Track and manage your lead reports</p>
                </div>
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search by email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12 rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-900"
                    />
                  </div>
                </div>
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                  <CardContent className="p-8">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">Date</th>
                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">Email</th>
                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">Meeting Date</th>
                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">Platform</th>
                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredReports.map((report) => {
                            const meetingStatus = getMeetingStatus(report.meetingDate);
                            return (
                              <tr key={report._id.toString()} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="py-4 px-6 text-sm text-gray-900 dark:text-white">
                                  {formatDate(report.createdAt)}
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-900 dark:text-white">
                                  {report.email}
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-900 dark:text-white">
                                  {report.meetingDate ? formatDate(report.meetingDate) : '-'}
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-900 dark:text-white">
                                  {report.meetingPlatform || '-'}
                                </td>
                                <td className="py-4 px-6">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    meetingStatus === 'completed'
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                      : meetingStatus === 'scheduled'
                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  }`}>
                                    {meetingStatus === 'completed' ? 'Completed' : meetingStatus === 'scheduled' ? 'Scheduled' : 'Pending'}
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-900 dark:text-white">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                    onClick={() => window.open(`/report/${report._id}`, '_blank')}
                                  >
                                    View Report
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                          {filteredReports.length === 0 && (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                No reports found matching your search.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
                  <p className="text-gray-600 dark:text-gray-300">Configure your account settings</p>
                </div>
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                  <CardContent className="p-8">
                    <p className="text-gray-600 dark:text-gray-300">Settings content will go here</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
