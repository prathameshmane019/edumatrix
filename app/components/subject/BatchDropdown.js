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
  selectedClass,
  className = '' 
}) {
  const [batches, setBatches] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
console.log( facultyId, 
  instituteId, 
  selectedSubject, 
  onSelect, 
  selectedBatch, 
  selectedClass);
  useEffect(() => {
    async function fetchBatches() {
      // Only fetch batches if required parameters are present
      if (!instituteId || (!selectedSubject && !selectedClass)) {
        setBatches([])
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const queryParams = new URLSearchParams({
          institute: instituteId
        })

        if (selectedSubject) {
          queryParams.append('subject', selectedSubject)
        }

        if (selectedClass) {
          queryParams.append('selectedClass', selectedClass)
        }

        const response = await axios.get(`/api/v2/utils/batches?${queryParams}`)
        const data = await response.data
        setBatches(data)
      } catch (error) {
        console.error('Error fetching batches:', error)
        setError('Failed to load batches')
        setBatches([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchBatches()
  }, [instituteId, selectedSubject, selectedClass])

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
      selectionMode="multiple"
      isDisabled={isLoading || (!selectedSubject && !selectedClass)}
    >
      {batches.map((batch) => (
        <SelectItem key={batch.value} value={batch.value}>
          {batch.label}
        </SelectItem>
      ))}
    </Select>
  )
}