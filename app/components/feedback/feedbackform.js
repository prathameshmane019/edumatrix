"use client"

import { useState, useCallback, useEffect } from "react"
import axios from "axios"
import { Input, Button, Select, SelectItem, Spinner, Card, CardBody, CardHeader, Divider } from "@nextui-org/react"
import { SubjectInputs } from "./SubjectInuts"
import { DynamicFieldSelector } from "./DyanyamicFieldSelector"
import { Calendar } from "lucide-react"
import { getAcademicYears } from "@/app/utils/acadmicYears"
import { toast } from "sonner"

export const FeedbackForm = ({ onSubmit, onCancel, user }) => {
  const [formData, setFormData] = useState({
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
  })

  const [loading, setLoading] = useState(false)
  const [questionSets, setQuestionSets] = useState([])
  const [selectedQuestionSet, setSelectedQuestionSet] = useState(null);

  useEffect(() => {
    console.log(user);
    
    if (user?.role === "superadmin") {
      setFormData((prev) => ({ ...prev, institute: user?._id}))
    } else if (user?.role === "admin") {
      setFormData((prev) => ({
        ...prev,
        department: user?.id,
        institute: user?.institute,
      }))
    }
  }, [user])

  const fetchQuestions = useCallback(async () => {
    if (!formData.institute || !formData.feedbackType) return

    setLoading(true)
    try {
      let endpoint = `/api/questions?institute=${formData.institute}&type=${formData.feedbackType}`
      if (formData.feedbackType === "academic" && formData.subType) {
        endpoint += `&subtype=${formData.subType}`
      }
      const response = await axios.get(endpoint)
      if (formData.feedbackType === "academic") {
        setFormData((prev) => ({ ...prev, questions: response.data[0]?.questions || [] }))
      } else {
        setQuestionSets(response.data)
      }
    } catch (error) {
      console.error("Error fetching questions:", error)
      toast.error("Failed to fetch questions. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [formData.feedbackType, formData.subType, formData.institute])

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleSelectChange = useCallback((name, value) => {
    setFormData((prev) => {
      const newState = { ...prev, [name]: value }
      if (name === "feedbackType" || name === "subType") {
        newState.questions = []
        newState.selectedQuestionSet = null
      }
      return newState
    })
  }, [])
  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log(formData)
    console.log(user)

    const updatedFormData = { ...formData }

    if (user?.role === "superadmin") {
      updatedFormData.department = "CENTRAL"
    } else if (user?.role === "admin") {
      updatedFormData.department = user?.id
    }

    setLoading(true)

    try {
      console.log(updatedFormData)

      const submissionData = {
        ...updatedFormData,
        subjects: updatedFormData.subjects.map(({ subject, faculty, _id }) => ({ subject, faculty, _id })),
        questions: updatedFormData.questions.map((q) => (typeof q === "string" ? q : q.question)),
      }
      console.log(submissionData)

      await onSubmit(submissionData)
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast.error("Failed to create feedback. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Create Feedback</h2>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Select
            label="Feedback Type"
            placeholder="Select feedback type"
            selectedKeys={formData.feedbackType ? [formData.feedbackType] : []}
            onChange={(e) => handleSelectChange("feedbackType", e.target.value)}
            required
          >
            <SelectItem key="academic" value="academic">
              Academic
            </SelectItem>
            <SelectItem key="event" value="event">
              Event
            </SelectItem>
          </Select>

          {formData.feedbackType === "academic" && (
            <>
              <Select
                label="Feedback Subtype"
                placeholder="Select feedback subtype"
                selectedKeys={formData.subType ? [formData.subType] : []}
                onChange={(e) => handleSelectChange("subType", e.target.value)}
                required
              >
                <SelectItem key="theory" value="theory">
                  Theory
                </SelectItem>
                <SelectItem key="practical" value="practical">
                  Practical
                </SelectItem>
              </Select>

              <Select
                label="Semester"
                placeholder="Select semester"
                selectedKeys={formData.semester ? [formData.semester] : []}
                onChange={(e) => handleSelectChange("semester", e.target.value)}
                required
              >
                <SelectItem key="sem1" value="sem1">
                  Sem 1
                </SelectItem>
                <SelectItem key="sem2" value="sem2">
                  Sem 2
                </SelectItem>
              </Select>

              <Select
                label="Academic Year"
                placeholder="Select academic year"
                selectedKeys={formData.academicYear ? [formData.academicYear] : []}
                onChange={(e) => handleSelectChange("academicYear", e.target.value)}
                startContent={<Calendar className="w-4 h-4 text-default-400" />}
                required
              >
                {getAcademicYears(5).map((year) => (
                  <SelectItem key={year.value} value={year.value}>
                    {year.label}
                  </SelectItem>
                ))}
              </Select>

              <DynamicFieldSelector formData={formData} handleSelectChange={handleSelectChange} />

              <Input
                label="Feedback Title"
                placeholder="Enter feedback title"
                value={formData.feedbackTitle}
                onChange={handleChange}
                name="feedbackTitle"
                required
              />

              <SubjectInputs
                subjects={formData.subjects}
                onChange={(subjects) => setFormData((prev) => ({ ...prev, subjects }))}
                formData={formData}
                className={formData.className}
              />
            </>
          )}

          {formData.feedbackType === "event" && (
            <>
            <Select
              label="Select Question Set"
              placeholder="Choose a question set"
              selectedKeys={formData?.selectedQuestionSet ? [formData.selectedQuestionSet] : []}
              onChange={(e) => {
                const selectedId = e.target.value
                const selected = questionSets.find((q) => q._id === selectedId)
                setSelectedQuestionSet(selected)
                setFormData((prev) => ({
                  ...prev,
                  selectedQuestionSet: selectedId,
                  feedbackTitle: selected?.feedbackId,
                  questions: selected?.questions || [],
                }))
              }}
              required
            >
              {questionSets.map((q) => (
                <SelectItem key={q._id} value={q._id}>
                  {q.feedbackId}
                </SelectItem>
              ))}
            </Select>
           
                <div> 
                  <Input
                    id="feedbackTitle"
                    type="text"
                    name="feedbackTitle"
                    label="Feedback Title"
                    value={selectedQuestionSet?.feedbackId}
                    onChange={handleChange} /> 
                </div>
                <div>
                  
                  <Input label="Resource Person" value={ selectedQuestionSet?.resourcePerson} disabled />
                </div>
                <div>
                  <Input label="organization" value={selectedQuestionSet?.organization} disabled />
                </div>
                
              </> 
          )}

          <Input
            type="number"
            label="Number of Students"
            placeholder="Enter total number of students"
            value={formData.students}
            onChange={handleChange}
            name="students"
            min="1"
            required
          />

          <Input
            type="password"
            label="Password"
            placeholder="Enter password"
            value={formData.pwd}
            onChange={handleChange}
            name="pwd"
            required
          />

          {loading && <Spinner />}

          {!loading && formData.questions.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Questions:</h3>
              <ul className="list-disc pl-5">
                {formData.questions.map((question, index) => (
                  <li key={index}>{typeof question === "string" ? question : question.question}</li>
                ))}
              </ul>
            </div>
          )}

          <Divider className="my-4" />

          <div className="flex justify-end space-x-4">
            <Button color="danger" variant="light" onClick={onCancel}>
              Cancel
            </Button>
            <Button color="primary" type="submit" disabled={loading}>
              {loading ? <Spinner size="sm" /> : "Create Feedback"}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  )
}



