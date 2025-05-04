import React from 'react';

const InstituteManagement = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400">
      {/* Background with slight gradient */}
      <defs>
        <linearGradient id="institute-bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#f1f5f9" />
        </linearGradient>
        <linearGradient id="institute-primary-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <filter id="institute-shadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
        </filter>
      </defs>
      
      {/* Main dashboard background */}
      <rect x="0" y="0" width="600" height="400" rx="16" fill="url(#institute-bg-gradient)" />
      
      {/* Top navigation bar */}
      <rect x="0" y="0" width="600" height="60" rx="16" fill="white" />
      
      {/* Logo area */}
      <rect x="20" y="18" width="140" height="24" rx="6" fill="url(#institute-primary-gradient)" opacity="0.9" />
      
      {/* Navigation items */}
      <circle cx="510" cy="30" r="18" fill="#f1f5f9" />
      <circle cx="550" cy="30" r="18" fill="#f1f5f9" />
      
      {/* Admin profile area */}
      <circle cx="470" cy="30" r="20" fill="#ede9fe" />
      <text x="470" y="35" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#8b5cf6" textAnchor="middle">AD</text>
      
      {/* Institute Management Elements */}
      
      {/* Key Metrics Cards */}
      <g filter="url(#institute-shadow)">
        <rect x="20" y="80" width="130" height="110" rx="12" fill="white" />
        <text x="40" y="105" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#1e293b">Total Students</text>
        <text x="40" y="140" fontFamily="Arial" fontWeight="bold" fontSize="28" fill="#1e293b">4,728</text>
        <rect x="40" y="155" width="60" height="4" rx="2" fill="url(#institute-primary-gradient)" />
        <text x="40" y="175" fontFamily="Arial" fontSize="12" fill="#6366f1">+12% YoY</text>
      </g>
      
      <g filter="url(#institute-shadow)">
        <rect x="165" y="80" width="130" height="110" rx="12" fill="white" />
        <text x="185" y="105" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#1e293b">Faculty Count</text>
        <text x="185" y="140" fontFamily="Arial" fontWeight="bold" fontSize="28" fill="#1e293b">187</text>
        <rect x="185" y="155" width="60" height="4" rx="2" fill="url(#institute-primary-gradient)" />
        <text x="185" y="175" fontFamily="Arial" fontSize="12" fill="#6366f1">+5% YoY</text>
      </g>
      
      <g filter="url(#institute-shadow)">
        <rect x="310" y="80" width="130" height="110" rx="12" fill="white" />
        <text x="330" y="105" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#1e293b">Departments</text>
        <text x="330" y="140" fontFamily="Arial" fontWeight="bold" fontSize="28" fill="#1e293b">12</text>
        <rect x="330" y="155" width="60" height="4" rx="2" fill="url(#institute-primary-gradient)" />
        <text x="330" y="175" fontFamily="Arial" fontSize="12" fill="#6366f1">2 New Added</text>
      </g>
      
      <g filter="url(#institute-shadow)">
        <rect x="455" y="80" width="130" height="110" rx="12" fill="white" />
        <text x="475" y="105" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#1e293b">Revenue (M)</text>
        <text x="475" y="140" fontFamily="Arial" fontWeight="bold" fontSize="28" fill="#1e293b">$8.4</text>
        <rect x="475" y="155" width="60" height="4" rx="2" fill="#4ade80" />
        <text x="475" y="175" fontFamily="Arial" fontSize="12" fill="#4ade80">+18% YoY</text>
      </g>
      
      {/* Budget Allocation Chart */}
      <g filter="url(#institute-shadow)">
        <rect x="20" y="210" width="270" height="170" rx="12" fill="white" />
        <text x="40" y="240" fontFamily="Arial" fontWeight="bold" fontSize="16" fill="#1e293b">Budget Allocation</text>
        
        {/* Pie chart segments */}
        <path d="M155,295 L155,240 A55,55 0 0,1 200,350 z" fill="#8b5cf6" />
        <path d="M155,295 L200,350 A55,55 0 0,1 95,330 z" fill="#6366f1" />
        <path d="M155,295 L95,330 A55,55 0 0,1 100,240 z" fill="#4ade80" />
        <path d="M155,295 L100,240 A55,55 0 0,1 155,240 z" fill="#f59e0b" />
        
        {/* Legend */}
        <rect x="40" y="360" width="12" height="12" rx="2" fill="#8b5cf6" />
        <text x="60" y="370" fontFamily="Arial" fontSize="12" fill="#334155">Academics (35%)</text>
        
        <rect x="160" y="360" width="12" height="12" rx="2" fill="#6366f1" />
        <text x="180" y="370" fontFamily="Arial" fontSize="12" fill="#334155">Infrastructure (30%)</text>
        
        <rect x="40" y="335" width="12" height="12" rx="2" fill="#4ade80" />
        <text x="60" y="345" fontFamily="Arial" fontSize="12" fill="#334155">Research (25%)</text>
        
        <rect x="160" y="335" width="12" height="12" rx="2" fill="#f59e0b" />
        <text x="180" y="345" fontFamily="Arial" fontSize="12" fill="#334155">Admin (10%)</text>
      </g>
      
      {/* Compliance & Strategy Card */}
      <g filter="url(#institute-shadow)">
        <rect x="310" y="210" width="270" height="170" rx="12" fill="white" />
        <text x="330" y="240" fontFamily="Arial" fontWeight="bold" fontSize="16" fill="#1e293b">Compliance & Strategic Goals</text>
        
        {/* Progress items */}
        <rect x="330" y="260" width="230" height="25" rx="4" fill="#f8fafc" />
        <rect x="330" y="260" width="207" height="25" rx="4" fill="#e0e7ff" />
        <text x="340" y="277" fontFamily="Arial" fontSize="12" fill="#334155">Accreditation Requirements</text>
        <text x="540" y="277" fontFamily="Arial" fontWeight="bold" fontSize="12" fill="#6366f1" textAnchor="end">90%</text>
        
        <rect x="330" y="295" width="230" height="25" rx="4" fill="#f8fafc" />
        <rect x="330" y="295" width="184" height="25" rx="4" fill="#ddd6fe" />
        <text x="340" y="312" fontFamily="Arial" fontSize="12" fill="#334155">Digital Transformation</text>
        <text x="540" y="312" fontFamily="Arial" fontWeight="bold" fontSize="12" fill="#8b5cf6" textAnchor="end">80%</text>
        
        <rect x="330" y="330" width="230" height="25" rx="4" fill="#f8fafc" />
        <rect x="330" y="330" width="138" height="25" rx="4" fill="#dcfce7" />
        <text x="340" y="347" fontFamily="Arial" fontSize="12" fill="#334155">Research Publications</text>
        <text x="540" y="347" fontFamily="Arial" fontWeight="bold" fontSize="12" fill="#4ade80" textAnchor="end">60%</text>
        
        <rect x="330" y="365" width="230" height="25" rx="4" fill="#f8fafc" />
        <rect x="330" y="365" width="161" height="25" rx="4" fill="#fef3c7" />
        <text x="340" y="382" fontFamily="Arial" fontSize="12" fill="#334155">International Partnerships</text>
        <text x="540" y="382" fontFamily="Arial" fontWeight="bold" fontSize="12" fill="#f59e0b" textAnchor="end">70%</text>
      </g>
    </svg>
  );
};

export default InstituteManagement;