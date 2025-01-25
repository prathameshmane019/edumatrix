"use client"
 
import { ClassDropdown } from "../Class/ClassDropdown"
import { DepartmentDropdown } from "../department/DepartmentDropDowns"
import { useUser } from "@/app/context/UserContext"

  
export const DynamicFieldSelector = ({ formData, handleSelectChange }) => {
  const { user, loading } = useUser()

  if (loading) return <div>Loading user data...</div>
  if (!user) return <div>User not authenticated</div>

  const handleChange = (field) => (value) => {
    handleSelectChange(field, value)
  }

  if (user?.role === "superadmin") {
    return (
      <>
        <DepartmentDropdown
          includeCentral={true}
          instituteId={user?._id}
          onSelect={handleChange("department")}
          className="w-full"
          selectedDepartment={formData?.department}
        />
        <ClassDropdown
          instituteId={user?._id || formData?.institute}
          onSelect={handleChange("className")}
          selectedClass={formData?.className}
          selectedDepartment={formData?.department}
          academicYear={formData?.academicYear}
        />
      </>
    )
  }

  return (
    <ClassDropdown
      instituteId={formData?.institute}
      onSelect={handleChange("className")}
      selectedClass={formData?.className}
      selectedDepartment={formData?.department}
      academicYear={formData?.academicYear}
    />
  )
}

