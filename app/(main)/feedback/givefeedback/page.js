"use client"
import React, { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Select, SelectItem } from "@nextui-org/react"

const SelectFeedback = () => {
  const [feedbackData, setFeedbackData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await axios.get("/api/fetchFeedback")
        console.log(response.data);
        setFeedbackData(response.data)
      } catch (error) {
        setError("Error fetching feedback data")
        toast.error("Error fetching feedback data")
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  const handleSelectFeedback = (feedbackId) => {
    router.push(`/feedback/givefeedback/${feedbackId}`)
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <div className="max-w-3xl w-full px-4 py-8 bg-white shadow-md rounded-lg mt-8">
        <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">Select Feedback</h2>
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <div className="mb-4">
            <label htmlFor="feedbackSelect" className="block mb-2 text-gray-700">
              Select Feedback:
            </label>
            <Select placeholder="Select Feedback" onChange={(e) => handleSelectFeedback(e.target.value)}>
              {feedbackData.map((feedback) => (
                <SelectItem key={feedback._id} value={feedback._id}>
                  {feedback.feedbackTitle}
                </SelectItem>
              ))}
            </Select>
          </div>
        )}
      </div>
    </div>
  )
}

export default SelectFeedback

