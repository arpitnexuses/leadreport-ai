import React from 'react';

interface ReportInfoSectionProps {
  title: string;
  children: React.ReactNode;
}

export function ReportInfoSection({ title, children }: ReportInfoSectionProps) {
  return (
    <div className="mb-6">
      <h2 className="text-base font-bold mb-3">{title}</h2>
      <div>{children}</div>
    </div>
  );
} 