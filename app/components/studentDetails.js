"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardHeader, 
  CardBody, 
  CardFooter,
  Divider, 
  Chip, 
  Avatar, 
  Button, 
  Spinner, 
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
    <Card className={`${fullWidth ? "col-span-full" : ""} shadow-sm`}>
      <CardBody className="p-4 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="text-primary">{icon}</div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        </div>
        <p className="text-lg font-medium">{value || 'N/A'}</p>
      </CardBody>
    </Card>
  );
}

// Section component for grouping related information
function InfoSection({ title, children }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-primary mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  );
}

export default function StudentDetail({ params }) {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Header with back button */}
      <div className="flex justify-between items-center mb-6">
        <Button 
          color="primary" 
          variant="light" 
          startContent={<FaArrowLeft />} 
          onClick={goBack}
        >
          Back to Students
        </Button>
        
        <Button 
          color="primary" 
          onClick={() => router.push(`/dashboard/students/edit/${student._id}`)}
        >
          Edit Student
        </Button>
      </div>

      {/* Student Profile Header Card */}
      <Card className="shadow-md mb-6">
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center">
              <Avatar 
                src={student.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.personalDetails?.name || 'Student')}&background=random`} 
                className="w-24 h-24 text-large"
                name={student.personalDetails?.name?.charAt(0) || 'S'}
                showFallback
                isBordered
                color="primary"
              />
              <div className="flex gap-2 mt-3">
                <Chip 
                  color={getStatusColor(student.admission?.status || 'active')}
                  variant="flat" 
                >
                  {student.admission?.status || 'Active'}
                </Chip>
                <Chip 
                  color="secondary" 
                  variant="flat"
                >
                  {student.academicDetails?.department?.name || student.academicDetails?.department || 'N/A'}
                </Chip>
              </div>
            </div>
            
            {/* Quick Info */}
            <div className="flex-grow flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-1">{student.personalDetails?.name || 'Student'}</h1>
                <p className="text-primary mb-3">Roll No: {student.academicDetails?.rollNumber}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="text-primary" />
                    <span>{student.personalDetails?.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaPhone className="text-primary" />
                    <span>{student.personalDetails?.phoneNo || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaGraduationCap className="text-primary" />
                    <span>{student.academicDetails?.class?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-primary" />
                    <span>Admission: {formatDate(student.academicDetails?.admissionDate)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:items-end justify-center">
                <Card className="bg-gradient-to-r from-primary-50 to-secondary-50 shadow-sm w-full md:w-64">
                  <CardBody className="p-4">
                    <h3 className="text-sm font-medium text-primary mb-2">Enrollment Duration</h3>
                    <div className="flex items-center gap-2">
                      <PiChartLineUp className="text-primary text-lg" />
                      <span className="font-medium">{getEnrollmentDuration(student.academicDetails?.admissionDate)}</span>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="shadow-md">
          <CardBody className="p-6">
            {/* Personal Information */}
            <InfoSection title="Personal Information">
              <InfoCard 
                title="Full Name" 
                value={student.personalDetails?.name} 
                icon={<FaUser />}
              />
              <InfoCard 
                title="Gender" 
                value={student.personalDetails?.gender} 
                icon={<FaUser />}
              />
              <InfoCard 
                title="Date of Birth" 
                value={formatDate(student.personalDetails?.dateOfBirth)} 
                icon={<FaBirthdayCake />}
              />
              <InfoCard 
                title="Student ID" 
                value={student._id} 
                icon={<FaIdCard />}
              />
              <InfoCard 
                title="Email Address" 
                value={student.personalDetails?.email} 
                icon={<FaEnvelope />}
              />
              <InfoCard 
                title="Phone Number" 
                value={student.personalDetails?.phoneNo} 
                icon={<FaPhone />}
              />
            </InfoSection>

            <Divider className="my-6" />

            {/* Academic Information */}
            <InfoSection title="Academic Information">
              <InfoCard 
                title="Roll Number" 
                value={student.academicDetails?.rollNumber} 
                icon={<PiStudentFill />}
              />
              <InfoCard 
                title="Department" 
                value={student.academicDetails?.department?.name || student.academicDetails?.department} 
                icon={<FaGraduationCap />}
              />
              <InfoCard 
                title="Class" 
                value={student.academicDetails?.class?.name} 
                icon={<FaUsers />}
              />
              <InfoCard 
                title="Institute" 
                value={student.academicDetails?.institute?.name} 
                icon={<FaSchool />}
              />
              <InfoCard 
                title="Admission Date" 
                value={formatDate(student.academicDetails?.admissionDate)} 
                icon={<FaCalendarAlt />}
              />
              <InfoCard 
                title="Duration" 
                value={getEnrollmentDuration(student.academicDetails?.admissionDate)} 
                icon={<FaUserGraduate />}
              />
            </InfoSection>

            <Divider className="my-6" />

            {/* Admission Information */}
            <InfoSection title="Admission Information">
              <InfoCard 
                title="Admission Number" 
                value={student.admission?.admissionNumber} 
                icon={<FaIdCard />}
              />
              <InfoCard 
                title="Admission Date" 
                value={formatDate(student.admission?.admissionDate)} 
                icon={<FaCalendarAlt />}
              />
              <Card className="shadow-sm">
                <CardBody className="p-4">
                  <div className="flex items-center gap-2 mb-3">
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
                </CardBody>
              </Card>
              <InfoCard 
                title="Category Type" 
                value={student.admission?.categoryType} 
                icon={<FaMedal />}
              />
            </InfoSection>

            <Divider className="my-6" />

            {/* Parent Information */}
            <InfoSection title="Parent Information">
              <InfoCard 
                title="Parent Name" 
                value={student.parents?.name} 
                icon={<FaUserTie />}
              />
              <InfoCard 
                title="Relation" 
                value={student.parents?.relation} 
                icon={<FaUsers />}
              />
              <InfoCard 
                title="Phone Number" 
                value={student.parents?.contact} 
                icon={<FaPhone />}
              />
              <InfoCard 
                title="Email" 
                value={student.parents?.email} 
                icon={<FaEnvelope />}
              />
              <InfoCard 
                title="Occupation" 
                value={student.parents?.occupation} 
                icon={<FaBriefcase />}
              />
            </InfoSection>
          </CardBody>
        </Card>

        {/* Analytics Card */}
        <Card className="shadow-md">
          <CardHeader className="px-6 py-4">
            <h2 className="text-xl font-semibold">Student Analytics</h2>
          </CardHeader>
          
          <Divider />
          
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="shadow-sm">
                <CardBody className="p-4">
                  <h3 className="text-lg font-medium mb-3">Attendance Rate</h3>
                  <Progress 
                    value={85} 
                    color="success" 
                    showValueLabel={true}
                    size="md"
                    className="mb-3"
                  />
                  <p className="text-sm text-gray-500">Last 30 days</p>
                </CardBody>
              </Card>
              
              <Card className="shadow-sm">
                <CardBody className="p-4">
                  <h3 className="text-lg font-medium mb-3">Assignment Completion</h3>
                  <Progress 
                    value={92} 
                    color="primary" 
                    showValueLabel={true}
                    size="md"
                    className="mb-3"
                  />
                  <p className="text-sm text-gray-500">Current semester</p>
                </CardBody>
              </Card>
              
              <Card className="shadow-sm">
                <CardBody className="p-4">
                  <h3 className="text-lg font-medium mb-3">Class Participation</h3>
                  <Progress 
                    value={78} 
                    color="warning" 
                    showValueLabel={true}
                    size="md"
                    className="mb-3"
                  />
                  <p className="text-sm text-gray-500">Last 30 days</p>
                </CardBody>
              </Card>
            </div>
            
            <div className="flex justify-center mt-6">
              <Card className="shadow-sm bg-gradient-to-r from-primary-50 to-secondary-50 w-full">
                <CardBody className="p-4 text-center">
                  <p className="text-primary">More detailed analytics features coming soon</p>
                </CardBody>
              </Card>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}