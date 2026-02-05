import React from 'react';
import { Calendar, Clock, Video, FileText } from 'lucide-react';
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
    <div className="space-y-4">
      {/* Meeting Information - Clean Grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Date</div>
            <EditableField
              value={date}
              onChange={(value) => handleUpdate('date', value)}
              isEditing={isEditing}
              className="text-sm font-bold text-gray-900"
              placeholder="Enter meeting date"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
            <Clock className="h-4 w-4 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Time</div>
            <EditableField
              value={time}
              onChange={(value) => handleUpdate('time', value)}
              isEditing={isEditing}
              className="text-sm font-bold text-gray-900"
              placeholder="Enter meeting time"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
            <Video className="h-4 w-4 text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Platform</div>
            <EditableField
              value={platform}
              onChange={(value) => handleUpdate('platform', value)}
              isEditing={isEditing}
              className="text-sm font-bold text-gray-900"
              placeholder="Enter meeting platform"
            />
          </div>
        </div>
      </div>
      
      {/* Meeting Agenda */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
            <FileText className="h-3.5 w-3.5 text-gray-600" />
          </div>
          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Meeting Agenda</h4>
        </div>
        <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100">
          <EditableField
            value={agenda}
            onChange={(value) => handleUpdate('agenda', value)}
            isEditing={isEditing}
            multiline={true}
            className="text-sm text-gray-600 leading-relaxed"
            placeholder="Enter meeting agenda and discussion points..."
          />
        </div>
      </div>
    </div>
  );
}
