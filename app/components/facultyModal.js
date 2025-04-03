// import React, { useState, useEffect } from "react";
// import { Modal, Button, Input, ModalBody, ModalContent, ModalHeader, ModalFooter } from "@nextui-org/react";
// import { Select, SelectItem } from "@nextui-org/react";
// import { toast } from "sonner";
// import axios from "axios";
// import { departmentOptions } from "../utils/department";

// const FacultyModal = ({ isOpen, onClose, mode, faculty, onSubmit }) => {
//   const [formData, setFormData] = useState({
//     facultyId: "",
//     name: "",
//     department: "",
//     email: "",
//     password: "",
//     isAdmin: false,
//   });
//   const [profile, setProfile] = useState(null);

//   useEffect(() => {
//     const storedProfile = sessionStorage.getItem('userProfile');
//     if (storedProfile) {
//       setProfile(JSON.parse(storedProfile));
//     }
//   }, []);

//   useEffect(() => {
//     if (mode === "edit" && faculty) {
//       setFormData({
//         ...faculty,
//         department: profile?.role === "superadmin" ? faculty.department : profile?.department,
//       });
//     } else {
//       setFormData({
//         facultyId: "",
//         name: "",
//         department: profile?.role === "superadmin" ? "" : profile?.department,
//         email: "",
//         password: "",
//         isAdmin: false,
//       });
//     }
//   }, [mode, faculty, profile]);

//   const handleSelectChange = (key, value) => {
//     setFormData({ ...formData, [key]: value });
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     const updatedFormData = { ...formData, [name]: value };
//     if (profile?.role !== "superadmin" && name === "department") {
//       updatedFormData.department = profile?.department;
//     }
//     setFormData(updatedFormData);
//   };

//   const handleClear = () => {
//     setFormData({
//       facultyId: "",
//       name: "",
//       department: profile?.role === "superadmin" ? "" : profile?.department,
//       email: "",
//       password: "",
//       isAdmin: false,
//     });
//   };

//   const handleSubmit = async () => {
//     try {
//       const dataToSubmit = {
//         ...formData,
//         department: profile?.role === "superadmin" ? formData.department : profile?.department,
//       };
//       let response;
//       if (mode === "add") {
//         response = await axios.post("/api/faculty", dataToSubmit);
//         toast.success('Faculty added successfully');
//         onSubmit();
//       } else if (mode === "edit") {
//         response = await axios.put(`/api/faculty`, dataToSubmit);
//         toast.success('Faculty updated successfully');
//       }
//       onClose();
//       handleClear();
//     } catch (error) {
//       console.error("Error:", error);
//       toast.error('Error occurred while saving faculty data');
//     }
//   };

//   useEffect(() => {
//     if (!isOpen) {
//       handleClear();
//     }
//   }, [isOpen]);

//   return (
//     <Modal isOpen={isOpen} onClose={onClose}>
//       <ModalContent>
//         <ModalHeader>{mode === "add" ? "Add Faculty" : "Edit Faculty"}</ModalHeader>
//         <ModalBody>
//           <Input
//             label="Faculty ID"
//             name="facultyId"
//             value={formData.facultyId}
//             onChange={handleChange}
//             required
//             disabled={mode !== "add"}
//             variant="bordered"
//             size="sm"
//           />
//           <Input
//             label="Name"
//             name="name"
//             value={formData.name}
//             onChange={handleChange}
//             required
//             variant="bordered"
//             size="sm"
//           />
//           {profile?.role === "superadmin" ? (
//             <Select
//               label="Department"
//               placeholder="Select department"
//               name="department"
//               selectedKeys={new Set([formData.department])}
//               onSelectionChange={(value) => handleSelectChange("department", value.currentKey)}
//               variant="bordered"
//               size="sm"
//             >
//               {departmentOptions.map((department) => (
//                 <SelectItem key={department.key} textValue={department.label}>
//                   {department.label}
//                 </SelectItem>
//               ))}
//             </Select>
//           ) : (
//             <Input
//               label="Department"
//               name="department"
//               value={profile?.department}
//               disabled
//               variant="bordered"
//               size="sm"
//             />
//           )}
//           <Input
//             label="Email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             required
//             variant="bordered"
//             size="sm"
//           />
//           <Input
//             label="Password"
//             name="password"
//             value={formData.password}
//             onChange={handleChange}
//             required
//             variant="bordered"
//             size="sm"
//           />
//           <Select
//             label="Admin"
//             placeholder="Select Admin Status"
//             name="isAdmin"
//             selectedKeys={new Set([formData.isAdmin ? "true" : "false"])}
//             onSelectionChange={(value) => handleSelectChange("isAdmin", value.currentKey === "true")}
//             variant="bordered"
//             size="sm"
//           >
//             <SelectItem key="true" textValue="Yes">
//               Yes
//             </SelectItem>
//             <SelectItem key="false" textValue="No">
//               No
//             </SelectItem>
//           </Select>
//         </ModalBody>
//         <ModalFooter>
//           <Button auto flat color="error" onClick={onClose}>
//             Cancel
//           </Button>
//           <Button auto onClick={handleSubmit}>
//             {mode === "add" ? "Add" : "Update"}
//           </Button>
//         </ModalFooter>
//       </ModalContent>
//     </Modal>
//   );
// };

// export default FacultyModal;
import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Input,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Select,
  SelectItem,
  Tabs,
  Tab,
  Card,
  CardBody,
  RadioGroup,
  Radio,
  Textarea
} from "@nextui-org/react";
import { toast } from "sonner";
import axios from "axios"; 
import { Calendar, User, BookOpen, Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import { getAcademicYears } from "../utils/acadmicYears";
import { DepartmentDropdown } from "./department/DepartmentDropDowns";

const FacultyModal = ({ isOpen, onClose, mode, faculty, onSubmit }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    department: "",
    email: "",
    password: "",
    currentYear: "",
    sem: "",
    institute: null,
    // New fields
    contact: "",
    dateOfBirth: "",
    address: "",
    gender: "",
    designation: "",
    employmentType: "teaching",
    dateOfJoining: "",
    education: {
      highestDegree: "",
      specialization: "",
      university: "",
      yearOfPassing: ""
    }
  });
  const [profile, setProfile] = useState(null);
  const [isSubmiting, setIsSubmiting] = useState(false);

  // Define steps
  const steps = [
    { key: "personal", title: "Personal Details" },
    { key: "employment", title: "Employment Details" },
    { key: "education", title: "Educational Details" }
  ];

  // Fetch user profile from session storage
  useEffect(() => {
    const storedProfile = sessionStorage.getItem("userProfile");
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
  }, []);

  // Set form data based on mode and profile
  useEffect(() => {
    if (mode === "edit" && faculty) {
      // Handle education object if it exists
      const educationData = faculty.education || {
        highestDegree: "",
        specialization: "",
        university: "",
        yearOfPassing: ""
      };
      
      setFormData({
        ...faculty,
        department: profile?.role === "superadmin" ? faculty.department : profile?.id,
        institute: faculty.institute?._id || null,
        // Ensure education object is properly structured
        education: educationData
      });
    } else {
      setFormData({
        id: "",
        name: "",
        department: profile?.role === "superadmin" ? "" : profile?.id,
        email: "",
        password: "",
        currentYear: "",
        sem: "",
        institute: profile?.instituteId || null,
        // New fields with defaults
        contact: "",
        dateOfBirth: "",
        address: "",
        gender: "",
        designation: "",
        employmentType: "teaching",
        dateOfJoining: "",
        education: {
          highestDegree: "",
          specialization: "",
          university: "",
          yearOfPassing: ""
        }
      });
    }
  }, [mode, faculty, profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      // Check if this is an education field
      if (name.startsWith("education.")) {
        const educationField = name.split(".")[1];
        return {
          ...prev,
          education: {
            ...prev.education,
            [educationField]: value
          }
        };
      }
      // Otherwise, it's a regular field
      return { ...prev, [name]: value };
    });
  };

  const handleSelectChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleClear = () => {
    setFormData({
      id: "",
      name: "",
      department: profile?.role === "superadmin" ? "" : profile?.id,
      email: "",
      password: "",
      currentYear: "",
      sem: "",
      institute: profile?.instituteId || null,
      // Reset new fields
      contact: "",
      dateOfBirth: "",
      address: "",
      gender: "",
      designation: "",
      employmentType: "teaching",
      dateOfJoining: "",
      education: {
        highestDegree: "",
        specialization: "",
        university: "",
        yearOfPassing: ""
      }
    });
    setActiveStep(0);
  };

  const handleDepartmentSelect = (departmentId) => {
    setFormData((prev) => ({
      ...prev,
      department: departmentId.target.value
    }));
  };

  const handleSubmit = async () => {
    if (isSubmiting) {
      return;
    }
    setIsSubmiting(true);
    try {
      // Create a new object with only non-empty values
      const cleanData = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "education") {
          if (Object.values(value).some(v => v)) {
            const educationData = {};
            Object.entries(value).forEach(([eduKey, eduValue]) => {
              if (eduValue) educationData[eduKey] = eduValue;
            });
            if (Object.keys(educationData).length > 0) {
              cleanData.education = educationData;
            }
          }
        } else if (value) {
          cleanData[key] = value;
        }
      });

      const dataToSubmit = {
        ...cleanData,
        department: profile?.role === "superadmin" ? formData.department : profile?.id,
        institute: formData.institute || (profile?.role === "superadmin" ? profile._id : profile?.institute),
      };
  
      let response;
      
      if (mode === "add") {
        response = await axios.post("/api/v2/faculty", dataToSubmit);
        toast.success("Faculty added successfully");
        onSubmit();
      } else if (mode === "edit") {
        response = await axios.put("/api/v2/faculty", dataToSubmit);
        toast.success("Faculty updated successfully");
        onSubmit();
      }
      
      console.log(response?.data);
      onClose();
      handleClear();
    } catch (error) {
      console.error("Error:", error);
      
      // Handle specific error responses from the API
      if (error.response) {
        const errorMessage = error.response.data.error || "Error occurred while saving faculty data";
        
        if (error.response.status === 409) {
          toast.error(errorMessage);
        } else if (error.response.status === 400) {
          toast.error(errorMessage);
        } else {
          toast.error("Error occurred while saving faculty data");
        }
      } else if (error.request) {
        toast.error("No response received from server. Please try again.");
      } else {
        toast.error("Error occurred while saving faculty data");
      }
    } finally {
      setIsSubmiting(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      handleClear();
    }
  }, [isOpen]);

  const goToNextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const goToPrevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0: // Personal Details
        return (
          <div className="space-y-4">
            <Input
              label="Faculty ID"
              name="id"
              value={formData.id}
              onChange={handleChange}
              required
              disabled={mode !== "add"}
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
              startContent={<User className="w-4 h-4 text-default-400" />}
            />
            <Input
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              variant="bordered"
              size="sm"
              type="email"
            />
            <Input
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={mode === "add"}
              variant="bordered"
              size="sm"
              type="password"
            />
            <Input
              label="Contact Number"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              variant="bordered"
              size="sm"
            />
            <Input
              label="Date of Birth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              variant="bordered"
              size="sm"
              type="date"
            />
            <Textarea
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              variant="bordered"
              size="sm"
            />
            <RadioGroup
              label="Gender"
              orientation="horizontal"
              value={formData.gender}
              onValueChange={(value) => handleSelectChange('gender', value)}
            >
              <Radio value="male">Male</Radio>
              <Radio value="female">Female</Radio>
              <Radio value="other">Other</Radio>
            </RadioGroup>
          </div>
        );
      
      case 1: // Employment Details
        return (
          <div className="space-y-4">
            {profile?.role !== "admin" && (
              <DepartmentDropdown
                instituteId={profile?.role === "superadmin" ? profile?._id : profile?.institute}
                onSelect={handleDepartmentSelect}
                className="w-full"
                size="md"
                selectedDepartment={formData.department}
              />
            )}
            <Input
              label="Designation"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              variant="bordered"
              size="sm"
              startContent={<Briefcase className="w-4 h-4 text-default-400" />}
            />
            <RadioGroup
              label="Employment Type"
              orientation="horizontal"
              value={formData.employmentType}
              onValueChange={(value) => handleSelectChange('employmentType', value)}
            >
              <Radio value="teaching">Teaching</Radio>
              <Radio value="non-teaching">Non-Teaching</Radio>
            </RadioGroup>
            <Input
              label="Date of Joining"
              name="dateOfJoining"
              value={formData.dateOfJoining}
              onChange={handleChange}
              variant="bordered"
              size="sm"
              type="date"
            />
            <Select
              placeholder="Select Year"
              label="Current Academic Year"
              variant="bordered"
              size="sm"
              selectedKeys={formData.currentYear ? [formData.currentYear] : []}
              onSelectionChange={(keys) => setFormData((prev) => ({ ...prev, currentYear: Array.from(keys)[0] }))}
              startContent={<Calendar className="w-4 h-4 text-default-400" />}
              className="w-full"
            >
              {getAcademicYears(10).map((year) => (
                <SelectItem key={year.value} value={year.value}>
                  {year.label}
                </SelectItem>
              ))}
            </Select>
            <Select
              label="Semester"
              placeholder="Select Semester"
              className="col-span-1 w-full"
              selectedKeys={formData.sem ? [formData.sem] : []}
              onSelectionChange={(keys) => handleSelectChange('sem', keys.currentKey)}
              variant="bordered"
              size="sm"
            >
              <SelectItem key="sem1" value="sem1">Semester 1</SelectItem>
              <SelectItem key="sem2" value="sem2">Semester 2</SelectItem>
            </Select>
          </div>
        );
      
      case 2: // Educational Details
        return (
          <div className="space-y-4">
            <Input
              label="Highest Degree"
              name="education.highestDegree"
              value={formData.education.highestDegree}
              onChange={handleChange}
              variant="bordered"
              size="sm"
              startContent={<BookOpen className="w-4 h-4 text-default-400" />}
            />
            <Input
              label="Specialization"
              name="education.specialization"
              value={formData.education.specialization}
              onChange={handleChange}
              variant="bordered"
              size="sm"
            />
            <Input
              label="University"
              name="education.university"
              value={formData.education.university}
              onChange={handleChange}
              variant="bordered"
              size="sm"
            />
            <Input
              label="Year of Passing"
              name="education.yearOfPassing"
              value={formData.education.yearOfPassing}
              onChange={handleChange}
              variant="bordered"
              size="sm"
              type="number"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader>
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-semibold">{mode === "add" ? "Add Faculty" : "Edit Faculty"}</h3>
            <p className="text-sm text-gray-500">Step {activeStep + 1} of {steps.length}: {steps[activeStep].title}</p>
          </div>
        </ModalHeader>
        <ModalBody>
          {/* Stepper Navigation */}
          <div className="flex justify-between mb-4">
            {steps.map((step, index) => (
              <div 
                key={step.key}
                className={`flex flex-col items-center cursor-pointer ${index <= activeStep ? 'text-primary' : 'text-gray-400'}`}
                onClick={() => setActiveStep(index)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 border-2 ${index <= activeStep ? 'border-primary bg-primary/10' : 'border-gray-300'}`}>
                  {index < activeStep ? '✓' : index + 1}
                </div>
                <span className="text-xs">{step.title}</span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 absolute left-[calc(${(index + 0.5) * 100 / steps.length}% - 8px)] ${index < activeStep ? 'bg-primary' : 'bg-gray-300'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <Card>
            <CardBody>
              {renderStepContent(activeStep)}
            </CardBody>
          </Card>
        </ModalBody>
        <ModalFooter>
          <div className="flex w-full justify-between">
            <Button 
              auto 
              variant="light" 
              disabled={activeStep === 0}
              onClick={goToPrevStep}
              startContent={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>
            <div>
              <Button auto flat color="error" onClick={onClose} className="mr-2">
                Cancel
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button 
                  isLoading={isSubmiting} 
                  isDisabled={isSubmiting} 
                  auto 
                  color="primary"
                  onClick={handleSubmit}
                >
                  {mode === "add" ? "Add Faculty" : "Update Faculty"}
                </Button>
              ) : (
                <Button 
                  auto
                  color="primary"
                  onClick={goToNextStep}
                  endContent={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FacultyModal;