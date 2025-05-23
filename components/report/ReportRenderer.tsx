import React from 'react';

interface ReportRendererProps {
  children: React.ReactNode;
}

export function ReportRenderer({ children }: ReportRendererProps) {
  return <div className="report-renderer">{children}</div>;
} 