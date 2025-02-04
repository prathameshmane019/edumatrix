// 'use client'

// import React, { useEffect, useState } from 'react'
// import { Select, SelectItem } from '@nextui-org/react'
// import axios from 'axios'

// export function ClassDropdown({ instituteId, onSelect, selectedClass, selectedDepartment, acadmicYear, className = '', label = "", size = 'sm', handleBatches }) {
//     const [classes, setClasses] = useState([])
//     const [isLoading, setIsLoading] = useState(false)
//     const [error, setError] = useState(null)

//     console.log(selectedDepartment,selectedClass,instituteId,acadmicYear);
  
//     useEffect(() => {
//         async function fetchClasses() {
            
//             if (!instituteId || !selectedDepartment || !acadmicYear) {
//                 setClasses([])
//                 return
//             }

//             setIsLoading(true)
//             setError(null)
//             try {
//                 const response = await axios.get(`/api/v2/utils/class?institute=${instituteId}&department=${selectedDepartment}&acadmicYear=${acadmicYear}`)
//                 console.log(response.data);
//                 const data = await response.data
//                 setClasses(data)
//             } catch (error) {
//                 console.error('Error:', error)
//                 setError('Failed to load classes')
//             } finally {
//                 setIsLoading(false)
//             }
//         }
//         fetchClasses()
//     }, [instituteId, selectedDepartment, acadmicYear])

//     const handleSelectChange = (e) => {
//         onSelect(e.target.value)
//         console.log(classes);
//         const batches = classes.map((c) =>
//             c.value === e.target.value ? c.batches : null
//         )
//         console.log("batches", batches[0]);

//         if (handleBatches) handleBatches(batches[0])

//     }

//     return (
//         <Select
//             placeholder={isLoading ? "Loading... class data " :error ? "No classes found": "Select a class"}
//             variant="bordered"
//             label={label}
//             size={size}
//             value={selectedClass}
//             selectedKeys={selectedClass ? [selectedClass] : []}
//             onChange={handleSelectChange}
//             className={`max-w-xs   ${className}`}
//         >
//             {classes.map((cls) => (
//                 <SelectItem key={cls.value} value={cls.value}>
//                     {cls.label}
//                 </SelectItem>
//             ))}
//         </Select>
//     )
// }

'use client'

import React, { useEffect, useState } from 'react'
import { Select, SelectItem } from '@nextui-org/react'
import axios from 'axios'

export function ClassDropdown({ 
    instituteId, 
    onSelect, 
    selectedClass, 
    selectedDepartment, 
    acadmicYear, 
    className = '', 
    label = "", 
    size = 'sm', 
    handleBatches 
}) {
    const [classes, setClasses] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    console.log(selectedDepartment, selectedClass, instituteId, acadmicYear);
    
    useEffect(() => {
        async function fetchClasses() {
            if (!instituteId || !selectedDepartment || !acadmicYear) {
                setClasses([])
                return
            }
            setIsLoading(true)
            setError(null)
            try {
                const response = await axios.get(
                    `/api/v2/utils/class?institute=${instituteId}&department=${selectedDepartment}&acadmicYear=${acadmicYear}`
                )
                setClasses(response.data)
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
        const selectedValue = e.target.value
        onSelect(selectedValue)
        
        // Find the selected class and its batches
        const selectedClassData = classes.find(c => c.value === selectedValue)
        if (selectedClassData && handleBatches) {
            handleBatches(selectedClassData.batches || [])
        }
    }

    return (
        <Select
            placeholder={
                isLoading ? "Loading... class data" :
                error ? "No classes found" :
                "Select a class"
            }
            variant="bordered"
            label={label}
            size={size}
            value={selectedClass}
            selectedKeys={selectedClass ? [selectedClass] : []}
            onChange={handleSelectChange}
            className={`max-w-xs ${className}`}
        >
            {classes.map((cls) => (
                <SelectItem key={cls.value} value={cls.value}>
                    {cls.label}
                </SelectItem>
            ))}
        </Select>
    )
}