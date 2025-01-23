"use client"
import React, { useState, useEffect } from "react"
import {
  Button,
  Textarea,
  Input,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
} from "@nextui-org/react"
import { toast } from "sonner"
import axios from "axios"

const QuestionForm = () => {
  const [feedbackType, setFeedbackType] = useState("")
  const [subType, setSubType] = useState("")
  const [newQuestion, setNewQuestion] = useState("")
  const [questions, setQuestions] = useState([])
  const [savedQuestions, setSavedQuestions] = useState([])
  const [feedbackId, setFeedbackId] = useState("")
  const [resourcePerson, setResourcePerson] = useState("")
  const [organization, setOrganization] = useState("")
  const [note, setNote] = useState("")
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [questionSetToDelete, setQuestionSetToDelete] = useState(null)

  const fetchSavedQuestions = async () => {
    try {
      const response = await axios.get("/api/questions")
      setSavedQuestions(response.data)
    } catch (error) {
      console.error(error)
      toast.error("Failed to fetch questions")
    }
  }

  useEffect(() => {
    fetchSavedQuestions()
  }, [])

  useEffect(() => {
    setSubType("")
  }, [feedbackType])

  const handleQuestionChange = (index, value) => {
    const updatedQuestions = [...questions]
    updatedQuestions[index] = value
    setQuestions(updatedQuestions)
  }

  const handleCancel = () => {
    setQuestions([])
    setFeedbackType("")
    setSubType("")
    setFeedbackId("")
    setResourcePerson("")
    setOrganization("")
    setNote("")
  }

  const addQuestion = () => {
    if (newQuestion.trim()) {
      setQuestions([...questions, newQuestion])
      setNewQuestion("")
    }
  }

  const removeQuestion = (index) => {
    const updatedQuestions = [...questions]
    updatedQuestions.splice(index, 1)
    setQuestions(updatedQuestions)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!feedbackType) {
      toast.error("Please select a feedback type")
      return
    }

    if (feedbackType === "academic" && !subType) {
      toast.error("Please select a sub type")
      return
    }

    const data = {
      feedbackType,
      subType: feedbackType === "academic" ? subType : undefined,
      questions,
      ...(feedbackType === "event" && {
        feedbackId,
        resourcePerson,
        organization,
        note,
      }),
    }

    try {
      const response = await axios.post("/api/questions", data)
      console.log(response.data)
      handleCancel()
      fetchSavedQuestions()
      toast.success("Questions added successfully!")
    } catch (error) {
      console.error(error)
      toast.error("Failed to add questions")
    }
  }

  const handleDeleteQuestionSet = (questionSetId) => {
    setQuestionSetToDelete(questionSetId)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (questionSetToDelete) {
      try {
        await axios.delete(`/api/questions?_id=${questionSetToDelete}`)
        fetchSavedQuestions()
        toast.success("Question set deleted successfully!")
      } catch (error) {
        console.error(error)
        toast.error("Failed to delete question set")
      }
    }
    setIsDeleteModalOpen(false)
    setQuestionSetToDelete(null)
  }

  return (
    <div className="container mx-auto my-8 space-y-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add Questions Section */}
        <Card className="h-[600px]">
          <CardHeader className="flex flex-col items-start">
            <h4 className="text-2xl font-bold">Add Questions</h4>
            <p className="text-small text-default-500">Please generate questions for feedback</p>
          </CardHeader>
          <CardBody className="overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Feedback Type"
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value)}
                  isRequired
                  size="sm"
                  classNames={{
                    base: "border-2 border-purple-500 rounded-full",
                    trigger: "h-10 rounded-full",
                  }}
                >
                  <SelectItem key="academic" value="academic">
                    Academic
                  </SelectItem>
                  <SelectItem key="event" value="event">
                    External
                  </SelectItem>
                </Select>

                {feedbackType === "academic" && (
                  <Select
                    label="Sub Type"
                    value={subType}
                    onChange={(e) => setSubType(e.target.value)}
                    isRequired
                    size="sm"
                    classNames={{
                      base: "border-2 border-purple-500 rounded-full",
                      trigger: "h-10 rounded-full",
                    }}
                  >
                    <SelectItem key="theory" value="theory">
                      Theory
                    </SelectItem>
                    <SelectItem key="practical" value="practical">
                      Practical
                    </SelectItem>
                  </Select>
                )}
              </div>

              {feedbackType === "event" && (
                <div className="space-y-2">
                  <Input
                    value={feedbackId}
                    onChange={(e) => setFeedbackId(e.target.value)}
                    label="Feedback ID"
                    isRequired
                    size="sm"
                    classNames={{
                      base: "border-2 border-purple-500 rounded-full",
                      input: "h-8 rounded-full",
                    }}
                  />
                  <Input
                    value={resourcePerson}
                    onChange={(e) => setResourcePerson(e.target.value)}
                    label="Resource Person"
                    isRequired
                    size="sm"
                    classNames={{
                      base: "border-2 border-purple-500 rounded-full",
                      input: "h-8 rounded-full",
                    }}
                  />
                  <Input
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    label="Organization"
                    isRequired
                    size="sm"
                    classNames={{
                      base: "border-2 border-purple-500 rounded-full",
                      input: "h-8 rounded-full",
                    }}
                  />
                  <Input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    label="Add Note"
                    isRequired
                    size="sm"
                    classNames={{
                      base: "border-2 border-purple-500 rounded-full",
                      input: "h-8 rounded-full",
                    }}
                  />
                </div>
              )}

              <div className="flex space-x-2">
                <Textarea
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  label="Enter question here"
                  className="flex-grow"
                  size="sm"
                  classNames={{
                    base: "border-2 border-purple-500 rounded-full",
                    input: "h-20 rounded-full",
                  }}
                />
                <Button onClick={addQuestion} disabled={!newQuestion.trim()} size="sm" className="rounded-full">
                  Add
                </Button>
              </div>
            </form>
          </CardBody>
          <CardFooter className="justify-between">
            <Button color="danger" variant="flat" onClick={handleCancel} size="sm" className="rounded-full">
              Cancel
            </Button>
            <Button
              color="primary"
              onClick={handleSubmit}
              disabled={
                !feedbackType ||
                (feedbackType === "academic" && !subType) ||
                (feedbackType === "event" && (!feedbackId || !resourcePerson || !organization || !note)) ||
                questions.length === 0
              }
              size="sm"
              className="rounded-full"
            >
              Save
            </Button>
          </CardFooter>
        </Card>

        {/* Saved Questions Section */}
        <Card className="h-[600px]">
          <CardHeader>
            <h4 className="text-2xl font-bold">Saved Questions</h4>
          </CardHeader>
          <CardBody className="overflow-y-auto">
            {savedQuestions && savedQuestions.length > 0 ? (
              savedQuestions.map((questionSet, index) => (
                <Card key={questionSet._id || index} className="mb-6">
                  <CardBody>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold">
                        {questionSet.feedbackType} {questionSet.subType && `- ${questionSet.subType}`}
                      </h3>
                      <Button
                        size="sm"
                        color="danger"
                        onClick={() => handleDeleteQuestionSet(questionSet._id)}
                        className="rounded-full"
                      >
                        Delete Set
                      </Button>
                    </div>
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
                    {questionSet.questions.map((question, questionIndex) => (
                      <Textarea
                        key={questionIndex}
                        value={question}
                        readOnly
                        className="w-full text-sm mb-2"
                        size="sm"
                        classNames={{
                          base: "border-2 border-purple-500 rounded-full",
                          input: "h-12 rounded-full",
                        }}
                      />
                    ))}
                  </CardBody>
                </Card>
              ))
            ) : (
              <p className="text-gray-500 text-center">No questions saved yet.</p>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h4 className="text-2xl font-bold">Added Questions</h4>
        </CardHeader>
        <CardBody>
          {questions.length > 0 ? (
            questions.map((question, index) => (
              <div key={index} className="mb-4 flex items-center">
                <Textarea
                  value={question}
                  onChange={(e) => handleQuestionChange(index, e.target.value)}
                  className="flex-grow mr-2"
                  size="sm"
                  classNames={{
                    base: "border-2 border-purple-500 rounded-full",
                    input: "h-20 rounded-full",
                  }}
                />
                <Button color="danger" onClick={() => removeQuestion(index)} size="sm" className="rounded-full">
                  Remove
                </Button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No questions added yet. Please add questions above.</p>
          )}
        </CardBody>
      </Card>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <ModalContent>
          <ModalHeader>
            <h2 className="text-xl font-semibold">Confirm Deletion</h2>
          </ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete this question set? This action cannot be undone.</p>
          </ModalBody>
          <ModalFooter>
            <Button color="default" onClick={() => setIsDeleteModalOpen(false)} size="sm" className="rounded-full">
              Cancel
            </Button>
            <Button color="danger" onClick={confirmDelete} size="sm" className="rounded-full">
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

export default QuestionForm

