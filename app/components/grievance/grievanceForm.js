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
    <div className="mx-auto gap-5 w-[70vw]  bg-gradient-to-br from-violet-100 to-violet-200 shadow-md rounded-lg flex flex-col md:flex-row items-center">
      {/* Left Side - Illustration Image */}
      <div className="w-full md:w-1/2 flex flex-col  items-center justify-center p-6">
      <h3 className="text-lg font-semibold mt-4 text-center text-violet-800">Raise Your Concern & Get It Resolved</h3>
    <GrievanceIllustration/>
        
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

// Custom SVG Illustration
function GrievanceIllustration() {
  return (
    <svg viewBox="0 0 400 300" className="w-full max-w-md">
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f0f4ff" />
          <stop offset="100%" stopColor="#d1d9ff" />
        </linearGradient>
        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
      </defs>
      
      {/* Background elements */}
      <circle cx="200" cy="150" r="130" fill="url(#gradient1)" opacity="0.7" />
      <circle cx="150" cy="100" r="20" fill="#e0e7ff" opacity="0.8" />
      <circle cx="260" cy="80" r="15" fill="#e0e7ff" opacity="0.6" />
      <circle cx="290" cy="170" r="25" fill="#e0e7ff" opacity="0.7" />
      
      {/* Desk */}
      <rect x="100" y="200" width="200" height="15" rx="3" fill="#7c3aed" />
      <rect x="120" y="215" width="160" height="10" rx="2" fill="#6d28d9" />
      
      {/* Computer/Laptop */}
      <rect x="150" y="160" width="100" height="70" rx="5" fill="#1e293b" />
      <rect x="155" y="165" width="90" height="50" rx="2" fill="#f5f5ff" />
      <rect x="135" y="230" width="130" height="7" rx="3" fill="#475569" />
      
      {/* Screen content */}
      <rect x="165" y="175" width="70" height="8" rx="2" fill="#c4b5fd" />
      <rect x="165" y="190" width="50" height="5" rx="1" fill="#ddd6fe" />
      <rect x="165" y="200" width="60" height="5" rx="1" fill="#ddd6fe" />
      
      {/* Person */}
      <circle cx="80" cy="140" r="25" fill="#8b5cf6" />
      <rect x="60" y="165" width="40" height="50" rx="10" fill="#8b5cf6" />
      
      {/* Speech bubble */}
      <path d="M120 130 L110 140 L110 130 Q100 130 100 120 L100 100 Q100 90 110 90 L140 90 Q150 90 150 100 L150 120 Q150 130 140 130 Z" fill="white" stroke="#a78bfa" strokeWidth="2" />
      <rect x="115" y="100" width="20" height="4" rx="2" fill="#c4b5fd" />
      <rect x="115" y="110" width="25" height="4" rx="2" fill="#c4b5fd" />
      
      {/* Support person */}
      <circle cx="310" cy="140" r="25" fill="url(#gradient2)" />
      <rect x="290" y="165" width="40" height="50" rx="10" fill="url(#gradient2)" />
      
      {/* Support speech bubble */}
      <path d="M280 130 L290 140 L290 130 Q300 130 300 120 L300 100 Q300 90 290 90 L260 90 Q250 90 250 100 L250 120 Q250 130 260 130 Z" fill="white" stroke="#a78bfa" strokeWidth="2" />
      <rect x="260" y="100" width="20" height="4" rx="2" fill="#c4b5fd" />
      <rect x="260" y="110" width="25" height="4" rx="2" fill="#c4b5fd" />
      
      {/* Document/Form icon */}
      <rect x="190" y="110" width="30" height="40" rx="2" fill="white" stroke="#8b5cf6" strokeWidth="2" />
      <line x1="200" y1="120" x2="210" y2="120" stroke="#c4b5fd" strokeWidth="2" />
      <line x1="200" y1="130" x2="210" y2="130" stroke="#c4b5fd" strokeWidth="2" />
      <line x1="200" y1="140" x2="210" y2="140" stroke="#c4b5fd" strokeWidth="2" />
      
      {/* Checkmark */}
      <circle cx="240" cy="70" r="15" fill="#4ade80" opacity="0.8" />
      <path d="M233 70 L238 75 L247 65" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}