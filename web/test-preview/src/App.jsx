// src/App.jsx
import React from 'react';
import './App.css';
import DynamicJSXPreviewer from './DynamicJSXPreviewer';
import { ErrorBoundary } from './ErrorBoundary';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">SciValidate Component Previewer</h1>
        <p className="text-sm">Test your React components without complex setups</p>
      </header>
      
      <main className="container mx-auto py-6 px-4">
        <ErrorBoundary>
          <DynamicJSXPreviewer />
        </ErrorBoundary>
      </main>
      
      <footer className="bg-gray-800 text-white p-4 mt-8">
        <p className="text-center text-sm">SciValidate Component Previewer - Development Environment</p>
      </footer>
    </div>
  );
}

export default App;