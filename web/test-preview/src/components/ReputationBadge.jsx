import React from 'react';
import { CheckCircle, Award } from 'lucide-react';

// The ReputationBadge component serves as a clickable indicator that opens
// the verification interface. It uses a similar design language to the 
// verification interface itself, maintaining visual consistency.
const ReputationBadge = ({ onSelect }) => {
  return (
    <div className="relative group">
      {/* Tooltip that appears on hover */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        View Academic Profile
      </div>

      {/* The badge itself, styled to match our verification interface */}
      <button 
        onClick={onSelect}
        className="relative p-2 rounded-lg hover:bg-blue-50 transition-colors group"
        aria-label="View academic profile and verification details"
      >
        {/* Main badge circle */}
        <div className="relative">
          {/* Outer ring with pulsing effect */}
          <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse"></div>
          
          {/* Badge background */}
          <div className="relative bg-white p-2 rounded-full border-2 border-blue-500">
            {/* We use the same CheckCircle icon from our verification interface */}
            <Award className="w-5 h-5 text-blue-600" />
          </div>

          {/* Small verification indicator */}
          <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
            <CheckCircle className="w-3 h-3 text-white" />
          </div>
        </div>
      </button>
    </div>
  );
};

export default ReputationBadge;