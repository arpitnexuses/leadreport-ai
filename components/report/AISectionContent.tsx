import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AIAssistant } from "./AIAssistant";
import { AlertCircle } from 'lucide-react';
import { TechStackContent } from "./TechStackContent";
import { NewsContent } from "./NewsContent";
import { NextStepsContent } from "./NextStepsContent";
import { CompetitorsContent } from "./CompetitorsContent";
import { isStringList, stringToList, ensureArray } from "@/lib/report-content-enhancer";
import { EditableField } from "./EditableField";

interface AISectionContentProps {
  section: 'overview' | 'company' | 'meeting' | 'interactions' | 'competitors' | 'techStack' | 'news' | 'nextSteps';
  leadData: any;
  apolloData?: any;
  existingContent?: any;
  isEditing?: boolean;
  showSectionHeader?: boolean;
  onContentUpdate?: (content: any) => void;
}

export function AISectionContent({ 
  section, 
  leadData, 
  apolloData, 
  existingContent, 
  isEditing = false,
  showSectionHeader = true,
  onContentUpdate
}: AISectionContentProps) {
  const [content, setContent] = useState<any>(existingContent || null);
  const [isLoading, setIsLoading] = useState<boolean>(!existingContent);

  // Define which sections can display recommendations or tips
  const canShowRecommendations = section === 'nextSteps' || section === 'interactions';

  useEffect(() => {
    if (existingContent) {
      setContent(existingContent);
      setIsLoading(false);
    }
  }, [existingContent]);

  const handleContentGenerated = (newContent: any) => {
    setContent(newContent);
    setIsLoading(false);
    if (onContentUpdate) {
      onContentUpdate(newContent);
    }
  };

  const handleContentChange = (key: string, value: string) => {
    const updatedContent = { ...content, [key]: value };
    setContent(updatedContent);
    if (onContentUpdate) {
      onContentUpdate(updatedContent);
    }
  };

  const handleNestedContentChange = (parentKey: string, index: number, key: string, value: string) => {
    if (!content[parentKey] || !Array.isArray(content[parentKey])) return;
    
    const updatedItems = [...content[parentKey]];
    updatedItems[index] = { ...updatedItems[index], [key]: value };
    
    const updatedContent = { ...content, [parentKey]: updatedItems };
    setContent(updatedContent);
    if (onContentUpdate) {
      onContentUpdate(updatedContent);
    }
  };

  const handleArrayItemChange = (key: string, index: number, value: string) => {
    if (!content[key] || !Array.isArray(content[key])) return;
    
    const updatedItems = [...content[key]];
    updatedItems[index] = value;
    
    const updatedContent = { ...content, [key]: updatedItems };
    setContent(updatedContent);
    if (onContentUpdate) {
      onContentUpdate(updatedContent);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex items-center justify-center space-x-2">
          <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm font-medium text-gray-600">Generating {section} content...</span>
        </div>
        
        <div className="mt-6 space-y-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-center py-6">
          <p className="text-gray-500">No AI content available for this section.</p>
          {isEditing && (
            <div className="mt-4">
              <AIAssistant
                section={section}
                leadData={leadData}
                apolloData={apolloData}
                onContentGenerated={handleContentGenerated}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // If content exists but has insufficient data
  if (content.insufficient_data) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="p-4 text-amber-700 bg-amber-50 rounded-md flex items-start gap-3">
          <span className="text-amber-500 flex-shrink-0 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
            </svg>
          </span>
          <div>
            <h4 className="font-medium text-amber-800 mb-1">Insufficient Data</h4>
            <p className="text-sm">
              {content.message || "Not enough specific information about the company's market position, competitors, products, or challenges to provide meaningful insights."}
            </p>
            <p className="text-xs mt-2 text-amber-600">
              Rather than presenting potentially incorrect information, we&apos;ve limited the AI content for this section.
              Rather than presenting potentially incorrect information, we&apos;ve limited the AI content for this section.
            </p>
          </div>
        </div>
        {isEditing && (
          <div className="mt-4 flex justify-end">
            <AIAssistant
              section={section}
              leadData={leadData}
              apolloData={apolloData}
              onContentGenerated={handleContentGenerated}
            />
          </div>
        )}
      </div>
    );
  }

  // Render appropriate content based on section type
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-2 rounded-md text-xs text-gray-500 flex items-start gap-2">
        <span className="text-blue-500 flex-shrink-0 mt-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
          </svg>
        </span>
        <p>
          This content is AI-generated based on available data. Information presented here should be verified before making business decisions.
        </p>
      </div>
      
      {content.summary && (
        <div className="bg-blue-50/50 p-4 rounded-lg">
          <EditableField
            value={content.summary}
            onChange={(value) => handleContentChange('summary', value)}
            isEditing={isEditing}
            multiline={true}
            className="text-gray-800"
          />
        </div>
      )}
      
      {content.keyPoints && content.keyPoints.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Key Points</h3>
          <ul className="space-y-1">
            {content.keyPoints.map((point: string, index: number) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <EditableField
                  value={point}
                  onChange={(value) => handleArrayItemChange('keyPoints', index, value)}
                  isEditing={isEditing}
                  className="flex-1"
                />
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Company-specific content */}
      {section === 'company' && (
        <>
          {content.description && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Company Overview</h3>
              <div className="bg-blue-50/50 p-4 rounded-lg">
                <EditableField
                  value={content.description}
                  onChange={(value) => handleContentChange('description', value)}
                  isEditing={isEditing}
                  multiline={true}
                  className="text-gray-800"
                />
              </div>
            </div>
          )}
          
          {content.marketPosition && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Market Position</h3>
              <div className="bg-white p-4 rounded border">
                <EditableField
                  value={content.marketPosition}
                  onChange={(value) => handleContentChange('marketPosition', value)}
                  isEditing={isEditing}
                  multiline={true}
                  className="text-gray-800"
                />
              </div>
            </div>
          )}
          
          {content.challenges && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Key Challenges</h3>
              {Array.isArray(content.challenges) ? (
                <ul className="space-y-1 pl-1">
                  {content.challenges.map((challenge: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <EditableField
                        value={challenge}
                        onChange={(value) => handleArrayItemChange('challenges', index, value)}
                        isEditing={isEditing}
                        className="flex-1"
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="bg-white p-4 rounded border">
                  <EditableField
                    value={content.challenges}
                    onChange={(value) => handleContentChange('challenges', value)}
                    isEditing={isEditing}
                    multiline={true}
                    className="text-gray-800"
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}
      
      {/* Section-specific content rendering */}
      {section === 'competitors' && (
        <>
          {(content.competitors || content.mainCompetitors) && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                {content.mainCompetitors ? 'Main Competitors' : 'Competitors'}
              </h3>
              
              {/* Handle case where competitors is an array of strings */}
              {((content.competitors || content.mainCompetitors) && 
                Array.isArray(content.competitors || content.mainCompetitors) && 
                (content.competitors || content.mainCompetitors).length > 0 &&
                typeof (content.competitors || content.mainCompetitors)[0] === 'string') ? (
                <ul className="space-y-1 pl-1">
                  {(content.competitors || content.mainCompetitors).map((competitor: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <EditableField
                        value={competitor}
                        onChange={(value) => handleArrayItemChange(content.mainCompetitors ? 'mainCompetitors' : 'competitors', index, value)}
                        isEditing={isEditing}
                        className="flex-1"
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="space-y-3">
                  {(content.competitors || content.mainCompetitors || []).map((competitor: any, index: number) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <h4 className="font-medium">
                        <EditableField
                          value={competitor.name}
                          onChange={(value) => handleNestedContentChange(content.mainCompetitors ? 'mainCompetitors' : 'competitors', index, 'name', value)}
                          isEditing={isEditing}
                        />
                      </h4>
                      <EditableField
                        value={competitor.description}
                        onChange={(value) => handleNestedContentChange(content.mainCompetitors ? 'mainCompetitors' : 'competitors', index, 'description', value)}
                        isEditing={isEditing}
                        multiline={true}
                        className="text-sm text-gray-600"
                      />
                      {competitor.strengths && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-500">Strengths:</p>
                          <EditableField
                            value={competitor.strengths}
                            onChange={(value) => handleNestedContentChange(content.mainCompetitors ? 'mainCompetitors' : 'competitors', index, 'strengths', value)}
                            isEditing={isEditing}
                            multiline={true}
                            className="text-sm text-gray-600"
                          />
                        </div>
                      )}
                      {competitor.weaknesses && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-500">Weaknesses:</p>
                          <EditableField
                            value={competitor.weaknesses}
                            onChange={(value) => handleNestedContentChange(content.mainCompetitors ? 'mainCompetitors' : 'competitors', index, 'weaknesses', value)}
                            isEditing={isEditing}
                            multiline={true}
                            className="text-sm text-gray-600"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {content.marketDynamics && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Market Dynamics</h3>
              <div className="bg-gray-50 p-3 rounded border">
                <EditableField
                  value={content.marketDynamics}
                  onChange={(value) => handleContentChange('marketDynamics', value)}
                  isEditing={isEditing}
                  multiline={true}
                  className="text-gray-800"
                />
              </div>
            </div>
          )}
          
          {content.competitiveAdvantage && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Our Competitive Advantage</h3>
              <div className="bg-white p-4 rounded border">
                <EditableField
                  value={content.competitiveAdvantage}
                  onChange={(value) => handleContentChange('competitiveAdvantage', value)}
                  isEditing={isEditing}
                  multiline={true}
                  className="text-gray-800"
                />
              </div>
            </div>
          )}
        </>
      )}
      
      {section === 'techStack' && (
        <>
          {content.currentTechnologies && content.currentTechnologies.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Current Technologies</h3>
              <div className="flex flex-wrap gap-2">
                {content.currentTechnologies.map((tech: string, index: number) => (
                  <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    <EditableField
                      value={tech}
                      onChange={(value) => handleArrayItemChange('currentTechnologies', index, value)}
                      isEditing={isEditing}
                      className="flex-1"
                    />
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {content.painPoints && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Pain Points</h3>
              {typeof content.painPoints === 'string' && !isStringList(content.painPoints) ? (
                <p className="text-sm bg-gray-50 p-3 rounded">{content.painPoints}</p>
              ) : (
                <ul className="space-y-1 pl-1">
                  {ensureArray(content.painPoints).map((point: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <EditableField
                        value={point}
                        onChange={(value) => handleArrayItemChange('painPoints', index, value)}
                        isEditing={isEditing}
                        className="flex-1"
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          
          {canShowRecommendations && content.opportunities && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Opportunities</h3>
              {typeof content.opportunities === 'string' && !isStringList(content.opportunities) ? (
                <p className="text-sm bg-gray-50 p-3 rounded">{content.opportunities}</p>
              ) : (
                <ul className="space-y-1 pl-1">
                  {ensureArray(content.opportunities).map((opportunity: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <EditableField
                        value={opportunity}
                        onChange={(value) => handleArrayItemChange('opportunities', index, value)}
                        isEditing={isEditing}
                        className="flex-1"
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          
          {canShowRecommendations && content.recommendations && content.recommendations.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Recommendations</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <ul className="space-y-1 pl-1">
                  {content.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2">→</span>
                      <EditableField
                        value={rec}
                        onChange={(value) => handleArrayItemChange('recommendations', index, value)}
                        isEditing={isEditing}
                        className="text-sm flex-1"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {content.technologies && content.technologies.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Technologies</h3>
              <div className="grid grid-cols-2 gap-2">
                {content.technologies.map((tech: any, index: number) => (
                  <div key={index} className="bg-white p-3 rounded border">
                    <h4 className="font-medium">
                      <EditableField
                        value={tech.name}
                        onChange={(value) => handleNestedContentChange('technologies', index, 'name', value)}
                        isEditing={isEditing}
                      />
                    </h4>
                    <EditableField
                      value={tech.description}
                      onChange={(value) => handleNestedContentChange('technologies', index, 'description', value)}
                      isEditing={isEditing}
                      multiline={true}
                      className="text-sm text-gray-600"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      
      {section === 'news' && (
        <>
          {content.recentNews && content.recentNews.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Recent News</h3>
              <div className="space-y-3">
                {content.recentNews.map((news: any, index: number) => (
                  <div key={index} className="bg-white p-3 rounded border">
                    <h4 className="font-medium">
                      <EditableField
                        value={news.title}
                        onChange={(value) => handleNestedContentChange('recentNews', index, 'title', value)}
                        isEditing={isEditing}
                      />
                    </h4>
                    {news.date && (
                      <EditableField
                        value={news.date}
                        onChange={(value) => handleNestedContentChange('recentNews', index, 'date', value)}
                        isEditing={isEditing}
                        className="text-xs text-gray-500"
                      />
                    )}
                    {news.source && (
                      <EditableField
                        value={`Source: ${news.source}`}
                        onChange={(value) => handleNestedContentChange('recentNews', index, 'source', value.replace('Source: ', ''))}
                        isEditing={isEditing}
                        className="text-xs text-gray-500"
                      />
                    )}
                    {news.summary && (
                      <EditableField
                        value={news.summary}
                        onChange={(value) => handleNestedContentChange('recentNews', index, 'summary', value)}
                        isEditing={isEditing}
                        multiline={true}
                        className="text-sm text-gray-600 mt-1"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {content.relevantIndustryTrends && content.relevantIndustryTrends.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Industry Trends</h3>
              <ul className="space-y-1">
                {content.relevantIndustryTrends.map((trend: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <EditableField
                      value={trend}
                      onChange={(value) => handleArrayItemChange('relevantIndustryTrends', index, value)}
                      isEditing={isEditing}
                      className="flex-1"
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
      
      {section === 'nextSteps' && canShowRecommendations && (
        <>
          {/* For array of objects with description, rationale and priority properties */}
          {Array.isArray(content.recommendedActions) && content.recommendedActions.length > 0 && 
           typeof content.recommendedActions[0] === 'object' && 'description' in content.recommendedActions[0] && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Recommended Actions</h3>
              <div className="space-y-3">
                {content.recommendedActions
                  .filter((action: any) => 
                    // Filter out any action descriptions that might contain personal information
                    !action.description?.includes('Ekansh') && 
                    !action.description?.includes('Kandulna') && 
                    !action.description?.includes('Software Engineer') &&
                    !action.description?.includes('Nexuses') &&
                    !action.description?.includes('B2B Growth Agency')
                  )
                  .map((action: any, index: number) => (
                  <div key={index} className="bg-white p-4 rounded border">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-gray-900">
                        <EditableField
                          value={action.description}
                          onChange={(value) => handleNestedContentChange('recommendedActions', index, 'description', value)}
                          isEditing={isEditing}
                        />
                      </h4>
                      {action.priority && (
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          action.priority.toLowerCase() === 'high' 
                            ? 'bg-red-100 text-red-800' 
                            : action.priority.toLowerCase() === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {action.priority}
                        </span>
                      )}
                    </div>
                    {action.rationale && !action.rationale.includes('Ekansh') && !action.rationale.includes('Kandulna') && (
                      <EditableField
                        value={action.rationale}
                        onChange={(value) => handleNestedContentChange('recommendedActions', index, 'rationale', value)}
                        isEditing={isEditing}
                        multiline={true}
                        className="text-sm text-gray-600 mt-2"
                      />
                    )}
                    {action.dueDate && (
                      <EditableField
                        value={action.dueDate}
                        onChange={(value) => handleNestedContentChange('recommendedActions', index, 'dueDate', value)}
                        isEditing={isEditing}
                        className="text-xs text-gray-500 mt-1"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* For array of strings (the format seen in the screenshot) */}
          {Array.isArray(content.recommendedActions) && content.recommendedActions.length > 0 && 
           typeof content.recommendedActions[0] === 'string' && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Recommended Actions</h3>
              <div className="space-y-3">
                {content.recommendedActions
                  .filter((action: string) => 
                    !action.includes('Ekansh') && 
                    !action.includes('Kandulna') && 
                    !action.includes('Software Engineer') &&
                    !action.includes('Nexuses') &&
                    !action.includes('B2B Growth Agency')
                  )
                  .map((action: string, index: number) => (
                  <div key={index} className="bg-white p-3 rounded border">
                    <EditableField
                      value={action}
                      onChange={(value) => handleArrayItemChange('recommendedActions', index, value)}
                      isEditing={isEditing}
                      className="text-gray-800"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Previous recommendations format support */}
          {content.recommendations && content.recommendations.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Recommended Actions</h3>
              <div className="space-y-3">
                {content.recommendations
                  .filter((rec: any) => 
                    !rec.title?.includes('Ekansh') && 
                    !rec.title?.includes('Kandulna') && 
                    !rec.description?.includes('Ekansh') && 
                    !rec.description?.includes('Kandulna') &&
                    !rec.title?.includes('Software Engineer') &&
                    !rec.description?.includes('Software Engineer') &&
                    !rec.title?.includes('Nexuses') &&
                    !rec.description?.includes('Nexuses') &&
                    !rec.title?.includes('B2B Growth Agency') &&
                    !rec.description?.includes('B2B Growth Agency')
                  )
                  .map((rec: any, index: number) => (
                  <div key={index} className="bg-white p-3 rounded border">
                    <h4 className="font-medium">
                      <EditableField
                        value={rec.title}
                        onChange={(value) => handleNestedContentChange('recommendations', index, 'title', value)}
                        isEditing={isEditing}
                      />
                    </h4>
                    <EditableField
                      value={rec.description}
                      onChange={(value) => handleNestedContentChange('recommendations', index, 'description', value)}
                      isEditing={isEditing}
                      multiline={true}
                      className="text-sm text-gray-600"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      
      {section === 'meeting' && (
        <>
          {content.suggestedAgenda && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Suggested Agenda</h3>
              <p className="text-sm bg-gray-50 p-3 rounded">{content.suggestedAgenda}</p>
            </div>
          )}
          
          {content.keyQuestions && content.keyQuestions.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Key Questions</h3>
              <ul className="space-y-1">
                {content.keyQuestions.map((question: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <EditableField
                      value={question}
                      onChange={(value) => handleArrayItemChange('keyQuestions', index, value)}
                      isEditing={isEditing}
                      className="flex-1"
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {canShowRecommendations && content.preparationTips && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Preparation Tips</h3>
              <p className="text-sm bg-gray-50 p-3 rounded">{content.preparationTips}</p>
            </div>
          )}
        </>
      )}
      
      {section === 'interactions' && (
        <>
          {content.communicationPreferences && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Communication Preferences</h3>
              <div className="bg-white p-4 rounded border">
                <EditableField
                  value={content.communicationPreferences}
                  onChange={(value) => handleContentChange('communicationPreferences', value)}
                  isEditing={isEditing}
                  multiline={true}
                  className="text-gray-800"
                />
              </div>
            </div>
          )}
          
          {Array.isArray(content.personalizationTips) && content.personalizationTips.length > 0 ? (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Personalization Tips</h3>
              <ul className="space-y-1">
                {content.personalizationTips.map((tip: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <EditableField
                      value={tip}
                      onChange={(value) => handleArrayItemChange('personalizationTips', index, value)}
                      isEditing={isEditing}
                      className="flex-1"
                    />
                  </li>
                ))}
              </ul>
            </div>
          ) : content.personalizationTips ? (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Personalization Tips</h3>
              <div className="bg-white p-4 rounded border">
                <EditableField
                  value={content.personalizationTips}
                  onChange={(value) => handleContentChange('personalizationTips', value)}
                  isEditing={isEditing}
                  multiline={true}
                  className="text-gray-800"
                />
              </div>
            </div>
          ) : null}
          
          {content.dosDonts && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Dos and Don&apos;ts</h3>
              {typeof content.dosDonts === 'string' ? (
                // Check if the string appears to be a JSON array
                content.dosDonts.trim().startsWith('[') && content.dosDonts.trim().endsWith(']') ? (
                  (() => {
                    try {
                      // Try to parse it as JSON
                      const parsedItems = JSON.parse(content.dosDonts);
                      if (Array.isArray(parsedItems)) {
                        // Separate the items into do's and don'ts
                        const doItems = parsedItems.filter(item => 
                          item.toLowerCase().startsWith("do ") || 
                          item.toLowerCase().startsWith("always ") || 
                          item.toLowerCase().startsWith("use ")
                        );
                        const dontItems = parsedItems.filter(item => 
                          item.toLowerCase().startsWith("don't ") || 
                          item.toLowerCase().startsWith("avoid ") || 
                          item.toLowerCase().startsWith("never ")
                        );
                        
                        // Return the formatted view
                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {doItems.length > 0 && (
                              <div className="bg-green-50 p-3 rounded border border-green-100">
                                <h4 className="text-sm font-medium text-green-700 mb-2">Do</h4>
                                <div className="text-sm text-gray-800">
                                  <ul className="list-disc pl-5 space-y-1">
                                    {doItems.map((item, i) => (
                                      <li key={i}>{item}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}
                            {dontItems.length > 0 && (
                              <div className="bg-red-50 p-3 rounded border border-red-100">
                                <h4 className="text-sm font-medium text-red-700 mb-2">Don&apos;t</h4>
                                <div className="text-sm text-gray-800">
                                  <ul className="list-disc pl-5 space-y-1">
                                    {dontItems.map((item, i) => (
                                      <li key={i}>{item}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      }
                    } catch (e) {
                      // If parsing fails, just show the string
                      console.error("Failed to parse dosDonts as JSON array:", e);
                    }
                    // Default fallback to text display
                    return <p className="text-sm bg-gray-50 p-3 rounded">{content.dosDonts}</p>;
                  })()
                ) : (
                  <p className="text-sm bg-gray-50 p-3 rounded">{content.dosDonts}</p>
                )
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {content.dosDonts.do && (
                    <div className="bg-green-50 p-3 rounded border border-green-100">
                      <h4 className="text-sm font-medium text-green-700 mb-2">Do</h4>
                      <div className="text-sm text-gray-800">
                        {typeof content.dosDonts.do === 'string' ? 
                          <p>{content.dosDonts.do}</p> : 
                          Array.isArray(content.dosDonts.do) ? 
                            <ul className="list-disc pl-5 space-y-1">
                              {content.dosDonts.do.map((item: string, i: number) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul> : 
                            <p>{JSON.stringify(content.dosDonts.do)}</p>
                        }
                      </div>
                    </div>
                  )}
                  {content.dosDonts.dont && (
                    <div className="bg-red-50 p-3 rounded border border-red-100">
                      <h4 className="text-sm font-medium text-red-700 mb-2">Don&apos;t</h4>
                      <div className="text-sm text-gray-800">
                        {typeof content.dosDonts.dont === 'string' ? 
                          <p>{content.dosDonts.dont}</p> : 
                          Array.isArray(content.dosDonts.dont) ? 
                            <ul className="list-disc pl-5 space-y-1">
                              {content.dosDonts.dont.map((item: string, i: number) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul> : 
                            <p>{JSON.stringify(content.dosDonts.dont)}</p>
                        }
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
      
      {isEditing && (
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex justify-end">
            <AIAssistant
              section={section}
              leadData={leadData}
              apolloData={apolloData}
              onContentGenerated={handleContentGenerated}
            />
          </div>
          
          {/* Debug view for content structure */}
          <details className="text-xs mt-2 border border-gray-200 p-2 rounded">
            <summary className="text-gray-500 cursor-pointer font-medium">Debug: View Raw Content Data</summary>
            <pre className="mt-2 p-2 bg-gray-50 overflow-auto max-h-60 rounded">
              {JSON.stringify(content, null, 2)}
            </pre>
          </details>
        </div>
      )}
      
      {/* Fallback renderer for any unexpected content structure */}
      {Object.entries(content).filter(([key]) => {
        // Skip rendering any suggestion or recommendation fields for sections that shouldn't show them
        if (!canShowRecommendations && 
            (key.toLowerCase().includes('recommendation') || 
             key.toLowerCase().includes('tip') || 
             key.toLowerCase().includes('suggestion') || 
             key.toLowerCase().includes('action') ||
             key.toLowerCase().includes('opportunity'))) {
          return false;
        }
        
        // Skip fields that are handled elsewhere
        return !['summary', 'keyPoints', 'description', 'marketPosition', 'challenges', 
          'competitors', 'mainCompetitors', 'competitiveAdvantage', 
          'technologies', 'currentTechnologies', 'painPoints', 'opportunities',
          'recentNews', 'relevantIndustryTrends', 
          'recommendations', 'recommendedActions',
          'suggestedAgenda', 'keyQuestions', 'preparationTips',
          'communicationPreferences', 'personalizationTips', 'dosDonts',
          'insufficient_data'
        ].includes(key);
      }).map(([key, value]) => {
        // Skip rendering for non-array/object data or empty arrays
        if (!value || (Array.isArray(value) && value.length === 0)) return null;
        
        return (
          <div key={key} className="mt-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
            </h3>
            
            {typeof value === 'string' && !isStringList(value) && (
              <EditableField
                value={value}
                onChange={(newValue) => handleContentChange(key, newValue)}
                isEditing={isEditing}
                multiline={true}
                className="text-sm bg-gray-50 p-3 rounded"
              />
            )}
            
            {typeof value === 'string' && isStringList(value) && (
              <ul className="space-y-1 pl-1">
                {stringToList(value).map((item, index) => {
                  const allItems = stringToList(value);
                  return (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <EditableField
                        value={item}
                        onChange={(newValue) => {
                          const updatedItems = [...allItems];
                          updatedItems[index] = newValue;
                          handleContentChange(key, updatedItems.join('\n'));
                        }}
                        isEditing={isEditing}
                        className="text-sm flex-1"
                      />
                    </li>
                  );
                })}
              </ul>
            )}
            
            {Array.isArray(value) && value.every(item => typeof item === 'string') && (
              <ul className="space-y-1 pl-1">
                {value.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <EditableField
                      value={item}
                      onChange={(newValue) => handleArrayItemChange(key, index, newValue)}
                      isEditing={isEditing}
                      className="text-sm flex-1"
                    />
                  </li>
                ))}
              </ul>
            )}
            
            {Array.isArray(value) && !value.every(item => typeof item === 'string') && (
              <div className="space-y-3">
                {value.map((item, index) => (
                  <div key={index} className="bg-white p-3 rounded border">
                    {Object.entries(item).map(([itemKey, itemValue]) => (
                      <div key={itemKey} className="mb-1">
                        <span className="font-medium text-sm">{itemKey.charAt(0).toUpperCase() + itemKey.slice(1)}: </span>
                        <EditableField
                          value={typeof itemValue === 'string' ? itemValue : JSON.stringify(itemValue)}
                          onChange={(newValue) => handleNestedContentChange(key, index, itemKey, newValue)}
                          isEditing={isEditing}
                          className="text-sm"
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
            
            {typeof value === 'object' && !Array.isArray(value) && (
              <div className="bg-white p-3 rounded border">
                {Object.entries(value).map(([objKey, objValue]) => (
                  <div key={objKey} className="mb-1">
                    <span className="font-medium text-sm">{objKey.charAt(0).toUpperCase() + objKey.slice(1)}: </span>
                    <EditableField
                      value={typeof objValue === 'string' ? objValue : JSON.stringify(objValue)}
                      onChange={(newValue) => {
                        const updatedNestedObj = {...value, [objKey]: newValue};
                        handleContentChange(key, updatedNestedObj as unknown as string);
                      }}
                      isEditing={isEditing}
                      className="text-sm"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Renderer functions for different section types
function renderOverviewContent(content: any) {
  return (
    <div className="space-y-4">
      {content.summary && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-gray-800">{content.summary}</p>
        </div>
      )}
      
      {content.keyPoints && content.keyPoints.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Key Points</h3>
          <ul className="space-y-2">
            {content.keyPoints.map((point: string, index: number) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function renderCompanyContent(content: any) {
  return (
    <div className="space-y-4">
      {content.description && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-gray-800">{content.description}</p>
        </div>
      )}
      
      {content.marketPosition && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Market Position</h3>
          <p className="text-gray-800">{content.marketPosition}</p>
        </div>
      )}
      
      {content.challenges && content.challenges.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Key Challenges</h3>
          <ul className="space-y-2">
            {content.challenges.map((challenge: string, index: number) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>{challenge}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function renderMeetingContent(content: any) {
  return (
    <div className="space-y-4">
      {content.summary && (
        <div>
          <h4 className="text-sm font-medium mb-2">Meeting Summary</h4>
          <p className="text-sm">{content.summary}</p>
        </div>
      )}
      
      {content.keyDiscussionPoints && content.keyDiscussionPoints.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Key Discussion Points</h4>
          <ul className="list-disc pl-5 text-sm space-y-1">
            {Array.isArray(content.keyDiscussionPoints) ? (
              content.keyDiscussionPoints.map((point: string, index: number) => (
                <li key={index}>{point}</li>
              ))
            ) : (
              <li>{content.keyDiscussionPoints}</li>
            )}
          </ul>
        </div>
      )}
      
      {content.nextSteps && (
        <div>
          <h4 className="text-sm font-medium mb-2">Next Steps</h4>
          <p className="text-sm">{content.nextSteps}</p>
        </div>
      )}
    </div>
  );
}

function renderInteractionsContent(content: any) {
  return (
    <div className="space-y-4">
      {content.history && content.history.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Interaction History</h4>
          <div className="space-y-2">
            {content.history.map((interaction: any, index: number) => (
              <div key={index} className="bg-gray-50 p-2 rounded-md">
                <div className="font-medium text-sm">{interaction.type}</div>
                <div className="text-xs mt-1">{interaction.description}</div>
                <div className="text-xs text-gray-500 mt-1">{interaction.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {content.insights && (
        <div>
          <h4 className="text-sm font-medium mb-2">Insights</h4>
          <p className="text-sm">{content.insights}</p>
        </div>
      )}
    </div>
  );
} 