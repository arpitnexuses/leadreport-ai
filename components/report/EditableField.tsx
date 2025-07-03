import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface EditableFieldProps {
  value: any;
  onChange: (value: string) => void;
  isEditing: boolean;
  multiline?: boolean;
  className?: string;
  placeholder?: string;
}

export function EditableField({ 
  value, 
  onChange, 
  isEditing, 
  multiline = false,
  className = "",
  placeholder = ""
}: EditableFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Update display value when stringValue changes
  useEffect(() => {
    setDisplayValue(stringValue);
  }, [stringValue]);

  // Handle focus to clear default placeholder text
  const handleFocus = () => {
    setIsFocused(true);
  };

  // Handle blur to restore value if empty
  const handleBlur = () => {
    setIsFocused(false);
    // Don't restore default values on blur - let user input remain
  };

  // Handle change
  const handleChange = (newValue: string) => {
    setDisplayValue(newValue);
    onChange(newValue);
  };

  if (!isEditing) {
    return <p className={className}>{stringValue}</p>;
  }
  
  if (multiline) {
    return (
      <Textarea
        ref={textareaRef}
        value={displayValue}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`min-h-[80px] py-1 ${className}`}
      />
    );
  }
  
  return (
    <Input
      ref={inputRef}
      value={displayValue}
      onChange={(e) => handleChange(e.target.value)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={`py-1 h-7 ${className}`}
    />
  );
} 