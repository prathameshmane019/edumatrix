import React from 'react';

const ModernInstituteManagement = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400">
      {/* Enhanced gradients and styles */}
      <defs>
        <linearGradient id="background-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8faff" />
          <stop offset="100%" stopColor="#f0f4fc" />
        </linearGradient>
        
        <linearGradient id="primary-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        
        <linearGradient id="success-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        
        <filter id="card-shadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.08" />
        </filter>
        
        <filter id="soft-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dx="0" dy="2" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.1" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Main dashboard background with improved gradient */}
      <rect x="0" y="0" width="600" height="400" rx="20" fill="url(#background-gradient)" />
      
      {/* Modern top navigation bar with subtle shadow */}
      <g filter="url(#soft-shadow)">
        <rect x="15" y="15" width="570" height="50" rx="12" fill="white" />
      </g>
      
      {/* Logo area with modern design */}
      <rect x="30" y="25" width="140" height="30" rx="8" fill="url(#primary-gradient)" opacity="0.9" />
      <text x="100" y="45" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="white" textAnchor="middle">INSTITUTE</text>
      
      {/* Navigation icons with hover effect */}
      <circle cx="510" cy="40" r="15" fill="#f5f7ff" />
      <path d="M510,35 L510,45 M505,40 L515,40" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
      
      <circle cx="545" cy="40" r="15" fill="#f5f7ff" />
      <path d="M545,35 L545,38 M545,42 L545,45" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
      
      {/* Admin profile area with improved styling */}
      <circle cx="475" cy="40" r="17" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="2" />
      <text x="475" y="45" fontFamily="Arial" fontWeight="bold" fontSize="12" fill="#8b5cf6" textAnchor="middle">AD</text>
      
      {/* Key Metrics Cards - Improved layout and styling */}
      <g filter="url(#card-shadow)">
        <rect x="20" y="85" width="130" height="100" rx="14" fill="white" />
        <text x="35" y="110" fontFamily="Arial" fontWeight="600" fontSize="13" fill="#4b5563">Total Students</text>
        <text x="35" y="140" fontFamily="Arial" fontWeight="bold" fontSize="26" fill="#111827">4,728</text>
        <rect x="35" y="155" width="60" height="3" rx="1.5" fill="url(#primary-gradient)" />
        <g>
          <path d="M35,172 L41,165 L47,172" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <text x="55" y="173" fontFamily="Arial" fontSize="12" fill="#6366f1">+12% YoY</text>
        </g>
      </g>
      
      <g filter="url(#card-shadow)">
        <rect x="165" y="85" width="130" height="100" rx="14" fill="white" />
        <text x="180" y="110" fontFamily="Arial" fontWeight="600" fontSize="13" fill="#4b5563">Faculty Count</text>
        <text x="180" y="140" fontFamily="Arial" fontWeight="bold" fontSize="26" fill="#111827">187</text>
        <rect x="180" y="155" width="60" height="3" rx="1.5" fill="url(#primary-gradient)" />
        <g>
          <path d="M180,172 L186,165 L192,172" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <text x="200" y="173" fontFamily="Arial" fontSize="12" fill="#6366f1">+5% YoY</text>
        </g>
      </g>
      
      <g filter="url(#card-shadow)">
        <rect x="310" y="85" width="130" height="100" rx="14" fill="white" />
        <text x="325" y="110" fontFamily="Arial" fontWeight="600" fontSize="13" fill="#4b5563">Departments</text>
        <text x="325" y="140" fontFamily="Arial" fontWeight="bold" fontSize="26" fill="#111827">12</text>
        <rect x="325" y="155" width="60" height="3" rx="1.5" fill="url(#primary-gradient)" />
        <text x="325" y="173" fontFamily="Arial" fontSize="12" fill="#6366f1">2 New Added</text>
      </g>
      
      <g filter="url(#card-shadow)">
        <rect x="455" y="85" width="130" height="100" rx="14" fill="white" />
        <text x="470" y="110" fontFamily="Arial" fontWeight="600" fontSize="13" fill="#4b5563">Revenue (M)</text>
        <text x="470" y="140" fontFamily="Arial" fontWeight="bold" fontSize="26" fill="#111827">$8.4</text>
        <rect x="470" y="155" width="60" height="3" rx="1.5" fill="url(#success-gradient)" />
        <g>
          <path d="M470,172 L476,165 L482,172" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <text x="490" y="173" fontFamily="Arial" fontSize="12" fill="#10b981">+18% YoY</text>
        </g>
      </g>
      
      {/* Budget Allocation Chart - Improved pie chart with better colors */}
      <g filter="url(#card-shadow)">
        <rect x="20" y="205" width="280" height="185" rx="14" fill="white" />
        <text x="40" y="235" fontFamily="Arial" fontWeight="bold" fontSize="16" fill="#111827">Budget Allocation</text>
        
        {/* Modern donut chart instead of pie chart */}
        <circle cx="155" cy="295" r="55" fill="#f4f4f8" />
        <path d="M155,240 A55,55 0 0,1 208,309 L155,295 Z" fill="#8b5cf6" />
        <path d="M208,309 A55,55 0 0,1 155,350 L155,295 Z" fill="#6366f1" />
        <path d="M155,350 A55,55 0 0,1 102,309 L155,295 Z" fill="#10b981" />
        <path d="M102,309 A55,55 0 0,1 155,240 L155,295 Z" fill="#f59e0b" />
        <circle cx="155" cy="295" r="35" fill="white" />
        
        {/* Legend with improved layout and icons */}
        <rect x="40" y="370" width="12" height="12" rx="3" fill="#8b5cf6" />
        <text x="60" y="380" fontFamily="Arial" fontSize="12" fontWeight="500" fill="#4b5563">Academics (35%)</text>
        
        <rect x="160" y="370" width="12" height="12" rx="3" fill="#6366f1" />
        <text x="180" y="380" fontFamily="Arial" fontSize="12" fontWeight="500" fill="#4b5563">Infrastructure (30%)</text>
        
        <rect x="40" y="350" width="12" height="12" rx="3" fill="#10b981" />
        <text x="60" y="360" fontFamily="Arial" fontSize="12" fontWeight="500" fill="#4b5563">Research (25%)</text>
        
        <rect x="160" y="350" width="12" height="12" rx="3" fill="#f59e0b" />
        <text x="180" y="360" fontFamily="Arial" fontSize="12" fontWeight="500" fill="#4b5563">Admin (10%)</text>
      </g>
      
      {/* Compliance & Strategic Goals - Modernized progress bars */}
      <g filter="url(#card-shadow)">
        <rect x="310" y="205" width="270" height="175" rx="14" fill="white" />
        <text x="330" y="235" fontFamily="Arial" fontWeight="bold" fontSize="16" fill="#111827">Compliance & Strategic Goals</text>
        
        {/* Progress items with rounded caps and better visual hierarchy */}
        <g>
          <rect x="330" y="255" width="230" height="18" rx="9" fill="#f1f5f9" />
          <rect x="330" y="255" width="207" height="18" rx="9" fill="#e0e7ff" />
          <text x="340" y="268" fontFamily="Arial" fontSize="11" fontWeight="500" fill="#4b5563">Accreditation Requirements</text>
          <text x="540" y="268" fontFamily="Arial" fontWeight="bold" fontSize="11" fill="#6366f1" textAnchor="end">90%</text>
        </g>
        
        <g>
          <rect x="330" y="285" width="230" height="18" rx="9" fill="#f1f5f9" />
          <rect x="330" y="285" width="184" height="18" rx="9" fill="#ddd6fe" />
          <text x="340" y="298" fontFamily="Arial" fontSize="11" fontWeight="500" fill="#4b5563">Digital Transformation</text>
          <text x="540" y="298" fontFamily="Arial" fontWeight="bold" fontSize="11" fill="#8b5cf6" textAnchor="end">80%</text>
        </g>
        
        <g>
          <rect x="330" y="315" width="230" height="18" rx="9" fill="#f1f5f9" />
          <rect x="330" y="315" width="138" height="18" rx="9" fill="#d1fae5" />
          <text x="340" y="328" fontFamily="Arial" fontSize="11" fontWeight="500" fill="#4b5563">Research Publications</text>
          <text x="540" y="328" fontFamily="Arial" fontWeight="bold" fontSize="11" fill="#10b981" textAnchor="end">60%</text>
        </g>
        
        <g>
          <rect x="330" y="345" width="230" height="18" rx="9" fill="#f1f5f9" />
          <rect x="330" y="345" width="161" height="18" rx="9" fill="#fef3c7" />
          <text x="340" y="358" fontFamily="Arial" fontSize="11" fontWeight="500" fill="#4b5563">International Partnerships</text>
          <text x="540" y="358" fontFamily="Arial" fontWeight="bold" fontSize="11" fill="#f59e0b" textAnchor="end">70%</text>
        </g>
      </g>
    </svg>
  );
};

export default ModernInstituteManagement;