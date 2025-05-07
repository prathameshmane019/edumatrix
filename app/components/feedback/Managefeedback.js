"use client"
import React, { useState, useEffect, useMemo, useCallback } from "react"
import axios from "axios"
import { useUser } from "@/app/context/UserContext"
import { toast } from "sonner"
import FeedbackTable from "./FeedbackTable"
import { Button, Card, CardBody, CardHeader, Divider, Input, Select, SelectItem, Spinner } from "@nextui-org/react"
import { DynamicFieldSelector } from "./DyanyamicFieldSelector"
import { Calendar } from "lucide-react"
import { SubjectInputs } from "./SubjectInuts"
import { getAcademicYears } from "@/app/utils/acadmicYears"
import { DepartmentDropdown } from "../department/DepartmentDropDowns"

const initialFormState = {
  feedbackTitle: "",
  feedbackType: "",
  subType: "",
  className: "",
  semester: "",
  academicYear: "",
  students: "",
  pwd: "",
  subjects: [{ subject: "", faculty: "", _id: "" }],
  department: "",
  institute: "",
  questions: [],
  selectedQuestionSet: null,
}

const FeedbackManagement = () => {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [feedbacks, setFeedbacks] = useState([])
  const { user } = useUser()
  const [formData, setFormData] = useState(initialFormState)
  const [loading, setLoading] = useState(false)
  const [questionSets, setQuestionSets] = useState([])
  const [selectedQuestionSet, setSelectedQuestionSet] = useState(null)
  const [selectedDepartment, setSelectedDepartment] = useState('')
  // Memoized academic years
  const academicYears = useMemo(() => getAcademicYears(5), [])

  // Fetch feedbacks safely
  const fetchFeedbacks = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      const response = await axios.get("/api/feedback", {
        params: {
          department: user?.id || selectedDepartment,
          institute: (user?.role === "admin" ? user?.institute?._id : user?._id)
          ,
        },
      })
      setFeedbacks(response.data)
    } catch (error) {
      toast.error("Failed to fetch feedbacks")
    } finally {
      setLoading(false)
    }
  }, [user, selectedDepartment])

  // Fetch questions safely
  const fetchQuestions = useCallback(async () => {
    const institute = formData.institute || (user?.role === "admin" ? user?.institute?._id : user?._id);

    if (!institute || !formData.feedbackType) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        institute,
        type: formData.feedbackType,
        ...(formData.feedbackType === "academic" && formData.subType && { subtype: formData.subType })
      })

      const response = await axios.get(`/api/questions?${params}`)

      console.log(response.data);

      if (formData.feedbackType === "academic") {
        setFormData(prev => ({
          ...prev,
          questions: response.data[0]?.questions || []
        }))
      } else {
        setQuestionSets(response.data)
      }
    } catch (error) {
      toast.error("Failed to fetch questions")
    } finally {
      setLoading(false)
    }
  }, [formData.feedbackType, formData.subType, formData.institute])

  // Lifecycle hooks
  useEffect(() => {
    if (user?.department || user?.id || selectedDepartment) {
      fetchFeedbacks()
    }
  }, [user, fetchFeedbacks])

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  // Handlers
  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }, [])

  const handleSelectChange = useCallback((name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === "feedbackType" || name === "subType" ? {
        questions: [],
        selectedQuestionSet: null
      } : {})
    }))
  }, [])

  const handleQuestionSetChange = useCallback((e) => {
    const selectedId = e.target.value
    const selected = questionSets.find(q => q._id === selectedId)

    setSelectedQuestionSet(selected)
    setFormData(prev => ({
      ...prev,
      selectedQuestionSet: selectedId,
      feedbackTitle: selected?.feedbackId,
      questions: selected?.questions || []
    }))
  }, [questionSets])

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Comprehensive validation
    const validationErrors = []

    if (!formData.feedbackTitle) validationErrors.push("Feedback Title is required")
    if (!formData.feedbackType) validationErrors.push("Feedback Type is required")
    if (!formData.students || formData.students <= 0) validationErrors.push("Valid number of students is required")
    if (!formData.pwd) validationErrors.push("Password is required")

    if (formData.feedbackType === "academic") {
      if (!formData.subType) validationErrors.push("Feedback Subtype is required")
      if (!formData.semester) validationErrors.push("Semester is required")
      if (!formData.academicYear) validationErrors.push("Academic Year is required")
      if (formData.subjects.length === 0) validationErrors.push("At least one subject is required")
    }

    if (formData.feedbackType === "event" && !formData.selectedQuestionSet) {
      validationErrors.push("Please select a Question Set")
    }

    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error))
      return
    }

    setLoading(true)
    try {
      const submissionData = {
        ...formData,
        department: user?.role === "superadmin" ? "CENTRAL" : user?.id,
        institute: (user?.role === "admin" ? user?.institute?._id : user?._id),
        class: formData.className,
        subjects: formData.subjects.map(({ subject, faculty, _id }) => ({
          subject,
          faculty,
          _id
        })),
        questions: formData.questions.map(q =>
          typeof q === "string" ? q : q.question
        )
      }

      const response = await axios.post("/api/feedback", submissionData)
      setFeedbacks(prev => [...prev, response.data.feedback])
      setShowFeedbackForm(false)
      toast.success("Feedback created successfully")
      setFormData(initialFormState)
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create feedback")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFeedback = async (id) => {
    setLoading(true)
    try {
      await axios.delete(`/api/feedback?_id=${id}`)
      setFeedbacks(feedbacks.filter((feedback) => feedback._id !== id))
      toast.success("Feedback deleted successfully.")
    } catch (error) {
      toast.error("Failed to delete feedback.")
    } finally {
      setLoading(false)
    }
  }

  const handleDepartmentChange = (value) => {
    setSelectedDepartment(value.target.value)
  }
  const handleToggleIsActive = async (id, isActive) => {
    setLoading(true)
    try {
      await axios.put(`/api/feedback?_id=${id}`, { isActive: !isActive })
      const updatedFeedbacks = feedbacks.map((feedback) =>
        feedback._id === id ? { ...feedback, isActive: !isActive } : feedback,
      )
      setFeedbacks(updatedFeedbacks)
      toast.success("Feedback state updated successfully.")
    } catch (error) {
      toast.error("Failed to update feedback state.")
    } finally {
      setLoading(false)
    }
  }

  // Render Academic Fields
  const renderAcademicFields = () => (
    <>
      <Select
        variant="bordered"
        label="Feedback Subtype"
        selectedKeys={formData.subType ? [formData.subType] : []}
        onChange={(e) => handleSelectChange("subType", e.target.value)}
        required
      >
        <SelectItem key="theory" value="theory">Theory</SelectItem>
        <SelectItem key="practical" value="practical">Practical</SelectItem>
      </Select>

      <Select
        variant="bordered"
        label="Semester"
        selectedKeys={formData.semester ? [formData.semester] : []}
        onChange={(e) => handleSelectChange("semester", e.target.value)}
        required
      >
        <SelectItem key="sem1" value="sem1">Sem 1</SelectItem>
        <SelectItem key="sem2" value="sem2">Sem 2</SelectItem>
      </Select>

      <Select
        variant="bordered"
        label="Academic Year"
        selectedKeys={formData.academicYear ? [formData.academicYear] : []}
        onChange={(e) => handleSelectChange("academicYear", e.target.value)}
        startContent={<Calendar className="w-4 h-4 text-default-400" />}
        required
      >
        {academicYears.map((year) => (
          <SelectItem key={year.value} value={year.value}>
            {year.label}
          </SelectItem>
        ))}
      </Select>

      <DynamicFieldSelector
        formData={formData}

        handleSelectChange={handleSelectChange}
        user={user}
      />

      <Input
        variant="bordered"
        label="Feedback Title"
        value={formData.feedbackTitle}
        onChange={handleChange}
        name="feedbackTitle"
        required
      />

      <SubjectInputs
        subjects={formData.subjects}
        onChange={(subjects) => setFormData(prev => ({ ...prev, subjects }))}
        formData={formData}
        className={formData.className}
      />
    </>
  )

  // Render Event Fields
  const renderEventFields = () => (
    <>
      <Select
        variant="bordered"
        label="Select Question Set"
        selectedKeys={formData.selectedQuestionSet ? [formData.selectedQuestionSet] : []}
        onChange={handleQuestionSetChange}
        required
      >
        {questionSets.map((q) => (
          <SelectItem key={q._id} value={q._id}>{q.feedbackId}</SelectItem>
        ))}
      </Select>

      <Input
        variant="bordered"
        label="Feedback Title"
        value={selectedQuestionSet?.feedbackId || ''}
        onChange={handleChange}
        name="feedbackTitle"
        required
      />

      <Input
        variant="bordered"
        label="Resource Person"
        value={selectedQuestionSet?.resourcePerson || ''}
        disabled
      />

      <Input
        variant="bordered"
        label="Organization"
        value={selectedQuestionSet?.organization || ''}
        disabled
      />
    </>
  )

  // Main render
  return (
    <div className="container mx-auto px-4 py-8">
      {user?.role === "superadmin" &&
        (
          <DepartmentDropdown
            instituteId={user?._id}
            includeCentral={true}
            selectedDepartment={selectedDepartment}
            onSelect={handleDepartmentChange}
            className="my-0"

          />)
      }
      {!showFeedbackForm && (
        <div className="flex justify-end mb-8">
          <Button color="primary" onClick={() => setShowFeedbackForm(true)}>
            Create Feedback
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center min-h-screen">
          <Spinner size="lg" />
        </div>
      ) : showFeedbackForm ? (
        <Card className="w-full max-w-3xl mx-auto p-5 shadow-md rounded-md">
          <CardHeader className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Create Feedback</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Select
                variant="bordered"
                label="Feedback Type"
                selectedKeys={formData.feedbackType ? [formData.feedbackType] : []}
                onChange={(e) => handleSelectChange("feedbackType", e.target.value)}
                required
              >
                <SelectItem key="academic" value="academic">Academic</SelectItem>
                <SelectItem key="event" value="event">Event</SelectItem>
              </Select>

              {formData.feedbackType === "academic" && renderAcademicFields()}
              {formData.feedbackType === "event" && renderEventFields()}

              <Input
                variant="bordered"
                type="number"
                label="Number of Students"
                value={formData.students}
                onChange={handleChange}
                name="students"
                min="1"
                required
              />

              <Input
                variant="bordered"
                type="password"
                label="Password"
                value={formData.pwd}
                onChange={handleChange}
                name="pwd"
                required
              />

              {formData.questions.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Questions:</h3>
                  <ul className="list-disc pl-5">
                    {formData.questions.map((question, index) => (
                      <li key={index}>
                        {typeof question === "string" ? question : question.question}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Divider className="my-4" />

              <div className="flex justify-end space-x-4">
                <Button
                  color="danger"
                  variant="light"
                  onClick={() => setShowFeedbackForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" /> : "Create Feedback"}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      ) : (
        <FeedbackTable
          feedbacks={feedbacks}
          onDelete={handleDeleteFeedback}
          onToggleActive={handleToggleIsActive}
        />
      )}
    </div>
  )
}

export default FeedbackManagement