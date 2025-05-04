import React from 'react';

const FacultyPortal = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400">
      {/* Background with slight gradient */}
      <defs>
        <linearGradient id="faculty-bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#f1f5f9" />
        </linearGradient>
        <linearGradient id="faculty-primary-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <filter id="faculty-shadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
        </filter>
      </defs>
      
      {/* Main dashboard background */}
      <rect x="0" y="0" width="600" height="400" rx="16" fill="url(#faculty-bg-gradient)" />
      
      {/* Top navigation bar */}
      <rect x="0" y="0" width="600" height="60" rx="16" fill="white" />
      
      {/* Logo area */}
      <rect x="20" y="18" width="140" height="24" rx="6" fill="url(#faculty-primary-gradient)" opacity="0.9" />
      
      {/* Navigation items */}
      <circle cx="510" cy="30" r="18" fill="#f1f5f9" />
      <circle cx="550" cy="30" r="18" fill="#f1f5f9" />
      
      {/* Faculty profile area */}
      <circle cx="470" cy="30" r="20" fill="#e0e7ff" />
      <text x="470" y="35" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#6366f1" textAnchor="middle">DP</text>
      
      {/* Faculty Portal Elements */}
      
      {/* Class Management Card */}
      <g filter="url(#faculty-shadow)">
        <rect x="20" y="90" width="270" height="130" rx="12" fill="white" />
        <text x="40" y="120" fontFamily="Arial" fontWeight="bold" fontSize="16" fill="#1e293b">Today's Classes</text>
        
        {/* Class items */}
        <rect x="40" y="135" width="230" height="30" rx="6" fill="#f8fafc" />
        <rect x="45" y="140" width="5" height="20" rx="2" fill="#4ade80" />
        <text x="60" y="155" fontFamily="Arial" fontSize="13" fill="#334155">CSE101: Database Systems</text>
        <text x="230" y="155" fontFamily="Arial" fontSize="12" fill="#6366f1">10:30</text>
        
        <rect x="40" y="175" width="230" height="30" rx="6" fill="#f8fafc" />
        <rect x="45" y="180" width="5" height="20" rx="2" fill="#f59e0b" />
        <text x="60" y="195" fontFamily="Arial" fontSize="13" fill="#334155">WEB202: Web Development</text>
        <text x="230" y="195" fontFamily="Arial" fontSize="12" fill="#6366f1">13:45</text>
      </g>
      
      {/* Attendance Tracking Card */}
      <g filter="url(#faculty-shadow)">
        <rect x="310" y="90" width="270" height="130" rx="12" fill="white" />
        <text x="330" y="120" fontFamily="Arial" fontWeight="bold" fontSize="16" fill="#1e293b">Attendance Summary</text>
        
        {/* Attendance chart */}
        <circle cx="380" cy="165" r="35" fill="transparent" stroke="#f1f5f9" strokeWidth="8" />
        <circle cx="380" cy="165" r="35" fill="transparent" stroke="#6366f1" strokeWidth="8" strokeDasharray="193" strokeDashoffset="29" />
        <text x="380" y="172" fontFamily="Arial" fontWeight="bold" fontSize="16" fill="#1e293b" textAnchor="middle">85%</text>
        <text x="380" y="190" fontFamily="Arial" fontSize="10" fill="#6366f1" textAnchor="middle">CSE101</text>
        
        <circle cx="470" cy="165" r="35" fill="transparent" stroke="#f1f5f9" strokeWidth="8" />
        <circle cx="470" cy="165" r="35" fill="transparent" stroke="#8b5cf6" strokeWidth="8" strokeDasharray="193" strokeDashoffset="58" />
        <text x="470" y="172" fontFamily="Arial" fontWeight="bold" fontSize="16" fill="#1e293b" textAnchor="middle">70%</text>
        <text x="470" y="190" fontFamily="Arial" fontSize="10" fill="#8b5cf6" textAnchor="middle">WEB202</text>
      </g>
      
      {/* Student Performance Card */}
      <g filter="url(#faculty-shadow)">
        <rect x="20" y="240" width="560" height="140" rx="12" fill="white" />
        <text x="40" y="270" fontFamily="Arial" fontWeight="bold" fontSize="16" fill="#1e293b">Student Performance Analytics</text>
        
        {/* Performance chart */}
        <line x1="40" y1="340" x2="540" y2="340" stroke="#e2e8f0" strokeWidth="1" />
        <line x1="40" y1="310" x2="540" y2="310" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4" />
        <line x1="40" y1="280" x2="540" y2="280" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4" />
        
        {/* Assignment score trend line */}
        <polyline 
          points="70,310 150,290 230,320 310,280 390,300 470,270 540,290" 
          fill="none" 
          stroke="#6366f1" 
          strokeWidth="3"
        />
        
        {/* Data points */}
        <circle cx="70" cy="310" r="4" fill="#6366f1" />
        <circle cx="150" cy="290" r="4" fill="#6366f1" />
        <circle cx="230" cy="320" r="4" fill="#6366f1" />
        <circle cx="310" cy="280" r="4" fill="#6366f1" />
        <circle cx="390" cy="300" r="4" fill="#6366f1" />
        <circle cx="470" cy="270" r="4" fill="#6366f1" />
        <circle cx="540" cy="290" r="4" fill="#6366f1" />
        
        {/* Labels */}
        <text x="70" y="355" fontFamily="Arial" fontSize="10" fill="#64748b" textAnchor="middle">A1</text>
        <text x="150" y="355" fontFamily="Arial" fontSize="10" fill="#64748b" textAnchor="middle">A2</text>
        <text x="230" y="355" fontFamily="Arial" fontSize="10" fill="#64748b" textAnchor="middle">Quiz1</text>
        <text x="310" y="355" fontFamily="Arial" fontSize="10" fill="#64748b" textAnchor="middle">A3</text>
        <text x="390" y="355" fontFamily="Arial" fontSize="10" fill="#64748b" textAnchor="middle">Midterm</text>
        <text x="470" y="355" fontFamily="Arial" fontSize="10" fill="#64748b" textAnchor="middle">A4</text>
        <text x="540" y="355" fontFamily="Arial" fontSize="10" fill="#64748b" textAnchor="middle">Quiz2</text>
      </g>
    </svg>
  );
};

export default FacultyPortal;