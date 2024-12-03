'use client'

import React, { useEffect, useState } from 'react'

import { Select, SelectItem } from '@nextui-org/react'

export function DepartmentDropdown({ instituteId, onSelect, selectedDepartment, className = '' }) {
    const [departments, setDepartments] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function fetchDepartments() {
            if (!instituteId) return

            setIsLoading(true)
            setError(null)

            try {
                const response = await fetch(`/api/v2/utils/department?institute=${instituteId}`)
                if (!response.ok) throw new Error('Failed to fetch departments')
                const data = await response.json()
                setDepartments(data)
                console.log(data);

            } catch (error) {
                console.error('Error:', error)
                setError('Failed to load departments')
            } finally {
                setIsLoading(false)
            }
        }

        fetchDepartments()
    }, [instituteId])

    const handleSelectChange = (value) => {
        onSelect(value)
    }

    if (isLoading) return <div>Loading departments...</div>
    if (error) return <div>Error: {error}</div>

    return (
        <Select
            placeholder="Select a department"
            variant="bordered"
            size="sm"
            value={selectedDepartment}
            onChange={handleSelectChange}
            className="max-w-xs my-4"
        >
            {departments.map((department) => (
                <SelectItem key={department.value} value={department.label}>
                    {department.label}
                </SelectItem>
            ))}
        </Select>
    )
}



