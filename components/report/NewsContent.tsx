import React from 'react';
import { Badge } from "@/components/ui/badge";

interface NewsContentProps {
  content: any;
}

export function NewsContent({ content }: NewsContentProps) {
  return (
    <div className="space-y-6">
      {content.recentNews && content.recentNews.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3">Recent News</h3>
          <div className="space-y-3">
            {content.recentNews.map((news: any, index: number) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="font-medium">{news.title}</div>
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>{news.date}</span>
                  <span>{news.source}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {content.relevantIndustryTrends && content.relevantIndustryTrends.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Industry Trends</h3>
          <div className="bg-blue-50 p-4 rounded-lg">
            <ul className="space-y-2">
              {content.relevantIndustryTrends.map((trend: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>{trend}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
} 