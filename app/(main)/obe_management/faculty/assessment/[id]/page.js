"use client"
import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardBody, Tabs, Tab, Spinner, Button, Breadcrumbs, BreadcrumbItem } from "@nextui-org/react"
import { ArrowLeft, FileText, Users, PieChart } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"
import StudentMarksUpload from "@/app/components/OBE/StudentMarksUpload"
import AssessmentDetails from "@/app/components/OBE/AssessmentDetails"
import AssessmentAnalytics from "@/app/components/OBE/AssessmentAnalytics"
import { useUser } from "@/app/context/UserContext"

export default function AssessmentPage({params}) {
 
  const router = useRouter()
  const [assessment, setAssessment] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("details")

  const {user} = useUser();
  const {id} = params; 
  // Fetch assessment data
  const fetchAssessment = useCallback(async () => {
    if (!params.id) return

    setIsLoading(true)
    try {
      const response = await axios.get(`/api/v2/obe/assessments/${id}`)

      if (response.data.success) {
        setAssessment(response.data.data)
      } else {
        toast.error("Failed to load assessment details")
        setAssessment(null)
      }
    } catch (error) {
      console.error("Error fetching assessment:", error)
      toast.error("Failed to load assessment details")
      setAssessment(null)
    } finally {
      setIsLoading(false)
    }
  }, [params.id])

  // Load assessment on mount
  useEffect(() => {
    fetchAssessment()
  }, [fetchAssessment])

  // Handle marks updated event
  const handleMarksUpdated = useCallback(() => {
    // Refresh assessment data if needed
    fetchAssessment()
  }, [fetchAssessment])

  // Navigate back to assessments list
  const handleBackClick = useCallback(() => {
    router.push("/manage-assessments")
  }, [router])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner label="Loading assessment details..." />
      </div>
    )
  }

  if (!assessment) {
    return (
      <Card className="m-10">
        <CardBody className="py-8">
          <div className="text-center">
            <p className="text-danger mb-4">Assessment not found or you don't have permission to view it.</p>
            <Button color="primary" variant="light" onClick={handleBackClick}>
              Back to Assessments
            </Button>
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="m-10">
      {/* Breadcrumbs */}
      <Breadcrumbs className="mb-4">
        <BreadcrumbItem onClick={handleBackClick} className="cursor-pointer">
          Assessments
        </BreadcrumbItem>
        <BreadcrumbItem>{assessment.name}</BreadcrumbItem>
      </Breadcrumbs>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button isIconOnly variant="light" onClick={handleBackClick} className="mr-2">
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{assessment.name}</h1>
            <p className="text-gray-500">
              {assessment.type} | {assessment.academicYear} | {assessment.sem === "sem1" ? "Semester 1" : "Semester 2"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs selectedKey={activeTab} onSelectionChange={setActiveTab} className="mb-6">
        <Tab
          key="details"
          title={
            <div className="flex items-center gap-2">
              <FileText size={18} />
              <span>Details</span>
            </div>
          }
        />
        <Tab
          key="marks"
          title={
            <div className="flex items-center gap-2">
              <Users size={18} />
              <span>Student Marks</span>
            </div>
          }
        />
        <Tab
          key="analytics"
          title={
            <div className="flex items-center gap-2">
              <PieChart size={18} />
              <span>Analytics</span>
            </div>
          }
        />
      </Tabs>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === "details" && <AssessmentDetails assessment={assessment} onUpdate={fetchAssessment} />}

        {activeTab === "marks" && <StudentMarksUpload assessment={assessment} onMarksUpdated={handleMarksUpdated} />}

        {activeTab === "analytics" && <AssessmentAnalytics assessment={assessment} />}
      </div>
    </div>
  )
}
