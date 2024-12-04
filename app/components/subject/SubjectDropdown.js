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
  className = '' 
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

  const handleSelectChange = (e) => {
    onSelect(e.target.value)
  }

console.log(subjects);

  return (
    <Select
      placeholder={isLoading ? "Loading subjects..." : "Select a subject"}
      variant="bordered"
      size="sm"
      selectedKeys={selectedSubject ? [selectedSubject] : []}
      onSelectionChange={(keys) => {
        const selectedKey = Array.from(keys)[0] 
        onSelect(selectedKey)
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