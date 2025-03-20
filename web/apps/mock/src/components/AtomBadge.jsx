import React from 'react';

/**
 * AtomBadge - A flexible atom-styled badge for different validation states
 * 
 * @param {Object} props
 * @param {string} props.status - 'awaiting', 'active', 'consensus', or 'opposition'
 * @param {string} props.size - 'small', 'medium', or 'large'
 * @param {string} props.orbitalColor - Color for the orbital paths
 * @param {string[]} props.electronColors - Array of colors for the electrons
 * @param {React.ReactNode} props.centerContent - Content to display in the center (emoji, symbol, etc.)
 * @param {boolean} props.interactive - Whether the badge is clickable
 * @param {function} props.onClick - Click handler
 */
const AtomBadge = ({ 
  status = 'awaiting',
  size = 'medium',
  orbitalColor,
  electronColors = [],
  centerContent,
  interactive = true,
  onClick,
  className = ''
}) => {
  // Size configurations
  const sizeConfig = {
    small: {
      className: "w-5 h-5",
      viewBox: "0 0 100 100",
      strokeWidth: "2",
      centerSize: "20", // Font size for center content
      electronRadius: "2"
    },
    medium: {
      className: "w-8 h-8",
      viewBox: "0 0 100 100", 
      strokeWidth: "2",
      centerSize: "28",
      electronRadius: "3"
    },
    large: {
      className: "w-12 h-12",
      viewBox: "0 0 100 100",
      strokeWidth: "2",
      centerSize: "36",
      electronRadius: "4"
    }
  };
  
  const config = sizeConfig[size];
  
  // Determine colors based on status if not explicitly provided
  let defaultOrbitalColor = '#9baec8'; // Default gray
  let defaultElectronColors = ['#9baec8', '#9baec8', '#9baec8']; // Default all gray
  
  switch(status) {
    case 'awaiting':
      defaultOrbitalColor = '#f5a623'; // Yellow
      defaultElectronColors = ['#f5a623', '#f5a623', '#f5a623'];
      break;
    case 'active':
      defaultOrbitalColor = '#9baec8'; // Gray/Blue
      defaultElectronColors = ['#f5a623', '#2fc72e', '#eb5c6e']; // Yellow, Green, Red
      break;
    case 'consensus':
      defaultOrbitalColor = '#2fc72e'; // Green
      defaultElectronColors = ['#2fc72e', '#2fc72e', '#2fc72e'];
      break;
    case 'opposition':
      defaultOrbitalColor = '#eb5c6e'; // Red
      defaultElectronColors = ['#eb5c6e', '#eb5c6e', '#eb5c6e'];
      break;
  }
  
  // Use provided colors or fall back to defaults
  const finalOrbitalColor = orbitalColor || defaultOrbitalColor;
  const finalElectronColors = electronColors.length >= 3 ? 
    electronColors : defaultElectronColors;

  // Default center content based on status if not provided
  let defaultCenterContent = null;
  
  switch(status) {
    case 'awaiting':
      defaultCenterContent = (
        <text 
          x="50" 
          y="55" 
          textAnchor="middle" 
          dominantBaseline="middle" 
          fill={finalOrbitalColor} 
          fontSize={config.centerSize} 
          fontWeight="bold"
        >?</text>
      );
      break;
    case 'active':
      defaultCenterContent = (
        <text 
          x="50" 
          y="55" 
          textAnchor="middle" 
          dominantBaseline="middle" 
          fontSize={config.centerSize}
        >😐</text>
      );
      break;
    case 'consensus':
      defaultCenterContent = (
        <text 
          x="50" 
          y="55" 
          textAnchor="middle" 
          dominantBaseline="middle" 
          fontSize={config.centerSize}
        >😊</text>
      );
      break;
    case 'opposition':
      defaultCenterContent = (
        <text 
          x="50" 
          y="55" 
          textAnchor="middle" 
          dominantBaseline="middle" 
          fontSize={config.centerSize}
        >🤨</text>
      );
      break;
  }
  
  // Convert tailwind classes to inline styles
  const getSizeFromClass = (className) => {
    const widthMatch = className.match(/w-(\d+)/);
    const heightMatch = className.match(/h-(\d+)/);
    
    let width = 32;
    let height = 32;
    
    if (widthMatch && widthMatch[1]) {
      width = parseInt(widthMatch[1]) * 4;
    }
    
    if (heightMatch && heightMatch[1]) {
      height = parseInt(heightMatch[1]) * 4;
    }
    
    return { width, height };
  };
  
  const { width, height } = getSizeFromClass(config.className);
  
  const styles = {
    svg: {
      width: `${width}px`,
      height: `${height}px`,
      minWidth: `${width}px`,
      minHeight: `${height}px`,
      display: 'block'
    }
  };
  
  return (
    <div 
      className={`flex items-center justify-center ${className}`}
      style={interactive ? { cursor: 'pointer' } : {}}
      onClick={interactive ? onClick : undefined}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox={config.viewBox} 
        style={styles.svg}
        className={config.className}
      >
        {/* Atom orbits */}
        <ellipse cx="50" cy="50" rx="45" ry="20" fill="none" stroke={finalOrbitalColor} strokeWidth={config.strokeWidth} transform="rotate(60,50,50)"></ellipse>
        <ellipse cx="50" cy="50" rx="45" ry="20" fill="none" stroke={finalOrbitalColor} strokeWidth={config.strokeWidth} transform="rotate(-60,50,50)"></ellipse>
        <ellipse cx="50" cy="50" rx="45" ry="20" fill="none" stroke={finalOrbitalColor} strokeWidth={config.strokeWidth}></ellipse>
        
        {/* Center circle */}
        <circle cx="50" cy="50" r="15" fill="#ffffff" stroke={finalOrbitalColor} strokeWidth={config.strokeWidth}></circle>
        
        {/* Center content (emoji, symbol, etc.) */}
        {centerContent || defaultCenterContent}
        
        {/* Electrons */}
        <g transform="rotate(60,50,50)">
          <circle r={config.electronRadius} fill={finalElectronColors[0]}>
            <animateMotion 
              dur="3s" 
              repeatCount="indefinite" 
              path="M50,50 m-45,0 a45,20 0 1,0 90,0 a45,20 0 1,0 -90,0"
            />
          </circle>
        </g>
        
        <g transform="rotate(-60,50,50)">
          <circle r={config.electronRadius} fill={finalElectronColors[1]}>
            <animateMotion 
              dur="3s" 
              repeatCount="indefinite" 
              begin="-1s"
              path="M50,50 m-45,0 a45,20 0 1,0 90,0 a45,20 0 1,0 -90,0"
            />
          </circle>
        </g>
        
        <circle r={config.electronRadius} fill={finalElectronColors[2]}>
          <animateMotion 
            dur="3s" 
            repeatCount="indefinite" 
            begin="-2s"
            path="M50,50 m-45,0 a45,20 0 1,0 90,0 a45,20 0 1,0 -90,0"
          />
        </circle>
      </svg>
    </div>
  );
};

export default AtomBadge;