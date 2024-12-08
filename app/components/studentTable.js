"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { ChevronDownIcon } from "@/public/ChevronDownIcon";
import { departmentOptions } from "../utils/department";
import { toast } from 'sonner';
import { FaFileDownload, FaFileUpload } from "react-icons/fa";

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
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Pagination, Select, SelectItem,
  Spinner
} from "@nextui-org/react";
import { capitalize } from "@/app/utils/utils";
import { PlusIcon } from "@/public/PlusIcon";
import { EditIcon } from "@/public/EditIcon";
import { DeleteIcon } from "@/public/DeleteIcon";
import { SearchIcon } from "@/public/SearchIcon";
import StudentModal from "./studentModal";
import * as XLSX from "xlsx";
import Image from "next/image";

const columns = [
  { uid: "_id", name: "ID", sortable: true },
  { uid: "rollNumber", name: "Roll Number", sortable: true },
  { uid: "name", name: "Name", sortable: true },
  { uid: "class", name: "Class", sortable: true },
  { uid: "department", name: "Department", sortable: true },
  { uid: "phoneNo", name: "Phone No", sortable: true },
  { uid: "email", name: "Email ID", sortable: true },
  { uid: "year", name: "Admission Year", sortable: true },
  { uid: "password", name: "Password", sortable: true },
  { uid: "actions", name: "Actions" },
];
import { getCurrentAcademicYear, getAcademicYears } from '@/app/utils/acadmicYears';
import { Calendar } from 'lucide-react';
import { DepartmentDropdown } from "./department/DepartmentDropDowns";
import { ClassDropdown } from "./Class/ClassDropdown";

const INITIAL_VISIBLE_COLUMNS = ["_id", "rollNumber", "name", "year", "department", "actions"];

