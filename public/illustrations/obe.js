// Main education illustration for the header
const EducationHeaderIllustration = () => (
    <svg viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#6366F1" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="url(#headerGrad)" rx="15" />
      
      {/* Books */}
      <rect x="50" y="130" width="80" height="100" fill="#4F46E5" rx="5" />
      <rect x="60" y="120" width="80" height="100" fill="#6366F1" rx="5" />
      <rect x="70" y="110" width="80" height="100" fill="#818CF8" rx="5" />
      
      {/* Graduation cap */}
      <rect x="240" y="70" width="100" height="10" fill="#312E81" />
      <polygon points="290,80 230,130 350,130 290,80" fill="#312E81" />
      <circle cx="290" cy="105" r="10" fill="#E0E7FF" />
      <rect x="285" y="105" width="10" height="50" fill="#312E81" />
      <circle cx="290" cy="160" r="15" fill="#6366F1" />
      
      {/* Text lines */}
      <rect x="180" y="170" width="150" height="5" fill="#C7D2FE" rx="2" />
      <rect x="200" y="185" width="110" height="5" fill="#C7D2FE" rx="2" />
      <rect x="220" y="200" width="70" height="5" fill="#C7D2FE" rx="2" />
    </svg>
  );
  
  // Implementation process illustration
  const ImplementationProcessIllustration = () => (
    <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="processGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0D9488" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <rect width="300" height="300" fill="url(#processGrad)" rx="10" />
      
      {/* Cycle arrows */}
      <circle cx="150" cy="150" r="100" fill="none" stroke="#0D9488" strokeWidth="5" strokeDasharray="15 10" />
      
      {/* Six points around the circle */}
      <circle cx="150" cy="50" r="20" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
      <text x="150" y="55" textAnchor="middle" fontWeight="bold" fontSize="12" fill="#0284C7">01</text>
      
      <circle cx="225" cy="87.5" r="20" fill="#E0E7FF" stroke="#4F46E5" strokeWidth="2" />
      <text x="225" y="92.5" textAnchor="middle" fontWeight="bold" fontSize="12" fill="#4F46E5">02</text>
      
      <circle cx="225" cy="212.5" r="20" fill="#EDE9FE" stroke="#7C3AED" strokeWidth="2" />
      <text x="225" y="217.5" textAnchor="middle" fontWeight="bold" fontSize="12" fill="#7C3AED">03</text>
      
      <circle cx="150" cy="250" r="20" fill="#CCFBF1" stroke="#0D9488" strokeWidth="2" />
      <text x="150" y="255" textAnchor="middle" fontWeight="bold" fontSize="12" fill="#0D9488">04</text>
      
      <circle cx="75" cy="212.5" r="20" fill="#D1FAE5" stroke="#059669" strokeWidth="2" />
      <text x="75" y="217.5" textAnchor="middle" fontWeight="bold" fontSize="12" fill="#059669">05</text>
      
      <circle cx="75" cy="87.5" r="20" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
      <text x="75" y="92.5" textAnchor="middle" fontWeight="bold" fontSize="12" fill="#D97706">06</text>
      
      {/* Center icon */}
      <rect x="120" y="120" width="60" height="60" fill="#0D9488" fillOpacity="0.2" rx="10" />
      <polygon points="135,135 135,165 165,150" fill="#0D9488" />
    </svg>
  );
  
  // PEO Illustration (Target)
  const PeoIllustration = () => (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="35" fill="#DBEAFE" />
      <circle cx="40" cy="40" r="27" fill="#93C5FD" />
      <circle cx="40" cy="40" r="18" fill="#60A5FA" />
      <circle cx="40" cy="40" r="9" fill="#2563EB" />
      <circle cx="40" cy="40" r="3" fill="#1E40AF" />
      
      {/* Arrow */}
      <line x1="75" y1="20" x2="45" y2="35" stroke="#1E40AF" strokeWidth="2" />
      <polygon points="45,35 50,31 49,38" fill="#1E40AF" />
    </svg>
  );
  
  // PO Illustration (Award)
  const PoIllustration = () => (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="30" r="20" fill="#E0E7FF" stroke="#4F46E5" strokeWidth="2" />
      <polygon points="40,12 43,24 55,24 45,32 49,44 40,36 31,44 35,32 25,24 37,24" fill="#4F46E5" />
      
      {/* Ribbon */}
      <path d="M25,45 L40,50 L55,45 L55,70 L40,65 L25,70 Z" fill="#6366F1" />
      <rect x="38" y="50" width="4" height="15" fill="#4F46E5" />
    </svg>
  );
  
  // PSO Illustration (Info)
  const PsoIllustration = () => (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="35" fill="#CCFBF1" />
      <circle cx="40" cy="25" r="5" fill="#0D9488" />
      <rect x="35" y="35" width="10" height="25" rx="5" fill="#0D9488" />
      
      {/* Document outlines */}
      <rect x="15" y="15" width="20" height="25" fill="#99F6E4" stroke="#0D9488" strokeWidth="1" rx="2" />
      <rect x="20" y="20" width="10" height="2" fill="#0D9488" />
      <rect x="20" y="25" width="10" height="2" fill="#0D9488" />
      <rect x="20" y="30" width="5" height="2" fill="#0D9488" />
      
      <rect x="45" y="15" width="20" height="25" fill="#99F6E4" stroke="#0D9488" strokeWidth="1" rx="2" />
      <rect x="50" y="20" width="10" height="2" fill="#0D9488" />
      <rect x="50" y="25" width="10" height="2" fill="#0D9488" />
      <rect x="50" y="30" width="5" height="2" fill="#0D9488" />
    </svg>
  );
  
  // CO Illustration (Book)
  const CoIllustration = () => (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="15" width="50" height="50" fill="#FEFCE8" stroke="#F59E0B" strokeWidth="2" rx="5" />
      <path d="M20,20 L60,20 L60,60 L20,60 C20,50 20,40 20,30 C30,30 40,32 50,30 C40,32 30,32 20,30 Z" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1" />
      <path d="M30,30 L50,30" stroke="#F59E0B" strokeWidth="1" />
      <path d="M30,35 L50,35" stroke="#F59E0B" strokeWidth="1" />
      <path d="M30,40 L40,40" stroke="#F59E0B" strokeWidth="1" />
      
      {/* Bookmark */}
      <polygon points="55,20 55,35 50,30 45,35 45,20" fill="#FBBF24" />
    </svg>
  );
  
  export { 
    EducationHeaderIllustration, 
    ImplementationProcessIllustration,
    PeoIllustration,
    PoIllustration,
    PsoIllustration,
    CoIllustration
  };