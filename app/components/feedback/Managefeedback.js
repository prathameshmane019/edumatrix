// "use client";
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useUser } from "@/app/context/UserContext";
// import { toast } from 'sonner';
// import { FiCopy } from 'react-icons/fi';
// import { X } from 'lucide-react';
// import { Loader2 } from 'lucide-react';
// import { 
//   Input, 
//   Button, 
//   Select, 
//   SelectItem, 
//   Switch, 
//   Spinner,
//   Table,
//   TableHeader,
//   TableColumn,
//   TableBody,
//   TableRow,
//   TableCell,
//   Modal,
//   ModalContent,
//   ModalHeader,
//   ModalBody,
//   ModalFooter,
//   useDisclosure,
//   Tooltip
// } from "@nextui-org/react";

// const FeedbackForm = () => {
//   const [userDepartment, setUserDepartment] = useState('');
//   const [showFeedbackForm, setShowFeedbackForm] = useState(false);
//   const [feedbacks, setFeedbacks] = useState([]);
//   const [academicYear, setAcademicYear] = useState('');
//   const [subType, setSubType] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [feedbackType, setFeedbackType] = useState('event');
//   const [className, setClassName] = useState('');
//   const [semester, setSemester] = useState('');
//   const [questions, setQuestions] = useState([]);
//   const [selectedQuestionSet, setSelectedQuestionSet] = useState(null);
//   const [copied, setCopied] = useState('');
//   const [generatedTitle, setGeneratedTitle] = useState('');
//   const { isOpen, onOpen, onClose } = useDisclosure();
//   const [feedbackToDelete, setFeedbackToDelete] = useState(null);
//   const [formData, setFormData] = useState({
//     feedbackTitle: '',
//     selectedQuestion: null,
//     subjects: [{ subject: '', faculty: '', _id: '' }],
//     students: '',
//     pwd: '',
//     department: '',
//     isActive: false,
//     feedbackType: ""
//   });

//   const user = useUser();

//   useEffect(() => {
//     if (user) {
//       setUserDepartment(user?.department);
//       setFormData({ ...formData, department: user?.department });
//     }
//   }, [user]);

//   useEffect(() => {
//     if (feedbackType == "academic" && (subType == "theory" || subType == "practical")) {
//       fetchQuestions();
//     }
//     if (feedbackType && feedbackType === 'event') {
//       fetchEventQuestions();
//     }
//   }, [feedbackType, subType]);

//   const fetchEventQuestions = async () => {
//     try {
//       const response = await axios.get(`/api/questions?type=event`);
//       setQuestions(response.data);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const fetchQuestions = async () => {
//     try {
//       setQuestions([])
//       if (feedbackType == "academic" && subType) {
//         const response = await axios.get(`/api/questions?type=${feedbackType}&subtype=${subType}`);
//         setQuestions(response.data[0].questions);
//       }
//     } catch (error) {
//       console.error('Error fetching questions:', error);
//     }
//   };

//   const handleChange = (e, index) => {
//     const { name, value } = e.target;
//     if (name === 'feedbackTitle') {
//       setFormData({ ...formData, feedbackTitle: value });
//     }
//     if (name.startsWith('subject')) {
//       const newSubjects = [...formData.subjects];
//       newSubjects[index].subject = value;
//       setFormData({ ...formData, subjects: newSubjects });
//     } else if (name.startsWith('faculty')) {
//       const newSubjects = [...formData.subjects];
//       newSubjects[index].faculty = value;
//       setFormData({ ...formData, subjects: newSubjects });
//     } else if (name.startsWith('_id')) {
//       const newSubjects = [...formData.subjects];
//       newSubjects[index]._id = value;
//       setFormData({ ...formData, subjects: newSubjects });
//     } else {
//       setFormData({ ...formData, [name]: value });
//     }
//   };

//   const handleAddSubject = () => {
//     setFormData({
//       ...formData,
//       subjects: [...formData.subjects, { subject: '', faculty: '', _id: '' }],
//     });
//   };

//   const handleRemoveSubject = (index) => {
//     const newSubjects = formData.subjects.filter((_, i) => i !== index);
//     setFormData({
//       ...formData,
//       subjects: newSubjects,
//     });
//   };

