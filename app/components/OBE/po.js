// app/obe/admin/program-outcomes/page.jsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, Input, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Spinner, Chip, Textarea, Card, CardHeader, CardBody, Tooltip, Select, SelectItem } from '@nextui-org/react'; // Added Select, SelectItem
import { PlusIcon, EditIcon, DeleteIcon, SearchIcon, Calendar, Info, Building2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useUser } from '@/app/context/UserContext';
import { DepartmentDropdown } from '../department/DepartmentDropDowns';
import { getAcademicYears } from '@/app/utils/acadmicYears'; // Assume this utility exists


// --- Reusable PO/PSO Form (No change needed from previous response) ---
function OutcomeForm({ outcome, outcomeType, instituteId, department, academicYear, onSubmit, onClose, isLoading }) {
    const [formData, setFormData] = useState({ index: '', description: '' });
    const [errors, setErrors] = useState({});
    // ... (useEffect, handleInputChange, validate, handleSubmit logic remains the same) ...
     useEffect(() => {
        if (outcome) { setFormData({ index: outcome.index?.toString() || '', description: outcome.description || '' }); }
        else { setFormData({ index: '', description: '' }); }
        setErrors({});
     }, [outcome]);
     const handleInputChange = (e) => { /* ... */ };
     const validate = () => { /* ... */ };
     const handleSubmit = (e) => { /* ... */ };

    return (
        <form onSubmit={handleSubmit}>
            <ModalBody>
                <Input label={`${outcomeType} Index`} name="index" type="number" min="1" step="1" /* ...props... */ />
                <Textarea label="Description" name="description" /* ...props... */ />
            </ModalBody>
            <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>Cancel</Button>
                <Button color="primary" type="submit" isLoading={isLoading}>{outcome ? 'Save Changes' : `Add ${outcomeType}`}</Button>
            </ModalFooter>
        </form>
    );
}
// --- End Outcome Form ---


