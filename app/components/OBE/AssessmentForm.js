// AssessmentForm.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { Button, ModalBody, ModalFooter, Select, SelectItem, Input, Spinner } from "@nextui-org/react";
import { parseDate, today, getLocalTimeZone } from "@internationalized/date";
import { DatePicker } from "@nextui-org/react";
import { toast } from "sonner";
import CourseOutcomeSelect from "./CourseOutcomeSelect";

// Custom equality check for CO mappings
const areCOMappingsEqual = (arr1, arr2) => {
  if (!Array.isArray(arr1) || !Array.isArray(arr2) || arr1.length !== arr2.length) return false;
  return arr1.every((co1, i) => {
    const co2 = arr2[i];
    return (
      co1.courseOutcome === co2.courseOutcome &&
      co1.coIndex === co2.coIndex &&
      Math.abs(co1.maxMarks - co2.maxMarks) < 0.001
    );
  });
};

const ASSESSMENT_TYPES = ["Exam", "Quiz", "Assignment", "Lab", "Project", "Presentation", "Other"];

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
  console.log("AssessmentForm props:", {
    hasAssessment: !!assessment,
    subject,
    courseOutcomes,
    academicYear,
    assessment,
    semester,
  });

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    maxMarks: "",
    assessmentDate: null,
    coMapping: [],
    sem: semester || "",
  });

  const [errors, setErrors] = useState({});

  // Initialize form data
  useEffect(() => {
    console.log("Initializing form from assessment:", assessment);
    const newFormData = assessment
      ? {
          name: assessment.name || "",
          type: assessment.type || "",
          maxMarks: assessment.maxMarks !== undefined ? String(assessment.maxMarks) : "",
          assessmentDate: assessment.assessmentDate ? parseDate(assessment.assessmentDate.split("T")[0]) : null,
          coMapping: Array.isArray(assessment.coMapping)
            ? assessment.coMapping.map((mapping) => ({
                courseOutcome: mapping.courseOutcome?._id || mapping.courseOutcome, // Extract _id
                coIndex: Number(mapping.coIndex),
                maxMarks: Number(mapping.maxMarks || 0),
              }))
            : [],
          sem: assessment.sem || semester || "",
        }
      : {
          name: "",
          type: "",
          maxMarks: "",
          assessmentDate: null,
          coMapping: [],
          sem: semester || "",
        };

    // Only update if different
    if (!areCOMappingsEqual(newFormData.coMapping, formData.coMapping) || JSON.stringify(newFormData) !== JSON.stringify(formData)) {
      setFormData(newFormData);
      setErrors({});
    }
  }, [assessment, semester]);

  const availableCOs = useMemo(() => {
    if (!courseOutcomes || !Array.isArray(courseOutcomes) || courseOutcomes.length === 0) return [];
    try {
      const flattened = courseOutcomes
        .flatMap((coDoc) => {
          if (!coDoc || !coDoc.outcomes || !Array.isArray(coDoc.outcomes)) return [];
          return coDoc.outcomes.map((outcome) => ({
            mainCoDocId: coDoc._id,
            coIndex: Number(outcome.index),
            description: outcome.description || "",
            cognitiveLevel: outcome.cognitiveLevel || "N/A",
          }));
        })
        .filter((item) => item.mainCoDocId && item.coIndex)
        .sort((a, b) => a.coIndex - b.coIndex);
      console.log("Processed availableCOs:", flattened);
      return flattened;
    } catch (err) {
      console.error("Error processing course outcomes:", err);
      return [];
    }
  }, [courseOutcomes]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name === "maxMarks") {
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({
          ...prev,
          [name]: null,
          coMappingSum: null,
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  }, []);

  const handleDateChange = useCallback((dateValue) => {
    setFormData((prev) => ({ ...prev, assessmentDate: dateValue }));
    setErrors((prev) => ({ ...prev, assessmentDate: null }));
  }, []);

  const handleCoMappingChange = useCallback((updatedCoMapping) => {
    console.log("CO mapping changed:", updatedCoMapping);
    const normalizedMapping = updatedCoMapping.map((co) => ({
      courseOutcome: co.mainCoDocId,
      coIndex: Number(co.coIndex),
      maxMarks: Number(co.maxMarks || 0),
    }));
    setFormData((prev) => {
      if (areCOMappingsEqual(normalizedMapping, prev.coMapping)) return prev;
      return { ...prev, coMapping: normalizedMapping };
    });
    setErrors((prev) => ({
      ...prev,
      coMapping: null,
      coMappingSum: null,
    }));
  }, []);

  const selectedCOsForComponent = useMemo(() => {
    const mapped = formData.coMapping.map((mapping) => ({
      mainCoDocId: mapping.courseOutcome,
      coIndex: Number(mapping.coIndex),
      maxMarks: Number(mapping.maxMarks || 0),
    }));
    return mapped;
  }, [formData.coMapping]); // Stable if formData.coMapping is stable

  const validateForm = useCallback(() => {
    console.log("Validating form:", formData);
    const newErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Assessment Name is required.";
      isValid = false;
    }

    if (!formData.type) {
      newErrors.type = "Assessment Type is required.";
      isValid = false;
    }

    const maxMarksValue = Number(formData.maxMarks);
    if (formData.maxMarks === "" || isNaN(maxMarksValue) || maxMarksValue <= 0) {
      newErrors.maxMarks = "Total Max Marks must be a positive number.";
      isValid = false;
    }

    if (isValid && !isNaN(maxMarksValue) && maxMarksValue > 0) {
      if (!formData.coMapping || formData.coMapping.length === 0) {
        newErrors.coMapping = "At least one Course Outcome must be mapped.";
        isValid = false;
      } else {
        const totalMappedMarks = formData.coMapping.reduce((sum, item) => sum + Number(item.maxMarks || 0), 0);
        if (Math.abs(totalMappedMarks - maxMarksValue) > 0.01) {
          newErrors.coMappingSum = `Sum of marks mapped to COs (${totalMappedMarks.toFixed(2)}) must equal Total Max Marks (${maxMarksValue}).`;
          isValid = false;
        }
        const hasMarksGreaterThanZero = formData.coMapping.some((item) => Number(item.maxMarks) > 0);
        if (!hasMarksGreaterThanZero) {
          newErrors.coMapping = "At least one Course Outcome must have marks greater than 0.";
          isValid = false;
        }
      }
    }

    console.log("Validation result:", { isValid, errors: newErrors });
    setErrors(newErrors);
    return isValid;
  }, [formData]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      console.log("Form submitted, data:", formData);
      if (validateForm()) {
        const payload = {
          name: formData.name.trim(),
          type: formData.type,
          maxMarks: Number(formData.maxMarks),
          assessmentDate: formData.assessmentDate?.toString() || null,
          coMapping: formData.coMapping.map((co) => ({
            courseOutcome: co.courseOutcome,
            coIndex: Number(co.coIndex),
            maxMarks: Number(co.maxMarks || 0),
          })),
          subject: subject,
          academicYear: academicYear,
          sem: formData.sem || semester,
        };
        console.log("Submitting payload:", payload);
        onSubmit(payload);
      } else {
        toast.error("Please fix the errors in the form.");
      }
    },
    [formData, validateForm, onSubmit, subject, academicYear, semester]
  );

  return (
    <form onSubmit={handleSubmit}>
      
      <ModalBody  >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <Select
            label="Semester"
            placeholder="Select semester"
            selectedKeys={formData.sem ? new Set([formData.sem]) : new Set()}
            onChange={(e) => handleInputChange({ target: { name: "sem", value: e.target.value } })}
            variant="bordered"
            isRequired
            isInvalid={!!errors.sem}
            errorMessage={errors.sem}
          >
            <SelectItem key="sem1" value="sem1">
              Semester 1
            </SelectItem>
            <SelectItem key="sem2" value="sem2">
              Semester 2
            </SelectItem>
          </Select>
        </div>
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Course Outcome Mapping</h3>
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
          {isLoadingCOs ? (
            <div className="flex justify-center py-4">
              <Spinner size="sm" label="Loading Course Outcomes..." />
            </div>
          ) : (
            <CourseOutcomeSelect
              key={assessment?._id || "new-assessment"} // Stable key
              availableCOs={availableCOs}
              selectedCOs={selectedCOsForComponent}
              onChange={handleCoMappingChange}
              totalAssessmentMarks={Number(formData.maxMarks) || 0}
              showMarkInput={true}
              disabled={isLoading}
              required={true}
            />
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" variant="light" onPress={onClose} is garantizarDisabled={isLoading}>
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
  );
}