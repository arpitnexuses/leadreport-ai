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

  // Add this helper function before the renderOverviewContent function
  const renderSafeObject = (obj: any) => {
    if (!obj) return null;
    
    // Handle arrays
    if (Array.isArray(obj)) {
      return (
        <ul className="space-y-1 pl-1">
          {obj.map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>{typeof item === 'string' ? item : renderSafeObject(item)}</span>
            </li>
          ))}
        </ul>
      );
    }
    
    // Handle objects (including those with numeric keys)
    if (typeof obj === 'object') {
      return (
        <div className="bg-white p-3 rounded border">
          {Object.entries(obj).map(([key, value], index) => (
            <div key={index} className="mb-1">
              <span className="font-medium text-sm">{key.charAt(0).toUpperCase() + key.slice(1)}: </span>
              <span>{typeof value === 'string' ? value : renderSafeObject(value)}</span>
            </div>
          ))}
        </div>
      );
    }
    
    // For primitive types
    return String(obj);
  };

  // Helper function to check if an object has numeric keys (like {"0": "value1", "1": "value2"})
  const hasNumericKeys = (obj: any): boolean => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
    return Object.keys(obj).every(key => !isNaN(Number(key)));
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
              {content.message || "The AI analysis is based on limited information and may not be fully accurate."}
            </p>
            <p className="text-sm mt-2 text-amber-600">
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
      <div className="bg-gray-50 p-2 rounded-md text-sm text-gray-500 flex items-start gap-2">
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
            value={typeof content.summary === 'string' 
              ? content.summary
              : typeof content.summary === 'object' && !Array.isArray(content.summary)
                ? JSON.stringify(content.summary)
                : String(content.summary)}
            onChange={(value) => handleContentChange('summary', value)}
            isEditing={isEditing}
            multiline={true}
            className="text-gray-800"
          />
        </div>
      )}
      
      {/* Handle specific case of insufficient_data flag */}
      {content.insufficient_data && (
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-4">
          <p className="text-amber-700 font-medium flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
            </svg>
            Limited Information
          </p>
          <p className="text-amber-700 text-sm mt-2">
            {content.message || "The AI analysis is based on limited information and may not be fully accurate."}
          </p>
        </div>
      )}
      
      {content.keyPoints && content.keyPoints.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Key Points</h3>
          <ul className="space-y-2">
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
      
      {content.keyPoints && !Array.isArray(content.keyPoints) && typeof content.keyPoints === 'object' && content.keyPoints !== null && hasNumericKeys(content.keyPoints) && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Key Points</h3>
          <ul className="space-y-2">
            {Object.values(content.keyPoints).map((point: any, index: number) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>{typeof point === 'string' ? point.replace(/^\d+:\s*/, '') : point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {content.keyPoints && typeof content.keyPoints === 'string' && content.keyPoints.startsWith('[') && content.keyPoints.endsWith(']') && (
        (() => {
          try {
            // Try to parse the string as JSON array
            const parsedPoints = JSON.parse(content.keyPoints);
            if (Array.isArray(parsedPoints)) {
              return (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Key Points</h3>
                  <ul className="space-y-2">
                    {parsedPoints.map((point, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }
          } catch (e) {
            console.error("Failed to parse keyPoints as JSON array:", e);
          }
          return null;
        })()
      )}
      
      {/* Use specialized components for specific sections */}
      {section === 'techStack' && (
        <TechStackContent 
          content={content} 
          isEditing={isEditing}
          onContentChange={handleContentChange}
          onArrayItemChange={handleArrayItemChange}
          onNestedContentChange={handleNestedContentChange}
        />
      )}
      
      {section === 'news' && (
        <NewsContent 
          content={content}
          isEditing={isEditing}
          onContentChange={handleContentChange}
          onArrayItemChange={handleArrayItemChange}
          onNestedContentChange={handleNestedContentChange}
        />
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
              ) : hasNumericKeys(content.challenges) ? (
                <ul className="space-y-1 pl-1">
                  {Object.values(content.challenges).map((challenge: any, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>{typeof challenge === 'string' ? challenge.replace(/^\d+:\s*/, '') : challenge}</span>
                    </li>
                  ))}
                </ul>
              ) : typeof content.challenges === 'string' && (content.challenges.startsWith('[') && content.challenges.endsWith(']')) ? (
                (() => {
                  try {
                    // Try to parse the string as JSON array
                    const parsedChallenges = JSON.parse(content.challenges);
                    if (Array.isArray(parsedChallenges)) {
                      return (
                        <ul className="space-y-1 pl-1">
                          {parsedChallenges.map((challenge, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
                              <span>{challenge}</span>
                            </li>
                          ))}
                        </ul>
                      );
                    }
                  } catch (e) {
                    // If parsing fails, fall back to regular string display
                    console.error("Failed to parse challenges as JSON array:", e);
                  }
                  // Default fallback
                  return (
                    <div className="bg-white p-4 rounded border">
                      <EditableField
                        value={content.challenges}
                        onChange={(value) => handleContentChange('challenges', value)}
                        isEditing={isEditing}
                        multiline={true}
                        className="text-gray-800"
                      />
                    </div>
                  );
                })()
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
              
              {/* Get the appropriate competitor data, ensuring it's an array */}
              {(() => {
                const competitorsData = content.mainCompetitors || content.competitors;
                const competitorsKey = content.mainCompetitors ? 'mainCompetitors' : 'competitors';
                
                // Check if it's array-like but not actually an array (possibly the cause of the error)
                if (competitorsData && typeof competitorsData === 'object' && !Array.isArray(competitorsData)) {
                  // Could be an object with numeric keys - convert to array
                  if (Object.keys(competitorsData).every(key => !isNaN(Number(key)))) {
                    const asArray = Object.values(competitorsData);
                    
                    // Render as string array or object array
                    if (asArray.length > 0 && typeof asArray[0] === 'string') {
                      return (
                        <ul className="space-y-1 pl-1">
                          {asArray.map((competitor, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
                              <EditableField
                                value={competitor as string}
                                onChange={(value) => handleArrayItemChange(competitorsKey, index, value)}
                                isEditing={isEditing}
                                className="flex-1"
                              />
                            </li>
                          ))}
                        </ul>
                      );
                    } else {
                      return (
                        <div className="space-y-3">
                          {(asArray as any[]).map((competitor, index) => (
                            <div key={index} className="bg-white p-3 rounded border">
                              <h4 className="font-medium">
                                <EditableField
                                  value={competitor.name}
                                  onChange={(value) => handleNestedContentChange(competitorsKey, index, 'name', value)}
                                  isEditing={isEditing}
                                />
                              </h4>
                              <EditableField
                                value={competitor.description}
                                onChange={(value) => handleNestedContentChange(competitorsKey, index, 'description', value)}
                                isEditing={isEditing}
                                multiline={true}
                                className="text-sm text-gray-600"
                              />
                              {competitor.strengths && (
                                <div className="mt-2">
                                  <p className="text-sm font-medium text-gray-500">Strengths:</p>
                                  <EditableField
                                    value={competitor.strengths}
                                    onChange={(value) => handleNestedContentChange(competitorsKey, index, 'strengths', value)}
                                    isEditing={isEditing}
                                    multiline={true}
                                    className="text-sm text-gray-600"
                                  />
                                </div>
                              )}
                              {competitor.weaknesses && (
                                <div className="mt-2">
                                  <p className="text-sm font-medium text-gray-500">Weaknesses:</p>
                                  <EditableField
                                    value={competitor.weaknesses}
                                    onChange={(value) => handleNestedContentChange(competitorsKey, index, 'weaknesses', value)}
                                    isEditing={isEditing}
                                    multiline={true}
                                    className="text-sm text-gray-600"
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    }
                  } else {
                    // Just a regular non-array object, render as is
                    return (
                      <div className="bg-white p-3 rounded border">
                        <EditableField
                          value={competitorsData}
                          onChange={(value) => handleContentChange(competitorsKey, value)}
                          isEditing={isEditing}
                          multiline={true}
                          className="text-gray-800"
                        />
                      </div>
                    );
                  }
                }
                
                // Handle properly formed arrays
                if (Array.isArray(competitorsData) && competitorsData.length > 0) {
                  if (typeof competitorsData[0] === 'string') {
                    return (
                      <ul className="space-y-1 pl-1">
                        {competitorsData.map((competitor, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            <EditableField
                              value={competitor as string}
                              onChange={(value) => handleArrayItemChange(competitorsKey, index, value)}
                              isEditing={isEditing}
                              className="flex-1"
                            />
                          </li>
                        ))}
                      </ul>
                    );
                  } else {
                    return (
                      <div className="space-y-3">
                        {(competitorsData as any[]).map((competitor, index) => (
                          <div key={index} className="bg-white p-3 rounded border">
                            <h4 className="font-medium">
                              <EditableField
                                value={competitor.name}
                                onChange={(value) => handleNestedContentChange(competitorsKey, index, 'name', value)}
                                isEditing={isEditing}
                              />
                            </h4>
                            <EditableField
                              value={competitor.description}
                              onChange={(value) => handleNestedContentChange(competitorsKey, index, 'description', value)}
                              isEditing={isEditing}
                              multiline={true}
                              className="text-sm text-gray-600"
                            />
                            {competitor.strengths && (
                              <div className="mt-2">
                                <p className="text-sm font-medium text-gray-500">Strengths:</p>
                                <EditableField
                                  value={competitor.strengths}
                                  onChange={(value) => handleNestedContentChange(competitorsKey, index, 'strengths', value)}
                                  isEditing={isEditing}
                                  multiline={true}
                                  className="text-sm text-gray-600"
                                />
                              </div>
                            )}
                            {competitor.weaknesses && (
                              <div className="mt-2">
                                <p className="text-sm font-medium text-gray-500">Weaknesses:</p>
                                <EditableField
                                  value={competitor.weaknesses}
                                  onChange={(value) => handleNestedContentChange(competitorsKey, index, 'weaknesses', value)}
                                  isEditing={isEditing}
                                  multiline={true}
                                  className="text-sm text-gray-600"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  }
                }
                
                // Fallback for empty or invalid data
                return (
                  <div className="text-gray-500 italic py-2">
                    No competitor information available
                  </div>
                );
              })()}
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
      
      {section === 'nextSteps' && canShowRecommendations && (
        <>
          {/* For array of objects with description, rationale and priority properties */}
          {Array.isArray(content.recommendedActions) && content.recommendedActions.length > 0 && 
           typeof content.recommendedActions[0] === 'object' && 'description' in content.recommendedActions[0] && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Recommended Actions</h3>
              </div>
              <div className="space-y-4">
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
                  <div key={index} className="group relative bg-gradient-to-r from-white to-gray-50 p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start gap-4">
                      {/* Priority indicator */}
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-2 ${
                        action.priority?.toLowerCase() === 'high' 
                          ? 'bg-gradient-to-r from-red-500 to-red-600' 
                          : action.priority?.toLowerCase() === 'medium'
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                          : 'bg-gradient-to-r from-green-500 to-emerald-600'
                      }`} />
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900 leading-relaxed">
                            <EditableField
                              value={action.description}
                              onChange={(value) => handleNestedContentChange('recommendedActions', index, 'description', value)}
                              isEditing={isEditing}
                            />
                          </h4>
                          {action.priority && (
                            <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                              action.priority.toLowerCase() === 'high' 
                                ? 'bg-red-100 text-red-700 border border-red-200' 
                                : action.priority.toLowerCase() === 'medium'
                                ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                : 'bg-green-100 text-green-700 border border-green-200'
                            }`}>
                              {action.priority}
                            </span>
                          )}
                        </div>
                        
                        {action.rationale && !action.rationale.includes('Ekansh') && !action.rationale.includes('Kandulna') && (
                          <div className="bg-blue-50 border-l-4 border-blue-200 p-3 rounded-r-lg">
                            <EditableField
                              value={action.rationale}
                              onChange={(value) => handleNestedContentChange('recommendedActions', index, 'rationale', value)}
                              isEditing={isEditing}
                              multiline={true}
                              className="text-sm text-gray-700 leading-relaxed"
                            />
                          </div>
                        )}
                        
                        {action.dueDate && (
                          <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <EditableField
                              value={action.dueDate}
                              onChange={(value) => handleNestedContentChange('recommendedActions', index, 'dueDate', value)}
                              isEditing={isEditing}
                              className="text-gray-600"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* For array of strings (the format seen in the screenshot) */}
          {Array.isArray(content.recommendedActions) && content.recommendedActions.length > 0 && 
           typeof content.recommendedActions[0] === 'string' && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Recommended Actions</h3>
              </div>
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
                  <div key={index} className="group relative bg-gradient-to-r from-white to-gray-50 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                      <EditableField
                        value={action}
                        onChange={(value) => handleArrayItemChange('recommendedActions', index, value)}
                        isEditing={isEditing}
                        className="text-gray-800 font-medium leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* For object with numeric keys (like {"0": {...}, "1": {...}}) */}
          {!Array.isArray(content.recommendedActions) && 
           typeof content.recommendedActions === 'object' && 
           content.recommendedActions !== null &&
           hasNumericKeys(content.recommendedActions) && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Recommended Actions</h3>
              </div>
              <div className="space-y-4">
                {Object.values(content.recommendedActions)
                  .filter((action: any) => 
                    typeof action === 'object' &&
                    !action.description?.includes('Ekansh') && 
                    !action.description?.includes('Kandulna') && 
                    !action.description?.includes('Software Engineer') &&
                    !action.description?.includes('Nexuses') &&
                    !action.description?.includes('B2B Growth Agency')
                  )
                  .map((action: any, index: number) => (
                  <div key={index} className="group relative bg-gradient-to-r from-white to-gray-50 p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start gap-4">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-2 ${
                        action.priority?.toLowerCase() === 'high' 
                          ? 'bg-gradient-to-r from-red-500 to-red-600' 
                          : action.priority?.toLowerCase() === 'medium'
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                          : 'bg-gradient-to-r from-green-500 to-emerald-600'
                      }`} />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900 leading-relaxed">
                            {action.description}
                          </h4>
                          {action.priority && (
                            <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                              action.priority.toLowerCase() === 'high' 
                                ? 'bg-red-100 text-red-700 border border-red-200' 
                                : action.priority.toLowerCase() === 'medium'
                                ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                : 'bg-green-100 text-green-700 border border-green-200'
                            }`}>
                              {action.priority}
                            </span>
                          )}
                        </div>
                        
                        {action.rationale && !action.rationale.includes('Ekansh') && !action.rationale.includes('Kandulna') && (
                          <div className="bg-blue-50 border-l-4 border-blue-200 p-3 rounded-r-lg">
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {action.rationale}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* For other object formats (not array, not numeric keys) */}
          {!Array.isArray(content.recommendedActions) && 
           typeof content.recommendedActions === 'object' && 
           content.recommendedActions !== null &&
           !hasNumericKeys(content.recommendedActions) && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Recommended Actions</h3>
              </div>
              <div className="space-y-4">
                {Object.entries(content.recommendedActions).map(([key, value], index) => {
                  // Value could be a string, an object, or any other type
                  if (typeof value === 'object' && value !== null) {
                    // Format similar to the object rendering above
                    return (
                      <div key={index} className="group relative bg-gradient-to-r from-white to-gray-50 p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                        <div className="flex items-start gap-4">
                          <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900 leading-relaxed">
                                {(value as any).description || key}
                              </h4>
                              {(value as any).priority && (
                                <span className="text-sm font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                                  {(value as any).priority}
                                </span>
                              )}
                            </div>
                            
                            {(value as any).rationale && (
                              <div className="bg-blue-50 border-l-4 border-blue-200 p-3 rounded-r-lg">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {(value as any).rationale}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    // For simple key-value pairs
                    return (
                      <div key={index} className="group relative bg-gradient-to-r from-white to-gray-50 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{key}</div>
                            <div className="text-sm text-gray-600 mt-1 leading-relaxed">
                              {typeof value === 'string' ? value : JSON.stringify(value)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          )}
          
          {/* Previous recommendations format support */}
          {content.recommendations && content.recommendations.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Recommended Actions</h3>
              </div>
              <div className="space-y-4">
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
                  <div key={index} className="group relative bg-gradient-to-r from-white to-gray-50 p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start gap-4">
                      <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 mb-2 leading-relaxed">
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
                          className="text-sm text-gray-600 leading-relaxed"
                        />
                      </div>
                    </div>
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
          ) : hasNumericKeys(content.personalizationTips) ? (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Personalization Tips</h3>
              <ul className="space-y-1">
                {Object.values(content.personalizationTips).map((tip: any, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>{typeof tip === 'string' ? tip : JSON.stringify(tip)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : content.personalizationTips ? (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Personalization Tips</h3>
              <div className="bg-white p-4 rounded border">
                <EditableField
                  value={typeof content.personalizationTips === 'string' 
                    ? content.personalizationTips 
                    : JSON.stringify(content.personalizationTips)}
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
                          item.toLowerCase().startsWith("don&apos;t ") || 
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
                                      <li key={i}>{item.replace(/^do\s+/i, '')}</li>
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
                                      <li key={i}>{item.replace(/^don'?t\s+|^avoid\s+|^never\s+/i, '')}</li>
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
              ) : hasNumericKeys(content.dosDonts) ? (
                // Handle case where dosDonts is an object with numeric keys
                <div className="space-y-3">
                  {Object.entries(content.dosDonts).map(([key, value]) => {
                    const item = String(value);
                    const isDo = item.toLowerCase().startsWith("do ") || 
                                  item.toLowerCase().startsWith("always ") || 
                                  item.toLowerCase().startsWith("use ");
                    const isDont = item.toLowerCase().startsWith("don&apos;t ") || 
                                   item.toLowerCase().startsWith("avoid ") || 
                                   item.toLowerCase().startsWith("never ") ||
                                   item.toLowerCase().startsWith("don't ");
                    
                    if (isDo) {
                      return (
                        <div key={key} className="bg-green-50 p-3 rounded border border-green-100">
                          <span className="text-green-700 font-medium">Do: </span>
                          <span>{item.replace(/^do\s+|^always\s+|^use\s+/i, '').replace(/^\d+:\s*/, '')}</span>
                        </div>
                      );
                    } else if (isDont) {
                      return (
                        <div key={key} className="bg-red-50 p-3 rounded border border-red-100">
                          <span className="text-red-700 font-medium">Don&apos;t: </span>
                          <span>{item.replace(/^don(?:'|&apos;)?t\s+|^avoid\s+|^never\s+/i, '').replace(/^\d+:\s*/, '')}</span>
                        </div>
                      );
                    } else {
                      return (
                        <div key={key} className="bg-gray-50 p-3 rounded">
                          <span>{item.replace(/^\d+:\s*/, '')}</span>
                        </div>
                      );
                    }
                  })}
                </div>
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
                              {Object.values(content.dosDonts.do).map((item: any, i: number) => (
                                <li key={i}>{typeof item === 'string' ? item.replace(/^\d+:\s*/, '') : item}</li>
                              ))}
                            </ul> : 
                            hasNumericKeys(content.dosDonts.do) ?
                            <ul className="list-disc pl-5 space-y-1">
                              {Object.values(content.dosDonts.do).map((item: any, i: number) => (
                                <li key={i}>{typeof item === 'string' ? item.replace(/^\d+:\s*/, '') : item}</li>
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
                              {Object.values(content.dosDonts.dont).map((item: any, i: number) => (
                                <li key={i}>{typeof item === 'string' ? item.replace(/^\d+:\s*/, '') : item}</li>
                              ))}
                            </ul> : 
                            hasNumericKeys(content.dosDonts.dont) ?
                            <ul className="list-disc pl-5 space-y-1">
                              {Object.values(content.dosDonts.dont).map((item: any, i: number) => (
                                <li key={i}>{typeof item === 'string' ? item.replace(/^\d+:\s*/, '') : item}</li>
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
          <details className="text-sm mt-2 border border-gray-200 p-2 rounded">
            <summary className="text-gray-500 cursor-pointer font-medium">Debug: View Raw Content Data</summary>
            <div className="mt-2 p-2 bg-gray-50 overflow-auto rounded">
              <div className="mb-2">
                <span className="font-bold">Section:</span> {section}
              </div>
              {content && Object.keys(content).map(key => (
                <div key={key} className="mb-3">
                  <div className="font-bold text-blue-600">{key}:</div>
                  <div className="pl-4 border-l-2 border-gray-200 ml-2">
                    <pre className="whitespace-pre-wrap">
                      {typeof content[key] === 'object' 
                        ? JSON.stringify(content[key], null, 2) 
                        : content[key]}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
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
            
            {typeof value === 'object' && !Array.isArray(value) && (
              <div className="bg-white p-3 rounded border">
                {Object.entries(value).map(([objKey, objValue], index) => (
                  <div key={index} className="mb-1">
                    <span className="font-medium text-sm">{objKey.charAt(0).toUpperCase() + objKey.slice(1)}: </span>
                    {isEditing ? (
                      <EditableField
                        value={typeof objValue === 'string' ? objValue : JSON.stringify(objValue)}
                        onChange={(newValue) => {
                          const updatedNestedObj = {...value, [objKey]: newValue};
                          handleContentChange(key, updatedNestedObj as unknown as string);
                        }}
                        isEditing={isEditing}
                        className="text-sm"
                      />
                    ) : (
                      typeof objValue === 'string' ? objValue : renderSafeObject(objValue)
                    )}
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
                <div className="text-sm mt-1">{interaction.description}</div>
                <div className="text-sm text-gray-500 mt-1">{interaction.date}</div>
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