import React, { useState } from 'react';
import { Calendar, Clock, Video } from 'lucide-react';
import { EditableField } from './EditableField';

interface MeetingDetailsCardProps {
  date: string;
  time: string;
  platform: string;
  agenda: string;
  isEditing?: boolean;
  onUpdate?: (field: string, value: string | any[]) => void;
}

export function MeetingDetailsCard({
  date,
  time,
  platform,
  agenda,
  isEditing = false,
  onUpdate
}: MeetingDetailsCardProps) {
  const handleUpdate = (field: string, value: string | any[]) => {
    if (onUpdate) {
      onUpdate(field, value);
    }
  };

  return (
    <div className="space-y-6">
      {/* Meeting Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          Meeting Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border border-blue-200 hover:shadow-md transition-all duration-200">
            <div className="p-2 bg-blue-200 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-700" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-blue-800 text-sm mb-1">Date</div>
              <EditableField
                value={date}
                onChange={(value) => handleUpdate('date', value)}
                isEditing={isEditing}
                className="text-gray-900 font-medium"
                placeholder="Enter meeting date"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg border border-green-200 hover:shadow-md transition-all duration-200">
            <div className="p-2 bg-green-200 rounded-lg">
              <Clock className="h-5 w-5 text-green-700" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-green-800 text-sm mb-1">Time</div>
              <EditableField
                value={time}
                onChange={(value) => handleUpdate('time', value)}
                isEditing={isEditing}
                className="text-gray-900 font-medium"
                placeholder="Enter meeting time"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg border border-purple-200 hover:shadow-md transition-all duration-200">
            <div className="p-2 bg-purple-200 rounded-lg">
              <Video className="h-5 w-5 text-purple-700" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-purple-800 text-sm mb-1">Platform</div>
              <EditableField
                value={platform}
                onChange={(value) => handleUpdate('platform', value)}
                isEditing={isEditing}
                className="text-gray-900 font-medium"
                placeholder="Enter meeting platform"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Meeting Agenda */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          Meeting Agenda
        </h3>
        <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 rounded-lg border border-gray-200 min-h-[120px] hover:shadow-md transition-all duration-200">
          <EditableField
            value={agenda}
            onChange={(value) => handleUpdate('agenda', value)}
            isEditing={isEditing}
            multiline={true}
            className="text-gray-900 leading-relaxed"
            placeholder="Enter meeting agenda and discussion points..."
          />
        </div>
      </div>
    </div>
  );
} 