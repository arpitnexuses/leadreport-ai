import React, { useState, useEffect } from 'react';
import { AIAssistant } from './AIAssistant';

interface SectionProps {
  visible?: boolean;
  children: React.ReactNode;
}

export function OverviewSection({ visible = true, children }: SectionProps) {
  if (!visible) return null;
  return <div className="section overview-section mb-8">{children}</div>;
}

export function CompanySection({ visible = true, children }: SectionProps) {
  if (!visible) return null;
  return <div className="section company-section mb-8">{children}</div>;
}

export function MeetingSection({ visible = true, children }: SectionProps) {
  if (!visible) return null;
  return <div className="section meeting-section mb-8">{children}</div>;
}

export function InteractionsSection({ visible = true, children }: SectionProps) {
  if (!visible) return null;
  return <div className="section interactions-section mb-8">{children}</div>;
}

export function CompetitorsSection({ visible = true, children }: SectionProps) {
  if (!visible) return null;
  return <div className="section competitors-section mb-8">{children}</div>;
}

export function TechStackSection({ visible = true, children }: SectionProps) {
  if (!visible) return null;
  return <div className="section tech-stack-section mb-8">{children}</div>;
}

export function NewsSection({ visible = true, children }: SectionProps) {
  if (!visible) return null;
  return <div className="section news-section mb-8">{children}</div>;
}

export function NextStepsSection({ visible = true, children }: SectionProps) {
  if (!visible) return null;
  return <div className="section next-steps-section mb-8">{children}</div>;
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

export function CompanyInfoCard({ companyName, industry, employees, headquarters, website, companyLogo, companyDescription, fundingStage, fundingTotal }: { 
  companyName: string;
  industry: string;
  employees: string;
  headquarters: string;
  website: string;
  companyLogo: string;
  companyDescription: string;
  fundingStage: string;
  fundingTotal: string | number;
}) {
  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <h3 className="font-semibold text-lg mb-2">Company Info: {companyName}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p><strong>Industry:</strong> {industry}</p>
          <p><strong>Employees:</strong> {employees}</p>
          <p><strong>Headquarters:</strong> {headquarters}</p>
          <p><strong>Website:</strong> {website}</p>
        </div>
        <div>
          <p><strong>Funding Stage:</strong> {fundingStage}</p>
          <p><strong>Funding Total:</strong> {typeof fundingTotal === 'number' ? `$${fundingTotal.toLocaleString()}` : fundingTotal}</p>
        </div>
      </div>
      {companyDescription && (
        <div className="mt-4">
          <h4 className="font-medium">Description</h4>
          <p className="text-sm">{companyDescription}</p>
        </div>
      )}
    </div>
  );
}

export function ReportGridLayout({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>;
} 