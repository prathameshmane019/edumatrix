// "use client"

// import React, { useState, useEffect, use } from "react"
// import { Input, Button, Select, SelectItem } from "@nextui-org/react"
// import { useUser } from "@/app/context/UserContext"
// import { generateFeedbackTitle } from "@/app/utils/feedbackUtils"
// import { SubjectInputs } from "./SubjectInuts"
// import {DynamicFieldSelector} from "./DyanyamicFieldSelector"
// import { Calendar } from "lucide-react"
// import { getAcademicYears } from "@/app/utils/acadmicYears"


// export const FeedbackForm = ({ onSubmit, onCancel }) => {
//   const [formData, setFormData] = useState({
//     feedbackTitle: "",
//     feedbackType: "",
//     subType: "",
//     className: "",
//     semester: "",
//     academicYear: "",
//     students: "",
//     pwd: "",
//     subjects: [{ subject: "", faculty: "", _id: "" }],
//     department: "", // Add department to formData
//     institute:"" // Add institute to formData
//   })
//   const [generatedTitle, setGeneratedTitle] = useState("")

//   const {user} = useUser()

//   useEffect(() => {
     
//     if ( user?.role === "superadmin") {
//       setFormData((prev) => ({ ...prev,   institute: user?._id }))
//     }
//     else if ( user?.role === "admin") {
//       setFormData((prev) => ({ ...prev,  department: user?.id, institute: user?.institute
//       }))
//     }
//   }, [user])

//   useEffect(() => {
//     if (user && formData.className && formData.semester && formData.subType && formData.academicYear) {
//       setGeneratedTitle(
//         generateFeedbackTitle(
//           formData.academicYear,
//           formData.department,
//           formData.className ,
//           formData.subType,
//           formData.semester,
//         ),
//       )
//     }
//   }, [user, formData.className, formData.semester, formData.subType, formData.academicYear])

//   useEffect(() => {
//     if (formData.feedbackType === "event") {
//       setFormData((prev) => ({ ...prev, subType: "", semester: "", academicYear: "" }))
//     }
//   }, [formData.feedbackType])

//   useEffect(() => {
//     if(generatedTitle){
//       setFormData((prev) => ({ ...prev, feedbackTitle: generatedTitle }))
//     }
//   }, [generatedTitle])

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setFormData((prev) => ({ ...prev, [name]: value }))
//   }

//   const handleSelectChange = (name, value) => {
//     setFormData((prev) => ({ ...prev, [name]: value }))
//   }

//   const handleSubmit = (e) => {
//     e.preventDefault()
//     console.log(formData);
    
//     onSubmit(formData)
    
//   }

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       <Select
//         label="Feedback Type *"
//         name="feedbackType"
//         value={formData.feedbackType}
//         onChange={(e) => handleSelectChange("feedbackType", e.target.value)}
//         required
//       >
//         <SelectItem key="academic" value="academic">
//           Academic
//         </SelectItem>
//         <SelectItem key="event" value="event">
//           External
//         </SelectItem>
//       </Select>

//       {formData.feedbackType === "academic" && (
//         <>
//           <Select
//             label="Feedback Subtype *"
//             name="subType"
//             value={formData.subType}
//             onChange={(e) => handleSelectChange("subType", e.target.value)}
//             required
//           >
//             <SelectItem key="theory" value="theory">
//               Theory
//             </SelectItem>
//             <SelectItem key="practical" value="practical">
//               Practical
//             </SelectItem>
//           </Select>
//           <Select
//             label="Semester *"
//             name="semester"
//             value={formData.semester}
//             onChange={(e) => handleSelectChange("semester", e.target.value)}
//             required
//           >
//             <SelectItem key="sem1" value="sem1">
//               Sem 1
//             </SelectItem>
//             <SelectItem key="sem2" value="sem2">
//               Sem 2
//             </SelectItem>
//           </Select>
//           <Select
//             placeholder="Select Year"
//             variant="bordered"
//             size="sm"
//             selectedKeys={formData.academicYear ? [formData.academicYear] : []}
//             onSelectionChange={(keys) => handleSelectChange("academicYear", Array.from(keys)[0])}
//             startContent={<Calendar className="w-4 h-4 text-default-400" />}
//             className="max-w-72 my-4"
//           >
//             {getAcademicYears(5).map((year) => (
//               <SelectItem key={year.value} value={year.value}>
//                 {year.label}
//               </SelectItem>
//             ))}
//           </Select>
//           <DynamicFieldSelector role={user?.role} formData={formData} handleSelectChange={handleSelectChange} />

//           {/* <Select
//             label="Academic Year *"
//             name="academicYear"
//             value={formData.academicYear}
//             onChange={(e) => handleSelectChange("academicYear", e.target.value)}
//             required
//           >
//             {getCurrentAcademicYearOptions().map((option, index) => (
//               <SelectItem key={index} value={option}>
//                 {option}
//               </SelectItem>
//             ))}
//           </Select> */}

