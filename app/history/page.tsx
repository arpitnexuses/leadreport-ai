'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Trash2, Search, Calendar, Mail, ArrowRight, Clock, CheckCircle2, XCircle, CalendarCheck } from 'lucide-react'
import { deleteReport, getReports } from "@/app/actions"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"

export default function HistoryPage() {
  const [reports, setReports] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const loadReports = async () => {
      try {
        const data = await getReports()
        setReports(data)
      } catch (error) {
        console.error('Failed to load reports:', error)
      } finally {
        setLoading(false)
      }
    }

    loadReports()
  }, [])

  const handleDelete = async (reportId: string, formData: FormData) => {
    try {
      setDeletingIds(prev => new Set(prev).add(reportId))
      await deleteReport(formData)
      setReports(prevReports => prevReports.filter(report => report._id.toString() !== reportId))
    } catch (error) {
      console.error('Failed to delete report:', error)
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(reportId)
        return newSet
      })
    }
  }
  
  const filteredReports = reports.filter(report => 
    report.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getMeetingStatus = (meetingDate: string) => {
    if (!meetingDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const meeting = new Date(meetingDate);
    meeting.setHours(0, 0, 0, 0);
    return meeting < today ? 'completed' : 'scheduled';
  }

  const getStatusColor = (status: string, meetingStatus?: string | null) => {
    if (meetingStatus === 'completed') {
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    }
    if (meetingStatus === 'scheduled') {
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    }
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'failed':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    }
  }

  const getStatusIcon = (status: string, meetingStatus?: string | null) => {
    if (meetingStatus === 'completed') {
      return <CheckCircle2 className="h-4 w-4" />
    }
    if (meetingStatus === 'scheduled') {
      return <CalendarCheck className="h-4 w-4" />
    }
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />
      case 'failed':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const formatMeetingDate = (date: string, time: string) => {
    const meetingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let dateString;
    if (meetingDate.getTime() === today.getTime()) {
      dateString = 'Today';
    } else if (meetingDate.getTime() === tomorrow.getTime()) {
      dateString = 'Tomorrow';
    } else {
      dateString = meetingDate.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
    
    return `${dateString} at ${time}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-white to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-900">
        <div className="container mx-auto py-10 px-4">
          <Card className="mb-8 border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <CardTitle className="text-2xl font-bold">Report History</CardTitle>
                  <CardDescription>Loading reports...</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <div className="h-10 w-full bg-gray-200 rounded"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-white to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-900">
      <div className="container mx-auto py-10 px-4">
        <Card className="mb-8 border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Report History
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                  View and manage your generated lead reports
                </CardDescription>
              </div>
              <Link href="/">
                <Button className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200">
                  <Mail className="mr-2 h-4 w-4" />
                  Generate New Report
                </Button>
              </Link>
            </div>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search reports by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/70 backdrop-blur-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => {
            const meetingStatus = getMeetingStatus(report.meetingDate);
            const isDeleting = deletingIds.has(report._id.toString());
            
            return (
              <Card 
                key={report._id.toString()} 
                className={`group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:bg-white/80 hover:-translate-y-1 ${
                  isDeleting ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status, meetingStatus)}`}>
                            {getStatusIcon(report.status, meetingStatus)}
                            <span className="ml-1 capitalize">
                              {meetingStatus || report.status}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white">
                            <Mail className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg truncate">{report.email}</h3>
                            <div className="flex items-center mt-1 text-sm text-gray-600 dark:text-gray-400">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(report.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                      <form 
                        action={(formData) => handleDelete(report._id.toString(), formData)}
                        className="ml-2"
                      >
                        <input type="hidden" name="reportId" value={report._id.toString()} />
                        <Button 
                          variant="ghost" 
                          size="icon"
                          disabled={isDeleting}
                          className={`opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-100 hover:text-red-600 rounded-full ${
                            isDeleting ? 'cursor-not-allowed' : ''
                          }`}
                          type="submit"
                        >
                          <Trash2 className={`h-4 w-4 ${isDeleting ? 'animate-spin' : ''}`} />
                        </Button>
                      </form>
                    </div>
                    {report.meetingDate && (
                      <div className={`mt-4 p-3 rounded-lg ${
                        meetingStatus === 'completed' 
                          ? 'bg-green-50 dark:bg-green-900/20' 
                          : 'bg-purple-50 dark:bg-purple-900/20'
                      }`}>
                        <p className={`text-sm ${
                          meetingStatus === 'completed'
                            ? 'text-green-700 dark:text-green-400'
                            : 'text-purple-700 dark:text-purple-400'
                        }`}>
                          {meetingStatus === 'completed' ? 'Meeting was on ' : 'Meeting scheduled for '}
                          {formatMeetingDate(report.meetingDate, report.meetingTime)}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Link href={`/report/${report._id}`} className="w-full">
                    <Button 
                      variant="outline" 
                      className="w-full group/button hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white transition-all duration-200 border-gray-200 hover:border-transparent"
                    >
                      View Report
                      <ArrowRight className="ml-2 h-4 w-4 transform group-hover/button:translate-x-1 transition-transform duration-200" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
          {filteredReports.length === 0 && (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">No reports found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

