import React, { useState, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';
import ReputationBadge from './ReputationBadge';
import PostQualityIndicator from './PostQualityIndicator';
import StarRating from './StarRating';
import { validatePostContent } from '@scivalidate/api-client';

// Generate mock posts for users that come from the API
const generateMockPosts = (users) => {
  const mockContents = [
    "Just published a new paper on decentralized identity systems in federated social networks. This has implications for how we establish trust in online communities.",
    "Interesting developments in machine learning this week! Looking forward to the conference next month where I'll be presenting our latest research.",
    "Working on a new framework for reputation systems in decentralized social networks. Any thoughts on how to balance privacy with accountability?",
    "Excited to announce our new research project on using blockchain for academic credential verification. Looking for collaborators!",
    "Just finished reviewing papers for an upcoming journal issue on digital identity. Some fascinating work happening in this space.",
    "Had a great discussion with colleagues about the future of scientific reputation in the era of AI-generated content. Many challenges ahead.",
    "Our latest article on improving peer review transparency is now available online. Feedback welcome!",
    "Heading to the Science & Trust conference next month. Anyone else attending?",
    "Published new data from our longitudinal study on information credibility in social networks. Check it out!"
  ];

  // Map available users to posts with scientific validation for some
  return users.slice(0, 8).map((user, index) => {
    // Use modulo to cycle through the mock contents
    const contentIndex = index % mockContents.length;
    
    // Base post object
    const post = {
      id: `post-${index}`,
      user: user,
      content: mockContents[contentIndex],
      timestamp: getRandomTimestamp(),
      stats: { 
        replies: Math.floor(Math.random() * 30) + 1, 
        reblogs: Math.floor(Math.random() * 40) + 1, 
        likes: Math.floor(Math.random() * 90) + 1,
        bookmarks: Math.floor(Math.random() * 20) + 1
      }
    };
    
    // Add special scientific validation posts for two specific posts
    if (index === 0) {
      // Clear scientific consensus example (climate change)
      post.content = "New analysis shows human greenhouse gas emissions are the dominant cause of observed climate change over the past century. The data is unequivocal at this point.";
      post.scientificValidation = {
        status: 'consensus',
        topic: 'Climate Change Attribution',
        experts: [
          { id: 'exp5', name: 'Dr. Sarah Johnson', position: 'Climate Scientist', avatar: 'https://i.pravatar.cc/150?img=10' },
          { id: 'exp6', name: 'Prof. Michael Chen', position: 'Atmospheric Physics', avatar: 'https://i.pravatar.cc/150?img=11' }
        ],
        references: [
          { title: 'IPCC Sixth Assessment Report', authors: 'IPCC', year: 2022, url: '#' },
          { title: 'Attribution of Climate Change', authors: 'Johnson et al.', year: 2023, url: '#' }
        ]
      };
    } else if (index === 1) {
      // Clear scientific opposition example (flat earth)
      post.content = "I read that the Earth is actually flat and all the photos from space are faked. There are so many videos online proving this!";
      post.scientificValidation = {
        status: 'opposition',
        topic: 'Earth Shape',
        experts: [
          { id: 'exp7', name: 'Dr. Amanda Taylor', position: 'Astrophysicist', avatar: 'https://i.pravatar.cc/150?img=13' },
          { id: 'exp8', name: 'Prof. Robert Kim', position: 'Geodesy & Geophysics', avatar: 'https://i.pravatar.cc/150?img=14' }
        ],
        references: [
          { title: 'Multiple Independent Evidences of Earth\'s Shape', authors: 'Taylor et al.', year: 2020, url: '#' },
          { title: 'Geodetic Measurements of Earth\'s Curvature', authors: 'Kim & Lee', year: 2021, url: '#' }
        ]
      };
    }
    // Add scientific validation for some other posts (about 1/4)
    else if (index % 4 === 2) {
      post.scientificValidation = getRandomValidation();
    }
    
    return post;
  });
};

// Helper to get random timestamp
const getRandomTimestamp = () => {
  const times = ['5m', '15m', '1h', '3h', '8h', '1d', '2d', '4d'];
  return times[Math.floor(Math.random() * times.length)];
};

// Helper to get random validation data
const getRandomValidation = () => {
  const statuses = ['awaiting', 'active', 'consensus', 'opposition'];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  
  const topics = [
    'Machine Learning Ethics', 
    'Quantum Computing', 
    'CRISPR Technology', 
    'Neural Networks', 
    'Renewable Energy'
  ];
  
  return {
    status,
    topic: topics[Math.floor(Math.random() * topics.length)],
    experts: [
      { 
        id: `exp${Math.floor(Math.random() * 20)}`, 
        name: `Dr. ${['Sarah', 'Michael', 'Amanda', 'Robert', 'Jennifer'][Math.floor(Math.random() * 5)]} ${['Johnson', 'Chen', 'Taylor', 'Kim', 'Martinez'][Math.floor(Math.random() * 5)]}`, 
        position: `${['AI Researcher', 'Physicist', 'Biologist', 'Professor', 'Research Scientist'][Math.floor(Math.random() * 5)]}`, 
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}` 
      },
      { 
        id: `exp${Math.floor(Math.random() * 20)}`, 
        name: `Prof. ${['John', 'Lisa', 'David', 'Emily', 'Carlos'][Math.floor(Math.random() * 5)]} ${['Smith', 'Wong', 'Brown', 'Davis', 'Lee'][Math.floor(Math.random() * 5)]}`, 
        position: `${['Computer Science', 'Chemistry', 'Mathematics', 'Engineering', 'Neuroscience'][Math.floor(Math.random() * 5)]}`, 
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}` 
      }
    ],
    references: [
      { 
        title: `${['Analysis of', 'Review on', 'Study of', 'Perspectives on', 'Advances in'][Math.floor(Math.random() * 5)]} ${topics[Math.floor(Math.random() * topics.length)]}`, 
        authors: `${['Johnson', 'Chen', 'Taylor', 'Kim', 'Martinez'][Math.floor(Math.random() * 5)]} et al.`, 
        year: 2020 + Math.floor(Math.random() * 4), 
        url: '#' 
      },
      { 
        title: `${['Measuring', 'Quantifying', 'Experimental Evidence for', 'Theoretical Models of', 'Computational Approaches to'][Math.floor(Math.random() * 5)]} ${topics[Math.floor(Math.random() * topics.length)]}`, 
        authors: `${['Smith', 'Wong', 'Brown', 'Davis', 'Lee'][Math.floor(Math.random() * 5)]} & ${['Johnson', 'Chen', 'Taylor', 'Kim', 'Martinez'][Math.floor(Math.random() * 5)]}`, 
        year: 2020 + Math.floor(Math.random() * 4), 
        url: '#' 
      }
    ]
  };
};

