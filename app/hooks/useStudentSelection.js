import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export function useStudentSelection() {
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [isFetchingStudents, setIsFetchingStudents] = useState(false);

  const fetchStudents = useCallback(async (academicYear, department) => {
    if (!academicYear || !department) return;

    setIsFetchingStudents(true);
    try {
      const response = await fetch(`/api/students?academicYear=${academicYear}&department=${department}`);
      if (response.ok) {
        const data = await response.json();
        setAllStudents(data);
        setSelectAll(data.length === selectedStudents.size);
      } else {
        throw new Error("Failed to fetch students");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to fetch students. Please try again.");
    } finally {
      setIsFetchingStudents(false);
    }
  }, [selectedStudents]);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(allStudents.map(student => student._id)));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectionChange = (keys) => {
    setSelectedStudents(new Set(keys));
  };

  return {
    allStudents,
    selectedStudents,
    selectAll,
    isFetchingStudents,
    fetchStudents,
    handleSelectAll,
    handleSelectionChange,
    setAllStudents,
    setSelectedStudents
  };
}

