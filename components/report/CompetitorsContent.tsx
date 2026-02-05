import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Zap, TrendingUp, Shield } from 'lucide-react';

interface CompetitorsContentProps {
  content: any;
}

export function CompetitorsContent({ content }: CompetitorsContentProps) {
  if (!content || !content.competitors || content.competitors.length === 0) {
    return (
      <div className="text-gray-500 italic">
        No competitor information available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {content.summary && (
        <div className="bg-blue-50/50 p-4 rounded-lg">
          <p className="text-gray-800">{content.summary}</p>
        </div>
      )}
      
      <div className="space-y-4">
        {content.competitors.map((competitor: any, index: number) => (
          <div key={index} className="border rounded-md p-4 bg-white">
            <div className="flex items-start justify-between">
              <h3 className="font-medium text-blue-700">{competitor.name}</h3>
              {competitor.threat && (
                <Badge className={
                  competitor.threat.toLowerCase() === 'high' 
                    ? 'bg-red-100 text-red-800' 
                    : competitor.threat.toLowerCase() === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                }>
                  {competitor.threat} Threat
                </Badge>
              )}
            </div>
            
            <p className="text-sm mt-2 text-gray-600">{competitor.description}</p>
            
            {competitor.strengths && competitor.strengths.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
                  <Zap className="h-3 w-3 text-yellow-500" />
                  Strengths
                </h4>
                <ul className="text-sm space-y-1">
                  {competitor.strengths.map((strength: string, i: number) => (
                    <li key={i} className="flex items-baseline gap-2">
                      <span className="text-yellow-500 text-sm">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {competitor.weaknesses && competitor.weaknesses.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
                  <Shield className="h-3 w-3 text-blue-500" />
                  Weaknesses
                </h4>
                <ul className="text-sm space-y-1">
                  {competitor.weaknesses.map((weakness: string, i: number) => (
                    <li key={i} className="flex items-baseline gap-2">
                      <span className="text-blue-500 text-sm">•</span>
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {competitor.marketTrends && competitor.marketTrends.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  Market Trends
                </h4>
                <ul className="text-sm space-y-1">
                  {competitor.marketTrends.map((trend: string, i: number) => (
                    <li key={i} className="flex items-baseline gap-2">
                      <span className="text-green-500 text-sm">•</span>
                      <span>{trend}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 