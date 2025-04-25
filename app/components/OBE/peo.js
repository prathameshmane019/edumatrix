// app/obe/admin/program-educational-objectives/page.jsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, Input, Select, SelectItem, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Modal, ModalHeader, ModalBody, ModalFooter, useDisclosure, Spinner, Chip, Textarea, Card, CardHeader, CardBody, Tooltip, ModalContent } from '@nextui-org/react';
import { PlusIcon, EditIcon, DeleteIcon, SearchIcon, Calendar, Info } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useUser } from '@/app/context/UserContext';
import { getAcademicYears } from '@/app/utils/acadmicYears';

// --- Reusable PEO Form ---
function PeoForm({ objective, instituteId, academicYear, onSubmit, onClose, isLoading }) {
    const [formData, setFormData] = useState({ index: '', description: '' });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (objective) {
            setFormData({
                index: objective.index.toString(),
                description: objective.description
            });
        } else {
            setFormData({ index: '', description: '' });
        }
        setErrors({});
    }, [objective]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        // Clear error when field is edited
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null
            });
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.index || parseInt(formData.index) < 1) {
            newErrors.index = 'Index must be a positive integer';
        }
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSubmit({
                ...formData,
                index: Number(formData.index),
                institute: instituteId,
                academicYear: academicYear,
            });
        } else {
            toast.error("Please fix errors.");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <ModalBody>
                <Input
                    label="PEO Index"
                    name="index"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.index}
                    onChange={handleInputChange}
                    isInvalid={!!errors.index}
                    errorMessage={errors.index}
                    className="mb-4"
                    autoFocus
                    isReadOnly={!!objective} // Make index read-only when editing
                />
                <Textarea
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    isInvalid={!!errors.description}
                    errorMessage={errors.description}
                    minRows={3}
                    className="mb-2"
                />
            </ModalBody>
            <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>Cancel</Button>
                <Button color="primary" type="submit" isLoading={isLoading}>
                    {objective ? 'Save Changes' : 'Add PEO'}
                </Button>
            </ModalFooter>
        </form>
    );
}

