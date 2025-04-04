"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { ChevronDownIcon } from "@/public/ChevronDownIcon";
import { toast } from 'sonner';
import { FaFileDownload, FaFileUpload } from "react-icons/fa";
import { useRouter } from "next/navigation";
import {
  Table, Tooltip, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Input, Button, DropdownTrigger, Dropdown, DropdownMenu, DropdownItem,
  Pagination, Select, SelectItem, Spinner, Modal, ModalContent, ModalHeader,
  ModalBody, ModalFooter, Chip
} from "@nextui-org/react";
import { capitalize } from "@/app/utils/utils";
import { PlusIcon } from "@/public/PlusIcon";
import { EditIcon } from "@/public/EditIcon";
import { DeleteIcon } from "@/public/DeleteIcon";
import { SearchIcon } from "@/public/SearchIcon";
import StudentModal from "./studentModal";
import * as XLSX from "xlsx";
import Image from "next/image";
import { getCurrentAcademicYear, getAcademicYears } from '@/app/utils/acadmicYears';
import { Calendar, EyeIcon } from 'lucide-react';
import { DepartmentDropdown } from "./department/DepartmentDropDowns";
import { ClassDropdown } from "./Class/ClassDropdown";

const columns = [
  { uid: "_id", name: "Student ID", sortable: true },
  { uid: "personalDetails.name", name: "Name", sortable: true },
  { uid: "academicDetails.rollNumber", name: "Roll Number", sortable: true },
  { uid: "academicDetails.class", name: "Class", sortable: true },
  { uid: "academicDetails.department", name: "Department", sortable: true },
  { uid: "personalDetails.phoneNo", name: "Phone No", sortable: true },
  { uid: "personalDetails.email", name: "Email", sortable: true },
  { uid: "academicDetails.admissionDate", name: "Admission Date", sortable: true },
  { uid: "personalDetails.dateOfBirth", name: "Date of Birth", sortable: true },
  { uid: "personalDetails.gender", name: "Gender", sortable: true },
  { uid: "admission.status", name: "Status", sortable: true },
  { uid: "parents.name", name: "Parent Name", sortable: true },
  { uid: "parents.contact", name: "Parent Contact", sortable: true },
  { uid: "parents.email", name: "Parent Email", sortable: true },
  { uid: "parents.occupation", name: "Parent Occupation", sortable: true },
  { uid: "parents.relation", name: "Relation", sortable: true },
  { uid: "admission.admissionNumber", name: "Admission No", sortable: true },
  { uid: "admission.categoryType", name: "Category", sortable: true },
  { uid: "actions", name: "Actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "_id", "personalDetails.name", "academicDetails.rollNumber",
  "academicDetails.department", "admission.status", "admission.admissionNumber", "actions"
];

export default function StudentTable() {
  const router = useRouter();
  const [filterValue, setFilterValue] = useState("");
  const [visibleColumns, setVisibleColumns] = useState(new Set(INITIAL_VISIBLE_COLUMNS));
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "academicDetails.rollNumber",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [institute, setInstitute] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const storedProfile = sessionStorage.getItem('userProfile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
  }, []);

  useEffect(() => {
    if (profile?.role !== "superadmin") {
      setSelectedClass('');
      setSelectedDepartment(profile?.id);
    }
  }, [profile]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
  }, [selectedClass, academicYear, statusFilter]);

  useEffect(() => {
    if (profile?.role) {
      const instituteId = profile?.role === "superadmin" ? profile?._id : profile?.institute._id;
      setInstitute(instituteId);
    }
  }, [profile]);

  const fetchStudents = async () => {
    try {
      if (!selectedClass) {
        setStudents([]);
        return;
      }
      setIsLoading(true);
      const response = await axios.get(`/api/v2/students-by-class`, {
        params: { class: selectedClass }
      });

      if (response.data.students) {
        setStudents(response.data.students);
        setTotalStudents(response.data.totalStudents || response.data.students.length);
      } else {
        setStudents([]);
        setTotalStudents(0);
        toast.warning('No students found');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
      setTotalStudents(0);
      toast.warning('No students found');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!selectedClass || !selectedDepartment) {
        toast.error('Please select both a class and department before uploading students');
        event.target.value = '';
        return;
      }
      setFileToUpload(file);
      setShowConfirmModal(true);
    }
  };

  const confirmUpload = () => {
    if (fileToUpload) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        if (workbook.SheetNames.length > 1) {
          toast.error("Please ensure the file contains only one sheet.");
          return;
        }

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const requiredHeaders = ["name", "rollNumber"];
        const headers = Object.keys(jsonData[0] || {});
        const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));

        if (missingHeaders.length > 0) {
          toast.error(`Missing required columns: ${missingHeaders.join(", ")}`);
          return;
        }

        uploadStudents(jsonData);
      };
      reader.readAsArrayBuffer(fileToUpload);
      const fileInput = document.getElementById('upload-input');
      if (fileInput) fileInput.value = '';
    }
    setShowConfirmModal(false);
  };

  const uploadStudents = async (studentsData) => {
    try {
      setIsLoading(true);
      setUploadProgress(0);

      const formattedStudents = studentsData.map(student => ({
        _id: student._id?.trim(),
        personalDetails: {
          name: student.name?.trim(),
          email: student.email?.trim()?.toLowerCase(),
          phoneNo: student.phoneNo?.trim(),
          dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString() : undefined,
          gender: student.gender
        },
        academicDetails: {
          rollNumber: student.rollNumber?.trim(),
          admissionDate: student.admissionDate ? new Date(student.admissionDate).toISOString() : undefined,
          institute: institute,
          class: selectedClass,
          department: selectedDepartment
        },
        admission: {
          admissionNumber: student.admissionNumber?.trim(),
          categoryType: student.categoryType,
          status: student.status || 'active',
          admissionDate: student.admissionDate ? new Date(student.admissionDate).toISOString() : undefined
        },
        parents: {
          name: student.parentName?.trim(),
          contact: student.parentContact?.trim(),
          email: student.parentEmail?.trim()?.toLowerCase(),
          occupation: student.parentOccupation?.trim(),
          relation: student.relation
        }
      }));

      const response = await axios.post('/api/upload', {
        students: formattedStudents,
        class: selectedClass,
        department: selectedDepartment,
        institute: institute
      });

      setUploadProgress(100);
      toast.success('All students uploaded successfully');
      fetchStudents();
    } catch (error) {
      console.error('Error uploading students:', error);
      const errorMsg = error.response?.data?.error || 'Failed to upload students';
      const details = error.response?.data?.details ? 
        Array.isArray(error.response.data.details) ? error.response.data.details : [error.response.data.details] 
        : [];
      setErrorMessages([errorMsg, ...details]);
      setErrorModalOpen(true);
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
      setFileToUpload(null);
    }
  };

  const downloadExcel = async () => {
    try {
      if (!selectedClass) {
        toast.warning('Please select a class to download student data');
        return;
      }
      setIsLoading(true);
      const response = await axios.get(`/api/v2/students-by-class`, {
        params: {
          class: selectedClass,
          status: statusFilter !== "all" ? statusFilter : undefined
        }
      });

      const flattenedStudents = response.data.students.map(student => ({
        "Student ID": student._id,
        "Name": student.personalDetails?.name || '',
        "Roll Number": student.academicDetails?.rollNumber || '',
        "Class": student.academicDetails?.class?.toString() || '',
        "Department": student.academicDetails?.department || '',
        "Phone No": student.personalDetails?.phoneNo || '',
        "Email": student.personalDetails?.email || '',
        "Admission Date": student.academicDetails?.admissionDate ? new Date(student.academicDetails.admissionDate).toLocaleDateString() : '',
        "Date of Birth": student.personalDetails?.dateOfBirth ? new Date(student.personalDetails.dateOfBirth).toLocaleDateString() : '',
        "Gender": student.personalDetails?.gender || '',
        "Status": student.admission?.status || 'active',
        "Parent Name": student.parents?.name || '',
        "Parent Contact": student.parents?.contact || '',
        "Parent Email": student.parents?.email || '',
        "Parent Occupation": student.parents?.occupation || '',
        "Relation": student.parents?.relation || '',
        "Admission Number": student.admission?.admissionNumber || '',
        "Category": student.admission?.categoryType || ''
      }));

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(flattenedStudents);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
      XLSX.writeFile(workbook, `students_class_${selectedClass}_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Student data downloaded successfully');
    } catch (error) {
      console.error("Error downloading student data:", error);
      toast.error('Error downloading student data: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const downloadSampleExcel = () => {
    const sampleData = [
      {
        _id: "1",
        name: "John Doe",
        rollNumber: "R001",
        email: "john.doe@example.com",
        phoneNo: "+1234567890",
        dateOfBirth: "2000-01-01",
        gender: "Male",
        admissionDate: "2023-08-01",
        admissionNumber: "A001",
        categoryType: "merit",
        status: "active",
        parentName: "Jane Doe",
        parentContact: "+1234567891",
        parentEmail: "jane.doe@example.com",
        parentOccupation: "Teacher",
        relation: "Mother"
      },
      {
        _id: "2",
        name: "Alice Smith",
        rollNumber: "R002",
        email: "alice.smith@example.com",
        phoneNo: "+1234567892",
        dateOfBirth: "2001-02-02",
        gender: "Female",
        admissionDate: "2023-08-01",
        admissionNumber: "A002",
        categoryType: "reserved",
        status: "active",
        parentName: "Bob Smith",
        parentContact: "+1234567893",
        parentEmail: "bob.smith@example.com",
        parentOccupation: "Engineer",
        relation: "Father"
      }
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sample_Students');
    XLSX.writeFile(workbook, 'sample_student_upload.xlsx');
    toast.success('Sample Excel file downloaded successfully');
  };

  const deleteStudent = async (_id) => {
    setStudentToDelete(_id);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteStudent = async () => {
    try {
      await axios.delete(`/api/v2/students?_id=${studentToDelete}`);
      setStudents(prev => prev.filter(student => student._id !== studentToDelete));
      toast.success('Student deleted successfully');
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error('Error deleting student: ' + (error.response?.data?.error || error.message));
    } finally {
      setShowDeleteConfirmModal(false);
      setStudentToDelete(null);
    }
  };

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) => visibleColumns.has(column.uid));
  }, [visibleColumns]);

  const sortedItems = useMemo(() => {
    return [...students].sort((a, b) => {
      const getNestedValue = (obj, path) => path.split('.').reduce((acc, part) => acc && acc[part], obj);
      const first = getNestedValue(a, sortDescriptor.column);
      const second = getNestedValue(b, sortDescriptor.column);

      if (sortDescriptor.column === "_id" || sortDescriptor.column === "academicDetails.rollNumber") {
        const [, numA, alphaA] = first?.match(/(\d+)(.*)/) || [null, '', ''];
        const [, numB, alphaB] = second?.match(/(\d+)(.*)/) || [null, '', ''];
        const numComparison = parseInt(numA) - parseInt(numB);
        if (numComparison !== 0) return sortDescriptor.direction === "ascending" ? numComparison : -numComparison;
        return sortDescriptor.direction === "ascending" ? alphaA.localeCompare(alphaB) : alphaB.localeCompare(alphaA);
      }

      if (!first && !second) return 0;
      if (!first) return sortDescriptor.direction === "ascending" ? 1 : -1;
      if (!second) return sortDescriptor.direction === "ascending" ? -1 : 1;

      if (["personalDetails.dateOfBirth", "academicDetails.admissionDate", "admission.admissionDate"].includes(sortDescriptor.column)) {
        const dateA = new Date(first);
        const dateB = new Date(second);
        return sortDescriptor.direction === "ascending" ? dateA - dateB : dateB - dateA;
      }

      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "ascending" ? cmp : -cmp;
    });
  }, [students, sortDescriptor]);

  const filteredItems = useMemo(() => {
    return sortedItems.filter((item) =>
      item.personalDetails?.name?.toLowerCase().includes(filterValue.toLowerCase()) ||
      item.academicDetails?.rollNumber?.toLowerCase().includes(filterValue.toLowerCase()) ||
      item.admission?.admissionNumber?.toLowerCase().includes(filterValue.toLowerCase()) ||
      item.parents?.name?.toLowerCase().includes(filterValue.toLowerCase())
    );
  }, [sortedItems, filterValue]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'suspended': return 'warning';
      case 'alumni': return 'primary';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderCell = useCallback((student, columnKey) => {
    const getNestedValue = (obj, path) => path.split('.').reduce((acc, part) => acc && acc[part], obj);
    const cellValue = getNestedValue(student, columnKey);

    switch (columnKey) {
      case "actions":
        return (
          <div className="relative flex items-center justify-center gap-2">
            <Tooltip content="Edit">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50" onClick={(e) => {
                e.stopPropagation();
                setModalMode("edit");
                setSelectedStudent(student);
                setModalOpen(true);
              }}>
                <EditIcon />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50" onClick={(e) => {
                e.stopPropagation();
                deleteStudent(student._id);
              }}>
                <DeleteIcon />
              </span>
            </Tooltip>
            <Tooltip content="View Details">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50" onClick={() => router.push(`/student_management/admin/manage/${student._id}`)}>
                <EyeIcon/>
              </span>
            </Tooltip>
          </div>
        );
      case "admission.status":
        return <Chip color={getStatusColor(cellValue)} size="sm" variant="flat">{cellValue || 'active'}</Chip>;
      case "personalDetails.dateOfBirth":
      case "academicDetails.admissionDate":
      case "admission.admissionDate":
        return cellValue ? formatDate(cellValue) : '-';
      case "personalDetails.gender":
      case "academicDetails.department":
      case "personalDetails.phoneNo":
      case "personalDetails.email":
      case "_id":
      case "personalDetails.name":
      case "academicDetails.rollNumber":
      case "parents.name":
      case "parents.contact":
      case "parents.email":
      case "parents.occupation":
      case "parents.relation":
      case "admission.admissionNumber":
        return cellValue || '-';
      case "academicDetails.class":
        return student.academicDetails?.class?.toString() || '-';
      case "admission.categoryType":
        return cellValue ? capitalize(cellValue) : '-';
      default:
        return cellValue || '-';
    }
  }, [router, getStatusColor, formatDate]);

  const handleClassSelect = (value) => setSelectedClass(value);
  const handleDepartmentSelect = (departmentId) => setSelectedDepartment(departmentId.target.value);
  const onRowsPerPageChange = useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);
  const onSearchChange = useCallback((value) => {
    setFilterValue(value);
    setPage(1);
  }, []);
  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedStudent(null);
  };
  const handleModalSubmit = async () => {
    fetchStudents();
    setModalOpen(false);
  };
  const openFileDialog = useCallback(() => {
    if (!selectedClass || !selectedDepartment) {
      toast.warning("Please select both class and department before uploading file");
      return;
    }
    document.getElementById('upload-input').click();
  }, [selectedClass, selectedDepartment]);

  const bottomContent = (
    <div className="flex justify-between items-center">
      <span className="text-default-400 text-small">Total {filteredItems.length} students</span>
      <label className="flex items-center text-default-400 text-small">
        Rows per page:
        <select className="bg-transparent outline-none text-default-400 text-small" onChange={onRowsPerPageChange} value={rowsPerPage}>
          {[5, 10, 15].map((rows) => <option key={rows} value={rows}>{rows}</option>)}
        </select>
      </label>
    </div>
  );

  const classNames = {
    wrapper: ["max-h-[382px]", "max-w-3xl"],
    th: ["bg-transparent", "text-default-500", "border-b", "border-divider"],
    td: [
      "group-data-[first=true]:first:before:rounded-none",
      "group-data-[first=true]:last:before:rounded-none",
      "group-data-[middle=true]:before:rounded-none",
      "group-data-[last=true]:first:before:rounded-none",
      "group-data-[last=true]:last:before:rounded-none",
    ],
  };

  return (
    <div>
      <div className="flex flex-row gap-2 flex-wrap">
        <Select
          placeholder="Select Year"
          variant="bordered"
          size="sm"
          selectedKeys={academicYear ? [academicYear] : []}
          onSelectionChange={(keys) => setAcademicYear(Array.from(keys)[0])}
          startContent={<Calendar className="w-4 h-4 text-default-400" />}
          className="max-w-64 my-4"
        >
          {getAcademicYears(10).map((year) => (
            <SelectItem key={year.value} value={year.value}>{year.label}</SelectItem>
          ))}
        </Select>
        {profile?.role === "superadmin" && (
          <DepartmentDropdown
            instituteId={institute}
            onSelect={handleDepartmentSelect}
            className="max-w-64"
            selectedDepartment={selectedDepartment}
          />
        )}
        <ClassDropdown
          id="class-select"
          instituteId={institute}
          onSelect={handleClassSelect}
          selectedClass={selectedClass}
          acadmicYear={academicYear}
          selectedDepartment={selectedDepartment}
          className="my-4 max-w-64"
        />
        <Select
          placeholder="Status"
          variant="bordered"
          size="sm"
          selectedKeys={[statusFilter]}
          onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0])}
          className="max-w-64 my-4"
        >
          <SelectItem key="all" value="all">All</SelectItem>
          <SelectItem key="active" value="active">Active</SelectItem>
          <SelectItem key="suspended" value="suspended">Suspended</SelectItem>
          <SelectItem key="alumni" value="alumni">Alumni</SelectItem>
        </Select>
      </div>
      <div className="flex justify-between gap-3 items-end">
        <Input
          isClearable
          classNames={{ base: "w-full sm:max-w-[44%]", inputWrapper: "border-1" }}
          placeholder="Search by name, roll number, or admission number..."
          size="sm"
          startContent={<SearchIcon className="text-default-300" />}
          value={filterValue}
          variant="bordered"
          onClear={() => setFilterValue("")}
          onValueChange={onSearchChange}
        />
        <div className="flex gap-3 flex-wrap">
          <Dropdown>
            <DropdownTrigger className="hidden sm:flex">
              <Button endContent={<ChevronDownIcon className="text-small" />} size="sm" variant="flat">Columns</Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Table Columns"
              closeOnSelect={false}
              selectedKeys={visibleColumns}
              selectionMode="multiple"
              onSelectionChange={setVisibleColumns}
            >
              {columns.map((column) => (
                <DropdownItem key={column.uid} className="capitalize">{capitalize(column.name)}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <Button
            color="primary"
            startContent="Add New"
            endContent={<PlusIcon />}
            size="sm"
            onClick={() => {
              setModalMode("add");
              setModalOpen(true);
            }}
          >
            Add New
          </Button>
          <Button color="primary" variant="ghost" size="sm" onClick={openFileDialog} endContent={<FaFileUpload />}>
            Upload File
          </Button>
          <input id="upload-input" type="file" accept=".xlsx, .xls" onChange={handleFileUpload} style={{ display: 'none' }} />
          <Button color="primary" size="sm" variant="ghost" onClick={downloadExcel} endContent={<FaFileDownload />}>
            Download
          </Button>
          <Button color="secondary" size="sm" variant="ghost" onClick={downloadSampleExcel} endContent={<FaFileDownload />}>
            Sample Excel
          </Button>
        </div>
      </div>
      <Table
        isCompact
        removeWrapper
        aria-label="Student table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={classNames}
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
        topContentPlacement="outside"
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"} allowsSorting={column.sortable}>
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          isLoading={isLoading}
          loadingContent={<Spinner label="Please wait... fetching Data" />}
          emptyContent={
            <div className="flex flex-col items-center justify-center">
              <Image src="/student.svg" alt="No students found" width={850} height={850} />
              <p>No students found</p>
            </div>
          }
          items={items}
        >
          {(item) => (
            <TableRow key={item._id} className="cursor-pointer hover:bg-gray-50" >
              {headerColumns.map((column) => (
                <TableCell key={column.uid}>{renderCell(item, column.uid)}</TableCell>
              ))}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="mt-4 flex justify-between items-center">
        <Pagination total={pages} page={page} onChange={(newPage) => setPage(newPage)} /> 
        <span>Total Students: {filteredItems.length}</span>
      </div>
      <StudentModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        mode={modalMode}
        student={selectedStudent}
        onSubmit={handleModalSubmit}
        selectedClass={selectedClass}
        instituteId={institute}
        academicYear={academicYear}
      />
      {showConfirmModal && (
        <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)}>
          <ModalContent>
            <ModalHeader>Confirm Upload</ModalHeader>
            <ModalBody>
              <p>Are you sure you want to upload students to the selected class?</p>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
              <Button color="primary" onClick={confirmUpload}>Confirm</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
      <Modal isOpen={errorModalOpen} onClose={() => setErrorModalOpen(false)} scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>Upload Errors</ModalHeader>
          <ModalBody>
            <ul>
              {errorMessages.map((error, index) => (
                <li key={index} className="text-danger">{error}</li>
              ))}
            </ul>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={() => setErrorModalOpen(false)}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={showDeleteConfirmModal} onClose={() => setShowDeleteConfirmModal(false)}>
        <ModalContent>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete this student?</p>
          </ModalBody>
          <ModalFooter>
            <Button color="default" onClick={() => setShowDeleteConfirmModal(false)}>Cancel</Button>
            <Button color="danger" onClick={confirmDeleteStudent}>Delete</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {uploadProgress > 0 && (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg">
          <p>Uploading students...</p>
          <progress value={uploadProgress} max="100" className="w-full"></progress>
          <p>{uploadProgress}% complete</p>
        </div>
      )}
    </div>
  );
}