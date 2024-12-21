'use client'

import React, { useEffect, useState } from 'react'
import { Select, SelectItem } from '@nextui-org/react'

export function ClassDropdown({ instituteId, onSelect, selectedClass, selectedDepartment, acadmicYear, className = '', label = "", size = 'sm', handleBatches }) {
    const [classes, setClasses] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
console.log(instituteId,selectedDepartment,acadmicYear);

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
        console.log(classes);
        const batches = classes.map((c) =>
            c.value === e.target.value ? c.batches : null
        )
        console.log("batches", batches[0]);

        if(handleBatches) handleBatches(batches[0])

    }

    if (error) return <div>No classes found</div>

    return (
        <Select
            placeholder={isLoading ? "Loading... class data " : "Select a class"}
            variant="bordered"
            label={label}

            size={size}
            value={selectedClass}
            selectedKeys={selectedClass ? [selectedClass] : []}
            onChange={handleSelectChange}
            className={`max-w-xs   ${className}`}
        >
            {classes.map((cls) => (
                <SelectItem key={cls.value} value={cls.value}>
                    {cls.label}
                </SelectItem>
            ))}
        </Select>
    )
}

