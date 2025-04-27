import React, { useEffect, useState } from 'react'
import { Select, SelectItem } from '@nextui-org/react'
import axios from 'axios'
import {  Notebook } from 'lucide-react';

export function SubjectDropdown({
  instituteId,
  facultyId,
  selectedClass,
  onSelect,
  selectedSubject,
  className = '',
  academicYear = '',
  onSubjectTypeChange,
  onSubjectDocChange, // New prop to send full subject document to parent
  fetchBy = 'facultyId',
  semester = '',
  label = '',
  size = 'sm',
  department,
  subType
}) 
{
  console.log(instituteId, facultyId, semester, academicYear, selectedClass, department, subType, fetchBy);
  
  const [subjects, setSubjects] = useState([])
  const [selectedSubjectDoc, setSelectedSubjectDoc] = useState(null) // New state for full subject document
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchSubjects() {
      // Determine if fetch should be attempted based on fetchBy strategy
      const shouldFetch = 
        (fetchBy === 'facultyId' && instituteId && (facultyId && academicYear || semester)) ||
        (fetchBy === 'classId' && instituteId && selectedClass)

      if (!shouldFetch) {
        setSubjects([])
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Construct query parameters dynamically
        const params = new URLSearchParams({
          institute: instituteId || '',
          ...(facultyId && { facultyId }),
          ...(selectedClass && { class: selectedClass }),
          ...(academicYear && { academicYear }),
          ...(semester && { sem: semester }),
          ...(department && { department }),
          ...(subType && { subType })
        })

        const response = await axios.get(`/api/v2/utils/subjects?${params}`)
        setSubjects(response.data)
        console.log(response.data);
        
        // If selectedSubject exists, set the selectedSubjectDoc for it
        if (selectedSubject) {
          const subjectDoc = response.data.find(subject => subject.value === selectedSubject)
          if (subjectDoc) {
            setSelectedSubjectDoc(subjectDoc)
            // Send to parent if callback exists
            if (onSubjectDocChange) {
              onSubjectDocChange(subjectDoc)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching subjects:', error)
        setError('Failed to load subjects')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubjects()
  }, [
    selectedClass, 
    instituteId, 
    facultyId, 
    academicYear, 
    semester, 
    department, 
    subType, 
    fetchBy,
    selectedSubject
  ])

  const handleSelectChange = (e) => {
    const selectedValue = e.target.value
    onSelect(selectedValue)
    
    const selectedSubjectDetails = subjects.find(subject => subject.value === selectedValue)
    
    if (selectedSubjectDetails) {
      // Update the subject document state
      setSelectedSubjectDoc(selectedSubjectDetails)
      
      // Send the full subject document to parent if callback exists
      if (onSubjectDocChange) {
        onSubjectDocChange(selectedSubjectDetails.subject)
      }
      
      // If onSubjectTypeChange is provided, pass the subject type
      if (onSubjectTypeChange) {
        onSubjectTypeChange(selectedSubjectDetails.type || '')
      }
    }
  }

  return (
    <Select
      placeholder={isLoading ? "Loading subjects..." : "Select a subject"}
      variant="bordered"
      startContent={<Notebook/>}
      size={size}
      label={label}
      value={selectedSubject}
      selectedKeys={selectedSubject ? [selectedSubject] : []} 
      onChange={handleSelectChange}
      className={`w-full max-w-xs ${className}`}
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