//   const handleCancel = () => {
//     setFeedbackType('');
//     setSubType('');
//     setClassName('');
//     setSemester('');
//     setQuestions([]);
//     setShowFeedbackForm(false);
//     setSelectedQuestionSet(null);
//     setGeneratedTitle('');
//     setFormData({
//       feedbackTitle: '',
//       selectedQuestion: [],
//       subjects: [{ subject: '', faculty: '', _id: '' }],
//       students: '',
//       pwd: '',
//       department: "",
//       isActive: false,
//       feedbackType: ""
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       let feedbackTitle;
//       if (feedbackType === 'academic' && subType === "practical") {
//         feedbackTitle = generatedTitle;
//       } else if (feedbackType === 'academic' && subType === "theory") {
//         feedbackTitle = generateFeedbackTitle();
//         if (!feedbackTitle) {
//           toast.error('All fields are required for academic feedback.');
//           throw new Error('All fields are required for academic feedback.');
//         }
//       } else {
//         feedbackTitle = selectedQuestionSet?.feedbackId || formData.feedbackTitle;
//         if (!feedbackTitle) {
//           toast.error('Feedback title is required.');
//           throw new Error('Feedback title is required.');
//         }
//       }

//       if (questions?.questions?.length == 0) {
//         toast.error('Questions are missing. Contact superadmin to add questions and try again.');
//         throw new Error('Questions are missing. Contact superadmin to add questions and try again.');
//       }
//       if (!formData.students || formData.students <= 0) {
//         toast.error('Number of students must be a positive number.');
//         throw new Error('Number of students must be a positive number.');
//       }

//       if (!formData.pwd) {
//         toast.error('Password is required.');
//         throw new Error('Password is required.');
//       }

//       if (!userDepartment) {
//         toast.error('Department is required.');
//         throw new Error('Department is required.');
//       }

//       const filteredSubjects = feedbackType === 'event' ? formData.subjects.filter(subject => subject.subject && subject.faculty && subject._id) : formData.subjects;

//       const updatedFormData = {
//         ...formData,
//         feedbackTitle: feedbackTitle,
//         feedbackType: feedbackType,
//         subjects: filteredSubjects,
//         department: userDepartment,
//       };

//       if (feedbackType === 'event' && selectedQuestionSet) {
//         updatedFormData.resourcePerson = selectedQuestionSet.resourcePerson;
//         updatedFormData.organization = selectedQuestionSet.organization;
//         updatedFormData.note = selectedQuestionSet.note;
//       }

//       const response = await axios.post('/api/feedback', updatedFormData);
//       setFeedbacks([...feedbacks, response.data.feedback])
//       handleCancel();
//       toast.success("Feedback created successfully");
//     } catch (error) {
//       console.log(error);
//       toast.error(error.response?.data?.error || error.message);
//     } finally {
//       setLoading(false);
//       handleCancel();
//     }
//   };

//   const generateFeedbackTitle = () => {
//     if (user && className && semester && subType && academicYear) {
//       return `${academicYear} ${user.department} ${className} ${subType.toUpperCase()} Semester ${semester}`;
//     }
//     return '';
//   };

//   useEffect(() => {
//     if (user && className && semester && subType && academicYear) {
//       setGeneratedTitle(`${academicYear} ${user.department} ${className} ${subType.toUpperCase()} Semester ${semester}`);
//     }
//   }, [user, className, semester, subType, academicYear]);

//   useEffect(() => {
//     if (selectedQuestionSet && questions) {
//       setFormData({ ...formData, questions: selectedQuestionSet.questions });
//     } else {
//       setFormData({ ...formData, questions: questions });
//     }
//   }, [questions, selectedQuestionSet]);

//   const currentYear = new Date().getFullYear();
//   const academicYearOptions = [
//     `${currentYear - 1}-${currentYear}`,
//     `${currentYear}-${currentYear + 1}`,
//     `${currentYear + 1}-${currentYear + 2}`
//   ];

//   useEffect(() => {
//     fetchFeedbacks(userDepartment);
//   }, [userDepartment]);

//   const fetchFeedbacks = async (department) => {
//     setLoading(true);
//     try {
//       if (department) {
//         const response = await axios.get(`/api/feedback?department=${department}`);
//         setFeedbacks(response.data);
//       }
//     } catch (error) {
//       console.error('Error fetching feedbacks:', error);
//       toast.error('Failed to fetch feedbacks.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const confirmDelete = (questionSetId) => {
//     setFeedbackToDelete(questionSetId);
//     onOpen();
//   };

//   const handleDeleteFeedback = async () => {
//     setLoading(true);
//     if (feedbackToDelete) {
//       try {
//         await axios.delete(`/api/feedback?_id=${feedbackToDelete}`);
//         setFeedbacks(feedbacks.filter(feedback => feedback._id !== feedbackToDelete));
//         toast.success('Feedback deleted successfully.');
//       } catch (error) {
//         console.error('Error deleting feedback:', error);
//         toast.error('Failed to delete feedback.');
//       } finally {
//         setLoading(false);
//         onClose();
//         setFeedbackToDelete(null);
//       }
//     }
//   };

