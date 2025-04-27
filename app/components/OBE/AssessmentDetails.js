"use client"
import { useState, useCallback } from "react"
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react"
import { Edit, Calendar } from "lucide-react"
import { useDisclosure } from "@nextui-org/react"
import { Modal, ModalContent, ModalHeader } from "@nextui-org/react"
import AssessmentForm from "./AssessmentForm"
import axios from "axios"
import { toast } from "sonner"

export default function AssessmentDetails({ assessment, onUpdate }) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isLoading, setIsLoading] = useState(false)
  const [courseOutcomes, setCourseOutcomes] = useState([])
  const [isLoadingCOs, setIsLoadingCOs] = useState(false)

  // Fetch course outcomes for the assessment's subject
  const fetchCourseOutcomes = useCallback(async () => {
    if (!assessment?.subject) return

    setIsLoadingCOs(true)
    try {
      const response = await axios.get(`/api/v2/obe/course-outcomes`, {
        params: { subjectId: assessment.subject },
      })

      if (response.data.success && Array.isArray(response.data.data)) {
        setCourseOutcomes(response.data.data)
      } else {
        setCourseOutcomes([])
      }
    } catch (error) {
      console.error("Error fetching course outcomes:", error)
      toast.error("Failed to load course outcomes")
      setCourseOutcomes([])
    } finally {
      setIsLoadingCOs(false)
    }
  }, [assessment])

  // Handle edit button click
  const handleEditClick = useCallback(() => {
    fetchCourseOutcomes()
    onOpen()
  }, [fetchCourseOutcomes, onOpen])

  // Handle assessment update
  const handleUpdateAssessment = useCallback(
    async (updatedData) => {
      if (!assessment?._id) {
        toast.error("Assessment ID is missing")
        return
      }

      setIsLoading(true)
      try {
        const response = await axios.put(`/api/v2/obe/assessments/${assessment._id}`, updatedData)

        if (response.data.success) {
          toast.success("Assessment updated successfully")
          onClose()

          // Notify parent to refresh data
          if (typeof onUpdate === "function") {
            onUpdate()
          }
        } else {
          toast.error(response.data.message || "Failed to update assessment")
        }
      } catch (error) {
        console.error("Error updating assessment:", error)
        toast.error(error.response?.data?.message || "Failed to update assessment")
      } finally {
        setIsLoading(false)
      }
    },
    [assessment, onClose, onUpdate],
  )

  if (!assessment) {
    return (
      <Card>
        <CardBody>
          <p className="text-center text-gray-500">Assessment details not available</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <>
      <Card shadow="sm" className="p-5 w-full">
        <CardHeader className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Assessment Details</h3>
          <Button color="primary" variant="light" startContent={<Edit size={18} />} onClick={handleEditClick}>
            Edit
          </Button>
        </CardHeader>

        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-medium mb-3">General Information</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{assessment.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <Chip color="primary" variant="flat">
                    {assessment.type}
                  </Chip>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Maximum Marks</p>
                  <p className="font-medium">{assessment.maxMarks}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Assessment Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <p>
                      {assessment.assessmentDate
                        ? new Date(assessment.assessmentDate).toLocaleDateString()
                        : "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-md font-medium mb-3">Course Outcome Mapping</h4>
              {Array.isArray(assessment.coMapping) && assessment.coMapping.length > 0 ? (
                <Table shadow="sm" aria-label="CO Mapping" selectionMode="none" className="mt-2">
                  <TableHeader>
                    <TableColumn>Course Outcome</TableColumn>
                    <TableColumn>Marks Allocated</TableColumn>
                    <TableColumn>Percentage</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {assessment.coMapping.map((mapping, index) => (
                      <TableRow key={`co-mapping-${index}`}>
                        <TableCell>CO{mapping.coIndex}</TableCell>
                        <TableCell>{mapping.maxMarks}</TableCell>
                        <TableCell>{((mapping.maxMarks / assessment.maxMarks) * 100).toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-gray-500">No course outcomes mapped</p>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Edit Assessment Modal */}
      <Modal isOpen={isOpen} onOpenChange={onClose} size="xl" scrollBehavior="inside">
        <ModalContent>
          {(closeModal) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Edit Assessment</ModalHeader>
              <AssessmentForm
                key={assessment._id}
                assessment={assessment}
                subject={assessment.subject}
                courseOutcomes={courseOutcomes}
                onSubmit={handleUpdateAssessment}
                onClose={closeModal}
                isLoading={isLoading}
                academicYear={assessment.academicYear}
                semester={assessment.sem}
                isLoadingCOs={isLoadingCOs}
              />
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
