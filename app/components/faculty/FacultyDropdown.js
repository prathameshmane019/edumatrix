'use client'

import React, { useEffect, useState } from 'react'
import { Select, SelectItem } from '@nextui-org/react'

export function FacultyDropdown({ instituteId, departmentId, onSelect, selectedFaculty, className = '' }) {
    const [faculty, setFaculty] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function fetchFaculty() {
            if (!instituteId) return
            setIsLoading(true)
            setError(null)

            try {
                const params = new URLSearchParams({
                    institute: instituteId,
                    ...(departmentId && { department: departmentId })
                })

                const response = await fetch(`/api/v2/utils/faculty?${params.toString()}`)
                if (!response.ok) throw new Error('Failed to fetch faculty')
                const data = await response.json()
                setFaculty(data)
            } catch (error) {
                console.error('Error:', error)
                setError('Failed to load faculty')
            } finally {
                setIsLoading(false)
            }
        }

        fetchFaculty()
    }, [instituteId, departmentId])

    const handleSelectChange = (e) => {
        onSelect(e.target.value)
    }

    if (isLoading) return <div>Loading faculty...</div>
    if (error) return <div>Error: {error}</div>

    return (
        <Select
            aria-label="Select a faculty member"
            placeholder="Select a faculty member"
            variant="bordered"
            size="sm"
            value={selectedFaculty}
            selectedKeys={selectedFaculty ? [selectedFaculty] : []}
            onChange={handleSelectChange}
            className={`max-w-xs my-4 ${className}`}
        >
            {faculty.length === 0 ? (
                <SelectItem value="">No faculty available</SelectItem>
            ) : (
                faculty.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                        {f.label}
                    </SelectItem>
                ))
            )}
        </Select>
    )
}

