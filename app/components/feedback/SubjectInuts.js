import React, { useEffect, useState } from "react"
import { Input, Button, Spinner, Chip, Select, SelectItem, Card, CardBody, Divider } from "@nextui-org/react"
import axios from "axios"

export const SubjectInputs = ({ subjects, onChange, formData, className }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [availableSubjects, setAvailableSubjects] = useState([])
  const [selectedBatches, setSelectedBatches] = useState({})
  const [manualFields, setManualFields] = useState({
    manualSubject: "",
    manualFaculty: "",
    manualId: ""
  })
  
  // Fetch subjects when required parameters are available
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!className || !formData.semester || !formData.academicYear || !formData.subType) return
      
      setIsLoading(true)
      try {
        const response = await axios.get('/api/v2/feedback/subjects', {
          params: {
            class: className,
            sem: formData.semester,
            academicYear: formData.academicYear,
            subType: formData.subType
          }
        })
        
        setAvailableSubjects(response.data)
        
        // Initialize subjects based on subType
        if (response.data.length > 0 && 
            (subjects.length === 0 || 
             (subjects.length === 1 && !subjects[0].subject))) {
          if (formData.subType === 'theory') {
            // For theory, just set the subjects directly
            onChange(response.data.map(s => ({
              subject: s.subject,
              faculty: s.faculty,
              _id: s._id,
              subType: 'theory'
            })))
          } else if (formData.subType === 'practical') {
            // For practical, initialize with empty subjects
            // We'll let the user select batches first
            onChange([{ subject: "", faculty: "", _id: "", subType: "practical" }])
          }
        }
      } catch (error) {
        console.error("Failed to fetch subjects:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSubjects()
  }, [className, formData.semester, formData.academicYear, formData.subType])
  
  const handleSubjectChange = (index, field, value) => {
    const updatedSubjects = subjects.map((subject, i) => (i === index ? { ...subject, [field]: value } : subject))
    onChange(updatedSubjects)
  }

  const handleAddSubject = () => {
    onChange([...subjects, { subject: "", faculty: "", _id: "", subType: formData.subType }])
  }

  const handleRemoveSubject = (index) => {
    onChange(subjects.filter((_, i) => i !== index))
  }
  
  const handleBatchSelect = (subjectId, batchId) => {
    // Update the selected batches state
    setSelectedBatches(prev => {
      const currentBatches = prev[subjectId] || []
      
      // Toggle batch selection
      if (currentBatches.includes(batchId)) {
        return {
          ...prev,
          [subjectId]: currentBatches.filter(b => b !== batchId)
        }
      } else {
        return {
          ...prev,
          [subjectId]: [...currentBatches, batchId]
        }
      }
    })
    
    // Find the subject
    const subjectData = availableSubjects.find(s => s._id === subjectId)
    if (!subjectData) return
    
    // Check if this subject is already in our subjects list
    const existingIndex = subjects.findIndex(s => s._id === subjectId)
    
    // Update or add the subject with batch info
    const updatedSubject = {
      subject: subjectData.subject,
      _id: subjectId,
      subType: 'practical',
      batches: selectedBatches[subjectId] ? [...selectedBatches[subjectId], batchId] : [batchId]
    }
    
    // Add faculty info based on selected batches
    if (subjectData.batchFaculties) {
      const selectedBatchData = updatedSubject.batches.map(bId => {
        const batchFaculty = subjectData.batchFaculties.find(bf => bf.batchId === bId)
        return {
          batchId: bId,
          faculty: batchFaculty?.faculty || '',
          facultyId: batchFaculty?.facultyId || ''
        }
      })
      
      updatedSubject.batchFaculties = selectedBatchData
      // Set a main faculty for display
      if (selectedBatchData.length > 0) {
        updatedSubject.faculty = selectedBatchData[0].faculty
      }
    }
    
    // Update the subjects array
    let newSubjects = [...subjects]
    if (existingIndex >= 0) {
      newSubjects[existingIndex] = updatedSubject
    } else {
      newSubjects.push(updatedSubject)
    }
    
    // Ensure we're not saving duplicate batches
    newSubjects = newSubjects.map(subject => {
      if (subject._id === subjectId) {
        return {
          ...subject,
          batches: Array.from(new Set(subject.batches || []))
        }
      }
      return subject
    })
    
    onChange(newSubjects)
  }

  // Handle manual input fields
  const handleManualChange = (field, value) => {
    setManualFields(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddManualSubject = () => {
    // Add manually entered subject
    if (manualFields.manualSubject && manualFields.manualFaculty && manualFields.manualId) {
      onChange([...subjects, {
        subject: manualFields.manualSubject,
        faculty: manualFields.manualFaculty,
        _id: manualFields.manualId,
        subType: formData.subType
      }])
      
      // Clear manual fields
      setManualFields({
        manualSubject: "",
        manualFaculty: "",
        manualId: ""
      })
    }
  }

  const renderTheorySubjects = () => (
    <div className="space-y-4">
      {availableSubjects.length === 0 ? (
        <div className="text-center text-gray-500">
          No theory subjects found for the selected class and semester
        </div>
      ) : (
        availableSubjects.map((subject, index) => (
          <Card key={index} className="w-full">
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                <div>
                  <p className="text-sm text-gray-500">Subject</p>
                  <p className="font-medium">{subject.subject}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Faculty</p>
                  <p className="font-medium">{subject.faculty || "Not assigned"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Subject Code</p>
                  <p className="font-medium">{subject._id}</p>
                </div>
              </div>
              
              <div className="flex justify-end mt-2">
                <Button 
                  color={subjects.some(s => s._id === subject._id) ? "danger" : "primary"}
                  size="sm"
                  onClick={() => {
                    const isSelected = subjects.some(s => s._id === subject._id)
                    if (isSelected) {
                      // Remove subject
                      onChange(subjects.filter(s => s._id !== subject._id))
                    } else {
                      // Add subject
                      onChange([...subjects, {
                        subject: subject.subject,
                        faculty: subject.faculty,
                        _id: subject._id,
                        subType: 'theory'
                      }])
                    }
                  }}
                >
                  {subjects.some(s => s._id === subject._id) ? "Remove" : "Add"}
                </Button>
              </div>
            </CardBody>
          </Card>
        ))
      )}
      
      <Divider className="my-4" />
      
      <div className="mt-4">
        <p className="font-medium mb-2">Selected Subjects ({subjects.length})</p>
        {subjects.length === 0 ? (
          <p className="text-gray-500">No subjects selected</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {subjects.map((subject, index) => (
              <Chip 
                key={index} 
                onClose={() => handleRemoveSubject(index)} 
                variant="flat" 
                color="primary"
              >
                {subject.subject}
              </Chip>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderPracticalSubjects = () => (
    <div className="space-y-6">
      {availableSubjects.length === 0 ? (
        <div className="text-center text-gray-500">
          No practical subjects found for the selected class and semester
        </div>
      ) : (
        availableSubjects.map((subject, index) => (
          <Card key={index} className="w-full">
            <CardBody>
              <div className="mb-3">
                <h3 className="text-lg font-medium">{subject.subject}</h3>
                <p className="text-sm text-gray-500">Subject Code: {subject._id}</p>
              </div>
              
              <Divider className="my-3" />
              
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Available Batches:</p>
                <div className="flex flex-wrap gap-2">
                  {subject.batch && subject.batch.length > 0 ? (
                    subject.batch.map((batchId, batchIndex) => (
                      <Chip
                        key={batchIndex}
                        variant={selectedBatches[subject._id]?.includes(batchId) ? "solid" : "bordered"}
                        color="primary"
                        className="cursor-pointer"
                        onClick={() => handleBatchSelect(subject._id, batchId)}
                      >
                        Batch {batchId}
                      </Chip>
                    ))
                  ) : (
                    <p className="text-gray-500">No batches defined</p>
                  )}
                </div>
              </div>
              
              {selectedBatches[subject._id]?.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium mb-2">Selected Batches with Faculty:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedBatches[subject._id].map((batchId) => {
                      const batchFaculty = subject.batchFaculties?.find(bf => bf.batchId === batchId)
                      return (
                        <div key={batchId} className="p-2 border rounded">
                          <p><span className="font-medium">Batch {batchId}:</span> {batchFaculty?.faculty || "No faculty assigned"}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        ))
      )}
      
      <Divider className="my-4" />
      
      <div className="mt-4">
        <p className="font-medium mb-2">Selected Subjects with Batches ({subjects.filter(s => s._id).length})</p>
        {subjects.filter(s => s._id).length === 0 ? (
          <p className="text-gray-500">No subjects with batches selected</p>
        ) : (
          <div className="space-y-2">
            {subjects.filter(s => s._id).map((subject, index) => (
              <Card key={index} variant="flat">
                <CardBody>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{subject.subject}</p>
                      <p className="text-sm text-gray-500">
                        Batches: {subject.batches?.join(", ")}
                      </p>
                    </div>
                    <Button 
                      color="danger"
                      size="sm"
                      onClick={() => handleRemoveSubject(subjects.findIndex(s => s._id === subject._id))}
                    >
                      Remove
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  if (isLoading) {
    return <div className="flex justify-center p-4"><Spinner size="md" /></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          {formData.subType === 'theory' ? 'Theory Subjects' : 'Practical Subjects with Batches'}
        </h3>
        <Chip color="primary">{availableSubjects.length} Available</Chip>
      </div>
      
      {formData.subType === 'theory' ? renderTheorySubjects() : renderPracticalSubjects()}
      
      {/* Manual entry option */}
      <div className="mt-6">
        <Divider className="my-4" />
        <h3 className="text-lg font-medium mb-3">Add Subject Manually</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Subject Name *"
            placeholder="Enter subject name"
            value={manualFields.manualSubject}
            onChange={(e) => handleManualChange("manualSubject", e.target.value)}
          />
          <Input
            label="Faculty Name *"
            placeholder="Enter faculty name"
            value={manualFields.manualFaculty}
            onChange={(e) => handleManualChange("manualFaculty", e.target.value)}
          />
          <Input
            label="Subject Code *"
            placeholder="Enter subject code"
            value={manualFields.manualId}
            onChange={(e) => handleManualChange("manualId", e.target.value)}
          />
        </div>
        
        <Button 
          color="primary" 
          className="mt-3"
          onClick={handleAddManualSubject}
        >
          Add Manual Subject
        </Button>
      </div>
    </div>
  )
}