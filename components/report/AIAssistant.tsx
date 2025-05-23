import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { processAIResponse } from "@/lib/report-content-enhancer";

interface AIAssistantProps {
  section: 'overview' | 'company' | 'meeting' | 'interactions' | 'competitors' | 'techStack' | 'news' | 'nextSteps';
  leadData: any;
  apolloData?: any;
  onContentGenerated: (content: any) => void;
}

export function AIAssistant({ section, leadData, apolloData, onContentGenerated }: AIAssistantProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const generateContent = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Call our new API endpoint for AI generation
      const response = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section,
          leadData,
          apolloData
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate content');
      }
      
      const result = await response.json();
      
      // Process the result to ensure consistent structure
      const processedResult = processAIResponse(section, result);
      onContentGenerated(processedResult);
      
      // Close the popover after successful generation
      setIsOpen(false);
    } catch (err) {
      setError(typeof err === 'string' ? err : (err instanceof Error ? err.message : 'Failed to generate content'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1 text-xs"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-3 w-3" />
              AI Generate
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h3 className="font-medium">Generate content with AI</h3>
          <p className="text-sm text-gray-500">
            Our AI can analyze the lead data and generate relevant content for the {getSectionName(section)} section.
          </p>
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-md">
            <strong>Note:</strong> AI generation relies on the data available about this lead and company. 
            Results may vary based on data quality.
          </div>
          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-2 rounded-md flex items-start">
              <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div className="flex justify-between">
            <Button 
              variant="default" 
              size="sm" 
              onClick={generateContent}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? 'Generating...' : 'Generate Now'}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Helper function to get a proper display name for the section
function getSectionName(section: string): string {
  switch (section) {
    case 'overview': return 'Overview';
    case 'company': return 'Company';
    case 'meeting': return 'Meeting';
    case 'interactions': return 'Interactions';
    case 'competitors': return 'Competitors';
    case 'techStack': return 'Tech Stack';
    case 'news': return 'News';
    case 'nextSteps': return 'Next Steps';
    default: return section;
  }
} 