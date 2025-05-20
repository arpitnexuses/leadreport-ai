'use client'

import { useEffect, useState } from 'react'
import { getReportStatus } from '@/app/actions'
import { Button } from '@/components/ui/button'

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

export function ReportLoader({ reportId, onReportReady }: ReportLoaderProps) {
  const [mounted, setMounted] = useState(false)
  const [status, setStatus] = useState<Status>('processing')
  const [error, setError] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)

  useEffect(() => {
    setStartTime(Date.now())
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    let timeoutId: NodeJS.Timeout
    let isMounted = true

    const pollStatus = async () => {
      try {
        const result = await getReportStatus(reportId) as ReportResponse
        
        if (!isMounted) return

        if (result.status) {
          setStatus(result.status)
        }
        
        if (result.error) {
          setError(result.error)
          return
        }
        
        if (result.status === 'completed' && result.data) {
          onReportReady(result.data)
          return
        }
        
        // Calculate elapsed time in seconds
        const effectiveStartTime = startTime ?? Date.now()
        const elapsedSeconds = Math.floor((Date.now() - effectiveStartTime) / 1000)
        
        // If not completed and not failed, poll again in 2 seconds
        if (result.status !== 'completed' && result.status !== 'failed') {
          // If we've been polling for more than 60 seconds, show error
          if (elapsedSeconds >= 60) {
            setStatus('failed')
            setError('Report generation is taking longer than expected. Please try again.')
            return
          }
          
          timeoutId = setTimeout(pollStatus, 2000)
        }
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof Error ? err.message : 'Failed to check report status')
        setStatus('failed')
      }
    }

    pollStatus()

    // Cleanup timeout on unmount
    return () => {
      isMounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [reportId, onReportReady, startTime, mounted])

  const getLoadingMessage = () => {
    switch (status) {
      case 'processing':
        return 'Initializing report generation...'
      case 'fetching_apollo':
        return 'Fetching lead data from Apollo...'
      default:
        return 'Processing your request...'
    }
  }

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  if (status !== 'completed' && status !== 'failed') {
    const effectiveStartTime = startTime ?? Date.now()
    const elapsedSeconds = Math.floor((Date.now() - effectiveStartTime) / 1000)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        <h3 className="mt-4 text-xl font-semibold text-gray-800">Generating Your Report</h3>
        <p className="mt-2 text-sm text-gray-500">{getLoadingMessage()}</p>
        <p className="mt-1 text-xs text-gray-400">Time elapsed: {elapsedSeconds} seconds</p>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-red-500 text-xl">❌</div>
        <h3 className="mt-4 text-xl font-semibold text-red-600">Report Generation Failed</h3>
        <p className="mt-2 text-sm text-gray-500">{error || 'An unexpected error occurred'}</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline" 
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    )
  }

  return null
} 