// This file should be saved as: /public/home/DashboardIllustration.js

// We're exporting a component that simply returns the SVG code
// This component will be imported in our Hero section
export const DashboardIllustration = () => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="100%" height="100%">
        {/* Background Elements */}
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.1"/>
            <stop offset="50%" stopColor="#6366F1" stopOpacity="0.1"/>
            <stop offset="100%" stopColor="#9333EA" stopOpacity="0.1"/>
          </linearGradient>
          <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF"/>
            <stop offset="100%" stopColor="#F3F4F6"/>
          </linearGradient>
          <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="10" floodOpacity="0.15"/>
          </filter>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>
  
        {/* Abstract Background Shapes */}
        <circle cx="200" cy="150" r="300" fill="url(#bgGradient)" opacity="0.6"/>
        <circle cx="750" cy="550" r="250" fill="url(#bgGradient)" opacity="0.5"/>
        <path d="M0,350 Q250,100 500,350 T1000,350" stroke="#4F46E5" strokeWidth="1" fill="none" opacity="0.1"/>
        <path d="M0,400 Q250,150 500,400 T1000,400" stroke="#6366F1" strokeWidth="1" fill="none" opacity="0.1"/>
        
        {/* Faint Institution Buildings Outline */}
        <path d="M100,500 L100,350 L150,300 L200,350 L200,500 Z" stroke="#6366F1" strokeWidth="1" fill="none" opacity="0.15"/>
        <path d="M220,500 L220,380 L270,330 L320,380 L320,500 Z" stroke="#6366F1" strokeWidth="1" fill="none" opacity="0.15"/>
        <path d="M700,500 L700,330 L800,280 L900,330 L900,500 Z" stroke="#6366F1" strokeWidth="1" fill="none" opacity="0.15"/>
        <path d="M750,500 L750,350 L800,320 L850,350 L850,500 Z" stroke="#6366F1" strokeWidth="1" fill="none" opacity="0.15"/>
  
        {/* Desktop Screen - Main Dashboard */}
        <rect x="300" y="120" width="400" height="280" rx="10" ry="10" fill="#334155" filter="url(#dropShadow)"/>
        <rect x="310" y="130" width="380" height="260" rx="5" ry="5" fill="white"/>
        
        {/* Dashboard Header */}
        <rect x="310" y="130" width="380" height="40" rx="5" ry="5" fill="#4F46E5"/>
        <text x="330" y="155" fontFamily="Arial" fontSize="14" fill="white" fontWeight="bold">EduMatrix Pro Dashboard</text>
        <circle cx="650" cy="150" r="8" fill="white" opacity="0.8"/>
        <circle cx="675" cy="150" r="8" fill="white" opacity="0.8"/>
        
        {/* Navigation Sidebar */}
        <rect x="310" y="170" width="80" height="220" fill="#F1F5F9"/>
        
        {/* Sidebar Icons */}
        <circle cx="350" cy="200" r="15" fill="#4F46E5" opacity="0.1"/>
        <path d="M350,195 L350,205 M345,200 L355,200" stroke="#4F46E5" strokeWidth="2"/>
        
        <circle cx="350" cy="240" r="15" fill="#4F46E5" opacity="0.1"/>
        <path d="M345,240 L355,240 M350,235 L350,245" stroke="#4F46E5" strokeWidth="2"/>
        
        <circle cx="350" cy="280" r="15" fill="#4F46E5" opacity="0.1"/>
        <rect x="345" y="275" width="10" height="10" stroke="#4F46E5" strokeWidth="2" fill="none"/>
        
        <circle cx="350" cy="320" r="15" fill="#4F46E5" opacity="0.1"/>
        <path d="M345,320 C345,317 350,315 350,320 C350,315 355,317 355,320" stroke="#4F46E5" strokeWidth="2" fill="none"/>
        
        {/* Dashboard Content Area */}
        {/* Attendance Card */}
        <rect x="400" y="180" width="130" height="90" rx="5" ry="5" fill="url(#cardGradient)" filter="url(#dropShadow)"/>
        <circle cx="425" cy="205" r="15" fill="#10B981" opacity="0.2"/>
        <path d="M418,205 L423,210 L432,200" stroke="#10B981" strokeWidth="2" fill="none"/>
        <text x="450" y="205" fontFamily="Arial" fontSize="12" fill="#111827" fontWeight="bold">Attendance</text>
        <text x="450" y="225" fontFamily="Arial" fontSize="18" fill="#10B981" fontWeight="bold">98%</text>
        <text x="490" y="225" fontFamily="Arial" fontSize="10" fill="#6B7280">Present</text>
        <rect x="420" y="240" width="90" height="5" rx="2.5" ry="2.5" fill="#E5E7EB"/>
        <rect x="420" y="240" width="80" height="5" rx="2.5" ry="2.5" fill="#10B981"/>
        <text x="420" y="260" fontFamily="Arial" fontSize="9" fill="#6B7280">Updated Today</text>
        
        {/* Exam Schedule Card */}
        <rect x="540" y="180" width="130" height="90" rx="5" ry="5" fill="url(#cardGradient)" filter="url(#dropShadow)"/>
        <circle cx="565" cy="205" r="15" fill="#3B82F6" opacity="0.2"/>
        <rect x="558" y="198" width="14" height="14" rx="2" ry="2" stroke="#3B82F6" strokeWidth="2" fill="none"/>
        <path d="M558,204 H572" stroke="#3B82F6" strokeWidth="1"/>
        <text x="590" y="205" fontFamily="Arial" fontSize="12" fill="#111827" fontWeight="bold">Exam Schedule</text>
        <text x="590" y="225" fontFamily="Arial" fontSize="10" fill="#3B82F6" fontWeight="bold">MAY 15</text>
        <text x="590" y="240" fontFamily="Arial" fontSize="9" fill="#6B7280">Final Semester</text>
        <text x="590" y="255" fontFamily="Arial" fontSize="9" fill="#6B7280">All Subjects</text>
        
        {/* Performance Chart */}
        <rect x="400" y="280" width="270" height="100" rx="5" ry="5" fill="url(#cardGradient)" filter="url(#dropShadow)"/>
        <text x="420" y="300" fontFamily="Arial" fontSize="12" fill="#111827" fontWeight="bold">Student Performance</text>
        
        {/* Simple Line Chart */}
        <polyline points="420,350 445,330 470,340 495,320 520,300 545,310 570,290 595,280 620,290 645,270" 
                  stroke="#4F46E5" strokeWidth="2" fill="none"/>
        <circle cx="420" cy="350" r="3" fill="#4F46E5"/>
        <circle cx="445" cy="330" r="3" fill="#4F46E5"/>
        <circle cx="470" cy="340" r="3" fill="#4F46E5"/>
        <circle cx="495" cy="320" r="3" fill="#4F46E5"/>
        <circle cx="520" cy="300" r="3" fill="#4F46E5"/>
        <circle cx="545" cy="310" r="3" fill="#4F46E5"/>
        <circle cx="570" cy="290" r="3" fill="#4F46E5"/>
        <circle cx="595" cy="280" r="3" fill="#4F46E5"/>
        <circle cx="620" cy="290" r="3" fill="#4F46E5"/>
        <circle cx="645" cy="270" r="3" fill="#4F46E5"/>
        
        {/* X-axis labels */}
        <text x="420" y="365" fontFamily="Arial" fontSize="7" fill="#6B7280">Jan</text>
        <text x="470" y="365" fontFamily="Arial" fontSize="7" fill="#6B7280">Mar</text>
        <text x="520" y="365" fontFamily="Arial" fontSize="7" fill="#6B7280">May</text>
        <text x="570" y="365" fontFamily="Arial" fontSize="7" fill="#6B7280">Jul</text>
        <text x="620" y="365" fontFamily="Arial" fontSize="7" fill="#6B7280">Sep</text>
  
        {/* Mobile Device */}
        <rect x="720" y="150" width="120" height="220" rx="15" ry="15" fill="#334155" filter="url(#dropShadow)"/>
        <rect x="727" y="160" width="106" height="190" rx="5" ry="5" fill="white"/>
        <rect x="760" y="150" width="40" height="5" rx="2.5" ry="2.5" fill="#334155"/>
        <circle cx="780" cy="360" r="10" stroke="#334155" strokeWidth="1" fill="none"/>
        
        {/* Mobile Screen Content */}
        <rect x="727" y="160" width="106" height="25" rx="5" ry="5" fill="#4F46E5"/>
        <text x="740" y="177" fontFamily="Arial" fontSize="9" fill="white" fontWeight="bold">Student View</text>
        
        {/* Mobile Attendance Widget */}
        <rect x="737" y="195" width="86" height="60" rx="5" ry="5" fill="url(#cardGradient)" filter="url(#dropShadow)"/>
        <circle cx="752" cy="210" r="8" fill="#10B981" opacity="0.2"/>
        <path d="M749,210 L751,213 L756,208" stroke="#10B981" strokeWidth="1" fill="none"/>
        <text x="767" y="213" fontFamily="Arial" fontSize="8" fill="#111827" fontWeight="bold">Present</text>
        <text x="752" y="230" fontFamily="Arial" fontSize="7" fill="#6B7280">Today's Classes:</text>
        <text x="752" y="240" fontFamily="Arial" fontSize="7" fill="#6B7280">• Mathematics</text>
        <text x="752" y="250" fontFamily="Arial" fontSize="7" fill="#6B7280">• Computer Science</text>
        
        {/* Mobile Notification */}
        <rect x="737" y="265" width="86" height="40" rx="5" ry="5" fill="url(#cardGradient)" filter="url(#dropShadow)"/>
        <circle cx="752" cy="280" r="8" fill="#3B82F6" opacity="0.2"/>
        <rect x="749" y="277" width="6" height="6" rx="1" ry="1" stroke="#3B82F6" strokeWidth="1" fill="none"/>
        <text x="767" y="282" fontFamily="Arial" fontSize="8" fill="#111827" fontWeight="bold">Due Today</text>
      <text x="752" y="295" fontFamily="Arial" fontSize="7" fill="#6B7280">Assignment: Data Structures</text>
      
      {/* Mobile Menu */}
      <rect x="737" y="315" width="86" height="25" rx="5" ry="5" fill="#F3F4F6"/>
      <circle cx="752" cy="327" r="3" fill="#4F46E5"/>
      <circle cx="762" cy="327" r="3" fill="#9CA3AF"/>
      <circle cx="772" cy="327" r="3" fill="#9CA3AF"/>
      <circle cx="782" cy="327" r="3" fill="#9CA3AF"/>
      <circle cx="792" cy="327" r="3" fill="#9CA3AF"/>
      
      {/* Laptop */}
      <rect x="450" y="430" width="250" height="160" rx="10" ry="10" fill="#334155" filter="url(#dropShadow)"/>
      <rect x="460" y="440" width="230" height="130" rx="2" ry="2" fill="white"/>
      <rect x="490" y="590" width="170" height="10" rx="5" ry="5" fill="#334155"/>
      
      {/* Laptop Content - Assignment Portal */}
      <rect x="460" y="440" width="230" height="25" rx="2" ry="2" fill="#4F46E5"/>
      <text x="480" y="457" fontFamily="Arial" fontSize="12" fill="white" fontWeight="bold">Student Assignment Portal</text>
      
      {/* Assignment Table */}
      <rect x="470" y="475" width="210" height="85" rx="3" ry="3" fill="white" stroke="#E5E7EB" strokeWidth="1"/>
      
      {/* Table Headers */}
      <rect x="470" y="475" width="210" height="20" rx="3" ry="3" fill="#F3F4F6"/>
      <text x="480" y="489" fontFamily="Arial" fontSize="9" fill="#4B5563" fontWeight="bold">Subject</text>
      <text x="570" y="489" fontFamily="Arial" fontSize="9" fill="#4B5563" fontWeight="bold">Due Date</text>
      <text x="640" y="489" fontFamily="Arial" fontSize="9" fill="#4B5563" fontWeight="bold">Status</text>
      
      {/* Table Rows */}
      <line x1="470" y1="495" x2="680" y2="495" stroke="#E5E7EB" strokeWidth="1"/>
      
      <text x="480" y="510" fontFamily="Arial" fontSize="8" fill="#111827">Mathematics</text>
      <text x="570" y="510" fontFamily="Arial" fontSize="8" fill="#111827">May 10</text>
      <rect x="640" y="503" width="35" height="10" rx="5" ry="5" fill="#DCFCE7"/>
      <text x="645" y="510" fontFamily="Arial" fontSize="7" fill="#059669">Done</text>
      
      <line x1="470" y1="515" x2="680" y2="515" stroke="#E5E7EB" strokeWidth="1"/>
      
      <text x="480" y="530" fontFamily="Arial" fontSize="8" fill="#111827">Data Structures</text>
      <text x="570" y="530" fontFamily="Arial" fontSize="8" fill="#111827">May 5</text>
      <rect x="640" y="523" width="40" height="10" rx="5" ry="5" fill="#FFEDD5"/>
      <text x="645" y="530" fontFamily="Arial" fontSize="7" fill="#D97706">Pending</text>
      
      <line x1="470" y1="535" x2="680" y2="535" stroke="#E5E7EB" strokeWidth="1"/>
      
      <text x="480" y="550" fontFamily="Arial" fontSize="8" fill="#111827">Physics</text>
      <text x="570" y="550" fontFamily="Arial" fontSize="8" fill="#111827">May 12</text>
      <rect x="640" y="543" width="35" height="10" rx="5" ry="5" fill="#FEE2E2"/>
      <text x="645" y="550" fontFamily="Arial" fontSize="7" fill="#DC2626">Late</text>
      
      {/* Connection Lines */}
      <path d="M400,250 C350,300 320,400 450,430" stroke="#9CA3AF" strokeWidth="1" fill="none" strokeDasharray="5,5"/>
      <path d="M650,350 C700,380 800,300 780,250" stroke="#9CA3AF" strokeWidth="1" fill="none" strokeDasharray="5,5"/>
      
      {/* Notification Badges */}
      <circle cx="650" cy="450" r="15" fill="#EF4444" filter="url(#glow)"/>
      <text x="650" y="454" fontFamily="Arial" fontSize="10" fill="white" fontWeight="bold" textAnchor="middle">2</text>
      
      <circle cx="780" cy="180" r="10" fill="#EF4444" filter="url(#glow)"/>
      <text x="780" y="183" fontFamily="Arial" fontSize="8" fill="white" fontWeight="bold" textAnchor="middle">3</text>
      
      {/* Decorative Elements */}
      <circle cx="200" cy="400" r="5" fill="#4F46E5" opacity="0.5"/>
      <circle cx="220" cy="420" r="3" fill="#6366F1" opacity="0.5"/>
      <circle cx="190" cy="430" r="4" fill="#8B5CF6" opacity="0.5"/>
      
      <circle cx="800" cy="150" r="5" fill="#4F46E5" opacity="0.5"/>
      <circle cx="820" cy="170" r="3" fill="#6366F1" opacity="0.5"/>
      <circle cx="790" cy="180" r="4" fill="#8B5CF6" opacity="0.5"/>
    </svg>
  );
};

// Export the component as default for easier importing
export default DashboardIllustration;