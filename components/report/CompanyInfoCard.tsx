import React from 'react';
import { Building2, Users2, MapPin, Globe, Banknote } from 'lucide-react';
import { EditableField } from './EditableField';

interface CompanyInfoCardProps {
  companyName: string;
  industry: string;
  employees: string;
  headquarters: string;
  website: string;
  companyLogo?: string;
  companyDescription?: string;
  fundingStage?: string;
  fundingTotal?: string | number;
  isEditing?: boolean;
  onUpdate?: (field: string, value: string) => void;
}

export function CompanyInfoCard({ 
  companyName, 
  industry, 
  employees, 
  headquarters, 
  website, 
  companyLogo, 
  companyDescription, 
  fundingStage, 
  fundingTotal,
  isEditing = false,
  onUpdate
}: CompanyInfoCardProps) {
  const handleUpdate = (field: string, value: string) => {
    if (onUpdate) {
      onUpdate(field, value);
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Company Header - Minimal */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        {companyLogo ? (
          <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100">
            <img 
              src={companyLogo} 
              alt={`${companyName} logo`} 
              className="max-h-full max-w-full object-contain"
            />
          </div>
        ) : (
          <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {companyName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <h3 className="font-black text-sm text-gray-900 tracking-tight">{companyName}</h3>
          {industry && (
            <p className="text-sm text-gray-500 mt-0.5 font-medium">{industry}</p>
          )}
        </div>
      </div>

      {/* Company Details - Clean Grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Industry</label>
            <EditableField 
              value={industry} 
              onChange={(value) => handleUpdate('industry', value)} 
              isEditing={isEditing}
              className="text-sm font-bold text-gray-900"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
            <Users2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Employees</label>
            <EditableField 
              value={employees} 
              onChange={(value) => handleUpdate('employees', value)} 
              isEditing={isEditing}
              className="text-sm font-bold text-gray-900"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Location</label>
            <EditableField 
              value={headquarters} 
              onChange={(value) => handleUpdate('headquarters', value)} 
              isEditing={isEditing}
              className="text-sm font-bold text-gray-900"
            />
          </div>
        </div>

        {fundingStage && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
              <Banknote className="w-4 h-4 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Funding</label>
              <EditableField 
                value={fundingStage} 
                onChange={(value) => handleUpdate('fundingStage', value)} 
                isEditing={isEditing}
                className="text-sm font-bold text-gray-900"
              />
            </div>
          </div>
        )}

        {website && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
              <Globe className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Website</label>
              <a 
                href={website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-bold text-blue-600 hover:text-blue-700 truncate block"
              >
                {website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Company Description */}
      {companyDescription && (
        <div className="pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 leading-relaxed">
            {companyDescription}
          </p>
        </div>
      )}
    </div>
  );
}
