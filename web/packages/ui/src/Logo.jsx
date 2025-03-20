import React from 'react';

const Logo = ({ className = "w-8 h-8" }) => {
  // Default to a smaller size that works better in the NavBar
  
  // Convert tailwind classes to inline styles to ensure consistency
  const getSizeFromClass = (className) => {
    // Extract width and height values from className string
    const widthMatch = className.match(/w-(\d+)/);
    const heightMatch = className.match(/h-(\d+)/);
    
    // Default values if no match
    let width = 32;
    let height = 32;
    
    if (widthMatch && widthMatch[1]) {
      // Convert tailwind sizes to pixels (approximation)
      width = parseInt(widthMatch[1]) * 4;
    }
    
    if (heightMatch && heightMatch[1]) {
      height = parseInt(heightMatch[1]) * 4;
    }
    
    return { width, height };
  };
  
  const { width, height } = getSizeFromClass(className);
  
  // Inline styles to ensure consistent rendering
  const styles = {
    svg: {
      width: `${width}px`,
      height: `${height}px`,
      minWidth: `${width}px`, // Ensure minimum size
      minHeight: `${height}px`,
      display: 'block' // Prevent layout issues
    }
  };

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      style={styles.svg}
      className={className}
    >
      <ellipse cx="50" cy="50" rx="45" ry="20" fill="none" stroke="#2563eb" strokeWidth="2" transform="rotate(60,50,50)"></ellipse>
      <ellipse cx="50" cy="50" rx="45" ry="20" fill="none" stroke="#2563eb" strokeWidth="2" transform="rotate(-60,50,50)"></ellipse>
      <ellipse cx="50" cy="50" rx="45" ry="20" fill="none" stroke="#2563eb" strokeWidth="2"></ellipse>
      <circle cx="50" cy="50" r="15" fill="#ffffff" stroke="#2563eb" strokeWidth="2"></circle>
      <path d="M42 50 L48 56 L58 44" stroke="#2563eb" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"></path>
      <g transform="rotate(60,50,50)">
        <circle r="3" fill="#2563eb">
          <animateMotion dur="3s" repeatCount="indefinite" path="M50,50 m-45,0 a45,20 0 1,0 90,0 a45,20 0 1,0 -90,0"></animateMotion>
        </circle>
      </g>
      <g transform="rotate(-60,50,50)">
        <circle r="3" fill="#2563eb">
          <animateMotion dur="3s" repeatCount="indefinite" begin="-1s" path="M50,50 m-45,0 a45,20 0 1,0 90,0 a45,20 0 1,0 -90,0"></animateMotion>
        </circle>
      </g>
      <circle r="3" fill="#2563eb">
        <animateMotion dur="3s" repeatCount="indefinite" begin="-2s" path="M50,50 m-45,0 a45,20 0 1,0 90,0 a45,20 0 1,0 -90,0"></animateMotion>
      </circle>
    </svg>
  );
};

export default Logo;