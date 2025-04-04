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
  Tab,
  Progress
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
  FaMedal,
  FaIdCard,
  FaBuilding,
  FaBirthdayCake,
  FaSchool,
  FaUserGraduate,
  FaBriefcase,
  FaUserTie
} from "react-icons/fa";
import { 
  PiChartLineUp, 
  PiStudentFill 
} from "react-icons/pi";
import Image from "next/image";
import { toast } from "sonner";

// Helper component for displaying information in a consistent format
function InfoCard({ title, value, icon, fullWidth = false }) {
  return (
    <div className={`bg-violet-50 dark:bg-violet-200 rounded-lg p-4 ${fullWidth ? "col-span-full" : ""}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <h3 className="text-sm font-medium text-violet-500">{title}</h3>
      </div>
      <p className="text-lg">{value || 'N/A'}</p>
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
      const response = await axios.get(`/api/v2/students/${id}`);
      if (response.data && response.data.student) {
        console.log("Student data:", response.data.student);
        setStudent(response.data.student);
      } else {
        toast.error("Student not found"); 
      }
    } catch (error) {
      console.error("Error fetching student details:", error);
      toast.error("Failed to load student details"); 
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

  // Calculate student time at institution
  const getEnrollmentDuration = (admissionDate) => {
    if (!admissionDate) return 'N/A';
    
    const now = new Date();
    const admitted = new Date(admissionDate);
    const diffTime = Math.abs(now - admitted);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0 && months > 0) {
      return `${years} year${years > 1 ? 's' : ''}, ${months} month${months > 1 ? 's' : ''}`;
    } else if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}`;
    } else if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    }
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
              src={student.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.personalDetails?.name || 'Student')}&background=random`} 
              className="w-32 h-32 text-large"
              name={student.personalDetails?.name?.charAt(0) || 'S'}
              showFallback
              isBordered
              color="primary"
            />
            <h1 className="text-2xl font-bold mt-4">{student.personalDetails?.name || 'Student'}</h1>
            <p className="text-violet-500 mt-1">Roll No: {student.academicDetails?.rollNumber}</p>
            <Chip 
              color={getStatusColor(student.admission?.status || 'active')}
              variant="flat" 
              className="mt-2"
            >
              {student.admission?.status || 'Active'}
            </Chip>
            
            <div className="flex gap-2 mt-2">
              <Chip 
                color="secondary" 
                variant="flat"
              >
                {student.academicDetails?.department?.name || student.academicDetails?.department || 'N/A'}
              </Chip>
              <Chip 
                color="primary" 
                variant="flat"
              >
                {student.admission?.categoryType || 'Merit'}
              </Chip>
            </div>
            
            <Divider className="my-4" />
            
            <div className="flex flex-col w-full gap-3">
              <div className="flex items-center gap-2">
                <FaEnvelope className="text-violet-500" />
                <span className="truncate">{student.personalDetails?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaPhone className="text-violet-500" />
                <span>{student.personalDetails?.phoneNo || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaGraduationCap className="text-violet-500" />
                <span>{student.academicDetails?.class?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-violet-500" />
                <span>Admission: {formatDate(student.academicDetails?.admissionDate)}</span>
              </div>
            </div>

            <Divider className="my-4" />
            
            <div className="w-full">
              <h3 className="text-sm font-medium text-violet-500 mb-2">Enrollment Duration</h3>
              <div className="flex items-center gap-2">
                <PiChartLineUp className="text-primary text-lg" />
                <span>{getEnrollmentDuration(student.academicDetails?.admissionDate)}</span>
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
              <Tab key="admission" title="Admission Information" />
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
                  value={student.personalDetails?.name} 
                  icon={<FaUser className="text-primary" />}
                />
                <InfoCard 
                  title="Gender" 
                  value={student.personalDetails?.gender} 
                  icon={<FaUser className="text-primary" />}
                />
                <InfoCard 
                  title="Date of Birth" 
                  value={formatDate(student.personalDetails?.dateOfBirth)} 
                  icon={<FaBirthdayCake className="text-primary" />}
                />
                <InfoCard 
                  title="Student ID" 
                  value={student._id} 
                  icon={<FaIdCard className="text-primary" />}
                />
                <InfoCard 
                  title="Email Address" 
                  value={student.personalDetails?.email} 
                  icon={<FaEnvelope className="text-primary" />}
                />
                <InfoCard 
                  title="Phone Number" 
                  value={student.personalDetails?.phoneNo} 
                  icon={<FaPhone className="text-primary" />}
                />
              </div>
            )}

            {/* Academic Information Tab */}
            {activeTab === "academic" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard 
                  title="Roll Number" 
                  value={student.academicDetails?.rollNumber} 
                  icon={<PiStudentFill className="text-primary" />}
                />
                <InfoCard 
                  title="Department" 
                  value={student.academicDetails?.department?.name || student.academicDetails?.department} 
                  icon={<FaGraduationCap className="text-primary" />}
                />
                <InfoCard 
                  title="Class" 
                  value={student.academicDetails?.class?.name} 
                  icon={<FaUsers className="text-primary" />}
                />
                <InfoCard 
                  title="Institute" 
                  value={student.academicDetails?.institute?.name} 
                  icon={<FaSchool className="text-primary" />}
                />
                <InfoCard 
                  title="Admission Date" 
                  value={formatDate(student.academicDetails?.admissionDate)} 
                  icon={<FaCalendarAlt className="text-primary" />}
                />
                <InfoCard 
                  title="Duration" 
                  value={getEnrollmentDuration(student.academicDetails?.admissionDate)} 
                  icon={<FaUserGraduate className="text-primary" />}
                />
              </div>
            )}

            {/* Admission Information Tab */}
            {activeTab === "admission" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard 
                  title="Admission Number" 
                  value={student.admission?.admissionNumber} 
                  icon={<FaIdCard className="text-primary" />}
                />
                <InfoCard 
                  title="Admission Date" 
                  value={formatDate(student.admission?.admissionDate)} 
                  icon={<FaCalendarAlt className="text-primary" />}
                />
                <div className="col-span-1">
                  <div className="bg-violet-50 dark:bg-violet-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <FaUserCheck className="text-primary" />
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    </div>
                    <Chip 
                      color={getStatusColor(student.admission?.status || 'active')} 
                      variant="flat"
                      size="lg"
                    >
                      {student.admission?.status || 'Active'}
                    </Chip>
                  </div>
                </div>
                <InfoCard 
                  title="Category Type" 
                  value={student.admission?.categoryType} 
                  icon={<FaMedal className="text-primary" />}
                />
              </div>
            )}

            {/* Parent Information Tab */}
            {activeTab === "parent" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard 
                  title="Parent Name" 
                  value={student.parents?.name} 
                  icon={<FaUserTie className="text-primary" />}
                />
                <InfoCard 
                  title="Relation" 
                  value={student.parents?.relation} 
                  icon={<FaUsers className="text-primary" />}
                />
                <InfoCard 
                  title="Phone Number" 
                  value={student.parents?.contact} 
                  icon={<FaPhone className="text-primary" />}
                />
                <InfoCard 
                  title="Email" 
                  value={student.parents?.email} 
                  icon={<FaEnvelope className="text-primary" />}
                />
                <InfoCard 
                  title="Occupation" 
                  value={student.parents?.occupation} 
                  icon={<FaBriefcase className="text-primary" />}
                />
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Future Charts Section - Placeholder for now */}
      <Card className="mt-6 shadow-lg overflow-hidden">
        <CardHeader className="px-5 py-4">
          <h2 className="text-xl font-semibold">Student Analytics</h2>
        </CardHeader>
        <Divider />
        <CardBody className="px-5 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-2">Attendance Rate</h3>
              <Progress 
                value={85} 
                color="success" 
                showValueLabel={true}
                className="mb-2"
              />
              <p className="text-sm text-gray-500">Last 30 days</p>
            </Card>
            
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-2">Assignment Completion</h3>
              <Progress 
                value={92} 
                color="primary" 
                showValueLabel={true}
                className="mb-2"
              />
              <p className="text-sm text-gray-500">Current semester</p>
            </Card>
            
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-2">Class Participation</h3>
              <Progress 
                value={78} 
                color="warning" 
                showValueLabel={true}
                className="mb-2"
              />
              <p className="text-sm text-gray-500">Last 30 days</p>
            </Card>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-gray-500">
              More detailed analytics will be available soon.
            </p>
          </div>
        </CardBody>
      </Card>

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