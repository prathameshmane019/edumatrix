'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  Avatar,
  Button,
  Input,
  Tabs,
  Tab,
  Skeleton,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  Select,
  SelectItem,
  Divider
} from '@nextui-org/react'
import { toast } from 'sonner'
import { 
  PencilIcon, 
  SaveIcon, 
  XIcon, 
  UserIcon, 
  BriefcaseIcon, 
  MailIcon, 
  KeyIcon, 
  BookOpenIcon, 
  CalendarIcon, 
  GraduationCapIcon, 
  PhoneIcon,
  MapPinIcon,
  BookIcon,
  BuildingIcon
} from 'lucide-react'
import axios from 'axios'

const getCurrentAcademicYear = () => {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()
  const academicYearStart = currentMonth >= 6 ? currentYear : currentYear - 1
  const academicYearEnd = academicYearStart + 1
  return `${academicYearStart}-${academicYearEnd}`
}

const getAcademicYears = (count = 5) => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = 0; i < count; i++) {
    const startYear = currentYear - i
    const endYear = startYear + 1
    years.push({
      value: `${startYear}-${endYear}`,
      label: `${startYear}-${endYear}`
    })
  }
  return years
}

const formatDate = (dateString) => {
  if (!dateString) return 'Not available'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('details')
  const [updatedProfile, setUpdatedProfile] = useState({})

  useEffect(() => {
    const storedProfile = sessionStorage.getItem('userProfile')
    if (storedProfile) {
      const profile = JSON.parse(storedProfile)
      const currentYear = profile.currentYear || getCurrentAcademicYear()
      const sem = profile.sem || 'sem1'
      
      // Normalize profile structure based on role
      const normalizedProfile = profile.role === 'student' 
        ? normalizeStudentProfile(profile)
        : normalizeFacultyProfile(profile)

      setUserProfile({
        ...normalizedProfile,
        currentYear,
        sem
      })

      setUpdatedProfile({
        ...normalizedProfile,
        currentYear,
        sem
      })
    }
    // Simulate loading delay
    setTimeout(() => setIsLoading(false), 800)
  }, [])

  // Normalize student profile to handle nested structure
  const normalizeStudentProfile = (profile) => {
    return {
      _id: profile._id,
      id: profile._id,
      name: profile.personalDetails?.name || profile.name || '',
      email: profile.personalDetails?.email || profile.email || '',
      department: profile.academicDetails?.department || profile.department || '',
      role: 'student',
      gender: profile.personalDetails?.gender || profile.gender || '',
      phoneNo: profile.personalDetails?.phoneNo || profile.contact || '',
      dateOfBirth: profile.personalDetails?.dateOfBirth || profile.dateOfBirth,
      rollNumber: profile.academicDetails?.rollNumber || '',
      academicYear: profile.academicDetails?.academicYear || profile.currentYear || '',
      admissionDate: profile.admission?.admissionDate || '',
      status: profile.admission?.status || 'active',
      parentName: profile.parents?.name || '',
      parentContact: profile.parents?.contact || '',
      parentEmail: profile.parents?.email || '',
      parentOccupation: profile.parents?.occupation || '',
      parentRelation: profile.parents?.relation || '',
      ...profile
    }
  }

  // Normalize faculty profile
  const normalizeFacultyProfile = (profile) => {
    return {
      _id: profile._id,
      id: profile.id || profile._id || '',
      name: profile.name || '',
      email: profile.email || '',
      department: profile.department || '',
      contact: profile.contact || '',
      gender: profile.gender || '',
      dateOfBirth: profile.dateOfBirth,
      address: profile.address || '', 
      designation: profile.designation || '',
      employmentType: profile.employmentType || 'teaching',
      dateOfJoining: profile.dateOfJoining,
      highestDegree: profile.education?.highestDegree || '',
      specialization: profile.education?.specialization || '',
      university: profile.education?.university || '',
      yearOfPassing: profile.education?.yearOfPassing || '',
      ...profile
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setUpdatedProfile(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleNestedInputChange = (section, field, value) => {
    setUpdatedProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleSettingChange = (setting, value) => {
    setUpdatedProfile(prev => ({
      ...prev,
      [setting]: value,
    }))
  }

  const handleSave = async () => {
    if (userProfile) {
      const role = userProfile.role === "admin" ? "department" : 
                  userProfile.role === "superadmin" ? "institute" : 
                  userProfile.role
      try {
        let profileToUpdate = {
          ...updatedProfile,
          currentYear: updatedProfile.currentYear || getCurrentAcademicYear(),
          sem: updatedProfile.sem || 'sem1'
        }

        // Transform data back to schema format if student or faculty
        if (role === 'student') {
          profileToUpdate = transformToStudentSchema(profileToUpdate)
        } else if (role === 'faculty') {
          profileToUpdate = transformToFacultySchema(profileToUpdate)
        }

        await axios.put(`/api/v2/${role}?_id=${userProfile?._id}`, profileToUpdate)

        const updatedFullProfile = {
          ...userProfile,
          ...updatedProfile
        }

        setUserProfile(updatedFullProfile)
        sessionStorage.setItem('userProfile', JSON.stringify(updatedFullProfile))

        setIsEditing(false)
        toast.success("Profile Updated", {
          description: "Your profile has been successfully updated.",
        })
      } catch (error) {
        console.error("Error updating user profile:", error)
        toast.error("Update Failed", {
          description: "There was an error updating your profile. Please try again.",
        })
      }
    }
  }

  // Transform flat structure back to student schema
  const transformToStudentSchema = (profile) => {
    return {
      _id: profile._id,
      personalDetails: {
        name: profile.name,
        email: profile.email,
        gender: profile.gender,
        phoneNo: profile.phoneNo,
        dateOfBirth: profile.dateOfBirth
      },
      academicDetails: {
        rollNumber: profile.rollNumber,
        department: profile.department,
        academicYear: profile.academicYear || profile.currentYear,
        institute: profile.institute
      },
      admission: {
        admissionDate: profile.admissionDate,
        status: profile.status
      },
      parents: {
        name: profile.parentName,
        contact: profile.parentContact,
        email: profile.parentEmail,
        occupation: profile.parentOccupation,
        relation: profile.parentRelation
      },
      currentYear: profile.currentYear,
      sem: profile.sem
    }
  }

  // Transform flat structure back to faculty schema
  const transformToFacultySchema = (profile) => {
    return {
      _id: profile._id,
      id: profile.id,
      name: profile.name,
      email: profile.email,
      department: profile.department,
      contact: profile.contact,
      gender: profile.gender,
      dateOfBirth: profile.dateOfBirth,
      address: profile.address,
      designation: profile.designation,
      employmentType: profile.employmentType,
      dateOfJoining: profile.dateOfJoining,
      education: {
        highestDegree: profile.highestDegree,
        specialization: profile.specialization,
        university: profile.university,
        yearOfPassing: profile.yearOfPassing
      },
      currentYear: profile.currentYear,
      sem: profile.sem,
      institute: profile.institute
    }
  }

  const roleColor = {
    admin: "text-purple-600",
    faculty: "text-blue-600",
    superadmin: "text-red-600",
    student: "text-green-600",
  }

  const roleBackgroundColor = {
    admin: "bg-purple-50",
    faculty: "bg-blue-50",
    superadmin: "bg-red-50",
    student: "bg-green-50",
  }

  const roleChipColor = {
    admin: "secondary",
    faculty: "primary",
    superadmin: "danger",
    student: "success",
  }

  const renderProfileBasicDetails = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(6).fill(null).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      )
    }

    if (isEditing) {
      return (
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label={userProfile?.role === "student" ? "Student ID" : userProfile?.role === "superadmin" ? "Institute Code" : "Faculty/Staff ID"}
              name="id"
              value={updatedProfile.id}
              isDisabled
              variant="bordered"
            />
            <Input
              label="Name"
              name="name"
              value={updatedProfile.name}
              onChange={handleInputChange}
              variant="bordered"
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={updatedProfile.email}
              onChange={handleInputChange}
              variant="bordered"
            />
            {userProfile?.role !== "superadmin" || "admin" && (
              <Input
                label="Department"
                name="department"
                value={updatedProfile.department }
                onChange={handleInputChange}
                variant="bordered"
              />
            )}
            <Input
              label="Phone Number"
              name="phoneNo"
              value={updatedProfile.phoneNo || updatedProfile.contact}
              onChange={(e) => {
                if (userProfile?.role === "student") {
                  handleInputChange({target: {name: "phoneNo", value: e.target.value}})
                } else {
                  handleInputChange({target: {name: "contact", value: e.target.value}})
                }
              }}
              variant="bordered"
            />
            {userProfile?.role !== "superadmin" || userProfile?.role !=="admin" && (
              <>
            <Select
              label="Gender"
              name="gender"
              selectedKeys={[updatedProfile.gender]}
              onChange={(e) => handleInputChange({target: {name: "gender", value: e.target.value}})}
              variant="bordered"
            >
              <SelectItem key="Male">Male</SelectItem>
              <SelectItem key="Female">Female</SelectItem>
              <SelectItem key="Other">Other</SelectItem>
            </Select>
            <Input
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={updatedProfile.dateOfBirth ? new Date(updatedProfile.dateOfBirth).toISOString().split('T')[0] : ''}
              onChange={handleInputChange}
              variant="bordered"
            />
            </>
            )}

            {(userProfile?.role === 'faculty' || userProfile?.role === 'admin' || userProfile?.role === 'superadmin') && (
              <>
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      variant="bordered"
                      className="w-full justify-start h-14"
                      startContent={<CalendarIcon className="h-4 w-4" />}
                    >
                      Academic Year: {updatedProfile.currentYear}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Academic Year selection"
                    onAction={(key) => handleSettingChange('currentYear', key)}
                    selectedKeys={[updatedProfile.currentYear]}
                  >
                    {getAcademicYears(10).map(year => (
                      <DropdownItem key={year.value}>{year.label}</DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      variant="bordered"
                      className="w-full justify-start h-14"
                      startContent={<GraduationCapIcon className="h-4 w-4" />}
                    >
                      Default Semester: {updatedProfile.sem?.toUpperCase()}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Semester selection"
                    onAction={(key) => handleSettingChange('sem', key)}
                    selectedKeys={[updatedProfile.sem]}
                  >
                    <DropdownItem key="sem1">Semester 1</DropdownItem>
                    <DropdownItem key="sem2">Semester 2</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              color="danger" 
              variant="light"
              startContent={<XIcon className="h-4 w-4" />}
              onPress={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <Button 
              color="primary" 
              type="submit" 
              startContent={<SaveIcon className="h-4 w-4" />}
            >
              Save Changes
            </Button>
          </div>
        </form>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p className="text-sm text-gray-500">{userProfile?.role === "student" ? "Student ID" : userProfile?.role === "superadmin" ? "Institute Code" : "Faculty/Staff ID"}</p>
          <p className="text-sm font-medium">{userProfile?.role === "student" ? userProfile?._id : userProfile?.role === "superadmin" ? userProfile?.instituteCode : userProfile?.id}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Name</p>
          <p className="text-sm font-medium">{userProfile?.name}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Email</p>
          <p className="text-sm font-medium">{userProfile?.email}</p>
        </div>
        {userProfile?.role !== "superadmin" || userProfile?.role !=="admin" && (
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Department</p>
            <p className="text-sm font-medium">{userProfile?.department}</p>
          </div>
        )}
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Phone Number</p>
          <p className="text-sm font-medium">{userProfile?.phoneNo || userProfile?.contact || 'Not provided'}</p>
        </div>
        {userProfile?.role !== "superadmin" || userProfile?.role !=="admin" && (
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Gender</p>
          <p className="text-sm font-medium">{userProfile?.gender || 'Not provided'}</p>
        </div>
        )}
        {userProfile?.role !== "superadmin" || userProfile?.role !=="admin" && (
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Date of Birth</p>
          <p className="text-sm font-medium">
            {userProfile?.dateOfBirth ? new Date(userProfile.dateOfBirth).toLocaleDateString() : 'Not provided'}
          </p>
        </div>
        )}
        {(userProfile?.role === 'faculty' || userProfile?.role === 'admin' || userProfile?.role === 'superadmin') && (
          <>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Default Academic Year</p>
              <p className="text-sm font-medium">{userProfile?.currentYear}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Default Semester</p>
              <p className="text-sm font-medium">{userProfile?.sem?.toUpperCase()}</p>
            </div>
          </>
        )}
      </div>
    )
  }

  const renderRoleSpecificDetails = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(4).fill(null).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      )
    }

    if (userProfile?.role === "student") {
      if (isEditing) {
        return (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold">Academic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Roll Number"
                name="rollNumber"
                value={updatedProfile.rollNumber || ''}
                onChange={handleInputChange}
                variant="bordered"
              />
              <Input
                label="Academic Year"
                name="academicYear"
                value={updatedProfile.academicYear || updatedProfile.currentYear || ''}
                onChange={handleInputChange}
                variant="bordered"
              />
              <Input
                label="Admission Date"
                name="admissionDate"
                type="date"
                value={updatedProfile.admissionDate ? new Date(updatedProfile.admissionDate).toISOString().split('T')[0] : ''}
                onChange={handleInputChange}
                variant="bordered"
              />
              <Select
                label="Status"
                name="status"
                selectedKeys={[updatedProfile.status || 'active']}
                onChange={(e) => handleInputChange({target: {name: "status", value: e.target.value}})}
                variant="bordered"
              >
                <SelectItem key="active">Active</SelectItem>
                <SelectItem key="suspended">Suspended</SelectItem>
                <SelectItem key="alumni">Alumni</SelectItem>
              </Select>
            </div>
            
            <Divider className="my-6" />
            
            <h4 className="text-lg font-semibold">Parent/Guardian Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Parent/Guardian Name"
                name="parentName"
                value={updatedProfile.parentName || ''}
                onChange={handleInputChange}
                variant="bordered"
              />
              <Input
                label="Contact Number"
                name="parentContact"
                value={updatedProfile.parentContact || ''}
                onChange={handleInputChange}
                variant="bordered"
              />
              <Input
                label="Email"
                name="parentEmail"
                type="email"
                value={updatedProfile.parentEmail || ''}
                onChange={handleInputChange}
                variant="bordered"
              />
              <Input
                label="Occupation"
                name="parentOccupation"
                value={updatedProfile.parentOccupation || ''}
                onChange={handleInputChange}
                variant="bordered"
              />
              <Select
                label="Relation"
                name="parentRelation"
                selectedKeys={[updatedProfile.parentRelation || '']}
                onChange={(e) => handleInputChange({target: {name: "parentRelation", value: e.target.value}})}
                variant="bordered"
              >
                <SelectItem key="Father">Father</SelectItem>
                <SelectItem key="Mother">Mother</SelectItem>
                <SelectItem key="Guardian">Guardian</SelectItem>
                <SelectItem key="Other">Other</SelectItem>
              </Select>
            </div>
          </div>
        )
      }

      return (
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-700 mb-4">Academic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Roll Number</p>
                <p className="text-sm font-medium">{userProfile.rollNumber || userProfile.academicDetails?.rollNumber || 'Not available'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Academic Year</p>
                <p className="text-sm font-medium">{userProfile.academicYear || userProfile.academicDetails?.academicYear || userProfile.currentYear || 'Not available'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Admission Date</p>
                <p className="text-sm font-medium">
                  {userProfile.admissionDate || userProfile.admission?.admissionDate ? 
                    new Date(userProfile.admissionDate || userProfile.admission?.admissionDate).toLocaleDateString() : 
                    'Not available'}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Status</p>
                <Chip 
                  color={userProfile.status === 'active' || userProfile.admission?.status === 'active' ? 'success' : 
                        userProfile.status === 'suspended' || userProfile.admission?.status === 'suspended' ? 'warning' : 'default'} 
                  variant="flat"
                  size="sm"
                >
                  {(userProfile.status || userProfile.admission?.status || 'Active').charAt(0).toUpperCase() + 
                   (userProfile.status || userProfile.admission?.status || 'Active').slice(1)}
                </Chip>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-gray-700 mb-4">Parent/Guardian Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-sm font-medium">{userProfile.parentName || userProfile.parents?.name || 'Not provided'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Relation</p>
                <p className="text-sm font-medium">{userProfile.parentRelation || userProfile.parents?.relation || 'Not specified'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Contact</p>
                <p className="text-sm font-medium">{userProfile.parentContact || userProfile.parents?.contact || 'Not provided'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-sm font-medium">{userProfile.parentEmail || userProfile.parents?.email || 'Not provided'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Occupation</p>
                <p className="text-sm font-medium">{userProfile.parentOccupation || userProfile.parents?.occupation || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>
      )
    } else if (userProfile?.role === "faculty") {
      if (isEditing) {
        return (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold">Professional Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Address"
                name="address"
                value={updatedProfile.address || ''}
                onChange={handleInputChange}
                variant="bordered"
                startContent={<MapPinIcon className="h-4 w-4 text-gray-500" />}
              />
              <Input
                label="Designation"
                name="designation"
                value={updatedProfile.designation || ''}
                onChange={handleInputChange}
                variant="bordered"
                startContent={<BriefcaseIcon className="h-4 w-4 text-gray-500" />}
              />
              <Select
                label="Employment Type"
                name="employmentType"
                selectedKeys={[updatedProfile.employmentType || 'teaching']}
                onChange={(e) => handleInputChange({target: {name: "employmentType", value: e.target.value}})}
                variant="bordered"
                startContent={<BuildingIcon className="h-4 w-4 text-gray-500" />}
              >
                <SelectItem key="teaching">Teaching</SelectItem>
                <SelectItem key="non-teaching">Non-Teaching</SelectItem>
              </Select>
              <Input
                label="Date of Joining"
                name="dateOfJoining"
                type="date"
                value={updatedProfile.dateOfJoining ? new Date(updatedProfile.dateOfJoining).toISOString().split('T')[0] : ''}
                onChange={handleInputChange}
                variant="bordered"
                startContent={<CalendarIcon className="h-4 w-4 text-gray-500" />}
              />
            </div>
            
            <Divider className="my-6" />
            
            <h4 className="text-lg font-semibold">Educational Background</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Highest Degree"
                name="highestDegree"
                value={updatedProfile.highestDegree || ''}
                onChange={handleInputChange}
                variant="bordered"
                startContent={<GraduationCapIcon className="h-4 w-4 text-gray-500" />}
              />
              <Input
                label="Specialization"
                name="specialization"
                value={updatedProfile.specialization || ''}
                onChange={handleInputChange}
                variant="bordered"
                startContent={<BookIcon className="h-4 w-4 text-gray-500" />}
              />
              <Input
                label="University"
                name="university"
                value={updatedProfile.university || ''}
                onChange={handleInputChange}
                variant="bordered"
                startContent={<BuildingIcon className="h-4 w-4 text-gray-500" />}
              />
              <Input
                label="Year of Passing"
                name="yearOfPassing"
                type="number"
                value={updatedProfile.yearOfPassing || ''}
                onChange={handleInputChange}
                variant="bordered"
                startContent={<CalendarIcon className="h-4 w-4 text-gray-500" />}
              />
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-700 mb-4">Professional Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <p className="text-sm text-gray-500 flex items-center">
                  <BriefcaseIcon className="h-4 w-4 mr-2" /> Designation
                </p>
                <p className="text-sm font-medium">{userProfile.designation || 'Not specified'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500 flex items-center">
                  <BuildingIcon className="h-4 w-4 mr-2" /> Employment Type
                </p>
                <Chip 
                  color={userProfile.employmentType === 'teaching' ? 'primary' : 'secondary'} 
                  variant="flat"
                  size="sm"
                >
                  {userProfile.employmentType ? 
                    (userProfile.employmentType.charAt(0).toUpperCase() + userProfile.employmentType.slice(1)) : 
                    'Teaching'}
                </Chip>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" /> Date of Joining
                </p>
                <p className="text-sm font-medium">
                  {userProfile.dateOfJoining ? 
                    new Date(userProfile.dateOfJoining).toLocaleDateString() : 
                    'Not available'}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500 flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-2" /> Address
                </p>
                <p className="text-sm font-medium">{userProfile.address || 'Not provided'}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-gray-700 mb-4">Educational Background</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <p className="text-sm text-gray-500 flex items-center">
                  <GraduationCapIcon className="h-4 w-4 mr-2" /> Highest Degree
                </p>
                <p className="text-sm font-medium">{userProfile.highestDegree || 'Not provided'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500 flex items-center">
                  <BookIcon className="h-4 w-4 mr-2" /> Specialization
                </p>
                <p className="text-sm font-medium">{userProfile.specialization || 'Not specified'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500 flex items-center">
                  <BuildingIcon className="h-4 w-4 mr-2" /> University
                </p>
                <p className="text-sm font-medium">{userProfile.university || 'Not provided'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" /> Year of Passing
                </p>
                <p className="text-sm font-medium">{userProfile.yearOfPassing || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderAdditionalInfo = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {Array(3).fill(null).map((_, index) => (
            <div key={index} className="flex items-center space-x-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Account Details</h3>
          <ul className="space-y-3">
            <li className="flex items-center space-x-3">
              <UserIcon className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Last Profile Updated</p>
                <p className="text-xs text-gray-500">{formatDate(userProfile?.updatedAt)}</p>
              </div>
            </li>
            <li className="flex items-center space-x-3">
              <CalendarIcon className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Profile Created</p>
                <p className="text-xs text-gray-500">{formatDate(userProfile?.createdAt)}</p>
              </div>
            </li>
            <li className="flex items-center space-x-3">
              <MailIcon className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Email Status</p>
                <Chip 
                  color="success" 
                  size="sm" 
                  variant="dot"
                >
                  Verified
                </Chip>
              </div>
            </li>
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex justify-center items-center min-h-screen ${roleBackgroundColor[userProfile?.role]}`}>
      <Card className="w-[70vw] h-[60]">
        <CardHeader className="flex justify-between items-center p-6">
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <Skeleton className="rounded-full w-16 h-16" />
            ) : (
              <Avatar 
                src="/avatar.svg" 
                name={userProfile?.name} 
                className="w-16 h-16 text-large"
              />
            )}
            <div className="space-y-2">
              {isLoading ? (
                <>
                  <Skeleton className="h-6 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </>
              ) : (
                <>
                  <h4 className="text-2xl font-bold">{userProfile?.name}</h4>
                  <div className="flex items-center space-x-2">
                    <Chip 
                      color={roleChipColor[userProfile?.role]}
                      variant="flat"
                      size="sm"
                    >
                      {userProfile?.role.charAt(0).toUpperCase() + userProfile?.role.slice(1)}
                    </Chip>
                    {userProfile?.institute && (
                      <span className="text-sm text-gray-500 flex items-center">
                        <BookOpenIcon className="h-4 w-4 mr-1" />
                        {userProfile.institute.name}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          {!isLoading && (
            <Button 
              isIconOnly 
              variant="light" 
              onPress={() => setIsEditing(!isEditing)}
              className="hover:bg-gray-100 rounded-full"
            >
              {isEditing ? <XIcon className="h-5 w-5 text-gray-600" /> : <PencilIcon className="h-5 w-5 text-gray-600" />}
            </Button>
          )}
        </CardHeader>
        <CardBody>
          <Tabs 
            aria-label="Profile tabs" 
            variant="underlined"
            selectedKey={activeTab}
            onSelectionChange={setActiveTab}
          >
            <Tab key="details" title="Basic Details">
              <div className="mt-4 space-y-6">
                {renderProfileBasicDetails()}
              </div>
            </Tab>
            {(userProfile?.role === 'student' || userProfile?.role === 'faculty') && (
              <Tab key="role-specific" title={userProfile?.role === 'student' ? 'Academic Details' : 'Professional Details'}>
                <div className="mt-4">
                  {renderRoleSpecificDetails()}
                </div>
              </Tab>
            )}
            <Tab key="info" title="Additional Information">
              <div className="mt-4">
                {renderAdditionalInfo()}
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
}