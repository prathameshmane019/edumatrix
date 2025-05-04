import React from 'react';

const DashboardIllustration = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400">
      {/* Background with slight gradient */}
      <defs>
        <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#f1f5f9" />
        </linearGradient>
        <linearGradient id="primary-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
        </filter>
      </defs>
      
      {/* Main dashboard background */}
      <rect x="0" y="0" width="600" height="400" rx="16" fill="url(#bg-gradient)" />
      
      {/* Top navigation bar */}
      <rect x="0" y="0" width="600" height="60" rx="16" fill="white" />
      
      {/* Logo area */}
      <rect x="20" y="18" width="140" height="24" rx="6" fill="url(#primary-gradient)" opacity="0.9" />
      
      {/* Navigation items */}
      <circle cx="510" cy="30" r="18" fill="#f1f5f9" />
      <circle cx="550" cy="30" r="18" fill="#f1f5f9" />
      <circle cx="470" cy="30" r="18" fill="#f1f5f9" />
      
      {/* Search bar */}
      <rect x="180" y="18" width="200" height="24" rx="12" fill="#f1f5f9" />
      <circle cx="195" cy="30" r="7" fill="#94a3b8" />
      
      {/* Left sidebar */}
      <rect x="0" y="60" width="70" height="340" fill="white" />
      
      {/* Sidebar icons */}
      <rect x="20" y="90" width="30" height="30" rx="8" fill="url(#primary-gradient)" opacity="0.2" />
      <rect x="20" y="140" width="30" height="30" rx="8" fill="#f1f5f9" />
      <rect x="20" y="190" width="30" height="30" rx="8" fill="#f1f5f9" />
      <rect x="20" y="240" width="30" height="30" rx="8" fill="#f1f5f9" />
      <rect x="20" y="290" width="30" height="30" rx="8" fill="#f1f5f9" />
      <rect x="20" y="340" width="30" height="30" rx="8" fill="#f1f5f9" />
      
      {/* Main content area */}
      {/* Header section */}
      <text x="90" y="100" fontFamily="Arial" fontWeight="bold" fontSize="20" fill="#1e293b">Institution Dashboard</text>
      <rect x="90" y="110" width="120" height="4" rx="2" fill="url(#primary-gradient)" />
      
      {/* Stat cards */}
      <g filter="url(#shadow)">
        <rect x="90" y="130" width="150" height="90" rx="12" fill="white" />
        <rect x="100" y="145" width="50" height="50" rx="8" fill="url(#primary-gradient)" opacity="0.1" />
        <circle cx="125" cy="170" r="15" fill="url(#primary-gradient)" opacity="0.8" />
        <text x="165" y="155" fontFamily="Arial" fontWeight="bold" fontSize="12" fill="#475569">Students</text>
        <text x="165" y="180" fontFamily="Arial" fontWeight="bold" fontSize="18" fill="#1e293b">1,547</text>
        <text x="165" y="200" fontFamily="Arial" fontSize="10" fill="#64748b">+12% </text>
      </g>
      
      <g filter="url(#shadow)">
        <rect x="255" y="130" width="150" height="90" rx="12" fill="white" />
        <rect x="265" y="145" width="50" height="50" rx="8" fill="#4ade80" opacity="0.1" />
        <circle cx="290" cy="170" r="15" fill="#4ade80" opacity="0.8" />
        <text x="330" y="155" fontFamily="Arial" fontWeight="bold" fontSize="12" fill="#475569">Attendance</text>
        <text x="330" y="180" fontFamily="Arial" fontWeight="bold" fontSize="18" fill="#1e293b">98%</text>
        <text x="330" y="200" fontFamily="Arial" fontSize="10" fill="#64748b">+2%  </text>
      </g>
      
      <g filter="url(#shadow)">
        <rect x="420" y="130" width="150" height="90" rx="12" fill="white" />
        <rect x="430" y="145" width="50" height="50" rx="8" fill="#f59e0b" opacity="0.1" />
        <circle cx="455" cy="170" r="15" fill="#f59e0b" opacity="0.8" />
        <text x="495" y="155" fontFamily="Arial" fontWeight="bold" fontSize="12" fill="#475569">Results</text>
        <text x="495" y="180" fontFamily="Arial" fontWeight="bold" fontSize="18" fill="#1e293b">85%</text>
        <text x="495" y="200" fontFamily="Arial" fontSize="10" fill="#64748b">Pass rate </text>
      </g>
      
      {/* Chart area */}
      <g filter="url(#shadow)">
        <rect x="90" y="235" width="320" height="150" rx="12" fill="white" />
        <text x="110" y="265" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#1e293b">Enrollment Trends</text>
        
        {/* Bar chart */}
        <rect x="120" y="335" width="30" height="30" rx="2" fill="url(#primary-gradient)" opacity="0.7" />
        <rect x="160" y="315" width="30" height="50" rx="2" fill="url(#primary-gradient)" opacity="0.7" />
        <rect x="200" y="295" width="30" height="70" rx="2" fill="url(#primary-gradient)" opacity="0.7" />
        <rect x="240" y="275" width="30" height="90" rx="2" fill="url(#primary-gradient)" opacity="0.7" />
        <rect x="280" y="285" width="30" height="80" rx="2" fill="url(#primary-gradient)" opacity="0.7" />
        <rect x="320" y="305" width="30" height="60" rx="2" fill="url(#primary-gradient)" opacity="0.7" />
        
        {/* Chart axis */}
        <line x1="110" y1="365" x2="360" y2="365" stroke="#cbd5e1" strokeWidth="1" />
      </g>
      
      {/* Calendar widget */}
      <g filter="url(#shadow)">
        <rect x="425" y="235" width="145" height="150" rx="12" fill="white" />
        <text x="445" y="265" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#1e293b">Calendar</text>
        
        {/* Calendar grid */}
        <rect x="435" y="280" width="125" height="90" rx="4" fill="#f8fafc" />
        <rect x="445" y="290" width="20" height="20" rx="4" fill="#cbd5e1" />
        <rect x="475" y="290" width="20" height="20" rx="4" fill="#cbd5e1" />
        <rect x="505" y="290" width="20" height="20" rx="4" fill="#cbd5e1" />
        <rect x="535" y="290" width="20" height="20" rx="4" fill="#cbd5e1" />
        
        <rect x="445" y="315" width="20" height="20" rx="4" fill="#cbd5e1" />
        <rect x="475" y="315" width="20" height="20" rx="4" fill="url(#primary-gradient)" />
        <rect x="505" y="315" width="20" height="20" rx="4" fill="#cbd5e1" />
        <rect x="535" y="315" width="20" height="20" rx="4" fill="#cbd5e1" />
        
        <rect x="445" y="340" width="20" height="20" rx="4" fill="#cbd5e1" />
        <rect x="475" y="340" width="20" height="20" rx="4" fill="#cbd5e1" />
        <rect x="505" y="340" width="20" height="20" rx="4" fill="#f59e0b" opacity="0.7" />
        <rect x="535" y="340" width="20" height="20" rx="4" fill="#cbd5e1" />
      </g>
    </svg>
  );
};

export { DashboardIllustration };