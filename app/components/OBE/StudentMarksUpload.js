"use client"
import { useState, useEffect, useCallback, useRef } from "react"
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
  const [coMapping, setCOMapping] = useState([])
  const inputRefs = useRef({})

  const fetchStudentMarks = useCallback(async () => {
    if (!assessment?._id) return

    setIsLoading(true)
    try {
      const response = await axios.get(`/api/v2/obe/student-marks`, {
        params: { assessmentId: assessment._id },
      })

      if (response.data.success && response.data.data) {
        const formattedStudents = (response.data.data.studentMarks || []).map(student => ({
          internalId: `internal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          student: student.student || "",
          rollNumber: student.rollNumber,
          name: student.name,
          totalMarks: student.totalMarks,
          coMarks: student.coMarks || []
        }))
        setStudents(formattedStudents)
        setCOMapping(response.data.data.coMapping || [])
      } else {
        setStudents([])
        setCOMapping([])
      }
    } catch (error) {
      console.error("Error fetching student marks:", error)
      toast.error("Failed to load student marks")
      setStudents([])
      setCOMapping([])
    } finally {
      setIsLoading(false)
    }
  }, [assessment])

  useEffect(() => {
    if (assessment?._id) {
      fetchStudentMarks()
    } else {
      setStudents([])
      setCOMapping([])
    }
  }, [assessment, fetchStudentMarks])

  const validateStudentId = useCallback((studentId, currentInternalId) => {
    if (!studentId) {
      return "Student ID is required"
    }
    if (!/^[A-Za-z0-9-]+$/.test(studentId)) {
      return "Student ID must be alphanumeric with hyphens"
    }
    const duplicate = students.some(
      student => student.student === studentId && student.internalId !== currentInternalId
    )
    if (duplicate) {
      return "Student ID already exists"
    }
    return null
  }, [students])

  // Also modify handleMarkChange to not try to restore focus
  const handleMarkChange = useCallback((internalId, coIndex, value) => {
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return

    setStudents((prev) => {
      const newStudents = prev.map((student) => {
        if (student.internalId === internalId) {
          const updatedCOMarks = [...(student.coMarks || [])]
          const coMarkIndex = updatedCOMarks.findIndex(co => co.coIndex === coIndex)

          if (coMarkIndex >= 0) {
            updatedCOMarks[coMarkIndex] = {
              coIndex,
              marks: value === "" ? 0 : Number(value)
            }
          } else {
            updatedCOMarks.push({
              coIndex,
              marks: value === "" ? 0 : Number(value)
            })
          }

          const totalMarks = updatedCOMarks.reduce((sum, co) => sum + (Number(co.marks) || 0), 0)

          return {
            ...student,
            coMarks: updatedCOMarks,
            totalMarks: totalMarks || null
          }
        }
        return student
      })

      setHasChanges(true)
      return newStudents
    })
  }, [])

  const handleAddStudent = useCallback(() => {
    const internalId = `internal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setStudents((prev) => [
      ...prev,
      {
        internalId,
        student: "",
        rollNumber: "",
        name: "",
        totalMarks: null,
        coMarks: coMapping.map(co => ({
          coIndex: co.coIndex,
          marks: 0
        })),
        isNew: true,
      },
    ])

    setHasChanges(true)
  }, [coMapping])

  const handleRemoveStudent = useCallback((internalId) => {
    setStudents((prev) => prev.filter((student) => student.internalId !== internalId))
    setHasChanges(true)
  }, [])

  const handleStudentInfoChange = useCallback((internalId, field, value) => {
    setStudents((prev) => {
      const newStudents = prev.map((student) => {
        if (student.internalId === internalId) {
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

  const hasInvalidEntries = useCallback(() => {
    return students.some((student) => {
      if (!student.rollNumber || !student.student) return true
      if (validateStudentId(student.student, student.internalId)) return true
      if (!Array.isArray(student.coMarks)) return true

      return student.coMarks.some((coMark) => {
        const coMappingEntry = coMapping.find(co => co.coIndex === coMark.coIndex)
        if (!coMappingEntry) return true
        return (
          coMark.marks !== 0 &&
          (isNaN(coMark.marks) || coMark.marks < 0 || coMark.marks > coMappingEntry.maxMarks)
        )
      })
    })
  }, [students, coMapping, validateStudentId])

  const handleSaveMarks = useCallback(async () => {
    if (!assessment?._id) {
      toast.error("Assessment information is missing")
      return
    }

    if (hasInvalidEntries()) {
      toast.error("Please fix invalid entries before saving")
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        assessmentId: assessment._id,
        students: students.map((student) => ({
          student: student.student,
          rollNumber: student.rollNumber,
          name: student.name,
          coMarks: student.coMarks.map(coMark => ({
            coIndex: coMark.coIndex,
            marks: coMark.marks === "" ? 0 : Number(coMark.marks)
          }))
        })),
      }

      const response = await axios.post("/api/v2/obe/student-marks", payload)

      if (response.data.success) {
        toast.success("Student marks saved successfully")
        setHasChanges(false)
        if (response.data.data) {
          const formattedStudents = response.data.data.map(student => ({
            internalId: `internal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            student: student.student,
            rollNumber: student.rollNumber,
            name: student.name,
            totalMarks: student.totalMarks,
            coMarks: student.coMarks
          }))
          setStudents(formattedStudents)
        } else {
          fetchStudentMarks()
        }
        if (typeof onMarksUpdated === "function") {
          onMarksUpdated()
        }
      } else {
        toast.error(response.data.message || "Failed to save student marks")
      }
    } catch (error) {
      console.error("Error saving student marks:", error)
      const errorMessage = error.response?.data?.message || "Failed to save student marks"
      const errors = error.response?.data?.errors || []
      toast.error(errorMessage)
      if (errors.length > 0) {
        errors.forEach(err => toast.error(err))
      }
    } finally {
      setIsSaving(false)
    }
  }, [assessment, students, coMapping, fetchStudentMarks, onMarksUpdated, hasInvalidEntries])

  const handleExportToExcel = useCallback(() => {
    if (!assessment || students.length === 0) {
      toast.error("No data to export")
      return
    }

    try {
      const exportData = students.map((student) => {
        const row = {
          "Student ID": student.student || "",
          "Roll Number": student.rollNumber,
          "Student Name": student.name,
          "Total Marks": student.totalMarks === null ? "Not Evaluated" : student.totalMarks,
        }
        student.coMarks.forEach((coMark) => {
          row[`CO${coMark.coIndex} Marks`] = coMark.marks === 0 ? "Not Evaluated" : coMark.marks
        })
        return row
      })

      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Student Marks")
      const fileName = `${assessment.name.replace(/\s+/g, "_")}_Marks.xlsx`
      XLSX.writeFile(wb, fileName)
      toast.success("Marks exported successfully")
    } catch (error) {
      console.error("Error exporting marks:", error)
      toast.error("Failed to export marks")
    }
  }, [assessment, students])

  const handleImportFromExcel = useCallback((e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsUploading(true)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result)
        const workbook = XLSX.read(data, { type: "array" })
        const worksheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[worksheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        if (jsonData.length === 0) {
          toast.error("No data found in the Excel file")
          setIsUploading(false)
          return
        }

        const validCOIndices = coMapping.map(co => co.coIndex)
        const importedStudents = jsonData.map((row, index) => {
          const studentIdKey = Object.keys(row).find(
            (key) => key.toLowerCase().includes("student") || key.toLowerCase().includes("id")
          )
          const rollNumberKey = Object.keys(row).find(
            (key) => key.toLowerCase().includes("roll") || key.toLowerCase().includes("rollnumber")
          )
          const nameKey = Object.keys(row).find(
            (key) => key.toLowerCase().includes("name")
          )

          const student = studentIdKey ? row[studentIdKey] : ""
          const rollNumber = rollNumberKey ? row[rollNumberKey] : `Student ${index + 1}`
          const name = nameKey ? row[nameKey] : ""

          const coMarks = validCOIndices.map((coIndex) => {
            const marksKey = Object.keys(row).find(
              (key) => key.toLowerCase().includes(`co${coIndex}`)
            )
            const marks = marksKey
              ? row[marksKey] === "Not Evaluated" || row[marksKey] === ""
                ? 0
                : Number(row[marksKey])
              : 0
            return {
              coIndex,
              marks
            }
          })

          const totalMarks = coMarks.reduce((sum, coMark) => sum + (Number(coMark.marks) || 0), 0)

          return {
            internalId: `internal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            student: String(student),
            rollNumber: String(rollNumber),
            name: String(name),
            totalMarks: totalMarks || null,
            coMarks,
            isNew: true,
          }
        })

        const idErrors = importedStudents.map((student, index) => ({
          index,
          error: validateStudentId(student.student, student.internalId)
        })).filter(item => item.error)

        if (idErrors.length > 0) {
          idErrors.forEach(({ index, error }) => {
            toast.error(`Row ${index + 2}: ${error}`)
          })
          setIsUploading(false)
          return
        }

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
    e.target.value = null
  }, [coMapping, validateStudentId])

  const handleDownloadTemplate = useCallback(() => {
    try {
      const templateData = [
        {
          "Student ID": "EN12345",
          "Roll Number": "12345",
          "Student Name": "John Doe",
          ...coMapping.reduce((acc, co) => ({
            ...acc,
            [`CO${co.coIndex} Marks`]: co.maxMarks / 2
          }), {})
        },
        {
          "Student ID": "EN67890",
          "Roll Number": "67890",
          "Student Name": "Jane Smith",
          ...coMapping.reduce((acc, co) => ({
            ...acc,
            [`CO${co.coIndex} Marks`]: co.maxMarks / 2
          }), {})
        },
      ]

      const ws = XLSX.utils.json_to_sheet(templateData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Template")
      XLSX.writeFile(wb, "student_marks_template.xlsx")
      toast.success("Template downloaded successfully")
    } catch (error) {
      console.error("Error creating template:", error)
      toast.error("Failed to create template")
    }
  }, [coMapping])

  // Function to set input ref
  const setInputRef = (el, key) => {
    if (el) {
      inputRefs.current[key] = el
    }
  }
  const registerInput = (el, key) => {
    if (el) {
      inputRefs.current[key] = el
    }
  }


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
    <Card className="w-full p-5" shadow="sm">
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
            isDisabled={!hasChanges || isSaving || hasInvalidEntries()}
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
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left border-b border-gray-200">
                    <th className="px-4 py-3 font-medium text-sm text-default-700">Student ID</th>
                    <th className="px-4 py-3 font-medium text-sm text-default-700">Roll Number</th>
                    <th className="px-4 py-3 font-medium text-sm text-default-700">Name</th>
                    {coMapping.map((co) => (
                      <th key={`header-co-${co.coIndex}`} className="px-4 py-3 font-medium text-sm text-default-700">
                        CO{co.coIndex} ({co.maxMarks})
                      </th>
                    ))}
                    <th className="px-4 py-3 font-medium text-sm text-default-700">Total Marks</th>
                    <th className="px-4 py-3 font-medium text-sm text-default-700 w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={5 + coMapping.length} className="px-4 py-6 text-center text-gray-500">
                        No students added yet. Add students or import from Excel.
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => {
                      const idError = validateStudentId(student.student, student.internalId);
                      return (
                        <tr key={student.internalId} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-2 py-2">
                            <div className="relative">
                              <input
                                type="text"
                                className={`w-32 px-3 py-2 text-sm border rounded-md outline-none focus:ring-2 focus:ring-primary focus:border-primary ${idError ? 'border-danger text-danger' : 'border-default-300'
                                  }`}
                                value={student.student}
                                onChange={(e) => handleStudentInfoChange(student.internalId, "student", e.target.value)}
                                placeholder="Enter student ID"
                              />
                              {idError && <p className="text-xs text-danger mt-1">{idError}</p>}
                            </div>
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="text"
                              className="w-32 px-3 py-2 text-sm border border-default-300 rounded-md outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                              value={student.rollNumber}
                              onChange={(e) => handleStudentInfoChange(student.internalId, "rollNumber", e.target.value)}
                              placeholder="Enter roll number"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="text"
                              className="w-40 px-3 py-2 text-sm border border-default-300 rounded-md outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                              value={student.name}
                              onChange={(e) => handleStudentInfoChange(student.internalId, "name", e.target.value)}
                              placeholder="Enter student name"
                            />
                          </td>
                          {coMapping.map((co) => {
                            const coMark = student.coMarks.find(cm => cm.coIndex === co.coIndex) || { marks: 0 };
                            const isInvalid = coMark.marks !== 0 &&
                              (isNaN(coMark.marks) || coMark.marks < 0 || coMark.marks > co.maxMarks);

                            return (
                              <td key={`co-${co.coIndex}`} className="px-2 py-2">
                                <div className="relative">
                                  <input
                                    type="text"
                                    className={`w-20 px-3 py-2 text-sm border rounded-md outline-none focus:ring-2 focus:ring-primary focus:border-primary ${isInvalid ? 'border-danger text-danger' : 'border-default-300'
                                      }`}
                                    value={coMark.marks === 0 ? "" : coMark.marks}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      if (value === "" || /^\d*\.?\d*$/.test(value)) {
                                        handleMarkChange(student.internalId, co.coIndex, value);
                                      }
                                    }}
                                    placeholder="Marks"
                                  />
                                  {isInvalid && coMark.marks > co.maxMarks && (
                                    <p className="text-xs text-danger mt-1">Max {co.maxMarks}</p>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                          <td className="px-4 py-2 text-sm">
                            {student.totalMarks === null ? "Not Evaluated" : student.totalMarks}
                          </td>
                          <td className="px-2 py-2">
                            <Button
                              isIconOnly
                              variant="light"
                              color="danger"
                              size="sm"
                              onClick={() => handleRemoveStudent(student.internalId)}
                            >
                              <Trash size={16} />
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Keep the original "unsaved changes" indicator */}
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