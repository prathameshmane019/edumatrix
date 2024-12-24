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
} from "@nextui-org/react";
import { toast } from "sonner";
import axios from "axios";
import { DepartmentDropdown } from "./department/DepartmentDropDowns";
import { Calendar } from "lucide-react";
import { getAcademicYears } from "../utils/acadmicYears";

const FacultyModal = ({ isOpen, onClose, mode, faculty, onSubmit }) => {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    department: "",
    email: "",
    password: "",
    currentYear: "",
    sem: "",
    institute: null,
  });
  const [profile, setProfile] = useState(null);

  // Fetch user profile from session storage
  useEffect(() => {
    const storedProfile = sessionStorage.getItem("userProfile");
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
  }, []);


  const fetchDepartments = async () => {
    try {
      const response = await axios.get("/api/v2/department");
      setDepartmentOptions(response.data.departments || []);
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast.error("Error fetching department options");
    }
  };
    // Fetch department options
    useEffect(() => {
      if(profile?.role==="superadmin") fetchDepartments();
     }, [profile,fetchDepartments]);
     
  // Set form data based on mode and profile
  useEffect(() => {
    if (mode === "edit" && faculty) {
      setFormData({
        ...faculty,
        department: profile?.role === "superadmin" ? faculty.department : profile?.id,
        institute: faculty.institute?._id || null,
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
      });
    }
  }, [mode, faculty, profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
    });
  };

  const handleDepartmentSelect = (departmentId) => {
    console.log(departmentId.target.value);
    setFormData((prev) => ({
      ...prev,
      department: departmentId.target.value
    }));
  }

  const handleSubmit = async () => {
    try {
      const dataToSubmit = {
        ...formData,
        department: profile?.role === "superadmin" ? formData.department : profile?.id,
        institute: formData.institute || (profile?.role === "superadmin" ? profile._id : profile?.institute),
      };

      if (mode === "add") {
        await axios.post("/api/v2/faculty", dataToSubmit);
        toast.success("Faculty added successfully");
        onSubmit();
      } else if (mode === "edit") {
        await axios.put("/api/v2/faculty", dataToSubmit);
        toast.success("Faculty updated successfully");
      }
      onClose();
      handleClear();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error occurred while saving faculty data");
    }
  };

  useEffect(() => {
    if (!isOpen) {
      handleClear();
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>{mode === "add" ? "Add Faculty" : "Edit Faculty"}</ModalHeader>
        <ModalBody>
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
          />
          <Input
            label="Email"
            name="email"
            value={formData.email}
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
          <Input
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            variant="bordered"
            size="sm"
            type="password"
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
          <Select
            label="Semester"
            placeholder="Select Semester"
            className="col-span-1 w-full"
            selectedKeys={[formData.sem]}
            onSelectionChange={(keys) => handleSelectChange('sem', keys.currentKey)}
            required
            variant="bordered"
            size="sm"
          >
            <SelectItem key="sem1" value="sem1">Semester 1</SelectItem>
            <SelectItem key="sem2" value="sem2">Semester 2</SelectItem>
          </Select>
        </ModalBody>
        <ModalFooter>
          <Button auto flat color="error" onClick={onClose}>
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

export default FacultyModal;
