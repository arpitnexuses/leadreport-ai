import React from 'react';

interface NextStepsContentProps {
  content: any;
}

export function NextStepsContent({ content }: NextStepsContentProps) {
  return (
    <div className="space-y-6">
      {content.recommendedActions && content.recommendedActions.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Recommended Actions</h3>
          </div>
          <div className="space-y-5">
            {content.recommendedActions.map((action: any, index: number) => (
              <div
                key={index}
                className="group relative bg-white p-6 rounded-2xl border border-gray-200 hover:border-blue-400 shadow-sm hover:shadow-lg transition-all duration-200 flex gap-4 items-start"
              >
                {/* Accent Icon */}
                <div className="flex flex-col items-center pt-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md mb-2
                      ${
                        action.priority?.toLowerCase() === 'high'
                          ? 'bg-gradient-to-br from-red-500 to-red-600'
                          : action.priority?.toLowerCase() === 'medium'
                          ? 'bg-gradient-to-br from-yellow-400 to-yellow-500'
                          : 'bg-gradient-to-br from-green-500 to-emerald-600'
                      }
                    `}
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  {action.priority && (
                    <span
                      className={`text-sm font-semibold px-2 py-0.5 rounded-full mt-1
                        ${
                          action.priority.toLowerCase() === 'high'
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : action.priority.toLowerCase() === 'medium'
                            ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                            : 'bg-green-100 text-green-700 border border-green-200'
                        }
                      `}
                    >
                      {action.priority.charAt(0).toUpperCase() + action.priority.slice(1)}
                    </span>
                  )}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <span className="block text-sm font-semibold text-gray-500 mb-1">Description</span>
                    <div className="text-sm font-medium text-gray-900 leading-relaxed">
                      {action.description}
                    </div>
                  </div>
                  {action.rationale && (
                    <div>
                      <span className="block text-sm font-semibold text-gray-500 mb-1">Rationale</span>
                      <div className="text-sm text-gray-700">{action.rationale}</div>
                    </div>
                  )}
                  {action.dueDate && (
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-600">Due: {action.dueDate}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
} 