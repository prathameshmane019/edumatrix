
"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Input,
  Select,
  SelectItem,
  Checkbox,
} from "@nextui-org/react"
import { FacultyDropdown } from "./faculty/FacultyDropdown"
import { Calendar } from "lucide-react"
import { ClassDropdown } from "./Class/ClassDropdown"
import { getAcademicYears } from "../utils/acadmicYears"
import Loader from "./loader"

export default function SubjectModal({
  isOpen,
  onClose,
  department,
  mode,
  subjectData,
  onSubmit,
  classes,
  instituteId, 
}) {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    class: "",
    teacher: "",
    subType: "",
    batch: [],
    batchFaculties: [],
    sem: "",
    academicYear: "",
  })
 const [isSubmiting, setIsSubmiting] = useState(false);

  const [batches, setBatches] = useState([]) 
  useEffect(() => {
    if (subjectData && mode === "edit") {
      setFormData({
        id: subjectData.id || "",
        name: subjectData.name || "",
        class: subjectData.class?._id || "",
        teacher: subjectData.teacher?._id || "",
        subType: subjectData.subType || "",
        batch: subjectData.batch || [],
        batchFaculties:
          subjectData.batchFaculties?.map((bf) => ({
            batchId: bf.batchId,
            faculty: bf.faculty._id || bf.faculty,
          })) || [],
        sem: subjectData.sem || "",
        academicYear: subjectData.academicYear || "",
      })
    } else {
      resetForm()
    }
  }, [subjectData, mode])

  const handleBatches = (newBatches) => {
    // Keep existing batch assignments in edit mode
    if (mode === "edit") {
      const existingBatches = formData.batch.map(batchId => {
        const existingBatch = batches.find(b => b.id === batchId)
        return {
          id: batchId,
          type: existingBatch?.type || formData.subType
        }
      })

      // Combine existing batches with new ones, avoiding duplicates
      const combinedBatches = [...existingBatches]
      newBatches.forEach(newBatch => {
        if (!combinedBatches.some(b => b.id === newBatch.id)) {
          combinedBatches.push(newBatch)
        }
      })
      
      setBatches(combinedBatches)
    } else {
      setBatches(newBatches)
      setFormData((prev) => {
        const updatedBatchFaculties = newBatches.map((batch) => ({
          batchId: batch.id,
          faculty: "",
        }))

        return {
          ...prev,
          batch: newBatches.map((batch) => batch.id),
          batchFaculties: updatedBatchFaculties,
        }
      })
    }
  }

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      class: "",
      teacher: "",
      subType: "",
      batch: [],
      batchFaculties: [],
      sem: "",
      academicYear: "",
    })
    setBatches([])
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const updatedForm = { ...prev, [field]: value }

      if (field === "subType") {
        if (value === "theory") {
          updatedForm.batch = []
          updatedForm.batchFaculties = []
        } else {
          updatedForm.teacher = ""
        }
      } else if (field === "class" && mode === "add") {
        updatedForm.batch = []
        updatedForm.batchFaculties = []
      } 
      return updatedForm
    })
  }

  const handleBatchFacultyAssignment = (batchId, facultyId) => {
    setFormData((prev) => ({
      ...prev,
      batchFaculties: prev.batchFaculties.map((bf) => 
        bf.batchId === batchId ? { ...bf, faculty: facultyId } : bf
      ),
    }))
  }

  const handleBatchSelection = (batchId, isSelected) => {
    setFormData((prev) => {
      const newBatch = isSelected 
        ? [...prev.batch, batchId]
        : prev.batch.filter((id) => id !== batchId)

      let newBatchFaculties = [...prev.batchFaculties]
      if (isSelected) {
        if (!newBatchFaculties.some((bf) => bf.batchId === batchId)) {
          newBatchFaculties.push({ batchId, faculty: "" })
        }
      } else {
        newBatchFaculties = newBatchFaculties.filter((bf) => bf.batchId !== batchId)
      }

      return {
        ...prev,
        batch: newBatch,
        batchFaculties: newBatchFaculties,
      }
    })
  }

  const handleSubmit = async (e) => {
    if (isSubmiting) return // Prevent multiple submissions
    e.preventDefault()
    setIsSubmiting(true)
    try {
      const payload = {
        ...formData,
        department,
        institute: instituteId,
      } 
      if (formData.subType === "theory") {
        delete payload.batchFaculties
        delete payload.batch
      } else {
        delete payload.teacher
        console.log(formData.batchFaculties);
        
        payload.batchFaculties = formData.batchFaculties
          .filter((bf) => (formData.batch.includes(bf.batchId) && bf.faculty!==""))
          .map((bf) => ({
            batchId: bf.batchId,
            faculty: bf.faculty,
          }))
      }

      if (mode === "add") {
        await axios.post("/api/v2/subject", payload)
      } else {
        await axios.put(`/api/v2/subject?_id=${subjectData._id}`, payload)
      }
      onSubmit()
      onClose()
    } catch (error) {
      console.error("Error submitting subject:", error)
    }
    finally{
      setIsSubmiting(false)
    }
  }
 
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      backdrop="blur"
      className="max-w-[40vw] max-h-[80vh] overflow-y-auto"
    >
      <ModalContent>
        <ModalHeader>{mode === "add" ? "Add New Subject" : "Edit Subject"}</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit} className="w-full bg-white p-2 grid grid-cols-2 gap-4">
            <Input
              type="text"
              variant="bordered"
              size="sm"
              label="Subject ID"
              value={formData.id}
              onChange={(e) => handleInputChange("id", e.target.value)}
              required
              disabled={mode !== "add"}
              placeholder="Course ID"
              className="col-span-1 w-full"
            />
            <Input
              type="text"
              variant="bordered"
              placeholder="Subject Name"
              size="sm"
              label="Name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
              className="col-span-1 w-full"
            />
            <Select
              placeholder="Select Year"
              selectedKeys={formData.academicYear ? [formData.academicYear] : []}
              onSelectionChange={(keys) => handleInputChange("academicYear", Array.from(keys)[0])}
              startContent={<Calendar className="w-4 h-4 text-default-400" />}
              variant="bordered"
              size="sm"
              label="Academic Year"
              className="w-full"
            >
              {getAcademicYears(10).map((year) => (
                <SelectItem key={year.value} value={year.value}>
                  {year.label}
                </SelectItem>
              ))}
            </Select>
            <ClassDropdown
              id="class-select"
              instituteId={instituteId}
              onSelect={(value) => handleInputChange("class", value)}
              selectedClass={formData.class}
              acadmicYear={formData.academicYear}
              selectedDepartment={department}
              label="Class"
              handleBatches={handleBatches}
            />
            <Select
              label="Subject Type"
              placeholder="Select Subject Type"
              className="col-span-1 w-full"
              selectedKeys={[formData.subType]}
              onSelectionChange={(keys) => handleInputChange("subType", keys.currentKey)}
              required
              variant="bordered"
              size="sm"
            >
              <SelectItem key="theory" value="theory">
                Theory
              </SelectItem>
              <SelectItem key="practical" value="practical">
                Practical
              </SelectItem>
              <SelectItem key="tg" value="tg">
                Teacher Guardian
              </SelectItem>
            </Select>
            <Select
              label="Semester"
              placeholder="Select Semester"
              className="col-span-1 w-full"
              selectedKeys={[formData.sem]}
              onSelectionChange={(keys) => handleInputChange("sem", keys.currentKey)}
              required
              variant="bordered"
              size="sm"
            >
              <SelectItem key="sem1" value="sem1">
                Semester 1
              </SelectItem>
              <SelectItem key="sem2" value="sem2">
                Semester 2
              </SelectItem>
            </Select>
            {formData.subType === "theory" && (
              <FacultyDropdown
                instituteId={instituteId}
                onSelect={(value) => handleInputChange("teacher", value)}
                selectedFaculty={formData.teacher}
                className="w-full"
                label="Faculty"
              />
            )}
            {(formData.subType === "practical" || formData.subType === "tg") && batches.length > 0 && (
              <div className="col-span-2">
                <h3 className="text-lg font-semibold mb-2">Batch-Faculty Assignments</h3>
                {batches.filter(batch => batch.type===formData.subType).map((batch) => (
                  <div key={batch.id} className="flex gap-4 items-center mb-2">
                    <span className="w-24">{batch.id}</span>
                    <div className="flex gap-2 items-center w-full">
                      <Checkbox
                        isSelected={formData.batch.includes(batch.id)}
                        onValueChange={(isSelected) => handleBatchSelection(batch.id, isSelected)}
                      />
                      {formData.batch.includes(batch.id) && (
                        <FacultyDropdown
                          instituteId={instituteId}
                          onSelect={(value) => handleBatchFacultyAssignment(batch.id, value)}
                          selectedFaculty={
                            formData.batchFaculties.find((bf) => bf.batchId === batch.id)?.faculty || ""
                          }
                          className="w-full"
                          label={`Faculty for ${batch.id}`}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="col-span-2 flex justify-end gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="w-fit px-3 font-normal bg-gray-200 text-gray-600"
              >
                Cancel
              </Button>
              <Button isLoading={isSubmiting}  isDisabled={isSubmiting} type="submit" variant="flat" size="sm" color="primary" className="w-fit px-3 font-normal">
                {mode === "add" ? "Add Subject" : "Update Subject"}
              </Button>
            </div>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}