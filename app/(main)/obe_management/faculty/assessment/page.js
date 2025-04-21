// app/obe/faculty/assessments/page.jsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
    Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure,
    Input, Select, SelectItem, Chip, Spinner, Pagination, Tooltip, DatePicker, // Added DatePicker
    Popover, PopoverTrigger, PopoverContent, Listbox, ListboxItem, InputProps // For CO Mapping display/input
} from "@nextui-org/react";
import { PlusIcon, EditIcon, DeleteIcon, SearchIcon, AlertCircleIcon } from 'lucide-react';
import axios from 'axios';
import { useUser } from '@/app/context/UserContext'; // Adjust path
import { toast } from 'sonner';
import { parseDate, getLocalTimeZone, today, CalendarDate } from "@internationalized/date"; // For DatePicker
import { SubjectDropdown } from '@/app/components/subject/SubjectDropdown';
import { I18nProvider } from '@react-aria/i18n'; // For DatePicker locale



const ASSESSMENT_TYPES = ['Exam', 'Quiz', 'Assignment', 'Lab', 'Project', 'Presentation', 'Other'];

// --- Reusable Assessment Form Component ---
function AssessmentForm({ assessment, subject, courseOutcomes, onSubmit, onClose, isLoading }) {
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        maxMarks: '',
        assessmentDate: null, // Use null for DatePicker state
        coMapping: [] // Structure: [{ courseOutcome: 'coId', maxMarks: number }]
    });
    const [coMappingErrors, setCoMappingErrors] = useState({});
    const [totalMappedMarks, setTotalMappedMarks] = useState(0);
    const [errors, setErrors] = useState({}); // For main form fields


    // Initialize form when assessment or COs change
    useEffect(() => {
        if (assessment) {
            setFormData({
                name: assessment.name || '',
                type: assessment.type || '',
                maxMarks: assessment.maxMarks?.toString() || '',
                assessmentDate: assessment.assessmentDate ? parseDate(assessment.assessmentDate.split('T')[0]) : null, // Parse ISO string date part
                // Map existing CO mapping data
                coMapping: assessment.coMapping?.map(m => ({
                    courseOutcome: m.courseOutcome?._id || m.courseOutcome, // Handle populated/unpopulated
                    maxMarks: m.maxMarks || 0
                })) || []
            });
        } else {
            // Reset for new assessment, pre-populate coMapping with all COs having 0 marks
             setFormData({
                name: '', type: '', maxMarks: '', assessmentDate: null,
                coMapping: courseOutcomes.map(co => ({ courseOutcome: co._id, maxMarks: 0 }))
            });
        }
        setErrors({});
        setCoMappingErrors({});
    }, [assessment, courseOutcomes]); // Rerun when assessment or available COs change

    // Calculate total mapped marks whenever coMapping changes
     useEffect(() => {
        const total = formData.coMapping.reduce((sum, item) => sum + (Number(item.maxMarks) || 0), 0);
        setTotalMappedMarks(total);

        // Clear mapping sum error if it matches maxMarks now
        if (errors.coMappingSum && total === Number(formData.maxMarks)) {
            setErrors(prev => ({ ...prev, coMappingSum: null }));
        }
    }, [formData.coMapping, formData.maxMarks, errors.coMappingSum]); // Dependency needed

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) { // Clear error on change
            setErrors(prev => ({ ...prev, [name]: null }));
        }
        // If maxMarks changes, clear coMappingSum error as it needs revalidation on submit
        if (name === 'maxMarks' && errors.coMappingSum) {
             setErrors(prev => ({ ...prev, coMappingSum: null }));
        }
    };

     const handleDateChange = (dateValue) => {
        setFormData(prev => ({ ...prev, assessmentDate: dateValue }));
         if (errors.assessmentDate) {
            setErrors(prev => ({ ...prev, assessmentDate: null }));
        }
    };

    const handleCoMarkChange = (coId, value) => {
        const markValue = value === '' ? '' : Number(value); // Allow empty string, otherwise convert to number
        setFormData(prev => ({
            ...prev,
            coMapping: prev.coMapping.map(item =>
                item.courseOutcome === coId ? { ...item, maxMarks: markValue } : item
            )
        }));

         // Basic validation for the specific input
        if (markValue !== '' && (isNaN(markValue) || markValue < 0)) {
            setCoMappingErrors(prev => ({ ...prev, [coId]: "Marks must be a non-negative number." }));
        } else {
             setCoMappingErrors(prev => ({ ...prev, [coId]: null })); // Clear error
        }
         // Clear the sum error if it exists, it will be rechecked on submit
         if (errors.coMappingSum) {
             setErrors(prev => ({ ...prev, coMappingSum: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        let newCoErrors = {...coMappingErrors}; // Preserve existing individual CO errors
        let isValid = true;

        if (!formData.name.trim()) newErrors.name = "Assessment Name is required.";
        if (!formData.type) newErrors.type = "Assessment Type is required.";
        if (formData.maxMarks === '' || isNaN(Number(formData.maxMarks)) || Number(formData.maxMarks) < 0) {
             newErrors.maxMarks = "Total Max Marks must be a non-negative number.";
        }
        // assessmentDate is optional? If required:
        // if (!formData.assessmentDate) newErrors.assessmentDate = "Assessment Date is required.";

        // Validate individual CO marks
        formData.coMapping.forEach(item => {
             if (item.maxMarks === '' || isNaN(Number(item.maxMarks)) || Number(item.maxMarks) < 0) {
                 newCoErrors[item.courseOutcome] = "Marks required (non-negative number).";
                 isValid = false;
             }
        });

        // Validate sum of CO marks against total max marks
        const currentTotalMaxMarks = Number(formData.maxMarks);
        if (!isNaN(currentTotalMaxMarks) && currentTotalMaxMarks >= 0 && Math.abs(totalMappedMarks - currentTotalMaxMarks) > 0.01) { // Use tolerance for float issues
             newErrors.coMappingSum = `Sum of marks mapped to COs (${totalMappedMarks.toFixed(2)}) must equal Total Max Marks (${currentTotalMaxMarks}). Difference: ${(totalMappedMarks - currentTotalMaxMarks).toFixed(2)}`;
             isValid = false;
        }

        setErrors(newErrors);
        setCoMappingErrors(newCoErrors); // Update CO-specific errors
        return isValid && Object.keys(newErrors).length === 0; // Check both general and CO errors
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
             // Filter out coMapping items where marks are effectively zero or empty string before submit
            const finalCoMapping = formData.coMapping
                .map(item => ({ ...item, maxMarks: Number(item.maxMarks) || 0 })) // Ensure number type
                .filter(item => item.maxMarks > 0); // Only include mappings with marks > 0? Or allow 0? Let's allow 0 for now.

            if (finalCoMapping.length === 0) {
                 toast.error("At least one Course Outcome must be mapped with marks greater than 0.");
                 setErrors(prev => ({...prev, coMappingSum: "At least one CO mapping with marks > 0 is required."}));
                 return;
            }

            const dataToSubmit = {
                ...formData,
                maxMarks: Number(formData.maxMarks),
                // Format date to YYYY-MM-DD string or keep as object if API handles it
                assessmentDate: formData.assessmentDate ? formData.assessmentDate.toString() : null,
                coMapping: finalCoMapping,
                subject: subject._id, // Add subject ID
                academicYear: subject.academicYear, // Add context
                sem: subject.sem // Add context
            };
            onSubmit(dataToSubmit);
        } else {
            toast.error("Please fix the errors in the form.");
        }
    };

    return (
         // Important: Wrap DatePicker in I18nProvider for locale handling
        <I18nProvider locale="en-IN"> {/* Adjust locale as needed */}
            <form onSubmit={handleSubmit}>
                <ModalBody className="max-h-[70vh] overflow-y-auto">
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
                            name="type"
                            selectedKeys={formData.type ? [formData.type] : []}
                            onChange={handleInputChange}
                            variant="bordered"
                            isRequired
                             isInvalid={!!errors.type}
                            errorMessage={errors.type}
                        >
                            {ASSESSMENT_TYPES.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                        </Select>
                        <Input
                            label="Total Max Marks"
                            name="maxMarks"
                            type="number"
                            min="0"
                            step="0.5" // Allow decimal marks if needed
                            value={formData.maxMarks}
                            onChange={handleInputChange}
                            placeholder="e.g., 50"
                            variant="bordered"
                            isRequired
                            isInvalid={!!errors.maxMarks || !!errors.coMappingSum} // Show error state if sum mismatch too
                            errorMessage={errors.maxMarks} // Specific field error
                        />
                        <DatePicker
                            label="Assessment Date (Optional)"
                            name="assessmentDate"
                            value={formData.assessmentDate}
                            onChange={handleDateChange}
                            variant="bordered"
                            granularity="day"
                             minValue={today(getLocalTimeZone()).subtract({ years: 1 })} // Example constraint
                             maxValue={today(getLocalTimeZone()).add({ years: 1 })} // Example constraint
                            isInvalid={!!errors.assessmentDate}
                            errorMessage={errors.assessmentDate}
                         />
                    </div>

                    {/* CO Mapping Section */}
                     <div className="mt-6">
                         <h3 className="text-lg font-semibold mb-2 text-gray-700">Course Outcome Mapping</h3>
                          {errors.coMappingSum && <p className="text-danger text-sm mb-2 p-2 bg-danger-50 rounded-md border border-danger-200">{errors.coMappingSum}</p>}

                        {courseOutcomes.length === 0 ? (
                             <p className='text-center text-gray-500 p-4 border rounded-md'>No Course Outcomes defined for this subject.</p>
                        ) : (
                             <div className="border rounded-lg p-4 max-h-80 overflow-y-auto space-y-3">
                                {courseOutcomes.map(co => {
                                    const mappingItem = formData.coMapping.find(item => item.courseOutcome === co._id);
                                    const itemError = coMappingErrors[co._id];
                                    return (
                                        <div key={co._id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 border-b pb-3 last:border-none">
                                            <div className='flex-grow'>
                                                 <Tooltip content={co.description} placement='top-start' delay={300}>
                                                    <p className='font-medium text-sm'>
                                                        <Chip size='sm' variant='flat' className='mr-2'>{co.code}</Chip>
                                                        {co.description}
                                                    </p>
                                                </Tooltip>
                                            </div>
                                            <Input
                                                aria-label={`Marks for ${co.code}`}
                                                type="number"
                                                min="0"
                                                step="0.5" // Match step with maxMarks?
                                                placeholder="Marks"
                                                variant="bordered"
                                                size="sm"
                                                className="w-full sm:w-28 flex-shrink-0 mt-1 sm:mt-0"
                                                value={mappingItem?.maxMarks ?? ''} // Use empty string if 0 or undefined
                                                onValueChange={(value) => handleCoMarkChange(co._id, value)}
                                                isInvalid={!!itemError}
                                                errorMessage={itemError}
                                            />
                                        </div>
                                    );
                                })}
                             </div>
                         )}
                        <p className="text-right text-sm mt-2 font-medium text-gray-600">
                             Total Mapped Marks: {totalMappedMarks.toFixed(2)} / {Number(formData.maxMarks) || 0}
                        </p>
                    </div>


                </ModalBody>
                <ModalFooter>
                    <Button color="danger" variant="light" onPress={onClose}>
                        Cancel
                    </Button>
                    <Button color="primary" type="submit" isLoading={isLoading} isDisabled={isLoading || courseOutcomes.length === 0}>
                        {assessment ? 'Save Changes' : 'Add Assessment'}
                    </Button>
                </ModalFooter>
            </form>
        </I18nProvider>
    );
}
// --- End Assessment Form Component ---


// --- Main Page Component ---
export default function ManageAssessmentsPage() {
    const { user } = useUser();
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null); // Stores whole subject object
    const [assessments, setAssessments] = useState([]);
    const [courseOutcomes, setCourseOutcomes] = useState([]); // COs for the selected subject
    const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
    const [isLoadingAssessments, setIsLoadingAssessments] = useState(false);
    const [isLoadingCOs, setIsLoadingCOs] = useState(false); // Need to load COs for the form
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
   
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 8;

    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const [currentAssessment, setCurrentAssessment] = useState(null); // For editing/adding

    // Memoized loading state
    const isLoading = isLoadingSubjects || isLoadingAssessments || isLoadingCOs;

    // --- Data Fetching Callbacks ---
    const [filters, setFilters] = useState({
        subject: '',
        academicYear: user?.currentYear || '',
        sem: user?.sem || '',
        instituteId: user?.institute?._id || ''
      });
     
      
      

    const fetchAssessments = useCallback(async () => {
        if (!selectedSubject?._id) return;
        setIsLoadingAssessments(true); setError(null);
        try {
            const response = await axios.get(`/api/obe/assessments`, {
                params: {
                    subjectId: selectedSubject._id,
                    academicYear: selectedSubject.academicYear,
                    sem: selectedSubject.sem
                 }
            });
            setAssessments(response.data.data || []);
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to fetch assessments.";
            setError(errorMsg); toast.error(errorMsg); console.error(err);
        } finally { setIsLoadingAssessments(false); }
    }, [selectedSubject]);

    const fetchCourseOutcomesForSubject = useCallback(async () => {
         if (!selectedSubject?._id) return;
        setIsLoadingCOs(true); setError(null);
        try {
            const response = await axios.get(`/api/obe/course-outcomes`, {
                params: { subjectId: selectedSubject._id }
            });
            setCourseOutcomes(response.data.data || []);
             if (!response.data.data || response.data.data.length === 0) {
                 toast.error("No Course Outcomes found for this subject. Please define COs before creating assessments.", { id: 'no-co-toast' });
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to fetch course outcomes for mapping.";
            setError(errorMsg); toast.error(errorMsg); console.error(err);
            setCourseOutcomes([]); // Clear on error
        } finally { setIsLoadingCOs(false); }
    }, [selectedSubject]);

    // --- Effects ---
    useEffect(() => { fetchSubjects(); }, [fetchSubjects]);

    useEffect(() => {
        if (selectedSubject) {
            fetchAssessments();
            fetchCourseOutcomesForSubject();
            setCurrentPage(1); // Reset page on subject change
        } else {
            setAssessments([]);
            setCourseOutcomes([]);
        }
    }, [selectedSubject, fetchAssessments, fetchCourseOutcomesForSubject]);

    // --- Event Handlers ---
    const handleSubjectChange = (subjectId) => {
        const subject = subjects.find(s => s._id === subjectId);
        setSelectedSubject(subject);
    };

    const handleOpenModal = (assessment = null) => {
        if (!selectedSubject) { toast.error("Please select a subject first."); return; }
         if (courseOutcomes.length === 0) {
            toast.error("Cannot add/edit assessment. No Course Outcomes defined for this subject.");
            return;
        }
        setCurrentAssessment(assessment);
        onOpen();
    };

    const handleSaveAssessment = async (formData) => {
        setIsSubmitting(true);
        const toastId = toast.loading(currentAssessment ? 'Updating assessment...' : 'Adding assessment...');
        try {
            let response;
            if (currentAssessment?._id) {
                response = await axios.put(`/api/obe/assessments/${currentAssessment._id}`, formData);
                toast.success('Assessment updated!', { id: toastId });
            } else {
                response = await axios.post('/api/obe/assessments', formData);
                toast.success('Assessment added!', { id: toastId });
            }
            onClose();
            fetchAssessments(); // Refresh list
        } catch (err) {
            const errorMsg = err.response?.data?.message || (currentAssessment ? "Failed to update." : "Failed to add.");
            const validationErrors = err.response?.data?.errors;
            toast.error(`${errorMsg}${validationErrors ? `: ${Object.values(validationErrors).map(e => e.message).join(', ')}` : ''}`, { id: toastId });
            console.error("Save Assessment Error:", err);
        } finally { setIsSubmitting(false); }
    };

    const handleDelete = async (assessmentId) => {
        if (!confirm('Are you sure you want to delete this Assessment? This may affect existing student results.')) return;
        const toastId = toast.loading('Deleting assessment...');
        try {
            await axios.delete(`/api/obe/assessments/${assessmentId}`);
            toast.success('Assessment deleted!', { id: toastId });
            fetchAssessments(); // Refresh list
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to delete assessment.";
            toast.error(errorMsg, { id: toastId });
            console.error("Delete Assessment Error:", err);
        }
    };

    // --- Filtering and Pagination ---
    const filteredAssessments = useMemo(() => {
        if (!searchTerm) return assessments;
        return assessments.filter(a =>
            a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.type.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [assessments, searchTerm]);

    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredAssessments.slice(start, end);
    }, [filteredAssessments, currentPage, rowsPerPage]);

    const totalPages = Math.ceil(filteredAssessments.length / rowsPerPage);

    // --- Render Logic ---
    return (
        <div className="p-4 md:p-8">
            <h1 className="text-2xl font-bold mb-6 text-gray-700">Manage Assessments</h1>

            {/* Subject Selection & Controls */}
            <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-wrap gap-4 items-end justify-between">
                    {/* Subject Selector (same as CO page) */}
                    <SubjectDropdown
  facultyId={user?.id}
  instituteId={filters.instituteId}
  academicYear={filters.academicYear}
  sem={filters.sem}
  selectedSubject={filters.subject}
  onSelect={(subjectId, subjectObj) => {
    setFilters((prev) => ({ ...prev, subject: subjectId }));
    setSelectedSubject(subjectObj);
  }}
/>
            

                    <Input
                        isClearable className="w-full sm:max-w-xs flex-grow" placeholder="Search Assessments..."
                        startContent={<SearchIcon size={18} className="text-gray-400" />}
                        value={searchTerm} onClear={() => setSearchTerm("")} onValueChange={setSearchTerm}
                        variant='bordered' isDisabled={!selectedSubject}
                    />
                    <Button
                        color="primary" startContent={<PlusIcon size={18} />}
                        onPress={() => handleOpenModal()}
                        isDisabled={!selectedSubject || isLoading || courseOutcomes.length === 0} // Disable if loading or no COs
                    >
                        Add New Assessment
                    </Button>
                </div>
                 {error && <div className="mt-3 text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">{error}</div>}
                  {!isLoading && selectedSubject && courseOutcomes.length === 0 && (
                     <p className="mt-3 text-orange-600 text-sm bg-orange-50 p-2 rounded border border-orange-200">
                         Warning: No Course Outcomes are defined for this subject. You must define COs before adding assessments.
                     </p>
                 )}
            </div>

            {/* Assessments Table */}
            {(isLoadingAssessments || isLoadingCOs) && selectedSubject && <div className='flex justify-center p-10'><Spinner label="Loading data..." /></div>}

            {!isLoadingAssessments && !isLoadingCOs && selectedSubject && (
                <>
                     {paginatedItems.length > 0 ? (
                        <Table
                            aria-label="Assessments Table"
                            bottomContent={totalPages > 1 ? (
                                <div className="flex w-full justify-center"><Pagination isCompact showControls showShadow color="primary" page={currentPage} total={totalPages} onChange={setCurrentPage} /></div>
                            ) : null}
                            classNames={{ wrapper: "min-h-[222px]" }}
                        >
                            <TableHeader>
                                <TableColumn key="name">Name</TableColumn>
                                <TableColumn key="type">Type</TableColumn>
                                <TableColumn key="maxMarks">Max Marks</TableColumn>
                                <TableColumn key="date">Date</TableColumn>
                                <TableColumn key="coMapping">CO Mapping (Marks)</TableColumn>
                                <TableColumn key="actions" align="center">Actions</TableColumn>
                            </TableHeader>
                            <TableBody items={paginatedItems} emptyContent={"No assessments match your search."}>
                                {(item) => (
                                    <TableRow key={item._id}>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell><Chip size='sm' variant='flat' color='default'>{item.type}</Chip></TableCell>
                                        <TableCell>{item.maxMarks}</TableCell>
                                        <TableCell>{item.assessmentDate ? new Date(item.assessmentDate).toLocaleDateString('en-IN') : 'N/A'}</TableCell>
                                        <TableCell>
                                             {/* Popover to show detailed CO mapping */}
                                            <Popover placement="left">
                                                <PopoverTrigger>
                                                    <Button size='sm' variant='light' className='text-primary underline text-xs p-0 h-auto'>
                                                         {item.coMapping?.length || 0} Mapped
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className='max-w-xs'>
                                                    <div className="px-1 py-2">
                                                        <div className="text-small font-bold mb-1">Mapped COs & Marks</div>
                                                        <Listbox aria-label="CO Mapping Details" variant='flat' className='p-0'>
                                                              {item.coMapping?.length > 0 ? item.coMapping.map((map, index) => (
                                                                 <ListboxItem key={index} textValue={`${map.courseOutcome?.code}: ${map.maxMarks}`} className='p-1 m-0 text-xs'>
                                                                    <div className='flex justify-between'>
                                                                        <span>{map.courseOutcome?.code || 'N/A'}</span>
                                                                        <span>{map.maxMarks} Marks</span>
                                                                    </div>
                                                                    <p className='text-tiny text-gray-500 truncate'>{map.courseOutcome?.description}</p>
                                                                 </ListboxItem>
                                                             )) : <ListboxItem key="none" className='p-1 m-0 text-xs text-gray-500'>No COs mapped</ListboxItem>}
                                                         </Listbox>
                                                     </div>
                                                 </PopoverContent>
                                             </Popover>
                                        </TableCell>
                                        <TableCell>
                                            <div className="relative flex items-center gap-1">
                                                <Tooltip content="Edit Assessment">
                                                    <Button isIconOnly size="sm" variant="light" onPress={() => handleOpenModal(item)} isDisabled={courseOutcomes.length === 0}>
                                                        <EditIcon className="text-default-500" size={18}/>
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip content="Delete Assessment" color="danger">
                                                    <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => handleDelete(item._id)}>
                                                        <DeleteIcon size={18} />
                                                    </Button>
                                                </Tooltip>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                      ) : (
                         // Empty state messages
                         searchTerm && <p className="text-center text-gray-500 mt-10">No assessments match your search "{searchTerm}".</p>,
                         !searchTerm && <p className="text-center text-gray-500 mt-10">No assessments found for this subject. Click "Add New Assessment" to create one.</p>
                      )}
                </>
            )}

             {/* Empty States when no subject selected */}
             {!selectedSubject && !isLoadingSubjects && (
                 <p className="text-center text-gray-500 mt-10">Please select a subject to manage assessments.</p>
             )}
            {!selectedSubject && (
  <p className="text-center text-warning-600 mt-10">Please select a subject to manage assessments.</p>
)}



            {/* Add/Edit Modal */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="4xl" placement="top-center" backdrop="blur" scrollBehavior="inside">
                 <ModalContent>
                    {(modalOnClose) => (
                         <>
                            <ModalHeader className="flex flex-col gap-1 border-b pb-2">
                                {currentAssessment ? `Edit Assessment (${currentAssessment.name})` : 'Add New Assessment'}
                                {selectedSubject && <span className='text-sm font-normal text-gray-500'>Subject: {selectedSubject.name}</span>}
                            </ModalHeader>
                             {/* Render the form component */}
                            <AssessmentForm
                                assessment={currentAssessment}
                                subject={selectedSubject} // Pass the whole subject object
                                courseOutcomes={courseOutcomes}
                                onSubmit={handleSaveAssessment}
                                onClose={modalOnClose}
                                isLoading={isSubmitting}
                             />
                         </>
                     )}
                 </ModalContent>
            </Modal>

        </div>
    );
}