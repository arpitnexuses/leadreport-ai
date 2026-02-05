import React from 'react';
import { Badge } from "@/components/ui/badge";
import { EditableField } from "./EditableField";
import { ExternalLink, Calendar, Newspaper } from 'lucide-react';

interface NewsArticle {
  title: string;
  description?: string;
  url: string;
  source: string;
  publishedAt: string;
  urlToImage?: string;
}

interface NewsContentProps {
  content: any;
  companyNews?: {
    articles: NewsArticle[];
    totalResults: number;
  };
  isEditing?: boolean;
  onContentChange?: (key: string, value: string) => void;
  onArrayItemChange?: (key: string, index: number, value: string) => void;
  onNestedContentChange?: (parentKey: string, index: number, key: string, value: string) => void;
}

export function NewsContent({
  content,
  companyNews,
  isEditing = false,
  onContentChange,
  onArrayItemChange,
  onNestedContentChange
}: NewsContentProps) {
  // Default handlers that do nothing if not provided
  const handleContentChange = onContentChange || ((key: string, value: string) => {});
  const handleArrayItemChange = onArrayItemChange || ((key: string, index: number, value: string) => {});
  const handleNestedContentChange = onNestedContentChange || ((parentKey: string, index: number, key: string, value: string) => {});

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  // Helper function to render industry trends appropriately
  const renderIndustryTrends = () => {
    if (!content?.relevantIndustryTrends) return null;
    
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

  const hasRealNews = companyNews && companyNews.articles && companyNews.articles.length > 0;
  const hasAIContent = content && (content.recentNews || content.relevantIndustryTrends);

  return (
    <div className="space-y-6">
      {/* Real News from NewsAPI */}
      {hasRealNews && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Newspaper className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">Recent Company News</h3>
            <Badge variant="outline" className="ml-auto">
              {companyNews.totalResults} articles
            </Badge>
          </div>
          <div className="space-y-4">
            {companyNews.articles.map((article, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  {article.urlToImage && (
                    <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                      <img 
                        src={article.urlToImage} 
                        alt={article.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group"
                    >
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 flex items-start gap-2">
                        <span className="flex-1">{article.title}</span>
                        <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h4>
                    </a>
                    {article.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {article.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-sm">
                          {article.source}
                        </Badge>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(article.publishedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI-generated content (legacy or when no real news) */}
      {hasAIContent && (
        <>
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
                          className="text-sm"
                        />
                      ) : (
                        <span>{news.date}</span>
                      )}
                      {isEditing ? (
                        <EditableField
                          value={news.source || ''}
                          onChange={(value) => handleNestedContentChange('recentNews', index, 'source', value)}
                          isEditing={isEditing}
                          className="text-sm"
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
        </>
      )}

      {/* No news available message */}
      {!hasRealNews && !hasAIContent && (
        <div className="text-center py-8 text-gray-500">
          <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No recent news available for this company.</p>
        </div>
      )}
    </div>
  );
} 