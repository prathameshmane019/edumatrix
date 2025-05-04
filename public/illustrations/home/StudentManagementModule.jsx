import React from 'react';

// StudentManagementModule Component
const StudentManagementModule = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500" id="StudentManagementModule">
      {/* Background with slight gradient */}
      <defs>
        <linearGradient id="student-bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f0f9ff" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>
        <linearGradient id="student-primary-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <filter id="student-shadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
        </filter>
      </defs>
      
      {/* Main module background */}
      <rect x="0" y="0" width="600" height="500" rx="16" fill="url(#student-bg-gradient)" />
      
      {/* Top navigation bar */}
      <rect x="0" y="0" width="600" height="60" rx="16" fill="white" />
      
      {/* Title area */}
      <rect x="20" y="18" width="180" height="24" rx="6" fill="url(#student-primary-gradient)" opacity="0.9" />
      <text x="220" y="35" fontFamily="Arial" fontSize="14" fill="#1e293b">Student Management System</text>
      
      {/* Navigation icons */}
      <circle cx="510" cy="30" r="16" fill="#f1f5f9" />
      <circle cx="550" cy="30" r="16" fill="#f1f5f9" />
      
      {/* Left sidebar */}
      <rect x="0" y="60" width="180" height="440" fill="#f8fafc" />
      
      {/* Sidebar menu items */}
      <rect x="20" y="80" width="140" height="40" rx="8" fill="url(#student-primary-gradient)" opacity="0.9" />
      <text x="50" y="105" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="white">Dashboard</text>
      
      <rect x="20" y="130" width="140" height="40" rx="8" fill="white" />
      <text x="50" y="155" fontFamily="Arial" fontSize="14" fill="#1e293b">Students</text>
      
      <rect x="20" y="180" width="140" height="40" rx="8" fill="white" />
      <text x="50" y="205" fontFamily="Arial" fontSize="14" fill="#1e293b">Courses</text>
      
      <rect x="20" y="230" width="140" height="40" rx="8" fill="white" />
      <text x="50" y="255" fontFamily="Arial" fontSize="14" fill="#1e293b">Attendance</text>
      
      <rect x="20" y="280" width="140" height="40" rx="8" fill="white" />
      <text x="50" y="305" fontFamily="Arial" fontSize="14" fill="#1e293b">Grades</text>
      
      <rect x="20" y="330" width="140" height="40" rx="8" fill="white" />
      <text x="50" y="355" fontFamily="Arial" fontSize="14" fill="#1e293b">Reports</text>
      
      {/* Main content area title */}
      <text x="200" y="90" fontFamily="Arial" fontWeight="bold" fontSize="18" fill="#1e293b">Student Dashboard</text>
      
      {/* Search bar */}
      <rect x="200" y="110" width="380" height="40" rx="8" fill="white" filter="url(#student-shadow)" />
      <text x="220" y="135" fontFamily="Arial" fontSize="14" fill="#94a3b8">Search students...</text>
      <circle cx="560" cy="130" r="12" fill="#f1f5f9" />
      
      {/* Student cards row */}
      <g filter="url(#student-shadow)">
        <rect x="200" y="170" width="180" height="220" rx="12" fill="white" />
        <circle cx="290" cy="220" r="40" fill="#dbeafe" />
        <text x="290" y="225" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#3b82f6" textAnchor="middle">JS</text>
        <text x="290" y="270" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#1e293b" textAnchor="middle">John Smith</text>
        <text x="290" y="290" fontFamily="Arial" fontSize="12" fill="#64748b" textAnchor="middle">Computer Science</text>
        <text x="290" y="310" fontFamily="Arial" fontSize="12" fill="#64748b" textAnchor="middle">ID: CS22-1045</text>
        <rect x="240" y="330" width="100" height="30" rx="6" fill="url(#student-primary-gradient)" />
        <text x="290" y="350" fontFamily="Arial" fontWeight="bold" fontSize="12" fill="white" textAnchor="middle">View Profile</text>
      </g>
      
      <g filter="url(#student-shadow)">
        <rect x="400" y="170" width="180" height="220" rx="12" fill="white" />
        <circle cx="490" cy="220" r="40" fill="#dbeafe" />
        <text x="490" y="225" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#3b82f6" textAnchor="middle">MJ</text>
        <text x="490" y="270" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#1e293b" textAnchor="middle">Maria Johnson</text>
        <text x="490" y="290" fontFamily="Arial" fontSize="12" fill="#64748b" textAnchor="middle">Data Science</text>
        <text x="490" y="310" fontFamily="Arial" fontSize="12" fill="#64748b" textAnchor="middle">ID: DS23-0872</text>
        <rect x="440" y="330" width="100" height="30" rx="6" fill="url(#student-primary-gradient)" />
        <text x="490" y="350" fontFamily="Arial" fontWeight="bold" fontSize="12" fill="white" textAnchor="middle">View Profile</text>
      </g>
      
      {/* Recent activity section */}
      <text x="200" y="410" fontFamily="Arial" fontWeight="bold" fontSize="16" fill="#1e293b">Recent Activity</text>
      
      <g filter="url(#student-shadow)">
        <rect x="200" y="425" width="380" height="60" rx="8" fill="white" />
        <circle cx="230" cy="455" r="15" fill="#dbeafe" />
        <text x="230" y="460" fontFamily="Arial" fontWeight="bold" fontSize="12" fill="#3b82f6" textAnchor="middle">JS</text>
        <text x="260" y="450" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#1e293b">John Smith</text>
        <text x="260" y="470" fontFamily="Arial" fontSize="12" fill="#64748b">Submitted assignment: Data Structures Project</text>
        <text x="560" y="455" fontFamily="Arial" fontSize="12" fill="#94a3b8" textAnchor="end">2 hours ago</text>
      </g>
      
      <g>
        <rect x="200" y="495" width="380" height="1" fill="#e2e8f0" />
      </g>
    </svg>
  );
};

export default StudentManagementModule;