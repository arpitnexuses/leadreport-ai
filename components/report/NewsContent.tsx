import React from 'react';
import { Badge } from "@/components/ui/badge";
import { EditableField } from "./EditableField";

interface NewsContentProps {
  content: any;
  isEditing?: boolean;
  onContentChange?: (key: string, value: string) => void;
  onArrayItemChange?: (key: string, index: number, value: string) => void;
  onNestedContentChange?: (parentKey: string, index: number, key: string, value: string) => void;
}

export function NewsContent({
  content,
  isEditing = false,
  onContentChange,
  onArrayItemChange,
  onNestedContentChange
}: NewsContentProps) {
  // Default handlers that do nothing if not provided
  const handleContentChange = onContentChange || ((key: string, value: string) => {});
  const handleArrayItemChange = onArrayItemChange || ((key: string, index: number, value: string) => {});
  const handleNestedContentChange = onNestedContentChange || ((parentKey: string, index: number, key: string, value: string) => {});

  // Helper function to render industry trends appropriately
  const renderIndustryTrends = () => {
    if (!content.relevantIndustryTrends) return null;
    
    // Handle array of trends
    if (Array.isArray(content.relevantIndustryTrends)) {
      return (
        <ul className="space-y-2">
          {content.relevantIndustryTrends.map((trend: string, index: number) => (
            <li key={index} className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              {isEditing ? (
                <EditableField
                  value={trend}
                  onChange={(value) => handleArrayItemChange('relevantIndustryTrends', index, value)}
                  isEditing={isEditing}
                  className="flex-1"
                />
              ) : (
                <span>{trend}</span>
              )}
            </li>
          ))}
        </ul>
      );
    }
    
    // Handle object with numbered keys (which is a common format from the backend)
    if (typeof content.relevantIndustryTrends === 'object' && 
        Object.keys(content.relevantIndustryTrends).every(key => !isNaN(Number(key)))) {
      const trendsArray = Object.values(content.relevantIndustryTrends) as string[];
      return (
        <ul className="space-y-2">
          {trendsArray.map((trend, index) => (
            <li key={index} className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>{trend}</span>
            </li>
          ))}
        </ul>
      );
    }
    
    // Handle regular object with named keys
    if (typeof content.relevantIndustryTrends === 'object') {
      return (
        <div className="space-y-3">
          {Object.entries(content.relevantIndustryTrends).map(([key, value], index) => (
            <div key={index}>
              <div className="font-medium">{key}</div>
              <div className="pl-4 mt-1">
                {typeof value === 'string' ? (
                  <div>{value}</div>
                ) : Array.isArray(value) ? (
                  <ul className="space-y-1">
                    {value.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div>{JSON.stringify(value)}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    // Handle string content
    return <div>{String(content.relevantIndustryTrends)}</div>;
  };

  return (
    <div className="space-y-6">
      {content.recentNews && content.recentNews.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3">Recent News</h3>
          <div className="space-y-3">
            {content.recentNews.map((news: any, index: number) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="font-medium">
                  {isEditing ? (
                    <EditableField
                      value={news.title}
                      onChange={(value) => handleNestedContentChange('recentNews', index, 'title', value)}
                      isEditing={isEditing}
                    />
                  ) : news.title}
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  {isEditing ? (
                    <EditableField
                      value={news.date || ''}
                      onChange={(value) => handleNestedContentChange('recentNews', index, 'date', value)}
                      isEditing={isEditing}
                      className="text-xs"
                    />
                  ) : (
                    <span>{news.date}</span>
                  )}
                  {isEditing ? (
                    <EditableField
                      value={news.source || ''}
                      onChange={(value) => handleNestedContentChange('recentNews', index, 'source', value)}
                      isEditing={isEditing}
                      className="text-xs"
                    />
                  ) : (
                    <span>{news.source}</span>
                  )}
                </div>
                {news.summary && (
                  <div className="mt-2 text-sm">
                    {isEditing ? (
                      <EditableField
                        value={news.summary}
                        onChange={(value) => handleNestedContentChange('recentNews', index, 'summary', value)}
                        isEditing={isEditing}
                        multiline={true}
                      />
                    ) : news.summary}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {content.relevantIndustryTrends && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Industry Trends</h3>
          <div className="bg-blue-50 p-4 rounded-lg">
            {renderIndustryTrends()}
          </div>
        </div>
      )}
    </div>
  );
} 