// --- Main Page Component ---
export default function ManagePEOsPage() {
    const { user } = useUser();
    const [objectives, setObjectives] = useState([]);
    const [selectedYear, setSelectedYear] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const [currentObjective, setCurrentObjective] = useState(null);

    // Fetch PEOs
    const fetchPEOs = useCallback(async () => {
        // Fetch only if institute and year are selected
        if (!user?._id || !selectedYear) {
            setObjectives([]);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get('/api/v2/obe/peo', {
                params: { institute: user._id, year: selectedYear }
            });
            setObjectives(response.data.data || []);
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to fetch PEOs.";
            setError(msg);
            toast.error(msg);
            setObjectives([]);
            console.error("Fetch PEOs Error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [user?._id, selectedYear]);

    // Save PEO
    const handleSave = async (formData) => {
        if (!formData.institute || !formData.academicYear) {
            toast.error("Cannot save: Missing context (Institute or Year).");
            return;
        }
        setIsSubmitting(true);
        const toastId = toast.loading(currentObjective ? 'Updating PEO...' : 'Adding PEO...');
        try {
            if (currentObjective) {
                // For updating existing PEO
                await axios.put(`/api/v2/obe/peo/${currentObjective.index}`, 
                    { description: formData.description },
                    { params: { institute: formData.institute, year: formData.academicYear } } 
                );
            } else {
                // For adding new PEO
                await axios.post('/api/v2/obe/peo', formData);
            }
            toast.success('PEO Saved!', { id: toastId });
            onClose();
            fetchPEOs();
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to save PEO.";
            toast.error(msg, { id: toastId });
            console.error("Save PEO Error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete PEO
    const handleDelete = async (index) => {
        if (!confirm(`Are you sure you want to delete PEO ${index}?`)) return;
        
        const toastId = toast.loading('Deleting PEO...');
        try {
            await axios.delete(`/api/v2/obe/peo/${index}`, {
                params: { institute: user._id, year: selectedYear }
            });
            toast.success('PEO deleted successfully', { id: toastId });
            fetchPEOs();
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to delete PEO.";
            toast.error(msg, { id: toastId });
            console.error("Delete PEO Error:", err);
        }
    };

    // Effects
    useEffect(() => {
        fetchPEOs();
    }, [fetchPEOs]);

    // Memoized filtering
    const filteredObjectives = useMemo(() => {
        return objectives.filter(o => o.description.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [objectives, searchTerm]);

    return (
        <div className="p-4 md:p-8">
            <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm">
                <CardHeader>
                    <h1 className="text-2xl font-bold text-indigo-800">Manage Program Educational Objectives (PEOs)</h1>
                </CardHeader>
                <CardBody>
                    <p className="text-sm text-gray-600 mb-4">
                        PEOs are defined at the <strong>Institute level</strong> and describe expected career/professional achievements of graduates. Define them for a specific academic year.
                    </p>
                    <div className="flex flex-wrap gap-4 items-end">
                        <Select
                            placeholder="Select Academic Year"
                            variant="bordered"
                            size="md"
                            selectedKeys={selectedYear ? [selectedYear] : []}
                            onSelectionChange={(keys) => setSelectedYear(Array.from(keys)[0])}
                            startContent={<Calendar className="w-4 h-4 text-default-400" />}
                            className="  sm:w-[30%] my-2 sm:my-4"
                        >
                            {getAcademicYears(10).map((year) => (
                                <SelectItem key={year.value} value={year.value}>
                                    {year.label}
                                </SelectItem>
                            ))}
                        </Select>
                        <Input
                            size='md' 
                            variant="bordered" isClearable
                            placeholder="Search Descriptions..."
                            value={searchTerm} 
                            onValueChange={setSearchTerm}
                            startContent={<SearchIcon size={18} className="text-gray-400"/>}
                            className="max-w-xs flex-grow sm:w-[40%] my-2 sm:my-4"
                            isDisabled={!selectedYear}
                        />
                    </div>
                </CardBody>
            </Card>

            {/* Add Button & Context Display */}
            <div className="mb-4 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                    {selectedYear && user?.name ? (
                        <span>Managing PEOs for: <Chip size="sm" variant="flat" color="primary">{user.name}</Chip> / <Chip size="sm" variant="flat" color="secondary">{selectedYear}</Chip></span>
                    ) : (
                        <span className="text-gray-500 italic">Please select Academic Year to view or add PEOs.</span>
                    )}
                </div>
                <Button
                    color="primary" startContent={<PlusIcon size={18} />}
                    onPress={() => {setCurrentObjective(null); onOpen();}}
                    isDisabled={!selectedYear || !user?._id}
                >
                    Add New PEO
                </Button>
            </div>

            {isLoading && <div className="text-center p-5"><Spinner label="Loading PEOs..." /></div>}
            {error && !isLoading && <div className="my-4"><Chip color="danger" startContent={<Info size={16} />}>{error}</Chip></div>}

            {/* PEO Table */}
            {!isLoading && selectedYear && user?._id && (
                <Table aria-label="PEOs Table" removeWrapper>
                    <TableHeader>
                        <TableColumn width="10%">Index</TableColumn>
                        <TableColumn>Description</TableColumn>
                        <TableColumn width="15%" align="center">Actions</TableColumn>
                    </TableHeader>
                    <TableBody items={filteredObjectives} emptyContent={"No PEOs found for the selected criteria."}>
                        {(item) => (
                            <TableRow key={item.index}>
                                <TableCell className="font-semibold">{item.index}</TableCell>
                                <TableCell className='whitespace-normal text-sm'>{item.description}</TableCell>
                                <TableCell className="text-center">
                                    <Tooltip content="Edit PEO">
                                        <Button isIconOnly size="sm" variant="light" onPress={() => {setCurrentObjective(item); onOpen();}}>
                                            <EditIcon size={18}/>
                                        </Button>
                                    </Tooltip>
                                    <Tooltip content="Delete PEO" color="danger">
                                        <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => handleDelete(item.index)}>
                                            <DeleteIcon size={18}/>
                                        </Button>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            )}

            {/* Add/Edit Modal */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl" placement="top-center">
                <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    {currentObjective ? 'Edit' : 'Add'} PEO
                    <span className="text-xs font-normal text-gray-500">For: {user?.name} / {selectedYear}</span>
                </ModalHeader>
                <PeoForm
                    objective={currentObjective}
                    instituteId={user?._id}
                    academicYear={selectedYear}
                    onSubmit={handleSave}
                    onClose={onClose}
                    isLoading={isSubmitting}
                />
                </ModalContent>
            </Modal>
        </div>
    );
}