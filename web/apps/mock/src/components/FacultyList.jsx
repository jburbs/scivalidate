import React, { useState } from 'react';

const FacultyList = ({ facultyList, selectedFacultyId, onSelectFaculty, loading, ReputationBadge }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyWithReputation, setShowOnlyWithReputation] = useState(false);

  // Helper function to check if faculty has a valid reputation score
  const hasValidReputationScore = (faculty) => {
    return (
      faculty.reputation_score !== undefined && 
      faculty.reputation_score !== null && 
      !isNaN(faculty.reputation_score) &&
      faculty.reputation_score > 0
    );
  };
  
  // Filter faculty list based on search term and reputation filter
  const filteredFaculty = facultyList.filter(faculty => {
    // Filter by search term
    const matchesSearch = (
      faculty.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (faculty.department && faculty.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (faculty.institution && faculty.institution.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    // Filter by reputation score if checkbox is checked
    const matchesReputationFilter = showOnlyWithReputation 
      ? hasValidReputationScore(faculty) 
      : true;
    
    return matchesSearch && matchesReputationFilter;
  });

  if (loading) {
    return (
      <div className="bg-white border rounded-lg shadow-sm">
        <div className="p-4">
          <div className="flex items-center border rounded-md mb-4">
            <input
              type="text"
              className="w-full p-2 rounded-md"
              placeholder="Search faculty..."
              value=""
              disabled
            />
          </div>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Count faculty with reputation scores for informational purposes
  const facultyWithReputation = facultyList.filter(faculty => 
    hasValidReputationScore(faculty)
  ).length;

  return (
    <div className="bg-white border rounded-lg shadow-sm h-full">
      <div className="p-4">
        <div className="flex items-center border rounded-md mb-4">
          <input
            type="text"
            className="w-full p-2 rounded-md"
            placeholder="Search faculty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="p-2 text-gray-500 hover:text-gray-700"
              onClick={() => setSearchTerm('')}
            >
              ✕
            </button>
          )}
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Faculty List</h2>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="reputation-filter"
              className="mr-2"
              checked={showOnlyWithReputation}
              onChange={(e) => setShowOnlyWithReputation(e.target.checked)}
            />
            <label htmlFor="reputation-filter" className="text-sm text-gray-700">
              Show only with reputation ({facultyWithReputation})
            </label>
          </div>
        </div>
        
        {filteredFaculty.length === 0 ? (
          <p className="text-center text-gray-500 my-8">No faculty members found</p>
        ) : (
          <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
            {filteredFaculty.map((faculty) => (
              <div
                key={faculty.id}
                className="rounded-lg border transition-colors"
              >
                <div
                  className={`p-3 rounded-lg cursor-pointer ${
                    selectedFacultyId === faculty.id 
                      ? 'bg-blue-500 text-white border-blue-600' 
                      : 'bg-white hover:bg-gray-50 border-gray-200'
                  }`}
                  onClick={() => onSelectFaculty(faculty.id)}
                >
                  <div className="flex justify-between">
                    <div>
                      <div className="font-medium">{faculty.display_name}</div>
                      <div className={`text-sm ${selectedFacultyId === faculty.id ? 'text-blue-100' : 'text-gray-500'}`}>
                        {faculty.department && <span>{faculty.department}, </span>}
                        {faculty.institution}
                      </div>
                      {faculty.h_index && (
                        <div className="flex items-center mt-1 text-xs">
                          <span className={`px-1.5 py-0.5 rounded ${
                            selectedFacultyId === faculty.id ? 'bg-blue-600' : 'bg-gray-100'
                          }`}>
                            h-index: {faculty.h_index}
                          </span>
                          <span className="mx-1">•</span>
                          <span>
                            {faculty.publication_count} publications
                          </span>
                          {/* Display reputation score if available and valid */}
                          {hasValidReputationScore(faculty) && (
                            <>
                              <span className="mx-1">•</span>
                              <span className={`px-1.5 py-0.5 rounded ${
                                selectedFacultyId === faculty.id ? 'bg-blue-600' : 'bg-green-100'
                              }`}>
                                Rep: {faculty.reputation_score.toFixed(2)}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    {ReputationBadge && (
                      <div className={selectedFacultyId === faculty.id ? 'text-white' : ''}>
                        <ReputationBadge 
                          badge={{
                            id: faculty.id,
                            type: 'expertise',
                            status: 'unverified',  // This will be updated by the component based on API data
                            name: 'Expert'
                          }}
                          authorId={faculty.id}
                          mode="user" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4 text-sm text-gray-500">
          {filteredFaculty.length} of {facultyList.length} faculty members
          {showOnlyWithReputation && (
            <span> (showing faculty with reputation scores)</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyList;