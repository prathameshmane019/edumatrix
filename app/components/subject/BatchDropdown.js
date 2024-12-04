'use client'
import React, { useEffect, useState } from 'react'
import { Select, SelectItem } from '@nextui-org/react'
import axios from 'axios'

export function BatchDropdown({ 
  facultyId, 
  instituteId, 
  selectedSubject, 
  onSelect, 
  selectedBatch, 
  className = '' 
}) {
  const [batches, setBatches] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchBatches() {
        console.log(facultyId,instituteId,selectedSubject,selectedBatch);
        
      // Only fetch batches if required parameters are present
      if (!facultyId || !instituteId || !selectedSubject) {
        setBatches([])
        return
      }
      setIsLoading(true)
      setError(null)

      try {
        const response = await axios.get(`/api/v2/utils/batches?faculty=${facultyId}&institute=${instituteId}&subject=${selectedSubject}`)
   
        const data = await response.data
        setBatches(data)
      } catch (error) {
        console.error('Error fetching batches:', error)
        setError('Failed to load batches')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBatches()
  }, [facultyId, instituteId, selectedSubject])

  const handleSelectChange = (e) => {
    onSelect(e.target.value)
  }
  return (
    <Select
      placeholder={isLoading ? "Loading batches..." : "Select a batch"}
      variant="bordered"
      size="sm"
      value={selectedBatch}
      selectedKeys={selectedBatch ? [selectedBatch] : []}
      onChange={handleSelectChange}
      className={`max-w-xs my-4 ${className}`}
      isDisabled={isLoading || !selectedSubject}
    >
      {batches.map((batch) => (
        <SelectItem key={batch.value} value={batch.value}>
          {batch.label}
        </SelectItem>
      ))}
    </Select>
  )
}