import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface EditableFieldProps {
  value: any;
  onChange: (value: string) => void;
  isEditing: boolean;
  multiline?: boolean;
  className?: string;
}

export function EditableField({ 
  value, 
  onChange, 
  isEditing, 
  multiline = false,
  className = "" 
}: EditableFieldProps) {
  // Convert value to string safely with special handling for objects with numeric keys
  const stringValue = React.useMemo(() => {
    if (typeof value === 'string') return value;
    if (value === undefined || value === null) return '';
    
    // Special handling for objects, particularly those with numeric keys
    if (typeof value === 'object') {
      try {
        // Handle array-like objects with numeric keys (what caused the original error)
        if (!Array.isArray(value) && Object.keys(value).every(key => !isNaN(Number(key)))) {
          // Convert to array and stringify
          const arrayVersion = Object.keys(value).map(key => value[key]);
          return JSON.stringify(arrayVersion);
        }
        return JSON.stringify(value);
      } catch (e) {
        console.error("Error stringifying object:", e);
        return "[Object]";
      }
    }
    
    return String(value);
  }, [value]);
  
  if (!isEditing) {
    return <p className={className}>{stringValue}</p>;
  }
  
  if (multiline) {
    return (
      <Textarea
        value={stringValue}
        onChange={(e) => onChange(e.target.value)}
        className={`min-h-[80px] py-1 ${className}`}
      />
    );
  }
  
  return (
    <Input
      value={stringValue}
      onChange={(e) => onChange(e.target.value)}
      className={`py-1 h-7 ${className}`}
    />
  );
} 