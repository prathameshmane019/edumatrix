import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@nextui-org/react";

const DepartmentModal = ({ isOpen, onClose, mode,onSubmit, editingDepartment,departments }) => {
  const [formData, setFormData] = useState({
    department: "",
    password: "",
  });

  useEffect(() => {
    if (editingDepartment) {
      setFormData({
        department: editingDepartment.department,
        password: editingDepartment.password, // Don't populate password for security reasons
      });
    } else {
      resetForm();
    }
  }, [editingDepartment]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

 
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    resetForm();
  };
  const resetForm = () => {
    setFormData({
      department: "",
      password: "",
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader className="flex flex-col gap-1">
            {editingDepartment ? "Update Department" : "Add Department"}
          </ModalHeader>
          <ModalBody>
            <Input
              label="Department"
              placeholder="Enter department name"
              name="department"
              value={formData.department}
              onChange={handleChange}
              isRequired
            />
              <Input
                label="Password"
                placeholder="Enter password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                isRequired
              />

          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" type="submit">
              {editingDepartment ? "Update" : "Add"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default DepartmentModal;

 
// import React, { useState, useEffect } from "react";
// import { Modal, Button, Input, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react";
// import { toast } from "sonner";
// import axios from "axios";
// const DepartmentModal = ({ isOpen, onClose, mode, departments, onSubmit }) => {
//   const [profile, setProfile] = useState(null);
//   const [formData, setFormData] = useState({
  
//     department: "",
   
//     password: "",

//   });
//   useEffect(() => {
//     const storedProfile = sessionStorage.getItem('userProfile');
//     if (storedProfile) {
//       setProfile(JSON.parse(storedProfile));
//     }
//   }, []);
//   useEffect(() => {
//     if (mode === "edit" && departments) {
//       setFormData({
      
//         department: departments.department,
       
//         password: departments.password,
       
//       });
//     } else {
//       handleClear();
//     }
//   }, [mode, departments]);
//   useEffect(() => {
//     if (!isOpen) {
//       handleClear();
//     }
//   }, [isOpen]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value
//     }));
//   };
//   const handleSelectChange = (key, value) => {
//     setFormData((prev) => ({
//       ...prev,
//       [key]: value
//     }));
//   };
  
//   const handleClear = () => {
//     setFormData({
      
//       department: "",

//       password: "",
     
//     });
//   };

//   const handleSubmit = async () => {
//     try {
//       console.log(formData);
//       let response;
//       if (mode === "add") {
//         response = await axios.post("/api/department", formData);
//         toast.success("Student added successfully");
//       } else if (mode === "edit") {
//         response = await axios.put(`/api/department?_id=${formData._id}`, formData);
//         toast.success("Student updated successfully");
//       }
//       onSubmit();
//       onClose();
//       handleClear();
//     } catch (error) {
//       console.error("Error:", error);
//       toast.error("Error occurred while saving student data");
//     }
//   };
//   return (
//     <Modal isOpen={isOpen} onClose={onClose}>
//       <ModalContent>
//         <ModalHeader>{mode === "add" ? "Add Department" : "Edit Department"}</ModalHeader>
//         <ModalBody>
//           <div className="grid grid-cols-2 gap-4">
           
//           <Input
//               label="Department"
//               name="department"
//               value={formData.department}
//               onChange={handleChange}
//               required
//               variant="bordered"
//               size="sm"
//             />
           
//             <Input
//               label="Password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               required
//               variant="bordered"
//               size="sm"
//             />
           
            
            
//           </div>
//         </ModalBody>
//         <ModalFooter>
//           <Button auto flat color="error" onClick={() => { onClose(); handleClear(); }}>
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

// export default DepartmentModal;
