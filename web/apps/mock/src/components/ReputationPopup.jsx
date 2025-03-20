import React, { useState, useEffect } from 'react';
import { getAuthorReputation } from '../services/sciValidateService';
import { X } from 'lucide-react';
import StarRating from './StarRating';

const ReputationPopup = ({ badge, authorId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Handle closing when clicking outside the popup
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle ESC key to close popup
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [onClose]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let fetchedData;
        
        if (authorId) {
          // Fetch author reputation data
          fetchedData = await getAuthorReputation(authorId);
          
          // Format the fetchedData to match what the popup expects
          if (fetchedData) {
            fetchedData = {
              ...fetchedData,
              name: badge?.name || 'Author Identity',
              status: badge?.status || (fetchedData.identifiers?.some(id => id.verification_status === 'verified') ? 'verified' : 'pending')
            };
          }
        } else {
          // If no ID provided, use the badge data directly
          fetchedData = badge;
        }
        
        setData(fetchedData);
        setError(null);
      } catch (error) {
        console.error('Error fetching reputation data:', error);
        setError('Failed to load reputation data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authorId, badge]);

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" 
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-[#2b303b] rounded-lg w-full max-w-md p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[#d9e1e8]">
            Author Reputation
          </h3>
          <button 
            className="text-[#9baec8] hover:text-[#d9e1e8]"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        {loading ? (
          <div className="text-[#9baec8] flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#2b90d9]"></div>
            <span className="ml-2">Loading...</span>
          </div>
        ) : error ? (
          <div className="text-[#eb5c6e] p-4 bg-[#eb5c6e]/10 rounded-lg">{error}</div>
        ) : !data ? (
          <div className="text-[#9baec8]">No data available</div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div className="font-bold text-[#d9e1e8]">{data.display_name || data.name}</div>
                  <div className={`text-sm px-2 py-0.5 rounded-full ${
                    data.status === 'verified' ? 'bg-[#2fc72e]/20 text-[#2fc72e]' : 
                    'bg-[#f5a623]/20 text-[#f5a623]'
                  }`}>
                    {data.status === 'verified' ? 'Verified' : 'Pending'}
                  </div>
                </div>
                
                <div className="text-[#9baec8] text-sm">
                  {data.department} {data.institution ? `• ${data.institution}` : ''}
                </div>
              </div>
            </div>
            
            {/* Reputation Score with Star Rating */}
            {data.reputation_score !== undefined && (
              <div className="mb-4 p-3 bg-[#313543] rounded-lg">
                <h4 className="text-[#9baec8] text-sm mb-2">Reputation Score</h4>
                <div className="flex justify-between items-center">
                  <StarRating 
                    score={data.reputation_score} 
                    primaryColor="#2fc72e" 
                    size="medium"
                  />
                </div>
              </div>
            )}
            
            {/* Academic info, if available from API */}
            {data.h_index !== undefined && (
              <div className="mb-4 p-3 bg-[#313543] rounded-lg">
                <h4 className="text-[#9baec8] text-sm mb-2">Academic Metrics</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[#9baec8] text-xs">H-index</span>
                    <p className="text-[#d9e1e8] font-medium">{data.h_index}</p>
                  </div>
                  <div>
                    <span className="text-[#9baec8] text-xs">Citations</span>
                    <p className="text-[#d9e1e8] font-medium">{data.total_citations || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[#9baec8] text-xs">Publications</span>
                    <p className="text-[#d9e1e8] font-medium">{data.publication_count || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[#9baec8] text-xs">Latest</span>
                    <p className="text-[#d9e1e8] font-medium">{data.latest_publication_year || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* If we have expertise fields from the API, show them */}
            {data.expertise && data.expertise.length > 0 && (
              <div className="mb-4">
                <h4 className="text-[#9baec8] text-sm mb-2">Fields of Expertise</h4>
                <div className="space-y-2">
                  {data.expertise.slice(0, 3).map((field, index) => (
                    <div key={index} className="p-2 bg-[#313543] rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-[#d9e1e8]">{field.field_name}</span>
                        <span className="text-[#9baec8] text-sm">
                          Score: {field.expertise_score?.toFixed(1) || 'N/A'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {data.expertise.length > 3 && (
                    <div className="text-[#9baec8] text-xs text-center">
                      +{data.expertise.length - 3} more fields
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <button 
              className="w-full bg-[#313543] text-[#d9e1e8] rounded-lg py-2 mt-2 hover:bg-[#414656]"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReputationPopup;