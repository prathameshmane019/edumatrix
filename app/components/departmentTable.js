"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import {
  Table,
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
  Pagination,
  Spinner,
  Tooltip,
} from "@nextui-org/react";
import { toast } from "sonner";
import { ChevronDownIcon } from "@/public/ChevronDownIcon";
import { SearchIcon } from "@/public/SearchIcon";
import { PlusIcon } from "@/public/PlusIcon";
import { EditIcon } from "@/public/EditIcon";
import { DeleteIcon } from "@/public/DeleteIcon";
import { capitalize } from "@/app/utils/utils";
import DepartmentModal from "./departmentModal";

const columns = [
  { uid: "id", name: "ID", sortable: true },
  { uid: "name", name: "Name", sortable: true },
  { uid: "password", name: "Password", sortable: true },
  { uid: "actions", name: "Actions" },
];

const INITIAL_VISIBLE_COLUMNS = ["id","name", "password","actions"];

export default function DepartmentTable() {
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "id",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    fetchDepartments();
  }, []);
 
  useEffect(() => {
    const storedProfile = sessionStorage.getItem('userProfile');
    if (storedProfile) {
      console.log("Raw stored profile:", storedProfile);
      try {
        const parsedProfile = JSON.parse(storedProfile);
        console.log("Parsed profile:", parsedProfile);
        setProfile(parsedProfile);
      } catch (error) {
        console.error("Error parsing profile:", error);
      }
    }
  }, []);

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/v2/department");
      setDepartments(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching departments:", error);
      setIsLoading(false);
    }
  };

  const deleteDepartment = async (_id) => {
    try {
      await axios.delete(`/api/v2/department?_id=${_id}`);
      fetchDepartments();
      toast.success("Department deleted successfully");
    } catch (error) {
      console.error("Error deleting department:", error);
      toast.error("Error deleting department");
    }
  };

  const pages = Math.ceil(departments.length / rowsPerPage);
  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) => visibleColumns.has(column.uid));
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredDepartments = [...departments];

    if (hasSearchFilter) {
      filteredDepartments = filteredDepartments.filter((department) =>
        department.department.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    return filteredDepartments;
  }, [departments, filterValue]);

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

  const renderCell = useCallback((department, columnKey) => {
    const cellValue = department[columnKey];
    switch (columnKey) {
      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Edit">
              <span
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                onClick={() => {
                  setEditingDepartment(department);
                  setModalOpen(true);
                }}
              >
                <EditIcon />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete">
              <span
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                onClick={() => deleteDepartment(department._id)}
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

  const onRowsPerPageChange = useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = useCallback((value) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingDepartment(null);
  };

  const handleModalSubmit = async (formData) => {
    try {
      if (editingDepartment) {
        console.log(editingDepartment);
        const updatedFormData = { ...formData, institute: profile._id };

        await axios.put(`/api/v2/department?_id=${editingDepartment._id}`, updatedFormData);
        toast.success("Department updated successfully");
      } else {
        const updatedFormData = { ...formData, institute: profile._id };

        await axios.post("/api/v2/department", updatedFormData);
        toast.success("Department added successfully");
      }
      fetchDepartments();
      handleModalClose();
    } catch (error) {
      console.error("Error saving department:", error);
      toast.error("Error saving department");
    }
  };

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search by department..."
            startContent={<SearchIcon />}
            value={filterValue}
            onClear={() => setFilterValue("")}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button endContent={<ChevronDownIcon />} variant="flat">
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
              endContent={<PlusIcon />}
              onClick={() => {
                setEditingDepartment(null);
                setModalOpen(true);
              }}
            >
              Add New
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {departments.length} departments
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    departments.length,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <Pagination
          showControls
          classNames={{
            cursor: "bg-foreground text-background",
          }}
          color="default"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <span className="text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${filteredItems.length} selected`}
        </span>
      </div>
    );
  }, [selectedKeys, filteredItems.length, page, pages]);

  return (
    <>
      <Table
        aria-label="Department table"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[382px]",
        }}
        selectedKeys={selectedKeys}
        selectionMode="none"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSelectionChange={setSelectedKeys}
        onSortChange={setSortDescriptor}
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
          items={sortedItems}
          loadingContent={<Spinner label="Please wait...fetching department data" />}
          isLoading={isLoading}
        >
          {(item) => (
            <TableRow key={item._id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <DepartmentModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        editingDepartment={editingDepartment}
      />
    </>
  );
}

