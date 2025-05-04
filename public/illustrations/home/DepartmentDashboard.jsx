import React from 'react';

const DepartmentDashboard = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400">
      {/* Background with slight gradient */}
      <defs>
        <linearGradient id="dept-bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#f1f5f9" />
        </linearGradient>
        <linearGradient id="dept-primary-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <filter id="dept-shadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
        </filter>
      </defs>
      
      {/* Main dashboard background */}
      <rect x="0" y="0" width="600" height="400" rx="16" fill="url(#dept-bg-gradient)" />
      
      {/* Top navigation bar */}
      <rect x="0" y="0" width="600" height="60" rx="16" fill="white" />
      
      {/* Logo area */}
      <rect x="20" y="18" width="140" height="24" rx="6" fill="url(#dept-primary-gradient)" opacity="0.9" />
      
      {/* Navigation items */}
      <circle cx="510" cy="30" r="18" fill="#f1f5f9" />
      <circle cx="550" cy="30" r="18" fill="#f1f5f9" />
      
      {/* Department head profile area */}
      <circle cx="470" cy="30" r="20" fill="#dbeafe" />
      <text x="470" y="35" fontFamily="Arial" fontWeight="bold" fontSize="12" fill="#3b82f6" textAnchor="middle">DH</text>
      
      {/* Department heading */}
      <text x="20" y="90" fontFamily="Arial" fontWeight="bold" fontSize="16" fill="#1e293b">Department of Computer Science</text>
      
      {/* Department KPI Cards */}
      <g filter="url(#dept-shadow)">
        <rect x="20" y="110" width="130" height="100" rx="12" fill="white" />
        <text x="35" y="135" fontFamily="Arial" fontWeight="bold" fontSize="12" fill="#1e293b">Students</text>
        <text x="35" y="165" fontFamily="Arial" fontWeight="bold" fontSize="22" fill="#1e293b">825</text>
        <rect x="35" y="175" width="50" height="3" rx="1.5" fill="#6366f1" />
        <text x="35" y="195" fontFamily="Arial" fontSize="12" fill="#6366f1">+8% from last year</text>
      </g>
      
      <g filter="url(#dept-shadow)">
        <rect x="165" y="110" width="130" height="100" rx="12" fill="white" />
        <text x="180" y="135" fontFamily="Arial" fontWeight="bold" fontSize="12" fill="#1e293b">Faculty</text>
        <text x="180" y="165" fontFamily="Arial" fontWeight="bold" fontSize="22" fill="#1e293b">42</text>
        <rect x="180" y="175" width="50" height="3" rx="1.5" fill="#6366f1" />
        <text x="180" y="195" fontFamily="Arial" fontSize="12" fill="#6366f1">+2 new hires</text>
      </g>
      
      <g filter="url(#dept-shadow)">
        <rect x="310" y="110" width="130" height="100" rx="12" fill="white" />
        <text x="325" y="135" fontFamily="Arial" fontWeight="bold" fontSize="12" fill="#1e293b">Research Grants</text>
        <text x="325" y="165" fontFamily="Arial" fontWeight="bold" fontSize="22" fill="#1e293b">$4.2M</text>
        <rect x="325" y="175" width="50" height="3" rx="1.5" fill="#6366f1" />
        <text x="325" y="195" fontFamily="Arial" fontSize="12" fill="#6366f1">+12% from last year</text>
      </g>
      
      <g filter="url(#dept-shadow)">
        <rect x="455" y="110" width="130" height="100" rx="12" fill="white" />
        <text x="470" y="135" fontFamily="Arial" fontWeight="bold" fontSize="12" fill="#1e293b">Publications</text>
        <text x="470" y="165" fontFamily="Arial" fontWeight="bold" fontSize="22" fill="#1e293b">127</text>
        <rect x="470" y="175" width="50" height="3" rx="1.5" fill="#6366f1" />
        <text x="470" y="195" fontFamily="Arial" fontSize="12" fill="#6366f1">86 peer-reviewed</text>
      </g>
      
      {/* Program Enrollment Chart */}
      <g filter="url(#dept-shadow)">
        <rect x="20" y="225" width="270" height="160" rx="12" fill="white" />
        <text x="30" y="256" fontFamily="Arial" fontWeight="bold" fontSize="12" fill="#1e293b">Program Enrollment</text>
        
        {/* Chart bars */}
        <rect x="40" y="270" width="20" height="90" rx="4" fill="#c7d2fe" />
        <rect x="40" y="310" width="20" height="50" fill="#6366f1" rx="2" />
        <text x="50" y="375" fontFamily="Arial" fontSize="10" fill="#64748b" textAnchor="middle">BSc</text>
        
        <rect x="80" y="260" width="20" height="100" rx="4" fill="#c7d2fe" />
        <rect x="80" y="320" width="20" height="40" fill="#6366f1" rx="2" />
        <text x="90" y="375" fontFamily="Arial" fontSize="10" fill="#64748b" textAnchor="middle">MSc</text>
        
        <rect x="120" y="280" width="20" height="80" rx="4" fill="#c7d2fe" />
        <rect x="120" y="330" width="20" height="30" fill="#6366f1" rx="2" />
        <text x="130" y="375" fontFamily="Arial" fontSize="10" fill="#64748b" textAnchor="middle">PhD</text>
        
        <rect x="160" y="240" width="20" height="120" rx="4" fill="#c7d2fe" />
        <rect x="160" y="300" width="20" height="60" fill="#6366f1" rx="2" />
        <text x="170" y="375" fontFamily="Arial" fontSize="10" fill="#64748b" textAnchor="middle">AI/ML</text>
        
        <rect x="200" y="290" width="20" height="70" rx="4" fill="#c7d2fe" />
        <rect x="200" y="330" width="20" height="30" fill="#6366f1" rx="2" />
        <text x="210" y="375" fontFamily="Arial" fontSize="10" fill="#64748b" textAnchor="middle">Cyber</text>
        
        {/* Legend */}
        <rect x="40" y="230" width="10" height="10" rx="2" fill="#c7d2fe" />
        <text x="55" y="239" fontFamily="Arial" fontSize="10" fill="#64748b">Total</text>
        
        <rect x="100" y="230" width="10" height="10" rx="2" fill="#6366f1" />
        <text x="115" y="239" fontFamily="Arial" fontSize="10" fill="#64748b">New Students</text>
      </g>
      
      {/* Department News/Updates */}
      <g filter="url(#dept-shadow)">
        <rect x="305" y="225" width="280" height="160" rx="12" fill="white" />
        <text x="325" y="250" fontFamily="Arial" fontWeight="bold" fontSize="12" fill="#1e293b">Recent Updates</text>
        
        {/* News items */}
        <rect x="325" y="265" width="240" height="1" fill="#e2e8f0" />
        
        <circle cx="335" cy="280" r="5" fill="#6366f1" />
        <text x="350" y="284" fontFamily="Arial" fontSize="12" fill="#1e293b">New AI Research Lab opening next month</text>
        
        <rect x="325" y="295" width="240" height="1" fill="#e2e8f0" />
        
        <circle cx="335" cy="310" r="5" fill="#6366f1" />
        <text x="350" y="314" fontFamily="Arial" fontSize="12" fill="#1e293b">Dr. Smith awarded NSF CAREER grant</text>
        
        <rect x="325" y="325" width="240" height="1" fill="#e2e8f0" />
        
        <circle cx="335" cy="340" r="5" fill="#6366f1" />
        <text x="350" y="344" fontFamily="Arial" fontSize="12" fill="#1e293b">New CS2 curriculum approved</text>
       
        <rect x="325" y="355" width="240" height="1" fill="#e2e8f0" />
        
        <circle cx="335" cy="370" r="5" fill="#6366f1" />
        <text x="350" y="374" fontFamily="Arial" fontSize="12" fill="#1e293b">Student hackathon winners announced</text>
      
      </g>
    </svg>
  );
};

export default DepartmentDashboard;