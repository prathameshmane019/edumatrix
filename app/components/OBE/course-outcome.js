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
  Chip,
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
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize user data
  useEffect(() => {
    if (user) {
      setFilters(prev => ({
        ...prev,
        instituteId: user.institute?._id,
        department: user.department,
        academicYear:filters.academicYear
      }));
    }
  }, [user]);
 

  // Fetch course outcomes when filters change
  useEffect(() => {
    if (filters.subject && filters.instituteId && filters.department && filters.academicYear) {
      fetchCourseOutcomes();
    } else {
      setCourseOutcomes([]);
    }
  }, [filters.subject ]);
 
  const fetchCourseOutcomes = async () => {
    setIsLoading(true);
    try {
        if(!filters.subject || !filters.instituteId || !filters.department || !filters.academicYear) {
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
    setEditId(null);
  };

  const handleOpenAddDialog = () => {
    resetForm();
    onOpen();
  };

  const handleOpenEditDialog = (outcome) => {
    setIsEditing(true);
    setEditId(outcome._id);
    
    if (outcome.outcomes && outcome.outcomes[0]) {
      const currentOutcome = outcome.outcomes[0];
      setFormData({
        index: currentOutcome.index,
        description: currentOutcome.description,
        cognitiveLevel: currentOutcome.cognitiveLevel || 'N/A'
      });
    }
    
    onOpen();
  };

  const handleDeleteOutcome = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course outcome?")) {
      return;
    }
    
    try {
      await axios.delete(`/api/v2/obe/course-outcomes/${id}`);
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

      if (isEditing && editId) {
        await axios.put(`/api/v2/obe/course-outcomes/${editId}`, payload);
        toast.success("Course outcome updated successfully");
      } else {
        await axios.post('/api/v2/obe/course-outcomes', payload);
        toast.success("Course outcome created successfully");
      }
      
      fetchCourseOutcomes();
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error saving course outcome:", error);
      toast.error("Failed to save course outcome");
    } finally {
      setIsSubmitting(false);
    }
  };

  // UI rendering
  return (
    <div className="gap-4 flex flex-col">
      <Card>
        <CardHeader className="flex justify-between">
          <h2 className="text-xl font-bold">Course Outcomes Management</h2>
          <Button 
            color="primary" 
            onPress={handleOpenAddDialog} 
            endContent={<PlusIcon size={16} />}
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
              onSelectionChange={(keys) => setFilters(prev => ({ ...prev, academicYear: Array.from(keys)[0] }))}
              startContent={<Calendar size={16} className="text-default-400" />}
            >
              {getAcademicYears(10).map(year => (
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
                onSelect={(value) => setFilters(prev => ({ ...prev, subject: value }))}
                facultyId={user?._id}
                selectedSubject={filters.subject}
              />
            </div>
 
          </div>

          {/* Course Outcomes Table */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Spinner size="lg" />
            </div>
          ) : courseOutcomes.length > 0 ? (
            <Table
              aria-label="Course Outcomes Table"
              selectionMode="none"
            >
              <TableHeader>
                <TableColumn>Index</TableColumn>
                <TableColumn width={400}>Description</TableColumn>
                <TableColumn>Cognitive Level</TableColumn>
                <TableColumn align="center">Actions</TableColumn>
              </TableHeader>
              <TableBody items={courseOutcomes}>
                {(outcome) => (
                  <TableRow key={outcome._id}>
                    <TableCell className="font-medium">
                      CO{outcome.outcomes[0]?.index || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Tooltip content={outcome.outcomes[0]?.description || 'N/A'}>
                        <span className="line-clamp-2">{outcome.outcomes[0]?.description || 'N/A'}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{outcome.outcomes[0]?.cognitiveLevel || 'N/A'}</TableCell>
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
                              onPress={() => handleOpenEditDialog(outcome)}
                            >
                              Edit
                            </DropdownItem>
                            <DropdownItem 
                              startContent={<Trash2 size={16} />}
                              className="text-danger"
                              onPress={() => handleDeleteOutcome(outcome._id)}
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
            <div className="flex flex-col items-center justify-center py-12 text-center bg-default-100 rounded-lg">
              <AlertCircle size={36} className="text-default-400 mb-2" />
              <h3 className="text-lg font-medium">No course outcomes found</h3>
              <p className="text-default-500">
                {!filters.subject  && !filters.academicYear
                  && "Try adding your first course outcome by clicking the Add button"}
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add/Edit Modal */}
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
                <h2>{isEditing ? "Edit Course Outcome" : "Add Course Outcome"}</h2>
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
                  {isEditing ? 'Update Outcome' : 'Create Outcome'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ManageCourseOutcomesPage;