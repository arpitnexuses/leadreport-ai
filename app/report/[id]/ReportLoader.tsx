'use client'

import { useEffect, useState, useCallback } from 'react'
import { getReportStatus } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { LoadingOverlay } from '@/components/dashboard/LoadingOverlay'

type Status = 'processing' | 'fetching_apollo' | 'completed' | 'failed'

interface LeadData {
  name: string;
  position: string;
  companyName: string;
  photo: string | null;
  contactDetails: {
    email: string;
    phone: string;
    linkedin: string;
  };
  companyDetails: {
    industry: string;
    employees: string;
    headquarters: string;
    website: string;
  };
  leadScoring: {
    rating: string;
    qualificationCriteria: Record<string, string>;
  };
}

interface ApolloResponse {
  person: {
    name?: string;
    title?: string;
    photo_url?: string;
    phone_number?: string;
    linkedin_url?: string;
    email?: string;
    organization?: {
      name?: string;
      website_url?: string;
      industry?: string;
      employee_count?: string;
      location?: {
        city?: string;
        state?: string;
        country?: string;
      };
      description?: string;
    };
  };
}

interface LeadReport {
  _id: string;
  email: string;
  apolloData: ApolloResponse;
  report: string;
  leadData: LeadData;
  createdAt: Date;
  status: Status;
  error?: string;
}

interface ReportResponse {
  status: Status;
  data: LeadReport | null;
  error?: string;
}

interface ReportLoaderProps {
  reportId: string;
  onReportReady: (report: LeadReport) => void;
}

// Error display component when report loading fails
function ErrorDisplay({ error, onRetry }: { error: string | null, onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="text-red-500 text-4xl mb-4">❌</div>
      <h3 className="text-2xl font-semibold text-red-600 mb-2">Report Generation Failed</h3>
      <p className="text-base text-gray-600 max-w-md text-center mb-6">
        {error || 'Failed to generate AI report. Please try again later.'}
      </p>
      <Button 
        onClick={onRetry} 
        className="bg-blue-600 hover:bg-blue-700 text-white px-6"
      >
        Try Again
      </Button>
    </div>
  );
}

export function ReportLoader({ reportId, onReportReady }: ReportLoaderProps) {
  const [mounted, setMounted] = useState(false)
  const [status, setStatus] = useState<string>('loading')
  const [error, setError] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [statusMessage, setStatusMessage] = useState("Initializing report loading...")
  const [showError, setShowError] = useState(false)
  
  const fetchReport = useCallback(async () => {
    try {
      const response = await fetch(`/api/reports/${reportId}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || `Failed to fetch report (${response.status})`)
      }
      
      const data = await response.json()
      
      if (data.status === 'completed') {
        onReportReady(data.data)
        setStatus('completed')
      } else if (data.status === 'failed') {
        setStatus('failed')
        setError(data.error || 'Unknown error occurred')
        setShowError(true)
      } else {
        // Still processing
        setStatus(data.status)
        
        // Update status message based on current status
        switch (data.status) {
          case 'processing':
            setStatusMessage("Initializing report generation...")
            break
          case 'fetching_apollo':
            setStatusMessage("Fetching lead data from Apollo...")
            break
          case 'generating_ai':
            setStatusMessage("Creating AI insights for your report...")
            break
          default:
            setStatusMessage("Processing your request...")
        }
        
        // Poll again after a delay
        setTimeout(fetchReport, 1500)
      }
    } catch (error) {
      console.error('Error fetching report:', error)
      setStatus('failed')
      setError(error instanceof Error ? error.message : 'Failed to load report. Please try again.')
      setShowError(true)
    }
  }, [reportId, onReportReady])
  
  const handleRetry = useCallback(() => {
    setShowError(false)
    setStatus('loading')
    setError(null)
    setStartTime(Date.now())
    fetchReport()
  }, [fetchReport])
  
  useEffect(() => {
    if (!mounted) return
    
    setStartTime(Date.now())
    fetchReport()
  }, [fetchReport, mounted])
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Show error display
  if (showError) {
    return <ErrorDisplay error={error} onRetry={handleRetry} />
  }
  
  // Finished loading
  if (status === 'completed') {
    return null
  }
  
  // Still loading
  return <LoadingOverlay isVisible={true} statusMessage={statusMessage} />
} 