"use client"

import React, { useState, useEffect } from "react"
import {
  Input,
  Button,
  Select,
  SelectItem,
  Textarea,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  ScrollShadow,
} from "@nextui-org/react"
import { toast } from "sonner"
import axios from "axios"

const QuestionPage = () => {
  const [formData, setFormData] = useState({
    feedbackType: "",
    subType: "",
    questions: [],
    feedbackId: "",
    resourcePerson: "",
    organization: "",
    note: "",
  })
  const [newQuestion, setNewQuestion] = useState("")
  const [savedQuestions, setSavedQuestions] = useState([])

  useEffect(() => {
    fetchSavedQuestions()
  }, [])

  const fetchSavedQuestions = async () => {
    try {
      const response = await axios.get("/api/questions")
      setSavedQuestions(response.data)
    } catch (error) {
      console.error(error)
      toast.error("Failed to fetch questions")
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const addQuestion = () => {
    if (newQuestion.trim()) {
      setFormData((prev) => ({ ...prev, questions: [...prev.questions, newQuestion] }))
      setNewQuestion("")
    }
  }

  const removeQuestion = (index) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post("/api/questions", formData)
      toast.success("Questions added successfully!")
      setFormData({
        feedbackType: "",
        subType: "",
        questions: [],
        feedbackId: "",
        resourcePerson: "",
        organization: "",
        note: "",
      })
      fetchSavedQuestions()
    } catch (error) {
      console.error(error)
      toast.error("Failed to add questions")
    }
  }

  const handleDeleteQuestionSet = async (id) => {
    try {
      await axios.delete(`/api/questions?_id=${id}`)
      toast.success("Question set deleted successfully!")
      fetchSavedQuestions()
    } catch (error) {
      console.error(error)
      toast.error("Failed to delete question set")
    }
  }

  return (
    <div className="container mx-auto my-8 space-y-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-4">
          <CardHeader>
            <h2 className="text-2xl font-semibold">Add Questions</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select
                label="Feedback Type *"
                name="feedbackType"
                value={formData.feedbackType}
                onChange={(e) => handleSelectChange("feedbackType", e.target.value)}
                required
              >
                <SelectItem key="academic" value="academic">
                  Academic
                </SelectItem>
                <SelectItem key="event" value="event">
                  External
                </SelectItem>
              </Select>

              {formData.feedbackType === "academic" && (
                <Select
                  label="Feedback Subtype *"
                  name="subType"
                  value={formData.subType}
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
              )}

              {formData.feedbackType === "event" && (
                <>
                  <Input
                    label="Feedback ID *"
                    name="feedbackId"
                    value={formData.feedbackId}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="Resource Person *"
                    name="resourcePerson"
                    value={formData.resourcePerson}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="Organization *"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    required
                  />
                  <Input label="Note" name="note" value={formData.note} onChange={handleChange} />
                </>
              )}

              <div className="flex space-x-2">
                <Textarea
                  label="New Question"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="flex-grow"
                />
                <Button onClick={addQuestion} disabled={!newQuestion.trim()}>
                  Add
                </Button>
              </div>
            </form>
          </CardBody>
          <CardFooter>
            <Button color="primary" onClick={handleSubmit}>
              Save Questions
            </Button>
          </CardFooter>
        </Card>

        <Card className="p-4">
          <CardHeader>
            <h2 className="text-2xl font-semibold">Saved Questions</h2>
          </CardHeader>
          <CardBody className="p-0">
            <ScrollShadow className="h-[400px]">
              <div className="p-4 space-y-4">
                {savedQuestions.map((questionSet) => (
                  <Card key={questionSet._id} className="p-4">
                    <CardHeader className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">
                        {questionSet.feedbackType} {questionSet.subType && `- ${questionSet.subType}`}
                      </h3>
                      <Button color="danger" size="sm" onClick={() => handleDeleteQuestionSet(questionSet._id)}>
                        Delete Set
                      </Button>
                    </CardHeader>
                    <CardBody>
                      {questionSet.feedbackType === "event" && (
                        <div className="mb-2 text-sm">
                          <p>
                            <strong>Feedback ID:</strong> {questionSet.feedbackId}
                          </p>
                          <p>
                            <strong>Resource Person:</strong> {questionSet.resourcePerson}
                          </p>
                          <p>
                            <strong>Organization:</strong> {questionSet.organization}
                          </p>
                          <p>
                            <strong>Note:</strong> {questionSet.note}
                          </p>
                        </div>
                      )}
                      {questionSet.questions.map((question, index) => (
                        <Textarea key={index} value={question} readOnly className="mb-2" />
                      ))}
                    </CardBody>
                  </Card>
                ))}
              </div>
            </ScrollShadow>
          </CardBody>
        </Card>
      </div>

      <Card className="p-4">
        <CardHeader>
          <h2 className="text-2xl font-semibold">Added Questions</h2>
        </CardHeader>
        <CardBody>
          {formData.questions.length > 0 ? (
            formData.questions.map((question, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <Textarea value={question} readOnly className="flex-grow" />
                <Button color="danger" onClick={() => removeQuestion(index)}>
                  Remove
                </Button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No questions added yet. Add questions above.</p>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

export default QuestionPage

