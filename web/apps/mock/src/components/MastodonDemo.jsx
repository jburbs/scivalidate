import React, { useState, useEffect } from 'react';
import MastodonNavBar from './MastodonNavBar';
import MastodonTimeline from './MastodonTimeline';
import MastodonProfile from './MastodonProfile';
import MastodonSidebar from './MastodonSidebar';
import VerificationInterface from './VerificationInterface';
import { validatePostContent } from '@scivalidate/api-client';
import './MastodonStyles.css';

// Create a right sidebar component that follows the Mastodon structure
const RightSidebar = () => {
  return (
    <div className="columns-area__panels__pane w-[350px] hidden lg:block ml-4">
      <div className="columns-area__panels__pane__inner">
        {/* About SciValidate Section */}
        <div className="getting-started bg-[#15181c] rounded-xl mb-4">
          <div className="p-4">
            <h3 className="text-xl font-bold text-[#e6eef9] mb-3">About SciValidate</h3>
            <p className="text-[#8899a6] mb-3">
              This demonstration showcases how a reputation badge system could integrate with Mastodon, enhancing trust and credibility in the Fediverse.
            </p>
          </div>
          
          {/* How to use section */}
          <div className="getting-started__footer p-4 border-t border-[#2e3338]">
            <h3 className="text-lg font-bold text-[#e6eef9] mb-3">How To Use This Demo</h3>
            <ul className="space-y-2 text-[#8899a6]">
              <li className="flex items-start gap-2">
                <span className="text-[#595aff]">•</span> 
                <span>Click on user profiles to see their reputation badges</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#595aff]">•</span> 
                <span>Switch perspectives using the dropdown in the top bar</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#595aff]">•</span> 
                <span>Try the verification process in the Poster view</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#595aff]">•</span> 
                <span>Review badge claims in the Admin view</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#595aff]">•</span> 
                <span>Notice scientific validation indicators on posts with claims</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Trending Section - Following Mastodon's structure */}
        <div className="getting-started__trends bg-[#15181c] rounded-xl">
          <div className="p-4">
            <h4 className="text-xl font-bold text-[#e6eef9] mb-3">
              <a href="#">Trending now</a>
            </h4>
            
            <div className="trends__item mb-3 pb-3 border-b border-[#2e3338]">
              <div className="trends__item__name">
                <a href="#" className="text-[#e6eef9] font-bold">#OpenScience</a>
                <div className="text-[#8899a6] text-sm mt-1">
                  <strong>2,543</strong> people in the past 2 days
                </div>
              </div>
              <div className="trends__item__sparkline mt-1">
                <svg viewBox="0 0 50 28" preserveAspectRatio="none" className="w-full h-8">
                  <g>
                    <path d="M2 26 C 3.9 26 7.7 26 9.6 26 C 11.6 26 15.4 26 17.3 26 C 19.2 26 23.1 26 25 26 C 26.9 26 30.7 26 32.7 26 C 34.6 26 38.4 26 40.3 26 C 42.2 26 46.1 2 48 2 L48 26 2 26 2 26" style={{stroke: "none", strokeWidth: 0, fillOpacity: 0.1, fill: "#6364ff"}} />
                    <path d="M2 26 C 3.9 26 7.7 26 9.6 26 C 11.6 26 15.4 26 17.3 26 C 19.2 26 23.1 26 25 26 C 26.9 26 30.7 26 32.7 26 C 34.6 26 38.4 26 40.3 26 C 42.2 26 46.1 2 48 2" style={{stroke: "#6364ff", strokeWidth: 1, fill: "none"}} />
                  </g>
                </svg>
              </div>
            </div>
            
            <div className="trends__item mb-3 pb-3 border-b border-[#2e3338]">
              <div className="trends__item__name">
                <a href="#" className="text-[#e6eef9] font-bold">#PeerReview</a>
                <div className="text-[#8899a6] text-sm mt-1">
                  <strong>1,892</strong> people in the past 2 days
                </div>
              </div>
              <div className="trends__item__sparkline mt-1">
                <svg viewBox="0 0 50 28" preserveAspectRatio="none" className="w-full h-8">
                  <g>
                    <path d="M2 26 C 3.9 26 7.7 24 9.6 24 C 11.6 24 15.4 25 17.3 25 C 19.2 25 23.1 24 25 24 C 26.9 24 30.7 24 32.7 24 C 34.6 24 38.4 26 40.3 26 C 42.2 26 46.1 2 48 2 L48 26 2 26 2 26" style={{stroke: "none", strokeWidth: 0, fillOpacity: 0.1, fill: "#6364ff"}} />
                    <path d="M2 26 C 3.9 26 7.7 24 9.6 24 C 11.6 24 15.4 25 17.3 25 C 19.2 25 23.1 24 25 24 C 26.9 24 30.7 24 32.7 24 C 34.6 24 38.4 26 40.3 26 C 42.2 26 46.1 2 48 2" style={{stroke: "#6364ff", strokeWidth: 1, fill: "none"}} />
                  </g>
                </svg>
              </div>
            </div>
            
            <div className="trends__item">
              <div className="trends__item__name">
                <a href="#" className="text-[#e6eef9] font-bold">#DecentralizedIdentity</a>
                <div className="text-[#8899a6] text-sm mt-1">
                  <strong>1,105</strong> people in the past 2 days
                </div>
              </div>
              <div className="trends__item__sparkline mt-1">
                <svg viewBox="0 0 50 28" preserveAspectRatio="none" className="w-full h-8">
                  <g>
                    <path d="M2 26 C 3.9 26 7.7 26 9.6 26 C 11.6 26 15.4 25 17.3 25 C 19.2 25 23.1 26 25 26 C 26.9 26 30.7 25 32.7 25 C 34.6 25 38.4 26 40.3 26 C 42.2 26 46.1 2 48 2 L48 26 2 26 2 26" style={{stroke: "none", strokeWidth: 0, fillOpacity: 0.1, fill: "#6364ff"}} />
                    <path d="M2 26 C 3.9 26 7.7 26 9.6 26 C 11.6 26 15.4 25 17.3 25 C 19.2 25 23.1 26 25 26 C 26.9 26 30.7 25 32.7 25 C 34.6 25 38.4 26 40.3 26 C 42.2 26 46.1 2 48 2" style={{stroke: "#6364ff", strokeWidth: 1, fill: "none"}} />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MastodonDemo = () => {
  // State to manage which view is active (timeline, profile, etc.)
  const [activeView, setActiveView] = useState('timeline');
  // State to track which user perspective we're viewing from
  const [activePerspective, setActivePerspective] = useState('reader');
  // State to store the selected profile when viewing a specific user
  const [selectedProfile, setSelectedProfile] = useState(null);
  // State to track if verification interface should be shown
  const [showVerificationInterface, setShowVerificationInterface] = useState(false);
  // State to track the ID for verification
  const [verificationId, setVerificationId] = useState(null);
  // State to store faculty data from API
  const [facultyData, setFacultyData] = useState([]);
  // State to track loading status
  const [isLoading, setIsLoading] = useState(false);

  // Fetch faculty data when component mounts
  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        console.log('Fetching faculty data from API...');
        setIsLoading(true);
        
        // Use our test author IDs
        const testAuthorIds = [
          '00000001-0000-4000-a000-000000000001',
          '00000002-0000-4000-a000-000000000002',
          '00000003-0000-4000-a000-000000000003',
          '00000004-0000-4000-a000-000000000004',
          '00000005-0000-4000-a000-000000000005'
        ];
        
        const apiUrl = import.meta.env.VITE_API_URL || 'https://scivalidate.onrender.com';
        
        const authorPromises = testAuthorIds.map(id => 
          fetch(`${apiUrl}/api/faculty/${id}`)
            .then(res => {
              if (!res.ok) {
                console.warn(`Failed to fetch author ${id}: ${res.status}`);
                return null;
              }
              return res.json();
            })
            .catch(err => {
              console.error(`Error fetching author ${id}:`, err);
              return null;
            })
        );
        
        const authorsData = await Promise.all(authorPromises);
        const validAuthors = authorsData.filter(author => author !== null);
        console.log(`Received ${validAuthors.length} faculty records from API`);
        setFacultyData(validAuthors);
      } catch (error) {
        console.error('Error fetching faculty data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFacultyData();
  }, []);

  // Map faculty data to the format expected by the Mastodon components
  const mapFacultyToUsers = (facultyList) => {
    return facultyList.map(faculty => {
      // Determine verification status
      const verificationStatus = 
        faculty.identifiers?.some(id => id.verification_status === 'verified') 
          ? 'verified' 
          : faculty.identifiers?.length > 0 
            ? 'pending' 
            : 'unverified';
      
      // Create a single badge based on verification status
      const badge = {
        id: `${faculty.id}-identity`,
        type: 'identity',
        status: verificationStatus,
        name: 'Author Identity'
      };
      
      return {
        id: faculty.id,
        displayName: faculty.display_name,
        // Use the actual email if available, otherwise create a placeholder
        username: faculty.email || `${faculty.given_name.toLowerCase()}.${faculty.family_name.toLowerCase()}@academia.edu`,
        avatar: faculty.avatar_url || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
        badges: verificationStatus !== 'unverified' ? [badge] : [],
        // Add additional faculty data for profile view
        facultyData: faculty
      };
    });
  };

  // Handle clicking on a user in the timeline to view their profile
  const handleProfileClick = (profile) => {
    // If the profile has a facultyId, fetch additional data
    if (profile.id) {
      setIsLoading(true);
      // Try to use sciValidateService if available
      try {
        sciValidateService.getAuthorReputation(profile.id)
          .then(reputationData => {
            setSelectedProfile({
              ...profile,
              reputationData
            });
            setActiveView('profile');
            setIsLoading(false);
          })
          .catch(error => {
            console.error('Error fetching reputation data:', error);
            setSelectedProfile(profile);
            setActiveView('profile');
            setIsLoading(false);
          });
      } catch (error) {
        console.error('Error with sciValidateService:', error);
        setSelectedProfile(profile);
        setActiveView('profile');
        setIsLoading(false);
      }
    } else {
      setSelectedProfile(profile);
      setActiveView('profile');
    }
  };

  // Handle returning to the timeline
  const handleBackToTimeline = () => {
    setActiveView('timeline');
    setSelectedProfile(null);
  };

  // Switch between reader, poster, and admin perspectives
  const handleChangePerspective = (perspective) => {
    setActivePerspective(perspective);
    // Reset to timeline view when changing perspectives
    setActiveView('timeline');
    setSelectedProfile(null);
  };

  // Handle showing full verification interface
  const handleShowVerification = (facultyId) => {
    setVerificationId(facultyId);
    setShowVerificationInterface(true);
  };

  // Map the faculty data to get users for the timeline
  const mappedUsers = facultyData.length > 0 ? mapFacultyToUsers(facultyData) : [];

  return (
    
    <div className="min-h-screen bg-black text-[#e6eef9]">
      {/* Modern Mastodon navbar */}
      <MastodonNavBar 
        activePerspective={activePerspective}
        onChangePerspective={handleChangePerspective}
      />
      
      <div className="columns-area flex max-w-7xl mx-auto">
        {/* Left sidebar with navigation options */}
        <MastodonSidebar 
          activeView={activeView} 
          setActiveView={setActiveView}
          activePerspective={activePerspective}
        />

        {/* Main content area */}
        <div className="columns-area__panels flex-1 min-w-0 max-w-[600px] mx-auto">
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1d9bf0]"></div>
            </div>
          )}
          
          {!isLoading && activeView === 'timeline' && (
            <MastodonTimeline 
              onProfileClick={handleProfileClick} 
              activePerspective={activePerspective}
              users={mappedUsers} // Pass the mapped users from API
            />
          )}
          
          {!isLoading && activeView === 'profile' && selectedProfile && (
            <MastodonProfile 
              profile={selectedProfile} 
              onBack={handleBackToTimeline}
              activePerspective={activePerspective}
              onShowVerification={handleShowVerification}
            />
          )}
        </div>
        
        {/* Right sidebar with trending and info */}
        <RightSidebar />
      </div>

      {/* Verification Interface Modal */}
      {showVerificationInterface && verificationId && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowVerificationInterface(false)}
        >
          <div 
            className="max-w-3xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <VerificationInterface
              facultyId={verificationId}
              onClose={() => setShowVerificationInterface(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MastodonDemo;