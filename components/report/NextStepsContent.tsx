import React from 'react';

interface NextStepsContentProps {
  content: any;
}

export function NextStepsContent({ content }: NextStepsContentProps) {
  return (
    <div className="space-y-4">
      {content.recommendedActions && content.recommendedActions.length > 0 && (
        <div className="space-y-3">
          {content.recommendedActions.map((action: any, index: number) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border">
              <div className={`w-5 h-5 rounded-full flex-shrink-0 mt-0.5 ${
                action.priority === "high" 
                  ? "bg-red-500" 
                  : action.priority === "medium" 
                    ? "bg-yellow-500" 
                    : "bg-blue-500"
              }`} />
              <div className="flex-1">
                <div className="font-medium">{action.description}</div>
                <div className="text-sm text-gray-500">
                  Due: {action.dueDate} • Priority: {action.priority.charAt(0).toUpperCase() + action.priority.slice(1)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 