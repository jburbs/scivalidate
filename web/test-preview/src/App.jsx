import React, { useState, useEffect } from 'react';
import FacultyList from './components/FacultyList';
import VerificationInterface from './components/VerificationInterface';
import {ReputationBadge, ReputationPopup} from  './components/ReputationBadge';
import NavBar from './components/NavBar';

function App() {
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReputationPopup, setShowReputationPopup] = useState(false);
  const [popupFacultyId, setPopupFacultyId] = useState(null);

  useEffect(() => {
    const fetchFacultyList = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/faculty`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setFacultyList(data);
        
        // Select first faculty member by default if available
        if (data.length > 0 && !selectedFacultyId) {
          setSelectedFacultyId(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching faculty list:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyList();
  }, []);

  const handleReputationBadgeClick = (facultyId) => {
    setPopupFacultyId(facultyId);
    setShowReputationPopup(true);
  };

  const closeReputationPopup = () => {
    setShowReputationPopup(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Scientific Profile Validation</h1>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => window.location.reload()}
          >
            Refresh Data
          </button>
        </div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl">Database loading--slow free service</h1>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => window.location.reload()}
          >
            Refresh Data
          </button>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Error: {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <FacultyList 
              facultyList={facultyList} 
              selectedFacultyId={selectedFacultyId}
              onSelectFaculty={setSelectedFacultyId}
              loading={loading}
              ReputationBadge={({ authorId }) => (
                <ReputationBadge
                  authorId={authorId}
                  onSelect={handleReputationBadgeClick}
                />
              )}
            />
          </div>
          <div className="md:col-span-2">
            {selectedFacultyId ? (
              <VerificationInterface facultyId={selectedFacultyId} />
            ) : (
              <div className="border rounded-lg p-6 bg-white text-center">
                <p className="text-gray-500">Select a faculty member to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reputation Popup Modal */}
      {showReputationPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <ReputationPopup 
            authorId={popupFacultyId} 
            onClose={closeReputationPopup} 
          />
        </div>
      )}
    </div>
  );
}

export default App;