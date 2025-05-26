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

  useEffect(() => {
    if (existingContent) {
      setContent(existingContent);
    }
  }, [existingContent]);

  const handleContentGenerated = (newContent: any) => {
    setContent(newContent);
    if (onContentUpdate) {
      onContentUpdate(newContent);
    }
  };

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
      
      {/* Company-specific content */}
      {section === 'company' && (
        <>
          {content.description && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Company Overview</h3>
              <div className="bg-blue-50/50 p-4 rounded-lg">
                <p className="text-gray-800">{content.description}</p>
              </div>
            </div>
          )}
          
          {content.marketPosition && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Market Position</h3>
              <div className="bg-white p-4 rounded border">
                <p className="text-gray-800">{content.marketPosition}</p>
              </div>
            </div>
          )}
          
          {content.challenges && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Key Challenges</h3>
              {Array.isArray(content.challenges) ? (
                <ul className="space-y-2 pl-1">
                  {content.challenges.map((challenge: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>{challenge}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="bg-white p-4 rounded border">
                  <p className="text-gray-800">{content.challenges}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Add a note about industry insights if data was limited */}
          {content.isGeneralInsight && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 italic">
                Note: Some insights are based on general industry knowledge due to limited specific company information.
              </p>
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
                <ul className="space-y-2 pl-1">
                  {(content.competitors || content.mainCompetitors).map((competitor: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>{competitor}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="space-y-3">
                  {(content.competitors || content.mainCompetitors || []).map((competitor: any, index: number) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      {typeof competitor === 'string' ? (
                        <p className="text-gray-800">{competitor}</p>
                      ) : (
                        <>
                          <h4 className="font-medium">{competitor.name}</h4>
                          {competitor.description && (
                            <p className="text-sm text-gray-600 mt-1">{competitor.description}</p>
                          )}
                          {competitor.strengths && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-gray-500">Strengths:</p>
                              <p className="text-sm text-gray-600">{competitor.strengths}</p>
                            </div>
                          )}
                          {competitor.weaknesses && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-gray-500">Weaknesses:</p>
                              <p className="text-sm text-gray-600">{competitor.weaknesses}</p>
                            </div>
                          )}
                        </>
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
                <p className="text-gray-800">{content.marketDynamics}</p>
              </div>
            </div>
          )}
          
          {content.competitiveAdvantage && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Our Competitive Advantage</h3>
              <div className="bg-blue-50 p-3 rounded border">
                <p className="text-gray-800 whitespace-normal break-words hyphens-auto" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                  {content.competitiveAdvantage}
                </p>
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
                    {tech}
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
                <ul className="space-y-2 pl-1">
                  {ensureArray(content.painPoints).map((point: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span className="text-sm">{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          
          {content.opportunities && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Opportunities</h3>
              {typeof content.opportunities === 'string' && !isStringList(content.opportunities) ? (
                <p className="text-sm bg-gray-50 p-3 rounded">{content.opportunities}</p>
              ) : (
                <ul className="space-y-2 pl-1">
                  {ensureArray(content.opportunities).map((opportunity: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span className="text-sm">{opportunity}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          
          {content.recommendations && content.recommendations.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Recommendations</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <ul className="space-y-2 pl-1">
                  {content.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2">→</span>
                      <span className="text-sm">{rec}</span>
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
                    <h4 className="font-medium">{typeof tech === 'string' ? tech : tech.name}</h4>
                    {typeof tech !== 'string' && tech.description && (
                      <p className="text-sm text-gray-600">{tech.description}</p>
                    )}
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
                    <h4 className="font-medium">{news.title}</h4>
                    {news.date && <p className="text-xs text-gray-500">{news.date}</p>}
                    {news.source && <p className="text-xs text-gray-500">Source: {news.source}</p>}
                    {news.summary && <p className="text-sm text-gray-600 mt-1">{news.summary}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {content.relevantIndustryTrends && content.relevantIndustryTrends.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Industry Trends</h3>
              <ul className="space-y-2">
                {content.relevantIndustryTrends.map((trend: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>{trend}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
      
      {section === 'nextSteps' && (
        <>
          {/* For array of objects with description, rationale and priority properties */}
          {Array.isArray(content.recommendedActions) && content.recommendedActions.length > 0 && 
           typeof content.recommendedActions[0] === 'object' && 'description' in content.recommendedActions[0] && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Recommended Actions</h3>
              <div className="space-y-3">
                {content.recommendedActions.map((action: any, index: number) => (
                  <div key={index} className="bg-white p-4 rounded border">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-gray-900">{action.description}</h4>
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
                    {action.rationale && (
                      <p className="text-sm text-gray-600 mt-2">{action.rationale}</p>
                    )}
                    {action.dueDate && (
                      <p className="text-xs text-gray-500 mt-1">Due: {action.dueDate}</p>
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
                {content.recommendedActions.map((action: string, index: number) => (
                  <div key={index} className="bg-white p-3 rounded border">
                    <p className="text-gray-800">{action}</p>
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
                {content.recommendations.map((rec: any, index: number) => (
                  <div key={index} className="bg-white p-3 rounded border">
                    <h4 className="font-medium">{rec.title}</h4>
                    <p className="text-sm text-gray-600">{rec.description}</p>
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
              <ul className="space-y-2">
                {content.keyQuestions.map((question: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>{question}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {content.preparationTips && (
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
              <p className="text-sm bg-gray-50 p-3 rounded">{content.communicationPreferences}</p>
            </div>
          )}
          
          {content.personalizationTips && content.personalizationTips.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Personalization Tips</h3>
              <ul className="space-y-2">
                {content.personalizationTips.map((tip: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {content.dosDonts && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Dos and Don&apos;ts</h3>
              <p className="text-sm bg-gray-50 p-3 rounded">{content.dosDonts}</p>
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
      {Object.entries(content).filter(([key]) => 
        !['summary', 'keyPoints', 'description', 'marketPosition', 'challenges', 
          'competitors', 'mainCompetitors', 'competitiveAdvantage', 
          'technologies', 'currentTechnologies', 'painPoints', 'opportunities',
          'recentNews', 'relevantIndustryTrends', 
          'recommendations', 'recommendedActions',
          'suggestedAgenda', 'keyQuestions', 'preparationTips',
          'communicationPreferences', 'personalizationTips', 'dosDonts',
          'insufficient_data'
        ].includes(key)
      ).map(([key, value]) => {
        // Skip rendering for non-array/object data or empty arrays
        if (!value || (Array.isArray(value) && value.length === 0)) return null;
        
        return (
          <div key={key} className="mt-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
            </h3>
            
            {typeof value === 'string' && !isStringList(value) && (
              <p className="text-sm bg-gray-50 p-3 rounded">{value}</p>
            )}
            
            {typeof value === 'string' && isStringList(value) && (
              <ul className="space-y-2 pl-1">
                {stringToList(value).map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            )}
            
            {Array.isArray(value) && value.length > 0 && (
              <div>
                {value.every(item => typeof item === 'string') ? (
                  <ul className="space-y-2 pl-1">
                    {value.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="space-y-3">
                    {value.map((item, index) => (
                      <div key={index} className="bg-white p-3 rounded border">
                        {typeof item === 'string' ? (
                          <p>{item}</p>
                        ) : (
                          <div>
                            {Object.entries(item).map(([itemKey, itemValue]) => (
                              <div key={itemKey} className="mb-1">
                                <span className="font-medium text-sm">{itemKey.charAt(0).toUpperCase() + itemKey.slice(1)}: </span>
                                <span className="text-sm">{String(itemValue)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {typeof value === 'object' && !Array.isArray(value) && (
              <div className="bg-white p-3 rounded border">
                {Object.entries(value).map(([objKey, objValue]) => (
                  <div key={objKey} className="mb-1">
                    <span className="font-medium text-sm">{objKey.charAt(0).toUpperCase() + objKey.slice(1)}: </span>
                    <span className="text-sm">{typeof objValue === 'string' ? objValue : JSON.stringify(objValue)}</span>
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