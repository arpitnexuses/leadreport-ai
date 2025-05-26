"use client";

import { Sparkles } from "lucide-react";

interface LoadingOverlayProps {
  isVisible: boolean;
}

export function LoadingOverlay({ isVisible }: LoadingOverlayProps) {
  if (!isVisible) return null;

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
              We&apos;re analyzing the data and generating your comprehensive report...
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
  );
} 