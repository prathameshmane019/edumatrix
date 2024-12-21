
import React, { useState, useEffect } from "react";
import { Modal, Button, Input, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem } from "@nextui-org/react";
import { toast } from "sonner";
import axios from "axios";
import { departmentOptions } from "../utils/department";
import { DepartmentDropdown } from "./department/DepartmentDropDowns";
import { Calendar } from "lucide-react";
import { getAcademicYears } from "../utils/acadmicYears";

const StudentModal = ({ isOpen, onClose, mode, student, onSubmit, instituteId }) => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    _id: "",
    rollNumber: "",
    name: "",
    department: "",
    email: "",
    phoneNo: "",
    password: "",
    year: "",
    institute: instituteId
  });

  useEffect(() => {
    const storedProfile = sessionStorage.getItem('userProfile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
  }, []);

  useEffect(() => {
    if (profile?.role !== "superadmin") {
      setFormData((prev) => ({
        ...prev,
        department: profile?.department

      }));
    }
  }, [profile]);

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
        institute: student.institute || instituteId
      });
    } else {
      handleClear();
    }
  }, [mode, student]);

  useEffect(() => {
    if (!isOpen) {
      handleClear();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDepartmentSelect = (departmentId) => {
    console.log(departmentId.target.value);
    setFormData((prev) => ({
      ...prev,
      department: departmentId.target.value
    }));
  }


  const handleClear = () => {
    setFormData({
      _id: "",
      rollNumber: "",
      name: "",
      department: profile?.role === "superadmin" ? "" : profile?.department,
      phoneNo: "",
      email: "",
      password: "",
      year: "",
      institute: instituteId

    });
  };

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      institute: instituteId || prev.institute
    }));
  }, [instituteId]);

  const handleSubmit = async () => {
    try {
      console.log(formData);
      let response;
      if (mode === "add") {
        response = await axios.post("/api/v2/students", formData);
        toast.success("Student added successfully");
      } else if (mode === "edit") {
        response = await axios.put(`/api/v2/student?_id=${formData._id}`, formData);
        toast.success("Student updated successfully");
      }
      onSubmit();
      onClose();
      handleClear();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error occurred while saving student data");
    }
  };

  return (
    <Modal isOpen={isOpen} size="2xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader>{mode === "add" ? "Add Student" : "Edit Student"}</ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-2 gap-4">
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
              label="Select Year"
              variant="bordered"
              size="sm"
              selectedKeys={formData.year ? [formData.year] : []}
              onSelectionChange={(keys) => setFormData((prev) => ({ ...prev, year: Array.from(keys)[0] }))}
              startContent={<Calendar className="w-4 h-4 text-default-400" />}
              className="w-full"
            >
              {getAcademicYears(10).map((year) => (
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
          </div>
        </ModalBody>
        <ModalFooter>
          <Button auto flat color="error" onClick={() => { onClose(); handleClear(); }}>
            Cancel
          </Button>
          <Button auto onClick={handleSubmit}>
            {mode === "add" ? "Add" : "Update"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default StudentModal;
