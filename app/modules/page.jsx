 
"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@nextui-org/react"
import { CardBody, Card, CardHeader } from "@nextui-org/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { signOut } from "next-auth/react"
import { UserCircle, Building2, Mail, GraduationCap } from "lucide-react"
import { RxExit } from "react-icons/rx"
import { useUser } from "../context/UserContext"


// Module configurations
const MODULE_CONFIG = {
  attendance: {
    id: 'attendance-service',
    name: "Attendance Management",
    illustration: "/illustrations/attendance.svg",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    descriptions: {
      admin: "View and manage attendance records. Track student attendance patterns and generate detailed reports.",
      superadmin: "View and manage attendance records. Track student attendance patterns and generate detailed reports.",
      faculty: "Take and manage daily attendance. View attendance statistics and generate reports for your classes.",
      student: "View your attendance records, track your attendance percentage, and check subject-wise attendance details."
    }
  },
  feedback: {
    id: 'feedback-service',
    name: "Feedback Management",
    illustration: "/illustrations/feedback.svg",
    bgColor: "bg-green-50",
    textColor: "text-green-600",
    descriptions: {
      admin: "Manage and review feedback. Analyze student responses and generate insights for improvement.",
      superadmin: "Manage and review feedback. Analyze student responses and generate insights for improvement."
    }
  }
}

export default function ModuleSelectionPage() {
  const router = useRouter()
  const { user, loading } = useUser()
  const [loadingModule, setLoadingModule] = useState(null)
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  } 

  if (!user && !loading) {
    router.push('/login')
  }

console.log(user);

  const handleSignOut = async () => {
    await signOut({ redirect: false, callbackUrl: "/" })
    sessionStorage.clear()
    router.push("/login")
  }

  // Get available modules based on user role and subscriptions
  const getAvailableModules = () => {
    const role = user?.role
    const subscribedServices = user?.subscribedServices || []
    const modules = []

    Object.entries(MODULE_CONFIG).forEach(([key, module]) => {
      // Check if user has access to this module
      if (
        module.descriptions[role] &&
        subscribedServices.includes(module.id)
      ) {
        modules.push({
          ...module,
          description: module.descriptions[role],
          path: `${key}${role === "superadmin" || role === "admin" ? "/admin" : `/${role}`}`
        })
      }
    })
 
    return modules
  }

  const availableModules = getAvailableModules()

  const handleModuleClick = (moduleName, modulePath) => {
    setLoadingModule(moduleName)
    router.push(modulePath)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Institute Header */}
      <header className="bg-white/70 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-6">
              <Image
                src="/logoschool.jpeg"
                height={90}
                width={90}
                alt="College Logo"
                className="rounded-lg shadow-sm hover:shadow-md transition-shadow"
              />
              <div className="space-y-1 text-center sm:text-left">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight tracking-tight">
                  {user?.role == "superadmin"
                    ? user?.university
                    : user?.institute?.university || "Savitribai Phule Shikshan Prasarak Mandal's"}
                  <span className="block text-primary font-semibold">
                    {user?.role == "superadmin" ? user?.name : user?.institute?.name}
                  </span>
                </h1>
                <p className="text-sm text-gray-500 tracking-wide">
                  {user?.role == "superadmin" ? user?.address : user?.institute?.address}
                </p>
              </div>
            </div>
            <div className="text-center lg:text-left space-y-2">
              {user?.department && (
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <Building2 className="h-4 w-4 text-primary" />
                  <p className="text-sm text-gray-600">Dept: {user?.department}</p>
                </div>
              )}
              {user?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                <p className="text-sm text-gray-600">
                  Role: {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </p>
              </div>

              <button
                className="flex items-center gap-2 text-violet-900 hover:text-violet-700 transition-colors"
                onClick={handleSignOut}
              >
                <RxExit className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-4">
        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableModules.map((module) => (
            <Card
              key={module.name}
              className={`
                ${module.bgColor}
                border-2 border-transparent
                hover:border-primary
                transition-all
                duration-300
                hover:shadow-xl
                transform
                hover:-translate-y-2
                flex flex-col
              `}
            >
              <CardHeader className="pb-2 flex-grow-0">
                <div className="flex justify-center mb-4 h-40 sm:h-48">
                  <Image
                    src={module.illustration}
                    alt={module.name}
                    width={200}
                    height={200}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <h1 className={`text-xl text-center ${module.textColor} font-semibold`}>
                  {module.name}
                </h1>
              </CardHeader>
              <CardBody className="flex flex-col flex-grow justify-end">
                <p className="text-muted-foreground mb-4 text-center text-sm text-gray-600">
                  {module.description}
                </p>
                <Button
                  className="w-full bg-primary text-white hover:bg-primary/90 transition-colors"
                  onClick={() => handleModuleClick(module.name, module.path)}
                  disabled={loadingModule === module.name}
                >
                  {loadingModule === module.name ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2" />
                      Loading...
                    </div>
                  ) : (
                    "Open Module"
                  )}
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}