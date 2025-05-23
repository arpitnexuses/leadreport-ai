import React from 'react';
import { Badge } from "@/components/ui/badge";

interface TechStackContentProps {
  content: any;
}

export function TechStackContent({ content }: TechStackContentProps) {
  return (
    <div className="space-y-6">
      {content.currentTechnologies && content.currentTechnologies.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3">Current Technologies</h3>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(content.currentTechnologies) ? (
              content.currentTechnologies.map((tech: string, index: number) => (
                <Badge key={index} variant="outline" className="bg-gray-100">
                  {tech}
                </Badge>
              ))
            ) : (
              <div className="text-gray-600">{content.currentTechnologies}</div>
            )}
          </div>
        </div>
      )}
      
      {content.painPoints && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Pain Points</h3>
          <div className="bg-red-50 p-3 rounded-lg text-gray-800">
            {typeof content.painPoints === 'string' ? (
              <div className="whitespace-pre-wrap">
                {content.painPoints.split(/\s*\n\s*|\s*\.\s*/).filter((point: string) => point.trim()).map((point: string, index: number) => (
                  <div key={index} className="mb-2">
                    • {point.trim().replace(/\.$/, '')}
                  </div>
                ))}
              </div>
            ) : (
              <div>{content.painPoints}</div>
            )}
          </div>
        </div>
      )}
      
      {content.opportunities && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Opportunities</h3>
          <div className="bg-green-50 p-3 rounded-lg text-gray-800">
            {typeof content.opportunities === 'string' ? (
              <div className="whitespace-pre-wrap">
                {content.opportunities.split(/\s*\n\s*|\s*\.\s*/).filter((point: string) => point.trim()).map((point: string, index: number) => (
                  <div key={index} className="mb-2">
                    • {point.trim().replace(/\.$/, '')}
                  </div>
                ))}
              </div>
            ) : (
              <div>{content.opportunities}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 