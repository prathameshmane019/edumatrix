'use client'
import React, { useEffect, useState } from 'react'
import { Select, SelectItem } from '@nextui-org/react'
import axios from 'axios'



export function SubjectDropdown({ 
  facultyId, 
  instituteId, 
  selectedClass, 
  onSelect, 
  selectedSubject, 
  className = '' ,
  onSubjectTypeChange

}) {
  const [subjects, setSubjects] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  console.log(selectedSubject,instituteId,facultyId);
  
  useEffect(() => {
    async function fetchSubjects() {
      if (!facultyId || !instituteId) {
        return
      }
      setSubjects([])
      setIsLoading(true)
      setError(null)

      try {
        const response = await axios.get(`/api/v2/utils/subjects?faculty=${facultyId}&institute=${instituteId}&class=${selectedClass}`)
       
        const data =  response.data
        console.log(response.data);

        setSubjects(response.data)
      } catch (error) {
        console.error('Error fetching subjects:', error)
        setError('Failed to load subjects')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubjects()
  }, [facultyId, instituteId])

  const handleSelectChange = (selectedKey) => {
    // Find the full subject details for the selected subject
    const selectedSubjectDetails = subjects.find(subject => subject.value === selectedKey)
    console.log(selectedSubjectDetails);
    
    // Call the original onSelect prop
    onSelect(selectedKey)
    
    // If onSubjectDetailsChange is provided, pass the full subject details
    if (onSubjectTypeChange && selectedSubjectDetails) {
      console.log(selectedSubjectDetails.type);
      onSubjectTypeChange(selectedSubjectDetails.type)
    }
  }



  return (
    <Select
      placeholder={isLoading ? "Loading subjects..." : "Select a subject"}
      variant="bordered"
      size="sm"
      selectedKeys={selectedSubject ? [selectedSubject] : []}
      onSelectionChange={(keys) => {
        const selectedKey = Array.from(keys)[0]
        handleSelectChange(selectedKey)
      }}
      className={`max-w-xs my-4 ${className}`}
      isDisabled={isLoading || subjects.length === 0}
    >
      {subjects.map((subject) => (
        <SelectItem 
          key={subject.value} 
          value={subject.value}
        >
          {subject.label}
        </SelectItem>
      ))}
    </Select>
  )
}