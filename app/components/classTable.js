"use client"
import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { ChevronDownIcon } from "@/public/ChevronDownIcon";
import { toast } from 'sonner';
import {
  Table,
  Tooltip,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Pagination,
  SelectItem,
  Select,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "@nextui-org/react";
import { capitalize } from "@/app/utils/utils";
import { PlusIcon } from "@/public/PlusIcon";
import { EditIcon } from "@/public/EditIcon";
import { DeleteIcon } from "@/public/DeleteIcon";
import { SearchIcon } from "@/public/SearchIcon";

import { Card, CardHeader, CardBody } from "@nextui-org/react";


import * as XLSX from "xlsx";
import { FaFileDownload } from "react-icons/fa";
import Image from "next/image";

import { DepartmentDropdown } from "./department/DepartmentDropDowns";
import { getCurrentAcademicYear, getAcademicYears } from '@/app/utils/acadmicYears';
import { Calendar } from "lucide-react";
import ClassModal from "./classModal";
import { useUser } from "../context/UserContext";

const columns = [
  { uid: "id", name: "Class ID", sortable: true },
  { uid: "teacher", name: "Class Coordinator" },
  { uid: "students", name: "Students" }, 
  { uid: "year", name: "Academic Year" },
  { uid: "department", name: "Department" },
  { uid: "actions", name: "Actions" },
];

const INITIAL_VISIBLE_COLUMNS = ["id", "teacher", "students", "year", "department", "actions"];

export default function ClassTable() {
  const { user } = useUser();
  const [filterValue, setFilterValue] = useState("");
  const [visibleColumns] = useState(new Set(INITIAL_VISIBLE_COLUMNS));
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "id",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedClass, setSelectedClass] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [profile, setProfile] = useState(null);
  const [selectedYear, setSelectedYear] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Set profile and default department when user data is available
  useEffect(() => {
    if (user) {
      setProfile(user);   
      
      if (user?.role !== "superadmin") { 
        setSelectedDepartment(user?.id); 
      }
      
      setSelectedYear(user?.currentYear || getCurrentAcademicYear());
    }
  }, [user]);
  
  // Fetch data when department and year are selected
  useEffect(() => {
    if (selectedDepartment && selectedYear) {
      fetchData();
    }
  }, [selectedDepartment, selectedYear]);

  const handleDepartmentSelect = (departmentId) => {
    setSelectedDepartment(departmentId.target.value);
  };

  const fetchData = useCallback(async () => {
    if (!selectedDepartment || !selectedYear) return;

    setIsLoadingClasses(true);
    try { 
      const classesResponse = await axios.get(
        `/api/classes?department=${selectedDepartment}&academicYear=${selectedYear}`, 
        { timeout: 10000 }
      );
      
      if (classesResponse.status === 200 && Array.isArray(classesResponse.data)) {
        setClasses(classesResponse.data);
      } else {
        setClasses([]);
        toast.error('No class data available');
      }
    } catch (error) {
      console.error('Error fetching class data:', error);
      toast.error('Error fetching data. Please try again.');
      setClasses([]);
    } finally {
      setIsLoadingClasses(false);
    }
  }, [selectedDepartment, selectedYear]);

  const openDeleteConfirm = useCallback((classItem) => {
    setClassToDelete(classItem);
    setDeleteConfirmOpen(true);
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    setDeleteConfirmOpen(false);
    setClassToDelete(null);
  }, []);

  const deleteClass = useCallback(async () => {
    if (!classToDelete?._id) return;
    
    setIsDeleting(true);
    try {
      await axios.delete(`/api/v2/classes?_id=${classToDelete._id}`, { timeout: 10000 });
      
      // Remove the deleted class from the state directly instead of refetching
      setClasses(prevClasses => prevClasses.filter(cls => cls._id !== classToDelete._id));
      toast.success('Class deleted successfully');
    } catch (error) {
      console.error("Error deleting class:", error);
      toast.error('Error deleting class. Please try again.');
    } finally {
      setIsDeleting(false);
      closeDeleteConfirm();
    }
  }, [classToDelete, closeDeleteConfirm]);

  const downloadExcel = useCallback(() => {
    if (!classes.length) {
      toast.error('No data to download');
      return;
    }
    
    try {
      const worksheet = XLSX.utils.json_to_sheet(classes);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Classes");
      XLSX.writeFile(workbook, "classes_data.xlsx");
    } catch (error) {
      console.error("Error downloading excel file:", error);
      toast.error('Error generating Excel file');
    }
  }, [classes]);
 
  const pages = Math.ceil((classes?.length || 0) / rowsPerPage);
  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredClasses = classes || [];

    if (hasSearchFilter) {
      filteredClasses = filteredClasses.filter((cls) => {
        return (
          (cls.name && cls.name.toLowerCase().includes(filterValue.toLowerCase())) ||
          (cls.teacher?.name && cls.teacher.name.toLowerCase().includes(filterValue.toLowerCase())) ||
          (cls.id && cls.id.toLowerCase().includes(filterValue.toLowerCase()))
        );
      });
    }

    return filteredClasses;
  }, [classes, filterValue, hasSearchFilter]);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      
      // Handle null/undefined values
      if (first === undefined || first === null) return sortDescriptor.direction === "ascending" ? -1 : 1;
      if (second === undefined || second === null) return sortDescriptor.direction === "ascending" ? 1 : -1;
      
      // Handle nested properties (like teacher.name)
      const getNestedValue = (obj, key) => {
        if (key === 'teacher') return obj.teacher?.name;
        return obj[key];
      };

      const firstValue = getNestedValue(a, sortDescriptor.column);
      const secondValue = getNestedValue(b, sortDescriptor.column);
      
      const cmp = firstValue < secondValue ? -1 : firstValue > secondValue ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);
 
  const renderCell = useCallback((cls, columnKey) => {
    switch (columnKey) {
      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Edit">
              <span
                className="text-lg text-default-500 cursor-pointer active:opacity-50"
                onClick={() => {
                  setModalMode("edit");
                  setSelectedClass(cls);
                  setModalOpen(true);
                }}
              >
                <EditIcon />
              </span>
            </Tooltip>
            <Tooltip content="Delete">
              <span
                className="text-lg text-danger cursor-pointer active:opacity-50"
                onClick={() => openDeleteConfirm(cls)}
              >
                <DeleteIcon />
              </span>
            </Tooltip>
          </div>
        );
      case "teacher":
        return <span>{cls.teacher?.name || 'N/A'}</span>;
      case "students":
        return <span>{cls.students?.length || 0}</span>;
      default:
        return <span>{cls[columnKey] || 'N/A'}</span>;
    }
  }, [openDeleteConfirm]);

  const renderHeader = useCallback((column) => {
    const columnName = capitalize(column.name);
    return (
      <div className="flex justify-between items-center">
        {columnName}
        {column.sortable && (
          <ChevronDownIcon
            className="cursor-pointer"
            onClick={() => {
              setSortDescriptor((prev) => ({
                column: column.uid,
                direction:
                  prev.column === column.uid && prev.direction === "ascending"
                    ? "descending"
                    : "ascending",
              }));
            }}
          />
        )}
      </div>
    );
  }, []);

  const handleClassSubmit = useCallback(() => {
    fetchData();
    setModalOpen(false);
  }, [fetchData]);

  const handleAddClassClick = useCallback(() => {
    setModalMode("add");
    setSelectedClass(null);
    setModalOpen(true);
  }, []);

  return (
    <>
       <Card className='bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm'>
      <CardHeader className="flex justify-between">
        <h2 className="text-xl font-bold">Class Management</h2>
        <Button
              color="primary"
              startContent={<PlusIcon />}
              size="sm"
              auto
              onClick={handleAddClassClick}
              isDisabled={!selectedDepartment || !selectedYear}
            >
              Add Class
            </Button>
      </CardHeader>
      <CardBody>
        {/* Filters Section */}
        <div className="flex flex-col sm:flex-row justify-between my-4 gap-3 items-end">
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
          
          {profile?.role !== "admin" && (
            <DepartmentDropdown 
              instituteId={profile?.role === "superadmin" ? profile?._id : profile?.institute?._id}
              onSelect={handleDepartmentSelect}
              className="w-full sm:w-[40%] my-2 sm:my-4"
              selectedDepartment={selectedDepartment}
            />
          )}
          
          <Input
            isClearable
            classNames={{
              base: "w-full sm:max-w-[44%] my-2 sm:my-4",
              inputWrapper: "border-1",
            }}
            placeholder="Search by class name or teacher..."
            size="sm"
            startContent={<SearchIcon className="text-default-300" />}
            value={filterValue}
            variant="bordered"
            onClear={() => setFilterValue("")}
            onChange={(e) => setFilterValue(e.target.value)}
          />
          
          <div className="gap-4 my-2 sm:my-4 items-center flex flex-wrap justify-center sm:justify-end">
           
            <Button
              color="primary"
              size="sm"
              variant="ghost"
              onClick={downloadExcel}
              endContent={<FaFileDownload />}
              isDisabled={!classes.length}
            >
              Download
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
      
      {isLoadingClasses ? (
        <div className="flex justify-center items-center h-64">
          <Spinner label="Please wait... fetching Class Data" />
        </div>
      ) : sortedItems && sortedItems.length > 0 ? (
        <Table
          aria-label="Class Table"
          sortDescriptor={sortDescriptor}
          onSortChange={setSortDescriptor}
          classNames={{
            wrapper: "min-h-[400px]",
          }}
        >
          <TableHeader columns={headerColumns}>
            {(column) => (
              <TableColumn key={column.uid}>
                {renderHeader(column)}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody items={sortedItems} emptyContent={"No classes found"}>
            {(item) => (
              <TableRow key={item._id}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <div className="my-auto mt-16 md:mt-32">
            <Image src="/class.svg" alt="No classes found" width={400} height={400} className="max-w-full" />
          </div>
          <p className="mt-2 text-gray-500">No classes found</p>
        </div>
      )}
      
      {pages > 1 && (
        <Pagination
          total={pages}
          page={page}
          onChange={(page) => setPage(page)}
          className="mt-4"
        />
      )}
      
      {/* Class Add/Edit Modal */}
      <ClassModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        classData={selectedClass}
        onSubmit={handleClassSubmit}
        userRole={profile?.role}
        department={selectedDepartment || profile?.department || profile?.id}
        instituteId={profile?.role === 'superadmin' ? profile?._id : profile?.institute?._id}
        academicYear={selectedYear}
      />
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={closeDeleteConfirm}
        placement="center"
        backdrop="blur"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">Confirm Deletion</ModalHeader>
              <ModalBody>
                <p>
                  Are you sure you want to delete the class {classToDelete?.name || classToDelete?.id}?
                  This action cannot be undone.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={closeDeleteConfirm}>
                  Cancel
                </Button>
                <Button 
                  color="danger" 
                  onPress={deleteClass}
                  isLoading={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}