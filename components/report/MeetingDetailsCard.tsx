import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Video, Users } from 'lucide-react';

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
}

export function MeetingDetailsCard({
  date,
  time,
  platform,
  agenda,
  participants = []
}: MeetingDetailsCardProps) {
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
                <div>{date}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium">Time</div>
                <div>{time}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Video className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium">Platform</div>
                <div>{platform}</div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Participants
            </h3>
            {participants.length > 0 ? (
              <div className="space-y-2">
                {participants.map((person, index) => (
                  <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                    <div className="font-medium">{person.name}</div>
                    <div className="text-gray-600">{person.title}, {person.organization}</div>
                    {person.isClient && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        Client
                      </span>
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
            {agenda || "No agenda provided"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 