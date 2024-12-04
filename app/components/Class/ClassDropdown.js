'use client'

import React, { useEffect, useState } from 'react'
import { Select, SelectItem } from '@nextui-org/react'

export function ClassDropdown({ instituteId, onSelect, selectedClass, selectedDepartment, acadmicYear, className = '' }) {
    const [classes, setClasses] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function fetchClasses() {
            if (!instituteId || !selectedDepartment || !acadmicYear) {
                setClasses([])
                return
            }
            setIsLoading(true)
            setError(null)

            try {
                const response = await fetch(`/api/v2/utils/class?institute=${instituteId}&department=${selectedDepartment}&acadmicYear=${acadmicYear}`)
                if (!response.ok) throw new Error('Failed to fetch classes')
                const data = await response.json()
                setClasses(data)
            } catch (error) {
                console.error('Error:', error)
                setError('Failed to load classes')
            } finally {
                setIsLoading(false)
            }
        }
        fetchClasses()
    }, [instituteId, selectedDepartment, acadmicYear])

    const handleSelectChange = (e) => {
        onSelect(e.target.value)
    }

    if (error) return <div>Error: {error}</div>

    return (
        <Select
            placeholder={isLoading ? "Loading... class data " : "Select a class"}
            variant="bordered"
            size="sm"
            value={selectedClass}
            selectedKeys={selectedClass ? [selectedClass] : []}
            onChange={handleSelectChange}
            className={`max-w-xs my-4 ${className}`}
        >
            {classes.map((cls) => (
                <SelectItem key={cls.value} value={cls.value}>
                    {cls.label}
                </SelectItem>
            ))}
        </Select>
    )
}

