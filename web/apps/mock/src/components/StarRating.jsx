// Fixed StarRating component - minimal changes
import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ 
  score = 0, 
  primaryColor = '#2fc72e', 
  secondaryColor = '#9baec8', 
  size = 'medium'
}) => {
  // Convert score to number and ensure it's between 0-10
  const normalizedScore = Math.max(0, Math.min(10, parseFloat(score) || 0));
  
  // Convert to 0-5 scale for stars
  const starScore = normalizedScore / 2;
  
  const sizeConfig = {
    small: { size: 12 },
    medium: { size: 16 },
    large: { size: 20 }
  };
  
  const starSize = sizeConfig[size]?.size || 16;
  
  // Generate 5 stars
  const stars = [];
  for (let i = 0; i < 5; i++) {
    // Determine how filled this star should be (0 to 1)
    const fillAmount = Math.max(0, Math.min(1, starScore - i));
    
    if (fillAmount >= 1) {
      // Full star
      stars.push(
        <Star key={i} size={starSize} fill={primaryColor} stroke={primaryColor} />
      );
    } else if (fillAmount > 0) {
      // Half star
      stars.push(
        <div key={i} className="relative inline-block">
          <Star size={starSize} stroke={secondaryColor} fill="none" />
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${fillAmount * 100}%`,
            height: '100%',
            overflow: 'hidden'
          }}>
            <Star size={starSize} stroke={primaryColor} fill={primaryColor} />
          </div>
        </div>
      );
    } else {
      // Empty star
      stars.push(
        <Star key={i} size={starSize} stroke={secondaryColor} fill="none" />
      );
    }
  }
  
  return (
    <div className="flex items-center gap-1">
      {stars}
      <span className="text-xs text-[#9baec8] ml-1">{normalizedScore.toFixed(1)}</span>
    </div>
  );
};

export default StarRating;