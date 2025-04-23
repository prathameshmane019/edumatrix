// app/obe/faculty/marks-entry/page.jsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Button,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Spinner,
  Tooltip,
  Chip,
} from "@nextui-org/react";
import { CalendarIcon } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useUser } from "@/app/context/UserContext";
import { SubjectDropdown } from "@/app/components/subject/SubjectDropdown";
import { getAcademicYears } from "@/app/utils/acadmicYears";

export default function MarksEntryPage() {
  const { user } = useUser();
  const [academicYear, setAcademicYear] = useState("");
  const [filterSem, setFilterSem] = useState("");
  const [subject, setSubject] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [students, setStudents] = useState([]);
  const [marksData, setMarksData] = useState({});
  const [isLoadingAssessments, setIsLoadingAssessments] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [existingMarksLoaded, setExistingMarksLoaded] = useState(false);

  // Academic year options
  const academicYearOptions = useMemo(
    () =>
      getAcademicYears(10).map((year) => ({
        key: year.value,
        value: year.value,
        label: year.label,
      })),
    []
  );

  // Fetch assessments for the selected subject
  const fetchAssessments = useCallback(
    async (subId, acadYear = "", semester = "") => {
      if (!subId) {
        setAssessments([]);
        return;
      }

      console.log("Fetching assessments:", { subId, acadYear, semester });
      setIsLoadingAssessments(true);

      try {
        const response = await axios.get(`/api/v2/obe/assessment`, {
          params: {
            subjectId: subId,
            academicYear: acadYear,
            sem: semester,
          },
        });

        const assessmentData = Array.isArray(response.data.data) ? response.data.data : [];
        console.log("Fetched assessments:", assessmentData);
        setAssessments(assessmentData);
        // Clear selected assessment when assessments change
        setSelectedAssessment(null);
      } catch (error) {
        console.error("Error fetching assessments:", error);
        toast.error(`Error fetching assessments: ${error.response?.data?.message || error.message}`);
      } finally {
        setIsLoadingAssessments(false);
      }
    },
    []
  );

  // Fetch students for the selected subject
  const fetchStudentsForSubject = useCallback(async (subId) => {
    if (!subId) {
      setStudents([]);
      return;
    }

    console.log("Fetching students for subject:", subId);
    setIsLoadingStudents(true);

    try {
      // Adjust the API endpoint based on your actual backend implementation
      const response = await axios.get(`/api/v2/subjects/${subId}/students`);
      const studentData = Array.isArray(response.data.data) ? response.data.data : [];
      console.log("Fetched students:", studentData);
      setStudents(studentData);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error(`Error fetching students: ${error.response?.data?.message || error.message}`);
      setStudents([]);
    } finally {
      setIsLoadingStudents(false);
    }
  }, []);

  // Fetch full assessment details when assessment is selected
  const fetchFullAssessmentDetails = useCallback(
    async (assessmentId) => {
      if (!assessmentId) {
        setSelectedAssessment(null);
        setMarksData({});
        setExistingMarksLoaded(false);
        return;
      }

      try {
        console.log("Fetching full assessment details:", assessmentId);
        const response = await axios.get(`/api/v2/obe/assessment/${assessmentId}`);
        const assessmentDetails = response.data.data;
        setSelectedAssessment(assessmentDetails);

        // Initialize marksData for each student and CO
        const initialMarks = {};
        students.forEach((student) => {
          initialMarks[student._id] = {};
          assessmentDetails?.coMapping?.forEach((map) => {
            initialMarks[student._id][map.courseOutcome._id] = "";
          });
        });
        setMarksData(initialMarks);
        setExistingMarksLoaded(false);

        // Now fetch existing marks if available
        await fetchExistingMarks(assessmentId);
      } catch (error) {
        console.error("Error fetching assessment details:", error);
        toast.error(`Error fetching assessment details: ${error.response?.data?.message || error.message}`);
      }
    },
    [students]
  );

  // Fetch existing marks for the selected assessment
  const fetchExistingMarks = useCallback(
    async (assessmentId) => {
      if (!assessmentId || !subject || students.length === 0) return;

      try {
        console.log("Fetching existing marks:", { assessmentId, subjectId: subject });
        const response = await axios.get(`/api/v2/obe/student-results`, {
          params: {
            assessmentId: assessmentId,
            subjectId: subject,
            academicYear: academicYear,
            sem: filterSem,
          },
        });

        const existingResults = Array.isArray(response.data.data) ? response.data.data : [];
        console.log("Existing marks:", existingResults);

        if (existingResults.length > 0) {
          // Update marksData with existing marks
          const updatedMarks = { ...marksData };

          existingResults.forEach((result) => {
            if (!updatedMarks[result.student._id]) {
              updatedMarks[result.student._id] = {};
            }

            result.marksBreakdown.forEach((breakdown) => {
              updatedMarks[result.student._id][breakdown.courseOutcome] = String(breakdown.marksObtained);
            });
          });

          setMarksData(updatedMarks);
          setExistingMarksLoaded(true);
          toast.info("Existing marks loaded successfully.");
        } else {
          console.log("No existing marks found.");
          setExistingMarksLoaded(true);
        }
      } catch (error) {
        console.error("Error fetching existing marks:", error);
        // Don't show error toast for this as it might be a normal case (no marks yet)
        setExistingMarksLoaded(true);
      }
    },
    [subject, students, academicYear, filterSem, marksData]
  );

  // Effect to fetch data when filters change
  useEffect(() => {
    console.log("Filter changed, fetching data:", { subject, academicYear, filterSem });

    if (subject && academicYear) {
      // If we have both subject and year, fetch assessments and students
      fetchAssessments(subject, academicYear, filterSem);
      fetchStudentsForSubject(subject);
    } else {
      // If we don't have both, clear data
      setAssessments([]);
      setStudents([]);
      setSelectedAssessment(null);
      setMarksData({});
    }
  }, [subject, academicYear, filterSem, fetchAssessments, fetchStudentsForSubject]);

  // Handle subject change
  const handleSubjectChange = useCallback((selectedSubject) => {
    console.log("Subject changed:", selectedSubject);
    setSubject(selectedSubject);
    setSelectedAssessment(null);
    setMarksData({});
  }, []);

  // Handle academic year change
  const handleAcademicYearChange = useCallback((keys) => {
    const selectedYear = keys.size > 0 ? Array.from(keys)[0].toString() : "";
    console.log("Academic year changed:", selectedYear);
    setAcademicYear(selectedYear);
    setSubject(null);
    setFilterSem("");
    setSelectedAssessment(null);
    setMarksData({});
  }, []);

  // Handle semester filter change
  const handleFilterSemChange = useCallback((keys) => {
    const selectedSem = keys.size > 0 ? Array.from(keys)[0].toString() : "";
    console.log("Semester filter changed:", selectedSem);
    setFilterSem(selectedSem);
    setSelectedAssessment(null);
    setMarksData({});
  }, []);

  // Handle assessment selection
  const handleAssessmentChange = useCallback(
    (keys) => {
      const selectedId = keys.size > 0 ? Array.from(keys)[0].toString() : null;
      console.log("Assessment selection changed:", selectedId);
      
      if (selectedId) {
        fetchFullAssessmentDetails(selectedId);
      } else {
        setSelectedAssessment(null);
        setMarksData({});
      }
    },
    [fetchFullAssessmentDetails]
  );

  // Handle mark change
  const handleMarkChange = useCallback(
    (studentId, coId, value) => {
      const assessmentCoMap = selectedAssessment?.coMapping?.find((m) => m.courseOutcome._id === coId);
      const assessmentCoMax = assessmentCoMap?.maxMarks ?? 0;
      
      // Empty value is allowed (for clearing)
      if (value === "") {
        setMarksData((prev) => ({
          ...prev,
          [studentId]: {
            ...prev[studentId],
            [coId]: value,
          },
        }));
        return;
      }

      // Validate numeric input
      const numericValue = Number(value);
      if (isNaN(numericValue) || numericValue < 0 || numericValue > assessmentCoMax) {
        toast.error(`Invalid mark for CO. Must be between 0 and ${assessmentCoMax}.`);
        return;
      }

      // Update marks data
      setMarksData((prev) => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [coId]: value,
        },
      }));
    },
    [selectedAssessment]
  );

  // Calculate student total marks
  const calculateStudentTotal = useCallback(
    (studentId) => {
      if (!selectedAssessment || !marksData[studentId]) return 0;

      return selectedAssessment.coMapping?.reduce((sum, map) => {
        const mark = Number(marksData[studentId]?.[map.courseOutcome._id] || 0);
        return sum + (isNaN(mark) ? 0 : mark);
      }, 0);
    },
    [selectedAssessment, marksData]
  );

  // Handle save marks
  const handleSaveMarks = useCallback(async () => {
    if (!selectedAssessment || !subject || students.length === 0) {
      toast.error("Missing assessment or student data.");
      return;
    }

    setIsSaving(true);
    const resultsToSave = [];
    let validationPassed = true;

    // Validate and structure data for API
    students.forEach((student) => {
      const studentMarks = marksData[student._id];
      const marksBreakdown = [];
      let totalMarks = 0;

      if (!studentMarks) {
        toast.error(`No marks data found for ${student.name}. Please enter marks.`);
        validationPassed = false;
        return;
      }

      selectedAssessment.coMapping.forEach((map) => {
        const coId = map.courseOutcome._id;
        const markStr = studentMarks[coId];

        // If mark is not entered, consider it as 0
        const mark = markStr === "" ? 0 : Number(markStr);

        if (isNaN(mark) || mark < 0 || mark > map.maxMarks) {
          toast.error(
            `Invalid mark for ${student.name} - ${map.courseOutcome.code}. Must be between 0 and ${map.maxMarks}.`
          );
          validationPassed = false;
          return;
        }

        marksBreakdown.push({
          courseOutcome: coId,
          marksObtained: mark,
          maxMarks: map.maxMarks,
        });
        totalMarks += mark;
      });

      if (validationPassed) {
        resultsToSave.push({
          student: student._id,
          assessment: selectedAssessment._id,
          subject: subject,
          academicYear: academicYear,
          sem: filterSem || selectedAssessment.sem,
          marksBreakdown: marksBreakdown,
          totalMarksObtained: totalMarks,
        });
      }
    });

    if (!validationPassed) {
      setIsSaving(false);
      return;
    }

    try {
      console.log("Submitting Marks:", resultsToSave);
      
      // API call to save marks
      const response = await axios.post("/api/v2/obe/student-results/bulk", {
        results: resultsToSave,
      });

      console.log("Save response:", response.data);
      toast.success("Marks saved successfully!");
      
      // Refresh existing marks to confirm save
      await fetchExistingMarks(selectedAssessment._id);
    } catch (error) {
      console.error("Error saving marks:", error);
      toast.error(`Error saving marks: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [
    selectedAssessment,
    subject,
    students,
    marksData,
    academicYear,
    filterSem,
    fetchExistingMarks,
  ]);

  return (
    <div className="p-4 md:p-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Marks Entry</h1>
          {subject && academicYear && (
            <p className="text-gray-500">
              Year: {academicYear} | Semester: {filterSem || "All"}
            </p>
          )}
          {!subject && academicYear && (
            <p className="text-gray-500">
              Year: {academicYear} | Semester: {filterSem || "All"} | Please select a subject.
            </p>
          )}
          {!academicYear && (
            <p className="text-gray-500">Select Academic Year and Subject to view assessments.</p>
          )}
        </div>
      </div>

      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border flex flex-wrap gap-4 items-center">
        {/* Academic Year Select */}
        <Select
          placeholder="Select Academic Year"
          variant="bordered"
          selectedKeys={academicYear ? new Set([academicYear]) : new Set()}
          onSelectionChange={handleAcademicYearChange}
          startContent={<CalendarIcon size={18} className="text-indigo-600" />}
          className="max-w-xs"
          classNames={{
            trigger: "bg-white border-slate-200 rounded-lg shadow-sm hover:border-indigo-400 transition-all",
            label: "text-slate-700 font-medium",
          }}
        >
          {academicYearOptions.map((year) => (
            <SelectItem key={year.key} value={year.value} className="text-slate-900">
              {year.label}
            </SelectItem>
          ))}
        </Select>

        {/* Semester Select */}
        <Select
          label="Semester"
          placeholder="Filter by Semester"
          selectedKeys={filterSem ? new Set([filterSem]) : new Set()}
          onSelectionChange={handleFilterSemChange}
          className="max-w-xs"
          isDisabled={!academicYear}
        >
          <SelectItem key="sem1" value="sem1">
            sem1
          </SelectItem>
          <SelectItem key="sem2" value="sem2">
            sem2
          </SelectItem>
        </Select>

        {/* Subject Dropdown */}
        <SubjectDropdown
          instituteId={user?.institute?._id}
          department={user?.department}
          academicYear={academicYear}
          onSelect={handleSubjectChange}
          facultyId={user?._id}
          selectedSubject={subject}
          label="Subject"
          semester={filterSem}
          className="max-w-xs"
          isDisabled={!academicYear}
          classNames={{
            base: "bg-white border-slate-200 rounded-lg shadow-sm hover:border-indigo-400 transition-all",
            label: "text-slate-700 font-medium",
          }}
        />

        {/* Assessment Select */}
        <Select
          label="Assessment"
          placeholder="Select Assessment"
          selectedKeys={selectedAssessment ? new Set([selectedAssessment._id]) : new Set()}
          onSelectionChange={handleAssessmentChange}
          className="max-w-xs"
          isDisabled={!subject || isLoadingAssessments}
          isLoading={isLoadingAssessments}
        >
          {assessments.map((assessment) => (
            <SelectItem key={assessment._id} value={assessment._id} className="text-slate-900">
              {assessment.name} ({assessment.type})
            </SelectItem>
          ))}
        </Select>

        {/* Clear Filters Button */}
        {(academicYear || filterSem || subject) && (
          <Button
            size="sm"
            onPress={() => {
              setAcademicYear("");
              setFilterSem("");
              setSubject(null);
              setSelectedAssessment(null);
              setAssessments([]);
              setStudents([]);
              setMarksData({});
            }}
            color="secondary"
            variant="flat"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Loading Students */}
      {isLoadingStudents && subject && (
        <div className="flex justify-center py-8">
          <Spinner label="Loading students..." />
        </div>
      )}

      {/* No Academic Year Selected */}
      {!academicYear && (
        <p className="text-gray-500 py-8 text-center">Please select an Academic Year.</p>
      )}

      {/* No Subject Selected */}
      {academicYear && !subject && (
        <p className="text-gray-500 py-8 text-center">Please select a Subject.</p>
      )}

      {/* No Assessment Selected */}
      {subject && !selectedAssessment && !isLoadingStudents && !isLoadingAssessments && (
        <p className="text-gray-500 py-8 text-center">Please select an Assessment to enter marks.</p>
      )}

      {/* No Students Found */}
      {subject && selectedAssessment && students.length === 0 && !isLoadingStudents && (
        <p className="text-gray-500 py-8 text-center">No students found for the selected subject.</p>
      )}

      {/* Marks Entry Table */}
      {selectedAssessment && students.length > 0 && !isLoadingStudents && (
        <>
          <div className="mb-4 bg-white p-4 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-2">
              {selectedAssessment.name} - {selectedAssessment.type}
            </h2>
            <p className="text-sm text-gray-600">
              Max Marks: {selectedAssessment.maxMarks} | Date:{" "}
              {selectedAssessment.assessmentDate
                ? new Date(selectedAssessment.assessmentDate).toLocaleDateString()
                : "Not specified"}
            </p>
            {!existingMarksLoaded && (
              <div className="mt-2">
                <Spinner size="sm" /> <span className="text-sm ml-2">Loading existing marks...</span>
              </div>
            )}
          </div>

          <Table aria-label="Marks Entry Table" className="overflow-x-auto">
            <TableHeader>
              <TableColumn key="rollNo">Roll No</TableColumn>
              <TableColumn key="studentName">Student Name</TableColumn>
              {/* CO Mapping Columns */}
              {selectedAssessment.coMapping?.map((map) => (
                <TableColumn key={map.courseOutcome._id} className="text-center">
                  {map.courseOutcome?.code || `CO${map.coIndex}`} ({map.maxMarks})
                </TableColumn>
              ))}
              <TableColumn key="total" className="text-center font-semibold">
                Total / {selectedAssessment.maxMarks}
              </TableColumn>
            </TableHeader>

            <TableBody items={students} emptyContent="No students found">
              {(student) => (
                <TableRow key={student._id}>
                  <TableCell>{student.rollNumber}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  {/* Input fields for each CO */}
                  {selectedAssessment.coMapping?.map((map) => (
                    <TableCell key={map.courseOutcome._id} className="min-w-[80px]">
                      <Input
                        type="number"
                        aria-label={`Mark for ${student.name} - ${map.courseOutcome?.code || `CO${map.coIndex}`}`}
                        size="sm"
                        variant="bordered"
                        value={marksData[student._id]?.[map.courseOutcome._id] ?? ""}
                        onChange={(e) => handleMarkChange(student._id, map.courseOutcome._id, e.target.value)}
                        min="0"
                        max={map.maxMarks}
                        step="0.5"
                        isDisabled={isSaving}
                        placeholder="0"
                        classNames={{
                          inputWrapper: "bg-white",
                        }}
                      />
                    </TableCell>
                  ))}
                  {/* Total marks */}
                  <TableCell className="text-center font-semibold">
                    {calculateStudentTotal(student._id)?.toFixed(1)}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="mt-6 flex justify-end">
            <Button
              color="primary"
              onPress={handleSaveMarks}
              isLoading={isSaving}
              isDisabled={isSaving || !existingMarksLoaded}
            >
              Save Marks
            </Button>
          </div>
        </>
      )}
    </div>
  );
}