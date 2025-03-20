import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from './ui/card';
import { 
  Alert, 
  AlertDescription 
} from './ui/alert';

const ValidationSVG = () => (
  // SVG component remains unchanged
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-32 h-32">
    <ellipse cx="50" cy="50" rx="45" ry="20" fill="none" stroke="#2563eb" strokeWidth="2" transform="rotate(60,50,50)"/>
    <ellipse cx="50" cy="50" rx="45" ry="20" fill="none" stroke="#2563eb" strokeWidth="2" transform="rotate(-60,50,50)"/>
    <ellipse cx="50" cy="50" rx="45" ry="20" fill="none" stroke="#2563eb" strokeWidth="2"/>
    <circle cx="50" cy="50" r="15" fill="#ffffff" stroke="#2563eb" strokeWidth="2"/>
    <path d="M42 50 L48 56 L58 44" stroke="#2563eb" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <g transform="rotate(60,50,50)">
      <circle r="3" fill="#2563eb">
        <animateMotion dur="3s" repeatCount="indefinite" path="M50,50 m-45,0 a45,20 0 1,0 90,0 a45,20 0 1,0 -90,0"/>
      </circle>
    </g>
    <g transform="rotate(-60,50,50)">
      <circle r="3" fill="#2563eb">
        <animateMotion dur="3s" repeatCount="indefinite" begin="-1s" path="M50,50 m-45,0 a45,20 0 1,0 90,0 a45,20 0 1,0 -90,0"/>
      </circle>
    </g>
    <circle r="3" fill="#2563eb">
      <animateMotion dur="3s" repeatCount="indefinite" begin="-2s" path="M50,50 m-45,0 a45,20 0 1,0 90,0 a45,20 0 1,0 -90,0"/>
    </circle>
  </svg>
);

const EmailSignup = () => {
  const [status, setStatus] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(''); // New state for role
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptedTerms) return;
    
    try {
      const response = await fetch('https://formspree.io/f/mkgoqqjj', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          role: role || 'Not specified' // Include role in submission
        }),
      });
      
      if (response.ok) {
        setStatus('success');
        setEmail('');
        setRole('');
        setAcceptedTerms(false);
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <ValidationSVG />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-blue-600">
            I'm interested in preserving 
            the integrity of Science.
            Sign me up!
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label 
                htmlFor="role" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Your Role (Optional)
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              >
                <option value="">Select your role</option>
                <option value="researcher">Academic Researcher</option>
                <option value="industry">Industry Scientist</option>
                <option value="journalist">Science Journalist</option>
                <option value="student">Student</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1"
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to receive updates about SciValidate. My email will not be shared with third parties. 
                You'll receive a confirmation email with options to unsubscribe or get more involved.
              </label>
            </div>
            
            <button
              type="submit"
              disabled={!acceptedTerms}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sign Up
            </button>

            {status === 'success' && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  Thank you for your interest! Please check your email to confirm your subscription.
                </AlertDescription>
              </Alert>
            )}
            
            {status === 'error' && (
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">
                  Something went wrong. Please try again later.
                </AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
        
        <CardFooter className="text-center text-sm text-gray-500">
          Help us improve the reliability and 
          transparency of scientific research.
        </CardFooter>
      </Card>
    </div>
  );
};

export default EmailSignup;