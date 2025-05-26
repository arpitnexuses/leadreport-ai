import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Video, Users, Plus, Trash } from 'lucide-react';
import { EditableField } from './EditableField';
import { Button } from '@/components/ui/button';

interface MeetingDetailsCardProps {
  date: string;
  time: string;
  platform: string;
  agenda: string;
  participants: Array<{
    name: string;
    title: string;
    organization: string;
    isClient?: boolean;
  }>;
  isEditing?: boolean;
  onUpdate?: (field: string, value: string | any[]) => void;
}

export function MeetingDetailsCard({
  date,
  time,
  platform,
  agenda,
  participants = [],
  isEditing = false,
  onUpdate
}: MeetingDetailsCardProps) {
  const handleUpdate = (field: string, value: string | any[]) => {
    if (onUpdate) {
      onUpdate(field, value);
    }
  };

  const handleParticipantUpdate = (index: number, field: string, value: string) => {
    if (!onUpdate) return;
    
    const updatedParticipants = [...participants];
    updatedParticipants[index] = {
      ...updatedParticipants[index],
      [field]: value
    };
    
    onUpdate('participants', updatedParticipants);
  };

  const handleParticipantToggleClient = (index: number) => {
    if (!onUpdate) return;
    
    const updatedParticipants = [...participants];
    updatedParticipants[index] = {
      ...updatedParticipants[index],
      isClient: !updatedParticipants[index].isClient
    };
    
    onUpdate('participants', updatedParticipants);
  };

  const addParticipant = () => {
    if (!onUpdate) return;
    
    const updatedParticipants = [...participants, {
      name: 'New Participant',
      title: 'Position',
      organization: 'Company Name',
      isClient: false
    }];
    
    onUpdate('participants', updatedParticipants);
  };

  const removeParticipant = (index: number) => {
    if (!onUpdate) return;
    
    const updatedParticipants = [...participants];
    updatedParticipants.splice(index, 1);
    
    onUpdate('participants', updatedParticipants);
  };

  return (
    <Card className="shadow-md border-0">
      <CardHeader className="bg-blue-50 border-b">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Meeting Details
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium">Date</div>
                <EditableField
                  value={date}
                  onChange={(value) => handleUpdate('date', value)}
                  isEditing={isEditing}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium">Time</div>
                <EditableField
                  value={time}
                  onChange={(value) => handleUpdate('time', value)}
                  isEditing={isEditing}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Video className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium">Platform</div>
                <EditableField
                  value={platform}
                  onChange={(value) => handleUpdate('platform', value)}
                  isEditing={isEditing}
                />
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Participants
              </h3>
              {isEditing && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={addParticipant} 
                  className="h-8 px-2"
                >
                  <Plus className="h-4 w-4" />
                  <span className="ml-1">Add</span>
                </Button>
              )}
            </div>
            {participants.length > 0 ? (
              <div className="space-y-2">
                {participants.map((person, index) => (
                  <div key={index} className="text-sm p-2 bg-gray-50 rounded relative">
                    {isEditing && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeParticipant(index)} 
                        className="h-6 w-6 p-0 absolute top-1 right-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <div className="font-medium">
                      <EditableField
                        value={person.name}
                        onChange={(value) => handleParticipantUpdate(index, 'name', value)}
                        isEditing={isEditing}
                      />
                    </div>
                    <div className="text-gray-600">
                      <EditableField
                        value={person.title}
                        onChange={(value) => handleParticipantUpdate(index, 'title', value)}
                        isEditing={isEditing}
                      />, 
                      <EditableField
                        value={person.organization}
                        onChange={(value) => handleParticipantUpdate(index, 'organization', value)}
                        isEditing={isEditing}
                      />
                    </div>
                    {person.isClient && !isEditing && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        Client
                      </span>
                    )}
                    {isEditing && (
                      <Button 
                        variant={person.isClient ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => handleParticipantToggleClient(index)} 
                        className="mt-1 h-6 text-xs"
                      >
                        {person.isClient ? "Client ✓" : "Mark as Client"}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 italic">No participants listed</div>
            )}
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="font-medium mb-2">Meeting Agenda</h3>
          <div className="bg-gray-50 p-4 rounded text-sm">
            <EditableField
              value={agenda}
              onChange={(value) => handleUpdate('agenda', value)}
              isEditing={isEditing}
              multiline={true}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 