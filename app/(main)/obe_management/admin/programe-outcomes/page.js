// app/obe/admin/program-outcomes/page.jsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button, Input, Select, SelectItem, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Modal,ModalBody, useDisclosure, Spinner, Chip } from '@nextui-org/react';
import { PlusIcon, EditIcon, DeleteIcon, SearchIcon } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
// Assume useUser provides institute, maybe department list? Or fetch departments separately.
import { useUser } from '@/app/context/UserContext';

// Define ProgramOutcomeForm component similar to CourseOutcomeForm/AssessmentForm
function ProgramOutcomeForm({ outcome, instituteId, department, academicYear, onSubmit, onClose, isLoading }) {
    // State for form fields (code, description, type)
    // Validation logic
    // Submit handler calling onSubmit
    return (
        <form>
             {/* ModalBody with Input, Textarea, Select for PO Type */}
             <p className='text-center p-4 bg-gray-100 rounded my-4'>Program Outcome Form Fields (Code, Description, Type) Go Here</p>
             {/* ModalFooter with Cancel/Save buttons */}
             <div className='flex justify-end gap-2 p-4'>
                 <Button color="danger" variant="light" onPress={onClose}>Cancel</Button>
                 <Button color="primary" type="submit" isLoading={isLoading}>Save</Button>
             </div>
        </form>
    );
}


export default function ManageProgramOutcomesPage() {
    const { user } = useUser(); // Assuming user has institute info
    const [programOutcomes, setProgramOutcomes] = useState([]);
    const [departments, setDepartments] = useState([]); // Need to fetch or get from user context/props
    const [academicYears, setAcademicYears] = useState(['2024-2025', '2023-2024']); // Example, fetch dynamically if needed
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedYear, setSelectedYear] = useState(user?.currentYear || academicYears[0]); // Default to current year
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const [currentOutcome, setCurrentOutcome] = useState(null);

     


    // TODO: Implement fetchProgramOutcomes based on filters
    const fetchProgramOutcomes = useCallback(async () => {
        if (!user?.institute?._id || !selectedDept || !selectedYear) return;
        setIsLoading(true); setError(null);
        try {
            // Call GET /api/obe/program-outcomes with filters
            const response = await axios.get('/api/obe/program-outcomes', {
                params: { institute: user.institute._id, dept: selectedDept, year: selectedYear }
            });
            setProgramOutcomes(response.data.data || []);
        } catch (err) { /* Handle error */ } finally { setIsLoading(false); }
    }, [user?.institute?._id, selectedDept, selectedYear]);

     // TODO: Implement handleSaveOutcome (calls POST/PUT /api/obe/program-outcomes)
    const handleSaveOutcome = async (formData) => {
        setIsSubmitting(true);
        try {
            if (currentOutcome?._id) {
                // PUT /api/obe/program-outcomes/[poId]
            } else {
                 // POST /api/obe/program-outcomes
                 // Add institute, department, academicYear to formData before sending
            }
            toast.success('Saved!');
            onClose();
            fetchProgramOutcomes(); // Refresh
        } catch (err) { /* Handle error */ } finally { setIsSubmitting(false); }
    };

    // TODO: Implement handleDelete (calls DELETE /api/obe/program-outcomes/[poId])
    const handleDelete = async (poId) => {
         if (!confirm('Delete this Program Outcome?')) return;
         try {
             // DELETE /api/obe/program-outcomes/[poId]
             toast.success('Deleted!');
             fetchProgramOutcomes(); // Refresh
         } catch (err) { /* Handle error */ }
    };

    // --- Effects ---
    
     useEffect(() => { fetchProgramOutcomes(); }, [fetchProgramOutcomes]); // Trigger fetch when filters change

     // --- Filtering ---
     const filteredOutcomes = programOutcomes.filter(po => /* filter logic based on searchTerm */ true);


    return (
        <div className="p-4 md:p-8">
            <h1 className="text-2xl font-bold mb-6">Manage Program Outcomes (PO/PSO)</h1>

            {/* Filters (Department, Year) and Add Button */}
             <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border flex flex-wrap gap-4 items-end justify-between"> 
                 <Input placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} startContent={<SearchIcon size={18}/>} />
                 <Button color="primary" startContent={<PlusIcon size={18} />} onPress={() => {setCurrentOutcome(null); onOpen();}}  >
                     Add New PO/PSO
                 </Button>
             </div>

             {isLoading && <Spinner label="Loading..." />}
             {error && <Chip color="danger">{error}</Chip>}

             {/* Table to display POs */}
            <Table aria-label="Program Outcomes Table">
                <TableHeader>
                    <TableColumn>Code</TableColumn>
                    <TableColumn>Description</TableColumn>
                     <TableColumn>Type</TableColumn>
                    <TableColumn>Actions</TableColumn>
                </TableHeader>
                 <TableBody items={filteredOutcomes} emptyContent={"No outcomes found for selected filters."}>
                     {(item) => (
                        <TableRow key={item._id}>
                            <TableCell>{item.code}</TableCell>
                            <TableCell>{item.description}</TableCell>
                             <TableCell>{item.type}</TableCell>
                            <TableCell>
                                 {/* Edit/Delete Buttons */}
                                 <Button isIconOnly size="sm" variant="light" onPress={() => {setCurrentOutcome(item); onOpen();}}><EditIcon size={18}/></Button>
                                 <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => handleDelete(item._id)}><DeleteIcon size={18}/></Button>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Add/Edit Modal */}
             <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
                <ModalBody>
                    {(modalOnClose) => (
                        <>
                            <ModalHeader>{currentOutcome ? 'Edit' : 'Add'} Program Outcome</ModalHeader>
                             {/* Form Component */}
                            <ProgramOutcomeForm
                                outcome={currentOutcome}
                                instituteId={user?.institute?._id}
                                department={selectedDept}
                                academicYear={selectedYear}
                                onSubmit={handleSaveOutcome}
                                onClose={modalOnClose}
                                isLoading={isSubmitting}
                            />
                        </>
                    )}
                </ModalBody>
             </Modal>
        </div>
    );
}