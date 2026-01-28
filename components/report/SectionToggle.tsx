import React, { useState } from 'react';
import { LayoutPanelTop, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SectionToggleProps {
  sections: {
    overview: boolean;
    company: boolean;
    meeting: boolean;
    interactions: boolean;
    competitors: boolean;
    techStack: boolean;
    news: boolean;
    nextSteps: boolean;
  };
  onToggle: (section: string, value: boolean) => void;
}

export function SectionToggle({ sections, onToggle }: SectionToggleProps) {
  const [open, setOpen] = useState(false);
  
  // Only show active sections (old sections removed, content consolidated into Strategic Brief)
  const activeSections: string[] = [];
  
  const sectionLabels: Record<string, string> = {};
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <LayoutPanelTop className="h-4 w-4" />
          Sections
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-4" align="end">
        <h3 className="font-medium mb-3">Toggle Sections</h3>
        <div className="space-y-2">
          {Object.entries(sections)
            .filter(([key]) => activeSections.includes(key))
            .map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <Label htmlFor={`toggle-${key}`} className="cursor-pointer">
                  {sectionLabels[key as keyof typeof sectionLabels]}
                </Label>
                <Switch 
                  id={`toggle-${key}`}
                  checked={value} 
                  onCheckedChange={(checked) => onToggle(key, checked)}
                />
              </div>
            ))}
        </div>
      </PopoverContent>
    </Popover>
  );
} 