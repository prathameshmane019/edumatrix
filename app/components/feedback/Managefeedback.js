"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { useUser } from "@/app/context/UserContext"
import { toast } from "sonner"
import { FeedbackForm } from "./FeedbackForm"
import FeedbackTable from "./FeedbackTable"
import { Button, Spinner } from "@nextui-org/react"

const FeedbackManagement = () => {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(false)
  const { user, loading: userLoading } = useUser()

  useEffect(() => {
    if (user?.department || user?.id || "CENTRAL") {
      fetchFeedbacks()
    }
  }, [user, user?.id])

  const fetchFeedbacks = async () => {
    if (!user) {
      return
    }

    setLoading(true)
    try {
      const response = await axios.get("/api/feedback", {
        params: {
          department: user.department || user?.id || "CENTRAL",
          institute: user._id || user?.institute,
        },
      })
      setFeedbacks(response.data)
    } catch (error) {
      console.error("Error fetching feedbacks:", error)
      toast.error(error.response?.data?.error || "Failed to fetch feedbacks.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData) => {
    setLoading(true)
    try {
      
      if (formData.questions?.length === 0) {
        toast.error("Questions are missing. Contact superadmin to add questions and try again.")
        throw new Error("Questions are missing. Contact superadmin to add questions and try again.")
      }
      if (!formData.students || formData.students <= 0) {
        toast.error("Number of students must be a positive number.")
        throw new Error("Number of students must be a positive number.")
      }

      if (!formData.pwd) {
        toast.error("Password is required.")
        throw new Error("Password is required.")
      }

      if (formData.feedbackType=="academic" && !formData.department) {
        toast.error("Department is required.")
        throw new Error("Department is required.")
      }
      const response = await axios.post("/api/feedback", formData)
      setFeedbacks([...feedbacks, response.data.feedback])
      setShowFeedbackForm(false)
      toast.success("Feedback created successfully")
    } catch (error) {
      console.error("Error creating feedback:", error)
      toast.error(error.response?.data?.error || error.message)
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
      console.error("Error deleting feedback:", error)
      toast.error("Failed to delete feedback.")
    } finally {
      setLoading(false)
    }
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
      console.error("Error updating feedback state:", error)
      toast.error("Failed to update feedback state.")
    } finally {
      setLoading(false)
    }
  }

  if (loading || userLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {!showFeedbackForm && (
        <div className="flex justify-end mb-8">
          <Button color="primary" onClick={() => setShowFeedbackForm(true)}>
            Create Feedback
          </Button>
        </div>
      )}
      {showFeedbackForm ? (
        <FeedbackForm onSubmit={handleSubmit} onCancel={() => setShowFeedbackForm(false)} user={user} />
      ) : (
        <FeedbackTable feedbacks={feedbacks} onDelete={handleDeleteFeedback} onToggleActive={handleToggleIsActive} />
      )}
    </div>
  )
}

export default FeedbackManagement

