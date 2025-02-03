"use client"

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button, Input, Textarea } from "@nextui-org/react";
import { useDropzone } from "react-dropzone";

export default function GrievanceForm() {
  const [files, setFiles] = useState([]);
  const router = useRouter();

  const onDrop = (acceptedFiles) => {
    setFiles(acceptedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: "image/*",
  });

  const submitGrievance = async (formData) => {
    const response = await fetch("/api/v2/grievance", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to submit grievance");
    }

    return response.json();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    files.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });

    try {
      await submitGrievance(formData);
      alert("Grievance submitted successfully!");
      router.push("/");
    } catch (error) {
      console.error("Error submitting grievance:", error);
      alert("Failed to submit grievance. Please try again.");
    }
  };

  return (
    <div className="min-h-screen rounded-lg bg-gradient-to-br from-violet-50 to-violet-100 flex items-center justify-center p-10">
    <div className="mx-auto gap-5 w-[70vw]   bg-violet-400 shadow-md rounded-lg flex flex-col md:flex-row items-center">
      {/* Left Side - Illustration Image */}
      <div className="w-full md:w-1/2 flex flex-col  items-center justify-center p-6">
      <h3 className="text-lg font-semibold mt-4 text-center text-violet-50">Raise Your Concern & Get It Resolved</h3>
        <Image src="/grievance.png" alt="Grievance Illustration" width={400} height={400} />
        
      </div>

      {/* Right Side - Grievance Form */}
      <div className="w-full md:w-1/2 p-6 bg-violet-50 rounded-lg ">
        <h2 className="text-2xl font-bold mb-6 text-center text-violet-800">Submit a Grievance</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" placeholder="Enter your name" name="name" required variant="bordered" />
          <Input label="Email" placeholder="Enter your email" name="email" type="email" required variant="bordered"/>

          <Textarea
            label="Issue"
            placeholder="Please describe the issue you are facing"
            name="issue"
            minRows={4} 
            variant="bordered"
          />

          <Textarea
            label="Suggestion"
            placeholder="Any suggestions to resolve the issue"
            name="suggestion"
            minRows={4}
            variant="bordered"
          />

          {/* File Upload Field */}
          <div className="space-y-2">
            <p className="font-semibold">Upload Screenshot</p>
            <div
              {...getRootProps()}
              className="border-2 border-dashed border-gray-400 p-4 text-center bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <p className="text-gray-600">Drop the image here...</p>
              ) : (
                <div>
                  <p className="text-gray-600">Drag & drop an image here, or click to select one</p>
                  {files.length > 0 && (
                    <div className="mt-2">
                      <p className="font-semibold">Selected files:</p>
                      <ul className="list-disc pl-5 text-sm">
                        {files.map((file, index) => (
                          <li key={index}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <Button type="submit" color="primary" className="w-full">
            Submit Grievance
          </Button>
        </form>
      </div>
    </div>
    </div>
  );
}