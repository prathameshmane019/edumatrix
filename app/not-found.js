import React from 'react';
import Link from 'next/link';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md text-center">
        <svg
          className="w-64 h-64 mx-auto mb-8"
          viewBox="0 0 500 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background circle */}
          <circle cx="250" cy="250" r="200" fill="#915bf0" opacity="0.1" />
          
          {/* Floating astronaut */}
          <g transform="translate(150, 150)">
            {/* Spacesuit body */}
            <path
              d="M100 120 C 140 120 160 180 160 220 C 160 260 140 280 100 280 C 60 280 40 260 40 220 C 40 180 60 120 100 120"
              fill="#915bf0"
            />
            
            {/* Helmet */}
            <path
              d="M60 100 C 60 60 140 60 140 100 C 140 140 60 140 60 100"
              fill="#a37af3"
            />
            <ellipse cx="100" cy="100" rx="35" ry="35" fill="#f0ebfc" />
            
            {/* Backpack */}
            <rect x="70" y="140" width="60" height="80" rx="10" fill="#7d44ed" />
            
            {/* Arms */}
            <path
              d="M40 180 C 20 200 20 220 40 240"
              stroke="#915bf0"
              strokeWidth="20"
              strokeLinecap="round"
            />
            <path
              d="M160 180 C 180 200 180 220 160 240"
              stroke="#915bf0"
              strokeWidth="20"
              strokeLinecap="round"
            />
            
            {/* Legs */}
            <path
              d="M80 280 C 60 300 60 320 80 340"
              stroke="#915bf0"
              strokeWidth="20"
              strokeLinecap="round"
            />
            <path
              d="M120 280 C 140 300 140 320 120 340"
              stroke="#915bf0"
              strokeWidth="20"
              strokeLinecap="round"
            />
          </g>
          
          {/* Floating elements */}
          <g>
            {/* Stars */}
            <circle cx="100" cy="100" r="3" fill="#915bf0" />
            <circle cx="400" cy="100" r="3" fill="#915bf0" />
            <circle cx="250" cy="400" r="3" fill="#915bf0" />
            <circle cx="100" cy="350" r="3" fill="#915bf0" />
            <circle cx="400" cy="350" r="3" fill="#915bf0" />
            
            {/* Small planets/asteroids */}
            <circle cx="150" cy="150" r="10" fill="#7d44ed" opacity="0.7" />
            <circle cx="350" cy="350" r="15" fill="#7d44ed" opacity="0.7" />
            
            {/* Curved lines representing space */}
            <path
              d="M50 200 Q 125 250 200 200"
              stroke="#915bf0"
              strokeWidth="2"
              fill="none"
              opacity="0.5"
            />
            <path
              d="M300 300 Q 375 350 450 300"
              stroke="#915bf0"
              strokeWidth="2"
              fill="none"
              opacity="0.5"
            />
          </g>
        </svg>

        <h1 className="text-6xl font-bold text-[#915bf0] mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Houston, we have a problem!
        </h2>
        <p className="text-gray-500 mb-8">The page you&#39;re looking for seems to have drifted into deep space.</p>

        <Link 
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#915bf0] hover:bg-[#7d44ed] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#915bf0] transition-colors duration-200"
        >
          Return to Earth (Home)
        </Link>
      </div>
    </div>
  );
};

export default NotFound;