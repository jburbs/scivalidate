import React, { useState, useEffect } from 'react';
import MastodonNavBar from './MastodonNavBar';
import MastodonTimeline from './MastodonTimeline';
import MastodonProfile from './MastodonProfile';
import MastodonSidebar from './MastodonSidebar';
import DemoControls from './DemoControls';
import VerificationInterface from './VerificationInterface';
// Import the service for API calls
import { validatePostContent } from '@scivalidate/api-client';;

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
    <div className="min-h-screen bg-[#191b22] w-full">
      {/* Mastodon navbar */}
      <div className="bg-[#313543] text-white w-full">
        <div className="max-w-full mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mastodon logo */}
              <div className="text-2xl font-bold">
                <svg width="28" height="28" viewBox="0 0 74 79" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M73.7014 17.4323C72.5616 9.09705 65.1774 2.4175 56.424 1.17041C54.9472 0.939098 49.3518 0.161548 36.5581 0.161548H36.4675C23.6737 0.161548 20.2483 0.939098 18.7715 1.17041C10.2274 2.36908 2.63498 8.68829 0.451795 16.7747C-0.31248 20.0645 -0.0832212 23.6158 0.0983462 27.047C0.325153 31.5286 0.348391 35.9173 0.735007 40.2919C1.00508 43.5817 1.39869 46.8666 1.91389 50.1291C2.84182 55.5255 8.54709 60.1405 13.4524 62.8177C18.5089 65.5676 24.0189 67.209 29.7068 67.6519C34.4756 67.9999 39.2653 68.0099 44.0361 67.682C49.1465 67.3291 54.5466 66.1158 59.1231 63.3323C59.2977 63.2267 59.4634 63.1117 59.6179 62.9881C59.6782 62.9396 59.7198 62.8718 59.7366 62.7966C59.7535 62.7214 59.7448 62.6427 59.7119 62.574C59.679 62.5052 59.6238 62.4502 59.5552 62.4184C59.4866 62.3865 59.4084 62.3798 59.335 62.3994L59.326 62.4026C55.6511 63.3862 51.8909 64.0471 48.0926 64.3797C41.8409 64.929 35.538 64.9035 29.2922 64.3035C28.022 64.1543 26.7674 63.9051 25.5364 63.5577C25.4168 63.5262 25.3031 63.475 25.2009 63.4064C25.0987 63.3378 25.0097 63.2529 24.938 63.1553C24.8664 63.0578 24.8133 62.9492 24.7812 62.8344C24.7491 62.7195 24.7385 62.6001 24.7498 62.4815C24.7611 62.3629 24.7942 62.2475 24.847 62.1408C24.8998 62.034 24.9714 61.9378 25.058 61.8566C25.1446 61.7755 25.2447 61.7106 25.3535 61.6648C25.4622 61.619 25.5778 61.5932 25.6947 61.5885C25.7079 61.5885 25.7199 61.5873 25.7331 61.5861C31.681 60.5977 37.3693 58.5368 42.3842 55.2136C47.0217 52.1608 50.7242 47.9958 53.2062 43.0981L53.3367 42.8513C53.3661 42.7978 53.3815 42.7379 53.3815 42.6768C53.3815 42.6157 53.3661 42.5558 53.3367 42.5023C53.3073 42.4489 53.2649 42.4042 53.2138 42.3734C53.1627 42.3426 53.1046 42.3267 53.0458 42.3274H42.7058C42.6486 42.328 42.5924 42.3441 42.5426 42.3744C42.4929 42.4046 42.4512 42.4479 42.4211 42.5C42.391 42.552 42.3736 42.6113 42.3704 42.672C42.3672 42.7327 42.3784 42.7932 42.4027 42.8477C42.4027 42.8489 42.4039 42.8501 42.4039 42.8513C43.2922 44.9563 43.7519 47.2378 43.7519 49.5478C43.7519 50.7765 43.5947 51.9993 43.2852 53.1811C41.9167 58.402 38.0452 62.2234 32.8239 63.5577C30.9336 64.0248 28.9941 64.2259 27.0522 64.1566C24.0068 64.0471 21.1286 63.0357 18.7536 61.2285C16.5382 59.5318 14.7663 57.3178 13.5804 54.7744C13.3839 54.3097 13.2118 53.8339 13.066 53.3505C12.7759 52.327 12.583 51.2732 12.4901 50.2074C12.3303 48.2854 12.2503 46.3544 12.2503 44.4246C12.2503 43.4508 12.2599 42.477 12.2804 41.5032C12.3459 38.1723 12.4553 34.845 12.6086 31.5213C12.7175 29.0967 12.8361 26.6721 12.9691 24.2475C13.0154 23.2544 13.083 22.2625 13.1734 21.2741C13.3219 19.7564 13.8371 18.3007 14.6777 17.0332C15.5183 15.7656 16.656 14.7292 17.9921 14.0205C20.3147 12.7409 22.9239 12.07 25.577 12.07H48.3823C52.3255 12.07 55.9914 13.4387 58.8085 15.8044C60.0843 16.8713 61.1235 18.1856 61.8573 19.6638C62.5911 21.1419 63.0026 22.753 63.0647 24.3941C63.186 27.1986 63.1288 30.0079 62.8934 32.8075C62.6353 35.8857 62.2139 38.9472 61.6312 41.9775C61.321 43.581 60.9193 45.1655 60.4287 46.724C60.3007 47.1065 60.1631 47.4865 60.0159 47.8629C59.8662 48.24 59.7058 48.6124 59.5348 48.9801C58.9904 50.2372 58.3319 51.4395 57.5712 52.5731C57.1923 53.1527 56.7891 53.7129 56.3632 54.2523C55.6226 55.1866 54.8017 56.0508 53.9089 56.8347C52.7388 57.8992 51.4437 58.8138 50.054 59.5584C49.5048 59.8584 48.9412 60.1362 48.365 60.3908C47.8006 60.6368 47.2275 60.8586 46.6447 61.0561C45.0719 61.6064 43.4427 62.0059 41.7856 62.2501C40.4125 62.449 39.0298 62.5497 37.6452 62.5517H36.4446C34.7862 62.5517 33.1278 62.4278 31.4885 62.18C28.4048 61.7258 25.3942 60.8188 22.5535 59.4872C22.4699 59.4463 22.3793 59.4211 22.2872 59.4127C22.1951 59.4044 22.1026 59.413 22.0144 59.438C21.9262 59.4631 21.8439 59.5041 21.7724 59.559C21.7009 59.6139 21.6415 59.6818 21.5976 59.7585C21.5538 59.8351 21.5263 59.9191 21.5169 60.0055C21.5076 60.0919 21.5164 60.1791 21.5429 60.2618C21.5695 60.3444 21.6133 60.421 21.6716 60.4871C21.7298 60.5532 21.8014 60.6076 21.8823 60.6473C22.5643 60.9892 23.2656 61.2959 23.9843 61.5658C24.6544 61.8149 25.3366 62.0315 26.029 62.2153C27.2348 62.5224 28.4591 62.7519 29.6931 62.9022C30.6299 63.0202 31.5703 63.0969 32.5131 63.1325C33.7416 63.1797 34.9725 63.1751 36.2016 63.1186C38.114 63.0345 40.0118 62.7765 41.8718 62.3481C42.4271 62.2194 42.9772 62.0715 43.5213 61.9043C44.0991 61.7225 44.6695 61.52 45.2315 61.297C45.7599 61.0764 46.2789 60.836 46.7878 60.5761C47.3047 60.3126 47.8121 60.0292 48.3083 59.7269C50.6584 58.3067 52.6889 56.4312 54.2852 54.2157C54.8901 53.3272 55.43 52.3973 55.9005 51.433C56.2983 50.6135 56.6446 49.7708 56.9384 48.9085C57.149 48.2883 57.334 47.6578 57.4924 47.0182C57.6593 46.3448 57.8055 45.6665 57.9313 44.9831C58.3095 42.829 58.5726 40.6472 58.7181 38.4523C58.8923 35.9091 58.9487 33.3597 58.8868 30.8116C58.8347 28.6815 58.742 26.5539 58.6083 24.4288C58.5461 23.5123 58.3511 22.6105 58.03 21.7501C57.7089 20.8897 57.2659 20.0802 56.7179 19.3523C55.8228 18.1293 54.6942 17.1016 53.3931 16.3293C51.8757 15.4182 50.1478 14.876 48.3668 14.7517C46.1117 14.5838 43.8482 14.502 41.5847 14.5063H25.5687C23.7865 14.5063 22.0245 14.9044 20.4361 15.6648C19.6434 16.0706 18.9205 16.6018 18.2978 17.2361C17.675 17.8704 17.1606 18.5994 16.774 19.3937C16.3327 20.3029 16.0513 21.2703 15.9399 22.2625C15.803 23.5097 15.6982 24.7604 15.6254 26.0134C15.5257 27.8376 15.4461 29.6641 15.3865 31.4929C15.2934 34.6945 15.2384 37.8996 15.2223 41.1072C15.2141 43.4302 15.268 45.7531 15.3842 48.0739C15.4461 49.5018 15.5873 50.9226 15.8097 52.3292C15.889 52.8521 15.9899 53.371 16.1129 53.884C16.4397 55.3124 16.9498 56.6854 17.6289 57.9674C19.027 60.5395 21.1562 62.6295 23.7339 64.0116C26.7701 65.6371 30.1529 66.48 33.5953 66.4777C36.9694 66.4777 40.3458 66.0774 43.6448 65.2881C47.9861 64.2501 52.1778 62.7099 56.1452 60.691C60.2931 58.5771 63.841 55.4515 66.4301 51.6068C69.3532 47.3031 71.2412 42.3802 71.9612 37.2424C72.1752 35.6744 72.2975 34.0951 72.328 32.5111C72.3701 30.5049 72.367 28.4987 72.3184 26.4947C72.2813 24.9924 72.2161 23.4912 72.1229 21.9923C72.0317 20.4992 71.8935 19.0107 71.7079 17.5258C71.703 17.4932 71.703 17.4602 71.7079 17.4275L73.7014 17.4323Z" fill="white"/>
                </svg>
              </div>
              <span className="text-xl font-bold hidden md:block">Mastodon</span>
            </div>
            
            <div className="flex items-center">
              <div className="text-white bg-[#563acc] rounded-md py-1 px-3 text-sm mr-4">
                SciValidate Reputation Badge Demo
              </div>
              
              <select 
                className="bg-[#1f232b] text-white border border-[#313543] rounded px-2 py-1 text-sm"
                value={activePerspective}
                onChange={(e) => handleChangePerspective(e.target.value)}
              >
                <option value="reader">Reader View</option>
                <option value="poster">Poster View</option>
                <option value="admin">Admin View</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex w-full">
        {/* Left sidebar with navigation options */}
        <MastodonSidebar 
          activeView={activeView} 
          setActiveView={setActiveView}
          activePerspective={activePerspective}
        />
        
        {/* Main content area */}
        <div className="flex-1 border-x border-[#313543]">
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2b90d9]"></div>
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
          
          {/* Other potential views can be added here */}
        </div>
        
        {/* Right sidebar with demonstration controls */}
        <DemoControls 
          activePerspective={activePerspective}
          onChangePerspective={handleChangePerspective}
        />
      </div>

      {/* Verification Interface Modal */}
      {showVerificationInterface && verificationId && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setShowVerificationInterface(false)}
        >
          <div 
            className="max-w-3xl w-full"
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