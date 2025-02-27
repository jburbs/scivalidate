// src/DynamicJSXPreviewer.jsx
import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import mockFacultyData from '../public/mock-faculty-data.js';

// Mock components to handle missing dependencies
const MockBadge = ({ children, variant }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    variant === 'success' ? 'bg-green-100 text-green-800' : 
    variant === 'warning' ? 'bg-yellow-100 text-yellow-800' :
    variant === 'secondary' ? 'bg-gray-100 text-gray-800' :
    'bg-blue-100 text-blue-800'
  }`}>
    {children}
  </span>
);

const MockCard = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
    {children}
  </div>
);

const MockCardHeader = ({ children }) => (
  <div className="px-6 py-4 border-b border-gray-200">
    {children}
  </div>
);

const MockCardContent = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

// Mock ReputationBadge component
const MockReputationBadge = ({ onSelect }) => (
  <button 
    onClick={onSelect} 
    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
  >
    View Profile
  </button>
);

// Component Map to replace imported components with mocks
const componentMap = {
  'ReputationBadge': MockReputationBadge,
  'Badge': MockBadge,
  'Card': MockCard,
  'CardHeader': MockCardHeader,
  'CardContent': MockCardContent
};

const mockFetch = async (url) => {
  console.log('Mock fetching:', url);
  
  // Mock the faculty list endpoint
  if (url === '/api/faculty') {
    return {
      ok: true,
      json: async () => mockFacultyData.facultyList
    };
  }
  
  // Mock individual faculty endpoint
  if (url.startsWith('http://localhost:8000/api/faculty/')) {
    const id = url.split('/').pop();
    const faculty = mockFacultyData.facultyDetails[id] || mockFacultyData.facultyDetails.default;
    return {
      ok: true,
      json: async () => faculty
    };
  }
  
  return {
    ok: false,
    json: async () => ({ detail: 'Not found' })
  };
};

// Save the original fetch
const originalFetch = window.fetch;

const DynamicJSXPreviewer = () => {
  const [selectedComponent, setSelectedComponent] = useState('FacultyViewer');
  const [componentCode, setComponentCode] = useState(null);
  const [error, setError] = useState(null);
  
  // Set up mock fetch on component mount
  useEffect(() => {
    window.fetch = mockFetch;
    
    return () => {
      // Restore the original fetch when component unmounts
      window.fetch = originalFetch;
    };
  }, []);
  
  // Load component code based on selection
  useEffect(() => {
    const loadComponent = async () => {
      try {
        setError(null);
        
        // Use the code from your uploaded components
        let code;
        switch(selectedComponent) {
          case 'FacultyViewer':
            code = `
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
        const response = await fetch('/api/faculty');
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
            `;
            break;
          case 'VerificationInterface':
            code = `
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
        // Using port 8000 for FastAPI
        const response = await fetch(\`http://localhost:8000/api/faculty/\${facultyId}\`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || \`HTTP error! status: \${response.status}\`);
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
                <span>{id.identifier_value}</span>
                {id.is_primary && (
                  <Badge variant="secondary">Primary</Badge>
                )}
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
            `;
            break;
          default:
            setError('Component not found');
            return;
        }
        
        setComponentCode(code);
      } catch (err) {
        setError(`Error loading component: ${err.message}`);
        console.error('Error loading component:', err);
      }
    };
    
    loadComponent();
  }, [selectedComponent]);
  
  // Dynamic component rendering function
  const renderComponent = () => {
    if (!componentCode) return null;
    
    try {
      // Replace imports with our mock components
      let modifiedCode = componentCode;
      
      // Replace all imports with our mock components
      Object.keys(componentMap).forEach(compName => {
        const importRegex = new RegExp(`import\\s+${compName}\\s+from\\s+['"].*['"]`, 'g');
        modifiedCode = modifiedCode.replace(importRegex, '');
      });
      
      // Add our component map
      const componentMapCode = `
        // Mock component map
        const ReputationBadge = componentMap.ReputationBadge;
        const Badge = componentMap.Badge;
        const Card = componentMap.Card;
        const CardHeader = componentMap.CardHeader;
        const CardContent = componentMap.CardContent;
      `;
      
      // Insert the component map before the component definition
      const componentDefIndex = modifiedCode.indexOf('const ' + selectedComponent);
      modifiedCode = 
        modifiedCode.substring(0, componentDefIndex) + 
        componentMapCode + 
        modifiedCode.substring(componentDefIndex);
      
      // Remove the export default line
      modifiedCode = modifiedCode.replace(/export\s+default\s+.*/, '');
      
      // Add a return statement to return the component
      modifiedCode += `\nreturn <${selectedComponent} ${selectedComponent === 'VerificationInterface' ? 'facultyId="1"' : ''} />;`;
      
      // Create a function from the modified code
      const ComponentFunction = new Function('React', 'useState', 'useEffect', 'componentMap', modifiedCode);
      
      // Call the function with the required parameters
      return ComponentFunction(React, useState, useEffect, componentMap);
    } catch (err) {
      console.error('Error rendering component:', err);
      return <div className="text-red-500">Error rendering component: {err.message}</div>;
    }
  };
  
  return (
    <div className="p-4">
      <div className="mb-4 flex space-x-4">
        <button
          className={`px-4 py-2 rounded ${selectedComponent === 'FacultyViewer' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setSelectedComponent('FacultyViewer')}
        >
          FacultyViewer
        </button>
        <button
          className={`px-4 py-2 rounded ${selectedComponent === 'VerificationInterface' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setSelectedComponent('VerificationInterface')}
        >
          VerificationInterface
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-xl font-bold mb-4">Preview: {selectedComponent}</h2>
        <ErrorBoundary>
          {renderComponent()}
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default DynamicJSXPreviewer;