"use client"
import { useState, useEffect, useCallback } from "react"
import { Checkbox, Input, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react"

export default function CourseOutcomeSelect({
  availableCOs = [],
  selectedCOs = [],
  onChange,
  totalAssessmentMarks = 0,
  showMarkInput = true,
  disabled = false,
  required = false,
}) {
  // Track selected COs with their marks
  const [selection, setSelection] = useState(new Map())

  // Initialize selection from props - fixed data handling
  useEffect(() => {
    const initialSelection = new Map()

    if (Array.isArray(selectedCOs)) {
      selectedCOs.forEach((co) => {
        // Extract IDs safely handling both data structures
        const coId = co.mainCoDocId || co.courseOutcome
        const coIndex = parseInt(co.coIndex, 10)

        if (coId && coIndex) {
          const key = `${coId}-${coIndex}`
          initialSelection.set(key, {
            mainCoDocId: coId,
            coIndex: coIndex,
            maxMarks: parseFloat(co.maxMarks) || 0,
          })
        }
      })
    }

    setSelection(initialSelection)
  }, [selectedCOs])

  // Update parent component when selection changes - improved equality check
  useEffect(() => {
    const updatedCOs = Array.from(selection.values())
      .filter((co) => co.mainCoDocId && co.coIndex)
      .map((co) => ({
        mainCoDocId: co.mainCoDocId,
        coIndex: co.coIndex,
        maxMarks: parseFloat(co.maxMarks) || 0,
      }))

    // Only call onChange if there's actually a difference
    const hasChanged = 
      updatedCOs.length !== selectedCOs.length || 
      updatedCOs.some((newCO, idx) => {
        const oldCO = selectedCOs[idx]
        if (!oldCO) return true
        
        // Compare each field accounting for different property names
        const oldId = oldCO.mainCoDocId || oldCO.courseOutcome
        const oldIndex = parseInt(oldCO.coIndex, 10)
        const oldMarks = parseFloat(oldCO.maxMarks) || 0
        
        return newCO.mainCoDocId !== oldId || 
               newCO.coIndex !== oldIndex || 
               Math.abs(newCO.maxMarks - oldMarks) > 0.001
      })

    if (hasChanged) {
      onChange(updatedCOs)
    }
  }, [selection, onChange, selectedCOs])

  // Handle checkbox selection - more robust handling
  const handleSelectionChange = useCallback((isSelected, coItem) => {
    setSelection((prev) => {
      const newSelection = new Map(prev)
      
      // Ensure we have valid ID and index
      if (!coItem?.mainCoDocId || !coItem?.coIndex) {
        console.error("Invalid CO item:", coItem)
        return prev
      }
      
      const key = `${coItem.mainCoDocId}-${coItem.coIndex}`

      if (isSelected) {
        // When selecting, initialize with 0 marks or keep existing marks
        const existingItem = prev.get(key)
        newSelection.set(key, {
          mainCoDocId: coItem.mainCoDocId,
          coIndex: parseInt(coItem.coIndex, 10),
          maxMarks: existingItem ? existingItem.maxMarks : 0,
        })
      } else {
        newSelection.delete(key)
      }

      return newSelection
    })
  }, [])

  // Handle marks input change with improved validation
  const handleMarksChange = useCallback((value, coItem) => {
    // Ensure we have valid ID and index
    if (!coItem?.mainCoDocId || !coItem?.coIndex) {
      console.error("Invalid CO item for marks change:", coItem)
      return
    }
    
    // Better validation for numeric input
    const sanitizedValue = value.replace(/[^\d.]/g, '')
    
    // Allow empty string, valid numbers, or decimal points
    if (sanitizedValue === "" || /^\d*\.?\d*$/.test(sanitizedValue)) {
      // Parse as float or default to 0
      const numValue = sanitizedValue === "" ? 0 : parseFloat(sanitizedValue)
      
      setSelection((prev) => {
        const newSelection = new Map(prev)
        const key = `${coItem.mainCoDocId}-${coItem.coIndex}`

        if (newSelection.has(key)) {
          newSelection.set(key, {
            ...newSelection.get(key),
            maxMarks: isNaN(numValue) ? 0 : numValue,
          })
        }

        return newSelection
      })
    }
  }, [])

  // Check if a CO is selected - with safety checks
  const isSelected = useCallback(
    (coItem) => {
      if (!coItem?.mainCoDocId || !coItem?.coIndex) return false
      const key = `${coItem.mainCoDocId}-${coItem.coIndex}`
      return selection.has(key)
    },
    [selection],
  )

  // Get marks for a CO - with safety checks
  const getMarks = useCallback(
    (coItem) => {
      if (!coItem?.mainCoDocId || !coItem?.coIndex) return 0
      const key = `${coItem.mainCoDocId}-${coItem.coIndex}`
      return selection.has(key) ? selection.get(key).maxMarks : 0
    },
    [selection],
  )

  // Calculate total marks allocated - with safety checks
  const totalAllocated = Array.from(selection.values()).reduce(
    (sum, co) => sum + (parseFloat(co.maxMarks) || 0),
    0,
  )

  return (
    <div>
      {totalAssessmentMarks > 0 && (
        <div className="flex justify-between mb-2 text-sm">
          <span>
            Total Assessment Marks: <strong>{totalAssessmentMarks}</strong>
          </span>
          <span
            className={`${Math.abs(totalAllocated - totalAssessmentMarks) > 0.01 ? "text-danger" : "text-success"}`}
          >
            Allocated: <strong>{totalAllocated.toFixed(2)}</strong> / {totalAssessmentMarks}
          </span>
        </div>
      )}

      <Table aria-label="Course Outcomes Selection Table" selectionMode="none">
        <TableHeader>
          <TableColumn>Select</TableColumn>
          <TableColumn>CO</TableColumn>
          <TableColumn>Description</TableColumn>
          {showMarkInput && <TableColumn>Marks</TableColumn>}
        </TableHeader>
        <TableBody emptyContent="No course outcomes available">
          {Array.isArray(availableCOs) && availableCOs.length > 0 ? (
            availableCOs.map((co) => (
              <TableRow key={`${co.mainCoDocId}-${co.coIndex}`}>
                <TableCell>
                  <Checkbox
                    isSelected={isSelected(co)}
                    onValueChange={(checked) => handleSelectionChange(checked, co)}
                    isDisabled={disabled}
                  />
                </TableCell>
                <TableCell>CO{co.coIndex}</TableCell>
                <TableCell className="max-w-md truncate">{co.description}</TableCell>
                {showMarkInput && (
                  <TableCell>
                    <Input
                      type="text"
                      value={getMarks(co).toString()}
                      onChange={(e) => handleMarksChange(e.target.value, co)}
                      disabled={!isSelected(co) || disabled}
                      size="sm"
                      className="w-20"
                    />
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={showMarkInput ? 4 : 3}>No course outcomes available</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {required && selection.size === 0 && (
        <p className="text-danger text-sm mt-2">At least one Course Outcome must be selected.</p>
      )}
    </div>
  )
}