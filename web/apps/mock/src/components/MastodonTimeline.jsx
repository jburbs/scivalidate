import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Repeat, Share, Image, Smile, Globe } from 'lucide-react';
import ReputationBadge from './ReputationBadge';
import PostQualityIndicator from './PostQualityIndicator';
import StarRating from './StarRating';
import { validatePostContent } from '@scivalidate/api-client';;

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
        likes: Math.floor(Math.random() * 90) + 1 
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
  const times = ['5m ago', '15m ago', '1h ago', '3h ago', '8h ago', '1d ago', '2d ago', '4d ago'];
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
          timestamp: '15m ago',
          stats: { replies: 12, reblogs: 24, likes: 38 }
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
          timestamp: '2h ago',
          stats: { replies: 8, reblogs: 15, likes: 42 }
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
          timestamp: '5h ago',
          stats: { replies: 22, reblogs: 7, likes: 19 }
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
          timestamp: '1d ago',
          stats: { replies: 31, reblogs: 42, likes: 87 },
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
          timestamp: '3d ago',
          stats: { replies: 42, reblogs: 3, likes: 7 },
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
      <div className="mastodon-loading">
        <div className="mastodon-spinner"></div>
      </div>
    );
  }

  // Helper function to get the current Mastodon style post interface
  const renderPost = (post) => (
    <div key={post.id} className="mastodon-post">
      <div className="flex gap-3">
        <img 
          src={post.user.avatar} 
          alt={post.user.displayName} 
          className="w-12 h-12 rounded-full cursor-pointer"
          onClick={() => onProfileClick(post.user)}
        />
        
        <div className="flex-1">
          <div className="mastodon-post-header">
            <div>
              <div className="flex items-center gap-1">
                <span className="mastodon-post-user cursor-pointer hover:underline" onClick={() => onProfileClick(post.user)}>
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
              
              <div className="mastodon-post-username">
                @{post.user.username}
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="mastodon-post-timestamp">
                {post.timestamp}
              </span>
              <button className="text-[#9baec8] hover:text-[#d9e1e8]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="mastodon-post-content">
            {post.content}
          </div>
          
          {/* Scientific validation indicator */}
          {post.scientificValidation && (
            <div className="scientific-validation">
              <PostQualityIndicator 
                status={post.scientificValidation.status}
                topic={post.scientificValidation.topic}
                experts={post.scientificValidation.experts}
                references={post.scientificValidation.references}
              />
            </div>
          )}
          
          <div className="mastodon-post-actions">
            <button className="mastodon-post-action reply">
              <MessageCircle size={18} />
              <span>{post.stats.replies}</span>
            </button>
            
            <button className="mastodon-post-action boost">
              <Repeat size={18} />
              <span>{post.stats.reblogs}</span>
            </button>
            
            <button className="mastodon-post-action favorite">
              <Heart size={18} />
              <span>{post.stats.likes}</span>
            </button>
            
            <button className="mastodon-post-action">
              <Share size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mastodon-timeline">
      <div className="p-4 font-bold text-[#d9e1e8] border-b border-[#393f4f] sticky top-0 bg-[#191b22] z-10">
        Home
      </div>
      
      {activePerspective === 'poster' && (
        <div className="mastodon-compose">
          <textarea 
            className="mastodon-compose-textarea"
            placeholder="What's on your mind?"
            value={composeText}
            onChange={(e) => setComposeText(e.target.value)}
            rows={3}
          ></textarea>
          <div className="mastodon-compose-actions">
            <div className="flex gap-2">
              <button className="p-2 text-[#9baec8] hover:text-[#2b90d9] bg-[#313543] rounded-full">
                <Image size={18} />
              </button>
              <button className="p-2 text-[#9baec8] hover:text-[#2b90d9] bg-[#313543] rounded-full">
                <Smile size={18} />
              </button>
              <button className="p-2 text-[#9baec8] hover:text-[#2b90d9] bg-[#313543] rounded-full">
                <Globe size={18} />
              </button>
            </div>
            <button className="mastodon-compose-submit">
              Post
            </button>
          </div>
        </div>
      )}
      
      {posts.map(post => renderPost(post))}
    </div>
  );
};

export default MastodonTimeline;