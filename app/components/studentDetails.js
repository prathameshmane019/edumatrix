"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardHeader, 
  CardBody, 
  Divider, 
  Chip, 
  Avatar, 
  Button, 
  Spinner, 
  Tabs, 
  Tab 
} from "@nextui-org/react";
import { 
  FaArrowLeft, 
  FaEnvelope, 
  FaPhone, 
  FaUser, 
  FaCalendarAlt, 
  FaGraduationCap, 
  FaUserCheck, 
  FaHome, 
  FaUsers, 
  FaMedal 
} from "react-icons/fa";
import Image from "next/image";
import { toast } from "sonner";

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

export default function StudentDetail({ params }) {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const storedProfile = sessionStorage.getItem('userProfile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
  }, []);

  useEffect(() => {
    if (params.id) {
      fetchStudentDetails(params.id);
    }
  }, [params.id]);

  const fetchStudentDetails = async (id) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/v2/students?_id=${id}`);
      if (response.data && response.data.student) {
        setStudent(response.data.student);
      } else {
        toast.error("Student not found");
        router.push("/dashboard/students");
      }
    } catch (error) {
      console.error("Error fetching student details:", error);
      toast.error("Failed to load student details");
      router.push("/dashboard/students");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'suspended': return 'warning';
      case 'alumni': return 'primary';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const goBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" label="Loading student details..." />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Image
          src="/student.svg"
          alt="Student not found"
          width={300}
          height={300}
        />
        <h2 className="text-2xl font-bold mt-4">Student not found</h2>
        <Button 
          color="primary" 
          variant="light" 
          startContent={<FaArrowLeft />} 
          className="mt-4"
          onClick={goBack}
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Button 
        color="primary" 
        variant="light" 
        startContent={<FaArrowLeft />} 
        className="mb-6"
        onClick={goBack}
      >
        Back to Students
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="col-span-1 shadow-lg">
          <CardBody className="pt-8 flex flex-col items-center">
            <Avatar 
              src={student.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`} 
              className="w-32 h-32 text-large"
              name={student.name?.charAt(0)}
              showFallback
              isBordered
              color="primary"
            />
            <h1 className="text-2xl font-bold mt-4">{student.name}</h1>
            <p className="text-gray-500 mt-1">Roll No: {student.rollNumber}</p>
            <Chip 
              color={getStatusColor(student.status || 'active')}
              variant="flat" 
              className="mt-2"
            >
              {student.status || 'Active'}
            </Chip>
            <Chip 
              color="secondary" 
              variant="flat" 
              className="mt-2"
            >
              {student.department?.name || student.department || 'N/A'}
            </Chip>
            
            <Divider className="my-4" />
            
            <div className="flex flex-col w-full gap-2">
              <div className="flex items-center gap-2">
                <FaEnvelope className="text-gray-500" />
                <span className="truncate">{student.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaPhone className="text-gray-500" />
                <span>{student.phoneNo || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaGraduationCap className="text-gray-500" />
                <span>{student.class?.name || student.class || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-gray-500" />
                <span>Admission: {student.year || 'N/A'}</span>
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
              aria-label="Student information tabs" 
              color="primary" 
              variant="underlined"
              classNames={{
                tabList: "gap-6",
              }}
            >
              <Tab key="personal" title="Personal Information" />
              <Tab key="academic" title="Academic Information" />
              <Tab key="parent" title="Parent Information" />
            </Tabs>
          </CardHeader>
          
          <Divider />
          
          <CardBody className="px-5 py-4">
            {/* Personal Information Tab */}
            {activeTab === "personal" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard 
                  title="Full Name" 
                  value={student.name || 'N/A'} 
                  icon={<FaUser className="text-primary" />}
                />
                <InfoCard 
                  title="Gender" 
                  value={student.gender || 'N/A'} 
                />
                <InfoCard 
                  title="Date of Birth" 
                  value={formatDate(student.dateOfBirth)} 
                  icon={<FaCalendarAlt className="text-primary" />}
                />
                <InfoCard 
                  title="Category" 
                  value={student.categoryType || 'N/A'} 
                />
                <InfoCard 
                  title="Email Address" 
                  value={student.email || 'N/A'} 
                  icon={<FaEnvelope className="text-primary" />}
                />
                <InfoCard 
                  title="Phone Number" 
                  value={student.phoneNo || 'N/A'} 
                  icon={<FaPhone className="text-primary" />}
                />
                <InfoCard 
                  title="Address" 
                  value={student.address || 'N/A'} 
                  icon={<FaHome className="text-primary" />}
                  fullWidth
                />
              </div>
            )}

            {/* Academic Information Tab */}
            {activeTab === "academic" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard 
                  title="Department" 
                  value={student.department?.name || student.department || 'N/A'} 
                  icon={<FaGraduationCap className="text-primary" />}
                />
                <InfoCard 
                  title="Class" 
                  value={student.class?.name || student.class || 'N/A'} 
                  icon={<FaUsers className="text-primary" />}
                />
                <InfoCard 
                  title="Roll Number" 
                  value={student.rollNumber || 'N/A'} 
                  icon={<FaUserCheck className="text-primary" />}
                />
                <InfoCard 
                  title="Admission Number" 
                  value={student.admissionNumber || 'N/A'} 
                  icon={<FaMedal className="text-primary" />}
                />
                <InfoCard 
                  title="Admission Date" 
                  value={formatDate(student.admissionDate)} 
                  icon={<FaCalendarAlt className="text-primary" />}
                />
                <InfoCard 
                  title="Academic Year" 
                  value={student.year || 'N/A'} 
                  icon={<FaCalendarAlt className="text-primary" />}
                />
                <div className="col-span-1">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <FaUserCheck className="text-primary" />
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    </div>
                    <Chip 
                      color={getStatusColor(student.status || 'active')} 
                      variant="flat"
                      size="lg"
                    >
                      {student.status || 'Active'}
                    </Chip>
                  </div>
                </div>
              </div>
            )}

            {/* Parent Information Tab */}
            {activeTab === "parent" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard 
                  title="Parent Name" 
                  value={student.parentName || 'N/A'} 
                  icon={<FaUser className="text-primary" />}
                />
                <InfoCard 
                  title="Relation" 
                  value={student.relationWithStudent || 'N/A'} 
                  icon={<FaUsers className="text-primary" />}
                />
                <InfoCard 
                  title="Phone Number" 
                  value={student.parentContact || 'N/A'} 
                  icon={<FaPhone className="text-primary" />}
                />
                <InfoCard 
                  title="Email" 
                  value={student.parentEmail || 'N/A'} 
                  icon={<FaEnvelope className="text-primary" />}
                />
                <InfoCard 
                  title="Occupation" 
                  value={student.parentOccupation || 'N/A'} 
                  icon={<FaGraduationCap className="text-primary" />}
                />
                <InfoCard 
                  title="Address" 
                  value={student.parentAddress || student.address || 'N/A'} 
                  icon={<FaHome className="text-primary" />}
                />
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 mt-6">
        <Button 
          color="primary" 
          onClick={() => router.push(`/dashboard/students/edit/${student._id}`)}
        >
          Edit Student
        </Button>
      </div>
    </div>
  );
}