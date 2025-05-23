import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="shadow-sm border">
      <CardHeader className="bg-blue-50 border-b pb-4 flex flex-row items-center space-y-0 gap-2">
        <span className="text-blue-600"><Building2 className="h-5 w-5" /></span>
        <CardTitle className="text-xl">AI Company Analysis</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <AISectionContent 
          section="company" 
          leadData={leadData} 
          apolloData={apolloData}
          isEditing={isEditing}
          showSectionHeader={false}
          existingContent={existingContent}
          onContentUpdate={onContentUpdate}
        />
      </CardContent>
    </Card>
  );
} 