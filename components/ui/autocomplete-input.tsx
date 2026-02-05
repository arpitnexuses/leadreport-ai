"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AutocompleteInputProps {
  name: string;
  placeholder: string;
  options: string[];
  required?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  defaultValue?: string;
}

export function AutocompleteInput({
  name,
  placeholder,
  options,
  required = false,
  disabled = false,
  className = "",
  icon,
  defaultValue = ""
}: AutocompleteInputProps) {
  const [value, setValue] = useState(defaultValue);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>(options);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Filter options based on input value
    if (value.trim() === "") {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter(option =>
        option.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [value, options]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setShowDropdown(true);
  };

  const handleOptionClick = (option: string) => {
    setValue(option);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  return (
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {icon}
        </div>
      )}
      
      <input
        ref={inputRef}
        type="text"
        name={name}
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={cn(
          "flex h-14 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50",
          icon && "pl-12",
          className
        )}
        autoComplete="off"
      />

      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
        tabIndex={-1}
      >
        <ChevronDown className="h-5 w-5" />
      </button>

      {showDropdown && filteredOptions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-60 overflow-auto"
        >
          {filteredOptions.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleOptionClick(option)}
              className={cn(
                "w-full text-left px-4 py-3 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-between",
                value === option && "bg-blue-50 dark:bg-blue-900/20"
              )}
            >
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {option}
              </span>
              {value === option && (
                <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              )}
            </button>
          ))}
        </div>
      )}

      {showDropdown && filteredOptions.length === 0 && value.trim() !== "" && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg px-4 py-3"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No matches found. Press Enter to create &quot;{value}&quot;
          </p>
        </div>
      )}
    </div>
  );
}
