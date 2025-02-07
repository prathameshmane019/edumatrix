'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { ChevronDownIcon } from "@/public/ChevronDownIcon";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Input,
  Pagination,
  Spinner,
  Select,
  SelectItem,
} from '@nextui-org/react';
import { capitalize } from "@/app/utils/utils";
import { PlusIcon } from "@/public/PlusIcon";
import { EditIcon } from "@/public/EditIcon";
import { DeleteIcon } from "@/public/DeleteIcon";
import { SearchIcon } from "@/public/SearchIcon";
import SubjectModal from './subjectModal';
import Image from 'next/image';
import { getCurrentAcademicYear, getAcademicYears } from '@/app/utils/acadmicYears';
import { Calendar } from 'lucide-react';
import { ClassDropdown } from './Class/ClassDropdown';
import SubjectTableSkeleton from './SkeletonLoaders/SubjectTableSkeleton';
import SubjectDeleteConfirmModal from './ConfirmModal/SubjectDelete';

const columns = [
  { uid: "id", name: "ID", sortable: true },
  { uid: "name", name: "Subject Name", sortable: true },
  { uid: "class", name: "Class" },
  { uid: "teacher", name: "Faculty" },
  { uid: "department", name: "Department" },
  { uid: "actions", name: "Actions" },
];

const INITIAL_VISIBLE_COLUMNS = ["id", "name", "class", "teacher", "actions"];

