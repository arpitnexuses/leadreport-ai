import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdaptiveImage } from "@/components/ui/adaptive-image";
import { Upload, Link, X } from "lucide-react";

interface ProfilePictureEditorProps {
  currentPhoto: string | null;
  isEditing: boolean;
  onPhotoChange: (photoUrl: string | null) => void;
  alt: string;
}

export function ProfilePictureEditor({ 
  currentPhoto, 
  isEditing, 
  onPhotoChange, 
  alt 
}: ProfilePictureEditorProps) {
  const [photoUrl, setPhotoUrl] = useState(currentPhoto || "");
  const [isUrlInputVisible, setIsUrlInputVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update photoUrl when currentPhoto changes
  useEffect(() => {
    setPhotoUrl(currentPhoto || "");
  }, [currentPhoto]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
      }
      
      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('File size must be less than 5MB.');
        return;
      }
      
      // Convert file to base64 for persistence
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setPhotoUrl(base64String);
        onPhotoChange(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = () => {
    if (photoUrl.trim()) {
      onPhotoChange(photoUrl.trim());
    }
    setIsUrlInputVisible(false);
  };

  const handleRemovePhoto = () => {
    setPhotoUrl("");
    onPhotoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUrlChange = (value: string) => {
    setPhotoUrl(value);
  };

  if (!isEditing) {
    return (
      <div className="h-24 w-24 rounded-xl overflow-hidden bg-white/20 flex-shrink-0">
        <AdaptiveImage
          src={currentPhoto || ""}
          alt={alt}
          width={96}
          height={96}
          className="object-cover w-full h-full"
          placeholderType="user"
          showPlaceholder={!currentPhoto}
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="h-24 w-24 rounded-xl overflow-hidden bg-white/20 flex-shrink-0">
        <AdaptiveImage
          src={photoUrl || ""}
          alt={alt}
          width={96}
          height={96}
          className="object-cover w-full h-full"
          placeholderType="user"
          showPlaceholder={!photoUrl}
        />
      </div>
      
      {/* Edit overlay */}
      <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
        <div className="flex flex-col gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            className="h-8 px-2 text-xs"
          >
            <Upload className="h-3 w-3 mr-1" />
            Upload
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsUrlInputVisible(true)}
            className="h-8 px-2 text-xs"
          >
            <Link className="h-3 w-3 mr-1" />
            URL
          </Button>
          {photoUrl && (
            <Button
              size="sm"
              variant="destructive"
              onClick={handleRemovePhoto}
              className="h-8 px-2 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Remove
            </Button>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* URL input modal */}
      {isUrlInputVisible && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-white rounded-lg shadow-lg border z-10 min-w-64">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Profile Picture URL</label>
            <Input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={photoUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleUrlSubmit}
                className="flex-1"
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsUrlInputVisible(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 