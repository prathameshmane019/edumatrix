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
  Textarea
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
  Settings, 
  BookOpenIcon, 
  CalendarIcon, 
  GraduationCapIcon, 
  PhoneIcon,
  HomeIcon,
  BookmarkIcon,
  BuildingIcon,
  UserPlusIcon
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

const formatSimpleDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
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

      // Initialize the profile based on the role
      let initialProfile
      
      if (profile.role === 'student') {
        initialProfile = {
          _id: profile._id || profile.id,
          'personalDetails.name': profile.personalDetails?.name || profile.name || '',
          'personalDetails.email': profile.personalDetails?.email || profile.email || '',
          'personalDetails.phoneNo': profile.personalDetails?.phoneNo || profile.contact || '',
          'personalDetails.gender': profile.personalDetails?.gender || profile.gender || '',
          'personalDetails.dateOfBirth': profile.personalDetails?.dateOfBirth || profile.dateOfBirth || '',
          'academicDetails.department': profile.academicDetails?.department || profile.department || '',
          'academicDetails.rollNumber': profile.academicDetails?.rollNumber || '',
          'parents.name': profile.parents?.name || '',
          'parents.contact': profile.parents?.contact || '',
          'parents.email': profile.parents?.email || '',
          'parents.occupation': profile.parents?.occupation || '',
          'parents.relation': profile.parents?.relation || '',
          role: profile.role
        }
      } else {
        // Faculty, admin, superadmin
        initialProfile = {
          id: profile.id || profile._id,
          name: profile.name || '',
          department: profile.department || '',
          email: profile.email || '',
          contact: profile.contact || '',
          gender: profile.gender || '',
          dateOfBirth: profile.dateOfBirth ? formatSimpleDate(profile.dateOfBirth) : '',
          address: profile.address || '',
          designation: profile.designation || '',
          employmentType: profile.employmentType || '',
          dateOfJoining: profile.dateOfJoining ? formatSimpleDate(profile.dateOfJoining) : '',
          'education.highestDegree': profile.education?.highestDegree || '',
          'education.specialization': profile.education?.specialization || '',
          'education.university': profile.education?.university || '',
          'education.yearOfPassing': profile.education?.yearOfPassing || '',
          currentYear: currentYear,
          sem: sem,
          role: profile.role,
          instituteCode: profile.instituteCode
        }
      }

      setUserProfile({
        ...profile,
        currentYear,
        sem
      })

      setUpdatedProfile(initialProfile)
    }
    
    // Simulate loading delay
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setUpdatedProfile({
      ...updatedProfile,
      [name]: value,
    })
  }

  const handleNestedInputChange = (field, value) => {
    setUpdatedProfile({
      ...updatedProfile,
      [field]: value,
    })
  }

  const handleSettingChange = (setting, value) => {
    setUpdatedProfile({
      ...updatedProfile,
      [setting]: value,
    })
  }

  const prepareDataForSubmission = () => {
    // Different preparation based on role
    if (userProfile.role === 'student') {
      // Transform flat structure back to nested for student
      return {
        _id: updatedProfile._id,
        personalDetails: {
          name: updatedProfile['personalDetails.name'],
          email: updatedProfile['personalDetails.email'],
          phoneNo: updatedProfile['personalDetails.phoneNo'],
          gender: updatedProfile['personalDetails.gender'],
          dateOfBirth: updatedProfile['personalDetails.dateOfBirth']
        },
        academicDetails: {
          department: updatedProfile['academicDetails.department'],
          rollNumber: updatedProfile['academicDetails.rollNumber']
        },
        parents: {
          name: updatedProfile['parents.name'],
          contact: updatedProfile['parents.contact'],
          email: updatedProfile['parents.email'],
          occupation: updatedProfile['parents.occupation'],
          relation: updatedProfile['parents.relation']
        }
      }
    } else {
      // Faculty, admin, superadmin
      return {
        id: updatedProfile.id,
        name: updatedProfile.name,
        department: updatedProfile.department,
        email: updatedProfile.email,
        contact: updatedProfile.contact,
        gender: updatedProfile.gender,
        dateOfBirth: updatedProfile.dateOfBirth,
        address: updatedProfile.address,
        designation: updatedProfile.designation,
        employmentType: updatedProfile.employmentType,
        dateOfJoining: updatedProfile.dateOfJoining,
        education: {
          highestDegree: updatedProfile['education.highestDegree'],
          specialization: updatedProfile['education.specialization'],
          university: updatedProfile['education.university'],
          yearOfPassing: updatedProfile['education.yearOfPassing']
        },
        currentYear: updatedProfile.currentYear || getCurrentAcademicYear(),
        sem: updatedProfile.sem || 'sem1'
      }
    }
  }

  const handleSave = async () => {
    if (userProfile) {
      const role = userProfile.role === "admin" ? "department" : 
                  userProfile.role === "superadmin" ? "institute" : 
                  userProfile.role === "student" ? "student" : "faculty"
      try {
        const dataToSubmit = prepareDataForSubmission()

        await axios.put(`/api/v2/${role}?_id=${userProfile?._id || userProfile?.id}`, dataToSubmit)

        // Create an updated profile merging original data with updates
        const updatedFullProfile = {
          ...userProfile,
          ...dataToSubmit
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

  const renderStudentProfileContent = () => {
    if (isEditing) {
      return (
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Input
              label="Student ID"
              name="_id"
              value={updatedProfile._id}
              isDisabled
              variant="bordered"
            />
            <Input
              label="Name"
              name="personalDetails.name"
              value={updatedProfile['personalDetails.name']}
              onChange={handleInputChange}
              variant="bordered"
            />
            <Input
              label="Email"
              name="personalDetails.email"
              type="email"
              value={updatedProfile['personalDetails.email']}
              onChange={handleInputChange}
              variant="bordered"
            />
            <Input
              label="Phone Number"
              name="personalDetails.phoneNo"
              value={updatedProfile['personalDetails.phoneNo']}
              onChange={handleInputChange}
              variant="bordered"
            />
            <Input
              label="Date of Birth"
              name="personalDetails.dateOfBirth"
              type="date"
              value={formatSimpleDate(updatedProfile['personalDetails.dateOfBirth'])}
              onChange={handleInputChange}
              variant="bordered"
            />
            <Select
              label="Gender"
              name="personalDetails.gender"
              selectedKeys={updatedProfile['personalDetails.gender'] ? [updatedProfile['personalDetails.gender']] : []}
              onChange={(e) => handleNestedInputChange('personalDetails.gender', e.target.value)}
              variant="bordered"
            >
              <SelectItem key="Male">Male</SelectItem>
              <SelectItem key="Female">Female</SelectItem>
              <SelectItem key="Other">Other</SelectItem>
            </Select>
            <Input
              label="Department"
              name="academicDetails.department"
              value={updatedProfile['academicDetails.department']}
              onChange={handleInputChange}
              variant="bordered"
            />
            <Input
              label="Roll Number"
              name="academicDetails.rollNumber"
              value={updatedProfile['academicDetails.rollNumber']}
              onChange={handleInputChange}
              variant="bordered"
            />
          </div>

          <div className="mt-6">
            <h4 className="text-lg font-medium mb-3">Parent/Guardian Information</h4>
            <div className="grid grid-cols-2 gap-6">
              <Input
                label="Parent/Guardian Name"
                name="parents.name"
                value={updatedProfile['parents.name']}
                onChange={handleInputChange}
                variant="bordered"
              />
              <Select
                label="Relation"
                name="parents.relation"
                selectedKeys={updatedProfile['parents.relation'] ? [updatedProfile['parents.relation']] : []}
                onChange={(e) => handleNestedInputChange('parents.relation', e.target.value)}
                variant="bordered"
              >
                <SelectItem key="Father">Father</SelectItem>
                <SelectItem key="Mother">Mother</SelectItem>
                <SelectItem key="Guardian">Guardian</SelectItem>
                <SelectItem key="Other">Other</SelectItem>
              </Select>
              <Input
                label="Parent/Guardian Contact"
                name="parents.contact"
                value={updatedProfile['parents.contact']}
                onChange={handleInputChange}
                variant="bordered"
              />
              <Input
                label="Parent/Guardian Email"
                name="parents.email"
                type="email"
                value={updatedProfile['parents.email']}
                onChange={handleInputChange}
                variant="bordered"
              />
              <Input
                label="Occupation"
                name="parents.occupation"
                value={updatedProfile['parents.occupation']}
                onChange={handleInputChange}
                variant="bordered"
              />
            </div>
          </div>
          
          <Button 
            color="primary" 
            type="submit" 
            startContent={<SaveIcon className="h-4 w-4" />}
          >
            Save Changes
          </Button>
        </form>
      )
    }

    return (
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Student ID</p>
          <p className="text-sm font-medium">{userProfile?._id}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Name</p>
          <p className="text-sm font-medium">{userProfile?.personalDetails?.name}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Email</p>
          <p className="text-sm font-medium">{userProfile?.personalDetails?.email}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Phone Number</p>
          <p className="text-sm font-medium">{userProfile?.personalDetails?.phoneNo || 'Not provided'}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Date of Birth</p>
          <p className="text-sm font-medium">{userProfile?.personalDetails?.dateOfBirth ? new Date(userProfile.personalDetails.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Gender</p>
          <p className="text-sm font-medium">{userProfile?.personalDetails?.gender || 'Not provided'}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Department</p>
          <p className="text-sm font-medium">{userProfile?.academicDetails?.department}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Roll Number</p>
          <p className="text-sm font-medium">{userProfile?.academicDetails?.rollNumber}</p>
        </div>
        
        <div className="col-span-2 mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-lg font-medium mb-3">Parent/Guardian Information</h4>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Name</p>
              <p className="text-sm font-medium">{userProfile?.parents?.name || 'Not provided'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Relation</p>
              <p className="text-sm font-medium">{userProfile?.parents?.relation || 'Not provided'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Contact</p>
              <p className="text-sm font-medium">{userProfile?.parents?.contact || 'Not provided'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-sm font-medium">{userProfile?.parents?.email || 'Not provided'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Occupation</p>
              <p className="text-sm font-medium">{userProfile?.parents?.occupation || 'Not provided'}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderFacultyProfileContent = () => {
    if (isEditing) {
      return (
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Input
              label={userProfile?.role === "superadmin" ? "Institute Code" : "Faculty/Staff ID"}
              name="id"
              value={updatedProfile.id || updatedProfile.instituteCode}
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
            {userProfile?.role !== "superadmin" && (
              <Input
                label="Department"
                name="department"
                value={updatedProfile.department}
                onChange={handleInputChange}
                variant="bordered"
              />
            )}
            <Input
              label="Email"
              name="email"
              type="email"
              value={updatedProfile.email}
              onChange={handleInputChange}
              variant="bordered"
            />
            <Input
              label="Contact"
              name="contact"
              value={updatedProfile.contact}
              onChange={handleInputChange}
              variant="bordered"
            />
            <Input
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={updatedProfile.dateOfBirth}
              onChange={handleInputChange}
              variant="bordered"
            />
            <Select
              label="Gender"
              name="gender"
              selectedKeys={updatedProfile.gender ? [updatedProfile.gender] : []}
              onChange={(e) => handleSettingChange('gender', e.target.value)}
              variant="bordered"
            >
              <SelectItem key="Male">Male</SelectItem>
              <SelectItem key="Female">Female</SelectItem>
              <SelectItem key="Other">Other</SelectItem>
            </Select>
            <Input
              label="Designation"
              name="designation"
              value={updatedProfile.designation}
              onChange={handleInputChange}
              variant="bordered"
            />
            <Select
              label="Employment Type"
              name="employmentType"
              selectedKeys={updatedProfile.employmentType ? [updatedProfile.employmentType] : []}
              onChange={(e) => handleSettingChange('employmentType', e.target.value)}
              variant="bordered"
            >
              <SelectItem key="teaching">Teaching</SelectItem>
              <SelectItem key="non-teaching">Non-Teaching</SelectItem>
            </Select>
            <Input
              label="Date of Joining"
              name="dateOfJoining"
              type="date"
              value={updatedProfile.dateOfJoining}
              onChange={handleInputChange}
              variant="bordered"
            />
            <Textarea
              label="Address"
              name="address"
              value={updatedProfile.address}
              onChange={handleInputChange}
              variant="bordered"
              className="col-span-2"
            />
          </div>

          {(userProfile?.role === 'faculty' || userProfile?.role === 'admin') && (
            <div className="mt-6">
              <h4 className="text-lg font-medium mb-3">Education</h4>
              <div className="grid grid-cols-2 gap-6">
                <Input
                  label="Highest Degree"
                  name="education.highestDegree"
                  value={updatedProfile['education.highestDegree']}
                  onChange={handleInputChange}
                  variant="bordered"
                />
                <Input
                  label="Specialization"
                  name="education.specialization"
                  value={updatedProfile['education.specialization']}
                  onChange={handleInputChange}
                  variant="bordered"
                />
                <Input
                  label="University"
                  name="education.university"
                  value={updatedProfile['education.university']}
                  onChange={handleInputChange}
                  variant="bordered"
                />
                <Input
                  label="Year of Passing"
                  name="education.yearOfPassing"
                  type="number"
                  value={updatedProfile['education.yearOfPassing']}
                  onChange={handleInputChange}
                  variant="bordered"
                />
              </div>
            </div>
          )}

          {(userProfile?.role === 'faculty' || userProfile?.role === 'admin' || userProfile?.role === 'superadmin') && (
            <div className="mt-6">
              <h4 className="text-lg font-medium mb-3">Settings</h4>
              <div className="grid grid-cols-2 gap-6">
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
              </div>
            </div>
          )}
          <Button 
            color="primary" 
            type="submit" 
            startContent={<SaveIcon className="h-4 w-4" />}
          >
            Save Changes
          </Button>
        </form>
      )
    }

    return (
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <p className="text-sm text-gray-500">{userProfile?.role === "superadmin" ? "Institute Code" : "Faculty/Staff ID"}</p>
          <p className="text-sm font-medium">{userProfile?.role === "superadmin" ? userProfile?.instituteCode : userProfile?.id}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Name</p>
          <p className="text-sm font-medium">{userProfile?.name}</p>
        </div>
        {userProfile?.role !== "superadmin" && (
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Department</p>
            <p className="text-sm font-medium">{userProfile?.role === "admin" ? userProfile?.name : userProfile?.department}</p>
          </div>
        )}
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Email</p>
          <p className="text-sm font-medium">{userProfile?.email}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Contact</p>
          <p className="text-sm font-medium">{userProfile?.contact || 'Not provided'}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Date of Birth</p>
          <p className="text-sm font-medium">{userProfile?.dateOfBirth ? new Date(userProfile.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Gender</p>
          <p className="text-sm font-medium">{userProfile?.gender || 'Not provided'}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Designation</p>
          <p className="text-sm font-medium">{userProfile?.designation || 'Not provided'}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Employment Type</p>
          <p className="text-sm font-medium">{userProfile?.employmentType ? 
            (userProfile.employmentType === 'teaching' ? 'Teaching' : 'Non-Teaching') : 
            'Not provided'}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Date of Joining</p>
          <p className="text-sm font-medium">{userProfile?.dateOfJoining ? new Date(userProfile.dateOfJoining).toLocaleDateString() : 'Not provided'}</p>
        </div>
        <div className="space-y-2 col-span-2">
          <p className="text-sm text-gray-500">Address</p>
          <p className="text-sm font-medium">{userProfile?.address || 'Not provided'}</p>
        </div>

        {(userProfile?.role === 'faculty' || userProfile?.role === 'admin') && userProfile?.education && (
          <div className="col-span-2 mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-lg font-medium mb-3">Education</h4>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Highest Degree</p>
                <p className="text-sm font-medium">{userProfile.education.highestDegree || 'Not provided'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Specialization</p>
                <p className="text-sm font-medium">{userProfile.education.specialization || 'Not provided'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">University</p>
                <p className="text-sm font-medium">{userProfile.education.university || 'Not provided'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Year of Passing</p>
                <p className="text-sm font-medium">{userProfile.education.yearOfPassing || 'Not provided'}</p>
              </div>
            </div>
          </div>
        )}

        {(userProfile?.role === 'faculty' || userProfile?.role === 'admin' || userProfile?.role === 'superadmin') && (
          <div className="col-span-2 mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-lg font-medium mb-3">Settings</h4>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Default Academic Year</p>
                <p className="text-sm font-medium">{userProfile?.currentYear}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Default Semester</p>
                <p className="text-sm font-medium">{userProfile?.sem?.toUpperCase()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderProfileContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-2 gap-4">
          {Array(6).fill(null).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      )
    }

    return userProfile?.role === 'student' ? renderStudentProfileContent() : renderFacultyProfileContent()
  }

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
          )
        }
    
        if (!userProfile) return null
    
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className={`rounded-full p-3 ${roleBackgroundColor[userProfile.role]}`}>
                <UserIcon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-lg font-medium">{userProfile.role === 'student' ? userProfile.personalDetails?.name : userProfile.name}</h4>
                <p className={`text-sm ${roleColor[userProfile.role]}`}>
                  {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
                </p>
              </div>
            </div>
    
            <div className="flex items-center space-x-4">
              <div className="rounded-full p-3 bg-blue-50">
                <EnvelopeIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-lg font-medium">Email</h4>
                <p className="text-sm text-gray-600">
                  {userProfile.role === 'student' ? userProfile.personalDetails?.email : userProfile.email}
                </p>
              </div>
            </div>
    
            <div className="flex items-center space-x-4">
              <div className="rounded-full p-3 bg-green-50">
                <PhoneIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="text-lg font-medium">Phone</h4>
                <p className="text-sm text-gray-600">
                  {userProfile.role === 'student' ? userProfile.personalDetails?.phoneNo : userProfile.contact}
                </p>
              </div>
            </div>
          </div>
        )
      }
    
      const renderTabContent = () => {
        switch (activeTab) {
          case 'details':
            return renderProfileContent()
          case 'info':
            return renderAdditionalInfo()
          default:
            return renderProfileContent()
        }
      }
    
      return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="md:flex">
              {/* Left Side - Avatar and Quick Info */}
              <div className="bg-gray-50 p-6 md:w-1/3">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <Avatar 
                      className="w-32 h-32 text-large"
                      showFallback
                      name={userProfile?.role === 'student' ? userProfile?.personalDetails?.name?.charAt(0) : userProfile?.name?.charAt(0)} 
                    />
                  </div>
                  
                  {userProfile && (
                    <div className="mt-2 space-y-1">
                      <h3 className="text-xl font-semibold">
                        {userProfile.role === 'student' 
                          ? userProfile.personalDetails?.name 
                          : userProfile.name}
                      </h3>
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBackgroundColor[userProfile.role]} ${roleColor[userProfile.role]}`}>
                        {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
                      </div>
                      <p className="text-sm text-gray-500">
                        {userProfile.role === 'student' 
                          ? userProfile.academicDetails?.department 
                          : userProfile.role === 'superadmin' 
                            ? 'Institute Administrator' 
                            : userProfile.department}
                      </p>
                    </div>
                  )}
    
                  <div className="mt-6 w-full">
                    <Tabs 
                      selectedKey={activeTab}
                      onSelectionChange={setActiveTab}
                      className="w-full"
                      variant="underlined"
                    >
                      <Tab key="details" title="Details" />
                      <Tab key="info" title="Info" />
                    </Tabs>
                  </div>
                </div>
              </div>
              
              {/* Right Side - Profile Details */}
              <div className="p-6 md:w-2/3">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Profile</h2>
                  <Button
                    color={isEditing ? "danger" : "primary"}
                    variant="flat"
                    onClick={() => setIsEditing(!isEditing)}
                    startContent={isEditing ? <XIcon className="h-4 w-4" /> : <PencilIcon className="h-4 w-4" />}
                  >
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>
                </div>
                
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      )
    }