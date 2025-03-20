import React from 'react';
import HomePage from './components/HomePage';
import NavBar from '@scivalidate/ui/src/NavBar';
import '@scivalidate/ui/src/disable-dark-mode.css';
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
      <div style={navbarWrapperStyle}>
        <NavBar />
      </div>
      <main className="flex-grow">
        <HomePage />
      </main>
    </div>
  );
}

export default App;