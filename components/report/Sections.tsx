import React, { useState, useEffect } from 'react';
import { AIAssistant } from './AIAssistant';
import { EditableField } from './EditableField';

interface SectionProps {
  visible?: boolean;
  children: React.ReactNode;
}

export function OverviewSection({ children, visible = true }: { children: React.ReactNode; visible?: boolean }) {
  if (!visible) return null;
  return <div id="overview-section" className="section overview-section mb-8">{children}</div>;
}

export function CompanySection({ children, visible = true }: { children: React.ReactNode; visible?: boolean }) {
  if (!visible) return null;
  return <div id="company-section" className="section company-section mb-8">{children}</div>;
}

export function MeetingSection({ children, visible = true }: { children: React.ReactNode; visible?: boolean }) {
  if (!visible) return null;
  return <div id="meeting-section" className="section meeting-section mb-8">{children}</div>;
}

export function InteractionsSection({ children, visible = true }: { children: React.ReactNode; visible?: boolean }) {
  if (!visible) return null;
  return <div id="interactions-section" className="section interactions-section mb-8">{children}</div>;
}

export function CompetitorsSection({ children, visible = true }: { children: React.ReactNode; visible?: boolean }) {
  if (!visible) return null;
  return <div id="competitors-section" className="section competitors-section mb-8">{children}</div>;
}

export function TechStackSection({ children, visible = true }: { children: React.ReactNode; visible?: boolean }) {
  if (!visible) return null;
  return <div id="techStack-section" className="section tech-stack-section mb-8">{children}</div>;
}

export function NewsSection({ children, visible = true }: { children: React.ReactNode; visible?: boolean }) {
  if (!visible) return null;
  return <div id="news-section" className="section news-section mb-8">{children}</div>;
}

export function NextStepsSection({ children, visible = true }: { children: React.ReactNode; visible?: boolean }) {
  if (!visible) return null;
  return <div id="nextSteps-section" className="section next-steps-section mb-8">{children}</div>;
}

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
        <div className="p-4 text-amber-700 bg-amber-50 rounded-md flex items-start gap-2">
          <span>⚠️</span>
          <p className="text-sm">
            {content.message || "Insufficient data to generate AI insights for this section."}
          </p>
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
      
      {/* Section-specific content rendering */}
      {section === 'competitors' && content.competitors && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Competitors</h3>
          <div className="space-y-3">
            {content.competitors.map((competitor: any, index: number) => (
              <div key={index} className="bg-white p-3 rounded border">
                <h4 className="font-medium">{competitor.name}</h4>
                <p className="text-sm text-gray-600">{competitor.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {section === 'techStack' && content.technologies && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Technologies</h3>
          <div className="grid grid-cols-2 gap-2">
            {content.technologies.map((tech: any, index: number) => (
              <div key={index} className="bg-white p-3 rounded border">
                <h4 className="font-medium">{tech.name}</h4>
                <p className="text-sm text-gray-600">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {section === 'nextSteps' && content.recommendations && (
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

export function CompanyInfoCard({ 
  companyName, 
  industry, 
  employees, 
  headquarters, 
  website, 
  companyLogo, 
  companyDescription, 
  fundingStage, 
  fundingTotal,
  isEditing = false,
  onUpdate
}: { 
  companyName: string;
  industry: string;
  employees: string;
  headquarters: string;
  website: string;
  companyLogo?: string;
  companyDescription?: string;
  fundingStage?: string;
  fundingTotal?: string | number;
  isEditing?: boolean;
  onUpdate?: (field: string, value: string) => void;
}) {
  const handleUpdate = (field: string, value: string) => {
    if (onUpdate) {
      onUpdate(field, value);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Company Header with Logo and Name */}
      <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
        {companyLogo ? (
          <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-200">
            <img 
              src={companyLogo} 
              alt={`${companyName} logo`} 
              className="max-h-full max-w-full object-contain"
            />
          </div>
        ) : (
          <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">
              {companyName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <h3 className="font-semibold text-2xl text-gray-900">{companyName}</h3>
          {industry && (
            <p className="text-base text-gray-600 mt-1">{industry}</p>
          )}
        </div>
      </div>

      {/* Company Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h4 className="text-base font-medium text-gray-900 uppercase tracking-wide">Basic Information</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-900 uppercase tracking-wide">Industry</label>
                <div className="mt-1">
                  <EditableField 
                    value={industry} 
                    onChange={(value) => handleUpdate('industry', value)} 
                    isEditing={isEditing}
                    className="text-base font-medium text-gray-900"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Employees</label>
                <div className="mt-1">
                  <EditableField 
                    value={employees} 
                    onChange={(value) => handleUpdate('employees', value)} 
                    isEditing={isEditing}
                    className="text-base font-medium text-gray-900"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Headquarters</label>
                <div className="mt-1">
                  <EditableField 
                    value={headquarters} 
                    onChange={(value) => handleUpdate('headquarters', value)} 
                    isEditing={isEditing}
                    className="text-base font-medium text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div className="space-y-4">
          <h4 className="text-base font-medium text-gray-700 uppercase tracking-wide">Financial Information</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Funding Stage</label>
                <div className="mt-1">
                  <EditableField 
                    value={fundingStage || ''} 
                    onChange={(value) => handleUpdate('fundingStage', value)} 
                    isEditing={isEditing}
                    className="text-base font-medium text-gray-900"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Funding Total</label>
                <div className="mt-1">
                  <EditableField 
                    value={typeof fundingTotal === 'number' ? `$${fundingTotal.toLocaleString()}` : (fundingTotal || '')} 
                    onChange={(value) => handleUpdate('fundingTotal', value)} 
                    isEditing={isEditing}
                    className="text-base font-medium text-gray-900"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                </svg>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Website</label>
                <div className="mt-1">
                  <EditableField 
                    value={website} 
                    onChange={(value) => handleUpdate('website', value)} 
                    isEditing={isEditing}
                    className="text-base font-medium text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Description */}
      {companyDescription && (
        <div className="pt-4 border-t border-gray-100">
          <h4 className="text-base font-medium text-gray-700 uppercase tracking-wide mb-3">Company Description</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <EditableField 
              value={companyDescription} 
              onChange={(value) => handleUpdate('companyDescription', value)} 
              isEditing={isEditing}
              multiline={true}
              className="text-base text-gray-700 leading-relaxed"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function ReportGridLayout({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>;
} 