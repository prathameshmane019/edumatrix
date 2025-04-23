"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
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
  // Create a more consistent representation of selected COs
  const normalizedSelectedCOs = useMemo(() => {
    return Array.isArray(selectedCOs)
      ? selectedCOs.map((co) => ({
          mainCoDocId: co.mainCoDocId || co.courseOutcome, // Handle both formats
          coIndex: Number(co.coIndex),
          maxMarks: Number(co.maxMarks || 0),
        }))
      : []
  }, [selectedCOs])

  // Use a keyed object for selection state instead of Map
  const [selectionState, setSelectionState] = useState({})

  // Initialize selection from normalized props
  useEffect(() => {
    const newSelection = {}

    normalizedSelectedCOs.forEach((co) => {
      if (co.mainCoDocId && co.coIndex) {
        const key = `${co.mainCoDocId}-${co.coIndex}`
        newSelection[key] = {
          mainCoDocId: co.mainCoDocId,
          coIndex: Number(co.coIndex),
          maxMarks: Number(co.maxMarks || 0),
        }
      }
    })

    setSelectionState(newSelection)
  }, [normalizedSelectedCOs])

  // Convert selection state to array for parent component
  const selectionArray = useMemo(() => {
    return Object.values(selectionState).map((co) => ({
      mainCoDocId: co.mainCoDocId,
      coIndex: Number(co.coIndex),
      maxMarks: Number(co.maxMarks || 0),
    }))
  }, [selectionState])

  // Notify parent of changes, but only when necessary
  useEffect(() => {
    // Only trigger if the selection actually changed
    const hasChanged =
      selectionArray.length !== normalizedSelectedCOs.length ||
      !selectionArray.every((newCO, i) => {
        const oldCO = normalizedSelectedCOs[i]
        if (!oldCO) return false

        return (
          newCO.mainCoDocId === oldCO.mainCoDocId &&
          newCO.coIndex === oldCO.coIndex &&
          Math.abs(newCO.maxMarks - oldCO.maxMarks) < 0.001
        )
      })

    if (hasChanged && typeof onChange === "function") {
      // Convert back to the format expected by parent
      const updatedCOs = selectionArray.map((co) => ({
        mainCoDocId: co.mainCoDocId,
        coIndex: co.coIndex,
        maxMarks: co.maxMarks,
      }))

      onChange(updatedCOs)
    }
  }, [selectionArray, normalizedSelectedCOs, onChange])

  // Handle checkbox selection
  const handleSelectionChange = useCallback((isSelected, coItem) => {
    if (!coItem?.mainCoDocId || !coItem?.coIndex) return

    const key = `${coItem.mainCoDocId}-${coItem.coIndex}`

    setSelectionState((prev) => {
      const newState = { ...prev }

      if (isSelected) {
        // Add to selection with default 0 marks
        newState[key] = {
          mainCoDocId: coItem.mainCoDocId,
          coIndex: Number(coItem.coIndex),
          maxMarks: prev[key]?.maxMarks || 0,
        }
      } else {
        // Remove from selection
        delete newState[key]
      }

      return newState
    })
  }, [])

  // Handle marks input change
  const handleMarksChange = useCallback((value, coItem) => {
    if (!coItem?.mainCoDocId || !coItem?.coIndex) return

    // Only allow valid numeric input
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      const key = `${coItem.mainCoDocId}-${coItem.coIndex}`
      const numValue = value === "" ? 0 : Number(value)

      setSelectionState((prev) => {
        // Only update if this CO is actually selected
        if (!prev[key]) return prev

        return {
          ...prev,
          [key]: {
            ...prev[key],
            maxMarks: isNaN(numValue) ? 0 : numValue,
          },
        }
      })
    }
  }, [])

  // Check if a CO is selected
  const isSelected = useCallback(
    (coItem) => {
      if (!coItem?.mainCoDocId || !coItem?.coIndex) return false
      const key = `${coItem.mainCoDocId}-${coItem.coIndex}`
      return !!selectionState[key]
    },
    [selectionState],
  )

  // Get marks for a CO
  const getMarks = useCallback(
    (coItem) => {
      if (!coItem?.mainCoDocId || !coItem?.coIndex) return 0
      const key = `${coItem.mainCoDocId}-${coItem.coIndex}`
      return selectionState[key]?.maxMarks || 0
    },
    [selectionState],
  )

  // Calculate total marks allocated
  const totalAllocated = useMemo(() => {
    return Object.values(selectionState).reduce((sum, co) => sum + Number(co.maxMarks || 0), 0)
  }, [selectionState])

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
            availableCOs.map((co) => {
              const key = `${co.mainCoDocId}-${co.coIndex}`
              return (
                <TableRow key={key}>
                  <TableCell>
                    <Checkbox
                      isSelected={isSelected(co)}
                      onValueChange={(checked) => handleSelectionChange(checked, co)}
                      isDisabled={disabled}
                    />
                  </TableCell>
                  <TableCell>CO{co.coIndex}</TableCell>
                  <TableCell className="max-w-md truncate">{co.description || ""}</TableCell>
                  {showMarkInput && (
                    <TableCell>
                      <Input
                        type="text"
                        value={String(getMarks(co))}
                        onChange={(e) => handleMarksChange(e.target.value, co)}
                        disabled={!isSelected(co) || disabled}
                        size="sm"
                        className="w-20"
                      />
                    </TableCell>
                  )}
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={showMarkInput ? 4 : 3}>No course outcomes available</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {required && Object.keys(selectionState).length === 0 && (
        <p className="text-danger text-sm mt-2">At least one Course Outcome must be selected.</p>
      )}
    </div>
  )
}
