import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Modal, Button, Input, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem } from "@nextui-org/react";
import { toast } from "sonner";
import axios from "axios";
import { Calendar } from "lucide-react";
import { getAcademicYears } from "../utils/acadmicYears";
import { DepartmentDropdown } from "./department/DepartmentDropDowns";
import { ClassDropdown } from "./Class/ClassDropdown";

const StudentModal = ({ isOpen, onClose, mode, student, onSubmit, instituteId, selectedClass, academicYear }) => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    _id: "",
    rollNumber: "",
    name: "",
    department: "",
    email: "",
    phoneNo: "",
    password: "",
    year: academicYear || "",
    institute: instituteId,
    class: selectedClass || ""
  });
  const [isClassValid, setIsClassValid] = useState(true);
  const [isSubmiting, setIsSubmiting] = useState(false);

  // Memoize initial form state
  const initialFormState = useMemo(() => ({
    _id: "",
    rollNumber: "",
    name: "",
    department: "",
    email: "",
    phoneNo: "",
    password: "",
    year: academicYear || "",
    institute: instituteId,
    class:  ""
  }), [academicYear, instituteId, selectedClass]);

  // Load profile from session storage only once
  useEffect(() => {
    const storedProfile = sessionStorage.getItem('userProfile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
  }, []);

  // Update department based on profile
  useEffect(() => {
    if (profile?.role !== "superadmin") {
      setFormData(prev => ({
        ...prev,
        department: profile?.id
      }));
    }
  }, [profile]);

  // Handle student data for edit mode
  useEffect(() => {
    if (mode === "edit" && student) {
      setFormData({
        _id: student._id,
        rollNumber: student.rollNumber,
        name: student.name,
        department: student.department,
        email: student.email,
        phoneNo: student.phoneNo,
        password: student.password,
        year: student.year,
        class: student.class,
        institute: student.institute || instituteId
      });
    } else {
      handleClear();
    }
  }, [mode, student, instituteId]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      handleClear();
    }
  }, [isOpen]);

  // Update institute ID when it changes
  useEffect(() => {
    if (instituteId) {
      setFormData(prev => ({
        ...prev,
        institute: instituteId
      }));
    }
  }, [instituteId]);

  // Memoized handlers
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleInputChange = useCallback((name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Reset class validity when class is changed
    if (name === 'class') {
      setIsClassValid(true);
    }
  }, []);

  const handleDepartmentSelect = useCallback((departmentId) => {
    setFormData(prev => ({
      ...prev,
      department: departmentId.target.value,
      class: '' // Reset class when department changes
    }));
    setIsClassValid(true);
  }, []);

  const handleClear = useCallback(() => {
    setFormData(prev => ({
      ...initialFormState,
      department: profile?.role === "superadmin" ? "" : profile?.id
    }));
    setIsClassValid(true);
  }, [initialFormState, profile]);

  // Validate form data
  const validateForm = useCallback(() => {
    if (!formData.department) {
      toast.error("Please select department");
      return false;
    }
    if (!formData.class) {
      toast.error("Please select class");
      return false;
    }
    if (!isClassValid) {
      toast.error("Selected class is not available. Please choose a valid class");
      return false;
    }
    return true;
  }, [formData.department, formData.class, isClassValid]);

  const handleSubmit = async () => {
    if (isSubmiting) return // Prevent multiple submissions
 
    setIsSubmiting(true)
    try {
      console.log(formData);
      
      if (!validateForm()) return;

      const endpoint = mode === "add" 
        ? "/api/v2/students"
        : `/api/v2/students?_id=${formData._id}`;

      const method = mode === "add" ? "post" : "put";
      
      await axios[method](endpoint, formData);
      toast.success(`Student ${mode === "add" ? "added" : "updated"} successfully`);
      onSubmit();
      onClose();
      handleClear();
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error.response?.data?.message || "Error occurred while saving student data";
      toast.error(errorMessage);
    }
    finally{
      setIsSubmiting(false)
    }
  };

  // Memoize academic years options
  const academicYearsOptions = useMemo(() => getAcademicYears(10), []);

  return (
    <Modal isOpen={isOpen} size="2xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader>{mode === "add" ? "Add Student" : "Edit Student"}</ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-2 gap-5">
            <Input
              label="ID"
              name="_id"
              value={formData._id}
              onChange={handleChange}
              required
              disabled={mode !== "add"}
              variant="bordered"
              size="sm"
            />
            <Input
              label="Roll Number"
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleChange}
              required
              variant="bordered"
              size="sm"
            />
            <Input
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              variant="bordered"
              size="sm"
            />
            <Select
              placeholder="Select Year"
              label="Admission Year"
              variant="bordered"
              required
              size="sm"
              selectedKeys={formData.year ? [formData.year] : []}
              onSelectionChange={(keys) => handleInputChange('year', Array.from(keys)[0])}
              startContent={<Calendar className="w-4 h-4 text-default-400" />}
              className="w-full"
            >
              {academicYearsOptions.map((year) => (
                <SelectItem key={year.value} value={year.value}>
                  {year.label}
                </SelectItem>
              ))}
            </Select>
            <Input
              label="Phone No."
              name="phoneNo"
              value={formData.phoneNo}
              onChange={handleChange}
              required
              variant="bordered"
              size="sm"
            />
            <Input
              label="Email ID"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              variant="bordered"
              size="sm"
            />
            <Input
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              variant="bordered"

              size="sm"
            />
            {profile?.role !== "admin" && (
              <DepartmentDropdown
                instituteId={profile?.role === "superadmin" ? profile?._id : profile?.institute}
                onSelect={handleDepartmentSelect}
                className="w-full"
                size="md"
                selectedDepartment={formData.department}
              />
            )}
            <ClassDropdown 
              id="class-select"
              instituteId={formData.institute || instituteId}
              onSelect={(value) => handleInputChange('class', value)}
              selectedClass={ formData.class}
              acadmicYear={formData.year}
              selectedDepartment={formData.department || profile?.id}
              label="Class (Compulsory)"
              onValidityChange={setIsClassValid}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button auto flat color="error" isDisabled={isSubmiting} onClick={() => { onClose(); handleClear(); }}>
            Cancel
          </Button>
          <Button auto color="primary" isLoading={isSubmiting}  isDisabled={isSubmiting} onClick={handleSubmit}>
            {mode === "add" ? "Add" : "Update"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default StudentModal;