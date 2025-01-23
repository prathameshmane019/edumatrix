"use client"

import React from "react"
import { ClassDropdown } from "../Class/ClassDropdown"
import { DepartmentDropdown } from "../department/DepartmentDropDowns"
import { useUser } from "@/app/context/UserContext"

export const DynamicFieldSelector = ({ formData, handleSelectChange }) => {
  const { user, loading } = useUser()

  const handleChange = (field) => (event) => { 
    handleSelectChange(field, event.target.value)
  } 
 

  const handleClassChange = (field) => (value) => { 
    handleSelectChange(field,  value)
  } 
  if (loading) return <div>Loading user data...</div>
  if (!user) return <div>User not authenticated</div>

  if (user?.role === "superadmin") {
    return (
      <>
        <DepartmentDropdown
          instituteId={user?._id}
          onSelect={handleChange("department")}
          className="w-full"
          selectedDepartment={formData?.department}
        />
        <ClassDropdown
          instituteId={user?._id || formData?.instituteId}
          onSelect={handleClassChange("className")}
          selectedClass={formData?.className}
          selectedDepartment={formData?.department}
          acadmicYear={formData?.academicYear}
        />
      </>
    )
  }

  return (
    <ClassDropdown
      instituteId={user?._id}
      onSelect={handleChange("className")}
      selectedClass={formData?.className}
      selectedDepartment={user?.department}
      academicYear={formData?.academicYear}
    />
  )
}