const MastodonTimeline = ({ onProfileClick, activePerspective, users = [] }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [composeText, setComposeText] = useState('');
  
  // Generate posts from users when the component mounts or when users change
  useEffect(() => {
    if (users.length > 0) {
      // Generate mock posts based on real users from the API
      const generatedPosts = generateMockPosts(users);
      setPosts(generatedPosts);
      setLoading(false);
    }
  }, [users]);

  // Fallback to initial mock data if no users are provided
  useEffect(() => {
    if (users.length === 0) {
      // Original mock data for demo purposes
      const initialPosts = [
        {
          id: 1,
          user: {
            id: 'prof_smith',
            displayName: 'Professor Smith',
            username: 'prof_smith@academia.edu',
            avatar: 'https://i.pravatar.cc/150?img=1',
            badges: [
              { id: 1, type: 'identity', status: 'verified', name: 'Author Identity' }
            ]
          },
          content: 'Just published a new paper on decentralized identity systems in federated social networks. This has implications for how we establish trust in online communities.',
          timestamp: '15m',
          stats: { replies: 12, reblogs: 24, likes: 38, bookmarks: 5 }
        },
        {
          id: 2,
          user: {
            id: 'dr_johnson',
            displayName: 'Dr. Johnson',
            username: 'johnson@research.org',
            avatar: 'https://i.pravatar.cc/150?img=2',
            badges: [
              { id: 3, type: 'identity', status: 'pending', name: 'Author Identity' }
            ]
          },
          content: 'Interesting developments in machine learning this week! Looking forward to the conference next month where I\'ll be presenting our latest research.',
          timestamp: '2h',
          stats: { replies: 8, reblogs: 15, likes: 42, bookmarks: 3 }
        },
        {
          id: 3,
          user: {
            id: 'researcher_lee',
            displayName: 'Researcher Lee',
            username: 'lee@sciencelab.net',
            avatar: 'https://i.pravatar.cc/150?img=3',
            badges: [] // Unclaimed profile - no badges
          },
          content: 'Working on a new framework for reputation systems in decentralized social networks. Any thoughts on how to balance privacy with accountability?',
          timestamp: '5h',
          stats: { replies: 22, reblogs: 7, likes: 19, bookmarks: 1 }
        },
        {
          id: 4,
          user: {
            id: 'tech_writer',
            displayName: 'Tech Writer',
            username: 'writer@techblog.com',
            avatar: 'https://i.pravatar.cc/150?img=4',
            badges: [
              { id: 7, type: 'identity', status: 'verified', name: 'Author Identity' }
            ]
          },
          content: 'New analysis shows human greenhouse gas emissions are the dominant cause of observed climate change over the past century. The data is unequivocal at this point.',
          timestamp: '1d',
          stats: { replies: 31, reblogs: 42, likes: 87, bookmarks: 12 },
          scientificValidation: {
            status: 'consensus',
            topic: 'Climate Change Attribution',
            experts: [
              { id: 'exp5', name: 'Dr. Sarah Johnson', position: 'Climate Scientist', avatar: 'https://i.pravatar.cc/150?img=10' },
              { id: 'exp6', name: 'Prof. Michael Chen', position: 'Atmospheric Physics', avatar: 'https://i.pravatar.cc/150?img=11' }
            ],
            references: [
              { title: 'IPCC Sixth Assessment Report', authors: 'IPCC', year: 2022, url: '#' },
              { title: 'Attribution of Climate Change', authors: 'Johnson et al.', year: 2023, url: '#' }
            ]
          }
        },
        {
          id: 5,
          user: {
            id: 'random_user',
            displayName: 'Random User',
            username: 'random@social.net',
            avatar: 'https://i.pravatar.cc/150?img=12',
            // No badges for this user - not part of the network
            badges: []
          },
          content: 'I read that the Earth is actually flat and all the photos from space are faked. There are so many videos online proving this!',
          timestamp: '3d',
          stats: { replies: 42, reblogs: 3, likes: 7, bookmarks: 0 },
          scientificValidation: {
            status: 'opposition',
            topic: 'Earth Shape',
            experts: [
              { id: 'exp7', name: 'Dr. Amanda Taylor', position: 'Astrophysicist', avatar: 'https://i.pravatar.cc/150?img=13' },
              { id: 'exp8', name: 'Prof. Robert Kim', position: 'Geodesy & Geophysics', avatar: 'https://i.pravatar.cc/150?img=14' }
            ],
            references: [
              { title: 'Multiple Independent Evidences of Earth\'s Shape', authors: 'Taylor et al.', year: 2020, url: '#' },
              { title: 'Geodetic Measurements of Earth\'s Curvature', authors: 'Kim & Lee', year: 2021, url: '#' }
            ]
          }
        }
      ];
      
      setPosts(initialPosts);
      setLoading(false);
    }
  }, [users]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#595aff]"></div>
      </div>
    );
  }

  // Helper function to get the current Mastodon style post interface with correct action buttons
  const renderPost = (post) => (
    <div key={post.id} className="border-b border-[#2e3338] p-4 hover:bg-[#111214]/50 transition-colors">
      <div className="flex gap-3">
        <div className="shrink-0">
          <img 
            src={post.user.avatar} 
            alt={post.user.displayName} 
            className="w-12 h-12 rounded-full cursor-pointer"
            onClick={() => onProfileClick(post.user)}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="flex flex-col leading-tight">
              <div className="flex items-center gap-1 mb-0.5">
                <span 
                  className="font-bold text-[#e6eef9] hover:underline cursor-pointer truncate max-w-[180px]" 
                  onClick={() => onProfileClick(post.user)}
                >
                  {post.user.displayName}
                </span>
                
                {/* Only display badge if it exists (verified or pending) */}
                {post.user.badges && post.user.badges.length > 0 && (
                  <ReputationBadge 
                    badge={post.user.badges[0]} 
                    size="small" 
                    authorId={post.user.id}
                  />
                )}
              </div>
              
              <div className="text-[#8899a6] text-sm truncate max-w-[200px]">
                @{post.user.username}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[#8899a6] text-sm">
                {post.timestamp}
              </span>
              <button className="text-[#8899a6] hover:text-[#e6eef9] h-8 w-8 flex items-center justify-center rounded-full hover:bg-[#2e3338]">
                <MoreHorizontal size={18} />
              </button>
            </div>
          </div>
          
          <div className="mt-2 text-[#e6eef9] break-words whitespace-pre-wrap">
            {post.content}
          </div>
          
          {/* Scientific validation indicator */}
          {post.scientificValidation && (
            <div className="mt-3 border border-[#2e3338] rounded-lg p-2 bg-[#111214]">
              <PostQualityIndicator 
                status={post.scientificValidation.status}
                topic={post.scientificValidation.topic}
                experts={post.scientificValidation.experts}
                references={post.scientificValidation.references}
              />
            </div>
          )}
          
          {/* Action bar with Mastodon's exact SVG icons */}
          <div className="status__action-bar mt-4 flex justify-between">
            <div className="status__action-bar__button-wrapper">
              <button 
                type="button" 
                aria-label="Reply" 
                title="Reply" 
                className="status__action-bar__button icon-button icon-button--with-counter flex items-center gap-1 text-[#8899a6] hover:text-[#1d9bf0] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" className="icon icon-reply" fill="currentColor">
                  <path d="M760-200v-160q0-50-35-85t-85-35H273l144 144-57 56-240-240 240-240 57 56-144 144h367q83 0 141.5 58.5T840-360v160h-80Z" />
                </svg>
                <span className="text-sm">{post.stats.replies}</span>
              </button>
            </div>
            
            <div className="status__action-bar__button-wrapper">
              <button 
                type="button" 
                aria-label="Boost" 
                title="Boost" 
                className="status__action-bar__button icon-button flex items-center gap-1 text-[#8899a6] hover:text-[#00ba7c] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" className="icon icon-retweet" fill="currentColor">
                  <path d="M280-80 120-240l160-160 56 58-62 62h406v-160h80v240H274l62 62-56 58Zm-80-440v-240h486l-62-62 56-58 160 160-160 160-56-58 62-62H280v160h-80Z" />
                </svg>
                <span className="text-sm">{post.stats.reblogs}</span>
              </button>
            </div>
            
            <div className="status__action-bar__button-wrapper">
              <button 
                type="button" 
                aria-label="Favorite" 
                title="Favorite" 
                className="status__action-bar__button star-icon icon-button flex items-center gap-1 text-[#8899a6] hover:text-[#f91880] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" className="icon icon-star" fill="currentColor">
                  <path d="m354-287 126-76 126 77-33-144 111-96-146-13-58-136-58 135-146 13 111 97-33 143ZM233-120l65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Zm247-350Z" />
                </svg>
                <span className="text-sm">{post.stats.likes}</span>
              </button>
            </div>
            
            <div className="status__action-bar__button-wrapper">
              <button 
                type="button" 
                aria-label="Bookmark" 
                title="Bookmark" 
                className="status__action-bar__button bookmark-icon icon-button text-[#8899a6] hover:text-[#1d9bf0] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" className="icon icon-bookmark" fill="currentColor">
                  <path d="M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Zm80-122 200-86 200 86v-518H280v518Zm0-518h400-400Z" />
                </svg>
              </button>
            </div>
            
            <div className="status__action-bar__button-wrapper">
              <button 
                type="button" 
                aria-label="More" 
                title="More" 
                className="icon-button text-[#8899a6] hover:text-[#e6eef9] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" className="icon icon-ellipsis-h" fill="currentColor">
                  <path d="M240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full border-x border-[#2e3338]">
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-[#2e3338]">
        <div className="p-4 font-bold text-[#e6eef9]">
          Home
        </div>
      </div>
      
      {activePerspective === 'poster' && (
        <div className="p-4 border-b border-[#2e3338]">
          <div className="flex gap-3">
            <img 
              src="https://i.pravatar.cc/150?img=1" 
              alt="Your avatar" 
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1">
              <textarea 
                className="w-full bg-transparent border-none text-[#e6eef9] placeholder-[#8899a6] text-lg resize-none focus:outline-none"
                placeholder="What's on your mind?"
                value={composeText}
                onChange={(e) => setComposeText(e.target.value)}
                rows={2}
              ></textarea>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#2e3338]">
                <div className="flex gap-1">
                  <button className="p-2 text-[#1d9bf0] hover:bg-[#1d9bf0]/10 rounded-full transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor">
                      <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm280-80q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM240-600h480v-80H240v80Zm0 0v-80 80Z"/>
                    </svg>
                  </button>
                  <button className="p-2 text-[#1d9bf0] hover:bg-[#1d9bf0]/10 rounded-full transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor">
                      <path d="M480-260q75 0 127.5-52.5T660-440q0-75-52.5-127.5T480-620q-75 0-127.5 52.5T300-440q0 75 52.5 127.5T480-260Zm0-80q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM80-440q0-83 31.5-156t86-127T324-808t156-32q83 0 156 32t127 85 85 127 32 156q0 83-32 156t-85 127-127 85.5-156 31.5q-83 0-156-31.5T197.5-314t-86-127T80-440Zm160 0q0 100 70 170t170 70q100 0 170-70t70-170q0-100-70-170t-170-70q-100 0-170 70t-70 170Zm240 0Zm0 220q42 0 81-11t74-29q-35-18-74-28t-81-10q-42 0-81 10t-74 28q35 18 74 29t81 11Z"/>
                    </svg>
                  </button>
                  <button className="p-2 text-[#1d9bf0] hover:bg-[#1d9bf0]/10 rounded-full transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor">
                      <path d="M480-480q-83 0-141.5-58.5T280-680q0-83 58.5-141.5T480-880q83 0 141.5 58.5T680-680q0 83-58.5 141.5T480-480Zm0-160q17 0 28.5-11.5T520-680q0-17-11.5-28.5T480-720q-17 0-28.5 11.5T440-680q0 17 11.5 28.5T480-640ZM160-120v-112q0-33 17-62t47-44q51-26 115-44t141-18q77 0 141 18t115 44q30 15 47 44t17 62v112H160Zm80-80h480v-32q0-11-5.5-20T700-267q-35-18-80-30.5T480-310q-86 0-171 30.5T229-252q-5 3-7 9.5t-2 12.5v30Zm240 0Zm0-480Z"/>
                    </svg>
                  </button>
                  <button className="p-2 text-[#1d9bf0] hover:bg-[#1d9bf0]/10 rounded-full transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor">
                      <path d="M480-260q17 0 28.5-11.5T520-300v-160q0-17-11.5-28.5T480-500q-17 0-28.5 11.5T440-460v160q0 17 11.5 28.5T480-260Zm0-340q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
                    </svg>
                  </button>
                </div>
                <button 
                  className="bg-[#1d9bf0] text-white px-4 py-2 rounded-full font-bold hover:bg-[#1a8cd8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!composeText.trim()}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div>
        {posts.map(post => renderPost(post))}
      </div>
    </div>
  );
};

export default MastodonTimeline;