'use client';
import React, { useState, useEffect } from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Input,
    Select,
    SelectItem,
    Textarea,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Spinner,
    Tooltip,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem
} from "@nextui-org/react";
import { PlusIcon, Pencil, Trash2, Calendar, MoreVertical, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import axios from 'axios';
import { useUser } from '@/app/context/UserContext';
import { getAcademicYears } from '@/app/utils/acadmicYears';
import { SubjectDropdown } from '../subject/SubjectDropdown';

const COGNITIVE_LEVELS = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create', 'N/A'];

const ManageCourseOutcomesPage = () => {
    const { user } = useUser();
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

    // State management
    const [courseOutcomes, setCourseOutcomes] = useState([]);
    const [filters, setFilters] = useState({
        subject: '',
        academicYear: ''
    });
    const [formData, setFormData] = useState({
        index: '',
        description: '',
        cognitiveLevel: 'N/A'
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editOutcomeIndex, setEditOutcomeIndex] = useState(null); // Index of the outcome being edited
    const [currentCourseOutcomeId, setCurrentCourseOutcomeId] = useState(null); // _id of the document being edited
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [academicYears, setAcademicYears] = useState([]);
    const [currentAcademicYear, setCurrentAcademicYear] = useState('');

    // Initialize academic years and set default current year
    useEffect(() => {
        const years = getAcademicYears(10);
        setAcademicYears(years);

        // Set current academic year as default
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-based

        // If we're in the latter half of the year (July onwards), use current-next year format
        // Otherwise use previous-current year format
        let defaultAcademicYear;
        if (currentMonth >= 7) {
            defaultAcademicYear = `${currentYear}-${currentYear + 1}`;
        } else {
            defaultAcademicYear = `${currentYear - 1}-${currentYear}`;
        }

        // Find the closest match in our academic years list
        const matchingYear = years.find(year => year.value === defaultAcademicYear);
        if (matchingYear) {
            setCurrentAcademicYear(matchingYear.value);
            setFilters(prev => ({
                ...prev,
                academicYear: matchingYear.value
            }));
        }
    }, []);

    // Initialize user data
    useEffect(() => {
        if (user) {
            setFilters(prev => ({
                ...prev,
                instituteId: user.institute?._id,
                department: user.department,
                academicYear: prev.academicYear || currentAcademicYear
            }));
        }
    }, [user, currentAcademicYear]);

    // Fetch course outcomes when filters change
    useEffect(() => {
        if (filters.subject && filters.instituteId && filters.department && filters.academicYear) {
            fetchCourseOutcomes();
        } else {
            setCourseOutcomes([]);
        }
    }, [filters.subject, filters.academicYear]);

    const fetchCourseOutcomes = async () => {
        setIsLoading(true);
        try {
            if (!filters.subject || !filters.instituteId || !filters.department || !filters.academicYear) {
                setCourseOutcomes([]);
                return;
            }
            const response = await axios.get('/api/v2/obe/course-outcomes', {
                params: {
                    subject: filters.subject,
                    instituteId: filters.instituteId,
                    department: filters.department,
                    academicYear: filters.academicYear
                }
            });
            console.log(response.data.data);
            setCourseOutcomes(response.data.data || []);
        } catch (error) {
            console.error("Error fetching course outcomes:", error);
            toast.error("Couldn't load course outcomes. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Form handlers
    const resetForm = () => {
        setFormData({
            index: '',
            description: '',
            cognitiveLevel: 'N/A'
        });
        setIsEditing(false);
        setEditOutcomeIndex(null);
        setCurrentCourseOutcomeId(null);
    };

    const handleOpenAddDialog = () => {
        resetForm();
        onOpen();
    };

    const handleOpenEditDialog = (courseOutcomeDocumentId, outcomeIndex, outcomeData) => {
        setIsEditing(true);
        setEditOutcomeIndex(outcomeIndex);
        setCurrentCourseOutcomeId(courseOutcomeDocumentId);
        setFormData({
            index: outcomeData.index,
            description: outcomeData.description,
            cognitiveLevel: outcomeData.cognitiveLevel || 'N/A'
        });
        onOpen();
    };

    const handleDeleteOutcome = async (courseOutcomeId, outcomeIndex) => {
        if (!window.confirm("Are you sure you want to delete this course outcome?")) {
            return;
        }

        try {
            await axios.delete(`/api/v2/obe/course-outcomes/${courseOutcomeId}`, {
                data: { outcomeIndex }
            });
            toast.success("Course outcome deleted successfully");
            fetchCourseOutcomes();
        } catch (error) {
            console.error("Error deleting course outcome:", error);
            toast.error("Failed to delete course outcome");
        }
    };

    const handleSubmit = async () => {
        // Form validation
        if (!formData.index || !formData.description) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                subject: filters.subject,
                instituteId: filters.instituteId,
                department: filters.department,
                academicYear: filters.academicYear,
                outcomes: [{
                    index: formData.index,
                    description: formData.description,
                    cognitiveLevel: formData.cognitiveLevel
                }]
            };

            if (isEditing && currentCourseOutcomeId && editOutcomeIndex !== null) {
                // API call to update a specific outcome within the document
                await axios.put(`/api/v2/obe/course-outcomes/${currentCourseOutcomeId}`, {
                    outcomeIndex: editOutcomeIndex,
                    updatedOutcome: {
                        index: formData.index,
                        description: formData.description,
                        cognitiveLevel: formData.cognitiveLevel
                    }
                });
                toast.success("Course outcome updated successfully");
            } else {
                // API call to create a new course outcome document
                await axios.post('/api/v2/obe/course-outcomes', payload);
                toast.success("Course outcome created successfully");
            }

            fetchCourseOutcomes();
            onClose();
            resetForm();
        } catch (error) {
            if (error.response && error.response.status === 409) {
                toast.error("A course outcome already exists for this subject");
            }
            if (error.response && error.response.status === 404) {
                toast.error("Programe outcomes not found");
            }
            console.error("Error saving course outcome:", error);
            toast.error("Failed to save course outcome");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="gap-4 flex flex-col m-10">
            <Card className='bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm'>
                <CardHeader className="flex justify-between">
                    <h2 className="text-xl font-bold">Course Outcomes Management</h2>
                    <Button
                        color="primary"
                        onPress={handleOpenAddDialog}
                        endContent={<PlusIcon size={16} />}
                        isDisabled={!filters.subject || !filters.academicYear}
                    >
                        Add Outcome
                    </Button>
                </CardHeader>
                <CardBody>
                    {/* Filters Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Select
                            placeholder="Select academic year"
                            variant='bordered'
                            selectedKeys={filters.academicYear ? [filters.academicYear] : []}
                            onSelectionChange={(keys) => setFilters(prev => ({ ...prev, academicYear: Array.from(keys)[0], subject: '' }))}
                            startContent={<Calendar size={16} className="text-default-400" />}
                            defaultSelectedKeys={currentAcademicYear ? [currentAcademicYear] : []}
                        >
                            {academicYears.map(year => (
                                <SelectItem key={year.value} value={year.value}>
                                    {year.label}
                                </SelectItem>
                            ))}
                        </Select>

                        <div>
                            <SubjectDropdown

                                instituteId={filters.instituteId}
                                department={filters.department}
                                academicYear={filters.academicYear}
                                size='md'
                                onSelect={(value) => setFilters(prev => ({ ...prev, subject: value }))}
                                facultyId={filters.academicYear && user?._id}
                                selectedSubject={filters.subject}
                                isDisabled={!filters.academicYear}
                            />
                        </div>
                    </div>
                </CardBody>
            </Card>
            <div>
                {/* Course Outcomes List */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <Spinner size="lg" />
                    </div>
                ) : courseOutcomes.length > 0 ? (
                    <div className="flex flex-col gap-4">
                        {courseOutcomes.map((courseOutcomeDoc) => (
                            <Card shadow='sm' className='p-6' key={courseOutcomeDoc._id}>
                                <CardHeader>
                                    <h3 className="font-semibold text-lg">
                                        Subject: {courseOutcomeDoc.subject?.name || 'N/A'} (Academic Year: {courseOutcomeDoc.academicYear})
                                    </h3>
                                </CardHeader>
                                <CardBody>
                                    {courseOutcomeDoc.outcomes.length > 0 ? (
                                        <Table
                                            aria-label={`Outcomes for ${courseOutcomeDoc.subject?.name}`}
                                            selectionMode="none"
                                            shadow='sm'
                                        >
                                            <TableHeader>
                                                <TableColumn>Index</TableColumn>
                                                <TableColumn width={400}>Description</TableColumn>
                                                <TableColumn>Cognitive Level</TableColumn>
                                                <TableColumn align="center">Actions</TableColumn>
                                            </TableHeader>
                                            <TableBody items={courseOutcomeDoc.outcomes}>
                                                {(outcome) => (
                                                    <TableRow key={outcome.index}>
                                                        <TableCell className="font-medium">
                                                            CO{outcome?.index || 'N/A'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Tooltip content={outcome?.description || 'N/A'}>
                                                                <span className="line-clamp-2">{outcome?.description || 'N/A'}</span>
                                                            </Tooltip>
                                                        </TableCell>
                                                        <TableCell>{outcome?.cognitiveLevel || 'N/A'}</TableCell>
                                                        <TableCell>
                                                            <div className="flex justify-center gap-2">
                                                                <Dropdown>
                                                                    <DropdownTrigger>
                                                                        <Button isIconOnly size="sm" variant="light">
                                                                            <MoreVertical size={16} />
                                                                        </Button>
                                                                    </DropdownTrigger>
                                                                    <DropdownMenu aria-label="Actions">
                                                                        <DropdownItem
                                                                            startContent={<Pencil size={16} />}
                                                                            onPress={() => handleOpenEditDialog(courseOutcomeDoc._id, outcome.index, outcome)}
                                                                        >
                                                                            Edit
                                                                        </DropdownItem>
                                                                        <DropdownItem
                                                                            startContent={<Trash2 size={16} />}
                                                                            className="text-danger"
                                                                            onPress={() => handleDeleteOutcome(courseOutcomeDoc._id, outcome.index)}
                                                                        >
                                                                            Delete
                                                                        </DropdownItem>
                                                                    </DropdownMenu>
                                                                </Dropdown>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <p className="text-default-500">No outcomes defined for this subject.</p>
                                    )}
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center bg-default-100 rounded-lg">
                        <AlertCircle size={36} className="text-default-400 mb-2" />
                        <h3 className="text-lg font-medium">No course outcomes found</h3>
                        <p className="text-default-500">
                            {!filters.subject && filters.academicYear
                                ? "Please select a subject to view outcomes."
                                : !filters.academicYear
                                    ? "Please select an academic year to continue."
                                    : "No outcomes found for the selected subject and academic year."}
                        </p>
                    </div>
                )}
            </div> 
            {/* Add/Edit Modal */ }
    <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="2xl"
        scrollBehavior="inside"
    >
        <ModalContent>
            {(onClose) => (
                <>
                    <ModalHeader>
                        <h2>{isEditing ? "Edit Course Outcome" : "Add New Outcome"}</h2>
                    </ModalHeader>
                    <ModalBody>
                        <div className="flex flex-col gap-4">
                            <Input
                                label="Outcome Index *"
                                type="number"
                                min="1"
                                value={formData.index}
                                onChange={(e) => setFormData(prev => ({ ...prev, index: e.target.value }))}
                                isRequired
                                variant="bordered"
                            />

                            <Textarea
                                label="Description *"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                isRequired
                                variant="bordered"
                                minRows={3}
                            />

                            <Select
                                label="Cognitive Level"
                                selectedKeys={[formData.cognitiveLevel]}
                                onSelectionChange={(keys) => setFormData(prev => ({ ...prev, cognitiveLevel: Array.from(keys)[0] }))}
                                variant="bordered"
                            >
                                {COGNITIVE_LEVELS.map(level => (
                                    <SelectItem key={level} value={level}>
                                        {level}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="flat" onPress={onClose}>
                            Cancel
                        </Button>
                        <Button
                            color="primary"
                            onPress={handleSubmit}
                            isLoading={isSubmitting}
                        >
                            {isEditing ? 'Update Outcome' : 'Add Outcome'}
                        </Button>
                    </ModalFooter>
                </>
            )}
        </ModalContent>
    </Modal>
        </div >
    );
};

export default ManageCourseOutcomesPage;