//   const handleToggleIsActive = async (id, isActive) => {
//     const feedbackToUpdate = feedbacks?.find(feedback => feedback._id === id);
//     if (feedbackToUpdate.students === feedbackToUpdate?.responseCount) {
//       toast.error('Feedback is already full.');
//     }
//     else {
//       setLoading(true);
//       try {
//         await axios.put(`/api/feedback?_id=${id}`, { isActive: !isActive });
//         const updatedFeedbacks = feedbacks?.map(feedback => {
//           if (feedback._id === id) {
//             return { ...feedback, isActive: !isActive };
//           }
//           return feedback;
//         });
//         setFeedbacks(updatedFeedbacks);
//         toast.success('Feedback state updated successfully.');
//       } catch (error) {
//         console.error('Error updating feedback state:', error);
//         toast.error('Failed to update feedback state.');
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   const copyToClipboard = (feedbackId) => {
//     const url = `${window.location.origin}/givefeedback/${feedbackId}`;
//     navigator.clipboard.writeText(url).then(() => {
//       setCopied(feedbackId);
//       toast.success('Link copied to clipboard!');
//       setTimeout(() => setCopied(''), 2000);
//     }, (err) => {
//       console.error('Could not copy text: ', err);
//       toast.error('Failed to copy link');
//     });
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <Spinner size="lg" />
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       {!showFeedbackForm && (
//         <div className="flex justify-end mb-8">
//           <Button color="primary" onClick={() => setShowFeedbackForm(true)}>Create Feedback</Button>
//         </div>
//       )}
//       {showFeedbackForm && (
//         <form onSubmit={handleSubmit} className="bg-white p-8 rounded-md shadow-md">
//           <h2 className="text-2xl font-semibold mb-6 text-center">Create Feedback</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {userDepartment !== 'Central' && (
//               <div>
//                 <Select
//                   label="Feedback Type *"
//                   value={feedbackType}
//                   onChange={(e) => setFeedbackType(e.target.value)}
//                   required
//                 >
//                   <SelectItem key="academic" value="academic">Academic</SelectItem>
//                   <SelectItem key="event" value="event">External</SelectItem>
//                 </Select>
//               </div>
//             )}
//             {feedbackType === 'event' && (
//               <div>
//                 <Select
//                   label="Select Question Set *"
//                   value={selectedQuestionSet ? selectedQuestionSet._id : ''}
//                   onChange={(e) => setSelectedQuestionSet(questions.find(q => q._id === e.target.value))}
//                   required
//                 >
//                   {questions && questions.map((questionSet) => (
//                     <SelectItem key={questionSet._id} value={questionSet._id}>
//                       {questionSet.feedbackId}
//                     </SelectItem>
//                   ))}
//                 </Select>
//               </div>
//             )}

//             {feedbackType === 'event' && selectedQuestionSet && (
//               <>
//                 <Input
//                   label="Feedback Title"
//                   value={selectedQuestionSet.feedbackId}
//                   onChange={handleChange}
//                   readOnly
//                 />
//                 <Input
//                   label="Resource Person"
//                   value={selectedQuestionSet.resourcePerson}
//                   readOnly
//                 />
//                 <Input
//                   label="Organization"
//                   value={selectedQuestionSet.organization}
//                   readOnly
//                 />
//                 <Input
//                   label="Note"
//                   value={selectedQuestionSet.note}
//                   readOnly
//                 />
//               </>
//             )}

//             {feedbackType === 'academic' && (
//               <>
//                 <Select
//                   label="Feedback Subtype *"
//                   value={subType}
//                   onChange={(e) => setSubType(e.target.value)}
//                   required
//                 >
//                   <SelectItem key="theory" value="theory">Theory</SelectItem>
//                   <SelectItem key="practical" value="practical">Practical</SelectItem>
//                 </Select>
//                 <Select
//                   label="Class Name *"
//                   value={className}
//                   onChange={(e) => setClassName(e.target.value)}
//                   required
//                 >
//                   {user && user?.classes?.map((option) => (
//                     <SelectItem key={option} value={option}>{option}</SelectItem>
//                   ))}
//                 </Select>
//                 <Select
//                   label="Semester *"
//                   value={semester}
//                   onChange={(e) => setSemester(e.target.value)}
//                   required
//                 >
//                   <SelectItem key="1" value="1">Semester 1</SelectItem>
//                   <SelectItem key="2" value="2">Semester 2</SelectItem>
//                 </Select>
//                 <Select
//                   label="Academic Year *"
//                   value={academicYear}
//                   onChange={(e) => setAcademicYear(e.target.value)}
//                   required
//                 >
//                   {academicYearOptions?.map((option, index) => (
//                     <SelectItem key={index} value={option}>{option}</SelectItem>
//                   ))}
//                 </Select>
//                 {subType === "practical" && (
//                   <Input
//                     label="Feedback Title"
//                     value={generatedTitle}
//                     onChange={(e) => setGeneratedTitle(e.target.value)}
//                   />
//                 )}
//               </>
//             )}
//             <Input
//               label="Number of Students *"
//               type="number"
//               name="students"
//               placeholder="Enter total number of students"
//               value={formData.students}
//               onChange={handleChange}
//               min="1"
//               required
//             />
//             <Input
//               label="Password *"
//               type="password"
//               name="pwd"
//               placeholder="Enter password"
//               value={formData.pwd}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           {feedbackType === 'academic' && (
//             <div className="mt-6">
//               <h3 className="text-lg font-semibold mb-4">Subjects</h3>
//               {formData.subjects.map((subject, index) => (
//                 <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//                   <Input
//                     label={`Subject ${index + 1} *`}
//                     type="text"
//                     name={`subject${index}`}
//                     placeholder={`Subject ${index + 1}`}
//                     value={subject.subject}
//                     onChange={(e) => handleChange(e, index)}
//                     required
//                   />
//                   <Input
//                     label={`Faculty ${index + 1} *`}
//                     type="text"
//                     name={`faculty${index}`}
//                     placeholder={`Faculty ${index + 1}`}
//                     value={subject.faculty}
//                     onChange={(e) => handleChange(e, index)}
//                     required
//                   />
//                   <Input
//                     label={`Subject Code ${index + 1} *`}
//                     type="text"
//                     name={`_id${index}`}
//                     placeholder={`Subject code ${index + 1}`}
//                     value={subject._id}
//                     onChange={(e) => handleChange(e, index)}
//                     required
//                   />
//                   <div className="md:col-span-3 mt-2 flex gap-2">
//                     <Button color="danger" onClick={() => handleRemoveSubject(index)}>Remove</Button>
//                     {index === formData?.subjects?.length - 1 && (
//                       <Button color="primary" onClick={handleAddSubject}>Add Another Subject</Button>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           <div className="mt-6 flex gap-6 justify-center">
//             <Button color="secondary" onClick={handleCancel}>Cancel</Button>
//             <Button color="primary" type="submit">Create Feedback</Button>
//           </div>
//         </form>
//       )}

//       {!showFeedbackForm && (
//         <div className="mt-8">
//           <Table aria-label="Feedbacks table">
//             <TableHeader>
//               <TableColumn>Feedback Title</TableColumn>
//               <TableColumn>Number of Students</TableColumn>
//               <TableColumn>Number of Responses</TableColumn>
//               <TableColumn>Link</TableColumn>
//               <TableColumn>Active</TableColumn>
//               <TableColumn>Actions</TableColumn>
//             </TableHeader>
//             <TableBody>
//               {Array.isArray(feedbacks) && feedbacks?.map((feedback) => (
//                 <TableRow key={feedback._id}>
//                   <TableCell>{feedback.feedbackTitle}</TableCell>
//                   <TableCell>{feedback.students}</TableCell>
//                   <TableCell>{feedback.responseCount}</TableCell>
//                   <TableCell>
//                     <Tooltip content="Copy Link">
//                       <Button
//                         isIconOnly
//                         color="primary"
//                         variant="light"
//                         onClick={() => copyToClipboard(feedback._id)}
//                       >
//                         <FiCopy className={`w-5 h-5 ${copied === feedback._id ? 'animate-pulse' : ''}`} />
//                       </Button>
//                     </Tooltip>
//                   </TableCell>
//                   <TableCell>
//                     <Switch
//                       checked={feedback.isActive}
//                       onChange={() => handleToggleIsActive(feedback._id, feedback.isActive)}
//                     />
//                   </TableCell>
//                   <TableCell>
//                     <Button
//                       color="danger"
//                       size="sm"
//                       onClick={() => confirmDelete(feedback._id)}
//                     >
//                       Delete
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </div>
//       )}

//       <Modal isOpen={isOpen} onClose={onClose}>
//         <ModalContent>
//           <ModalHeader>Confirm Deletion</ModalHeader>
//           <ModalBody>
//             Are you sure you want to delete this feedback? This action cannot be undone.
//           </ModalBody>
//           <ModalFooter>
//             <Button color="secondary" onClick={onClose}>Cancel</Button>
//             <Button color="danger" onClick={handleDeleteFeedback}>Delete</Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>
//     </div>
//   );
// };

// export default FeedbackForm;
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
    if (user?.department) {
      fetchFeedbacks(user.department)
    }
  }, [user])

  const fetchFeedbacks = async (department) => {
    setLoading(true)
    try {
      const response = await axios.get(`/api/feedback?department=${department}`)
      setFeedbacks(response.data)
    } catch (error) {
      console.error("Error fetching feedbacks:", error)
      toast.error("Failed to fetch feedbacks.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData) => {
    setLoading(true)
    try {
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

  if (!user) {
    return <div>Please log in to access this page.</div>
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

