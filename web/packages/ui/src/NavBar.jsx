// @shared/components/NavBar.jsx
import React from 'react';
import Logo from '@scivalidate/ui/src/Logo';

const NavBar = () => {
  // Get current path to highlight active link
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  
  // Force inline styles to override everything
  const forceStyles = {
    nav: {
      backgroundColor: 'white',
      borderBottom: '1px solid #ddd',
      width: '100% !important',
      height: '64px !important',
      position: 'sticky', 
      top: 0,
      zIndex: 1000,
      padding: '15px 0',
      display: 'flex',
      alignItems: 'center'
    },
    container: {
      width: '100% !important',
      maxWidth: '1280px !important',
      height: '100% !important',
      margin: '0 auto !important',
      padding: '0 20px !important',
      display: 'flex !important',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  };

  // Apply forced styles on mount
  React.useEffect(() => {
    const navElement = document.querySelector('nav');
    const containerElement = navElement?.querySelector('div');
    
    if (navElement) {
      Object.entries(forceStyles.nav).forEach(([prop, value]) => {
        navElement.style.setProperty(prop, value, 'important');
      });
    }
    
    if (containerElement) {
      Object.entries(forceStyles.container).forEach(([prop, value]) => {
        containerElement.style.setProperty(prop, value, 'important');
      });
    }
    
    // Media query for mobile adjustment
    const handleResize = () => {
      const navLinks = document.getElementById('navLinks');
      if (navLinks) {
        if (window.innerWidth < 640) {
          navLinks.style.display = 'none';
        } else {
          navLinks.style.display = 'flex';
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <nav style={forceStyles.nav}>
      <div style={forceStyles.container}>
        {/* Logo section */}
        <a href="/" style={{
          display: 'flex',
          alignItems: 'center',
          flex: '0 0 auto',
          minWidth: '150px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'visible'
          }}>
            <Logo className="w-8 h-8" />
          </div>
          <span style={{
            marginLeft: '8px',
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#4f46e5',
            whiteSpace: 'nowrap'
          }}>SciValidate</span>
        </a>
        
        {/* Navigation links */}
        <div id="navLinks" style={{
          display: 'flex',
          flexWrap: 'nowrap',
          flex: '0 0 auto'
        }}>
          <a
            href="/about"
            style={{
              marginLeft: '24px',
              color: currentPath.includes('about') ? '#4f46e5' : '#6b7280',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={e => {
              if (!currentPath.includes('about')) {
                e.target.style.color = '#4f46e5';
                e.target.style.textDecoration = 'underline';
              }
            }}
            onMouseLeave={e => {
              if (!currentPath.includes('about')) {
                e.target.style.color = '#6b7280';
                e.target.style.textDecoration = 'none';
              }
            }}
          >
            About
          </a>
          <a
            href="/mock"
            style={{
              marginLeft: '24px',
              color: currentPath.includes('mock') ? '#4f46e5' : '#6b7280',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={e => {
              if (!currentPath.includes('mock')) {
                e.target.style.color = '#4f46e5';
                e.target.style.textDecoration = 'underline';
              }
            }}
            onMouseLeave={e => {
              if (!currentPath.includes('mock')) {
                e.target.style.color = '#6b7280';
                e.target.style.textDecoration = 'none';
              }
            }}
          >
            Demo
          </a>
          <a
            href="/signup"
            style={{
              marginLeft: '24px',
              color: currentPath.includes('signup') ? '#4f46e5' : '#6b7280',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={e => {
              if (!currentPath.includes('signup')) {
                e.target.style.color = '#4f46e5';
                e.target.style.textDecoration = 'underline';
              }
            }}
            onMouseLeave={e => {
              if (!currentPath.includes('signup')) {
                e.target.style.color = '#6b7280';
                e.target.style.textDecoration = 'none';
              }
            }}
          >
            Sign Up
          </a>
          
          <a
            href="/example"
            style={{
              marginLeft: '24px',
              color: currentPath.includes('example') ? '#4f46e5' : '#6b7280',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={e => {
              if (!currentPath.includes('example')) {
                e.target.style.color = '#4f46e5';
                e.target.style.textDecoration = 'underline';
              }
            }}
            onMouseLeave={e => {
              if (!currentPath.includes('example')) {
                e.target.style.color = '#6b7280';
                e.target.style.textDecoration = 'none';
              }
            }}
          >
            Live Example
          </a>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;