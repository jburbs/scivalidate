import React, { useState, useEffect } from 'react';
import ReputationBadge from './ReputationBadge';
import VerificationInterface from './VerificationInterface';

// This component displays a grid of faculty members and manages the display
// of their detailed verification information
const FacultyViewer = () => {
  const [faculty, setFaculty] = useState([]);
  const [selectedAuthorId, setSelectedAuthorId] = useState(null);
  const [error, setError] = useState(null);

  // Fetch the list of faculty members when the component mounts
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        // This endpoint should return basic information for all faculty members
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/faculty`);
        if (!response.ok) {
          throw new Error('Failed to load faculty data');
        }
        const data = await response.json();
        setFaculty(data);
      } catch (err) {
        setError('Failed to load faculty data');
        console.error('Error:', err);
      }
    };

    fetchFaculty();
  }, []);

  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!faculty.length) return <div className="p-4">Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">SciValidate Faculty Registry</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {faculty.map((member) => (
          <div key={member.id} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-semibold">{member.display_name}</h2>
                <p className="text-gray-600">{member.position}</p>
                <p className="text-gray-500 text-sm">{member.department}</p>
              </div>
              <ReputationBadge 
                onSelect={() => setSelectedAuthorId(member.id)}
              />
            </div>
          </div>
        ))}
      </div>

      {selectedAuthorId && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          onClick={() => setSelectedAuthorId(null)}
        >
          <div onClick={e => e.stopPropagation()}>
            <VerificationInterface
              facultyId={selectedAuthorId}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyViewer;