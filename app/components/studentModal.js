// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import { Modal, Button, Input, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, RadioGroup, Radio } from "@nextui-org/react";
// import { toast } from "sonner";
// import axios from "axios";
// import { Calendar, User, GraduationCap, Users } from "lucide-react";
// import { getAcademicYears } from "../utils/acadmicYears";
// import { DepartmentDropdown } from "./department/DepartmentDropDowns";
// import { ClassDropdown } from "./Class/ClassDropdown";

// const StudentModal = ({ isOpen, onClose, mode, student, onSubmit, instituteId, selectedClass, academicYear }) => {
//   const [profile, setProfile] = useState(null);
//   const [activeStep, setActiveStep] = useState(0);
//   const [isClassValid, setIsClassValid] = useState(true);
//   const [isSubmiting, setIsSubmiting] = useState(false);

//   const [formData, setFormData] = useState({
//     _id: "",
//     rollNumber: "",
//     name: "",
//     department: "",
//     email: "",
//     phoneNo: "",
//     password: "",
//     year: academicYear || "",
//     institute: instituteId,
//     class: selectedClass || "",
//     // New fields
//     dateOfBirth: "",
//     gender: "",
//     status: "active",
//     parentName: "",
//     parentContact: "",
//     parentEmail: "",
//     parentOccupation: "",
//     relationWithStudent: "",
//     admissionDate: "",
//     categoryType: "",
//     admissionNumber: ""
//   });

//   // Memoize initial form state
//   const initialFormState = useMemo(() => ({
//     _id: "",
//     rollNumber: "",
//     name: "",
//     department: "",
//     email: "",
//     phoneNo: "",
//     password: "",
//     year: academicYear || "",
//     institute: instituteId,
//     class: "",
//     // New fields
//     dateOfBirth: "",
//     gender: "",
//     status: "active",
//     parentName: "",
//     parentContact: "",
//     parentEmail: "",
//     parentOccupation: "",
//     relationWithStudent: "",
//     admissionDate: "",
//     categoryType: "",
//     admissionNumber: ""
//   }), [academicYear, instituteId, selectedClass]);

//   // Load profile from session storage only once
//   useEffect(() => {
//     const storedProfile = sessionStorage.getItem('userProfile');
//     if (storedProfile) {
//       setProfile(JSON.parse(storedProfile));
//     }
//   }, []);

//   // Update department based on profile
//   useEffect(() => {
//     if (profile?.role !== "superadmin") {
//       setFormData(prev => ({
//         ...prev,
//         department: profile?.id
//       }));
//     }
//   }, [profile]);

//   // Handle student data for edit mode
//   useEffect(() => {
//     if (mode === "edit" && student) {
//       setFormData({
//         _id: student._id,
//         rollNumber: student.rollNumber,
//         name: student.name,
//         department: student.department,
//         email: student.email,
//         phoneNo: student.phoneNo,
//         password: student.password,
//         year: student.year,
//         class: student.class,
//         institute: student.institute || instituteId,
//         // New fields with fallbacks
//         dateOfBirth: student.dateOfBirth || "",
//         gender: student.gender || "",
//         status: student.status || "active",
//         parentName: student.parentName || "",
//         parentContact: student.parentContact || "",
//         parentEmail: student.parentEmail || "",
//         parentOccupation: student.parentOccupation || "",
//         relationWithStudent: student.relationWithStudent || "",
//         admissionDate: student.admissionDate || "",
//         categoryType: student.categoryType || "",
//         admissionNumber: student.admissionNumber || ""
//       });
//     } else {
//       handleClear();
//     }
//   }, [mode, student, instituteId]);

//   // Reset form when modal closes
//   useEffect(() => {
//     if (!isOpen) {
//       handleClear();
//       setActiveStep(0);
//     }
//   }, [isOpen]);

//   // Update institute ID when it changes
//   useEffect(() => {
//     if (instituteId) {
//       setFormData(prev => ({
//         ...prev,
//         institute: instituteId
//       }));
//     }
//   }, [instituteId]);

//   // Memoized handlers
//   const handleChange = useCallback((e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   }, []);

//   const handleInputChange = useCallback((name, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
    
//     // Reset class validity when class is changed
//     if (name === 'class') {
//       setIsClassValid(true);
//     }
//   }, []);

//   const handleDepartmentSelect = useCallback((departmentId) => {
//     setFormData(prev => ({
//       ...prev,
//       department: departmentId.target.value,
//       class: '' // Reset class when department changes
//     }));
//     setIsClassValid(true);
//   }, []);

//   const handleClear = useCallback(() => {
//     setFormData(prev => ({
//       ...initialFormState,
//       department: profile?.role === "superadmin" ? "" : profile?.id
//     }));
//     setIsClassValid(true);
//   }, [initialFormState, profile]);

//   // Validate form data
//   const validateForm = useCallback(() => {
//     if (!formData._id) {
//       toast.error("ID is required");
//       setActiveStep(0);
//       return false;
//     }
//     if (!formData.rollNumber) {
//       toast.error("Roll Number is required");
//       setActiveStep(0);
//       return false;
//     }
//     if (!formData.name) {
//       toast.error("Name is required");
//       setActiveStep(0);
//       return false;
//     }
//     if (!formData.year) {
//       toast.error("Admission Year is required");
//       setActiveStep(1);
//       return false;
//     }
//     if (!formData.department) {
//       toast.error("Please select department");
//       setActiveStep(3);
//       return false;
//     }
//     if (!formData.class) {
//       toast.error("Please select class");
//       setActiveStep(3);
//       return false;
//     }
//     if (!isClassValid) {
//       toast.error("Selected class is not available. Please choose a valid class");
//       setActiveStep(3);
//       return false;
//     }
//     return true;
//   }, [formData, isClassValid]);

//   const handleSubmit = async () => {
//     if (isSubmiting) return; // Prevent multiple submissions
 
//     setIsSubmiting(true);
//     try {
//       console.log(formData);
      
//       if (!validateForm()) {
//         setIsSubmiting(false);
//         return;
//       }

//       const endpoint = mode === "add" 
//         ? "/api/v2/students"
//         : `/api/v2/students?_id=${formData._id}`;

//       const method = mode === "add" ? "post" : "put";
      
//       await axios[method](endpoint, formData);
//       toast.success(`Student ${mode === "add" ? "added" : "updated"} successfully`);
//       onSubmit();
//       onClose();
//       handleClear();
//       setActiveStep(0);
//     } catch (error) {
//       console.error("Error:", error);
//       const errorMessage = error.response?.data?.message || "Error occurred while saving student data";
//       toast.error(errorMessage);
//     } finally {
//       setIsSubmiting(false);
//     }
//   };

//   // Memoize academic years options
//   const academicYearsOptions = useMemo(() => getAcademicYears(10), []);

//   const steps = [
//     { title: "Personal Details", icon: <User className="w-5 h-5" /> },
//     { title: "Admission Details", icon: <GraduationCap className="w-5 h-5" /> },
//     { title: "Parent Details", icon: <Users className="w-5 h-5" /> },
//     { title: "Academic Details", icon: <Calendar className="w-5 h-5" /> }
//   ];

//   const nextStep = () => {
//     if (activeStep < steps.length - 1) {
//       setActiveStep(activeStep + 1);
//     }
//   };

//   const prevStep = () => {
//     if (activeStep > 0) {
//       setActiveStep(activeStep - 1);
//     }
//   };

//   // Render different form sections based on active step
//   const renderStepContent = () => {
//     switch (activeStep) {
//       case 0: // Personal Details
//         return (
//           <div className="grid grid-cols-2 gap-5">
//             <Input
//               label="ID"
//               name="_id"
//               value={formData._id}
//               onChange={handleChange}
//               required
//               disabled={mode !== "add"}
//               variant="bordered"
//               size="sm"
//             />
//             <Input
//               label="Roll Number"
//               name="rollNumber"
//               value={formData.rollNumber}
//               onChange={handleChange}
//               required
//               variant="bordered"
//               size="sm"
//             />
//             <Input
//               label="Name"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               required
//               variant="bordered"
//               size="sm"
//             />
//             <Input
//               label="Date of Birth"
//               name="dateOfBirth"
//               value={formData.dateOfBirth}
//               onChange={handleChange}
//               type="date"
//               variant="bordered"
//               size="sm"
//             />
//             <RadioGroup
//               label="Gender"
//               orientation="horizontal"
//               value={formData.gender}
//               onValueChange={(value) => handleInputChange('gender', value)}
//             >
//               <Radio value="Male">Male</Radio>
//               <Radio value="Female">Female</Radio>
//               <Radio value="Other">Other</Radio>
//             </RadioGroup>
//             <Input
//               label="Email ID"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               variant="bordered"
//               size="sm"
//             />
//             <Input
//               label="Phone No."
//               name="phoneNo"
//               value={formData.phoneNo}
//               onChange={handleChange}
//               variant="bordered"
//               size="sm"
//             />
//             <Input
//               label="Password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               variant="bordered"
//               size="sm"
//             />
//           </div>
//         );
//       case 1: // Admission Details
//         return (
//           <div className="grid grid-cols-2 gap-5">
//             <Input
//               label="Admission Number"
//               name="admissionNumber"
//               value={formData.admissionNumber}
//               onChange={handleChange}
//               variant="bordered"
//               size="sm"
//             />
//             <Input
//               label="Admission Date"
//               name="admissionDate"
//               value={formData.admissionDate}
//               onChange={handleChange}
//               type="date"
//               variant="bordered"
//               size="sm"
//             />
//             <Select
//               placeholder="Select Year"
//               label="Admission Year"
//               variant="bordered"
//               required
//               size="sm"
//               selectedKeys={formData.year ? [formData.year] : []}
//               onSelectionChange={(keys) => handleInputChange('year', Array.from(keys)[0])}
//               startContent={<Calendar className="w-4 h-4 text-default-400" />}
//               className="w-full"
//             >
//               {academicYearsOptions.map((year) => (
//                 <SelectItem key={year.value} value={year.value}>
//                   {year.label}
//                 </SelectItem>
//               ))}
//             </Select>
//             <Select
//               placeholder="Select Category"
//               label="Category Type"
//               variant="bordered"
//               size="sm"
//               selectedKeys={formData.categoryType ? [formData.categoryType] : []}
//               onSelectionChange={(keys) => handleInputChange('categoryType', Array.from(keys)[0])}
//               className="w-full"
//             >
//               <SelectItem key="management" value="management">Management</SelectItem>
//               <SelectItem key="reserved" value="reserved">Reserved</SelectItem>
//               <SelectItem key="cap" value="cap">CAP</SelectItem>
//             </Select>
//             <Select
//               placeholder="Select Status"
//               label="Status"
//               variant="bordered"
//               size="sm"
//               selectedKeys={formData.status ? [formData.status] : []}
//               onSelectionChange={(keys) => handleInputChange('status', Array.from(keys)[0])}
//               className="w-full"
//             >
//               <SelectItem key="active" value="active">Active</SelectItem>
//               <SelectItem key="suspended" value="suspended">Suspended</SelectItem>
//               <SelectItem key="alumni" value="alumni">Alumni</SelectItem>
//             </Select>
//           </div>
//         );
//       case 2: // Parent Details
//         return (
//           <div className="grid grid-cols-2 gap-5">
//             <Input
//               label="Parent Name"
//               name="parentName"
//               value={formData.parentName}
//               onChange={handleChange}
//               variant="bordered"
//               size="sm"
//             />
//             <Select
//               placeholder="Select Relation"
//               label="Relation with Student"
//               variant="bordered"
//               size="sm"
//               selectedKeys={formData.relationWithStudent ? [formData.relationWithStudent] : []}
//               onSelectionChange={(keys) => handleInputChange('relationWithStudent', Array.from(keys)[0])}
//               className="w-full"
//             >
//               <SelectItem key="Father" value="Father">Father</SelectItem>
//               <SelectItem key="Mother" value="Mother">Mother</SelectItem>
//               <SelectItem key="Guardian" value="Guardian">Guardian</SelectItem>
//               <SelectItem key="Other" value="Other">Other</SelectItem>
//             </Select>
//             <Input
//               label="Parent Contact"
//               name="parentContact"
//               value={formData.parentContact}
//               onChange={handleChange}
//               variant="bordered"
//               size="sm"
//             />
//             <Input
//               label="Parent Email"
//               name="parentEmail"
//               value={formData.parentEmail}
//               onChange={handleChange}
//               variant="bordered"
//               size="sm"
//             />
//             <Input
//               label="Parent Occupation"
//               name="parentOccupation"
//               value={formData.parentOccupation}
//               onChange={handleChange}
//               variant="bordered"
//               size="sm"
//             />
//           </div>
//         );
//       case 3: // Academic Details
//         return (
//           <div className="grid grid-cols-2 gap-5">
//             {profile?.role !== "admin" && (
//               <DepartmentDropdown
//                 instituteId={profile?.role === "superadmin" ? profile?._id : profile?.institute}
//                 onSelect={handleDepartmentSelect}
//                 className="w-full"
//                 size="md"
//                 selectedDepartment={formData.department}
//               />
//             )}
//             <ClassDropdown 
//               id="class-select"
//               instituteId={formData.institute || instituteId}
//               onSelect={(value) => handleInputChange('class', value)}
//               selectedClass={formData.class}
//               acadmicYear={formData.year}
//               selectedDepartment={formData.department || profile?.id}
//               label="Class (Compulsory)"
//               onValidityChange={setIsClassValid}
//             />
//           </div>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <Modal isOpen={isOpen} size="2xl" onClose={onClose}>
//       <ModalContent>
//         <ModalHeader>{mode === "add" ? "Add Student" : "Edit Student"}</ModalHeader>
//         <ModalBody>
//           {/* Stepper */}
//           <div className="flex justify-between mb-6">
//             {steps.map((step, index) => (
//               <div key={index} className="flex flex-col items-center">
//                 <div 
//                   className={`flex items-center justify-center w-10 h-10 rounded-full mb-2 ${
//                     index === activeStep 
//                       ? "bg-primary text-white" 
//                       : index < activeStep 
//                         ? "bg-primary-200 text-primary-700" 
//                         : "bg-gray-200 text-gray-500"
//                   }`}
//                   onClick={() => setActiveStep(index)}
//                   style={{ cursor: 'pointer' }}
//                 >
//                   {step.icon}
//                 </div>
//                 <span className={`text-xs ${index === activeStep ? "font-semibold" : ""}`}>
//                   {step.title}
//                 </span>
//               </div>
//             ))}
//           </div>

//           {/* Step Indicator */}
//           <div className="mb-6">
//             <h3 className="text-lg font-medium">{steps[activeStep].title}</h3>
//           </div>

//           {/* Step Content */}
//           {renderStepContent()}
//         </ModalBody>
//         <ModalFooter>
//           <div className="flex w-full justify-between">
//             <div>
//               <Button auto flat color="default" isDisabled={activeStep === 0} onClick={prevStep}>
//                 Previous
//               </Button>
//             </div>
//             <div className="flex gap-2">
//               <Button auto flat color="error" isDisabled={isSubmiting} onClick={() => { onClose(); handleClear(); }}>
//                 Cancel
//               </Button>
//               {activeStep === steps.length - 1 ? (
//                 <Button auto color="primary" isLoading={isSubmiting} isDisabled={isSubmiting} onClick={handleSubmit}>
//                   {mode === "add" ? "Submit" : "Update"}
//                 </Button>
//               ) : (
//                 <Button auto color="primary" onClick={nextStep}>
//                   Next
//                 </Button>
//               )}
//             </div>
//           </div>
//         </ModalFooter>
//       </ModalContent>
//     </Modal>
//   );
// };

// export default StudentModal;


import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Modal, Button, Input, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, RadioGroup, Radio } from "@nextui-org/react";
import { toast } from "sonner";
import axios from "axios";
import { Calendar, User, GraduationCap, Users } from "lucide-react";
import { getAcademicYears } from "../utils/acadmicYears";
import { DepartmentDropdown } from "./department/DepartmentDropDowns";
import { ClassDropdown } from "./Class/ClassDropdown";