export default function StudentTable() {
  const [filterValue, setFilterValue] = useState("");
  const [visibleColumns, setVisibleColumns] = useState(new Set(INITIAL_VISIBLE_COLUMNS));
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "rollNumber",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [classes, setClasses] = useState([]);
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [institute,setInstitute]= useState(null)

  useEffect(() => {
    const storedProfile = sessionStorage.getItem('userProfile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
  }, []);


  useEffect(() => {
    if (profile?.role !== "superadmin") {
      setSelectedClass('')
    
      setSelectedDepartment(profile?.id);
    }
  }, [profile]);

  useEffect(() => {
    if (selectedDepartment && selectedClass) {
      setStudents([])
      fetchStudents();
    }
  }, [selectedDepartment, selectedClass, academicYear]);

  useEffect(() => {
    if ((profile?.role === "admin" || profile?.role === "superadmin") && selectedDepartment) {
      setSelectedClass('')
    }
    if(profile?.role) {
      console.log(profile);
      const instituteId =profile?.role==="superadmin"? profile?._id : profile?.institute
      setInstitute(instituteId)
      console.log(instituteId);
    }

  }, [profile, selectedDepartment, academicYear]);

  useEffect(() => {
    setSelectedClass('')
    setStudents([])
  }, [selectedDepartment]);


  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/v2/student`, {
        params: {
          department: selectedDepartment,
          class: selectedClass,
          academicYear: academicYear
        }
      });
      setAllStudents(response.data.students);
      setTotalStudents(response.data.students.length);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Error fetching students');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
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

        const requiredHeaders = ["name", "rollNumber", "email", "phoneNo", "department", "year"];
        const headers = Object.keys(jsonData[0]);
        const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));

        if (missingHeaders.length > 0) {
          toast.error(`Missing required columns: ${missingHeaders.join(", ")}`);
          return;
        }

        uploadStudents(jsonData);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const uploadStudents = async (studentsData) => {
    try {
      setIsLoading(true);
      const response = await axios.post('/api/upload', { students: studentsData });

      if (response.data.errors && response.data.errors.length > 0) {
        const errorMessage = response.data.errors.map(error => `Row ${error.row}: ${error.message}`).join("\n");
        toast.error(`Some students could not be uploaded:\n${errorMessage}`);
      } else {
        toast.success('Students uploaded successfully');
      }

      fetchStudents();
    } catch (error) {
      console.error('Error uploading students:', error);
      toast.error('Error uploading students: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const downloadExcel = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/student/download?department=${selectedDepartment}`);

      const studentsByYear = response.data.reduce((acc, student) => {
        const year = student.year || 'Unknown';
        if (!acc[year]) acc[year] = [];
        acc[year].push(student);
        return acc;
      }, {});

      const workbook = XLSX.utils.book_new();

      Object.entries(studentsByYear).forEach(([year, students]) => {
        const dataToExport = students.map(({ createdAt, updatedAt, subjects, __v, ...rest }) => ({
          ...rest,
          "Admission Year": year
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        XLSX.utils.book_append_sheet(workbook, worksheet, `Year ${year}`);
      });

      XLSX.writeFile(workbook, "student_data.xlsx");
      toast.success('Student data downloaded successfully');
    } catch (error) {
      console.error("Error downloading student data:", error);
      toast.error('Error downloading student data: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const deleteStudent = async (_id) => {
    try {
      await axios.delete(`/api/v2/student?_id=${_id}`);
      fetchStudents();
      toast.success('Student deleted successfully');
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error('Error deleting student');
    }
  };

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) => visibleColumns.has(column.uid));
  }, [visibleColumns]);

  const sortedItems = useMemo(() => {
    return [...allStudents].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];

      if (sortDescriptor.column === "_id" || sortDescriptor.column === "rollNumber") {
        // Extract numbers and non-numeric parts
        const [, numA, alphaA] = first.match(/(\d+)(.*)/) || [null, '', ''];
        const [, numB, alphaB] = second.match(/(\d+)(.*)/) || [null, '', ''];

        // Compare numeric parts first
        const numComparison = parseInt(numA) - parseInt(numB);

        if (numComparison !== 0) {
          return sortDescriptor.direction === "ascending" ? numComparison : -numComparison;
        }

        // If numeric parts are equal, compare alphabetic parts
        return sortDescriptor.direction === "ascending"
          ? alphaA.localeCompare(alphaB)
          : alphaB.localeCompare(alphaA);
      }

      // For other columns, use simple string comparison
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "ascending" ? cmp : -cmp;
    });
  }, [allStudents, sortDescriptor.column, sortDescriptor.direction]);

  const filteredItems = useMemo(() => {
    return sortedItems.filter((item) =>
      item.name.toLowerCase().includes(filterValue.toLowerCase()) ||
      item.rollNumber.toLowerCase().includes(filterValue.toLowerCase())
    );
  }, [sortedItems, filterValue]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const renderCell = useCallback((student, columnKey) => {
    const cellValue = student[columnKey];
    switch (columnKey) {
      case "actions":
        return (
          <div className="relative flex items-center justify-items-center justify-center gap-2">
            <Tooltip content="Edit">
              <span
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                onClick={() => {
                  setModalMode("edit");
                  setSelectedStudent(student);
                  setModalOpen(true);
                }}
              >
                <EditIcon />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete">
              <span
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                onClick={() => deleteStudent(student._id)}
              >
                <DeleteIcon />
              </span>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  const handleClassSelect = (value) => {
    setSelectedClass(value)
  }

  const handleDepartmentSelect = (departmentId) => {
    console.log(departmentId.target.value);
    setSelectedDepartment(departmentId.target.value)
  }


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
    const fileInput = document.getElementById('upload-input');
    fileInput.click();
  }, []);

  const bottomContent = (
    <div className="flex justify-between items-center">
      <span className="text-default-400 text-small">Total {filteredItems.length} students</span>
      <label className="flex items-center text-default-400 text-small">
        Rows per page:
        <select
          className="bg-transparent outline-none text-default-400 text-small"
          onChange={onRowsPerPageChange}
          value={rowsPerPage}
        >
          {[5, 10, 15].map((rows) => (
            <option key={rows} value={rows}>
              {rows}
            </option>
          ))}
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
      <div className="flex flex-row gap-2">
        <Select
          placeholder="Select Year"
          variant="bordered"
          size="sm"
          selectedKeys={academicYear ? [academicYear] : []}
          onSelectionChange={(keys) => setAcademicYear(Array.from(keys)[0])}
          startContent={<Calendar className="w-4 h-4 text-default-400" />}
          className="max-w-72 my-4"
        >
          {getAcademicYears(10).map((year) => (
            <SelectItem key={year.value} value={year.value}>
              {year.label}
            </SelectItem>
          ))}
        </Select>

        {profile?.role === "superadmin" && (
          <DepartmentDropdown
            instituteId={institute}
            onSelect={handleDepartmentSelect}
            className="w-full"
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
          className="my-4"
        />
      </div>
      <div className="flex justify-between gap-3 items-end">
        <Input
          isClearable
          classNames={{
            base: "w-full sm:max-w-[44%]",
            inputWrapper: "border-1",
          }}
          placeholder="Search by name or roll number..."
          size="sm"
          startContent={<SearchIcon className="text-default-300" />}
          value={filterValue}
          variant="bordered"
          onClear={() => setFilterValue("")}
          onValueChange={onSearchChange}
        />
        <div className="flex gap-3">
          <Dropdown>
            <DropdownTrigger className="hidden sm:flex">
              <Button
                endContent={<ChevronDownIcon className="text-small" />}
                size="sm"
                variant="flat"
              >
                Columns
              </Button>
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
                <DropdownItem key={column.uid} className="capitalize">
                  {capitalize(column.name)}
                </DropdownItem>
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
          <Button
            color="primary"
            variant="ghost"
            size="sm"
            onClick={openFileDialog}
            endContent={<FaFileUpload />}
          >
            Upload File
          </Button>
          <input
            id="upload-input"
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <Button
            color="primary"
            size="sm"
            variant="ghost"
            onClick={downloadExcel}
            endContent={<FaFileDownload />}
          >
            Download
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
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          isLoading={isLoading}
          loadingContent={<Spinner label="Please wait... fetching Data" />}
          emptyContent={
            <div className="flex flex-col items-center justify-center">
              <Image
                src="/student.svg"
                alt="No students found"
                width={850}
                height={850}
              />
              <p>No students found</p>
            </div>
          }
          items={items}
        >
          {(item) => (
            <TableRow key={item._id}>
              {headerColumns.map((column) => (
                <TableCell key={column.uid}>
                  {renderCell(item, column.uid)}
                </TableCell>
              ))}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="mt-4 flex justify-between items-center">
        <Pagination
          total={pages}
          page={page}
          onChange={(newPage) => setPage(newPage)}
        />
        <span>Total Students: {filteredItems.length}</span>
      </div>
      <StudentModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        mode={modalMode}
        student={selectedStudent}
        onSubmit={handleModalSubmit}
        instituteId={profile?.role === 'superadmin' ? profile?._id : profile?.institute?._id || ''}


      />
    </div>
  );
}