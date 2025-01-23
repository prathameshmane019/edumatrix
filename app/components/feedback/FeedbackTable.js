import React from "react"
import { useState } from "react"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Switch,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react"
import { FiCopy } from "react-icons/fi"
import { toast } from "sonner"

const FeedbackTable = ({ feedbacks, onDelete, onToggleActive }) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [feedbackToDelete, setFeedbackToDelete] = useState(null)
    const [copied, setCopied] = useState("")

    const confirmDelete = (id) => {
        setFeedbackToDelete(id)
        onOpen()
    }

    const handleDelete = () => {
        if (feedbackToDelete) {
            onDelete(feedbackToDelete)
            onClose()
            setFeedbackToDelete(null)
        }
    }

    const copyToClipboard = (feedbackId) => {
        const url = `${window.location.origin}/feedback/givefeedback/${feedbackId}`
        navigator.clipboard.writeText(url).then(
            () => {
                setCopied(feedbackId)
                toast.success("Link copied to clipboard!")
                setTimeout(() => setCopied(""), 2000)
            },
            (err) => {
                console.error("Could not copy text: ", err)
                toast.error("Failed to copy link")
            },
        )
    }

    return (
        <>
            <Table aria-label="Feedbacks table">
                <TableHeader>
                    <TableColumn>Feedback Title</TableColumn>
                    <TableColumn>Number of Students</TableColumn>
                    <TableColumn>Number of Responses</TableColumn>
                    <TableColumn>Link</TableColumn>
                    <TableColumn>Active</TableColumn>
                    <TableColumn>Actions</TableColumn>
                </TableHeader>
                <TableBody>
                    {feedbacks.map((feedback) => (
                        <TableRow key={feedback._id}>
                            <TableCell>{feedback.feedbackTitle}</TableCell>
                            <TableCell>{feedback.students}</TableCell>
                            <TableCell>{feedback.responseCount}</TableCell>
                            <TableCell>
                                <Tooltip content="Copy Link">
                                    <Button isIconOnly color="primary" variant="light" onClick={() => copyToClipboard(feedback._id)}>
                                        <FiCopy className={`w-5 h-5 ${copied === feedback._id ? "animate-pulse" : ""}`} />
                                    </Button>
                                </Tooltip>
                            </TableCell>
                            <TableCell>
                                <Switch isSelected={feedback.isActive} size="sm" onChange={() => onToggleActive(feedback._id, feedback.isActive)} />
                            </TableCell>
                            <TableCell>
                                <Button color="danger" size="sm" onClick={() => confirmDelete(feedback._id)}>
                                    Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalContent>
                    <ModalHeader>Confirm Deletion</ModalHeader>
                    <ModalBody>Are you sure you want to delete this feedback? This action cannot be undone.</ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button color="danger" onClick={handleDelete}>
                            Delete
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}
 export default FeedbackTable