const StudentModal = ({ isOpen, onClose, mode, student, onSubmit, instituteId, selectedClass, academicYear }) => {
  const [profile, setProfile] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isClassValid, setIsClassValid] = useState(true);
  const [isSubmiting, setIsSubmiting] = useState(false);

  // Initial form data state with nested structure mapping
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
    class: selectedClass || "",
    dateOfBirth: "",
    gender: "",
    status: "active",
    parentName: "",
    parentContact: "",
    parentEmail: "",
    parentOccupation: "",
    relationWithStudent: "",
    admissionDate: "",
    categoryType: "merit",
    admissionNumber: ""
  });

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
    class: "",
    dateOfBirth: "",
    gender: "",
    status: "active",
    parentName: "",
    parentContact: "",
    parentEmail: "",
    parentOccupation: "",
    relationWithStudent: "",
    admissionDate: "",
    categoryType: "merit",
    admissionNumber: ""
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
      // Map nested structure from DB to flat form structure
      setFormData({
        _id: student._id,
        rollNumber: student.academicDetails?.rollNumber || "",
        name: student.personalDetails?.name || "",
        department: student.academicDetails?.department || "",
        email: student.personalDetails?.email || "",
        phoneNo: student.personalDetails?.phoneNo || "",
        password: student.password || "",
        year: student.year || "",
        class: student.academicDetails?.class || "",
        institute: student.academicDetails?.institute || instituteId,
        dateOfBirth: student.personalDetails?.dateOfBirth || "",
        gender: student.personalDetails?.gender || "",
        status: student.admission?.status || "active",
        parentName: student.parents?.name || "",
        parentContact: student.parents?.contact || "",
        parentEmail: student.parents?.email || "",
        parentOccupation: student.parents?.occupation || "",
        relationWithStudent: student.parents?.relation || "",
        admissionDate: student.admission?.admissionDate || "",
        categoryType: student.admission?.categoryType || "merit",
        admissionNumber: student.admission?.admissionNumber || ""
      });
    } else {
      handleClear();
    }
  }, [mode, student, instituteId]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      handleClear();
      setActiveStep(0);
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
    if (!formData._id) {
      toast.error("ID is required");
      setActiveStep(0);
      return false;
    }
    if (!formData.rollNumber) {
      toast.error("Roll Number is required");
      setActiveStep(0);
      return false;
    }
    if (!formData.name) {
      toast.error("Name is required");
      setActiveStep(0);
      return false;
    }
    if (!formData.year) {
      toast.error("Admission Year is required");
      setActiveStep(1);
      return false;
    }
    if (!formData.department) {
      toast.error("Please select department");
      setActiveStep(3);
      return false;
    }
    if (!formData.class) {
      toast.error("Please select class");
      setActiveStep(3);
      return false;
    }
    if (!isClassValid) {
      toast.error("Selected class is not available. Please choose a valid class");
      setActiveStep(3);
      return false;
    }
    return true;
  }, [formData, isClassValid]);

  const handleSubmit = async () => {
    if (isSubmiting) return; // Prevent multiple submissions
 
    setIsSubmiting(true);
    try {
      console.log(formData);
      
      if (!validateForm()) {
        setIsSubmiting(false);
        return;
      }

      const endpoint = mode === "add" 
        ? "/api/v2/students"
        : `/api/v2/students?_id=${formData._id}`;

      const method = mode === "add" ? "post" : "put";
      
      await axios[method](endpoint, formData);
      toast.success(`Student ${mode === "add" ? "added" : "updated"} successfully`);
      onSubmit();
      onClose();
      handleClear();
      setActiveStep(0);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error.response?.data?.message || "Error occurred while saving student data";
      toast.error(errorMessage);
    } finally {
      setIsSubmiting(false);
    }
  };

  // Memoize academic years options
  const academicYearsOptions = useMemo(() => getAcademicYears(10), []);

  const steps = [
    { title: "Personal Details", icon: <User className="w-5 h-5" /> },
    { title: "Admission Details", icon: <GraduationCap className="w-5 h-5" /> },
    { title: "Parent Details", icon: <Users className="w-5 h-5" /> },
    { title: "Academic Details", icon: <Calendar className="w-5 h-5" /> }
  ];

  const nextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  // Render different form sections based on active step
  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Personal Details
        return (
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
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              variant="bordered"
              size="sm"
            />
            <Input
              label="Date of Birth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              type="date"
              variant="bordered"
              size="sm"
            />
            <RadioGroup
              label="Gender"
              orientation="horizontal"
              value={formData.gender}
              onValueChange={(value) => handleInputChange('gender', value)}
            >
              <Radio value="Male">Male</Radio>
              <Radio value="Female">Female</Radio>
              <Radio value="Other">Other</Radio>
            </RadioGroup>
            <Input
              label="Email ID"
              name="email"
              value={formData.email}
              onChange={handleChange}
              variant="bordered"
              size="sm"
            />
            <Input
              label="Phone No."
              name="phoneNo"
              value={formData.phoneNo}
              onChange={handleChange}
              variant="bordered"
              size="sm"
            />
            <Input
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              variant="bordered"
              size="sm"
            />
          </div>
        );
      case 1: // Admission Details
        return (
          <div className="grid grid-cols-2 gap-5">
            <Input
              label="Admission Number"
              name="admissionNumber"
              value={formData.admissionNumber}
              onChange={handleChange}
              variant="bordered"
              size="sm"
            />
            <Input
              label="Admission Date"
              name="admissionDate"
              value={formData.admissionDate}
              onChange={handleChange}
              type="date"
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
            <Select
              placeholder="Select Category"
              label="Category Type"
              variant="bordered"
              size="sm"
              selectedKeys={formData.categoryType ? [formData.categoryType] : []}
              onSelectionChange={(keys) => handleInputChange('categoryType', Array.from(keys)[0])}
              className="w-full"
            >
              <SelectItem key="management" value="management">Management</SelectItem>
              <SelectItem key="reserved" value="reserved">Reserved</SelectItem>
              <SelectItem key="merit" value="merit">Merit</SelectItem>
              <SelectItem key="other" value="other">Other</SelectItem>
            </Select>
            <Select
              placeholder="Select Status"
              label="Status"
              variant="bordered"
              size="sm"
              selectedKeys={formData.status ? [formData.status] : []}
              onSelectionChange={(keys) => handleInputChange('status', Array.from(keys)[0])}
              className="w-full"
            >
              <SelectItem key="active" value="active">Active</SelectItem>
              <SelectItem key="suspended" value="suspended">Suspended</SelectItem>
              <SelectItem key="alumni" value="alumni">Alumni</SelectItem>
            </Select>
          </div>
        );
      case 2: // Parent Details
        return (
          <div className="grid grid-cols-2 gap-5">
            <Input
              label="Parent Name"
              name="parentName"
              value={formData.parentName}
              onChange={handleChange}
              variant="bordered"
              size="sm"
            />
            <Select
              placeholder="Select Relation"
              label="Relation with Student"
              variant="bordered"
              size="sm"
              selectedKeys={formData.relationWithStudent ? [formData.relationWithStudent] : []}
              onSelectionChange={(keys) => handleInputChange('relationWithStudent', Array.from(keys)[0])}
              className="w-full"
            >
              <SelectItem key="Father" value="Father">Father</SelectItem>
              <SelectItem key="Mother" value="Mother">Mother</SelectItem>
              <SelectItem key="Guardian" value="Guardian">Guardian</SelectItem>
              <SelectItem key="Other" value="Other">Other</SelectItem>
            </Select>
            <Input
              label="Parent Contact"
              name="parentContact"
              value={formData.parentContact}
              onChange={handleChange}
              variant="bordered"
              size="sm"
            />
            <Input
              label="Parent Email"
              name="parentEmail"
              value={formData.parentEmail}
              onChange={handleChange}
              variant="bordered"
              size="sm"
            />
            <Input
              label="Parent Occupation"
              name="parentOccupation"
              value={formData.parentOccupation}
              onChange={handleChange}
              variant="bordered"
              size="sm"
            />
          </div>
        );
      case 3: // Academic Details
        return (
          <div className="grid grid-cols-2 gap-5">
            <Input
              label="Roll Number"
              name="rollNumber"
              value={formData.rollNumber}
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
              selectedClass={formData.class}
              acadmicYear={formData.year}
              selectedDepartment={formData.department || profile?.id}
              label="Class (Compulsory)"
              onValidityChange={setIsClassValid}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} size="2xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader>{mode === "add" ? "Add Student" : "Edit Student"}</ModalHeader>
        <ModalBody>
          {/* Stepper */}
          <div className="flex justify-between mb-6">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className={`flex items-center justify-center w-10 h-10 rounded-full mb-2 ${
                    index === activeStep 
                      ? "bg-primary text-white" 
                      : index < activeStep 
                        ? "bg-primary-200 text-primary-700" 
                        : "bg-gray-200 text-gray-500"
                  }`}
                  onClick={() => setActiveStep(index)}
                  style={{ cursor: 'pointer' }}
                >
                  {step.icon}
                </div>
                <span className={`text-xs ${index === activeStep ? "font-semibold" : ""}`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>

          {/* Step Indicator */}
          <div className="mb-6">
            <h3 className="text-lg font-medium">{steps[activeStep].title}</h3>
          </div>

          {/* Step Content */}
          {renderStepContent()}
        </ModalBody>
        <ModalFooter>
          <div className="flex w-full justify-between">
            <div>
              <Button auto flat color="default" isDisabled={activeStep === 0} onClick={prevStep}>
                Previous
              </Button>
            </div>
            <div className="flex gap-2">
              <Button auto flat color="error" isDisabled={isSubmiting} onClick={() => { onClose(); handleClear(); }}>
                Cancel
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button auto color="primary" isLoading={isSubmiting} isDisabled={isSubmiting} onClick={handleSubmit}>
                  {mode === "add" ? "Submit" : "Update"}
                </Button>
              ) : (
                <Button auto color="primary" onClick={nextStep}>
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

export default StudentModal;