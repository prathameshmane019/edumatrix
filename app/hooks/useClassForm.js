import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getCurrentAcademicYear } from '../utils/acadmicYears';

export function useClassForm(mode, classData, userRole, instituteId) {
  const [formData, setFormData] = useState({
    id: "",
    academicYear: getCurrentAcademicYear(),
    department: userRole !== "superadmin" ? userRole?.department : "",
    teacher: "",
    subjects: {
      sem1: [],
      sem2: []
    }
  });
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    if (mode === "edit" && classData) {
      setFormData({
        id: classData.id || "",
        academicYear: classData.year || "",
        department: classData.department || "",
        teacher: classData.teacher?._id || "",
        subjects: classData.subjects || { sem1: [], sem2: [] }
      });
      setBatches(classData.batches || []);
    }
  }, [mode, classData]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBatchChange = (index, key, value) => {
    setBatches(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };

  const addBatch = () => {
    setBatches(prev => [...prev, { id: "", type: "", students: [] }]);
  };

  const removeBatch = (index) => {
    setBatches(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (selectedStudents) => {
    if (!formData.id || !formData.teacher || !formData.academicYear || !formData.department) {
      toast.error("Please fill in all required fields.");
      return false;
    }
    if (selectedStudents.size === 0) {
      toast.error("Please select at least one student.");
      return false;
    }
    if (batches.some(batch => !batch.id || !batch.type)) {
      toast.error("Please fill in all batch details.");
      return false;
    }
    return true;
  };

  return {
    formData,
    batches,
    handleChange,
    handleBatchChange,
    addBatch,
    removeBatch,
    validateForm
  };
}

