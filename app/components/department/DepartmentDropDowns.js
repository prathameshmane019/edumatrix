'use client'

import React, { useEffect, useState } from 'react'

import { Select, SelectItem } from '@nextui-org/react'

export function DepartmentDropdown({ instituteId, onSelect, selectedDepartment, className = '',size='sm' ,label=''}) {
    const [departments, setDepartments] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    console.log(instituteId,selectedDepartment);
    
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

    return (
        <Select
            placeholder={isLoading? "Loading departments...":"Select a department" }
            variant="bordered"
            size={size}
            label={label}
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



