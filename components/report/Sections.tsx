import React, { useState, useEffect } from 'react';
import { AIAssistant } from './AIAssistant';
import { EditableField } from './EditableField';

interface SectionProps {
  visible?: boolean;
  children: React.ReactNode;
}

export function OverviewSection({ children, visible = true }: { children: React.ReactNode; visible?: boolean }) {
  if (!visible) return null;
  return <div className="section overview-section mb-8">{children}</div>;
}

export function CompanySection({ children, visible = true }: { children: React.ReactNode; visible?: boolean }) {
  if (!visible) return null;
  return <div className="section company-section mb-8">{children}</div>;
}

export function MeetingSection({ children, visible = true }: { children: React.ReactNode; visible?: boolean }) {
  if (!visible) return null;
  return <div className="section meeting-section mb-8">{children}</div>;
}

export function InteractionsSection({ children, visible = true }: { children: React.ReactNode; visible?: boolean }) {
  if (!visible) return null;
  return <div className="section interactions-section mb-8">{children}</div>;
}

export function CompetitorsSection({ children, visible = true }: { children: React.ReactNode; visible?: boolean }) {
  if (!visible) return null;
  return <div className="section competitors-section mb-8">{children}</div>;
}

export function TechStackSection({ children, visible = true }: { children: React.ReactNode; visible?: boolean }) {
  if (!visible) return null;
  return <div className="section tech-stack-section mb-8">{children}</div>;
}

export function NewsSection({ children, visible = true }: { children: React.ReactNode; visible?: boolean }) {
  if (!visible) return null;
  return <div className="section news-section mb-8">{children}</div>;
}

export function NextStepsSection({ children, visible = true }: { children: React.ReactNode; visible?: boolean }) {
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
    <div>
      <div className="flex items-center gap-4 mb-4">
        {companyLogo && (
          <div className="h-16 w-16 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
            <img 
              src={companyLogo} 
              alt={`${companyName} logo`} 
              className="max-h-full max-w-full object-contain"
            />
          </div>
        )}
        <h3 className="font-semibold text-lg">Company Info: {companyName}</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p><strong>Industry:</strong> <EditableField value={industry} onChange={(value) => handleUpdate('industry', value)} isEditing={isEditing} /></p>
          <p><strong>Employees:</strong> <EditableField value={employees} onChange={(value) => handleUpdate('employees', value)} isEditing={isEditing} /></p>
          <p><strong>Headquarters:</strong> <EditableField value={headquarters} onChange={(value) => handleUpdate('headquarters', value)} isEditing={isEditing} /></p>
          <p><strong>Website:</strong> <EditableField value={website} onChange={(value) => handleUpdate('website', value)} isEditing={isEditing} /></p>
        </div>
        <div>
          <p><strong>Funding Stage:</strong> <EditableField value={fundingStage} onChange={(value) => handleUpdate('fundingStage', value)} isEditing={isEditing} /></p>
          <p><strong>Funding Total:</strong> <EditableField value={typeof fundingTotal === 'number' ? `$${fundingTotal.toLocaleString()}` : fundingTotal} onChange={(value) => handleUpdate('fundingTotal', value)} isEditing={isEditing} /></p>
        </div>
      </div>
      {companyDescription && (
        <div className="mt-4">
          <h4 className="font-medium">Description</h4>
          <EditableField 
            value={companyDescription} 
            onChange={(value) => handleUpdate('companyDescription', value)} 
            isEditing={isEditing}
            multiline={true}
            className="text-sm"
          />
        </div>
      )}
    </div>
  );
}

export function ReportGridLayout({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>;
} 