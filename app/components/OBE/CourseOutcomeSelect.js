// CourseOutcomeSelect.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { Checkbox, Input, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
import debounce from "lodash/debounce";

// Custom equality check for CO arrays
const areCOsEqual = (arr1, arr2) => {
  if (!Array.isArray(arr1) || !Array.isArray(arr2) || arr1.length !== arr2.length) return false;
  return arr1.every((co1, i) => {
    const co2 = arr2[i];
    return (
      co1.mainCoDocId === co2.mainCoDocId &&
      co1.coIndex === co2.coIndex &&
      Math.abs(co1.maxMarks - co2.maxMarks) < 0.001
    );
  });
};

export default function CourseOutcomeSelect({
  availableCOs = [],
  selectedCOs = [],
  onChange,
  totalAssessmentMarks = 0,
  showMarkInput = true,
  disabled = false,
  required = false,
}) {
  console.log("CourseSelect props:", { availableCOs, selectedCOs });

  // Normalize selectedCOs
  const normalizedSelectedCOs = useMemo(() => {
    if (!Array.isArray(selectedCOs)) return [];
    return selectedCOs.map((co) => ({
      mainCoDocId: co.mainCoDocId || (typeof co.courseOutcome === "string" ? co.courseOutcome : co.courseOutcome?._id),
      coIndex: Number(co.coIndex),
      maxMarks: Number(co.maxMarks || 0),
    }));
  }, [selectedCOs]); // No need for JSON.stringify; rely on stable selectedCOs

  const [selectionState, setSelectionState] = useState({});

  // Sync selectionState with normalizedSelectedCOs
  useEffect(() => {
    const newSelection = {};
    normalizedSelectedCOs.forEach((co) => {
      if (co.mainCoDocId && co.coIndex !== undefined) {
        const key = `${co.mainCoDocId}-${co.coIndex}`;
        newSelection[key] = {
          mainCoDocId: co.mainCoDocId,
          coIndex: Number(co.coIndex),
          maxMarks: Number(co.maxMarks || 0),
        };
      }
    });

    // Only update if different
    const currentSelectionArray = Object.values(selectionState).map((co) => ({
      mainCoDocId: co.mainCoDocId,
      coIndex: co.coIndex,
      maxMarks: co.maxMarks,
    }));
    if (!areCOsEqual(currentSelectionArray, normalizedSelectedCOs)) {
      setSelectionState(newSelection);
    }
  }, [normalizedSelectedCOs]);

  // Compute selectionArray
  const selectionArray = useMemo(() => {
    return Object.values(selectionState).map((co) => ({
      mainCoDocId: co.mainCoDocId,
      coIndex: Number(co.coIndex),
      maxMarks: Number(co.maxMarks || 0),
    }));
  }, [selectionState]);

  // Debounced onChange
  const debouncedOnChange = useMemo(
    () =>
      debounce((newSelection) => {
        if (typeof onChange === "function") {
          onChange(newSelection);
        }
      }, 300),
    [onChange]
  );

  // Notify parent of changes
  useEffect(() => {
    if (!areCOsEqual(selectionArray, normalizedSelectedCOs)) {
      debouncedOnChange(selectionArray);
    }
    return () => debouncedOnChange.cancel(); // Cleanup debounce on unmount
  }, [selectionArray, normalizedSelectedCOs, debouncedOnChange]);

  const handleSelectionChange = useCallback((isSelected, coItem) => {
    if (!coItem?.mainCoDocId || coItem?.coIndex === undefined) return;
    const key = `${coItem.mainCoDocId}-${coItem.coIndex}`;
    setSelectionState((prev) => {
      const newState = { ...prev };
      if (isSelected) {
        newState[key] = {
          mainCoDocId: coItem.mainCoDocId,
          coIndex: Number(coItem.coIndex),
          maxMarks: prev[key]?.maxMarks || 0,
        };
      } else {
        delete newState[key];
      }
      return newState;
    });
  }, []);

  const handleMarksChange = useCallback(
    debounce((value, coItem) => {
      if (!coItem?.mainCoDocId || coItem?.coIndex === undefined) return;
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        const key = `${coItem.mainCoDocId}-${coItem.coIndex}`;
        const numValue = value === "" ? 0 : Number(value);
        setSelectionState((prev) => {
          if (!prev[key]) return prev;
          return {
            ...prev,
            [key]: {
              ...prev[key],
              maxMarks: isNaN(numValue) ? 0 : numValue,
            },
          };
        });
      }
    }, 300),
    []
  );

  const isSelected = useCallback(
    (coItem) => {
      if (!coItem?.mainCoDocId || coItem?.coIndex === undefined) return false;
      const key = `${coItem.mainCoDocId}-${coItem.coIndex}`;
      return !!selectionState[key];
    },
    [selectionState]
  );

  const getMarks = useCallback(
    (coItem) => {
      if (!coItem?.mainCoDocId || coItem?.coIndex === undefined) return 0;
      const key = `${coItem.mainCoDocId}-${coItem.coIndex}`;
      return selectionState[key]?.maxMarks || 0;
    },
    [selectionState]
  );

  const totalAllocated = useMemo(() => {
    return Object.values(selectionState).reduce((sum, co) => sum + Number(co.maxMarks || 0), 0);
  }, [selectionState]);

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
              const key = `${co.mainCoDocId}-${co.coIndex}`;
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
              );
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
  );
}