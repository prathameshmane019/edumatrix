import React, { useState, useRef } from 'react';
import {
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@nextui-org/react';
import {
  CloudUpload,
  Download,
  FileText
} from 'lucide-react';
import {
  handleExcelUpload,
  handleExcelDownload,
  downloadSampleExcel
} from '../utils/excelHandlers';
import { toast } from 'sonner';

const CourseContentManager = ({
  subjectType,
  content,
  onContentUpdate,
  availableBatches = ['A', 'B', 'C']
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid Excel file (.xlsx or .xls)');
      return;
    }

    setIsUploading(true);
    try {
      const updatedContent = await handleExcelUpload(file, subjectType);

      // Validate parsed content
      if (!updatedContent || updatedContent.length === 0) {
        toast.warning('No valid content found in the uploaded file');
        return;
      }

      onContentUpdate(updatedContent);
      toast.success('Content uploaded successfully');
      onClose(); // Close modal if open
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownload = () => {
    if (content.length === 0) {
      toast.warning('No content available to download');
      return;
    }

    try {
      handleExcelDownload(content, subjectType);
      toast.success('Content downloaded successfully');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const handleDownloadSample = () => {
    try {
      downloadSampleExcel(subjectType, availableBatches);
      toast.success('Sample file downloaded successfully');
    } catch (error) {
      console.error('Error downloading sample file:', error);
      toast.error('Failed to download sample file');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
        disabled={isUploading}
      />

      <div className="flex space-x-4">
        <Button
          color="primary"
          variant="solid"
          startContent={<CloudUpload size={20} />}
          onClick={triggerFileInput}
          isLoading={isUploading}
          className="flex-1"
        >
          {isUploading ? 'Uploading...' : 'Upload Content'}
        </Button>

        <Button
          color="secondary"
          variant="solid"
          startContent={<Download size={20} />}
          onClick={handleDownload}
          isDisabled={content.length === 0}
          className="flex-1"
        >
          Download Content
        </Button>

        <Button
          color="default"
          variant="bordered"
          startContent={<FileText size={20} />}
          onClick={handleDownloadSample}
          className="flex-1"
        >
          Download Sample Template
        </Button>
      </div>
    </div>
  );
};

export default CourseContentManager;