// ManageAssessmentsPage.jsx
"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Tooltip,
  Chip,
  CardBody,
  Card,
} from "@nextui-org/react";
import { PlusIcon, EditIcon, TrashIcon, CalendarIcon, Users, FileText } from "lucide-react";
import { useDisclosure } from "@nextui-org/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import axios from "axios";
import { SubjectDropdown } from "@/app/components/subject/SubjectDropdown";
import AssessmentForm from "@/app/components/OBE/AssessmentForm";
import AssessmentDeleteConfirmModal from "@/app/components/ConfirmModal/AssessmentDelete";
import { getAcademicYears } from "@/app/utils/acadmicYears";
import { useUser } from "@/app/context/UserContext";

export default function ManageAssessmentsPage({ subject: initialSubject }) {
  console.log("ManageAssessmentsPage initial props:", { initialSubject });

  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure(); // For AssessmentForm modal
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure(); // For delete modal
  const router = useRouter();
  const [subject, setSubject] = useState(initialSubject || null);
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [assessmentToDelete, setAssessmentToDelete] = useState(null); // New state for deletion
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAssessments, setIsLoadingAssessments] = useState(false);
  const [courseOutcomes, setCourseOutcomes] = useState([]);
  const [isLoadingCOs, setIsLoadingCOs] = useState(false);
  const [filterSem, setFilterSem] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const { user } = useUser();

  const academicYearOptions = useMemo(
    () =>
      getAcademicYears(10).map((year) => ({
        key: year.value,
        value: year.value,
        label: year.label,
      })),
    []
  );

  const fetchAssessments = useCallback(async (subId, acadYear = "", semester = "") => {
    if (!subId) {
      setAssessments([]);
      return;
    }
    console.log("Fetching assessments:", { subId, acadYear, semester });
    setIsLoadingAssessments(true);
    try {
      const response = await axios.get(`/api/v2/obe/assessments`, {
        params: {
          subjectId: subId,
          academicYear: acadYear,
          sem: semester,
        },
      });
      const assessmentData = Array.isArray(response.data.data) ? response.data.data : [];
      console.log("Fetched assessments:", assessmentData);
      setAssessments(assessmentData);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      toast.error(`Error fetching assessments: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoadingAssessments(false);
    }
  }, []);

  const fetchCourseOutcomesForSubject = useCallback(async (subId) => {
    if (!subId) {
      setCourseOutcomes([]);
      return;
    }
    console.log("Fetching course outcomes:", { subId });
    setIsLoadingCOs(true);
    try {
      const response = await axios.get(`/api/v2/obe/course-outcomes`, {
        params: { subjectId: subId },
      });
      const relevantCOs = Array.isArray(response.data.data)
        ? response.data.data.filter((coDoc) => coDoc.outcomes && coDoc.outcomes.length > 0)
        : [];
      console.log("Fetched course outcomes:", relevantCOs);
      setCourseOutcomes(relevantCOs);
    } catch (error) {
      console.error("Error fetching course outcomes:", error);
      toast.error(`Error fetching course outcomes: ${error.response?.data?.message || error.message}`);
      setCourseOutcomes([]);
    } finally {
      setIsLoadingCOs(false);
    }
  }, []);

  useEffect(() => {
    console.log("Filter changed, fetching data:", { subject, academicYear, filterSem });
    if (subject && academicYear) {
      fetchAssessments(subject, academicYear, filterSem);
      fetchCourseOutcomesForSubject(subject);
    } else if (subject) {
      setAssessments([]);
      fetchCourseOutcomesForSubject(subject);
    } else {
      setAssessments([]);
      setCourseOutcomes([]);
    }
  }, [subject, academicYear, filterSem, fetchAssessments, fetchCourseOutcomesForSubject]);

  const handleSubjectChange = useCallback((selectedSubject) => {
    console.log("Subject changed:", selectedSubject);
    setSubject(selectedSubject);
  }, []);

  const handleAcademicYearChange = useCallback((keys) => {
    const selectedYear = keys.size > 0 ? Array.from(keys)[0].toString() : "";
    console.log("Academic year changed:", selectedYear);
    setAcademicYear(selectedYear);
    // Clear dependent selections
    setFilterSem("");
    setSubject(null);
    setAssessments([]);
    setCourseOutcomes([]);
  }, []);

  const handleFilterSemChange = useCallback((keys) => {
    const selectedSem = keys.size > 0 ? Array.from(keys)[0].toString() : "";
    console.log("Semester filter changed:", selectedSem);
    setFilterSem(selectedSem);
    // Clear subject when semester changes
    setSubject(null);
    setAssessments([]);
    setCourseOutcomes([]);
  }, []);

  const handleAddAssessment = useCallback(() => {
    if (!subject || !academicYear || !filterSem) {
      toast.info("Please select Academic Year, Semester, and Subject first.");
      return;
    }
    if (isLoadingCOs) {
      toast.info("Please wait, loading Course Outcomes...");
      return;
    }
    console.log("Opening add assessment form");
    setSelectedAssessment(null);
    onFormOpen();
  }, [onFormOpen, subject, academicYear, filterSem, isLoadingCOs]);

  const handleEditAssessment = useCallback(
    (assessment) => {
      if (isLoadingCOs) {
        toast.info("Please wait, loading Course Outcomes...");
        return;
      }
      console.log("Opening edit assessment form:", assessment);
      setSelectedAssessment(assessment);
      onFormOpen();
    },
    [onFormOpen, isLoadingCOs]
  );

  const handleViewAssessment = useCallback(
    (assessment) => {
      router.push(`assessment/${assessment._id}`);
    },
    [router]
  );

  const handleSaveAssessment = useCallback(
    async (assessmentData) => {
      if (!subject || !academicYear || !filterSem) {
        toast.error("Subject, Academic Year, or Semester is missing.");
        return;
      }
      console.log("Saving assessment:", assessmentData);
      setIsSubmitting(true);
      try {
        const url = selectedAssessment ? `/api/v2/obe/assessments/${selectedAssessment._id}` : "/api/v2/obe/assessments";
        const method = selectedAssessment ? "PUT" : "POST";
        const payload = {
          ...assessmentData,
          subject: subject,
          academicYear: academicYear,
          sem: filterSem || assessmentData.sem,
        };
        if (!selectedAssessment && !payload.sem) {
          toast.error("Semester is required for new assessments.");
          setIsSubmitting(false);
          return;
        }
        console.log("Sending API request:", { method, url, payload });
        const response = await axios({
          method,
          url,
          data: payload,
        });
        console.log("API response:", response.data);
        toast.success(`Assessment ${selectedAssessment ? "updated" : "created"} successfully.`);
        fetchAssessments(subject, academicYear, filterSem);
        onFormClose();
      } catch (error) {
        console.error("Save Assessment Error:", error);
        const apiErrors = error.response?.data?.errors;
        const errorMessage = apiErrors
          ? Object.values(apiErrors).join(". ")
          : error.response?.data?.message || error.message || "Unknown error";
        toast.error(`Error ${selectedAssessment ? "updating" : "creating"} assessment: ${errorMessage}`);
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedAssessment, subject, fetchAssessments, onFormClose, academicYear, filterSem]
  );

  const handleDeleteAssessment = useCallback(
    async (assessmentId) => {
      if (!subject || !academicYear || !filterSem) {
        toast.error("Subject, Academic Year, or Semester context is missing.");
        return;
      }
      console.log("Deleting assessment:", assessmentId);
      setIsLoadingAssessments(true);
      try {
        await axios.delete(`/api/v2/obe/assessments/${assessmentId}`);
        toast.success("Assessment deleted successfully.");
        fetchAssessments(subject, academicYear, filterSem);
      } catch (error) {
        console.error("Delete Assessment Error:", error);
        toast.error(`Error deleting assessment: ${error.response?.data?.message || error.message || "Unknown error"}`);
      } finally {
        setIsLoadingAssessments(false);
      }
    },
    [subject, fetchAssessments, academicYear, filterSem]
  );

  // New function to open delete modal
  const openDeleteModal = useCallback((assessment) => {
    console.log("Opening delete modal for assessment:", assessment);
    setAssessmentToDelete(assessment);
    onDeleteOpen();
  }, [onDeleteOpen]);

  // Memoize props to ensure stability
  const stableSubject = useMemo(() => subject, [subject]);
  const stableCourseOutcomes = useMemo(() => courseOutcomes, [JSON.stringify(courseOutcomes)]);

  const columns = [
    { key: "name", label: "Name" },
    { key: "type", label: "Type" },
    { key: "maxMarks", label: "Max Marks" },
    { key: "assessmentDate", label: "Date" },
    { key: "coMapping", label: "CO Mapping" },
    { key: "actions", label: "Actions" },
  ];

  // Helper function to check if subject dropdown should be enabled
  const isSubjectDropdownEnabled = academicYear && filterSem;

  return (
    <div className="m-10">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm overflow-hidden">
        <CardBody >
        <div>
          <h2 className="text-2xl font-semibold">Manage Assessments</h2>
          {subject && academicYear && filterSem && (
            <p className="text-gray-500">
              Year: {academicYear} | Semester: {filterSem || "All"}
            </p>
          )}
          {!subject && academicYear && filterSem && (
            <p className="text-gray-500">
              Year: {academicYear} | Semester: {filterSem} | Please select a subject.
            </p>
          )}
          {!academicYear && (
            <p className="text-gray-500">Please select Academic Year to begin.</p>
          )}
          {academicYear && !filterSem && (
            <p className="text-gray-500">Year: {academicYear} | Please select Semester.</p>
          )}
        </div>
        <div className="mb-4 flex justify-end">
        <Button
          color="primary"
          startContent={<PlusIcon />}
          onClick={handleAddAssessment}
          isDisabled={!subject || isLoadingCOs || !academicYear || !filterSem}
        >
          Add Assessment
        </Button> 
        </div>
      <div className="mb-4 flex gap-4 items-center flex-wrap">
        <Select
          label="Academic Year"
          placeholder="Select Academic Year"
          variant="bordered"
          selectedKeys={academicYear ? new Set([academicYear]) : new Set()}
          onSelectionChange={handleAcademicYearChange}
          startContent={<CalendarIcon size={18} className="text-indigo-600" />}
          className="max-w-xs"
          classNames={{
            trigger: "bg-white border-slate-200 rounded-lg shadow-sm hover:border-indigo-400 transition-all",
            label: "text-slate-700 font-medium",
          }}
        >
          {academicYearOptions.map((year) => (
            <SelectItem key={year.key} value={year.value} className="text-slate-900">
              {year.label}
            </SelectItem>
          ))}
        </Select>
<<<<<<< HEAD
        <Select
          label="Semester"
          placeholder="Select Semester"
=======
        <Select 
          variant="bordered"
          placeholder="Filter by Semester"
>>>>>>> 0e2187b028d72b246cdc381c47df0704ae3e9edf
          selectedKeys={filterSem ? new Set([filterSem]) : new Set()}
          onSelectionChange={handleFilterSemChange}
          className="max-w-xs"
          isDisabled={!academicYear}
          classNames={{
            trigger: "bg-white border-slate-200 rounded-lg shadow-sm hover:border-indigo-400 transition-all",
            label: "text-slate-700 font-medium",
          }}
        >
          <SelectItem key="sem1" value="sem1">
            Semester 1
          </SelectItem>
          <SelectItem key="sem2" value="sem2">
            Semester 2
          </SelectItem>
        </Select>
        <SubjectDropdown
          instituteId={user?.institute?._id}
          // department={user?.department}
          academicYear={academicYear}
          onSelect={handleSubjectChange}
          facultyId={academicYear && user?._id}
          selectedSubject={subject}
          label="Subject"
          // semester={filterSem}
          className="max-w-xs"
<<<<<<< HEAD
          isDisabled={!isSubjectDropdownEnabled}
=======
          // isDisabled={!academicYear}
>>>>>>> 0e2187b028d72b246cdc381c47df0704ae3e9edf
          classNames={{
            base: "bg-white border-slate-200 rounded-lg shadow-sm hover:border-indigo-400 transition-all",
            label: "text-slate-700 font-medium",
          }}
        />
        {(academicYear || filterSem || subject) && (
          <Button
            size="sm"
            onPress={() => {
              setAcademicYear("");
              setFilterSem("");
              setSubject(null);
              setAssessments([]);
              setCourseOutcomes([]);
            }}
            color="secondary"
            variant="flat"
          >
            Clear Filters
          </Button>
        )}
        </div> 
      </CardBody>
      </Card>
      <div className="flex flex-col justify-between items-center mb-4">
      {isLoadingCOs && !isLoadingAssessments && subject && academicYear && (
        <div className="flex justify-center py-4">
          <Spinner label="Loading Course Outcomes..." />
        </div>
      )}
      {!academicYear ? (
        <p className="text-gray-500 py-8 text-center">Please select an Academic Year.</p>
      ) : !filterSem ? (
        <p className="text-gray-500 py-8 text-center">Please select a Semester.</p>
      ) : !subject ? (
        <p className="text-gray-500 py-8 text-center">Please select a Subject.</p>
      ) : isLoadingAssessments ? (
        <div className="flex justify-center py-8">
          <Spinner label="Loading Assessments..." />
        </div>
      ) : assessments.length > 0 ? (
        <Table aria-label="Assessments Table" selectionMode="none">
          <TableHeader columns={columns}>
            {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
          </TableHeader>
          <TableBody items={assessments} emptyContent={"No assessments found for the selected filters."}>
            {(assessment) => (
              <TableRow
                key={assessment._id}
                className="cursor-pointer"
                onClick={() => handleViewAssessment(assessment)}
              >
                <TableCell>{assessment.name}</TableCell>
                <TableCell>
                  <Chip color="primary" variant="flat" size="sm">
                    {assessment.type}
                  </Chip>
                </TableCell>
                <TableCell>{assessment.maxMarks}</TableCell>
                <TableCell>
                  {assessment.assessmentDate ? new Date(assessment.assessmentDate).toLocaleDateString() : "-"}
                </TableCell>
                <TableCell>
                  {Array.isArray(assessment.coMapping) &&
                    assessment.coMapping.map((map, index) => (
                      <Chip variant="flat" color='warning' key={`${assessment._id}-co-map-${index}`} size="sm" className="mr-1 mb-1">
                        {`CO${map.coIndex} (${map.maxMarks})`}
                      </Chip>
                    ))}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <Tooltip content="View Details">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewAssessment(assessment);
                        }}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Manage Student Marks">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        color="success"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`assessment/${assessment._id}?tab=marks`);
                        }}
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Edit">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="bordered"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditAssessment(assessment);
                        }}
                        isDisabled={isLoadingCOs}
                      >
                        <EditIcon className="h-4 w-4" />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Delete">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteModal(assessment); // Updated to open modal
                        }}
                        isDisabled={isLoadingAssessments}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      ) : (
        <p className="text-gray-500 py-8 text-center">No assessments found for the selected subject and filters.</p>
      )}
      <Modal backdrop='blur' isOpen={isFormOpen} onOpenChange={onFormClose} size="xl" scrollBehavior="inside">
        <ModalContent className="max-h-[90vh] overflow-y-auto">
          {(closeModal) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {selectedAssessment ? "Edit Assessment" : "Add New Assessment"}
              </ModalHeader>
              <AssessmentForm
                key={selectedAssessment?._id || "new"}
                assessment={selectedAssessment}
                subject={stableSubject}
                courseOutcomes={stableCourseOutcomes}
                onSubmit={handleSaveAssessment}
                onClose={closeModal}
                isLoading={isSubmitting}
                academicYear={academicYear}
                semester={filterSem}
                isLoadingCOs={isLoadingCOs}
              />
            </>
          )}
        </ModalContent>
      </Modal>
      <AssessmentDeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirmDelete={handleDeleteAssessment}
        assessment={assessmentToDelete}
      /> 
      </div>
    </div>
  );
}