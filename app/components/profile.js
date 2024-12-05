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
  Chip
} from '@nextui-org/react'
import { toast } from 'sonner'
import { PencilIcon, SaveIcon, XIcon, UserIcon, BriefcaseIcon, MailIcon, KeyIcon, Settings, BookOpenIcon, CalendarIcon, GraduationCapIcon } from 'lucide-react'
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
  const [updatedProfile, setUpdatedProfile] = useState({
    _id: '',
    name: '',
    department: '',
    email: '',
    role: '',
    currentYear: '',
    sem: ''
  })

  useEffect(() => {
    const storedProfile = sessionStorage.getItem('userProfile')
    if (storedProfile) {
      const profile = JSON.parse(storedProfile)
      const currentYear = profile.currentYear || getCurrentAcademicYear()
      const sem = profile.sem || 'sem1'

      setUserProfile({
        ...profile,
        currentYear,
        sem
      })

      setUpdatedProfile({
        ...profile,
        currentYear,
        sem
      })
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

  const handleSettingChange = (setting, value) => {
    setUpdatedProfile({
      ...updatedProfile,
      [setting]: value,
    })
  }

  const handleSave = async () => {
    if (userProfile) {
      const role = userProfile.role === "admin" || userProfile.role === "superadmin" ? "faculty" : userProfile.role
      try {
        const profileToUpdate = {
          ...updatedProfile,
          currentYear: updatedProfile.currentYear || getCurrentAcademicYear(),
          sem: updatedProfile.sem || 'sem1'
        }

        await axios.put(`/api/${role}?_id=${userProfile?._id}`, profileToUpdate)

        const updatedFullProfile = {
          ...userProfile,
          ...profileToUpdate
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

    if (isEditing) {
      return (
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Input
              label="Faculty/Staff ID"
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
              label="Department"
              name="department"
              value={updatedProfile.department}
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
          <p className="text-sm text-gray-500">{userProfile?.role==="superadmin" ? "Instituted Code" :"Faculty/Staff ID"}</p>
          <p className="text-sm font-medium">{userProfile?.role==="superadmin"? userProfile?.instituteCode: userProfile?.id}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Name</p>
          <p className="text-sm font-medium">{userProfile?.name}</p>
        </div>
        {userProfile?.role!=="superadmin" &&(
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Department</p>
          <p className="text-sm font-medium">{userProfile?.role==="admin"? userProfile?.name: userProfile?.department}</p>
        </div>
        )}
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Email</p>
          <p className="text-sm font-medium">{userProfile?.email}</p>
        </div>
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
    )
  }

  return (
    <div className={`flex justify-center items-center min-h-screen  ${roleBackgroundColor[userProfile?.role]}`}>
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
                      color={
                        userProfile?.role === 'superadmin' ? 'danger' : 
                        userProfile?.role === 'admin' ? 'secondary' : 
                        userProfile?.role === 'faculty' ? 'primary' : 
                        'success'
                      } 
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
          <Tabs aria-label="Profile tabs" variant="underlined">
            <Tab key="details" title="Profile Details">
              <div className="mt-4 space-y-6">
                {renderProfileContent()}
              </div>
            </Tab>
            <Tab key="info" title="Additional Information">
              <div className="mt-4">
                {renderAdditionalInfo()}
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  )
}

