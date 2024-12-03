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
  DropdownItem
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
  Settings
} from 'lucide-react'
import axios from 'axios'

// Utility functions to handle academic years
export const getCurrentAcademicYear = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Academic year typically starts in July/August
  const academicYearStart = currentMonth >= 6 ? currentYear : currentYear - 1;
  const academicYearEnd = academicYearStart + 1;

  return `${academicYearStart}-${academicYearEnd}`;
};

export const getAcademicYears = (count = 5) => {
  const currentYear = new Date().getFullYear();
  const years = [];

  for (let i = 0; i < count; i++) {
    const startYear = currentYear - i;
    const endYear = startYear + 1;
    years.push({
      value: `${startYear}-${endYear}`,
      label: `${startYear}-${endYear}`
    });
  }

  return years;
};

export default function Component() {
  const [userProfile, setUserProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
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

      // Ensure default academic year and semester are set
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
      const { id } = userProfile
      try {
        // Ensure academic year and semester are included in the update
        const profileToUpdate = {
          ...updatedProfile,
          currentYear: updatedProfile.currentYear || getCurrentAcademicYear(),
          sem: updatedProfile.sem || 'sem1'
        }

        await axios.put(`/api/${role}?_id=${userProfile?._id}`, profileToUpdate)

        // Update both userProfile and sessionStorage with complete profile
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

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-gray-100 to-gray-200">
        <Card className="w-[600px]">
          <CardHeader>
            <h4 className="text-large font-bold">Loading Profile</h4>
          </CardHeader>
          <CardBody>
            <div className="flex items-center space-x-4">
              <Skeleton className="rounded-full">
                <Avatar className="w-12 h-12" />
              </Skeleton>
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    )
  }

  const roleColor = {
    admin: "text-purple-600",
    faculty: "text-blue-600",
    superadmin: "text-red-600",
    student: "text-green-600",
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-gray-100 to-gray-200 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Avatar src="/avatar.svg" name={userProfile.name} className="w-20 h-20" />
            <div>
              <h4 className="text-2xl font-bold">{userProfile.name}</h4>
              <p className={`text-sm font-medium ${roleColor[userProfile.role]}`}>
                {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
              </p>
            </div>
          </div>
          <Button isIconOnly variant="light" onPress={() => setIsEditing(!isEditing)}>
            {isEditing ? <XIcon className="h-4 w-4" /> : <PencilIcon className="h-4 w-4" />}
          </Button>
        </CardHeader>
        <CardBody>
          <Tabs aria-label="Profile tabs" className="mt-6">
            <Tab key="details" title="Profile Details">
              {isEditing ? (
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="ID"
                      name="_id"
                      value={updatedProfile._id}
                      isDisabled
                    />
                    <Input
                      label="Name"
                      name="name"
                      value={updatedProfile.name}
                      onChange={handleInputChange}
                    />
                    <Input
                      label="Department"
                      name="department"
                      value={updatedProfile.department}
                      onChange={handleInputChange}
                    />
                    <Input
                      label="Email"
                      name="email"
                      type="email"
                      value={updatedProfile.email}
                      onChange={handleInputChange}
                    />
                    {(userProfile.role === 'faculty' || userProfile.role === 'admin' || userProfile.role === 'superadmin') && (
                      <>
                        <Dropdown>
                          <DropdownTrigger>
                            <Button
                              variant="bordered"
                              className="w-full justify-start h-14"
                              startContent={<Settings className="h-4 w-4" />}
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
                              startContent={<Settings className="h-4 w-4" />}
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
                  <Button color="primary" type="submit" startContent={<SaveIcon className="h-4 w-4" />}>
                    Save Changes
                  </Button>
                </form>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">ID</p>
                    <p className="text-sm font-medium">{userProfile.role !== "student" ? userProfile.id : userProfile._id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="text-sm font-medium">{userProfile.name}</p>
                  </div>
                  {userProfile.role !== "superadmin" &&
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="text-sm font-medium">{userProfile.role !== "admin" ? userProfile.department : userProfile.id}</p>
                    </div>
                  }

                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-sm font-medium">{userProfile.email}</p>
                  </div>

                  {(userProfile.role === 'faculty' || userProfile.role === 'admin' || userProfile.role === 'superadmin') && (
                    <>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Default Academic Year</p>
                        <p className="text-sm font-medium">{userProfile.currentYear}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Default Semester</p>
                        <p className="text-sm font-medium">{userProfile.sem?.toUpperCase()}</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </Tab>
            <Tab key="activity" title="Recent Activity">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Recent Activity</h3>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-2">
                    <UserIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Profile updated 2 days ago</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <BriefcaseIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">New project assigned yesterday</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <MailIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Email verified 1 week ago</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <KeyIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Password changed 2 weeks ago</span>
                  </li>
                </ul>
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  )
}