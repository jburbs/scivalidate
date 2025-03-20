import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from './ui/card';

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

const ThanksPage = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <ValidationSVG />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-blue-600">
            Thank You for Joining Us!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-gray-700">
              We've received your registration for SciValidate.
            </p>
            <p className="text-gray-700">
              Would you like to get more involved? Tell us about your interests and expertise:
            </p>
            <a 
              href="https://forms.gle/XQbPhZ1nZTjjow2N7"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Get More Involved
            </a>
          </div>
        </CardContent>
        
        <CardFooter className="text-center">
          <div className="w-full space-y-4">
            <p className="text-sm text-gray-500">
              Together, we can improve the reliability and transparency of scientific research.
            </p>
            <a 
              href="/example/"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Return to homepage
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ThanksPage;