//           {formData.subType === "practical" && (
//             <Input
//               label="Feedback Title"
//               name="feedbackTitle"
//               value={generatedTitle}
//               onChange={(e) => setGeneratedTitle(e.target.value)}
//             />
//           )}

//           <SubjectInputs
//             subjects={formData.subjects}
//             onChange={(subjects) => setFormData((prev) => ({ ...prev, subjects }))}
//           />
//         </>
//       )}

//       <Input
//         label="Number of Students *"
//         type="number"
//         name="students"
//         placeholder="Enter total number of students"
//         value={formData.students}
//         onChange={handleChange}
//         min="1"
//         required
//       />

//       <Input
//         label="Password *"
//         type="password"
//         name="pwd"
//         placeholder="Enter password"
//         value={formData.pwd}
//         onChange={handleChange}
//         required
//       />

//       <div className="flex justify-end space-x-4">
//         <Button color="secondary" onClick={onCancel}>
//           Cancel
//         </Button>
//         <Button color="primary" type="submit">
//           Create Feedback
//         </Button>
//       </div>
//     </form>
//   )
// }

"use client";

import React, { useState, useEffect } from "react";
import { Input, Button, Select, SelectItem } from "@nextui-org/react";
import { useUser } from "@/app/context/UserContext";
import { SubjectInputs } from "./SubjectInuts";
import { DynamicFieldSelector } from "./DyanyamicFieldSelector";
import { Calendar } from "lucide-react";
import { getAcademicYears } from "@/app/utils/acadmicYears";
export const FeedbackForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    feedbackTitle: "",
    feedbackType: "",
    subType: "",
    className: "",
    semester: "",
    academicYear: "",
    students: "",
    pwd: "",
    subjects: [{ subject: "", faculty: "", _id: "" }],
    department: "",
    institute: "",
  });

  const { user } = useUser();

  useEffect(() => {
    if (user?.role === "superadmin") {
      setFormData((prev) => ({ ...prev, institute: user?._id }));
    } else if (user?.role === "admin") {
      setFormData((prev) => ({
        ...prev,
        department: user?.id,
        institute: user?.institute,
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 bg-white shadow rounded-md">
      <h2 className="text-lg font-semibold">Feedback Form</h2>

      <Select
        label="Feedback Type *"
        name="feedbackType"
        value={formData.feedbackType}
        onChange={(e) => handleSelectChange("feedbackType", e.target.value)}
        required
      >
        <SelectItem key="academic" value="academic">
          Academic
        </SelectItem>
        <SelectItem key="event" value="event">
          Event
        </SelectItem>
      </Select>

      {formData.feedbackType === "academic" && (
        <>
          <Select
            label="Feedback Subtype *"
            name="subType"
            value={formData.subType}
            onChange={(e) => handleSelectChange("subType", e.target.value)}
            required
          >
            <SelectItem key="theory" value="theory">
              Theory
            </SelectItem>
            <SelectItem key="practical" value="practical">
              Practical
            </SelectItem>
          </Select>

          <Select
            label="Semester *"
            name="semester"
            value={formData.semester}
            onChange={(e) => handleSelectChange("semester", e.target.value)}
            required
          >
            <SelectItem key="sem1" value="sem1">
              Sem 1
            </SelectItem>
            <SelectItem key="sem2" value="sem2">
              Sem 2
            </SelectItem>
          </Select>

          <Select
            placeholder="Select Academic Year"
            variant="bordered"
            size="sm"
            selectedKeys={formData.academicYear ? [formData.academicYear] : []}
            onSelectionChange={(keys) => handleSelectChange("academicYear", Array.from(keys)[0])}
            startContent={<Calendar className="w-4 h-4 text-default-400" />}
            className="max-w-72 my-4"
          >
            {getAcademicYears(5).map((year) => (
              <SelectItem key={year.value} value={year.value}>
                {year.label}
              </SelectItem>
            ))}
          </Select>

          <DynamicFieldSelector
            role={user?.role}
            formData={formData}
            handleSelectChange={handleSelectChange}
          />

          <Input
            label="Feedback Title *"
            name="feedbackTitle"
            placeholder="Enter feedback title"
            value={formData.feedbackTitle}
            onChange={handleChange}
            required
          />

          <SubjectInputs
            subjects={formData.subjects}
            onChange={(subjects) => setFormData((prev) => ({ ...prev, subjects }))}
          />
        </>
      )}

      <Input
        label="Number of Students *"
        type="number"
        name="students"
        placeholder="Enter total number of students"
        value={formData.students}
        onChange={handleChange}
        min="1"
        required
      />

      <Input
        label="Password *"
        type="password"
        name="pwd"
        placeholder="Enter password"
        value={formData.pwd}
        onChange={handleChange}
        required
      />

      <div className="flex justify-end space-x-4">
        <Button color="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button color="primary" type="submit">
          Create Feedback
        </Button>
      </div>
    </form>
  );
};
