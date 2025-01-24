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
          includeCentral={true} 
          instituteId={user?._id}
          onSelect={handleChange("department")}
          className="w-full"
          selectedDepartment={formData?.department}
        />
         <Select
            placeholder={isLoading ? "Loading class data..." : "Select a class"}
            variant="bordered"
            label={label}
            size={size}
            value={selectedClass}
            selectedKeys={selectedClass ? [selectedClass] : []}
            onChange={handleSelectChange}
            className={`max-w-xs ${className}`}
        >
            {classes.map((cls) => (
                <SelectItem key={cls.value} value={cls.value}>
                    {cls.label}
                </SelectItem>
            ))}
        </Select>
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