// --- Main Page Component for POs ---
export default function ManagePOsPage() {
    const { user } = useUser();
    const [programOutcomes, setProgramOutcomes] = useState([]);
    const [academicYears, setAcademicYears] = useState(getAcademicYears(5)); // Get last 5 years
    const [selectedDept, setSelectedDept] = useState(''); // State for selected department
    const [selectedYear, setSelectedYear] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const [currentOutcome, setCurrentOutcome] = useState(null);
    const OUTCOME_TYPE = 'PO'; // Fixed for this page

    // Determine if department selection should be enabled/pre-filled
    const isSuperAdmin = user?.role === 'superadmin';
    const isAdmin = user?.role === 'admin';
    // **Assumption**: 'admin' role has a *single* department assigned in user.department
    const departmentScope = isAdmin && user?.department ? user.department : null;

    // Set initial department selection for scoped admin
    useEffect(() => {
        if (departmentScope && !selectedDept) {
            setSelectedDept(departmentScope);
        }
        // If superadmin logs out and logs in as admin, clear selection if it's not their scope
        if (!isSuperAdmin && departmentScope && selectedDept && selectedDept !== departmentScope) {
             setSelectedDept(departmentScope);
        }
         // If not admin/superadmin or no scope, clear selection
         if (!isSuperAdmin && !departmentScope) {
             setSelectedDept('');
         }

    }, [departmentScope, isSuperAdmin, selectedDept]);

    // Fetch POs - updated dependencies and filters
    const fetchOutcomes = useCallback(async () => {
        // Ensure institute, department, and year are selected
        if (!(user?.institute?._id || user?._id) || !selectedDept || !selectedYear) {
            setProgramOutcomes([]);
            return;
        }
        setIsLoading(true); setError(null);
        try {
            const response = await axios.get('/api/obe/program-outcomes', {
                params: {
                    institute: user.institute._id || user?._id,
                    dept: selectedDept,
                    year: selectedYear,
                    type: OUTCOME_TYPE
                }
            });
            setProgramOutcomes(response.data.data || []);
        } catch (err) {
             const msg = err.response?.data?.message || "Failed to fetch POs.";
             setError(msg); toast.error(msg);
             setProgramOutcomes([]);
             console.error("Fetch POs Error:", err);
        } finally { setIsLoading(false); }
    }, [user?.institute?._id, selectedDept, selectedYear]); // Dependencies correct

    // Save PO - No change needed here, gets context from form submission
    const handleSave = async (formData) => {
        setIsSubmitting(true);
        const toastId = toast.loading(currentOutcome ? 'Updating PO...' : 'Adding PO...');
        try {
            if (currentOutcome?._id) {
                await axios.put(`/api/obe/program-outcomes/${currentOutcome._id}`, formData);
            } else {
                await axios.post('/api/obe/program-outcomes', formData);
            }
            toast.success('PO Saved!', { id: toastId });
            onClose(); fetchOutcomes();
        } catch (err) { /* Handle save error */ } finally { setIsSubmitting(false); }
    };

    // Delete PO - No change needed here
    const handleDelete = async (poId) => { /* ... (same as before) ... */ };

    // Effects
    useEffect(() => { fetchOutcomes(); }, [fetchOutcomes]); // Re-fetch when context changes

    // Filtering
    const filteredOutcomes = useMemo(() => {
        return programOutcomes.filter(o => o.description.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [programOutcomes, searchTerm]);

    // Get department name for display chip (if departments list available)
    // const selectedDeptName = useMemo(() => departments.find(d => d.id === selectedDept)?.name, [departments, selectedDept]); // Assuming departments list state exists


    return (
        <div className="p-4 md:p-8">
            <Card className="mb-6 bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 shadow-sm">
                <CardHeader><h1 className="text-2xl font-bold text-teal-800">Manage Program Outcomes (POs)</h1></CardHeader>
                <CardBody>
                    <p className="text-sm text-gray-600 mb-4">
                       POs describe graduate attributes upon graduation. Define them for a specific department and academic year.
                       {isAdmin && departmentScope && ` (Managing for: ${departmentScope})`}
                       {isSuperAdmin && ` (Superadmin View)`}
                    </p>
                    {/* Filters */}
                     <div className="flex flex-wrap gap-4 items-end">
                         {/* Use DepartmentDropdown, enable/disable based on role */}
                         <DepartmentDropdown
                             label="Select Department"
                             instituteId={user?.institute?._id}
                             selectedValue={selectedDept}
                             onSelect={(value) => setSelectedDept(value || '')}
                             size="md"
                             variant="bordered"
                             isDisabled={!isSuperAdmin && !user?.institute?._id} // Disabled if not superadmin
                             readOnly={!!departmentScope} // ReadOnly if admin is scoped to one dept
                             isRequired={true}
                             className="min-w-[220px]"
                         />
                         <Select
                             label="Select Academic Year"
                              variant="bordered"
                             selectedKeys={selectedYear ? [selectedYear] : []}
                             size="md"
                             onSelectionChange={(keys) => setSelectedYear(Array.from(keys)[0] || '')}
                             placeholder="Choose Year"
                             className="min-w-[180px]"
                             isRequired
                             startContent={<Calendar className="text-gray-400" size={16}/>}
                        >
                             {academicYears.map(year => <SelectItem key={year.value} value={year.value}>{year.label}</SelectItem>)}
                         </Select>
                         <Input
                            size='md' 
                            variant="bordered" isClearable
                            placeholder="Search Descriptions..."
                            value={searchTerm} onValueChange={setSearchTerm}
                            startContent={<SearchIcon size={18} className="text-gray-400"/>}
                            className="max-w-xs flex-grow"
                            isDisabled={!selectedDept || !selectedYear}
                        />
                     </div>
                </CardBody>
            </Card>

             {/* Add Button & Context Display */}
             <div className="mb-4 flex justify-between items-center">
                 <div className="text-sm text-gray-600">
                     {selectedDept && selectedYear  ? (
                         <span>Managing POs for: <Chip size="sm" variant="flat" color="success">{selectedDept}</Chip> / <Chip size="sm" variant="flat" color="success">{selectedYear}</Chip> / <Chip size="sm" variant="flat" color="default">{user.institute.name}</Chip></span>
                     ) : (
                         <span className="text-gray-500 italic">Please select Department and Academic Year to view or add POs.</span>
                     )}
                 </div>
                <Button color="primary" startContent={<PlusIcon size={18} />} onPress={() => {setCurrentOutcome(null); onOpen();}} isDisabled={!selectedDept || !selectedYear}>
                    Add New PO
                </Button>
            </div>

            {/* Loading / Error / Table */}
            {isLoading && <div className="text-center p-5"><Spinner label="Loading POs..." /></div>}
            {error && !isLoading && <div className="my-4"><Chip color="danger" startContent={<Info size={16} />}>{error}</Chip></div>}

            {!isLoading && selectedDept && selectedYear && (
                 <Table aria-label="POs Table" removeWrapper>
                    <TableHeader>
                        <TableColumn width="10%">Index</TableColumn>
                        <TableColumn>Description</TableColumn>
                        <TableColumn width="15%" align="center">Actions</TableColumn>
                    </TableHeader>
                    <TableBody items={filteredOutcomes} emptyContent={"No POs found for the selected criteria."}>
                        {(item) => (
                            <TableRow key={item._id}>
                                <TableCell className="font-semibold">{item.index}</TableCell>
                                <TableCell className='whitespace-normal text-sm'>{item.description}</TableCell>
                                <TableCell className="text-center">
                                    <Tooltip content="Edit PO"><Button isIconOnly size="sm" variant="light" onPress={() => {setCurrentOutcome(item); onOpen();}}><EditIcon size={18}/></Button></Tooltip>
                                    <Tooltip content="Delete PO" color="danger"><Button isIconOnly size="sm" variant="light" color="danger" onPress={() => handleDelete(item._id)}><DeleteIcon size={18}/></Button></Tooltip>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            )}

            {/* Add/Edit Modal */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl" placement="top-center">
                <ModalContent>
                    {(modalOnClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">{currentOutcome ? 'Edit' : 'Add'} PO
                                 <span className="text-xs font-normal text-gray-500">For: {selectedDept} / {selectedYear}</span>
                            </ModalHeader>
                            <OutcomeForm
                                outcome={currentOutcome}
                                outcomeType={OUTCOME_TYPE}
                                instituteId={user?.institute?._id}
                                department={selectedDept} // Pass selected department
                                academicYear={selectedYear}
                                onSubmit={handleSave}
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