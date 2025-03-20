import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, MessageCircle, Repeat, Share, Calendar, Link, MapPin } from 'lucide-react';
import ReputationBadge from './ReputationBadge';
import StarRating from './StarRating';
import BadgeClaimModal from './BadgeClaimModal';
import BadgeVerificationModal from './BadgeVerificationModal';
import { validatePostContent } from '@scivalidate/api-client';;

const MastodonProfile = ({ profile, onBack, activePerspective, onShowVerification }) => {
  const [activeTab, setActiveTab] = useState('posts');
  const [showBadgeDetails, setShowBadgeDetails] = useState(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [reputationData, setReputationData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Fetch additional reputation data if needed
  useEffect(() => {
    const fetchReputationData = async () => {
      if (profile && profile.id && !profile.reputationData) {
        try {
          setLoading(true);
          const data = await sciValidateService.getAuthorReputation(profile.id);
          setReputationData(data);
        } catch (error) {
          console.error('Error fetching reputation data:', error);
        } finally {
          setLoading(false);
        }
      } else if (profile && profile.reputationData) {
        // Use the reputation data passed in the profile
        setReputationData(profile.reputationData);
      }
    };

    fetchReputationData();
  }, [profile]);

  // Use faculty data if available
  const facultyData = profile?.facultyData;
  
  // Generate mock posts for the profile
  const posts = [
    {
      id: 101,
      content: 'Just published a new paper on decentralized identity systems in federated social networks. This has implications for how we establish trust in online communities.',
      timestamp: '15m ago',
      stats: { replies: 12, reblogs: 24, likes: 38 }
    },
    {
      id: 102,
      content: 'Excited to be speaking at the Decentralized Web Summit next month on reputation systems for federated networks.',
      timestamp: '2d ago',
      stats: { replies: 9, reblogs: 17, likes: 53 }
    }
  ];
  
  // Get the badge from the profile badges array (assuming there's only one as per the simplified system)
  const authorBadge = profile?.badges?.length > 0 ? profile.badges[0] : null;
  
  // Determine if this is the current user's profile
  const isOwnProfile = activePerspective === 'poster';
  
  // Determine if this is an admin viewing the profile
  const isAdminView = activePerspective === 'admin';

  // Handle the verification interface request
  const handleVerificationClick = () => {
    if (onShowVerification) {
      onShowVerification(profile.id);
    }
  };

  // Get reputation score from reputation data
  const reputationScore = reputationData?.reputation_score || profile?.facultyData?.reputation_score || 0;

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2b90d9]"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="relative">
        <div className="h-48 bg-[#4c60d8]"></div>
        <button 
          className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded-full"
          onClick={onBack}
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className="px-4 pb-4 relative">
          <img 
            src={profile.avatar} 
            alt={profile.displayName} 
            className="w-24 h-24 rounded-full border-4 border-[#191b22] absolute -top-12 left-4"
          />
          
          <div className="pt-14 flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#d9e1e8]">{profile.displayName}</h2>
                {authorBadge && (
                  <ReputationBadge
                    badge={authorBadge}
                    size="small"
                    authorId={profile.id}
                  />
                )}
              </div>
              <p className="text-[#9baec8]">@{profile.username}</p>
              
              {/* Star Rating for Reputation Score */}
              {reputationScore > 0 && (
                <div className="mt-2">
                  <StarRating
                    score={reputationScore}
                    primaryColor="#2fc72e"
                    size="small"
                  />
                </div>
              )}
            </div>
            
            {!isOwnProfile && !isAdminView && (
              <button className="bg-[#2b90d9] text-white rounded-full px-4 py-2 font-bold">
                Follow
              </button>
            )}
            
            {isOwnProfile && (
              <button className="border border-[#313543] text-[#d9e1e8] rounded-full px-4 py-2 font-bold">
                Edit profile
              </button>
            )}
            
            {isAdminView && (
              <button 
                className="bg-[#2b90d9] text-white rounded-full px-4 py-2 font-bold"
                onClick={() => setShowVerificationModal(true)}
              >
                Review Verification
              </button>
            )}
          </div>
          
          <div className="mt-4 text-[#d9e1e8]">
            <p>{facultyData?.bio || profile?.bio || `Faculty member specializing in ${facultyData?.department || 'academic research'}.`}</p>
            
            <div className="flex flex-wrap gap-y-2 mt-3 text-[#9baec8]">
              {facultyData?.institution && (
                <div className="flex items-center gap-1 mr-4">
                  <MapPin size={16} />
                  <span>{facultyData.institution}</span>
                </div>
              )}
              
              {facultyData?.department && (
                <div className="flex items-center gap-1 mr-4">
                  <Link size={16} />
                  <span>{facultyData.department}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1 mr-4">
                <Calendar size={16} />
                <span>Joined {facultyData?.joined_date || "2023"}</span>
              </div>
            </div>
            
            <div className="flex gap-4 mt-3 text-[#9baec8]">
              <div>
                <span className="text-[#d9e1e8] font-bold">534</span> Following
              </div>
              <div>
                <span className="text-[#d9e1e8] font-bold">2,189</span> Followers
              </div>
            </div>
          </div>
          
          {/* Academic metrics if available from faculty data */}
          {facultyData && (
            <div className="mt-4 bg-[#2b303b] rounded-lg p-3">
              <h3 className="text-[#d9e1e8] font-bold mb-2">Academic Metrics</h3>
              <div className="grid grid-cols-2 gap-3">
                {facultyData.h_index && (
                  <div>
                    <p className="text-[#9baec8] text-sm">H-index</p>
                    <p className="text-lg font-semibold text-[#d9e1e8]">{facultyData.h_index}</p>
                  </div>
                )}
                
                {facultyData.total_citations && (
                  <div>
                    <p className="text-[#9baec8] text-sm">Citations</p>
                    <p className="text-lg font-semibold text-[#d9e1e8]">{facultyData.total_citations}</p>
                  </div>
                )}
                
                {facultyData.publication_count && (
                  <div>
                    <p className="text-[#9baec8] text-sm">Publications</p>
                    <p className="text-lg font-semibold text-[#d9e1e8]">{facultyData.publication_count}</p>
                  </div>
                )}
                
                {facultyData.latest_publication_year && (
                  <div>
                    <p className="text-[#9baec8] text-sm">Latest Publication</p>
                    <p className="text-lg font-semibold text-[#d9e1e8]">{facultyData.latest_publication_year}</p>
                  </div>
                )}
              </div>
              
              {/* Button to view full verification details */}
              <button 
                className="w-full bg-[#313543] hover:bg-[#414656] text-[#d9e1e8] rounded-lg py-2 mt-3"
                onClick={handleVerificationClick}
              >
                View Full Verification Details
              </button>
            </div>
          )}
          
          {/* Author Identity Verification Status */}
          {!authorBadge && (isOwnProfile || isAdminView) && (
            <div className="mt-6 border border-dashed border-[#313543] rounded-lg p-4">
              <div className="text-center">
                <h3 className="text-lg font-bold text-[#d9e1e8] mb-2">Unclaimed Profile</h3>
                <p className="text-[#9baec8] mb-3">This profile hasn't been claimed or verified yet.</p>
                
                {isOwnProfile && (
                  <button 
                    className="bg-[#2b90d9] text-white rounded-full px-4 py-2 font-bold"
                    onClick={() => setShowClaimModal(true)}
                  >
                    Claim This Profile
                  </button>
                )}
                
                {isAdminView && !isOwnProfile && (
                  <div className="text-[#9baec8] text-sm italic">
                    Only the profile owner can initiate a claim.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-[#313543] flex">
        <button 
          className={`px-4 py-3 font-medium ${
            activeTab === 'posts' ? 'text-[#2b90d9] border-b-2 border-[#2b90d9]' : 'text-[#9baec8]'
          }`}
          onClick={() => setActiveTab('posts')}
        >
          Posts
        </button>
        <button 
          className={`px-4 py-3 font-medium ${
            activeTab === 'replies' ? 'text-[#2b90d9] border-b-2 border-[#2b90d9]' : 'text-[#9baec8]'
          }`}
          onClick={() => setActiveTab('replies')}
        >
          Replies
        </button>
        <button 
          className={`px-4 py-3 font-medium ${
            activeTab === 'media' ? 'text-[#2b90d9] border-b-2 border-[#2b90d9]' : 'text-[#9baec8]'
          }`}
          onClick={() => setActiveTab('media')}
        >
          Media
        </button>
        <button 
          className={`px-4 py-3 font-medium ${
            activeTab === 'expertise' ? 'text-[#2b90d9] border-b-2 border-[#2b90d9]' : 'text-[#9baec8]'
          }`}
          onClick={() => setActiveTab('expertise')}
        >
          Expertise
        </button>
      </div>
      
      {/* Content based on active tab */}
      <div className="divide-y divide-[#313543]">
        {activeTab === 'posts' && posts.map(post => (
          <div key={post.id} className="p-4">
            <div className="text-[#d9e1e8]">
              {post.content}
            </div>
            
            <div className="flex justify-between mt-3 text-[#9baec8]">
              <button className="flex items-center gap-1 hover:text-[#2b90d9]">
                <MessageCircle size={18} />
                <span>{post.stats.replies}</span>
              </button>
              
              <button className="flex items-center gap-1 hover:text-[#2fc72e]">
                <Repeat size={18} />
                <span>{post.stats.reblogs}</span>
              </button>
              
              <button className="flex items-center gap-1 hover:text-[#eb5c6e]">
                <Heart size={18} />
                <span>{post.stats.likes}</span>
              </button>
              
              <button className="flex items-center gap-1 hover:text-[#d9e1e8]">
                <Share size={18} />
              </button>
            </div>
          </div>
        ))}
        
        {/* Expertise Fields Tab */}
        {activeTab === 'expertise' && facultyData && facultyData.expertise && facultyData.expertise.length > 0 ? (
          <div className="p-4">
            <div className="space-y-3">
              {facultyData.expertise.map((field, index) => (
                <div key={index} className="bg-[#2b303b] p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-[#d9e1e8]">{field.field_name}</div>
                      <div className="text-sm text-[#9baec8]">{field.publication_count} publications, {field.citation_count} citations</div>
                    </div>
                    <div className="text-[#d9e1e8] font-semibold">
                      Score: {field.expertise_score?.toFixed(1) || 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'expertise' ? (
          <div className="p-4 text-center text-[#9baec8]">
            No expertise information available for this author.
          </div>
        ) : null}
        
        {/* Empty state for other tabs */}
        {(activeTab === 'replies' || activeTab === 'media') && (
          <div className="p-4 text-center text-[#9baec8]">
            No {activeTab} to display.
          </div>
        )}
      </div>
      
      {/* Claim Badge Modal */}
      {showClaimModal && (
        <BadgeClaimModal onClose={() => setShowClaimModal(false)} />
      )}
      
      {/* Verification Modal for Admin */}
      {showVerificationModal && (
        <BadgeVerificationModal onClose={() => setShowVerificationModal(false)} />
      )}
    </div>
  );
};

export default MastodonProfile;