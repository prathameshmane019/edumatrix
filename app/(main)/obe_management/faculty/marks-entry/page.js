// app/obe/faculty/marks-entry/page.jsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button, Select, SelectItem, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, Spinner, Chip } from '@nextui-org/react';
import axios from 'axios';
import { toast } from 'sonner';
import { useUser } from '@/app/context/UserContext';

export default function MarksEntryPage() {
    const { user } = useUser();
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [assessments, setAssessments] = useState([]);
    const [selectedAssessment, setSelectedAssessment] = useState(null); // Stores full assessment object
    const [students, setStudents] = useState([]); // Students in the subject/class/batch
    const [marksData, setMarksData] = useState({}); // Structure: { studentId: { coId: mark } }
    const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
    const [isLoadingAssessments, setIsLoadingAssessments] = useState(false);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    // TODO: Implement fetchSubjects (similar to other pages)
    const fetchSubjects = useCallback(async () => { /* ... */ }, [user]);

    // TODO: Implement fetchAssessmentsForSubject
    const fetchAssessmentsForSubject = useCallback(async () => {
        if (!selectedSubject?._id) return;
        setIsLoadingAssessments(true);
        try {
            // GET /api/obe/assessments?subjectId=... (Only need ID and Name initially)
            // Fetch full assessment details later when one is selected
        } catch (err) { /*...*/ } finally { setIsLoadingAssessments(false); }
    }, [selectedSubject]);

    // TODO: Implement fetchStudentsForSubject (or class/batch)
    const fetchStudentsForSubject = useCallback(async () => {
         if (!selectedSubject?._id) return; // Need subject context
         setIsLoadingStudents(true);
         try {
             // Get students associated with selectedSubject.class or specific batches
             // API might be something like /api/classes/[classId]/students or /api/subjects/[subjectId]/students
             console.log("Fetching students...");
             // Example: setStudents([{_id: 'S101', name: 'Alice', rollNumber: 'R001'}, {_id: 'S102', name: 'Bob', rollNumber: 'R002'}]);
         } catch (err) { /*...*/ } finally { setIsLoadingStudents(false); }
    }, [selectedSubject]);

    // TODO: Implement fetchFullAssessmentDetails when an assessment is selected
    const fetchFullAssessmentDetails = useCallback(async (assessmentId) => {
         if (!assessmentId) return;
         try {
             // GET /api/obe/assessments/[assessmentId]
             // This response should include the detailed coMapping
             const response = await axios.get(`/api/obe/assessments/${assessmentId}`);
             setSelectedAssessment(response.data.data); // Store the full assessment details
             // Initialize marksData based on fetched students and assessment coMapping
             const initialMarks = {};
             students.forEach(student => {
                 initialMarks[student._id] = {};
                 response.data.data?.coMapping?.forEach(map => {
                     initialMarks[student._id][map.courseOutcome._id] = ''; // Default to empty string
                 });
             });
             setMarksData(initialMarks);
             // Potentially fetch existing marks if editing? More complex.
         } catch (err) { /*...*/ }
    }, [students]); // Need students list first

    // --- Effects ---
     useEffect(() => { fetchSubjects(); }, [fetchSubjects]);
     useEffect(() => { fetchAssessmentsForSubject(); fetchStudentsForSubject(); }, [selectedSubject]); // Fetch assessments and students when subject changes
     useEffect(() => {
         if (selectedAssessment?._id) { // If assessment ID is selected (not the full object initially)
            // fetchFullAssessmentDetails(selectedAssessment._id); // Fetch details when ID changes
         } else {
             setSelectedAssessment(null); // Clear details if selection is cleared
             setMarksData({});
         }
     }, [/* dependency on selected assessment ID */]);


    // TODO: Implement handleMarkChange(studentId, coId, value)
    const handleMarkChange = (studentId, coId, value) => {
         const assessmentCoMax = selectedAssessment?.coMapping?.find(m => m.courseOutcome._id === coId)?.maxMarks ?? 0;
         const numericValue = Number(value);
         // Basic validation
         if (value !== '' && (isNaN(numericValue) || numericValue < 0 || numericValue > assessmentCoMax)) {
              toast.error(`Invalid mark for CO. Must be between 0 and ${assessmentCoMax}.`);
              // Optionally revert change or show inline error
              return;
         }
        setMarksData(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [coId]: value // Store as string for input control, convert on save
            }
        }));
    };


    // TODO: Implement handleSaveMarks
    const handleSaveMarks = async () => {
         if (!selectedAssessment || students.length === 0) return;
         setIsSaving(true);
         const resultsToSave = [];
         let validationPassed = true;

         // Validate and structure data for API
        students.forEach(student => {
             const studentMarks = marksData[student._id];
             const marksBreakdown = [];
             let totalMarks = 0;
             selectedAssessment.coMapping.forEach(map => {
                 const coId = map.courseOutcome._id;
                 const markStr = studentMarks[coId];
                 const mark = Number(markStr);
                  if (markStr === '' || isNaN(mark) || mark < 0 || mark > map.maxMarks) {
                     toast.error(`Invalid mark for ${student.name} - ${map.courseOutcome.code}. Please correct.`);
                     validationPassed = false;
                     // Highlight error in table?
                 }
                 if (validationPassed) { // Only add if valid so far
                     marksBreakdown.push({
                         courseOutcome: coId,
                         marksObtained: mark,
                         maxMarks: map.maxMarks // Include max marks for context/validation on backend
                     });
                     totalMarks += mark;
                 }
             });

             if (validationPassed) {
                 resultsToSave.push({
                     student: student._id,
                     assessment: selectedAssessment._id,
                     subject: selectedSubject._id,
                     academicYear: selectedSubject.academicYear,
                     sem: selectedSubject.sem,
                     marksBreakdown: marksBreakdown,
                     totalMarksObtained: totalMarks
                 });
             }
        });

         if (!validationPassed) {
             setIsSaving(false);
             return;
         }

         try {
             // API Call - potentially bulk update/create
             // POST /api/obe/student-results/bulk (or similar)
             // Or loop and POST/PUT /api/obe/student-results individually (less efficient)
             console.log("Submitting Marks:", resultsToSave);
             toast.success("Marks saved successfully!");
             // Optionally clear form or fetch saved marks
         } catch (err) { /* Handle save error */ } finally { setIsSaving(false); }
    };


    return (
        <div className="p-4 md:p-8">
            <h1 className="text-2xl font-bold mb-6">Marks Entry</h1>

            {/* Subject and Assessment Selection */}
             <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border flex flex-wrap gap-4 items-end">
                {/* Select for Subject */}
                {/* Select for Assessment (populated based on selected subject) */}
                <Select label="Select Subject" /* ... */ >{/* ... */}</Select>
                 <Select
                    label="Select Assessment"
                    isDisabled={!selectedSubject || isLoadingAssessments}
                    isLoading={isLoadingAssessments}
                    onChange={(e) => fetchFullAssessmentDetails(e.target.value)} // Fetch details on select
                    /* ... other props */
                >
                     {/* Map assessments state */}
                </Select>
             </div>

             {isLoadingStudents && selectedSubject && <Spinner label="Loading students..." />}
             {!selectedAssessment && selectedSubject && <p>Please select an assessment to enter marks.</p>}

             {/* Marks Entry Table */}
            {selectedAssessment && students.length > 0 && (
                <>
                    <h2 className='text-xl font-semibold mb-2'>{selectedAssessment.name} - Max Marks: {selectedAssessment.maxMarks}</h2>
                    <p className='text-sm text-gray-600 mb-4'>Enter marks obtained by each student for the mapped Course Outcomes.</p>
                    <Table aria-label="Marks Entry Table" className='overflow-x-auto'>
                         <TableHeader>
                            <TableColumn key="rollNo">Roll No</TableColumn>
                            <TableColumn key="studentName">Student Name</TableColumn>
                             {/* Dynamically create columns for each CO in the selected assessment */}
                            {selectedAssessment.coMapping?.map(map => (
                                <TableColumn key={map.courseOutcome._id} className='text-center'>
                                    {map.courseOutcome.code} ({map.maxMarks})
                                </TableColumn>
                            ))}
                            <TableColumn key="total" className='text-center font-semibold'>Total</TableColumn>
                        </TableHeader>
                        <TableBody items={students}>
                            {(student) => {
                                const studentTotal = selectedAssessment.coMapping?.reduce((sum, map) => {
                                     const mark = Number(marksData[student._id]?.[map.courseOutcome._id] || 0);
                                     return sum + (isNaN(mark) ? 0 : mark);
                                }, 0);
                                return (
                                    <TableRow key={student._id}>
                                        <TableCell>{student.rollNumber}</TableCell>
                                        <TableCell>{student.name}</TableCell>
                                        {/* Input fields for each CO */}
                                        {selectedAssessment.coMapping?.map(map => (
                                            <TableCell key={map.courseOutcome._id} className='min-w-[80px]'>
                                                 <Input
                                                    type="number"
                                                    aria-label={`Mark for ${student.name} - ${map.courseOutcome.code}`}
                                                    size="sm"
                                                    variant="bordered"
                                                    value={marksData[student._id]?.[map.courseOutcome._id] ?? ''}
                                                    onChange={(e) => handleMarkChange(student._id, map.courseOutcome._id, e.target.value)}
                                                     // Add validation state based on comparison with map.maxMarks?
                                                    // max={map.maxMarks} // HTML5 max validation
                                                    min="0"
                                                    step="0.5"
                                                />
                                            </TableCell>
                                        ))}
                                         <TableCell className='text-center font-semibold'>
                                             {studentTotal?.toFixed(2)} {/* Display calculated total */}
                                         </TableCell>
                                    </TableRow>
                                );
                            }}
                        </TableBody>
                    </Table>
                    <div className='mt-6 flex justify-end'>
                        <Button color="primary" onPress={handleSaveMarks} isLoading={isSaving} isDisabled={isSaving}>
                            Save Marks
                        </Button>
                    </div>
                </>
            )}
             {selectedAssessment && students.length === 0 && !isLoadingStudents && (
                 <p className='text-center text-gray-500 mt-10'>No students found for the selected subject/class/batch.</p>
             )}

        </div>
    );
}