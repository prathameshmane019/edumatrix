import React from 'react';

// AttendanceSystemModule Component
const AttendanceSystemModule = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500" width="600" height="500" id="AttendanceSystemModule">
      {/* Background with slight gradient */}
      <defs>
        <linearGradient id="attendance-bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f0fdf4" />
          <stop offset="100%" stopColor="#dcfce7" />
        </linearGradient>
        <linearGradient id="attendance-primary-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
        <filter id="attendance-shadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
        </filter>
      </defs>
      
      {/* Main module background */}
      <rect x="0" y="0" width="600" height="500" rx="16" fill="url(#attendance-bg-gradient)" />
      
      {/* Top navigation bar */}
      <rect x="0" y="0" width="600" height="60" rx="16 16 0 0" fill="white" />
      
      {/* Title area */}
      <rect x="20" y="18" width="28" height="24" rx="6" fill="url(#attendance-primary-gradient)" opacity="0.9" />
      <text x="60" y="35" fontFamily="Arial" fontSize="14" fontWeight="bold" fill="#1e293b">Attendance Management System</text>
      
      {/* Navigation icons */}
      <circle cx="510" cy="30" r="16" fill="#f1f5f9" />
      <circle cx="550" cy="30" r="16" fill="#f1f5f9" />
      
      {/* Page header */}
      <text x="40" y="90" fontFamily="Arial" fontWeight="bold" fontSize="18" fill="#1e293b">Today's Attendance</text>
      <text x="40" y="110" fontFamily="Arial" fontSize="14" fill="#64748b">May 4, 2025 | Computer Science Department</text>
      
      {/* Date picker and filters */}
      <g filter="url(#attendance-shadow)">
        <rect x="400" y="80" width="160" height="40" rx="8" fill="white" />
        <text x="420" y="105" fontFamily="Arial" fontSize="14" fill="#1e293b">May 2025</text>
        <circle cx="510" cy="100" r="12" fill="#f1f5f9" />
        <circle cx="540" cy="100" r="12" fill="#f1f5f9" />
      </g>
      
      {/* Course selector */}
      <g filter="url(#attendance-shadow)">
        <rect x="40" y="130" width="260" height="40" rx="8" fill="white" />
        <text x="60" y="155" fontFamily="Arial" fontSize="14" fill="#1e293b">CS301: Advanced Algorithms</text>
        <circle cx="280" cy="150" r="12" fill="#f1f5f9" />
      </g>
      
      {/* Period selector */}
      <g filter="url(#attendance-shadow)">
        <rect x="320" y="130" width="240" height="40" rx="8" fill="white" />
        <text x="340" y="155" fontFamily="Arial" fontSize="14" fill="#1e293b">10:00 AM - 11:30 AM</text>
        <circle cx="540" cy="150" r="12" fill="#f1f5f9" />
      </g>
      
      {/* Attendance summary cards */}
      <g filter="url(#attendance-shadow)">
        <rect x="40" y="190" width="160" height="90" rx="12" fill="white" />
        <text x="60" y="215" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#1e293b">Present</text>
        <text x="60" y="245" fontFamily="Arial" fontWeight="bold" fontSize="24" fill="url(#attendance-primary-gradient)">32</text>
        <text x="90" y="245" fontFamily="Arial" fontSize="14" fill="#64748b">/ 37 students</text>
        <rect x="60" y="255" width="120" height="5" rx="2.5" fill="#f1f5f9" />
        <rect x="60" y="255" width="104" height="5" rx="2.5" fill="#10b981" />
      </g>
      
      <g filter="url(#attendance-shadow)">
        <rect x="220" y="190" width="160" height="90" rx="12" fill="white" />
        <text x="240" y="215" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#1e293b">Absent</text>
        <text x="240" y="245" fontFamily="Arial" fontWeight="bold" fontSize="24" fill="#ef4444">5</text>
        <text x="260" y="245" fontFamily="Arial" fontSize="14" fill="#64748b">/ 37 students</text>
        <rect x="240" y="255" width="120" height="5" rx="2.5" fill="#f1f5f9" />
        <rect x="240" y="255" width="16" height="5" rx="2.5" fill="#ef4444" />
      </g>
      
      <g filter="url(#attendance-shadow)">
        <rect x="400" y="190" width="160" height="90" rx="12" fill="white" />
        <text x="420" y="215" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#1e293b">Attendance Rate</text>
        <text x="420" y="245" fontFamily="Arial" fontWeight="bold" fontSize="24" fill="#1e293b">86%</text>
        <text x="475" y="245" fontFamily="Arial" fontSize="14" fill="#64748b">this week</text>
        <rect x="420" y="255" width="120" height="5" rx="2.5" fill="#f1f5f9" />
        <rect x="420" y="255" width="100" height="5" rx="2.5" fill="#6366f1" />
      </g>
      
      {/* Attendance table */}
      <g filter="url(#attendance-shadow)">
        <rect x="40" y="300" width="520" height="180" rx="12" fill="white" />
        
        {/* Table header */}
        <rect x="40" y="300" width="520" height="40" rx="12 12 0 0" fill="#f8fafc" />
        <text x="70" y="325" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#1e293b">Student</text>
        <text x="300" y="325" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#1e293b">ID</text>
        <text x="420" y="325" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#1e293b">Status</text>
        <text x="520" y="325" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#1e293b">Time</text>
        
        {/* Table rows */}
        <line x1="40" y1="340" x2="560" y2="340" stroke="#e2e8f0" strokeWidth="1" />
        
        {/* Row 1 */}
        <circle cx="60" cy="360" r="15" fill="#dbeafe" />
        <text x="60" y="365" fontFamily="Arial" fontWeight="bold" fontSize="10" fill="#3b82f6" textAnchor="middle">JS</text>
        <text x="85" y="365" fontFamily="Arial" fontSize="14" fill="#1e293b">John Smith</text>
        <text x="280" y="365" fontFamily="Arial" fontSize="14" fill="#64748b">CS22-1045</text>
        <rect x="410" y="352" width="70" height="24" rx="12" fill="#d1fae5" />
        <text x="445" y="367" fontFamily="Arial" fontWeight="bold" fontSize="12" fill="#10b981" textAnchor="middle">Present</text>
        <text x="500" y="365" fontFamily="Arial" fontSize="14" fill="#64748b">9:55 AM</text>
        
        <line x1="40" y1="380" x2="560" y2="380" stroke="#e2e8f0" strokeWidth="1" />
        
        {/* Row 2 */}
        <circle cx="60" cy="400" r="15" fill="#dbeafe" />
        <text x="60" y="405" fontFamily="Arial" fontWeight="bold" fontSize="10" fill="#3b82f6" textAnchor="middle">MJ</text>
        <text x="85" y="405" fontFamily="Arial" fontSize="14" fill="#1e293b">Maria Johnson</text>
        <text x="280" y="405" fontFamily="Arial" fontSize="14" fill="#64748b">DS23-0872</text>
        <rect x="410" y="392" width="70" height="24" rx="12" fill="#d1fae5" />
        <text x="445" y="407" fontFamily="Arial" fontWeight="bold" fontSize="12" fill="#10b981" textAnchor="middle">Present</text>
        <text x="500" y="405" fontFamily="Arial" fontSize="14" fill="#64748b">9:58 AM</text>
        
        <line x1="40" y1="420" x2="560" y2="420" stroke="#e2e8f0" strokeWidth="1" />
        
        {/* Row 3 */}
        <circle cx="60" cy="440" r="15" fill="#dbeafe" />
        <text x="60" y="445" fontFamily="Arial" fontWeight="bold" fontSize="10" fill="#3b82f6" textAnchor="middle">TW</text>
        <text x="85" y="445" fontFamily="Arial" fontSize="14" fill="#1e293b">Tom Wilson</text>
        <text x="280" y="445" fontFamily="Arial" fontSize="14" fill="#64748b">CS22-1078</text>
        <rect x="410" y="432" width="70" height="24" rx="12" fill="#fee2e2" />
        <text x="445" y="447" fontFamily="Arial" fontWeight="bold" fontSize="12" fill="#ef4444" textAnchor="middle">Absent</text>
        <text x="500" y="445" fontFamily="Arial" fontSize="14" fill="#64748b">-</text>
      </g>
    </svg>
  );
};

export default AttendanceSystemModule;