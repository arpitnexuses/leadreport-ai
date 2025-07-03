import React from 'react';
import { Building2 } from "lucide-react";
import { AISectionContent } from "./AISectionContent";

interface CompanyAnalysisProps {
  leadData: any;
  apolloData: any;
  isEditing: boolean;
  existingContent?: any;
  onContentUpdate?: (content: any) => void;
}

export function CompanyAnalysis({
  leadData,
  apolloData,
  isEditing,
  existingContent,
  onContentUpdate
}: CompanyAnalysisProps) {
  return (
    <AISectionContent 
      section="company" 
      leadData={leadData} 
      apolloData={apolloData}
      isEditing={isEditing}
      showSectionHeader={false}
      existingContent={existingContent}
      onContentUpdate={onContentUpdate}
    />
  );
} 