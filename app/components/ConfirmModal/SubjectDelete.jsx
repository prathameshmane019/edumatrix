import React, { useState } from "react";
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button,
  Chip
} from "@nextui-org/react";
import { Trash2 } from "lucide-react";

export default function SubjectDeleteConfirmModal({
  isOpen, 
  onClose, 
  onConfirmDelete,
  subject
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirmDelete(subject._id);
      onClose();
    } catch (error) {
      console.error("Failed to delete subject:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="md"
      placement="center"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Trash2 className="text-danger w-6 h-6" />
            <span>Confirm Subject Deletion</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <p>Are you sure you want to delete the subject?</p>
          <div className="flex items-center gap-2 mt-2">
            <span>Subject Details:</span>
            <Chip 
              color="default" 
              variant="flat"
              size="sm"
            >
              ID: {subject?.id}
            </Chip>
            <Chip 
              color="default" 
              variant="flat"
              size="sm"
            >
              Name: {subject?.name}
            </Chip>
          </div>
          <p className="text-danger text-small mt-2">
            This action cannot be undone and will permanently remove the subject from the system.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button 
            color="default" 
            variant="light" 
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            color="danger" 
            onClick={handleDelete}
            isLoading={isDeleting}
            startContent={!isDeleting && <Trash2 className="w-4 h-4" />}
          >
            {isDeleting ? "Deleting..." : "Delete Subject"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}