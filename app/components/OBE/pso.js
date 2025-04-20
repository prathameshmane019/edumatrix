// app/obe/admin/program-outcomes/page.jsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Button, Input, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, 
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, 
  Spinner, Chip, Textarea, Card, CardHeader, CardBody, Tooltip, 
  Select, SelectItem, Tabs, Tab
} from '@nextui-org/react';
import { 
  PlusIcon, EditIcon, DeleteIcon, SearchIcon, Calendar, Info, Building2, Maximize2, Minimize2 
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useUser } from '@/app/context/UserContext';
import { DepartmentDropdown } from '../department/DepartmentDropDowns';
import { getAcademicYears } from '@/app/utils/acadmicYears';

// --- Reusable Outcome Form Component ---
function OutcomeForm({ outcome, outcomeType, onSubmit, onClose, isLoading }) {
  const [formData, setFormData] = useState({ index: '', description: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (outcome) {
      setFormData({ 
        index: outcome.index?.toString() || '', 
        description: outcome.description || '' 
      });
    } else {
      setFormData({ index: '', description: '' });
    }
    setErrors({});
  }, [outcome]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.index.trim()) {
      newErrors.index = `${outcomeType} Index is required`;
    } else if (isNaN(Number(formData.index)) || Number(formData.index) < 1 || !Number.isInteger(Number(formData.index))) {
      newErrors.index = `${outcomeType} Index must be a positive integer`;
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <ModalBody>
        <Input
          label={`${outcomeType} Index`}
          name="index"
          type="number"
          min="1"
          step="1"
          value={formData.index}
          onChange={handleInputChange}
          errorMessage={errors.index}
          isInvalid={!!errors.index}
          isRequired
          className="mb-4"
        />
        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          errorMessage={errors.description}
          isInvalid={!!errors.description}
          isRequired
          className="mb-4"
        />
      </ModalBody>
      <ModalFooter>
        <Button color="danger" variant="light" onPress={onClose}>Cancel</Button>
        <Button 
          color={outcomeType === 'PO' ? 'primary' : 'secondary'} 
          type="submit" 
          isLoading={isLoading}
        >
          {outcome ? 'Save Changes' : `Add ${outcomeType}`}
        </Button>
      </ModalFooter>
    </form>
  );
}

// --- Main Page Component ---
export default function ManageProgramOutcomesPage() {
  const { user } = useUser();
  const [outcomes, setOutcomes] = useState({
    programOutcomes: [],
    programSpecificOutcomes: []
  });
  const [documentId, setDocumentId] = useState(null);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [currentOutcome, setCurrentOutcome] = useState(null);
  const [activeTab, setActiveTab] = useState("po");
  const [activeOutcomeType, setActiveOutcomeType] = useState("PO");

  // Determine role-based access
  const isSuperAdmin = user?.role === 'superadmin';
  const isAdmin = user?.role === 'admin';
  const departmentScope = isAdmin && user?.department ? user.department : null;
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  // Set initial department
  useEffect(() => {
    if (departmentScope && !selectedDept) setSelectedDept(departmentScope);
    if (!isSuperAdmin && departmentScope && selectedDept && selectedDept !== departmentScope) setSelectedDept(departmentScope);
    if (!isSuperAdmin && !departmentScope) setSelectedDept('');
  }, [departmentScope, isSuperAdmin, selectedDept]);

  // Fetch Outcomes
  const fetchOutcomes = useCallback(async () => {
    if (!(user?.institute?._id || user?._id) || !selectedDept || !selectedYear) {
      setOutcomes({ programOutcomes: [], programSpecificOutcomes: [] });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/v2/obe/program-outcomes', {
        params: {
          institute: user.institute?._id || user?._id,
          dept: selectedDept,
          year: selectedYear
        }
      });
      
      if (response.data.data._id) {
        setDocumentId(response.data.data._id);
        setOutcomes(response.data.data);
      } else {
        setOutcomes({ 
          programOutcomes: response.data.data.programOutcomes || [], 
          programSpecificOutcomes: response.data.data.programSpecificOutcomes || [] 
        });
      }
    } catch (err) {
      console.error("Error fetching outcomes:", err);
      setError(err.response?.data?.message || "Failed to fetch outcomes");
      toast.error(err.response?.data?.message || "Failed to fetch outcomes");
    } finally {
      setIsLoading(false);
    }
  }, [user?.institute?._id, user?._id, selectedDept, selectedYear]);

  useEffect(() => {
    fetchOutcomes();
  }, [fetchOutcomes]);

// Handle tab change - Fix: don't pass the event object directly
const handleTabChange = (key) => {
  setActiveTab(key);
  setActiveOutcomeType(key === "po" ? "PO" : "PSO");
};
  // Save Outcome (PO or PSO)
  const handleSave = async (formData) => {
    setIsSubmitting(true);
    
    try {
      if (currentOutcome) {
        // Update existing outcome
        const response = await axios.put(`/api/v2/obe/program-outcomes/${documentId}`, {
          type: activeOutcomeType,
          index: formData.index,
          description: formData.description,
          itemId: currentOutcome._id
        });
        
        toast.success(`${activeOutcomeType} updated successfully`);
        
        // Update the correct array based on the active tab
        if (activeOutcomeType === 'PO') {
          setOutcomes(prev => ({ ...prev, programOutcomes: response.data.data }));
        } else {
          setOutcomes(prev => ({ ...prev, programSpecificOutcomes: response.data.data }));
        }
      } else {
        // Create new outcome
        const response = await axios.post('/api/v2/obe/program-outcomes', {
          institute: user.institute?._id || user?._id,
          department: selectedDept,
          academicYear: selectedYear,
          type: activeOutcomeType,
          index: formData.index,
          description: formData.description
        });
        
        toast.success(`${activeOutcomeType} created successfully`);
        
        // Set document ID if it's a new document
        if (response.data.data._id) {
          setDocumentId(response.data.data._id);
        }
        
        // Update the correct array based on the active tab
        if (activeOutcomeType === 'PO') {
          setOutcomes(prev => ({ ...prev, programOutcomes: response.data.data }));
        } else {
          setOutcomes(prev => ({ ...prev, programSpecificOutcomes: response.data.data }));
        }
      }
      
      onClose();
    } catch (err) {
      console.error("Error saving outcome:", err);
      toast.error(err.response?.data?.message || `Failed to save ${activeOutcomeType}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Outcome (PO or PSO)
  const handleDelete = async (itemId) => {
    if (!window.confirm(`Are you sure you want to delete this ${activeOutcomeType}?`)) {
      return;
    }
    
    try {
      const response = await axios.delete(`/api/v2/obe/program-outcomes/${documentId}`, {
        params: {
          type: activeOutcomeType,
          itemId: itemId
        }
      });
      
      toast.success(`${activeOutcomeType} deleted successfully`);
      
      // Update the correct array based on the active tab
      if (activeOutcomeType === 'PO') {
        setOutcomes(prev => ({ ...prev, programOutcomes: response.data.data }));
      } else {
        setOutcomes(prev => ({ ...prev, programSpecificOutcomes: response.data.data }));
      }
    } catch (err) {
      console.error("Error deleting outcome:", err);
      toast.error(err.response?.data?.message || `Failed to delete ${activeOutcomeType}`);
    }
  };

  // Filter outcomes based on search term
  const filteredOutcomes = useMemo(() => {
    const activeArray = activeTab === "po" ? 
      (outcomes.programOutcomes || []) : 
      (outcomes.programSpecificOutcomes || []);
    
    return activeArray.filter(o => 
      o.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [outcomes, activeTab, searchTerm]);

  return (
    <div className="p-4 md:p-8">
      {/* Common Filter Card */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 shadow-sm">
        <CardHeader>
          <h1 className="text-2xl font-bold text-blue-800">Program Outcomes Management</h1>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-gray-600 mb-4">
            Manage both Program Outcomes (POs) and Program Specific Outcomes (PSOs) for your academic programs.
            {isAdmin && departmentScope && ` (Managing for: ${departmentScope})`}
            {isSuperAdmin && ` (Superadmin View)`}
          </p>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-end">
            <DepartmentDropdown
              label="Select Department"
              instituteId={user?.institute?._id || user?._id}
              selectedValue={selectedDept}
              onSelect={(value) => setSelectedDept(value || '')}
              size="sm" variant="bordered"
              isDisabled={!isSuperAdmin && (!user?.institute?._id || user?._id)}
              readOnly={!!departmentScope}
              isRequired={true} className="min-w-[220px]"
            />
            <Select
              placeholder="Select Academic Year"
              variant="bordered"
              size="sm"
              selectedKeys={selectedYear ? [selectedYear] : []}
              onSelectionChange={(keys) => setSelectedYear(Array.from(keys)[0])}
              startContent={<Calendar className="w-4 h-4 text-default-400" />}
              className="w-full sm:w-[40%] my-2 sm:my-4"
            >
              {getAcademicYears(10).map((year) => (
                <SelectItem key={year.value} value={year.value}>
                  {year.label}
                </SelectItem>
              ))}
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Context Display */}
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {selectedDept && selectedYear && (user?.institute?.name || user?.id) ? (
            <span>Managing Outcomes for: <Chip size="sm" variant="flat" color="secondary">{selectedDept}</Chip> / <Chip size="sm" variant="flat" color="secondary">{selectedYear}</Chip> / <Chip size="sm" variant="flat" color="default">{user.institute?.name}</Chip></span>
          ) : (
            <span className="text-gray-500 italic">Please select Department and Academic Year to view or add outcomes.</span>
          )}
        </div>
        
        {/* Search Box */}
        <div className="relative max-w-xs mb-2">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder="Search outcomes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 max-w-xs"
            size="sm"
            isClearable
            onClear={() => setSearchTerm("")}
          />
        </div>
      </div>

      {/* Tabs for PO and PSO */}
      <Tabs 
        selectedKey={activeTab} 
        onSelectionChange={handleTabChange}
        className="mb-4"
        color={activeTab === "po" ? "primary" : "secondary"}
      >
        <Tab key="po" title={
          <div className="flex items-center gap-2">
            <Maximize2 size={16} />
            <span>Program Outcomes (POs)</span>
          </div>
        }>
          {/* PO Content */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-blue-700">Program Outcomes (POs)</h2>
            <Button 
              color="primary" 
              startContent={<PlusIcon size={18} />} 
              onPress={() => { setCurrentOutcome(null); onOpen(); }}
              isDisabled={!selectedDept || !selectedYear}
            >
              Add New PO
            </Button>
          </div>
        </Tab>
        <Tab key="pso" title={
          <div className="flex items-center gap-2">
            <Minimize2 size={16} />
            <span>Program Specific Outcomes (PSOs)</span>
          </div>
        }>
          {/* PSO Content */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-purple-700">Program Specific Outcomes (PSOs)</h2>
            <Button 
              color="secondary" 
              startContent={<PlusIcon size={18} />} 
              onPress={() => { setCurrentOutcome(null); onOpen(); }}
              isDisabled={!selectedDept || !selectedYear}
            >
              Add New PSO
            </Button>
          </div>
        </Tab>
      </Tabs>

      {/* Loading / Error States */}
      {isLoading && <div className="text-center p-5"><Spinner label={`Loading ${activeOutcomeType}s...`} /></div>}
      {error && !isLoading && <div className="my-4"><Chip color="danger" startContent={<Info size={16} />}>{error}</Chip></div>}

      {/* Outcomes Table */}
      {!isLoading && selectedDept && selectedYear && (
        <Table aria-label="Outcomes Table" removeWrapper>
          <TableHeader>
            <TableColumn width="10%">Index</TableColumn>
            <TableColumn>Description</TableColumn>
            <TableColumn width="15%" align="center">Actions</TableColumn>
          </TableHeader>
          <TableBody items={filteredOutcomes} emptyContent={`No ${activeOutcomeType}s found for the selected criteria.`}>
            {(item) => (
              <TableRow key={item._id}>
                <TableCell className="font-semibold">{item.index}</TableCell>
                <TableCell className='whitespace-normal text-sm'>{item.description}</TableCell>
                <TableCell className="text-center">
                  <Tooltip content={`Edit ${activeOutcomeType}`}>
                    <Button 
                      isIconOnly 
                      size="sm" 
                      variant="light" 
                      onPress={() => { setCurrentOutcome(item); onOpen(); }}
                    >
                      <EditIcon size={18} />
                    </Button>
                  </Tooltip>
                  <Tooltip content={`Delete ${activeOutcomeType}`} color="danger">
                    <Button 
                      isIconOnly 
                      size="sm" 
                      variant="light" 
                      color="danger" 
                      onPress={() => handleDelete(item._id)}
                    >
                      <DeleteIcon size={18} />
                    </Button>
                  </Tooltip>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onOpenChange={() => onOpenChange()} size="3xl" placement="top-center">
        <ModalContent>
          {(modalOnClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {currentOutcome ? 'Edit' : 'Add'} {activeOutcomeType}
                <span className="text-xs font-normal text-gray-500">For: {selectedDept} / {selectedYear}</span>
              </ModalHeader>
              <OutcomeForm
                outcome={currentOutcome}
                outcomeType={activeOutcomeType}
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