"use client";

import React, { useState } from "react";
import { Input, Button, Spinner, Select, SelectItem } from "@nextui-org/react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { uploadStudents } from "@/app/actions/uploadStudents";

function FileUpload({ classId, instituteId, academicYear, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.name.endsWith(".xlsx") || selectedFile.name.endsWith(".xls")) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const result = await uploadStudents(formData);
        if (result.success && result.sheets) {
          setSheetNames(result.sheets);
          setSelectedSheet(result.sheets[0]);
        }
      } else {
        setSheetNames([]);
        setSelectedSheet("");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }

    if (!classId || !academicYear) {
      toast.error("Class ID and Academic Year are required for uploading students.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("classId", classId);
      formData.append("instituteId", instituteId);
      formData.append("academicYear", academicYear);
      formData.append("selectedSheet", selectedSheet);

      const result = await uploadStudents(formData);
      if (result.success) {
        toast.success(result.message);
        onUploadSuccess(result.students);
      } else {
        throw new Error(result.error || "Failed to upload students");
      }
    } catch (error) {
      console.error("Error uploading students:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload students. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileChange}
        label="Upload Students"
        description="Upload a CSV or Excel file with student data"
        startContent={<Upload className="w-4 h-4 text-default-400" />}
      />
      {sheetNames.length > 0 && (
        <Select
          label="Select Sheet"
          placeholder="Choose a sheet"
          selectedKeys={selectedSheet ? [selectedSheet] : []}
          onSelectionChange={(keys) => setSelectedSheet(Array.from(keys)[0])}
        >
          {sheetNames.map((sheet) => (
            <SelectItem key={sheet} value={sheet}>
              {sheet}
            </SelectItem>
          ))}
        </Select>
      )}
      <Button
        onClick={handleUpload}
        disabled={!file || isLoading || (sheetNames.length > 0 && !selectedSheet)}
      >
        {isLoading ? <Spinner size="sm" /> : "Upload Students"}
      </Button>
    </div>
  );
}

export default FileUpload;
