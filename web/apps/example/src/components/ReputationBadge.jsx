import React, { useState, useEffect } from 'react';
// Fix the import path - use relative path instead of alias
import { Card, CardHeader, CardContent } from './ui/card';

// Simple progress bar component to replace the shadcn/ui Progress
const SimpleProgress = ({ value, className }) => {
  return (
    <div className={`relative h-2 w-full overflow-hidden rounded-full bg-gray-200 ${className}`}>
      <div
        className="h-full w-full flex-1 bg-blue-600 transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </div>
  );
};

// This component shows the interactive badge that triggers the popup - now with atom motif
const ReputationBadge = ({ authorId, onSelect }) => {
  return (
    <div className="relative group">
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        View Expert Profile
      </div>
      <button 
        onClick={() => onSelect(authorId)} 
        className="rounded-full p-1 hover:bg-blue-50 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-8 h-8">
          <ellipse cx="50" cy="50" rx="45" ry="20" fill="none" stroke="#2563eb" strokeWidth="2" transform="rotate(60,50,50)"/>
          <ellipse cx="50" cy="50" rx="45" ry="20" fill="none" stroke="#2563eb" strokeWidth="2" transform="rotate(-60,50,50)"/>
          <ellipse cx="50" cy="50" rx="45" ry="20" fill="none" stroke="#2563eb" strokeWidth="2"/>
          <circle cx="50" cy="50" r="15" fill="#ffffff" stroke="#2563eb" strokeWidth="2"/>
          {/* Large red question mark */}
          <text x="50" y="56" textAnchor="middle" fill="#dc2626" fontSize="22" fontWeight="bold">?</text>
          <g transform="rotate(60,50,50)">
            <circle r="3" fill="#2563eb">
              <animateMotion 
                dur="3s" 
                repeatCount="indefinite" 
                path="M50,50 m-45,0 a45,20 0 1,0 90,0 a45,20 0 1,0 -90,0"
              />
            </circle>
          </g>
          <g transform="rotate(-60,50,50)">
            <circle r="3" fill="#2563eb">
              <animateMotion 
                dur="3s" 
                repeatCount="indefinite"
                begin="-1s"
                path="M50,50 m-45,0 a45,20 0 1,0 90,0 a45,20 0 1,0 -90,0"
              />
            </circle>
          </g>
          <circle r="3" fill="#2563eb">
            <animateMotion 
              dur="3s" 
              repeatCount="indefinite"
              begin="-2s"
              path="M50,50 m-45,0 a45,20 0 1,0 90,0 a45,20 0 1,0 -90,0"
            />
          </circle>
        </svg>
      </button>
    </div>
  );
};

// This component displays the detailed reputation information in a popup
const ReputationPopup = ({ authorId, onClose }) => {
  const [authorData, setAuthorData] = useState(null);
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
    const fetchAuthorData = async () => {
      try {
        // Use environment variable instead of hardcoded URL
        const response = await fetch(`${import.meta.env.VITE_API_URL|| 'https://scivalidate.onrender.com'}/api/faculty/${authorId}/reputation`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Check content type before trying to parse as JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Response is not JSON");
        }
        
        const data = await response.json();
        setAuthorData(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching author data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (authorId) {
      fetchAuthorData();
    }
  }, [authorId]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" 
      onClick={handleBackdropClick}
    >
      {loading ? (
        <div className="bg-white rounded-lg shadow-xl w-[32rem] max-h-[80vh] overflow-y-auto">
          <div className="border-b p-6">
            <div className="flex justify-between items-start">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-2 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow-xl w-[32rem]">
          <div className="border-b p-6">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold text-red-600">Error Loading Data</h2>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="p-6">
            <p className="text-red-500">{error}</p>
            <p className="mt-4">Please make sure your API server is running at {import.meta.env.VITE_API_URL || 'the correct URL'}</p>
            <div className="flex justify-end mt-4">
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  const fetchData = async () => {
                    try {
                      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/faculty/${authorId}/reputation`);
                      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                      const data = await response.json();
                      setAuthorData(data);
                    } catch (error) {
                      setError(error.message);
                    } finally {
                      setLoading(false);
                    }
                  };
                  fetchData();
                }}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      ) : !authorData ? (
        <div className="bg-white rounded-lg shadow-xl w-[32rem]">
          <div className="border-b p-6">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold">No Data Available</h2>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-500">No expert profile data available for this faculty member.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-xl w-[32rem] max-h-[80vh] overflow-y-auto">
          <div className="border-b p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{authorData.display_name}</h2>
                <p className="text-gray-600">{authorData.position}</p>
                <p className="text-gray-500">{authorData.department}</p>
              </div>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Overall Reputation Score */}
            <div>
              <h3 className="font-medium mb-2">Expert Reputation Score</h3>
              {authorData.reputation_score !== undefined && authorData.reputation_score !== null ? (
                <div className="relative pt-1">
                  <SimpleProgress value={authorData.reputation_score * 10} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>0</span>
                    <span>{authorData.reputation_score.toFixed(1)} / 10</span>
                    <span>10</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No reputation score available</p>
              )}
            </div>

            {/* Expertise Areas */}
            <div>
              <h3 className="font-medium mb-2">Areas of Expertise</h3>
              {authorData.expertise && authorData.expertise.length > 0 ? (
                <div className="space-y-2">
                  {authorData.expertise.map((area, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{area.field_name}</span>
                      <SimpleProgress 
                        value={(area.expertise_score || 0) * 100} 
                        className="w-32 h-1.5"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No expertise data available</p>
              )}
            </div>

            {/* Publication Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Publication Impact</h3>
                <div className="space-y-1 text-sm">
                  <p>Publications: {authorData.publication_count || 0}</p>
                  <p>Total Citations: {authorData.total_citations || 0}</p>
                  <p>h-index: {authorData.h_index || 0}</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Recent Activity</h3>
                <div className="space-y-1 text-sm">
                  <p>Latest Publication: {authorData.latest_publication_year || 'N/A'}</p>
                  <p>Active Collaborators: {authorData.coauthor_count || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { ReputationBadge, ReputationPopup };