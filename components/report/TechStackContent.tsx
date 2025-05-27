import React from 'react';
import { Badge } from "@/components/ui/badge";
import { EditableField } from "./EditableField";
import { isStringList, ensureArray } from "@/lib/report-content-enhancer";

interface TechStackContentProps {
  content: any;
  isEditing?: boolean;
  onContentChange?: (key: string, value: string) => void;
  onArrayItemChange?: (key: string, index: number, value: string) => void;
  onNestedContentChange?: (parentKey: string, index: number, key: string, value: string) => void;
}

export function TechStackContent({ 
  content,
  isEditing = false,
  onContentChange,
  onArrayItemChange,
  onNestedContentChange
}: TechStackContentProps) {
  // Default handlers that do nothing if not provided
  const handleContentChange = onContentChange || ((key: string, value: string) => {});
  const handleArrayItemChange = onArrayItemChange || ((key: string, index: number, value: string) => {});
  const handleNestedContentChange = onNestedContentChange || ((parentKey: string, index: number, key: string, value: string) => {});

  // Helper function to render object content
  const renderObjectContent = (obj: any) => {
    if (!obj) return null;
    
    if (typeof obj === 'string') {
      return obj;
    }
    
    // If it's a numbered object (like {"0": "value1", "1": "value2"})
    if (
      typeof obj === 'object' && 
      !Array.isArray(obj) && 
      Object.keys(obj).every(key => !isNaN(Number(key)))
    ) {
      return (
        <ul className="space-y-1 pl-1">
          {Object.values(obj).map((item: any, index: number) => (
            <li key={index} className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>{typeof item === 'string' ? item : JSON.stringify(item)}</span>
            </li>
          ))}
        </ul>
      );
    }
    
    // Regular object with named properties
    return (
      <div>
        {Object.entries(obj).map(([key, value], index) => (
          <div key={index} className="mb-2">
            <strong>{key}: </strong>
            <span>{typeof value === 'string' ? value : JSON.stringify(value)}</span>
          </div>
        ))}
      </div>
    );
  };

  // Helper function to check if an object has numeric keys (like {"0": "value1", "1": "value2"})
  const hasNumericKeys = (obj: any): boolean => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
    return Object.keys(obj).every(key => !isNaN(Number(key)));
  };

  return (
    <div className="space-y-6">
      {content.currentTechnologies && content.currentTechnologies.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3">Current Technologies</h3>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(content.currentTechnologies) ? (
              content.currentTechnologies.map((tech: string, index: number) => (
                <Badge key={index} variant="outline" className="bg-gray-100">
                  {isEditing ? (
                    <EditableField
                      value={tech}
                      onChange={(value) => handleArrayItemChange('currentTechnologies', index, value)}
                      isEditing={isEditing}
                    />
                  ) : tech}
                </Badge>
              ))
            ) : (
              <div className="text-gray-600">{content.currentTechnologies}</div>
            )}
          </div>
        </div>
      )}
      
      {content.painPoints && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Pain Points</h3>
          <div className="bg-red-50 p-3 rounded-lg text-gray-800">
            {typeof content.painPoints === 'string' ? (
              isEditing ? (
                <EditableField
                  value={content.painPoints}
                  onChange={(value) => handleContentChange('painPoints', value)}
                  isEditing={isEditing}
                  multiline={true}
                />
              ) : (
                <div className="whitespace-pre-wrap">
                  {content.painPoints.split(/\s*\n\s*|\s*\.\s*/).filter((point: string) => point.trim()).map((point: string, index: number) => (
                    <div key={index} className="mb-2">
                      • {point.trim().replace(/\.$/, '')}
                    </div>
                  ))}
                </div>
              )
            ) : Array.isArray(content.painPoints) ? (
              <ul className="space-y-1 pl-1">
                {content.painPoints.map((point: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    {isEditing ? (
                      <EditableField
                        value={point}
                        onChange={(value) => handleArrayItemChange('painPoints', index, value)}
                        isEditing={isEditing}
                        className="flex-1"
                      />
                    ) : point}
                  </li>
                ))}
              </ul>
            ) : hasNumericKeys(content.painPoints) ? (
              <ul className="space-y-1 pl-1">
                {Object.values(content.painPoints as Record<string, string>).map((point, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>{typeof point === 'string' ? point.replace(/^\d+:\s*/, '') : point}</span>
                  </li>
                ))}
              </ul>
            ) : typeof content.painPoints === 'object' ? (
              <div>
                {Object.entries(content.painPoints).map(([key, value]) => (
                  <div key={key} className="mb-2">
                    <span className="text-red-500 mr-2">•</span>
                    <span className="font-medium">{key}: </span>
                    <span>{typeof value === 'string' ? value : JSON.stringify(value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div>{String(content.painPoints)}</div>
            )}
          </div>
        </div>
      )}
      
      {content.opportunities && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Opportunities</h3>
          <div className="bg-green-50 p-3 rounded-lg text-gray-800">
            {typeof content.opportunities === 'string' ? (
              isEditing ? (
                <EditableField
                  value={content.opportunities}
                  onChange={(value) => handleContentChange('opportunities', value)}
                  isEditing={isEditing}
                  multiline={true}
                />
              ) : (
                <div className="whitespace-pre-wrap">
                  {content.opportunities.split(/\s*\n\s*|\s*\.\s*/).filter((point: string) => point.trim()).map((point: string, index: number) => (
                    <div key={index} className="mb-2">
                      • {point.trim().replace(/\.$/, '')}
                    </div>
                  ))}
                </div>
              )
            ) : Array.isArray(content.opportunities) ? (
              <ul className="space-y-1 pl-1">
                {content.opportunities.map((opportunity: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    {isEditing ? (
                      <EditableField
                        value={opportunity}
                        onChange={(value) => handleArrayItemChange('opportunities', index, value)}
                        isEditing={isEditing}
                        className="flex-1"
                      />
                    ) : opportunity}
                  </li>
                ))}
              </ul>
            ) : hasNumericKeys(content.opportunities) ? (
              <ul className="space-y-1 pl-1">
                {Object.values(content.opportunities as Record<string, string>).map((opportunity, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>{typeof opportunity === 'string' ? opportunity.replace(/^\d+:\s*/, '') : opportunity}</span>
                  </li>
                ))}
              </ul>
            ) : typeof content.opportunities === 'object' ? (
              <div>
                {Object.entries(content.opportunities).map(([key, value]) => (
                  <div key={key} className="mb-2">
                    <span className="text-green-500 mr-2">•</span>
                    <span className="font-medium">{key}: </span>
                    <span>{typeof value === 'string' ? value : JSON.stringify(value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div>{String(content.opportunities)}</div>
            )}
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
                  {isEditing ? (
                    <EditableField
                      value={tech.name}
                      onChange={(value) => handleNestedContentChange('technologies', index, 'name', value)}
                      isEditing={isEditing}
                    />
                  ) : tech.name}
                </h4>
                {isEditing ? (
                  <EditableField
                    value={tech.description}
                    onChange={(value) => handleNestedContentChange('technologies', index, 'description', value)}
                    isEditing={isEditing}
                    multiline={true}
                    className="text-sm text-gray-600"
                  />
                ) : (
                  <p className="text-sm text-gray-600">{tech.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 