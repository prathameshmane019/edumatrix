"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { Card, CardHeader, CardBody, Button, Spinner, Avatar, Divider, Chip, Tabs, Tab } from "@nextui-org/react";
import { FaArrowLeft, FaPhone, FaEnvelope, FaGraduationCap, FaUserTie, FaCalendarAlt, FaUniversity } from "react-icons/fa";
import { capitalize } from "@/app/utils/utils";

export default function FacultyDetailPage({ params }) {
  const router = useRouter();
  const { id } = params;
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");

  useEffect(() => {
    if (id) {
      fetchFacultyDetails();
    }
  }, [id]);

  const fetchFacultyDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/v2/faculty/${id}`);
      setFaculty(response.data);
    } catch (error) {
      console.error("Error fetching faculty details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" label="Loading faculty details..." />
      </div>
    );
  }

  if (!faculty) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Image src="/not-found.svg" alt="Faculty not found" width={300} height={300} />
        <h2 className="text-2xl font-bold mt-4">Faculty member not found</h2>
        <Button 
          color="primary" 
          variant="light" 
          startContent={<FaArrowLeft />} 
          className="mt-4"
          onClick={() => router.back()}
        >
          Go Back
        </Button>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Button 
        color="primary" 
        variant="light" 
        startContent={<FaArrowLeft />} 
        className="mb-6"
        onClick={() => router.back()}
      >
        Back to Faculty List
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="col-span-1 shadow-lg">
          <CardBody className="pt-8 flex flex-col items-center">
            <Avatar 
              src={faculty.profilePicture || "/default-avatar.png"} 
              className="w-32 h-32 text-large"
              name={faculty.name} 
              showFallback
              isBordered
              color="primary"
            />
            <h1 className="text-2xl font-bold mt-4">{faculty.name}</h1>
            <Chip 
              color="primary" 
              variant="flat" 
              className="mt-2"
            >
              {faculty.designation}
            </Chip>
            <Chip 
              color="secondary" 
              variant="flat" 
              className="mt-2"
            >
              {faculty.department}
            </Chip>
            <p className="text-gray-500 mt-1">ID: {faculty.id}</p>
            
            <Divider className="my-4" />
            
            <div className="flex flex-col w-full gap-2">
              <div className="flex items-center gap-2">
                <FaPhone className="text-gray-500" />
                <span>{faculty.contact || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaEnvelope className="text-gray-500" />
                <span className="truncate">{faculty.email}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <FaUserTie className="text-gray-500" />
                <span>{capitalize(faculty.employmentType) || "N/A"}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Details Section */}
        <Card className="col-span-1 md:col-span-2 shadow-lg">
          <CardHeader className="px-5 py-4">
            <Tabs 
              selectedKey={activeTab} 
              onSelectionChange={setActiveTab}
              aria-label="Faculty information tabs" 
              color="primary" 
              variant="underlined"
              classNames={{
                tabList: "gap-6",
              }}
            >
              <Tab key="personal" title="Personal Information" />
              <Tab key="education" title="Education" />
              <Tab key="work" title="Work Details" />
            </Tabs>
          </CardHeader>
          
          <Divider />
          
          <CardBody className="px-5 py-4">
            {/* Personal Information Tab */}
            {activeTab === "personal" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard title="Gender" value={faculty.gender || "N/A"} />
                <InfoCard 
                  title="Date of Birth" 
                  value={formatDate(faculty.dateOfBirth)} 
                  icon={<FaCalendarAlt className="text-primary" />}
                />
                <InfoCard 
                  title="Address" 
                  value={faculty.address || "N/A"} 
                  fullWidth
                />
                
                {/* Additional personal information can be added here */}
              </div>
            )}

            {/* Education Tab */}
            {activeTab === "education" && (
              <div className="space-y-4">
                {faculty.education ? (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-4">
                      <FaGraduationCap className="text-2xl text-primary" />
                      <h3 className="text-xl font-semibold">Highest Qualification</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoCard 
                        title="Degree" 
                        value={faculty.education.highestDegree || "N/A"} 
                      />
                      <InfoCard 
                        title="Specialization" 
                        value={faculty.education.specialization || "N/A"} 
                      />
                      <InfoCard 
                        title="University" 
                        value={faculty.education.university || "N/A"} 
                        icon={<FaUniversity className="text-primary" />}
                      />
                      <InfoCard 
                        title="Year of Passing" 
                        value={faculty.education.yearOfPassing || "N/A"} 
                        icon={<FaCalendarAlt className="text-primary" />}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No education information available</p>
                  </div>
                )}
              </div>
            )}

            {/* Work Details Tab */}
            {activeTab === "work" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard 
                  title="Date of Joining" 
                  value={formatDate(faculty.dateOfJoining)} 
                  icon={<FaCalendarAlt className="text-primary" />}
                />
                <InfoCard title="Designation" value={faculty.designation || "N/A"} />
                <InfoCard title="Employment Type" value={capitalize(faculty.employmentType) || "N/A"} />
                <InfoCard title="Department" value={faculty.department || "N/A"} />
                <InfoCard title="Current Year" value={faculty.currentYear || "N/A"} />
                <InfoCard title="Semester" value={faculty.sem || "N/A"} />
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

// Helper component for displaying information in a consistent format
function InfoCard({ title, value, icon, fullWidth = false }) {
  return (
    <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-4 ${fullWidth ? "col-span-full" : ""}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      </div>
      <p className="text-lg">{value}</p>
    </div>
  );
}