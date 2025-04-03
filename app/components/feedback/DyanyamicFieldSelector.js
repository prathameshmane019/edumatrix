"use client"
 
import { ClassDropdown } from "../Class/ClassDropdown"
import { DepartmentDropdown } from "../department/DepartmentDropDowns" 
  
export const DynamicFieldSelector = ({ formData, handleSelectChange, user }) => {
  if (!user) return <div>User not authenticated</div>

  const handleChange = (field) => (value) => {
    handleSelectChange(field, value)
    
    // Reset subjects when class changes
    if (field === "className") {
      handleSelectChange("subjects", [{ subject: "", faculty: "", _id: "" }])
    }
  }

  const handleDepartmentChange = (field) => (value) => {
    handleSelectChange(field, value.target.value)
    // Reset className when department changes
    handleSelectChange("className", null)
    // Also reset subjects
    handleSelectChange("subjects", [{ subject: "", faculty: "", _id: "" }])
  }
  
  if (user?.role === "superadmin") {
    return (
      <>
        <DepartmentDropdown
          includeCentral={true}
          instituteId={user?._id}
          onSelect={handleDepartmentChange("department")}
          className="w-full"
          selectedDepartment={formData?.department || user?.id}
        />
        <ClassDropdown
          instituteId={user?._id}
          onSelect={handleChange("className")}
          selectedClass={formData?.className}
          selectedDepartment={formData?.department || user?.id}
          acadmicYear={formData?.academicYear} // Fix typo in prop name
        />
      </>
    )
  }

  return (
    <ClassDropdown
      instituteId={formData?.institute || user?.institute?._id}
      onSelect={handleChange("className")}
      selectedClass={formData?.className}
      selectedDepartment={formData?.department || user?.id}
      acadmicYear={formData?.academicYear} // Fix typo in prop name
    />
  )
}