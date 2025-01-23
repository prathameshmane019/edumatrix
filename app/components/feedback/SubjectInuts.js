import React from "react"
import { Input, Button } from "@nextui-org/react"

export const SubjectInputs = ({ subjects, onChange }) => {
  const handleSubjectChange = (index, field, value) => {
    const updatedSubjects = subjects.map((subject, i) => (i === index ? { ...subject, [field]: value } : subject))
    onChange(updatedSubjects)
  }

  const handleAddSubject = () => {
    onChange([...subjects, { subject: "", faculty: "", _id: "" }])
  }

  const handleRemoveSubject = (index) => {
    onChange(subjects.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      {subjects.map((subject, index) => (
        <div key={index} className="grid grid-cols-3 gap-4">
          <Input
            label={`Subject ${index + 1} *`}
            value={subject.subject}
            onChange={(e) => handleSubjectChange(index, "subject", e.target.value)}
            required
          />
          <Input
            label={`Faculty ${index + 1} *`}
            value={subject.faculty}
            onChange={(e) => handleSubjectChange(index, "faculty", e.target.value)}
            required
          />
          <Input
            label={`Subject Code ${index + 1} *`}
            value={subject._id}
            onChange={(e) => handleSubjectChange(index, "_id", e.target.value)}
            required
          />
          <Button color="danger" onClick={() => handleRemoveSubject(index)}>
            Remove
          </Button>
        </div>
      ))}
      <Button color="primary" onClick={handleAddSubject}>
        Add Another Subject
      </Button>
    </div>
  )
}

