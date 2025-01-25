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
import { getAcademicYears, getCurrentAcademicYear } from "../utils/acadmicYears";
import { Calendar } from 'lucide-react';
import { FacultyDropdown } from "./faculty/FacultyDropdown";
import { DepartmentDropdown } from "./department/DepartmentDropDowns";
import { ClassDropdown } from "./Class/ClassDropdown";
import axios from 'axios';

const ClassModal = ({ isOpen, onClose, mode, classData, onSubmit, department, userRole, instituteId, teachers }) => {
  const [formData, setFormData] = useState({
    id: "",
    academicYear: "",
    department: department,
    institute: instituteId,
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingStudents, setIsFetchingStudents] = useState(false);
  const [previousClassId, setPreviousClassId] = useState("");

 
  
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && classData) {
        setFormData({
          id: classData.id || "",
          academicYear: classData.year || "",
          department: classData.department || "",
          teacher: classData.teacher?._id || "",
          subjects: classData.subjects || { sem1: [], sem2: [] },
          institute: instituteId
        });
        setBatches(classData.batches || []);
        fetchStudents(classData._id);
      } else {
        resetForm();
      }
    }
  }, [isOpen, mode, classData]);

  const fetchStudents = useCallback(async (classId) => {
    if (!formData.academicYear || !formData.department) {
      setAllStudents([]);
      setSelectedStudents(new Set());
      return;
    }

    setIsFetchingStudents(true);
    try {
      const response = await axios.get(`/api/v2/utils/class-students`, {
        params: {
          classId: classId || previousClassId,
          department: formData.department,
          academicYear: formData.academicYear
        }
      });

      if (response.data) {
        const students = response.data;
        setAllStudents(students);

        if (mode === "edit" || previousClassId) {
          const studentIds = new Set(students.map(student => student._id));
          setSelectedStudents(studentIds);
          setSelectAll(true);
        } else {
          setSelectedStudents(new Set());
          setSelectAll(false);
        }

        setBatches(prevBatches => prevBatches.map(batch => ({
          ...batch,
          students: batch.students.filter(studentId =>
            students.some(s => s._id === studentId)
          )
        })));
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error(error.response?.data?.message || "Failed to fetch students. Please try again.");
      setAllStudents([]);
      setSelectedStudents(new Set());
    } finally {
      setIsFetchingStudents(false);
    }
  }, [formData.academicYear, formData.department, mode, previousClassId]);

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

  const validateForm = () => {
    console.log(formData);
    
    if (!formData.id   || !formData.academicYear || !formData.department) {
      toast.error("Please fill in all required fields.");
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
    setPreviousClassId("");
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
              size='md'
              label="Class Coordinator"
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
            {userRole !== "admin" && (
              <DepartmentDropdown
                instituteId={instituteId}
                onSelect={(departmentId) => handleInputChange('department', departmentId.target.value)}
                className="w-full"
                size="md"
                selectedDepartment={formData.department}
              />
            )}
          </div>
          {mode === "add" && (
            <div className="mt-4">
              <ClassDropdown
                id="previous-class-select"
                instituteId={instituteId}
                onSelect={(value) => {
                  setPreviousClassId(value);
                  if (value) {
                    fetchStudents(value);
                  }
                }}
                selectedClass={previousClassId}
                acadmicYear={formData.academicYear}
                selectedDepartment={formData.department}
                className="w-full"
                label="Select Previous Class (Optional)"
              />
            </div>
          )}
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
                  className="my-2"
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

