import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, MessageCircle, Repeat, Share, Calendar, Link, MapPin, MoreHorizontal } from 'lucide-react';
import ReputationBadge from './ReputationBadge';
import StarRating from './StarRating';
import BadgeClaimModal from './BadgeClaimModal';
import BadgeVerificationModal from './BadgeVerificationModal';
import { validatePostContent } from '@scivalidate/api-client';
import sciValidateService from '../services/sciValidateService';

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
      timestamp: '15m',
      stats: { replies: 12, reblogs: 24, likes: 38 }
    },
    {
      id: 102,
      content: 'Excited to be speaking at the Decentralized Web Summit next month on reputation systems for federated networks.',
      timestamp: '2d',
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1d9bf0]"></div>
      </div>
    );
  }

  return (
    <div className="border-x border-[#2e3338]">
      {/* Header */}
      <div className="relative">
        {/* Navigation */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm flex items-center gap-6 p-4">
          <button 
            className="text-[#e6eef9] h-8 w-8 flex items-center justify-center rounded-full hover:bg-[#181818] bg-transparent"
            onClick={onBack}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-[#e6eef9]">{profile.displayName}</h2>
            <div className="text-[#8899a6] text-sm">2 posts</div>
          </div>
        </div>
        
        {/* Banner */}
        <div className="h-36 bg-[#3d5466]"></div>
        
        {/* Avatar */}
        <div className="flex justify-between items-start px-4">
          <div className="w-24 h-24 rounded-full border-4 border-black -mt-32 overflow-hidden">
            <img 
              src={profile.avatar} 
              alt={profile.displayName} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="px-4 flex justify-end -mt-14 mb-4">
          {!isOwnProfile && !isAdminView && (
            <div className="flex gap-2">
              <button 
                className="bg-[#e6eef9] text-black font-bold rounded-full px-4 hover:bg-[#d9d9d9] transition-colors" 
                style={{backgroundColor: '#e6eef9'}}
              >
                Follow
              </button>
            </div>
          )}
          
          {isOwnProfile && (
            <button className="border border-[#2e3338] text-[#e6eef9] rounded-full px-4 py-1.5 font-bold hover:bg-[#181818] bg-transparent">
              Edit profile
            </button>
          )}
          
          {isAdminView && (
            <button 
              className="bg-[#1d9bf0] text-white rounded-full px-4 py-1.5 font-bold hover:bg-[#1a8cd8]"
              onClick={() => setShowVerificationModal(true)}
              style={{backgroundColor: '#1d9bf0'}}
            >
              Review Verification
            </button>
          )}
        </div>
        
        {/* Profile info */}
        <div className="px-4 pb-3">
          <div className="mt-8">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#e6eef9]">{profile.displayName}</h1>
              {authorBadge && (
                <ReputationBadge
                  badge={authorBadge}
                  size="small"
                  authorId={profile.id}
                />
              )}
            </div>
            <p className="text-[#8899a6]">@{profile.username}</p>
            
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
            
            <div className="mt-3 text-[#e6eef9]">
              <p>{facultyData?.bio || profile?.bio || `Faculty member specializing in ${facultyData?.department || 'academic research'}.`}</p>
              
              <div className="flex flex-wrap gap-y-2 mt-3 text-[#8899a6] text-sm">
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
              
              <div className="flex gap-4 mt-3 text-[#8899a6] text-sm">
                <div>
                  <span className="text-[#e6eef9] font-bold">534</span> Following
                </div>
                <div>
                  <span className="text-[#e6eef9] font-bold">2,189</span> Followers
                </div>
              </div>
            </div>
            
            {/* Academic metrics if available from faculty data */}
            {facultyData && (
              <div className="mt-4 bg-[#15181c] rounded-xl p-4 border border-[#2e3338]">
                <h3 className="text-[#e6eef9] font-bold mb-3">Academic Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  {facultyData.h_index && (
                    <div>
                      <p className="text-[#8899a6] text-sm">H-index</p>
                      <p className="text-lg font-semibold text-[#e6eef9]">{facultyData.h_index}</p>
                    </div>
                  )}
                  
                  {facultyData.total_citations && (
                    <div>
                      <p className="text-[#8899a6] text-sm">Citations</p>
                      <p className="text-lg font-semibold text-[#e6eef9]">{facultyData.total_citations}</p>
                    </div>
                  )}
                  
                  {facultyData.publication_count && (
                    <div>
                      <p className="text-[#8899a6] text-sm">Publications</p>
                      <p className="text-lg font-semibold text-[#e6eef9]">{facultyData.publication_count}</p>
                    </div>
                  )}
                  
                  {facultyData.latest_publication_year && (
                    <div>
                      <p className="text-[#8899a6] text-sm">Latest Publication</p>
                      <p className="text-lg font-semibold text-[#e6eef9]">{facultyData.latest_publication_year}</p>
                    </div>
                  )}
                </div>
                
                {/* Button to view full verification details */}
                <button 
                  className="w-full bg-[#2e3338]/50 hover:bg-[#2e3338] text-[#e6eef9] rounded-full py-2.5 mt-4 font-medium transition-colors"
                  onClick={handleVerificationClick}
                  style={{backgroundColor: 'rgba(46, 51, 56, 0.5)'}}
                >
                  View Full Verification Details
                </button>
              </div>
            )}
            
            {/* Author Identity Verification Status */}
            {!authorBadge && (isOwnProfile || isAdminView) && (
              <div className="mt-6 border border-dashed border-[#2e3338] rounded-xl p-5 bg-[#15181c]">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-[#e6eef9] mb-2">Unclaimed Profile</h3>
                  <p className="text-[#8899a6] mb-4">This profile hasn't been claimed or verified yet.</p>
                  
                  {isOwnProfile && (
                    <button 
                      className="bg-[#1d9bf0] text-white rounded-full px-4 py-2 font-bold hover:bg-[#1a8cd8]"
                      onClick={() => setShowClaimModal(true)}
                      style={{backgroundColor: '#1d9bf0'}}
                    >
                      Claim This Profile
                    </button>
                  )}
                  
                  {isAdminView && !isOwnProfile && (
                    <div className="text-[#8899a6] text-sm italic">
                      Only the profile owner can initiate a claim.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-[#2e3338] flex">
        <button 
          className="px-4 py-3 text-center flex-1 bg-transparent"
          style={{
            color: activeTab === 'posts' ? '#e6eef9' : '#8899a6',
            fontWeight: activeTab === 'posts' ? 'bold' : 'normal',
            borderBottom: activeTab === 'posts' ? '2px solid #1d9bf0' : 'none'
          }}
          onClick={() => setActiveTab('posts')}
        >
          Posts
        </button>
        
        <button 
          className="px-4 py-3 text-center flex-1 bg-transparent"
          style={{
            color: activeTab === 'replies' ? '#e6eef9' : '#8899a6',
            fontWeight: activeTab === 'replies' ? 'bold' : 'normal',
            borderBottom: activeTab === 'replies' ? '2px solid #1d9bf0' : 'none'
          }}
          onClick={() => setActiveTab('replies')}
        >
          Replies
        </button>
        
        <button 
          className="px-4 py-3 text-center flex-1 bg-transparent"
          style={{
            color: activeTab === 'media' ? '#e6eef9' : '#8899a6',
            fontWeight: activeTab === 'media' ? 'bold' : 'normal',
            borderBottom: activeTab === 'media' ? '2px solid #1d9bf0' : 'none'
          }}
          onClick={() => setActiveTab('media')}
        >
          Media
        </button>
        
        <button 
          className="px-4 py-3 text-center flex-1 bg-transparent"
          style={{
            color: activeTab === 'expertise' ? '#e6eef9' : '#8899a6',
            fontWeight: activeTab === 'expertise' ? 'bold' : 'normal',
            borderBottom: activeTab === 'expertise' ? '2px solid #1d9bf0' : 'none'
          }}
          onClick={() => setActiveTab('expertise')}
        >
          Expertise
        </button>
      </div>
      
      {/* Content based on active tab */}
      <div>
        {activeTab === 'posts' && posts.map(post => (
          <div key={post.id} className="p-4 border-b border-[#2e3338] hover:bg-[#111214]/50 transition-colors">
            <div className="text-[#e6eef9] whitespace-pre-wrap break-words">
              {post.content}
            </div>
            
            <div className="mt-4 flex justify-between max-w-md">
              <button className="text-[#8899a6] hover:text-[#1d9bf0] flex items-center gap-1 group bg-transparent">
                <span className="p-2 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors bg-transparent">
                  <MessageCircle size={18} />
                </span>
                <span className="text-sm">{post.stats.replies}</span>
              </button>
              
              <button className="text-[#8899a6] hover:text-[#00ba7c] flex items-center gap-1 group bg-transparent">
                <span className="p-2 rounded-full group-hover:bg-[#00ba7c]/10 transition-colors bg-transparent">
                  <Repeat size={18} />
                </span>
                <span className="text-sm">{post.stats.reblogs}</span>
              </button>
              
              <button className="text-[#8899a6] hover:text-[#f91880] flex items-center gap-1 group bg-transparent">
                <span className="p-2 rounded-full group-hover:bg-[#f91880]/10 transition-colors bg-transparent">
                  <Heart size={18} />
                </span>
                <span className="text-sm">{post.stats.likes}</span>
              </button>
              
              <button className="text-[#8899a6] hover:text-[#1d9bf0] group bg-transparent">
                <span className="p-2 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors bg-transparent">
                  <Share size={18} />
                </span>
              </button>
            </div>
          </div>
        ))}
        
        {/* Expertise Fields Tab */}
        {activeTab === 'expertise' && facultyData && facultyData.expertise && facultyData.expertise.length > 0 ? (
          <div className="p-4">
            <div className="space-y-3">
              {facultyData.expertise.map((field, index) => (
                <div key={index} className="bg-[#15181c] p-4 rounded-xl border border-[#2e3338]">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-[#e6eef9]">{field.field_name}</div>
                      <div className="text-sm text-[#8899a6] mt-1">{field.publication_count} publications, {field.citation_count} citations</div>
                    </div>
                    <div className="text-[#e6eef9] font-semibold bg-[#202327] py-1 px-3 rounded-full">
                      Score: {field.expertise_score?.toFixed(1) || 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'expertise' ? (
          <div className="p-6 text-center text-[#8899a6]">
            No expertise information available for this author.
          </div>
        ) : null}
        
        {/* Empty state for other tabs */}
        {(activeTab === 'replies' || activeTab === 'media') && (
          <div className="p-6 text-center text-[#8899a6]">
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