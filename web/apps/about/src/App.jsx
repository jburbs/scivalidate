import React from 'react';
import AboutPage from './components/AboutPage';
import NavBar from '@scivalidate/ui/src/NavBar';
import '@scivalidate/ui/src/disable-dark-mode.css';

// Consistent wrapper styles
const navbarWrapperStyle = {
  width: '100%',
  height: '64px', // Fixed height for navbar
  position: 'sticky',
  top: 0,
  zIndex: 1000
};

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar with consistent wrapper */}
      <div style={navbarWrapperStyle}>
        <NavBar />
      </div>
      
      {/* Main content */}
      <main className="flex-grow">
        <AboutPage />
      </main>
    </div>
  );
}

export default App;
