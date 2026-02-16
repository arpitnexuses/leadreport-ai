"use client";

import { Sparkles, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

interface LoadingOverlayProps {
  isVisible: boolean;
  statusMessage?: string;
  hasError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
}

export function LoadingOverlay({ 
  isVisible, 
  statusMessage, 
  hasError = false,
  errorMessage,
  onRetry
}: LoadingOverlayProps) {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const typicalGenerationTimeSeconds = 25;
  
  useEffect(() => {
    if (!isVisible) {
      setTimeElapsed(0);
      return;
    }
    
    // Track elapsed time
    const timeInterval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    
    return () => {
      clearInterval(timeInterval);
    };
  }, [isVisible]);
  
  if (!isVisible) return null;

  // If there's an error, show error state
  if (hasError) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-md mx-4">
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
          </div>
          <div className="space-y-4 text-center mt-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Report Generation Failed
            </h3>
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-400">
                {errorMessage || "An error occurred while generating your report."}
              </p>
            </div>
            {onRetry && (
              <button 
                onClick={onRetry}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const progress = Math.min((timeElapsed / typicalGenerationTimeSeconds) * 100, 99);

  // Get appropriate status message
  const getMessage = () => {
    if (statusMessage) return statusMessage;
    
    // Provide phase-specific messaging based on progress
    if (progress < 30) {
      return "Fetching lead data from Apollo...";
    } else if (progress < 60) {
      return "Generating initial lead report...";
    } else if (progress < 90) {
      return "Creating AI insights for all sections...";
    } else {
      return "Finalizing your report...";
    }
  };

  return (
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
              {getMessage()}
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="animate-pulse">•</div>
              <div className="animate-pulse delay-100">•</div>
              <div className="animate-pulse delay-200">•</div>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{Math.min(Math.round(progress), 99)}% complete</span>
              <span>Time: {timeElapsed}s</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Typical generation time: {typicalGenerationTimeSeconds} sec
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 