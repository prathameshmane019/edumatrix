// "use client"

// import React, { useState, useEffect, use } from "react"
// import { Input, Button, Select, SelectItem } from "@nextui-org/react"
// import { useUser } from "@/app/context/UserContext"
// import { generateFeedbackTitle } from "@/app/utils/feedbackUtils"
// import { SubjectInputs } from "./SubjectInuts"
// import {DynamicFieldSelector} from "./DyanyamicFieldSelector"
// import { Calendar } from "lucide-react"
// import { getAcademicYears } from "@/app/utils/acadmicYears"


// export const FeedbackForm = ({ onSubmit, onCancel }) => {
//   const [formData, setFormData] = useState({
//     feedbackTitle: "",
//     feedbackType: "",
//     subType: "",
//     className: "",
//     semester: "",
//     academicYear: "",
//     students: "",
//     pwd: "",
//     subjects: [{ subject: "", faculty: "", _id: "" }],
//     department: "", // Add department to formData
//     institute:"" // Add institute to formData
//   })
//   const [generatedTitle, setGeneratedTitle] = useState("")

//   const {user} = useUser()

//   useEffect(() => {

//     if ( user?.role === "superadmin") {
//       setFormData((prev) => ({ ...prev,   institute: user?._id }))
//     }
//     else if ( user?.role === "admin") {
//       setFormData((prev) => ({ ...prev,  department: user?.id, institute: user?.institute
//       }))
//     }
//   }, [user])

//   useEffect(() => {
//     if (user && formData.className && formData.semester && formData.subType && formData.academicYear) {
//       setGeneratedTitle(
//         generateFeedbackTitle(
//           formData.academicYear,
//           formData.department,
//           formData.className ,
//           formData.subType,
//           formData.semester,
//         ),
//       )
//     }
//   }, [user, formData.className, formData.semester, formData.subType, formData.academicYear])

//   useEffect(() => {
//     if (formData.feedbackType === "event") {
//       setFormData((prev) => ({ ...prev, subType: "", semester: "", academicYear: "" }))
//     }
//   }, [formData.feedbackType])

//   useEffect(() => {
//     if(generatedTitle){
//       setFormData((prev) => ({ ...prev, feedbackTitle: generatedTitle }))
//     }
//   }, [generatedTitle])

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setFormData((prev) => ({ ...prev, [name]: value }))
//   }

//   const handleSelectChange = (name, value) => {
//     setFormData((prev) => ({ ...prev, [name]: value }))
//   }

//   const handleSubmit = (e) => {
//     e.preventDefault()
//     console.log(formData);

//     onSubmit(formData)

//   }

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       <Select
//         label="Feedback Type *"
//         name="feedbackType"
//         value={formData.feedbackType}
//         onChange={(e) => handleSelectChange("feedbackType", e.target.value)}
//         required
//       >
//         <SelectItem key="academic" value="academic">
//           Academic
//         </SelectItem>
//         <SelectItem key="event" value="event">
//           External
//         </SelectItem>
//       </Select>

//       {formData.feedbackType === "academic" && (
//         <>
//           <Select
//             label="Feedback Subtype *"
//             name="subType"
//             value={formData.subType}
//             onChange={(e) => handleSelectChange("subType", e.target.value)}
//             required
//           >
//             <SelectItem key="theory" value="theory">
//               Theory
//             </SelectItem>
//             <SelectItem key="practical" value="practical">
//               Practical
//             </SelectItem>
//           </Select>
//           <Select
//             label="Semester *"
//             name="semester"
//             value={formData.semester}
//             onChange={(e) => handleSelectChange("semester", e.target.value)}
//             required
//           >
//             <SelectItem key="sem1" value="sem1">
//               Sem 1
//             </SelectItem>
//             <SelectItem key="sem2" value="sem2">
//               Sem 2
//             </SelectItem>
//           </Select>
//           <Select
//             placeholder="Select Year"
//             variant="bordered"
//             size="sm"
//             selectedKeys={formData.academicYear ? [formData.academicYear] : []}
//             onSelectionChange={(keys) => handleSelectChange("academicYear", Array.from(keys)[0])}
//             startContent={<Calendar className="w-4 h-4 text-default-400" />}
//             className="max-w-72 my-4"
//           >
//             {getAcademicYears(5).map((year) => (
//               <SelectItem key={year.value} value={year.value}>
//                 {year.label}
//               </SelectItem>
//             ))}
//           </Select>
//           <DynamicFieldSelector role={user?.role} formData={formData} handleSelectChange={handleSelectChange} />