export default function SubjectTable({ user }) {
  const [filterValue, setFilterValue] = useState("");
  const [visibleColumns, setVisibleColumns] = useState(new Set(INITIAL_VISIBLE_COLUMNS));
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [sortDescriptor, setSortDescriptor] = useState({ column: "name", direction: "ascending" });
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [classes, setClasses] = useState([]);
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [selectedSemester, setSelectedSemester] = useState('sem1');
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [institute, setInstitute] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  useEffect(() => {
    const storedProfile = sessionStorage.getItem('userProfile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
      setSelectedSemester(profile?.defaultSemester || 'sem1');
      setAcademicYear(profile?.defaultAcademicYear || getCurrentAcademicYear());
    }
  }, []);

  useEffect(() => {
    if (profile && profile.id && selectedClass) {
      fetchData();
    }
  }, [profile?.id, academicYear, selectedSemester, selectedClass]);

  useEffect(() => {
    if (profile) {
      const instituteId = profile.role === "superadmin" ? profile._id : profile.institute._id
      setInstitute(instituteId)
      setSelectedSemester(profile?.defaultSemester || 'sem1');
      setAcademicYear(profile?.defaultAcademicYear || getCurrentAcademicYear());
      setSelectedDepartment(profile.id)
    }
  }, [profile]);
  const fetchData = async () => {
    try {
      if(!selectedClass || !academicYear || !profile?.id){
        return
      }
      setIsLoading(true);
      const response = await axios.get(`/api/v2/subjectData?department=${profile.id}&acadmicYear=${academicYear}&sem=${selectedSemester}&class=${selectedClass}`);
      setSubjects(response.data.subjects);
      console.log(response.data);

      setClasses(response.data.classes);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassSelect = (value) => {
    setSelectedClass(value)
  }

  const handleDeleteClick = (subject) => {
    setSelectedSubject(subject);
    setIsDeleteModalOpen(true);
  };

 
  const confirmDelete = async (_id) => {
    try {
      await axios.delete(`/api/v2/subject?_id=${_id}`);
      fetchData();
      toast.success('Subject deleted successfully');
    } catch (error) {
      console.error("Error deleting subject:", error);
      toast.error('Error deleting subject');
    }
  };

  const pages = Math.ceil(subjects.length / rowsPerPage);
  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) => visibleColumns.has(column.uid));
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredSubjects = [...subjects];

    if (hasSearchFilter) {
      filteredSubjects = filteredSubjects.filter((subject) => {
        return (
          (subject.name && subject.name.toLowerCase().includes(filterValue.toLowerCase())) ||
          (subject.teacher && subject.teacher.toLowerCase().includes(filterValue.toLowerCase()))
        );
      });
    }

    return filteredSubjects;
  }, [subjects, filterValue, hasSearchFilter]);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = useCallback((subject, columnKey) => {
    const cellValue = subject[columnKey];
    switch (columnKey) {
      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            <span
              className="text-lg text-default-500 cursor-pointer active:opacity-50"
              onClick={() => {
                setModalMode("edit");
                setSelectedSubject(subject);
                setModalOpen(true);
              }}
            >
              <EditIcon />
            </span>
            <span
              className="text-lg text-danger cursor-pointer active:opacity-50"
              onClick={() => handleDeleteClick(subject)}
            >
              <DeleteIcon />
            </span>
          </div>
        );
      case "teacher":
        // Handle different subject types
        if (subject.subType === 'theory') {
          return <span>{subject.teacher?.name || 'N/A'}</span>;
        } else if (subject.subType === 'practical' || subject.subType === 'tg') {
          // Display batch-wise faculty assignments
          if (!subject.batchFaculties?.length) {
            return <span>No faculty assigned</span>;
          }
          return (
            <div className="flex flex-col gap-1">
              {subject.batchFaculties.map((bf, index) => (
                <div key={bf.batchId} className="text-sm">
                  <span className="font-medium">{bf.batchId}:</span>{' '}
                  <span>{bf?.faculty?.name || 'Unassigned'}</span>
                  {index < subject.batchFaculties.length - 1 && <span className="text-gray-300"> | </span>}
                </div>
              ))}
            </div>
          );
        }
        return <span>N/A</span>; case "class":
        return <span>{subject.class?.id || 'N/A'}</span>;
      default:
        return <span>{cellValue}</span>;
    }
  }, []);

  const renderHeader = (column) => {
    const columnName = capitalize(column.name);
    return (
      <div className="flex justify-between items-center">
        {columnName}
        {column.sortable && (
          <ChevronDownIcon
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
  };

  
  return (
    <>
      <div className="flex justify-between my-4 gap-3 items-end">
        <Select
          placeholder="Select Year"
          selectedKeys={academicYear ? [academicYear] : []}
          onSelectionChange={(keys) => setAcademicYear(Array.from(keys)[0])}
          startContent={<Calendar className="w-4 h-4 text-default-400" />}
          variant="bordered"
          size="sm"
          className="max-w-52"
        >
          {getAcademicYears(10).map((year) => (
            <SelectItem key={year.value} value={year.value}>
              {year.label}
            </SelectItem>
          ))}
        </Select>
        <ClassDropdown
          id="class-select"
          instituteId={institute}
          onSelect={handleClassSelect}
          selectedClass={selectedClass}
          acadmicYear={academicYear}
          selectedDepartment={selectedDepartment}

        />
        <Select
          placeholder="Select Semester"
          selectedKeys={[selectedSemester]}
          onSelectionChange={(keys) => setSelectedSemester(Array.from(keys)[0])}
          variant="bordered"
          size="sm"
          className="max-w-52"
        >
          <SelectItem key="sem1" value="sem1">
            Semester 1
          </SelectItem>
          <SelectItem key="sem2" value="sem2">
            Semester 2
          </SelectItem>
        </Select>
        <Input
          isClearable
          classNames={{ base: "w-full sm:max-w-[44%]", inputWrapper: "border-1" }}
          placeholder="Search by Subject name,"
          size="sm"
          startContent={<SearchIcon className="text-default-300" />}
          value={filterValue}
          variant="bordered"
          onClear={() => setFilterValue("")}
          onChange={(e) => setFilterValue(e.target.value)}
        />
        <div className="gap-4 items-center flex">
          <Button
            color="primary"
            startContent="Add New"
            size="sm"
            auto
            onClick={() => {
              setModalMode("add");
              setSelectedSubject(null);
              setModalOpen(true);
            }}
          >
            <PlusIcon /> Add Subject
          </Button>
        </div>
      </div>
      {sortedItems.length > 0 && !isLoading ? (
        <Table aria-label="Subject Table" sortDescriptor={sortDescriptor} onSortChange={setSortDescriptor}>
          <TableHeader columns={headerColumns}>
            {(column) => <TableColumn key={column.uid}>{renderHeader(column)}</TableColumn>}
          </TableHeader>
          <TableBody isLoading={isLoading} 
          loadingContent={<Spinner label="Please Wait ... fetching Subjects Data" />} 
          items={sortedItems}>
            {(item) => (
              <TableRow key={item._id}>
                {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
              </TableRow>
            )}
          </TableBody>
        </Table>
      ): isLoading ?
      <SubjectTableSkeleton/>
      : (
        <div className="flex flex-col items-center justify-center mt-4">
          <Image src="/subject.svg" alt="No subjects found" width={450} height={450} />
          <p className="mt-2 text-gray-500">No subjects found in selected criteria</p>
        </div>
      )}
      <Pagination total={pages} initialPage={1} onChange={(page) => setPage(page)} className="mt-4" />
      <SubjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        subjectData={selectedSubject}
        onSubmit={fetchData}
        classes={classes}
        instituteId={institute}
        department={profile?.id}
      />
       <SubjectDeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirmDelete={confirmDelete}
        subject={selectedSubject}
      />
    </>
  );
}