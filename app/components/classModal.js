"use client"
import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Button,
  Checkbox,
  Input,
  Select,
  SelectItem,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Spinner
} from "@nextui-org/react";
import { toast } from "sonner";
import { departmentOptions } from "../utils/department";
import { getAcademicYears, getCurrentAcademicYear } from "../utils/acadmicYears";
import { Calendar, Upload } from 'lucide-react';
import { uploadStudents } from '@/app/actions/uploadStudents';
import { FacultyDropdown } from "./faculty/FacultyDropdown";

const ClassModal = ({ isOpen, onClose, mode, classData, onSubmit,department, userRole, instituteId ,teachers}) => {
  const [formData, setFormData] = useState({
    id: "",
    academicYear: "",
    department: "",
    institute:instituteId,
    teacher: "",
    subjects: {
      sem1: [],
      sem2: []
    }
  });
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingStudents, setIsFetchingStudents] = useState(false);
 
  const [file, setFile] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && classData) {
        setFormData({
          id: classData.id || "",
          academicYear: classData.year || "", // Updated to academicYear
          department: classData.department || "",
          teacher: classData.teacher?._id || "",
          subjects: classData.subjects || { sem1: [], sem2: [] },
          institute:instituteId
        });
        setBatches(classData.batches || []);
        if (classData.students) {
          setSelectedStudents(new Set(classData.students.map(student => student._id)));
        }
        fetchStudents(); // Call fetchStudents with updated parameters
      } else {
        resetForm();
      }
    }
  }, [isOpen, mode, classData]);

  console.log(classData);
  
  const fetchStudents = useCallback(async () => {
    if (!formData.academicYear || !formData.department) return;

    setIsFetchingStudents(true);
    try {
      const response = await fetch(`/api/students?academicYear=${formData.academicYear}&department=${formData.department}`);
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
  }, [formData.academicYear, formData.department, selectedStudents]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(allStudents.map(student => student._id)));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSelectionChange = (keys) => {
    setSelectedStudents(new Set(keys));
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

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      toast.error("No file selected");
      return;
    }

    const allowedTypes = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      toast.error(`Invalid file type. Please upload ${allowedTypes.join(', ')} files.`);
      return;
    }

    setFile(file);

    if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      // For Excel files, we'll process the sheets when the file is uploaded
      setSheetNames([]);
      setSelectedSheet("");
    } else {
      // For CSV files, we don't need to select a sheet
      setSheetNames([]);
      setSelectedSheet("");
    }
  };
  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }


    setIsLoading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("instituteId", instituteId);
      formDataUpload.append("selectedSheet", selectedSheet);
      formDataUpload.append("department", department);

      const result = await uploadStudents(formDataUpload);
      
      console.log('Upload result:', result);

      if (result.success) {
        if (result.sheets) {
          setSheetNames(result.sheets);
          setSelectedSheet(result.sheets[0]);
          toast.success("Excel file processed. Please select a sheet to upload.");
        } else {
          const newStudents = result.students || [];
          
          setAllStudents(prevStudents => {
            const newStudentIds = new Set(newStudents.map(s => s._id));
            const filteredPrevStudents = prevStudents.filter(
              student => !newStudentIds.has(student._id)
            );
            return [...filteredPrevStudents, ...newStudents];
          });

          setSelectedStudents(prevSelected => {
            const newSelectedStudentIds = new Set(newStudents.map(s => s._id));
            return new Set([...prevSelected, ...newSelectedStudentIds]);
          });
          toast.success(result.message);
          setSelectAll(true);
        }
      } else {
        throw new Error(result.error || "Failed to upload students");
      }
    } catch (error) {
      console.error("Comprehensive upload error:", error);
      
      if (error instanceof Error) {
        toast.error(`Upload failed: ${error.message}`);
      } else {
        toast.error("An unexpected error occurred during upload.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
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

  const handleSubmit = async () => {
    if (!validateForm()) return;
    console.log(formData);

    setIsSubmitting(true);
    try {
      const sanitizedFormData = {
        ...formData,
        students: Array.from(selectedStudents),
        batches: batches.map(batch => ({
          ...batch,
          students: Array.from(new Set(batch.students.filter(studentId => selectedStudents.has(studentId))))
        })),
        institute: instituteId
      };
      const url = mode === "add" ? "/api/v2/classes" : `/api/v2/classes?_id=${classData._id}`;
      const method = mode === "add" ? "POST" : "PUT";
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedFormData),
      });
      
      if (response.ok) {
        toast.success(`Class ${mode === "add" ? "added" : "updated"} successfully`);
        onSubmit();
        onClose();
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(`Error occurred while ${mode === "add" ? "adding" : "updating"} class. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: "",
      academicYear: getCurrentAcademicYear(),
      department: department,
      teacher: "",
      subjects: {
        sem1: [],
        sem2: []
      }
    });
    setAllStudents([]);
    setSelectedStudents(new Set());
    setSelectAll(false);
    setBatches([]);
    setFile(null);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => {
        resetForm();
        onClose();
      }} 
      size="3xl"
    >
      <ModalContent className="max-h-[90vh] overflow-y-auto">
        <ModalHeader>{mode === "add" ? "Add Class" : "Edit Class"}</ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Class ID"
              name="id"
              value={formData.id}
              onChange={handleChange}
              required
              disabled={mode !== "add"}
              variant="bordered"
              size="sm"
            />
            <FacultyDropdown
              id="faculty-select"
              instituteId={instituteId}
              onSelect={(value) => handleInputChange('teacher', value)}
              selectedFaculty={formData.teacher}
              className="w-full"
            />
            <Select
              label="Academic Year"
              placeholder="Select Academic Year"
              name="academicYear"
              selectedKeys={formData.academicYear ? [formData.academicYear] : []}
              onSelectionChange={(value) => handleSelectChange("academicYear", value.currentKey)}
              variant="bordered"
              size="sm"
            >
              {getAcademicYears(10).map((year) => (
                <SelectItem key={year.value} value={year.value}>
                  {year.label}
                </SelectItem>
              ))}
            </Select>
            {userRole === "superadmin" ? (
              <Select
                label="Department"
                placeholder="Select department"
                name="department"
                selectedKeys={new Set([formData.department])}
                onSelectionChange={(value) => handleSelectChange("department", value.currentKey)}
                variant="bordered"
                size="sm"
              >
                {departmentOptions.map((department) => (
                  <SelectItem key={department.key} textValue={department.label}>
                    {department.label}
                  </SelectItem>
                ))}
              </Select>
            ) : (
              <Input
                label="Department"
                name="department"
                value={formData.department}
                disabled
                variant="bordered"
                size="sm"
              />
            )}
          </div>
          <div className="mt-4">
          <Input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            label="Upload Students"
            description="Upload a CSV or Excel file with student data"
            startContent={<Upload className="w-4 h-4 text-default-400" />}
          />
          {sheetNames.length > 0 && (
            <Select
              label="Select Sheet"
              placeholder="Choose a sheet"
              selectedKeys={selectedSheet ? [selectedSheet] : []}
              onSelectionChange={(value) => setSelectedSheet(value.currentKey )}
            >
              {sheetNames.map((sheet) => (
                <SelectItem key={sheet} value={sheet}>
                  {sheet}
                </SelectItem>
              ))}
            </Select>
          )}
          <Button onClick={handleUpload} disabled={!file || isLoading}>
            {isLoading ? <Spinner size="sm" /> : "Upload Students"}
          </Button>
        </div>
          <div className="mt-4">
            <Checkbox
              isSelected={selectAll}
              onChange={handleSelectAll}
              isDisabled={isFetchingStudents}
            >
              Select All Students
            </Checkbox>
            <Select
              selectionMode="multiple"
              label="Students"
              name="students"
              selectedKeys={Array.from(selectedStudents)}
              onSelectionChange={handleSelectionChange}
              variant="bordered"
              size="sm"
              className="mt-2"
              isDisabled={isFetchingStudents}
            >
              {isFetchingStudents ? (
                <SelectItem key="loading" textValue="Loading students...">
                  Loading students...
                </SelectItem>
              ) : (
                allStudents.map((student) => (
                  <SelectItem key={student._id} textValue={student.name}>
                    {student.rollNumber} {student.name}
                  </SelectItem>
                ))
              )}
            </Select>
          </div>
          <div className="mt-4">
            <h4>Batches</h4>
            {batches.map((batch, index) => (
              <div key={index} className="border p-4 mb-4 rounded-md">
                <Input
                  label="Batch ID"
                  name={`batch-${index}-id`}
                  value={batch.id}
                  onChange={(e) => handleBatchChange(index, 'id', e.target.value)}
                  required
                  variant="bordered"
                  size="sm"
                />
                <Select
                  label="Batch Type"
                  placeholder="Select Batch Type"
                  selectedKeys={[batch.type]}
                  onSelectionChange={(value) => handleBatchChange(index, 'type', value.currentKey)}
                  variant="bordered"
                  size="sm"
                  className="mb-2"
                >
                  <SelectItem key="practical" textValue="Practical">
                    Practical
                  </SelectItem>
                  <SelectItem key="TG" textValue="TG">
                    TG
                  </SelectItem>
                </Select>
                <Select
                  selectionMode="multiple"
                  label="Batch Students"
                  name={`batch-${index}-students`}
                  selectedKeys={new Set(batch.students)}
                  onSelectionChange={(keys) => handleBatchChange(index, 'students', Array.from(keys))}
                  variant="bordered"
                  size="sm"
                  className="my-2"
                >
                  {allStudents
                    .filter((student) => selectedStudents.has(student._id))
                    .map((student) => (
                    <SelectItem key={student._id} textValue={student.name}>
                      {student.rollNumber} {student.name}
                    </SelectItem>
                  ))}
                </Select>
                <Button
                  color="danger"
                  onClick={() => removeBatch(index)}
                  className="mt-2"
                  size="sm" 
                >
                  Remove Batch
                </Button>
              </div>
            ))}
            <Button onClick={addBatch} size="sm">Add Batch</Button>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button size="md" onClick={() => {
            if (!isSubmitting) {
              resetForm();
              onClose();
            }
          }} isDisabled={isSubmitting}>
            Cancel
          </Button>
          <Button color="primary" size="md" onClick={handleSubmit} isDisabled={isSubmitting || isFetchingStudents}>
            {isSubmitting ? <Spinner size="sm" /> : (mode === "add" ? "Add Class" : "Save Changes")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ClassModal;
