"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button, Input, Textarea } from "@nextui-org/react"
import { useDropzone } from "react-dropzone"

export default function GrievanceForm() {
  const [files, setFiles] = useState([])
  const router = useRouter()

  // Dropzone handlers
  const onDrop = (acceptedFiles) => {
    setFiles(acceptedFiles)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: "image/*"
  })

  const submitGrievance = async (formData) => {
    const response = await fetch('/api/v2/grievance', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to submit grievance')
    }

    return response.json()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    // Append each file to the FormData
    files.forEach((file, index) => {
      formData.append(`file${index}`, file)
    })

    try {
      await submitGrievance(formData)
      alert("Grievance submitted successfully!")
      router.push("/") // Redirect to home page or a confirmation page
    } catch (error) {
      console.error("Error submitting grievance:", error)
      alert("Failed to submit grievance. Please try again.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input label="Name" placeholder="Enter your name" name="name" required />
      <Input label="Email" placeholder="Enter your email" name="email" type="email" required />
      
      <Textarea
        label="Issue"
        placeholder="Please describe the issue you are facing"
        name="issue"
        minRows={5}
        required
      />

      <Textarea
        label="Suggestion"
        placeholder="Any suggestions to resolve the issue"
        name="suggestion"
        minRows={5}
      />

      {/* Dropzone for image upload */}
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-[#6E7F91] p-4 text-center bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-[#6E7F91]">Drop the image here...</p>
        ) : (
          <>
            <p className="text-[#6E7F91]">Drag & drop an image here, or click to select one</p>
            {files.length > 0 && (
              <div className="mt-2">
                <p>Selected files:</p>
                <ul className="list-disc pl-5">
                  {files.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      <Button type="submit" color="primary">
        Submit Grievance
      </Button>
    </form>
  )
}
