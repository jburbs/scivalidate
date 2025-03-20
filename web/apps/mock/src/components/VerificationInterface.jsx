import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { X } from 'lucide-react';

const VerificationInterface = ({ facultyId, onClose }) => {
  const [facultyData, setFacultyData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Use environment variable with fallback
        const apiUrl = import.meta.env.VITE_API_URL || 'https://scivalidate.onrender.com';
        const response = await fetch(`${apiUrl}/api/faculty/${facultyId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setFacultyData(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (facultyId) {
      fetchData();
    }
  }, [facultyId]);

  // Updated UI to match Mastodon's dark theme
  if (loading) {
    return (
      <div className="bg-[#2b303b] p-6 rounded-lg w-full shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#d9e1e8]">Faculty Verification</h2>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-[#9baec8] hover:text-white"
            >
              <X size={24} />
            </button>
          )}
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-[#313543] rounded w-3/4"></div>
          <div className="h-4 bg-[#313543] rounded w-1/2"></div>
          <div className="h-4 bg-[#313543] rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#2b303b] p-6 rounded-lg w-full shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#d9e1e8]">Faculty Verification</h2>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-[#9baec8] hover:text-white"
            >
              <X size={24} />
            </button>
          )}
        </div>
        <div className="text-[#eb5c6e] p-4 bg-[#eb5c6e]/20 rounded-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!facultyData) {
    return (
      <div className="bg-[#2b303b] p-6 rounded-lg w-full shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#d9e1e8]">Faculty Verification</h2>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-[#9baec8] hover:text-white"
            >
              <X size={24} />
            </button>
          )}
        </div>
        <div className="text-[#9baec8]">No faculty data available</div>
      </div>
    );
  }

  return (
    <div className="bg-[#2b303b] p-6 rounded-lg w-full shadow-lg max-w-3xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[#d9e1e8]">Faculty Verification</h2>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-[#9baec8] hover:text-white"
          >
            <X size={24} />
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 bg-[#414656] rounded-full flex items-center justify-center text-[#d9e1e8] text-xl font-bold">
            {facultyData.display_name?.charAt(0) || 'F'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#d9e1e8]">{facultyData.display_name}</h2>
            <p className="text-[#9baec8]">{facultyData.position}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold
                ${facultyData.verification_status === 'verified' 
                  ? 'bg-[#2fc72e]/20 text-[#2fc72e]' 
                  : facultyData.verification_status === 'pending'
                    ? 'bg-[#f5a623]/20 text-[#f5a623]'
                    : 'bg-[#9baec8]/20 text-[#9baec8]'
                }`}
              >
                {facultyData.verification_status || 'Unverified'}
              </span>
              
              {facultyData.reputation_score !== undefined && (
                <span className="px-2 py-1 bg-[#2b90d9]/20 text-[#2b90d9] rounded-full text-xs font-semibold">
                  Score: {facultyData.reputation_score.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2 bg-[#313543] p-4 rounded-lg">
          <h3 className="font-semibold text-[#d9e1e8]">Institution</h3>
          <p className="text-[#d9e1e8]">{facultyData.institution}</p>
          <p className="text-[#9baec8]">{facultyData.department}</p>
        </div>

        <div className="space-y-2 bg-[#313543] p-4 rounded-lg">
          <h3 className="font-semibold text-[#d9e1e8]">Academic Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[#9baec8]">H-index</p>
              <p className="text-xl font-semibold text-[#d9e1e8]">{facultyData.h_index}</p>
            </div>
            <div>
              <p className="text-sm text-[#9baec8]">Total Citations</p>
              <p className="text-xl font-semibold text-[#d9e1e8]">{facultyData.total_citations}</p>
            </div>
            <div>
              <p className="text-sm text-[#9baec8]">Publications</p>
              <p className="text-xl font-semibold text-[#d9e1e8]">{facultyData.publication_count}</p>
            </div>
            <div>
              <p className="text-sm text-[#9baec8]">Latest Publication</p>
              <p className="text-xl font-semibold text-[#d9e1e8]">{facultyData.latest_publication_year}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 bg-[#313543] p-4 rounded-lg">
          <h3 className="font-semibold text-[#d9e1e8]">Identifiers</h3>
          <div className="space-y-2">
            {facultyData.identifiers?.map((id, index) => (
              <div key={index} className="flex items-center gap-2 flex-wrap">
                <span className="text-[#9baec8]">{id.identifier_type}:</span>
                <span className="text-[#d9e1e8]">{String(id.identifier_value)}</span>
                {id.is_primary > 0 && (
                  <span className="px-2 py-0.5 bg-[#313543] text-[#9baec8] rounded-full text-xs">
                    Primary
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded-full text-xs
                  ${id.verification_status === 'verified' 
                    ? 'bg-[#2fc72e]/20 text-[#2fc72e]' 
                    : 'bg-[#f5a623]/20 text-[#f5a623]'
                  }`}
                >
                  {id.verification_status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {facultyData.expertise && facultyData.expertise.length > 0 && (
          <div className="space-y-2 bg-[#313543] p-4 rounded-lg">
            <h3 className="font-semibold text-[#d9e1e8]">Fields of Expertise</h3>
            <div className="space-y-2">
              {facultyData.expertise.map((exp, index) => (
                <div key={index} className="p-2 bg-[#2b303b] rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-[#d9e1e8]">{exp.field_name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                      ${exp.expertise_score > 7 
                        ? 'bg-[#2fc72e]/20 text-[#2fc72e]' 
                        : exp.expertise_score > 4
                          ? 'bg-[#f5a623]/20 text-[#f5a623]'
                          : 'bg-[#9baec8]/20 text-[#9baec8]'
                      }`}
                    >
                      Score: {exp.expertise_score?.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-sm text-[#9baec8] mt-1">
                    {exp.publication_count} publications, {exp.citation_count} citations
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end gap-3 pt-2">
          {onClose && (
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-[#313543] hover:bg-[#414656] text-[#d9e1e8] rounded-lg"
            >
              Close
            </button>
          )}
          
          {facultyData.verification_status !== 'verified' && (
            <button 
              className="px-4 py-2 bg-[#2b90d9] hover:bg-[#2b90d9]/80 text-white rounded-lg"
            >
              Verify Identity
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationInterface;