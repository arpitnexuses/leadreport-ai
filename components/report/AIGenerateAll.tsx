/**
 * AIGenerateAll Component
 * 
 * This component provides a UI for generating AI content for all enabled sections in a lead report
 * in a single operation. It includes:
 * 
 * - A dialog interface with clear progress tracking
 * - The ability to generate content only for sections that are enabled
 * - Real-time progress updates
 * - Error handling
 * - Automatic saving of generated content
 * 
 * It uses the `/api/ai-generate` endpoint for each section and collects all results
 * into a single state update.
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Save } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

interface AIGenerateAllProps {
  sections: Record<string, boolean>;
  leadData: any;
  apolloData?: any;
  onContentGenerated: (sectionContents: Record<string, any>) => void;
  onSave?: () => void;
  isEditing: boolean;
  isGeneratingInitial?: boolean;
}

export function AIGenerateAll({ 
  sections, 
  leadData, 
  apolloData, 
  onContentGenerated, 
  onSave,
  isEditing,
  isGeneratingInitial = false
}: AIGenerateAllProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [generatedSections, setGeneratedSections] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const sectionNames: Record<string, string> = {
    overview: "Overview",
    company: "Company",
    meeting: "Meeting",
    interactions: "Interactions",
    competitors: "Competitors",
    techStack: "Tech Stack",
    news: "News",
    nextSteps: "Next Steps"
  };

  const generateAll = async () => {
    if (!leadData) return;
    
    setIsGenerating(true);
    setProgress(0);
    setError(null);
    setGeneratedSections([]);
    
    // Get list of active sections
    const sectionKeys = Object.keys(sections).filter(key => sections[key]);
    const totalSections = sectionKeys.length;
    
    if (totalSections === 0) {
      setError("No sections are enabled. Please enable at least one section.");
      setIsGenerating(false);
      return;
    }
    
    const newContent: Record<string, any> = {};
    let completedCount = 0;
    
    try {
      for (const section of sectionKeys) {
        setCurrentSection(section);
        
        // Call the AI generate endpoint for each section
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
        
        if (response.ok) {
          const result = await response.json();
          newContent[section] = result;
          setGeneratedSections(prev => [...prev, section]);
        } else {
          console.error(`Failed to generate content for ${sectionNames[section]} section`);
        }
        
        // Update progress
        completedCount++;
        setProgress(Math.round((completedCount / totalSections) * 100));
      }
      
      // Update the parent component with all generated content
      onContentGenerated(newContent);
      
      // Keep dialog open for a moment to show completion
      setTimeout(() => {
        setIsOpen(false);
        setIsGenerating(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error in bulk AI generation:', error);
      setError(typeof error === 'string' ? error : 'Failed to generate content for all sections');
      setIsGenerating(false);
    }
  };

  const handleSaveAndClose = () => {
    if (onSave) {
      onSave();
    }
    setIsOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="gap-2" 
            disabled={!isEditing || isGeneratingInitial}
            onClick={() => setIsOpen(true)}
          >
            {isGeneratingInitial ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating AI Content...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate All AI Content</span>
              </>
            )}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate AI Content for All Sections</DialogTitle>
            <DialogDescription>
              This will generate AI content for all enabled sections at once. This may take a minute.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {isGenerating ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    {currentSection ? `Generating ${sectionNames[currentSection]}...` : 'Preparing...'}
                  </span>
                  <span className="text-sm text-gray-500">{progress}%</span>
                </div>
                
                <Progress value={progress} className="h-2" />
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Completed sections:</h4>
                  <div className="space-y-1">
                    {generatedSections.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">None yet</p>
                    ) : (
                      generatedSections.map(section => (
                        <div key={section} className="flex items-center gap-2">
                          <Sparkles className="h-3 w-3 text-green-500" />
                          <span className="text-sm">{sectionNames[section]}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm">
                  The following sections will be generated:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(sections)
                    .filter(([_, enabled]) => enabled)
                    .map(([key]) => (
                      <div key={key} className="flex items-center gap-2">
                        <Sparkles className="h-3 w-3 text-blue-500" />
                        <span className="text-sm">{sectionNames[key as keyof typeof sectionNames]}</span>
                      </div>
                    ))}
                </div>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded-md text-red-600 text-sm">
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            
            {isGenerating ? (
              <Button disabled>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </Button>
            ) : generatedSections.length > 0 ? (
              <Button onClick={handleSaveAndClose}>
                <Save className="h-4 w-4 mr-2" />
                Save & Close
              </Button>
            ) : (
              <Button onClick={generateAll}>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 