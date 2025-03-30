import React, { useState, useEffect } from 'react';
import ReputationPopup from './ReputationPopup';
import AtomBadge from './AtomBadge';
import { validatePostContent } from '@scivalidate/api-client';
import sciValidateService from '../services/sciValidateService';

/**
 * ReputationBadge - Simplified version with single badge type
 * Displays atom-based badges for user verification (absent, yellow, or green)
 * Now using the flexible AtomBadge component
 * 
 * @param {Object} props
 * @param {Object} props.badge - Badge data object
 * @param {string} props.badge.status - Badge status ('verified', 'pending', 'unverified')
 * @param {string} props.size - Size ('small', 'medium', or 'large')
 * @param {string} props.authorId - Author ID for data fetching
 * @param {boolean} props.interactive - Whether clicking should show the popup (default: true)
 */
const ReputationBadge = ({ 
  badge, 
  size = 'medium',
  authorId,
  interactive = true,
  className = ''
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const [badgeData, setBadgeData] = useState(badge);
  const [loading, setLoading] = useState(false);
  
  // Fetch badge data from API when authorId is provided and we don't have complete data
  useEffect(() => {
    const fetchData = async () => {
      if (authorId && (!badge || badge.status === 'unverified')) {
        try {
          setLoading(true);
          // Fetch data from the API
          const data = await sciValidateService.getAuthorReputation(authorId);
          
          // Map API data to badge format
          if (data) {
            let status = 'unverified';
            
            // Determine verification status based on identifiers
            if (data.identifiers && data.identifiers.some(id => id.verification_status === 'verified')) {
              status = 'verified';
            } else if (data.identifiers && data.identifiers.length > 0) {
              status = 'pending';
            }
            
            setBadgeData({
              status: status,
              name: 'Author Identity',
              reputationScore: data.reputation_score
            });
          }
        } catch (error) {
          console.error('Error fetching badge data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchData();
  }, [authorId, badge]);
  
  // If no badge data and not loading, return null (badge absent)
  if (!badge && !badgeData && !loading) return null;
  
  // If loading and no badge data yet, show placeholder
  if (loading && !badgeData) {
    return (
      <div className={`inline-block ${size === 'small' ? 'w-5 h-5' : size === 'medium' ? 'w-8 h-8' : 'w-12 h-12'} bg-[#313543] rounded-full animate-pulse`}></div>
    );
  }
  
  // Use badgeData if available, fallback to badge prop
  const displayBadge = badgeData || badge;
  
  // If status is unverified, don't show the badge
  if (!displayBadge || displayBadge.status === 'unverified') return null;

  // Get badge configuration based on verification status
  const getBadgeConfig = () => {
    if (displayBadge.status === 'verified') {
      return {
        orbitalColor: '#2fc72e', // Green for verified
        electronColors: ['#2fc72e', '#2fc72e', '#2fc72e'],
        centerContent: (
          <path 
            d="M40 50 L46 58 L60 42" 
            stroke="#2fc72e" 
            strokeWidth="3" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        )
      };
    } else { // pending
      return {
        orbitalColor: '#f5a623', // Yellow for pending
        electronColors: ['#f5a623', '#f5a623', '#f5a623'],
        centerContent: (
          <text 
            x="50" 
            y="55" 
            textAnchor="middle" 
            dominantBaseline="middle" 
            fill="#f5a623" 
            fontSize={size === 'small' ? '16' : size === 'medium' ? '20' : '24'}
            fontWeight="bold"
          >?</text>
        )
      };
    }
  };

  const badgeConfig = getBadgeConfig();

  return (
    <div className="inline-flex">
      <AtomBadge 
        status={displayBadge.status}
        size={size}
        orbitalColor={badgeConfig.orbitalColor}
        electronColors={badgeConfig.electronColors}
        centerContent={badgeConfig.centerContent}
        interactive={interactive}
        onClick={() => interactive && setShowPopup(true)}
        className={className}
      />
      
      {showPopup && (
        <ReputationPopup
          badge={displayBadge}
          authorId={authorId}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
};

export default ReputationBadge;