
import React, { useEffect, useState } from 'react'
import { Select, SelectItem } from '@nextui-org/react'
import axios from 'axios'


export function SubjectDropdown({
  instituteId,
  facultyId,
  selectedClass,
  onSelect,
  selectedSubject,
  className = '',
  academicYear = '',
  onSubjectTypeChange,
  fetchBy = 'facultyId',
  semester = '',
  department,
  subType
}) 
{
  const [subjects, setSubjects] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchSubjects() {
      // Determine if fetch should be attempted based on fetchBy strategy
      const shouldFetch = 
        (fetchBy === 'facultyId' && instituteId && (facultyId || academicYear || semester)) ||
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
    fetchBy
  ])

  const handleSelectChange = (e) => {
    onSelect(e.target.value)
    const selectedSubjectDetails = subjects.find(subject => subject.value === e.target.value)
    // If onSubjectTypeChange is provided, pass the full subject details
    if (onSubjectTypeChange && selectedSubjectDetails) {
      onSubjectTypeChange(selectedSubjectDetails.type || '')
    }
}

  return (
    <Select
      placeholder={isLoading ? "Loading subjects..." : "Select a subject"}
      variant="bordered"
      // size="sm"
      // label="Select subject"

      value={selectedSubject}
      selectedKeys={selectedSubject ? [selectedSubject] : []}
      // onSelectionChange={(keys) => {
      //   const selectedKey = Array.from(keys)[0]
      //   handleSelectChange(selectedKey)
      // }}
      onChange={handleSelectChange}
      className={`w-full max-w-xs  ${className}`}
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