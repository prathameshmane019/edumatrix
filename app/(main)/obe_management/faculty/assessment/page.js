"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
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
} from "@nextui-org/react"
import { PlusIcon, EditIcon, TrashIcon, CalendarIcon, Users, FileText } from "lucide-react"
import { useDisclosure } from "@nextui-org/react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import axios from "axios"
import { SubjectDropdown } from "@/app/components/subject/SubjectDropdown"
import AssessmentForm from "@/app/components/OBE/AssessmentForm"
import { getAcademicYears } from "@/app/utils/acadmicYears"
import { useUser } from "@/app/context/UserContext"

export default function ManageAssessmentsPage({ subject: initialSubject }) {
  // Debug initial props
  console.log("ManageAssessmentsPage initial props:", { initialSubject })

  const { isOpen, onOpen, onClose } = useDisclosure()
  const router = useRouter()
  const [subject, setSubject] = useState(initialSubject || null)
  const [assessments, setAssessments] = useState([])
  const [selectedAssessment, setSelectedAssessment] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingAssessments, setIsLoadingAssessments] = useState(false)
  const [courseOutcomes, setCourseOutcomes] = useState([])
  const [isLoadingCOs, setIsLoadingCOs] = useState(false)

  const [filterSem, setFilterSem] = useState("")
  const [academicYear, setAcademicYear] = useState("")

  const { user } = useUser()

  // Academic year options
  const academicYearOptions = useMemo(
    () =>
      getAcademicYears(10).map((year) => ({
        key: year.value,
        value: year.value,
        label: year.label,
      })),
    [],
  )

  // Fetch assessments
  const fetchAssessments = useCallback(async (subId, acadYear = "", semester = "") => {
    if (!subId) {
      setAssessments([])
      return
    }

    console.log("Fetching assessments:", { subId, acadYear, semester })
    setIsLoadingAssessments(true)

    try {
      const response = await axios.get(`/api/v2/obe/assessments`, {
        params: {
          subjectId: subId,
          academicYear: acadYear,
          sem: semester,
        },
      })

      const assessmentData = Array.isArray(response.data.data) ? response.data.data : []
      console.log("Fetched assessments:", assessmentData)
      setAssessments(assessmentData)
    } catch (error) {
      console.error("Error fetching assessments:", error)
      toast.error(`Error fetching assessments: ${error.response?.data?.message || error.message}`)
    } finally {
      setIsLoadingAssessments(false)
    }
  }, [])

  // Fetch course outcomes
  const fetchCourseOutcomesForSubject = useCallback(async (subId) => {
    if (!subId) {
      setCourseOutcomes([])
      return
    }

    console.log("Fetching course outcomes:", { subId })
    setIsLoadingCOs(true)

    try {
      const response = await axios.get(`/api/v2/obe/course-outcomes`, {
        params: { subjectId: subId },
      })

      const relevantCOs = Array.isArray(response.data.data)
        ? response.data.data.filter((coDoc) => coDoc.outcomes && coDoc.outcomes.length > 0)
        : []

      console.log("Fetched course outcomes:", relevantCOs)
      setCourseOutcomes(relevantCOs)
    } catch (error) {
      console.error("Error fetching course outcomes:", error)
      toast.error(`Error fetching course outcomes: ${error.response?.data?.message || error.message}`)
      setCourseOutcomes([])
    } finally {
      setIsLoadingCOs(false)
    }
  }, [])

  // Effect to fetch data when filters change
  useEffect(() => {
    console.log("Filter changed, fetching data:", { subject, academicYear, filterSem })

    if (subject && academicYear) {
      // If we have both subject and year, fetch assessments and COs
      fetchAssessments(subject, academicYear, filterSem)
      fetchCourseOutcomesForSubject(subject)
    } else if (subject) {
      // If we only have subject, just fetch COs
      setAssessments([])
      fetchCourseOutcomesForSubject(subject)
    } else {
      // If we have neither, clear data
      setAssessments([])
      setCourseOutcomes([])
    }
  }, [subject, academicYear, filterSem, fetchAssessments, fetchCourseOutcomesForSubject])

  // Handle subject change
  const handleSubjectChange = useCallback((selectedSubject) => {
    console.log("Subject changed:", selectedSubject)
    setSubject(selectedSubject)
    setFilterSem("")
  }, [])

  // Handle academic year change
  const handleAcademicYearChange = useCallback((keys) => {
    const selectedYear = keys.size > 0 ? Array.from(keys)[0].toString() : ""
    console.log("Academic year changed:", selectedYear)
    setAcademicYear(selectedYear)
  }, [])

  // Handle semester filter change
  const handleFilterSemChange = useCallback((keys) => {
    const selectedSem = keys.size > 0 ? Array.from(keys)[0].toString() : ""
    console.log("Semester filter changed:", selectedSem)
    setFilterSem(selectedSem)
  }, [])

  // Handle add assessment
  const handleAddAssessment = useCallback(() => {
    if (!subject || !academicYear) {
      toast.info("Please select Academic Year and Subject first.")
      return
    }

    if (isLoadingCOs) {
      toast.info("Please wait, loading Course Outcomes...")
      return
    }

    console.log("Opening add assessment form")
    setSelectedAssessment(null)
    onOpen()
  }, [onOpen, subject, academicYear, isLoadingCOs])

  // Handle edit assessment
  const handleEditAssessment = useCallback(
    (assessment) => {
      if (isLoadingCOs) {
        toast.info("Please wait, loading Course Outcomes...")
        return
      }

      console.log("Opening edit assessment form:", assessment)
      setSelectedAssessment(assessment)
      onOpen()
    },
    [onOpen, isLoadingCOs],
  )

  // Navigate to assessment details page
  const handleViewAssessment = useCallback(
    (assessment) => {
      router.push(`assessment/${assessment._id}`)
    },
    [router],
  )

  // Handle save assessment
  const handleSaveAssessment = useCallback(
    async (assessmentData) => {
      if (!subject || !academicYear) {
        toast.error("Subject or Academic Year is missing.")
        return
      }

      console.log("Saving assessment:", assessmentData)
      setIsSubmitting(true)

      try {
        const url = selectedAssessment ? `/api/v2/obe/assessments/${selectedAssessment._id}` : "/api/v2/obe/assessments"

        const method = selectedAssessment ? "PUT" : "POST"

        // Prepare payload
        const payload = {
          ...assessmentData,
          subject: subject,
          academicYear: academicYear,
          sem: filterSem || assessmentData.sem,
        }

        // Validate semester for new assessments
        if (!selectedAssessment && !payload.sem) {
          toast.error("Semester is required for new assessments.")
          setIsSubmitting(false)
          return
        }

        console.log("Sending API request:", { method, url, payload })

        const response = await axios({
          method,
          url,
          data: payload,
        })

        console.log("API response:", response.data)
        toast.success(`Assessment ${selectedAssessment ? "updated" : "created"} successfully.`)

        // Refresh data
        fetchAssessments(subject, academicYear, filterSem)
        onClose()
      } catch (error) {
        console.error("Save Assessment Error:", error)

        // Extract error message
        const apiErrors = error.response?.data?.errors
        const errorMessage = apiErrors
          ? Object.values(apiErrors).join(". ")
          : error.response?.data?.message || error.message || "Unknown error"

        toast.error(`Error ${selectedAssessment ? "updating" : "creating"} assessment: ${errorMessage}`)
      } finally {
        setIsSubmitting(false)
      }
    },
    [selectedAssessment, subject, fetchAssessments, onClose, academicYear, filterSem],
  )

  // Handle delete assessment
  const handleDeleteAssessment = useCallback(
    async (assessmentId) => {
      if (!subject || !academicYear) {
        toast.error("Subject or Academic Year context is missing.")
        return
      }

      if (!window.confirm("Are you sure you want to delete this assessment? This action cannot be undone.")) {
        return
      }

      console.log("Deleting assessment:", assessmentId)
      setIsLoadingAssessments(true)

      try {
        await axios.delete(`/api/v2/obe/assessments/${assessmentId}`)
        toast.success("Assessment deleted successfully.")
        fetchAssessments(subject, academicYear, filterSem)
      } catch (error) {
        console.error("Delete Assessment Error:", error)
        toast.error(`Error deleting assessment: ${error.response?.data?.message || error.message || "Unknown error"}`)
      } finally {
        // fetchAssessments will set loading to false
      }
    },
    [subject, fetchAssessments, academicYear, filterSem],
  )

  // Table columns definition
  const columns = [
    { key: "name", label: "Name" },
    { key: "type", label: "Type" },
    { key: "maxMarks", label: "Max Marks" },
    { key: "assessmentDate", label: "Date" },
    { key: "coMapping", label: "CO Mapping" },
    { key: "actions", label: "Actions" },
  ]

  return (
    <div className="m-10">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Manage Assessments</h2>
          {subject && academicYear && (
            <p className="text-gray-500">
              Year: {academicYear} | Semester: {filterSem || "All"}
            </p>
          )}
          {!subject && academicYear && (
            <p className="text-gray-500">
              Year: {academicYear} | Semester: {filterSem || "All"} | Please select a subject.
            </p>
          )}
          {!academicYear && !subject && (
            <p className="text-gray-500">Select Academic Year and Subject to view assessments.</p>
          )}
        </div>
        <Button
          color="primary"
          startContent={<PlusIcon />}
          onClick={handleAddAssessment}
          isDisabled={!subject || isLoadingCOs || !academicYear}
        >
          Add Assessment
        </Button>
      </div>

      <div className="mb-4 flex gap-4 items-center flex-wrap">
        {/* Academic Year Select */}
        <Select
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

        {/* Semester Select */}
        <Select
          label="Semester"
          placeholder="Filter by Semester"
          selectedKeys={filterSem ? new Set([filterSem]) : new Set()}
          onSelectionChange={handleFilterSemChange}
          className="max-w-xs"
          isDisabled={!academicYear}
        >
          <SelectItem key="sem1" value="sem1">
            Semester 1
          </SelectItem>
          <SelectItem key="sem2" value="sem2">
            Semester 2
          </SelectItem>
        </Select>

        {/* Subject Dropdown */}
        <SubjectDropdown
          instituteId={user?.institute?._id}
          department={user?.department}
          academicYear={academicYear}
          onSelect={handleSubjectChange}
          facultyId={user?._id}
          selectedSubject={subject}
          label="Subject"
          semester={filterSem}
          className="max-w-xs"
          isDisabled={!academicYear}
          classNames={{
            base: "bg-white border-slate-200 rounded-lg shadow-sm hover:border-indigo-400 transition-all",
            label: "text-slate-700 font-medium",
          }}
        />

        {/* Clear Filters Button */}
        {(academicYear || filterSem || subject) && (
          <Button
            size="sm"
            onPress={() => {
              setAcademicYear("")
              setFilterSem("")
              setSubject(null)
              setAssessments([])
              setCourseOutcomes([])
            }}
            color="secondary"
            variant="flat"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Loading Course Outcomes */}
      {isLoadingCOs && subject && academicYear && (
        <div className="flex justify-center py-4">
          <Spinner label="Loading Course Outcomes..." />
        </div>
      )}

      {/* Conditional Content Based on Filters */}
      {!academicYear ? (
        <p className="text-gray-500 py-8 text-center">Please select an Academic Year.</p>
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
                      <Chip key={`${assessment._id}-co-map-${index}`} size="sm" className="mr-1 mb-1">
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
                          e.stopPropagation()
                          handleViewAssessment(assessment)
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
                          e.stopPropagation()
                          router.push(`assessment/${assessment._id}?tab=marks`)
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
                          e.stopPropagation()
                          handleEditAssessment(assessment)
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
                          e.stopPropagation()
                          handleDeleteAssessment(assessment._id)
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

      {/* Assessment Form Modal */}
      <Modal isOpen={isOpen} onOpenChange={onClose} size="xl" scrollBehavior="inside">
        <ModalContent>
          {(closeModal) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {selectedAssessment ? "Edit Assessment" : "Add New Assessment"}
              </ModalHeader>
              <AssessmentForm
                key={selectedAssessment?._id || "new"}
                assessment={selectedAssessment}
                subject={subject}
                courseOutcomes={courseOutcomes}
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
    </div>
  )
}
