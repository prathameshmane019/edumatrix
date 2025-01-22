export const generateFeedbackTitle = (
    academicYear,
    department,
    className,
    subType,
    semester,
  ) => {
   
    if (academicYear && department && className && subType && semester) {
      console.log(`${academicYear} ${department} ${className} ${subType.toUpperCase()} Semester ${semester}`);
      return `${academicYear} ${department} ${className} ${subType.toUpperCase()} Semester ${semester}`
    }
    return ""
  }
  

  
  