import React, { useState } from 'react';
import AtomBadge from './AtomBadge';

/**
 * PostQualityIndicator - Displays a post's scientific validation status with context
 * Follows the design shown in the provided image
 * 
 * @param {Object} props
 * @param {string} props.status - 'awaiting', 'active', 'consensus', or 'opposition'
 * @param {string} props.topic - Scientific topic of the post
 * @param {Array} props.experts - Array of experts relevant to this topic (optional)
 * @param {Array} props.references - Array of scientific references (optional)
 */
const PostQualityIndicator = ({ status, topic, experts = [], references = [] }) => {
  const [showDetails, setShowDetails] = useState(false);

  // Map status to descriptive text based on the image
  const getStatusDescription = () => {
    switch(status) {
      case 'awaiting':
        return 'Awaiting community validation';
      case 'active':
        return 'Active scientific discussion';
      case 'consensus':
        return 'Strong evidence-based consensus';
      case 'opposition':
        return 'Strong evidence-based opposition';
      default:
        return 'Scientific validation status unknown';
    }
  };
  
  // Configure badge appearance based on status
  const getBadgeConfig = () => {
    switch(status) {
      case 'awaiting':
        return {
          orbitalColor: '#f5a623', // Yellow for awaiting
          electronColors: ['#f5a623', '#f5a623', '#f5a623'], // All yellow
          centerContent: (
            <text 
              x="50" 
              y="55" 
              textAnchor="middle" 
              dominantBaseline="middle" 
              fontSize="28"
            >?</text>
          )
        };
      case 'active':
        return {
          orbitalColor: '#9baec8', // Mix of colors for active discussion
          electronColors: ['#eb5c6e', '#f5a623', '#2fc72e'], // Red, Yellow, Green
          centerContent: (
            <text 
              x="50" 
              y="55" 
              textAnchor="middle" 
              dominantBaseline="middle" 
              fontSize="22"
            >😐</text>
          )
        };
      case 'consensus':
        return {
          orbitalColor: '#2fc72e', // Green for consensus
          electronColors: ['#2fc72e', '#2fc72e', '#2fc72e'], // All green
          centerContent: (
            <text 
              x="50" 
              y="55" 
              textAnchor="middle" 
              dominantBaseline="middle" 
              fontSize="22"
            >😊</text>
          )
        };
      case 'opposition':
        return {
          orbitalColor: '#eb5c6e', // Red for opposition
          electronColors: ['#eb5c6e', '#eb5c6e', '#eb5c6e'], // All red
          centerContent: (
            <text 
              x="50" 
              y="55" 
              textAnchor="middle" 
              dominantBaseline="middle" 
              fontSize="22"
            >🤨</text>
          )
        };
      default:
        return {
          orbitalColor: '#9baec8', // Default gray
          electronColors: ['#9baec8', '#9baec8', '#9baec8'], // All gray
          centerContent: (
            <text 
              x="50" 
              y="55" 
              textAnchor="middle" 
              dominantBaseline="middle" 
              fontSize="28"
            >?</text>
          )
        };
    }
  };

  const badgeConfig = getBadgeConfig();

  return (
    <div className="mt-2">
      <div 
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        <AtomBadge 
          status={status}
          size="medium"
          orbitalColor={badgeConfig.orbitalColor}
          electronColors={badgeConfig.electronColors}
          centerContent={badgeConfig.centerContent}
          interactive={true}
          onClick={() => setShowDetails(!showDetails)}
        />
        <span className="text-[#9baec8] text-sm">Scientific Validation</span>
      </div>

      {showDetails && (
        <div className="mt-2 p-3 bg-[#2b303b] rounded-lg">
          <p className="text-[#d9e1e8] mb-2">{getStatusDescription()}</p>
          
          {topic && (
            <div className="mb-2">
              <span className="text-[#9baec8] text-sm">Topic: </span>
              <span className="text-[#d9e1e8]">{topic}</span>
            </div>
          )}
          
          {experts.length > 0 && (
            <div className="mb-2">
              <span className="text-[#9baec8] text-sm">Relevant Experts:</span>
              <ul className="text-[#d9e1e8] mt-1">
                {experts.map((expert, index) => (
                  <li key={index} className="flex items-center gap-2 mb-1">
                    <img
                      src={expert.avatar}
                      alt={expert.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <a href="#" className="text-[#2b90d9] hover:underline">
                      {expert.name}
                    </a>
                    {expert.position && (
                      <span className="text-xs text-[#9baec8]">
                        ({expert.position})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {references.length > 0 && (
            <div>
              <span className="text-[#9baec8] text-sm">Key References:</span>
              <ul className="text-[#d9e1e8] mt-1">
                {references.map((ref, index) => (
                  <li key={index} className="text-sm mb-1">
                    <a href={ref.url} className="text-[#2b90d9] hover:underline">
                      {ref.title}
                    </a>
                    <span className="text-xs text-[#9baec8]"> - {ref.authors}, {ref.year}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostQualityIndicator;