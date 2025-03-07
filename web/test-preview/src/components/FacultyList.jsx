import React, { useState, useEffect } from 'react';

const FacultyList = ({ facultyList, selectedFacultyId, onSelectFaculty, loading, ReputationBadge }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyWithReputation, setShowOnlyWithReputation] = useState(false);
  const [diagnostics, setDiagnostics] = useState({});

  // Deep diagnostic analysis of faculty data
  useEffect(() => {
    if (!facultyList || facultyList.length === 0) {
      console.log("DIAGNOSTIC: Faculty list is empty or undefined");
      return;
    }

    // Analyze reputation scores in the data
    const diagnosticInfo = {
      totalFaculty: facultyList.length,
      facultyWithReputationProperty: 0,
      facultyWithNonNullReputation: 0,
      facultyWithNumericReputation: 0,
      facultyWithPositiveReputation: 0,
      reputationScoreTypes: new Set(),
      reputationValueExamples: {}
    };

    // Record the first 10 faculty for debugging
    const sampleFaculty = facultyList.slice(0, 10).map(f => ({
      id: f.id,
      name: f.display_name,
      hasReputationProperty: 'reputation_score' in f,
      reputationType: typeof f.reputation_score,
      reputationValue: f.reputation_score
    }));

    // Detailed analysis
    facultyList.forEach(faculty => {
      // Track properties
      if ('reputation_score' in faculty) {
        diagnosticInfo.facultyWithReputationProperty++;
        
        // Track value types
        const valueType = typeof faculty.reputation_score;
        diagnosticInfo.reputationScoreTypes.add(valueType);
        
        // Track non-null
        if (faculty.reputation_score !== null) {
          diagnosticInfo.facultyWithNonNullReputation++;
          
          // Track numeric
          if (!isNaN(faculty.reputation_score)) {
            diagnosticInfo.facultyWithNumericReputation++;
            
            // Track positive
            if (faculty.reputation_score > 0) {
              diagnosticInfo.facultyWithPositiveReputation++;

              // Sample some positive values
              if (Object.keys(diagnosticInfo.reputationValueExamples).length < 5) {
                diagnosticInfo.reputationValueExamples[faculty.id] = {
                  name: faculty.display_name,
                  value: faculty.reputation_score
                };
              }
            }
          }
        }
      }
    });

    // Convert Set to Array for logging
    diagnosticInfo.reputationScoreTypes = Array.from(diagnosticInfo.reputationScoreTypes);
    diagnosticInfo.sampleFaculty = sampleFaculty;

    // Set for component use and log for console
    setDiagnostics(diagnosticInfo);
    console.log("==== FACULTY LIST DIAGNOSTICS ====");
    console.log("Data Summary:", diagnosticInfo);
    console.log("Sample Faculty:", sampleFaculty);
  }, [facultyList]);

  // Monitor the filter state
  useEffect(() => {
    console.log("==== FILTER STATE CHANGED ====");
    console.log("showOnlyWithReputation:", showOnlyWithReputation);
  }, [showOnlyWithReputation]);

  // Helper function to check if faculty has a valid reputation score
  const hasValidReputationScore = (faculty) => {
    const result = (
      'reputation_score' in faculty &&
      faculty.reputation_score !== null && 
      faculty.reputation_score !== undefined && 
      !isNaN(faculty.reputation_score) &&
      faculty.reputation_score > 0
    );
    
    // For debugging specific faculty members
    if (faculty.id === selectedFacultyId) {
      console.log("==== CHECKING SELECTED FACULTY ====");
      console.log("Faculty:", {
        id: faculty.id,
        name: faculty.display_name,
        hasProperty: 'reputation_score' in faculty,
        reputationValue: faculty.reputation_score,
        reputationType: typeof faculty.reputation_score,
        isValid: result
      });
    }
    
    return result;
  };
  
  // Filter faculty list based on search term and reputation filter
  const getFilteredFaculty = () => {
    if (!facultyList) return [];

    const filtered = facultyList.filter(faculty => {
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

    // Debug filtered results
    console.log(`==== FILTER RESULTS: ${filtered.length} faculty after filtering ====`);
    if (showOnlyWithReputation) {
      console.log(`Reputation filter active: ${filtered.length} faculty with valid reputation scores`);
      if (filtered.length > 0) {
        console.log("First 3 faculty with reputation scores:", 
          filtered.slice(0, 3).map(f => ({
            id: f.id,
            name: f.display_name,
            score: f.reputation_score
          }))
        );
      } else {
        console.log("NO FACULTY with valid reputation scores found!");
      }
    }

    return filtered;
  };

  const filteredFaculty = getFilteredFaculty();

  // Ensure checkbox toggling works properly
  const handleReputationFilterToggle = (e) => {
    const newValue = e.target.checked;
    console.log("==== TOGGLING REPUTATION FILTER ====");
    console.log("Previous value:", showOnlyWithReputation);
    console.log("New value:", newValue);
    setShowOnlyWithReputation(newValue);
  };

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
              onChange={handleReputationFilterToggle}
            />
            <label htmlFor="reputation-filter" className="text-sm text-gray-700">
              Show only with reputation
            </label>
          </div>
        </div>

        {/* Diagnostic information panel */}
        {diagnostics.totalFaculty && (
          <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
            <details>
              <summary className="cursor-pointer font-medium">Diagnostics (click to expand)</summary>
              <div className="mt-2 space-y-1">
                <p>Total faculty: {diagnostics.totalFaculty}</p>
                <p>With reputation property: {diagnostics.facultyWithReputationProperty}</p>
                <p>With non-null reputation: {diagnostics.facultyWithNonNullReputation}</p>
                <p>With numeric reputation: {diagnostics.facultyWithNumericReputation}</p>
                <p>With positive reputation: {diagnostics.facultyWithPositiveReputation}</p>
                <p>Reputation value types: {diagnostics.reputationScoreTypes?.join(', ') || 'none'}</p>
                <p>Filter state: {showOnlyWithReputation ? 'active' : 'inactive'}</p>
                <p>Filtered results: {filteredFaculty.length}</p>
              </div>
            </details>
          </div>
        )}
        
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
                  onClick={() => {
                    console.log("Selecting faculty:", {
                      id: faculty.id,
                      name: faculty.display_name,
                      hasReputationScore: hasValidReputationScore(faculty),
                      reputationValue: faculty.reputation_score
                    });
                    onSelectFaculty(faculty.id);
                  }}
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
                        <ReputationBadge authorId={faculty.id} />
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
          {showOnlyWithReputation && diagnostics.facultyWithPositiveReputation > 0 && (
            <span> (There should be {diagnostics.facultyWithPositiveReputation} faculty with reputation scores)</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyList;