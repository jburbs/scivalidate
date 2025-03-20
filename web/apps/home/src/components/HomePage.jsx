import React from 'react';

const ValidationSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-32 h-32">
    <ellipse cx="50" cy="50" rx="45" ry="20" fill="none" stroke="#2563eb" strokeWidth="2" transform="rotate(60,50,50)"/>
    <ellipse cx="50" cy="50" rx="45" ry="20" fill="none" stroke="#2563eb" strokeWidth="2" transform="rotate(-60,50,50)"/>
    <ellipse cx="50" cy="50" rx="45" ry="20" fill="none" stroke="#2563eb" strokeWidth="2"/>
    <circle cx="50" cy="50" r="15" fill="#ffffff" stroke="#2563eb" strokeWidth="2"/>
    <path d="M42 50 L48 56 L58 44" stroke="#2563eb" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <g transform="rotate(60,50,50)">
      <circle r="3" fill="#2563eb">
        <animateMotion 
          dur="3s" 
          repeatCount="indefinite" 
          path="M50,50 m-45,0 a45,20 0 1,0 90,0 a45,20 0 1,0 -90,0"
        />
      </circle>
    </g>
    <g transform="rotate(-60,50,50)">
      <circle r="3" fill="#2563eb">
        <animateMotion 
          dur="3s" 
          repeatCount="indefinite"
          begin="-1s"
          path="M50,50 m-45,0 a45,20 0 1,0 90,0 a45,20 0 1,0 -90,0"
        />
      </circle>
    </g>
    <circle r="3" fill="#2563eb">
      <animateMotion 
        dur="3s" 
        repeatCount="indefinite"
        begin="-2s"
        path="M50,50 m-45,0 a45,20 0 1,0 90,0 a45,20 0 1,0 -90,0"
      />
    </circle>
  </svg>
);
const LandingPage = () => {
  return (
    
    <div className="min-h-screen bg-white dark:bg-gray-900 flex justify-center items-center p-4">

        <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Hero Section */}
        <header className="text-center mb-16 border-2 border-blue-300 dark:border-blue-700 rounded-lg p-6">
          <h1 className="text-5xl font-bold mb-4 text-blue-800 dark:text-blue-400">SciValidate</h1>
          <div className="flex justify-center">
            <ValidationSVG />
          </div>
        <p className="text-2xl text-gray-700 dark:text-gray-300 mb-6">
            Building the future of scientific trust online
          </p>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            An open-source initiative to verify scientific expertise and validate claims across digital platforms
          </p>
        </header>

        {/* Site Navigation Card */}
        <section className="mb-16 grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-medium mb-2 text-blue-700 dark:text-blue-400 text-center">Interactive Mockup</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
              Experience a preview of how SciValidate will help verify scientific authority across platforms.
            </p>
            <a href="/mock" className="bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded">
              View Mockup
            </a>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-medium mb-2 text-blue-700 dark:text-blue-400 text-center">Example Database</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
              Explore a seed database of professional scientists that demonstrates how reputations form.
            </p>
            <a href="/example" className="bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded">
              View Database
            </a>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-medium mb-2 text-blue-700 dark:text-blue-400 text-center">About SciValidate</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
              Learn more about our mission, background, and the problem we are solving.
            </p>
            <a href="/about" className="bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded">
              About Us
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;