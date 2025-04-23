"use client"
import { useState, useEffect, useCallback } from "react"
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Tooltip,
  Chip,
} from "@nextui-org/react"
import { Download, Upload, Save, Plus, Trash, FileSpreadsheet } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"
import * as XLSX from "xlsx"

export default function StudentMarksUpload({ assessment, onMarksUpdated }) {
  const [students, setStudents] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Fetch student marks for this assessment
  const fetchStudentMarks = useCallback(async () => {
    if (!assessment?._id) return

    setIsLoading(true)
    try {
      const response = await axios.get(`/api/v2/obe/student-marks`, {
        params: { assessmentId: assessment._id },
      })

      if (response.data.success && Array.isArray(response.data.data)) {
        setStudents(response.data.data)
      } else {
        setStudents([])
      }
    } catch (error) {
      console.error("Error fetching student marks:", error)
      toast.error("Failed to load student marks")
      setStudents([])
    } finally {
      setIsLoading(false)
    }
  }, [assessment])

  // Load student marks when assessment changes
  useEffect(() => {
    if (assessment?._id) {
      fetchStudentMarks()
    } else {
      setStudents([])
    }
  }, [assessment, fetchStudentMarks])

  // Handle mark change for a student
  const handleMarkChange = useCallback((studentId, value) => {
    // Validate input - only allow numbers and decimal points
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return

    setStudents((prev) => {
      const newStudents = prev.map((student) => {
        if (student._id === studentId) {
          return {
            ...student,
            marks: value === "" ? "" : Number(value),
          }
        }
        return student
      })

      setHasChanges(true)
      return newStudents
    })
  }, [])

  // Add a new student row
  const handleAddStudent = useCallback(() => {
    setStudents((prev) => [
      ...prev,
      {
        _id: "", // Temporary ID until saved
        rollNumber: "",
        name: "",
        marks: "",
        isNew: true,
      },
    ])

    setHasChanges(true)
  }, [])

  // Remove a student row
  const handleRemoveStudent = useCallback((studentId) => {
    setStudents((prev) => prev.filter((student) => student._id !== studentId))
    setHasChanges(true)
  }, [])

  // Update student info (name, roll number)
  const handleStudentInfoChange = useCallback((studentId, field, value) => {
    setStudents((prev) => {
      const newStudents = prev.map((student) => {
        if (student._id === studentId) {
          return {
            ...student,
            [field]: value,
          }
        }
        return student
      })

      setHasChanges(true)
      return newStudents
    })
  }, [])

  // Save all student marks
  const handleSaveMarks = useCallback(async () => {
    if (!assessment?._id) {
      toast.error("Assessment information is missing")
      return
    }

    // Validate data before saving
    const invalidEntries = students.filter((student) => {
      return (
        !student.rollNumber ||
        (student.marks !== 0 &&
          student.marks !== "" &&
          (isNaN(student.marks) || student.marks < 0 || student.marks > assessment.maxMarks))
      )
    })

    if (invalidEntries.length > 0) {
      toast.error("Please fix invalid entries before saving")
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        assessmentId: assessment._id,
        students: students.map((student) => ({
          _id: student._id ,
          rollNumber: student.rollNumber,
          name: student.name,
          marks: student.marks === "" ? null : Number(student.marks),
        })),
      }

      const response = await axios.post("/api/v2/obe/student-marks", payload)

      if (response.data.success) {
        toast.success("Student marks saved successfully")
        setHasChanges(false)

        // Refresh data to get server-generated IDs for new entries
        fetchStudentMarks()

        // Notify parent component if needed
        if (typeof onMarksUpdated === "function") {
          onMarksUpdated()
        }
      } else {
        toast.error(response.data.message || "Failed to save student marks")
      }
    } catch (error) {
      console.error("Error saving student marks:", error)
      toast.error(error.response?.data?.message || "Failed to save student marks")
    } finally {
      setIsSaving(false)
    }
  }, [assessment, students, fetchStudentMarks, onMarksUpdated])

  // Export marks to Excel
  const handleExportToExcel = useCallback(() => {
    if (!assessment || students.length === 0) {
      toast.error("No data to export")
      return
    }

    try {
      // Prepare data for export
      const exportData = students.map((student) => ({
        "Student ID": student._id || "",
        "Roll Number": student.rollNumber,
        "Student Name": student.name,
        Marks: student.marks === "" ? "Not Evaluated" : student.marks,
      }))

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData)

      // Create workbook and add the worksheet
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Student Marks")

      // Generate file name
      const fileName = `${assessment.name.replace(/\s+/g, "_")}_Marks.xlsx`

      // Save file
      XLSX.writeFile(wb, fileName)

      toast.success("Marks exported successfully")
    } catch (error) {
      console.error("Error exporting marks:", error)
      toast.error("Failed to export marks")
    }
  }, [assessment, students])

  // Import marks from Excel
  const handleImportFromExcel = useCallback((e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsUploading(true)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result)
        const workbook = XLSX.read(data, { type: "array" })

        // Get first worksheet
        const worksheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[worksheetName]

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        if (jsonData.length === 0) {
          toast.error("No data found in the Excel file")
          setIsUploading(false)
          return
        }

        // Map Excel data to our format
        const importedStudents = jsonData.map((row, index) => {
          // Try to find matching columns - be flexible with column names
          const _idKey = Object.keys(row).find(
            (key) => key.toLowerCase().includes("student") || key.toLowerCase().includes("id"),
          )
          const rollNumberKey = Object.keys(row).find(
            (key) => key.toLowerCase().includes("roll") || key.toLowerCase().includes("rollNumber"),
          )

          const nameKey = Object.keys(row).find(
            (key) => key.toLowerCase().includes("name"),
          )

          const marksKey = Object.keys(row).find(
            (key) => key.toLowerCase().includes("mark") || key.toLowerCase().includes("score"),
          )

          // Extract values or use defaults
          const _id = _idKey ? row[_idKey] : `Student_${index + 1}` // Temporary ID
          const rollNumber = rollNumberKey ? row[rollNumberKey] : `Student ${index + 1}`
          const name = nameKey ? row[nameKey] : ""
          const marks = marksKey
            ? row[marksKey] === "Not Evaluated" || row[marksKey] === ""
              ? ""
              : Number(row[marksKey])
            : ""

          return {
            _id: String(_id),
            rollNumber: String(rollNumber),
            name: String(name),
            marks: marks,
            isNew: true,
          }
        })

        // Update state with imported data
        setStudents(importedStudents)
        setHasChanges(true)
        toast.success(`Imported ${importedStudents.length} student records`)
      } catch (error) {
        console.error("Error importing Excel file:", error)
        toast.error("Failed to import Excel file")
      } finally {
        setIsUploading(false)
      }
    }

    reader.onerror = () => {
      toast.error("Error reading file")
      setIsUploading(false)
    }

    reader.readAsArrayBuffer(file)

    // Reset file input
    e.target.value = null
  }, [])

  // Prepare template for download
  const handleDownloadTemplate = useCallback(() => {
    try {
      // Create template data
      const templateData = [
        {
          "Student ID": "EN12345",
          "Roll Number": "12345",
          "Student Name": "John Doe",
          Marks: 85,
        },
        {
          "Student ID": "EN67890",
          "Roll Number": "67890",
          "Student Name": "Jane Smith",
          Marks: 92,
        },
      ]

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(templateData)

      // Create workbook and add the worksheet
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Template")

      // Save file
      XLSX.writeFile(wb, "student_marks_template.xlsx")

      toast.success("Template downloaded successfully")
    } catch (error) {
      console.error("Error creating template:", error)
      toast.error("Failed to create template")
    }
  }, [])

  if (!assessment) {
    return (
      <Card>
        <CardBody>
          <p className="text-center text-gray-500">Please select an assessment to manage student marks</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Student Marks: {assessment.name}</h3>
          <p className="text-sm text-gray-500">
            Max Marks: {assessment.maxMarks} | Type: {assessment.type}
          </p>
        </div>
        <div className="flex gap-2">
          <Tooltip content="Download Template">
            <Button isIconOnly variant="flat" color="primary" size="sm" onClick={handleDownloadTemplate}>
              <Download size={18} />
            </Button>
          </Tooltip>

          <Tooltip content="Import from Excel">
            <Button
              isIconOnly
              variant="flat"
              color="success"
              size="sm"
              isLoading={isUploading}
              as="label"
              htmlFor="excel-upload"
            >
              <Upload size={18} />
              <input
                id="excel-upload"
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleImportFromExcel}
                disabled={isUploading}
              />
            </Button>
          </Tooltip>

          <Tooltip content="Export to Excel">
            <Button
              isIconOnly
              variant="flat"
              color="secondary"
              size="sm"
              onClick={handleExportToExcel}
              isDisabled={students.length === 0}
            >
              <FileSpreadsheet size={18} />
            </Button>
          </Tooltip>

          <Button
            color="primary"
            startContent={<Save size={18} />}
            onClick={handleSaveMarks}
            isLoading={isSaving}
            isDisabled={!hasChanges || isSaving}
            size="sm"
          >
            Save Changes
          </Button>
        </div>
      </CardHeader>

      <CardBody>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner label="Loading student marks..." />
          </div>
        ) : (
          <>
            <div className="flex justify-between mb-4">
              <Button
                color="primary"
                variant="light"
                startContent={<Plus size={18} />}
                onClick={handleAddStudent}
                size="sm"
              >
                Add Student
              </Button>

              <div className="text-sm text-gray-500">
                {students.length} student{students.length !== 1 ? "s" : ""}
              </div>
            </div>

            <Table aria-label="Student Marks Table" selectionMode="none">
              <TableHeader>
                <TableColumn>Student ID</TableColumn>
                <TableColumn>Roll Number</TableColumn>
                <TableColumn>Name</TableColumn>
                <TableColumn>Marks</TableColumn>
                <TableColumn width={100}>Actions</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No students added yet. Add students or import from Excel.">
                {students.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell>  
                        <Input
                          size="sm"
                          value={student._id}
                          onChange={(e) => handleStudentInfoChange(student._id, "_id", e.target.value)}
                          placeholder="Enter student ID"
                          variant="bordered"
                          className="max-w-[150px]"
                        /> 
                    </TableCell>

                    <TableCell>
                      <Input
                        size="sm"
                        value={student.rollNumber}
                        onChange={(e) => handleStudentInfoChange(student._id, "rollNumber", e.target.value)}
                        placeholder="Enter roll number"
                        variant="bordered"
                        className="max-w-[150px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        size="sm"
                        value={student.name}
                        onChange={(e) => handleStudentInfoChange(student._id, "name", e.target.value)}
                        placeholder="Enter student name"
                        variant="bordered"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        size="sm"
                        value={student.marks === null ? "" : student.marks}
                        onChange={(e) => handleMarkChange(student._id, e.target.value)}
                        placeholder="Enter marks"
                        variant="bordered"
                        className="max-w-[100px]"
                        status={
                          student.marks !== "" &&
                          (isNaN(student.marks) || student.marks < 0 || student.marks > assessment.maxMarks)
                            ? "danger"
                            : "default"
                        }
                      />
                      {student.marks !== "" && student.marks > assessment.maxMarks && (
                        <span className="text-danger text-xs">Exceeds max marks</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        isIconOnly
                        variant="light"
                        color="danger"
                        size="sm"
                        onClick={() => handleRemoveStudent(student._id)}
                      >
                        <Trash size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {hasChanges && (
              <div className="mt-4 flex justify-end">
                <Chip color="warning" variant="flat">
                  Unsaved changes
                </Chip>
              </div>
            )}
          </>
        )}
      </CardBody>
    </Card>
  )
}