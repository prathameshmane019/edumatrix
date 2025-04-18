// app/obe/faculty/course-outcomes/page.jsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
    Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure,
    Input, Textarea, Select, SelectItem, Chip, Spinner, Pagination, Tooltip, // Added Tooltip
    CheckboxGroup, Checkbox, // Added for PO Mapping
    Popover, PopoverTrigger, PopoverContent // Added for PO details maybe
} from "@nextui-org/react";
import { PlusIcon, EditIcon, DeleteIcon, SearchIcon, InfoIcon } from 'lucide-react';
import axios from 'axios'; // Using axios
import { useUser } from '@/app/context/UserContext'; // Adjust path if needed
import { toast } from 'sonner';

const COGNITIVE_LEVELS = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create', 'N/A'];
const CORRELATION_LEVELS = [
    { value: 3, label: '3 (High)' },
    { value: 2, label: '2 (Medium)' },
    { value: 1, label: '1 (Low)' }
];

// --- Reusable Course Outcome Form Component ---
function CourseOutcomeForm({ outcome, subjectId, programOutcomes, onSubmit, onClose, isLoading }) {
    const [formData, setFormData] = useState({
        code: outcome?.code || '',
        description: outcome?.description || '',
        cognitiveLevel: outcome?.cognitiveLevel || 'N/A',
        poMapping: outcome?.poMapping || [] // Structure: [{ programOutcome: 'poId', correlationLevel: 1/2/3 }]
    });
    const [errors, setErrors] = useState({});

    // Initialize form data when outcome changes (for editing)
    useEffect(() => {
        setFormData({
            code: outcome?.code || '',
            description: outcome?.description || '',
            cognitiveLevel: outcome?.cognitiveLevel || 'N/A',
            // Ensure poMapping is in the right format for the form state
            poMapping: outcome?.poMapping?.map(m => ({
                programOutcome: m.programOutcome?._id || m.programOutcome, // Handle populated/unpopulated ID
                correlationLevel: m.correlationLevel
            })) || []
        });
        setErrors({}); // Clear errors when modal opens/outcome changes
    }, [outcome]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) { // Clear error on change
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

     const handlePoSelectionChange = (poId, isChecked) => {
        setFormData(prev => {
            let newMapping = [...prev.poMapping];
            if (isChecked) {
                // Add PO with default correlation level 1 if not already present
                if (!newMapping.some(m => m.programOutcome === poId)) {
                    newMapping.push({ programOutcome: poId, correlationLevel: 1 }); // Default to Low
                }
            } else {
                // Remove PO
                newMapping = newMapping.filter(m => m.programOutcome !== poId);
            }
             if (errors.poMapping) { // Clear error on change
                setErrors(prev => ({ ...prev, poMapping: null }));
            }
            return { ...prev, poMapping: newMapping };
        });
    };

    const handleCorrelationChange = (poId, level) => {
         const correlationValue = parseInt(level, 10); // Ensure it's a number
          if (isNaN(correlationValue)) return; // Ignore if not a number

        setFormData(prev => {
            const newMapping = prev.poMapping.map(m =>
                m.programOutcome === poId ? { ...m, correlationLevel: correlationValue } : m
            );
            return { ...prev, poMapping: newMapping };
        });
    };

    const validateForm = () => {
         const newErrors = {};
         if (!formData.code.trim()) newErrors.code = "CO Code is required.";
         // Add more specific code format validation if needed (e.g., CXXX.Y)
         if (!formData.description.trim()) newErrors.description = "Description is required.";
         if (formData.poMapping.length === 0) {
             newErrors.poMapping = "At least one Program Outcome must be mapped.";
         } else {
             // Check if all selected POs have a valid correlation level (should be handled by select default)
             // No explicit check needed here if Select always has a value
         }

         setErrors(newErrors);
         return Object.keys(newErrors).length === 0; // True if no errors
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit({
                ...formData,
                subject: subjectId // Add subject ID before submitting
            });
        } else {
             toast.error("Please fix the errors in the form.");
        }
    };


    return (
        <form onSubmit={handleSubmit}>
            <ModalBody className="max-h-[70vh] overflow-y-auto">
                <Input
                    label="Course Outcome Code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="e.g., C201.1"
                    variant="bordered"
                    isRequired
                    isInvalid={!!errors.code}
                    errorMessage={errors.code}
                    // Disable code editing for existing outcomes
                    isDisabled={!!outcome}
                    description={!!outcome ? "CO Code cannot be changed after creation." : "Unique code for this outcome within the subject."}
                />
                <Textarea
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe what the student should be able to do..."
                    variant="bordered"
                    isRequired
                    isInvalid={!!errors.description}
                    errorMessage={errors.description}
                    minRows={3}
                    maxRows={6}
                />
                <Select
                    label="Cognitive Level (Bloom's Taxonomy)"
                    name="cognitiveLevel"
                    selectedKeys={[formData.cognitiveLevel]}
                    onChange={handleInputChange}
                    variant="bordered"
                >
                    {COGNITIVE_LEVELS.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                </Select>

                <div className='mt-4'>
                     <label className="block text-sm font-medium text-foreground pb-2">
                         Program Outcome Mapping <span className="text-danger">*</span>
                     </label>
                     {errors.poMapping && <p className="text-tiny text-danger">{errors.poMapping}</p>}

                    {programOutcomes.length === 0 ? (
                        <p className='text-sm text-warning-600 p-3 bg-warning-50 rounded-md'>No Program Outcomes found for this subject's department/year. Please define POs first.</p>
                    ) : (
                        <div className="border rounded-lg p-3 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 max-h-60 overflow-y-auto">
                            {programOutcomes.map(po => {
                                const isSelected = formData.poMapping.some(m => m.programOutcome === po._id);
                                const mapping = formData.poMapping.find(m => m.programOutcome === po._id);

                                return (
                                    <div key={po._id} className="flex flex-col sm:flex-row sm:items-center gap-2 border-b pb-2 last:border-b-0">
                                        <Checkbox
                                             isSelected={isSelected}
                                             onValueChange={(checked) => handlePoSelectionChange(po._id, checked)}
                                             size="sm"
                                             className="flex-shrink-0"
                                         >
                                            <span className='font-medium'>{po.code}</span>
                                         </Checkbox>
                                         <Tooltip content={po.description} placement="top-start" delay={500}>
                                            <p className="text-xs text-gray-600 truncate flex-grow sm:ml-2">{po.description}</p>
                                         </Tooltip>
                                         {isSelected && (
                                            <Select
                                                aria-label={`Correlation level for ${po.code}`}
                                                size="sm"
                                                variant="bordered"
                                                className="max-w-[130px] mt-1 sm:mt-0 flex-shrink-0"
                                                selectedKeys={[mapping?.correlationLevel?.toString() || '1']} // Default to '1' if selected but no level yet
                                                onChange={(e) => handleCorrelationChange(po._id, e.target.value)}
                                            >
                                                {CORRELATION_LEVELS.map(level => (
                                                    <SelectItem key={level.value} value={level.value.toString()}>
                                                        {level.label}
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                        )}
                                    </div>
                                );
                            })}
                         </div>
                    )}
                </div>

            </ModalBody>
            <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                    Cancel
                </Button>
                <Button color="primary" type="submit" isLoading={isLoading} isDisabled={isLoading || programOutcomes.length === 0}>
                    {outcome ? 'Save Changes' : 'Add Outcome'}
                </Button>
            </ModalFooter>
        </form>
    );
}
// --- End Course Outcome Form Component ---



// --- Main Page Component ---
export default function ManageCourseOutcomesPage() {
    const { user } = useUser(); // Assuming this provides user info including faculty ID
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null); // Stores the whole subject object
    const [courseOutcomes, setCourseOutcomes] = useState([]);
    const [programOutcomes, setProgramOutcomes] = useState([]); // POs relevant to selected subject
    const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
    const [isLoadingCOs, setIsLoadingCOs] = useState(false);
    const [isLoadingPOs, setIsLoadingPOs] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // For form submission spinner
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10; // Or make this configurable

    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const [currentOutcome, setCurrentOutcome] = useState(null); // For editing/adding

    // Fetch Subjects assigned to the faculty
    const fetchSubjects = useCallback(async () => {
        // Replace with your actual logic to get faculty subjects for the relevant academic year/sem
        if (!user?.id || !user?.currentYear || !user?.sem) {
            // console.warn("User ID, current year, or semester not available for fetching subjects.");
            // setError("Could not determine required parameters (Year/Sem) to fetch subjects."); // Optionally set error
            return;
        }
        setIsLoadingSubjects(true);
        setError(null);
        try {
            // Assuming an API endpoint like this exists:
            const response = await axios.get(`/api/faculty/${user.id}/subjects`, {
                params: { academicYear: user.currentYear, sem: user.sem }
            });
             // Adjust based on your actual API response structure
            setSubjects(response.data.subjects || response.data.data || []);
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to fetch subjects.";
            setError(errorMsg);
            toast.error(errorMsg);
            console.error("Fetch Subjects Error:", err);
        } finally {
            setIsLoadingSubjects(false);
        }
    }, [user]); // Depend on user object

    // Fetch Program Outcomes relevant to the selected subject's department/year
    const fetchProgramOutcomes = useCallback(async (subject) => {
        if (!subject?.department || !subject?.academicYear || !subject?.institute) return;
        setIsLoadingPOs(true);
        setError(null); // Clear previous errors specific to PO fetching
        try {
            const response = await axios.get(`/api/obe/program-outcomes`, {
                params: {
                    department: subject.department,
                    academicYear: subject.academicYear,
                    institute: subject.institute // Pass institute ID
                    // Add type=PO or type=PSO if needed
                }
            });
            setProgramOutcomes(response.data.data || []);
            if (!response.data.data || response.data.data.length === 0) {
                 toast.error("No Program Outcomes found for this subject's context. Please define them first.", {id: 'no-po-toast'});
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to fetch program outcomes.";
            setError(errorMsg); // Set general error
            toast.error(errorMsg);
            console.error("Fetch POs Error:", err);
            setProgramOutcomes([]); // Clear POs on error
        } finally {
            setIsLoadingPOs(false);
        }
    }, []);

    // Fetch Course Outcomes for the selected subject
    const fetchCourseOutcomes = useCallback(async () => {
        if (!selectedSubject?._id) return;
        setIsLoadingCOs(true);
        setError(null);
        try {
            const response = await axios.get(`/api/obe/course-outcomes`, {
                params: { subjectId: selectedSubject._id }
            });
            setCourseOutcomes(response.data.data || []);
        } catch (err) {
             const errorMsg = err.response?.data?.message || "Failed to fetch course outcomes.";
            setError(errorMsg);
            toast.error(errorMsg);
            console.error("Fetch COs Error:", err);
        } finally {
            setIsLoadingCOs(false);
        }
    }, [selectedSubject]);

    // Initial subject fetch
    useEffect(() => {
        fetchSubjects();
    }, [fetchSubjects]);

    // Fetch POs and COs when subject changes
    useEffect(() => {
        if (selectedSubject) {
            fetchProgramOutcomes(selectedSubject);
            fetchCourseOutcomes();
        } else {
            // Clear data if no subject is selected
            setCourseOutcomes([]);
            setProgramOutcomes([]);
             setCurrentPage(1); // Reset page when subject changes
        }
    }, [selectedSubject, fetchCourseOutcomes, fetchProgramOutcomes]);

    const handleSubjectChange = (subjectId) => {
         // Find the subject object from the fetched list
         const subject = subjects.find(s => s._id === subjectId);
        setSelectedSubject(subject);
    };

    const handleOpenModal = (outcome = null) => {
         if (!selectedSubject) {
             toast.error("Please select a subject first.");
             return;
         }
         if (programOutcomes.length === 0 && !outcome) { // Only block adding if no POs exist
             toast.error("Cannot add new CO. No Program Outcomes defined for this subject's context.");
             return;
         }
        setCurrentOutcome(outcome); // null for new, object for edit
        onOpen();
    };

    const handleSaveOutcome = async (formData) => {
         setIsSubmitting(true);
         const toastId = toast.loading(currentOutcome ? 'Updating outcome...' : 'Adding outcome...');
         try {
             let response;
             if (currentOutcome?._id) {
                 // Update existing outcome
                 response = await axios.put(`/api/obe/course-outcomes/${currentOutcome._id}`, formData);
                 toast.success('Course Outcome updated successfully!', { id: toastId });
             } else {
                 // Add new outcome
                 response = await axios.post('/api/obe/course-outcomes', formData);
                  toast.success('Course Outcome added successfully!', { id: toastId });
             }
             onClose(); // Close modal on success
             fetchCourseOutcomes(); // Refresh the list
         } catch (err) {
              const errorMsg = err.response?.data?.message || (currentOutcome ? "Failed to update outcome." : "Failed to add outcome.");
              const validationErrors = err.response?.data?.errors;
               if (validationErrors) {
                   // Handle specific validation errors (e.g., display them) - basic version just shows main message
                    console.error("Validation Errors:", validationErrors);
                   toast.error(`Validation Failed: ${errorMsg}`, { id: toastId });
              } else {
                  toast.error(errorMsg, { id: toastId });
              }
             console.error("Save Outcome Error:", err);
         } finally {
             setIsSubmitting(false);
         }
    };


    const handleDelete = async (outcomeId) => {
        if (!confirm('Are you sure you want to delete this Course Outcome? This action cannot be undone.')) {
            return;
        }
         const toastId = toast.loading('Deleting outcome...');
         try {
            await axios.delete(`/api/obe/course-outcomes/${outcomeId}`);
            toast.success('Course Outcome deleted successfully!', { id: toastId });
            fetchCourseOutcomes(); // Refresh list
         } catch(err){
             const errorMsg = err.response?.data?.message || "Failed to delete outcome.";
             toast.error(errorMsg, { id: toastId });
             console.error("Delete Outcome Error:", err);
         }
    };

   // --- Client-side Filtering and Pagination ---
   const filteredOutcomes = useMemo(() => {
        if (!searchTerm) return courseOutcomes;
        return courseOutcomes.filter((co) =>
            co.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            co.description.toLowerCase().includes(searchTerm.toLowerCase())
            // Add filtering by cognitive level or PO code if needed
        );
    }, [courseOutcomes, searchTerm]);

   const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredOutcomes.slice(start, end);
    }, [filteredOutcomes, currentPage, rowsPerPage]);

   const totalPages = Math.ceil(filteredOutcomes.length / rowsPerPage);
   // --- End Filtering and Pagination ---


    // --- RENDER LOGIC ---
    return (
        <div className="p-4 md:p-8">
            <h1 className="text-2xl font-bold mb-6 text-gray-700">Manage Course Outcomes (COs)</h1>

             {/* Subject Selection and Controls */}
             <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                 <div className="flex flex-wrap gap-4 items-end justify-between">
                     <Select
                         label="Select Subject"
                         placeholder={isLoadingSubjects ? "Loading..." : "Choose a subject"}
                         className="min-w-[300px] max-w-md flex-grow"
                         variant='bordered'
                         selectedKeys={selectedSubject ? [selectedSubject._id] : []}
                         onChange={(e) => handleSubjectChange(e.target.value)}
                         isDisabled={isLoadingSubjects || subjects.length === 0}
                         isLoading={isLoadingSubjects}
                         items={subjects}
                     >
                          {(subject) => (
                            <SelectItem key={subject._id} value={subject._id} textValue={`<span class="math-inline">\{subject\.name\} \(</span>{subject.id})`}>
                                 <div className="flex flex-col">
                                    <span>{subject.name} ({subject.id})</span>
                                    <span className="text-xs text-gray-500">{subject.academicYear} - {subject.sem}</span>
                                </div>
                            </SelectItem>
                        )}
                     </Select>

                     <Input
                        isClearable
                        className="w-full sm:max-w-xs flex-grow"
                        placeholder="Search COs..."
                        startContent={<SearchIcon size={18} className="text-gray-400" />}
                        value={searchTerm}
                        onClear={() => setSearchTerm("")}
                        onValueChange={setSearchTerm}
                        variant='bordered'
                        isDisabled={!selectedSubject}
                     />

                     <Button
                        color="primary"
                        startContent={<PlusIcon size={18} />}
                        onPress={() => handleOpenModal()}
                        isDisabled={!selectedSubject || isLoadingPOs} // Disable if no subject or POs are loading/missing
                    >
                        Add New CO
                     </Button>
                 </div>
                  {error && <div className="mt-3 text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">{error}</div>}
             </div>


            {/* CO Table */}
             {isLoadingCOs && <div className='flex justify-center items-center p-10'><Spinner label="Loading Course Outcomes..." /></div>}

            {!isLoadingCOs && selectedSubject && paginatedItems.length > 0 && (
                 <>
                    <Table
                         aria-label="Course Outcomes Table"
                         bottomContent={ totalPages > 1 ? (
                            <div className="flex w-full justify-center">
                                <Pagination
                                    isCompact
                                    showControls
                                    showShadow
                                    color="primary"
                                    page={currentPage}
                                    total={totalPages}
                                    onChange={(page) => setCurrentPage(page)}
                                />
                            </div>
                            ) : null
                         }
                         classNames={{ wrapper: "min-h-[222px]" }} // Prevent layout shift
                    >
                        <TableHeader>
                            <TableColumn key="code">Code</TableColumn>
                            <TableColumn key="description" width="40%">Description</TableColumn>
                            <TableColumn key="cognitiveLevel">Cognitive Level</TableColumn>
                            <TableColumn key="poMapping">PO Mapping (Level)</TableColumn>
                            <TableColumn key="actions" align="center">Actions</TableColumn>
                        </TableHeader>
                        <TableBody items={paginatedItems} emptyContent={"No course outcomes match your search."}>
                            {(item) => (
                                <TableRow key={item._id}>
                                    <TableCell>
                                        <Chip size='sm' variant='flat'>{item.code}</Chip>
                                    </TableCell>
                                    <TableCell className='whitespace-normal text-sm'>{item.description}</TableCell>
                                    <TableCell>{item.cognitiveLevel || 'N/A'}</TableCell>
                                    <TableCell>
                                         <div className="flex flex-wrap gap-1 max-w-xs">
                                             {/* Efficiently get PO codes using a map */}
                                             {item.poMapping?.map((map, index) => {
                                                const po = programOutcomes.find(p => (p._id === map.programOutcome?._id || p._id === map.programOutcome)); // Handle populated/unpopulated
                                                return (
                                                    <Tooltip key={index} content={po?.description || 'Unknown PO'} placement='top' delay={300}>
                                                        <Chip size="sm" variant='bordered' color='secondary' className='cursor-default'>
                                                            {po?.code || 'N/A'} ({map.correlationLevel})
                                                        </Chip>
                                                     </Tooltip>
                                                );
                                             })}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="relative flex items-center gap-1">
                                            <Tooltip content="Edit Outcome">
                                                <Button isIconOnly size="sm" variant="light" onPress={() => handleOpenModal(item)}>
                                                    <EditIcon className="text-default-500" size={18}/>
                                                </Button>
                                            </Tooltip>
                                            <Tooltip content="Delete Outcome" color="danger">
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
                </>
             )}

             {/* Empty States */}
              {!isLoadingCOs && selectedSubject && filteredOutcomes.length === 0 && searchTerm && (
                   <p className="text-center text-gray-500 mt-10">No course outcomes match your search "{searchTerm}".</p>
              )}
              {!isLoadingCOs && selectedSubject && courseOutcomes.length === 0 && !searchTerm && (
                   <p className="text-center text-gray-500 mt-10">No course outcomes have been defined for this subject yet. Click "Add New CO" to start.</p>
              )}
             {!selectedSubject && !isLoadingSubjects && (
                <p className="text-center text-gray-500 mt-10">Please select a subject from the dropdown above to manage its Course Outcomes.</p>
             )}
              {!selectedSubject && !isLoadingSubjects && subjects.length === 0 && (
                <p className="text-center text-warning-600 mt-10">No subjects found for your current Academic Year/Semester.</p>
             )}


            {/* Add/Edit Modal */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl" placement="top-center" backdrop="blur">
                 <ModalContent>
                    {(modalOnClose) => ( // Use modalOnClose provided by ModalContent
                         <>
                            <ModalHeader className="flex flex-col gap-1 border-b pb-2">
                                 {currentOutcome ? `Edit Course Outcome (${currentOutcome.code})` : 'Add New Course Outcome'}
                                 {selectedSubject && <span className='text-sm font-normal text-gray-500'>Subject: {selectedSubject.name}</span>}
                            </ModalHeader>
                            {/* Render the form component */}
                            <CourseOutcomeForm
                                 outcome={currentOutcome}
                                 subjectId={selectedSubject?._id}
                                 programOutcomes={programOutcomes}
                                 onSubmit={handleSaveOutcome}
                                 onClose={modalOnClose} // Pass the modal's close handler
                                 isLoading={isSubmitting}
                             />
                         </>
                     )}
                 </ModalContent>
            </Modal>

        </div>
    );
}