//           {/* <Select
//             label="Academic Year *"
//             name="academicYear"
//             value={formData.academicYear}
//             onChange={(e) => handleSelectChange("academicYear", e.target.value)}
//             required
//           >
//             {getCurrentAcademicYearOptions().map((option, index) => (
//               <SelectItem key={index} value={option}>
//                 {option}
//               </SelectItem>
//             ))}
//           </Select> */}

//           {formData.subType === "practical" && (
//             <Input
//               label="Feedback Title"
//               name="feedbackTitle"
//               value={generatedTitle}
//               onChange={(e) => setGeneratedTitle(e.target.value)}
//             />
//           )}

//           <SubjectInputs
//             subjects={formData.subjects}
//             onChange={(subjects) => setFormData((prev) => ({ ...prev, subjects }))}
//           />
//         </>
//       )}

//       <Input
//         label="Number of Students *"
//         type="number"
//         name="students"
//         placeholder="Enter total number of students"
//         value={formData.students}
//         onChange={handleChange}
//         min="1"
//         required
//       />

//       <Input
//         label="Password *"
//         type="password"
//         name="pwd"
//         placeholder="Enter password"
//         value={formData.pwd}
//         onChange={handleChange}
//         required
//       />

//       <div className="flex justify-end space-x-4">
//         <Button color="secondary" onClick={onCancel}>
//           Cancel
//         </Button>
//         <Button color="primary" type="submit">
//           Create Feedback
//         </Button>
//       </div>
//     </form>
//   )
// }
"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { Input, Button, Select, SelectItem, Spinner } from "@nextui-org/react"
import { useUser } from "@/app/context/UserContext"
import { SubjectInputs } from "./SubjectInuts"
import { DynamicFieldSelector } from "./DyanyamicFieldSelector"
import { Calendar } from "lucide-react"
import { getAcademicYears } from "@/app/utils/acadmicYears"
import { useCallback } from "react"
import { Card, CardBody, CardHeader, Divider } from "@nextui-org/react"
export const FeedbackForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(() => {
    const savedFormData = localStorage.getItem("feedbackFormData")
    return savedFormData
      ? JSON.parse(savedFormData)
      : {
        feedbackTitle: "",
        feedbackType: "",
        subType: "",
        className: "",
        semester: "",
        academicYear: "",
        students: "",
        pwd: "",
        subjects: [{ subject: "", faculty: "", _id: "" }],
        department: "",
        institute: "",
        questions: [],
        selectedQuestionSet: null,
      }
  })

  const [loading, setLoading] = useState(false)
  const [questionSets, setQuestionSets] = useState([])
  const { user } = useUser()

  useEffect(() => {
    if (user?.role === "superadmin") {
      setFormData((prev) => ({ ...prev, institute: user?._id }))
    } else if (user?.role === "admin") {
      setFormData((prev) => ({
        ...prev,
        department: user?.id,
        institute: user?.institute,
      }))
    }
  }, [user])

  const fetchQuestions = useCallback(async () => {
    setLoading(true)
    try {
      let endpoint = `/api/questions?institute=${formData.institute}`
      if (formData.feedbackType === "academic") {
        endpoint += `&type=${formData.feedbackType}&subtype=${formData.subType}`
      } else if (formData.feedbackType === "event") {
        endpoint += "&type=event"
      }
      const response = await axios.get(endpoint)
      if (formData.feedbackType === "academic") {
        setFormData((prev) => ({ ...prev, questions: response.data[0]?.questions || [] }))
      } else {
        setQuestionSets(response.data)
      }
    } catch (error) {
      console.error("Error fetching questions:", error)
    } finally {
      setLoading(false)
    }
  }, [formData.feedbackType, formData.subType])

  useEffect(() => {
    if (
      formData.feedbackType &&
      (formData.feedbackType === "event" || (formData.feedbackType === "academic" && formData.subType))
    ) {
      fetchQuestions()
    }
  }, [formData.feedbackType, formData.subType, fetchQuestions])

  useEffect(() => {
    localStorage.setItem("feedbackFormData", JSON.stringify(formData))
  }, [formData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => {
      const newState = { ...prev, [name]: value }
      if (name === "feedbackType" || name === "subType") {
        newState.questions = []
        newState.selectedQuestionSet = null
      }
      return newState
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Submitting form data:", formData)
    onSubmit(formData)
    localStorage.removeItem("feedbackFormData")
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Feedback Form</h2>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Select
            label="Feedback Type *"
            placeholder="Select feedback type"
            selectedKeys={formData.feedbackType ? [formData.feedbackType] : []}
            onChange={(e) => handleSelectChange("feedbackType", e.target.value)}
            required
          >
            <SelectItem key="academic" value="academic">
              Academic
            </SelectItem>
            <SelectItem key="event" value="event">
              Event
            </SelectItem>
          </Select>

          {formData.feedbackType === "academic" && (
            <>
              <Select
                label="Feedback Subtype *"
                placeholder="Select feedback subtype"
                selectedKeys={formData.subType ? [formData.subType] : []}
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

              <Select
                label="Semester *"
                placeholder="Select semester"
                selectedKeys={formData.semester ? [formData.semester] : []}
                onChange={(e) => handleSelectChange("semester", e.target.value)}
                required
              >
                <SelectItem key="sem1" value="sem1">
                  Sem 1
                </SelectItem>
                <SelectItem key="sem2" value="sem2">
                  Sem 2
                </SelectItem>
              </Select>

              <Select
                label="Academic Year *"
                placeholder="Select academic year"
                selectedKeys={formData.academicYear ? [formData.academicYear] : []}
                onChange={(e) => handleSelectChange("academicYear", e.target.value)}
                startContent={<Calendar className="w-4 h-4 text-default-400" />}
                required
              >
                {getAcademicYears(5).map((year) => (
                  <SelectItem key={year.value} value={year.value}>
                    {year.label}
                  </SelectItem>
                ))}
              </Select>

              <DynamicFieldSelector role={user?.role} formData={formData} handleSelectChange={handleSelectChange} />

              <Input
                label="Feedback Title *"
                placeholder="Enter feedback title"
                value={formData.feedbackTitle}
                onChange={(e) => handleChange({ target: { name: "feedbackTitle", value: e.target.value } })}
                required
              />

              <SubjectInputs
                subjects={formData.subjects}
                onChange={(subjects) => setFormData((prev) => ({ ...prev, subjects }))}
              />
            </>
          )}

          {formData.feedbackType === "event" && (
            <Select
              label="Select Question Set *"
              placeholder="Choose a question set"
              selectedKeys={formData.selectedQuestionSet ? [formData.selectedQuestionSet] : []}
              onChange={(e) => {
                const selectedId = e.target.value
                const selected = questionSets.find((q) => q._id === selectedId)
                setFormData((prev) => ({
                  ...prev,
                  selectedQuestionSet: selectedId,
                  feedbackTitle: selected?.feedbackId,
                  questions: selected?.questions || [],
                }))
              }}
              required
            >
              {questionSets.map((q) => (
                <SelectItem key={q._id} value={q._id}>
                  {q.feedbackId }
                </SelectItem>
              ))}
            </Select>
          )}

          <Input
            type="number"
            label="Number of Students *"
            placeholder="Enter total number of students"
            value={formData.students}
            onChange={(e) => handleChange({ target: { name: "students", value: e.target.value } })}
            min="1"
            required
          />

          <Input
            type="password"
            label="Password *"
            placeholder="Enter password"
            value={formData.pwd}
            onChange={(e) => handleChange({ target: { name: "pwd", value: e.target.value } })}
            required
          />

          {loading && <Spinner />}

          {!loading && formData.questions.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Questions:</h3>
              <ul className="list-disc pl-5">
                {formData.questions.map((question, index) => (
                  <li key={index}>{typeof question === "string" ? question : question.question}</li>
                ))}
              </ul>
            </div>
          )}

          <Divider className="my-4" />

          <div className="flex justify-end space-x-4">
            <Button color="danger" variant="light" onClick={onCancel}>
              Cancel
            </Button>
            <Button color="primary" type="submit">
              Create Feedback
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  )
}


