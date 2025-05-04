import React from 'react';

const StudentDashboard = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400">
      {/* Background with slight gradient */}
      <defs>
        <linearGradient id="student-bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#f1f5f9" />
        </linearGradient>
        <linearGradient id="student-primary-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <filter id="student-shadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
        </filter>
      </defs>
      
      {/* Main dashboard background */}
      <rect x="0" y="0" width="600" height="400" rx="16" fill="url(#student-bg-gradient)" />
      
      {/* Top navigation bar */}
      <rect x="0" y="0" width="600" height="60" rx="16" fill="white" />
      
      {/* Logo area */}
      <rect x="20" y="18" width="140" height="24" rx="6" fill="url(#student-primary-gradient)" opacity="0.9" />
      
      {/* Navigation items */}
      <circle cx="510" cy="30" r="18" fill="#f1f5f9" />
      <circle cx="550" cy="30" r="18" fill="#f1f5f9" />
      
      {/* Student profile area */}
      <circle cx="470" cy="30" r="20" fill="#ddd6fe" />
      <text x="470" y="35" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#6366f1" textAnchor="middle">AS</text>
      
      {/* Student Dashboard Elements */}
      
      {/* Course Progress Card */}
      <g filter="url(#student-shadow)">
        <rect x="20" y="90" width="560" height="100" rx="12" fill="white" />
        <text x="40" y="120" fontFamily="Arial" fontWeight="bold" fontSize="16" fill="#1e293b">Your Course Progress</text>
        
        {/* Progress bars */}
        <rect x="40" y="140" width="200" height="10" rx="5" fill="#f1f5f9" />
        <rect x="40" y="140" width="160" height="10" rx="5" fill="#6366f1" />
        <text x="40" y="165" fontFamily="Arial" fontSize="12" fill="#4b5563">Data Structures</text>
        <text x="240" y="165" fontFamily="Arial" fontWeight="bold" fontSize="12" fill="#6366f1">80%</text>
        
        <rect x="320" y="140" width="200" height="10" rx="5" fill="#f1f5f9" />
        <rect x="320" y="140" width="140" height="10" rx="5" fill="#8b5cf6" />
        <text x="320" y="165" fontFamily="Arial" fontSize="12" fill="#4b5563">Machine Learning</text>
        <text x="520" y="165" fontFamily="Arial" fontWeight="bold" fontSize="12" fill="#8b5cf6">70%</text>
      </g>
      
      {/* Upcoming Classes Card */}
      <g filter="url(#student-shadow)">
        <rect x="20" y="210" width="270" height="170" rx="12" fill="white" />
        <text x="40" y="240" fontFamily="Arial" fontWeight="bold" fontSize="16" fill="#1e293b">Upcoming Classes</text>
        
        {/* Class items */}
        <rect x="40" y="260" width="230" height="40" rx="6" fill="#f8fafc" />
        <rect x="50" y="270" width="20" height="20" rx="4" fill="#dbeafe" />
        <text x="80" y="285" fontFamily="Arial" fontSize="14" fill="#334155">Database Systems</text>
        <text x="220" y="285" fontFamily="Arial" fontSize="12" fill="#6366f1">10:30</text>
        
        <rect x="40" y="310" width="230" height="40" rx="6" fill="#f8fafc" />
        <rect x="50" y="320" width="20" height="20" rx="4" fill="#fef3c7" />
        <text x="80" y="335" fontFamily="Arial" fontSize="14" fill="#334155">Web Development</text>
        <text x="220" y="335" fontFamily="Arial" fontSize="12" fill="#6366f1">13:45</text>
      </g>
      
      {/* Assignment Submission Card */}
      <g filter="url(#student-shadow)">
        <rect x="310" y="210" width="270" height="170" rx="12" fill="white" />
        <text x="330" y="240" fontFamily="Arial" fontWeight="bold" fontSize="16" fill="#1e293b">Pending Assignments</text>
        
        {/* Assignment items */}
        <rect x="330" y="260" width="230" height="40" rx="6" fill="#f8fafc" />
        <rect x="340" y="270" width="20" height="20" rx="4" fill="#fee2e2" />
        <text x="370" y="285" fontFamily="Arial" fontSize="14" fill="#334155">Algorithm Analysis</text>
        <text x="510" y="285" fontFamily="Arial" fontSize="12" fill="#ef4444">Due Today</text>
        
        <rect x="330" y="310" width="230" height="40" rx="6" fill="#f8fafc" />
        <rect x="340" y="320" width="20" height="20" rx="4" fill="#e0e7ff" />
        <text x="370" y="335" fontFamily="Arial" fontSize="14" fill="#334155">Research Project</text>
        <text x="505" y="335" fontFamily="Arial" fontSize="12" fill="#6366f1">3 Days</text>
      </g>
    </svg>
  );
};

export default StudentDashboard;