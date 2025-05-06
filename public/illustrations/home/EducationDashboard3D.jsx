import React from 'react';

const EducationDashboard3D = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400" id="EducationDashboard3D">
      {/* Gradients and filters */}
      <defs>
        <linearGradient id="edu-bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8faff" />
          <stop offset="100%" stopColor="#eef2ff" />
        </linearGradient>
        <linearGradient id="edu-primary-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="edu-accent-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="edu-success-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <filter id="edu-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.2" />
        </filter>
        <filter id="edu-glow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feFlood floodColor="#6366f1" floodOpacity="0.3" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="shadow" />
          <feComposite in="SourceGraphic" in2="shadow" operator="over" />
        </filter>
        
        {/* 3D Perspective Effect */}
        <linearGradient id="edu-3d-side" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#d4d4d8" />
          <stop offset="100%" stopColor="#a1a1aa" />
        </linearGradient>
        <linearGradient id="edu-3d-top" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fafafa" />
          <stop offset="100%" stopColor="#f4f4f5" />
        </linearGradient>
      </defs>

      {/* 3D Base Platform */}
      <g transform="skewX(-10) skewY(5)">
        {/* Side panel */}
        <rect x="35" y="360" width="430" height="20" fill="url(#edu-3d-side)" rx="2" />
        
        {/* Top surface */}
        <rect x="35" y="60" width="430" height="300" fill="url(#edu-3d-top)" rx="16" />
        
        {/* Main dashboard */}
        <rect x="50" y="80" width="400" height="270" fill="url(#edu-bg-gradient)" rx="12" filter="url(#edu-shadow)" />
      </g>
      
      {/* Top navigation bar */}
      <g transform="skewX(-10) skewY(5)">
        <rect x="50" y="80" width="400" height="50" fill="white" rx="12 12 0 0" />
        
        {/* Logo */}
        <rect x="110" y="90" width="120" height="20" rx="4" fill="url(#edu-primary-gradient)" />
        
        {/* Navigation items */}
        <circle cx="350" cy="105" r="15" fill="#f8fafc" />
        <circle cx="390" cy="105" r="15" fill="#f8fafc" />
        <circle cx="430" cy="105" r="15" fill="#f8fafc" />
      </g>

      {/* Content area with 3D effect */}
      <g transform="skewX(-10) skewY(5)">
        {/* Stats overview - floating cards with 3D effect */}
        <g transform="translate(-5, -5)">
          <rect x="70" y="150" width="100" height="80" rx="8" fill="white" filter="url(#edu-shadow)" />
          <text x="90" y="175" fontFamily="Arial" fontWeight="bold" fontSize="12" fill="#1e293b">Students</text>
          <text x="90" y="200" fontFamily="Arial" fontWeight="bold" fontSize="22" fill="#4f46e5">14,382</text>
          <rect x="90" y="210" width="60" height="3" rx="1.5" fill="#4f46e5" />
          <text x="90" y="225" fontFamily="Arial" fontSize="10" fill="#4f46e5">+12% this semester</text>
        </g>
        
        <g transform="translate(0, -12)">
          <rect x="190" y="150" width="100" height="80" rx="8" fill="white" filter="url(#edu-shadow)" />
          <text x="210" y="175" fontFamily="Arial" fontWeight="bold" fontSize="12" fill="#1e293b">Teachers</text>
          <text x="210" y="200" fontFamily="Arial" fontWeight="bold" fontSize="22" fill="#3b82f6">872</text>
          <rect x="210" y="210" width="60" height="3" rx="1.5" fill="#3b82f6" />
          <text x="210" y="225" fontFamily="Arial" fontSize="10" fill="#3b82f6">+6 new this month</text>
        </g>
        
        <g transform="translate(5, -18)">
          <rect x="310" y="150" width="100" height="80" rx="8" fill="white" filter="url(#edu-shadow)" />
          <text x="330" y="175" fontFamily="Arial" fontWeight="bold" fontSize="12" fill="#1e293b">Courses</text>
          <text x="330" y="200" fontFamily="Arial" fontWeight="bold" fontSize="22" fill="#10b981">648</text>
          <rect x="330" y="210" width="60" height="3" rx="1.5" fill="#10b981" />
          <text x="330" y="225" fontFamily="Arial" fontSize="10" fill="#10b981">95% satisfaction</text>
        </g>
      </g>

      {/* Enrollment graph with 3D effect */}
      <g transform="skewX(-10) skewY(5)">
        <rect x="70" y="235" width="215" height="140" rx="8" fill="white" filter="url(#edu-shadow)" />
        <text x="90" y="270" fontFamily="Arial" fontWeight="bold" fontSize="12" fill="#1e293b">Enrollment Trends</text>
        
        {/* Graph lines */}
        <line x1="90" y1="345" x2="265" y2="345" stroke="#e2e8f0" strokeWidth="1" />
        <line x1="90" y1="315" x2="265" y2="315" stroke="#e2e8f0" strokeWidth="1" />
        <line x1="90" y1="285" x2="265" y2="285" stroke="#e2e8f0" strokeWidth="1" />

        {/* Graph bars with 3D effect */}
        <g filter="url(#edu-glow)">
          <rect x="100" y="305" width="15" height="40" rx="2" fill="url(#edu-primary-gradient)" />
          <rect x="130" y="295" width="15" height="50" rx="2" fill="url(#edu-primary-gradient)" />
          <rect x="160" y="285" width="15" height="60" rx="2" fill="url(#edu-primary-gradient)" />
          <rect x="190" y="275" width="15" height="70" rx="2" fill="url(#edu-primary-gradient)" />
          <rect x="220" y="280" width="15" height="65" rx="2" fill="url(#edu-primary-gradient)" />
          <rect x="250" y="270" width="15" height="75" rx="2" fill="url(#edu-primary-gradient)" />
        </g>
        
        {/* Months */}
        <text x="107" y="360" fontFamily="Arial" fontSize="8" fill="#64748b" textAnchor="middle">Jan</text>
        <text x="137" y="360" fontFamily="Arial" fontSize="8" fill="#64748b" textAnchor="middle">Feb</text>
        <text x="167" y="360" fontFamily="Arial" fontSize="8" fill="#64748b" textAnchor="middle">Mar</text>
        <text x="197" y="360" fontFamily="Arial" fontSize="8" fill="#64748b" textAnchor="middle">Apr</text>
        <text x="227" y="360" fontFamily="Arial" fontSize="8" fill="#64748b" textAnchor="middle">May</text>
        <text x="257" y="360" fontFamily="Arial" fontSize="8" fill="#64748b" textAnchor="middle">Jun</text>
      </g>

      {/* Recent activity panel */}
      <g transform="skewX(-10) skewY(5)">
        <rect x="300" y="235" width="130" height="140" rx="8" fill="white" filter="url(#edu-shadow)" />
        <text x="320" y="270" fontFamily="Arial" fontWeight="bold" fontSize="12" fill="#1e293b">Recent Activity</text>
        
        {/* Activity items */}
        <circle cx="310" cy="290" r="5" fill="#6366f1" />
        <text x="325" y="293" fontFamily="Arial" fontSize="9" fill="#1e293b">New curriculum added</text>
         
        <circle cx="310" cy="310" r="5" fill="#3b82f6" />
        <text x="325" y="313" fontFamily="Arial" fontSize="9" fill="#1e293b">Staff meeting scheduled</text>
       
        <circle cx="310" cy="330" r="5" fill="#10b981" />
        <text x="325" y="333" fontFamily="Arial" fontSize="9" fill="#1e293b">Grades updated</text>
        
        <circle cx="310" cy="350" r="5" fill="#f43f5e" />
        <text x="325" y="353" fontFamily="Arial" fontSize="9" fill="#1e293b">Course deadline extended</text>
         
        <circle cx="310" cy="370" r="5" fill="#8b5cf6" />
        <text x="325" y="373" fontFamily="Arial" fontSize="9" fill="#1e293b">New students enrolled</text> 
      </g>

      {/* Floating 3D elements */}
      <g transform="translate(30, 20)">
        {/* Floating notification bell */}
        <circle cx="410" cy="50" r="25" fill="white" filter="url(#edu-shadow)" />
        <circle cx="422" cy="42" r="6" fill="#f43f5e" />
        <path d="M410,38 C403,38 398,43 398,50 C398,53 399,56 401,58 L401,62 C401,65 405,67 410,67 C415,67 419,65 419,62 L419,58 C421,56 422,53 422,50 C422,43 417,38 410,38 Z" fill="#6366f1" />
      </g>
      
      <g transform="translate(-10, 30)">
        {/* Floating graduation cap */}
        <circle cx="70" cy="75" r="20" fill="white" filter="url(#edu-shadow)" />
        <path d="M70,65 L60,70 L70,75 L80,70 Z" fill="url(#edu-accent-gradient)" />
        <path d="M70,75 L62,71 L62,78 C62,80 66,82 70,82 C74,82 78,80 78,78 L78,71 Z" fill="url(#edu-accent-gradient)" />
        <line x1="80" y1="70" x2="80" y2="78" stroke="#3b82f6" strokeWidth="1" />
      </g>
    </svg>
  );
};

export default EducationDashboard3D;