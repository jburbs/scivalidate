import React, { useState, useEffect } from 'react';
// Import from the local components/ui path
import { Card, CardHeader, CardContent } from './ui/card';
import { Badge } from './ui/badge';

const VerificationInterface = ({ facultyId }) => {
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

  if (loading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6">
          <div className="text-red-500">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!facultyData) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6">
          <div>No faculty data available</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <h2 className="text-2xl font-bold">{facultyData.display_name}</h2>
        <p className="text-gray-600">{facultyData.position}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-semibold">Institution</h3>
          <p>{facultyData.institution}</p>
          <p className="text-gray-600">{facultyData.department}</p>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Academic Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">H-index</p>
              <p className="text-xl font-semibold">{facultyData.h_index}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Citations</p>
              <p className="text-xl font-semibold">{facultyData.total_citations}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Publications</p>
              <p className="text-xl font-semibold">{facultyData.publication_count}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Latest Publication</p>
              <p className="text-xl font-semibold">{facultyData.latest_publication_year}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Identifiers</h3>
          <div className="space-y-2">
            {facultyData.identifiers?.map((id, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-gray-600">{id.identifier_type}:</span>
                <span>{String(id.identifier_value)}</span>
                {id.is_primary > 0 ? (
                  <Badge variant="secondary">Primary</Badge>
                ) : null}
                <Badge 
                  variant={id.verification_status === 'verified' ? 'success' : 'warning'}
                >
                  {id.verification_status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {facultyData.expertise && facultyData.expertise.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Fields of Expertise</h3>
            <div className="space-y-2">
              {facultyData.expertise.map((exp, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{exp.field_name}</span>
                    <span className="text-sm text-gray-600">
                      Score: {exp.expertise_score?.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {exp.publication_count} publications, {exp.citation_count} citations
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VerificationInterface;