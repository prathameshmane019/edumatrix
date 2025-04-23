"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
import { Button, ModalBody, ModalFooter, Select, SelectItem, Input, Spinner } from "@nextui-org/react"
import { parseDate, today, getLocalTimeZone } from "@internationalized/date"
import { DatePicker } from "@nextui-org/react"
import { toast } from "sonner"
import CourseOutcomeSelect from "./CourseOutcomeSelect"

const ASSESSMENT_TYPES = ["Exam", "Quiz", "Assignment", "Lab", "Project", "Presentation", "Other"]

export default function AssessmentForm({
  assessment,
  subject,
  courseOutcomes,
  onSubmit,
  onClose,
  isLoading,
  academicYear,
  semester,
  isLoadingCOs,
}) {
  // Debug incoming props
  console.log("AssessmentForm props:", {
    hasAssessment: !!assessment,
    subject,
    courseOutcomesCount: courseOutcomes?.length,
    academicYear,
    semester,
  })

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    maxMarks: "",
    assessmentDate: null,
    coMapping: [],
  })

  const [errors, setErrors] = useState({})

  // Initialize form data from assessment prop
  useEffect(() => {
    console.log("Initializing form from assessment:", assessment)

    if (assessment) {
      setFormData({
        name: assessment.name || "",
        type: assessment.type || "",
        maxMarks: assessment.maxMarks?.toString() || "",
        assessmentDate: assessment.assessmentDate ? parseDate(assessment.assessmentDate.split("T")[0]) : null,
        coMapping: assessment.coMapping || [],
      })
    } else {
      setFormData({
        name: "",
        type: "",
        maxMarks: "",
        assessmentDate: null,
        coMapping: [],
      })
    }
    setErrors({})
  }, [assessment])

  // Process course outcomes for the selector component
  const availableCOs = useMemo(() => {
    if (!courseOutcomes || courseOutcomes.length === 0) return []

    // Flatten the nested structure to make it easier to work with
    const flattened = courseOutcomes
      .flatMap((coDoc) =>
        (coDoc.outcomes || []).map((outcome) => ({
          mainCoDocId: coDoc._id,
          coIndex: outcome.index,
          description: outcome.description,
          cognitiveLevel: outcome.cognitiveLevel,
        })),
      )
      .sort((a, b) => a.coIndex - b.coIndex)

    console.log("Processed availableCOs:", flattened)
    return flattened
  }, [courseOutcomes])

  // Handle input changes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target

    if (name === "maxMarks") {
      // Validate numeric input
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }))

        // Clear related errors
        setErrors((prev) => ({
          ...prev,
          [name]: null,
          coMappingSum: null,
        }))
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }, [])

  // Handle date changes
  const handleDateChange = useCallback((dateValue) => {
    setFormData((prev) => ({ ...prev, assessmentDate: dateValue }))
    setErrors((prev) => ({ ...prev, assessmentDate: null }))
  }, [])

  // Handle CO mapping changes from CourseOutcomeSelect
  const handleCoMappingChange = useCallback((updatedCoMapping) => {
    console.log("CO mapping changed:", updatedCoMapping)

    // Update form data with the new mapping
    setFormData((prev) => ({
      ...prev,
      coMapping: updatedCoMapping,
    }))

    // Clear related errors
    setErrors((prev) => ({
      ...prev,
      coMapping: null,
      coMappingSum: null,
    }))
  }, [])

  // Validate the form before submission
  const validateForm = useCallback(() => {
    console.log("Validating form:", formData)

    const newErrors = {}
    let isValid = true

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Assessment Name is required."
      isValid = false
    }

    // Validate type
    if (!formData.type) {
      newErrors.type = "Assessment Type is required."
      isValid = false
    }

    // Validate max marks
    const maxMarksValue = Number(formData.maxMarks)
    if (formData.maxMarks === "" || isNaN(maxMarksValue) || maxMarksValue <= 0) {
      newErrors.maxMarks = "Total Max Marks must be a positive number."
      isValid = false
    }

    // Validate CO mapping if max marks is valid
    if (isValid && !isNaN(maxMarksValue) && maxMarksValue > 0) {
      // Check if any COs are mapped
      if (!formData.coMapping || formData.coMapping.length === 0) {
        newErrors.coMapping = "At least one Course Outcome must be mapped."
        isValid = false
      } else {
        // Calculate total mapped marks
        const totalMappedMarks = formData.coMapping.reduce((sum, item) => sum + Number(item.maxMarks || 0), 0)

        // Check if total matches assessment max marks (with small tolerance)
        if (Math.abs(totalMappedMarks - maxMarksValue) > 0.01) {
          newErrors.coMappingSum = `Sum of marks mapped to COs (${totalMappedMarks.toFixed(2)}) must equal Total Max Marks (${maxMarksValue}).`
          isValid = false
        }

        // Check if any mapped CO has marks > 0
        const hasMarksGreaterThanZero = formData.coMapping.some((item) => Number(item.maxMarks) > 0)

        if (!hasMarksGreaterThanZero) {
          newErrors.coMapping = "At least one Course Outcome must have marks greater than 0."
          isValid = false
        }
      }
    }

    console.log("Validation result:", { isValid, errors: newErrors })
    setErrors(newErrors)
    return isValid
  }, [formData])

  // Handle form submission
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault()
      console.log("Form submitted, data:", formData)

      if (validateForm()) {
        // Prepare payload for API
        const payload = {
          name: formData.name.trim(),
          type: formData.type,
          maxMarks: Number(formData.maxMarks),
          assessmentDate: formData.assessmentDate?.toString() || null,
          coMapping: formData.coMapping,
          subject: subject,
          academicYear: academicYear,
          sem: semester,
        }

        console.log("Submitting payload:", payload)
        onSubmit(payload)
      } else {
        toast.error("Please fix the errors in the form.")
      }
    },
    [formData, validateForm, onSubmit, subject, academicYear, semester],
  )

  // Prepare selected COs for the CourseOutcomeSelect component
  const selectedCOs = useMemo(() => {
    return formData.coMapping.map((mapping) => ({
      mainCoDocId: mapping.courseOutcome,
      coIndex: mapping.coIndex,
      maxMarks: mapping.maxMarks,
    }))
  }, [formData.coMapping])

  return (
    <form onSubmit={handleSubmit}>
      <ModalBody className="max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Assessment Name */}
          <Input
            label="Assessment Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Mid Term Exam, Quiz 1"
            variant="bordered"
            isRequired
            isInvalid={!!errors.name}
            errorMessage={errors.name}
          />

          {/* Assessment Type */}
          <Select
            label="Assessment Type"
            placeholder="Select type"
            selectedKeys={formData.type ? new Set([formData.type]) : new Set()}
            onChange={(e) => handleInputChange({ target: { name: "type", value: e.target.value } })}
            variant="bordered"
            isRequired
            isInvalid={!!errors.type}
            errorMessage={errors.type}
          >
            {ASSESSMENT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </Select>

          {/* Max Marks */}
          <Input
            label="Total Max Marks"
            name="maxMarks"
            type="text"
            value={formData.maxMarks}
            onChange={handleInputChange}
            placeholder="e.g., 50"
            variant="bordered"
            isRequired
            isInvalid={!!errors.maxMarks || !!errors.coMappingSum}
            errorMessage={errors.maxMarks || errors.coMappingSum}
          />

          {/* Assessment Date */}
          <DatePicker
            label="Assessment Date (Optional)"
            value={formData.assessmentDate}
            onChange={handleDateChange}
            variant="bordered"
            granularity="day"
            minValue={today(getLocalTimeZone()).subtract({ years: 1 })}
            maxValue={today(getLocalTimeZone()).add({ years: 1 })}
            isInvalid={!!errors.assessmentDate}
            errorMessage={errors.assessmentDate}
          />
        </div>

        {/* Course Outcome Mapping Section */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Course Outcome Mapping</h3>

          {/* Error messages */}
          {errors.coMappingSum && (
            <p className="text-danger text-sm mb-2 p-2 bg-danger-50 rounded-md border border-danger-200">
              {errors.coMappingSum}
            </p>
          )}
          {errors.coMapping && !errors.coMappingSum && (
            <p className="text-danger text-sm mb-2 p-2 bg-danger-50 rounded-md border border-danger-200">
              {errors.coMapping}
            </p>
          )}

          {/* Loading state */}
          {isLoadingCOs ? (
            <div className="flex justify-center py-4">
              <Spinner size="sm" label="Loading Course Outcomes..." />
            </div>
          ) : (
            /* CO Selection Component */
            <CourseOutcomeSelect
              availableCOs={availableCOs}
              selectedCOs={selectedCOs}
              onChange={handleCoMappingChange}
              totalAssessmentMarks={Number(formData.maxMarks) || 0}
              showMarkInput={true}
              disabled={isLoading}
              required={true}
            />
          )}
        </div>
      </ModalBody>

      {/* Form Actions */}
      <ModalFooter>
        <Button color="danger" variant="light" onPress={onClose} isDisabled={isLoading}>
          Cancel
        </Button>
        <Button
          color="primary"
          type="submit"
          isLoading={isLoading}
          isDisabled={isLoading || (availableCOs.length === 0 && !isLoadingCOs)}
        >
          {assessment ? "Save Changes" : "Add Assessment"}
        </Button>
      </ModalFooter>
    </form>
  )
}
