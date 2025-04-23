// "use client"

// import React, { useState, useEffect } from "react"
// import { Button } from "@nextui-org/react"
// import { CardBody, Card, CardHeader } from "@nextui-org/react"
// import { useRouter } from "next/navigation"
// import Image from "next/image"
// import { signOut } from "next-auth/react"
// import { UserCircle, Building2, Mail, GraduationCap, User2 } from "lucide-react"
// import { RxExit } from "react-icons/rx"
// import { useUser } from "../context/UserContext"
// import Link from "next/link"


// // Module configurations
// const MODULE_CONFIG = {
//   attendance: {
//     id: 'attendance-service',
//     name: "Attendance Management",
//     illustration: "/illustrations/attendance.svg",
//     bgColor: "bg-blue-50",
//     textColor: "text-blue-600",
//     descriptions: {
//       admin: "View and manage attendance records. Track student attendance patterns and generate detailed reports.",
//       superadmin: "View and manage attendance records. Track student attendance patterns and generate detailed reports.",
//       faculty: "Take and manage daily attendance. View attendance statistics and generate reports for your classes.",
//       student: "View your attendance records, track your attendance percentage, and check subject-wise attendance details."
//     }
//   },
//   feedback: {
//     id: 'feedback-service',
//     name: "Feedback Management",
//     illustration: "/illustrations/feedback.svg",
//     bgColor: "bg-green-50",
//     textColor: "text-green-600",
//     descriptions: {
//       admin: "Manage and review feedback. Analyze student responses and generate insights for improvement.",
//       superadmin: "Manage and review feedback. Analyze student responses and generate insights for improvement."
//     }
//   },
//   student_management: {
//     id: 'student-service',
//     name: "Student Management",
//     illustration: "/illustrations/students.svg",
//     bgColor: "bg-purple-50",
//     textColor: "text-purple-600",
//     descriptions: {
//       admin: "Manage student profiles, track academic progress, and handle student-related administrative tasks.",
//       superadmin: "Complete oversight of student data across all institutes. Manage enrollments and student policies." 
//     }
//   },
//   faculty_management: {
//     id: 'faculty-service',
//     name: "Faculty Management",
//     illustration: "/illustrations/faculty.svg",
//     bgColor: "bg-amber-50",
//     textColor: "text-amber-600",
//     descriptions: {
//       admin: "Manage faculty information, track performance, handle assignments and department allocation.",
//       superadmin: "Oversee all faculty across institutes, manage hiring policies, and monitor faculty development.",
//     }
//   },
//   department_management: {
//     id: 'department-service',
//     name: "Department Management",
//     illustration: "/illustrations/department.svg",
//     bgColor: "bg-rose-50",
//     textColor: "text-rose-600",
//     descriptions: {
//       superadmin: "Establish departments across institutes, implement organizational policies, and monitor performance.",

//     }
//   }
// ,
//   course_management: {
//     id: 'course-service',
//     name: "Course Management",
//     illustration: "/illustrations/course.svg",
//     bgColor: "bg-teal-50",
//     textColor: "text-teal-600",
//     descriptions: {
//       admin: "Manage course offerings, allocate resources, handle course scheduling and room assignments.",
//       superadmin: "Oversee curriculum development across institutes, establish course standards and policies.",
//       faculty: "Manage your course content, share learning materials, create assignments and assess student work."
//     }
//   } ,


// }

// export default function ModuleSelectionPage() {
//   const router = useRouter()
//   const { user, loading } = useUser()
//   const [loadingModule, setLoadingModule] = useState(null)


//   console.log(user);
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
//       </div>
//     )
//   } 

//   if (!user && !loading) {
//     router.push('/login')
//   }

//   const handleSignOut = async () => {
//     await signOut({ redirect: false, callbackUrl: "/" })
//     sessionStorage.clear()
//     router.push("/login")
//   }

//   // Get available modules based on user role and subscriptions
//   const getAvailableModules = () => {
//     const role = user?.role
//     const subscribedServices = user?.subscribedServices || []
//     const modules = []

//     Object.entries(MODULE_CONFIG).forEach(([key, module]) => {
//       // Check if user has access to this module
//       if (
//         module.descriptions[role] &&
//         subscribedServices.includes(module.id)
//       ) {
//         modules.push({
//           ...module,
//           description: module.descriptions[role],
//           path: `${key}${role === "superadmin" || role === "admin" ? "/admin" : `/${role}`}`
//         })
//       }
//     })

//     return modules
//   }

//   const availableModules = getAvailableModules()

//   const handleModuleClick = (moduleName, modulePath) => {
//     setLoadingModule(moduleName)
//     router.push(modulePath)
//   }

//   return (
//     <div className="min-h-screen mx-10 bg-gradient-to-b from-gray-50 to-white">
//       {/* Institute Header */}
//       <header className="bg-white/70 backdrop-blur-md border-b sticky top-0 z-50">
//         <div className="container mx-auto px-4 py-4">
//           <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
//             <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-6">
//               <Image
//                 src="/logoschool.jpeg"
//                 height={90}
//                 width={90}
//                 alt="College Logo"
//                 className="rounded-lg shadow-sm hover:shadow-md transition-shadow"
//               />
//               <div className="space-y-1 text-center sm:text-left">
//                 <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight tracking-tight">
//                   {user?.role == "superadmin"
//                     ? user?.university
//                     : user?.institute?.university || "Savitribai Phule Shikshan Prasarak Mandal's"}
//                   <span className="block text-primary font-semibold">
//                     {user?.role == "superadmin" ? user?.name : user?.institute?.name}
//                   </span>
//                 </h1>
//                 <p className="text-sm text-gray-500 tracking-wide">
//                   {user?.role == "superadmin" ? user?.address : user?.institute?.address}
//                 </p>
//               </div>
//             </div>
//             <div className="text-center lg:text-left space-y-2">
//               {user?.department && (
//                 <div className="flex items-center gap-2 justify-center lg:justify-start">
//                   <Building2 className="h-4 w-4 text-primary" />
//                   <p className="text-sm text-gray-600">Dept: {user?.department}</p>
//                 </div>
//               )}
//               {user?.email && (
//                 <div className="flex items-center gap-2">
//                   <Mail className="h-4 w-4 text-primary" />
//                   <p className="text-sm text-gray-600">{user.email}</p>
//                 </div>
//               )}

//               <div className="flex items-center gap-2">
//                 <GraduationCap className="h-4 w-4 text-primary" />
//                 <p className="text-sm text-gray-600">
//                   Role: {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
//                 </p>
//               </div>
//               <Link href={"/profile"} className="text-violet-900 text-sm flex gap-1"><User2 className="h-4 w-4"/><span> <p> Profile</p></span></Link>
//               <button
//                 className="flex items-center gap-2 text-violet-900 text-sm hover:text-violet-700 transition-colors"
//                 onClick={handleSignOut}
//               >
//                 <RxExit className="w-4 h-4" />
//                 <span >Sign Out</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <div className="container mx-auto p-2">
//         {/* Modules Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           {availableModules.map((module) => (
//             <Card
//               key={module.name}
//               className={`
//                 ${module.bgColor}
//                 border-2 border-transparent
//                 hover:border-primary
//                 transition-all
//                 duration-300
//                 hover:shadow-xl
//                 transform
//                 hover:-translate-y-2
//                 flex flex-col
//               `}
//             >
//               <CardHeader className="pb-2 flex-grow-0">
//                 <div className="flex justify-center mb-4 h-40 sm:h-48">
//                   <Image
//                     src={module.illustration}
//                     alt={module.name}
//                     width={200}
//                     height={200}
//                     className="max-h-full max-w-full object-contain"
//                   />
//                 </div>
//                 <h1 className={`text-xl text-center ${module.textColor} font-semibold`}>
//                   {module.name}
//                 </h1>
//               </CardHeader>
//               <CardBody className="flex flex-col flex-grow justify-end">
//                 <p className="text-muted-foreground mb-4 text-center text-sm text-gray-600">
//                   {module.description}
//                 </p>
//                 <Button
//                   className="w-full bg-primary text-white hover:bg-primary/90 transition-colors"
//                   onClick={() => handleModuleClick(module.name, module.path)}
//                   disabled={loadingModule === module.name}
//                 >
//                   {loadingModule === module.name ? (
//                     <div className="flex items-center justify-center">
//                       <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2" />
//                       Loading...
//                     </div>
//                   ) : (
//                     "Open Module"
//                   )}
//                 </Button>
//               </CardBody>
//             </Card>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }

// pages/dashboard/page.jsx (or your main module selection page)
"use client"

import React, { useState } from "react";
import { Button, Card, CardBody, CardHeader, Spinner } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signOut } from "next-auth/react"; // Assuming next-auth
import { UserCircle, Building2, Mail, GraduationCap, User2, BookOpenCheck } from "lucide-react"; // Added BookOpenCheck for OBE
import { RxExit } from "react-icons/rx";
import { useUser } from "../context/UserContext"; // Your user context hook
import Link from "next/link";


// --- MODULE CONFIGURATION ---
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
    },
    student_management: {
        id: 'student-service',
        name: "Student Management",
        illustration: "/illustrations/students.svg",
        bgColor: "bg-purple-50",
        textColor: "text-purple-600",
        descriptions: {
            admin: "Manage student profiles, track academic progress, and handle student-related administrative tasks.",
            superadmin: "Complete oversight of student data across all institutes. Manage enrollments and student policies."
        }
    },
    faculty_management: {
        id: 'faculty-service',
        name: "Faculty Management",
        illustration: "/illustrations/faculty.svg",
        bgColor: "bg-amber-50",
        textColor: "text-amber-600",
        descriptions: {
            admin: "Manage faculty information, track performance, handle assignments and department allocation.",
            superadmin: "Oversee all faculty across institutes, manage hiring policies, and monitor faculty development.",
        }
    },
    department_management: {
        id: 'department-service',
        name: "Department Management",
        illustration: "/illustrations/department.svg",
        bgColor: "bg-rose-50",
        textColor: "text-rose-600",
        descriptions: {
            superadmin: "Establish departments across institutes, implement organizational policies, and monitor performance.",

        }
    }
    ,
    course_management: {
        id: 'course-service',
        name: "Course Management",
        illustration: "/illustrations/course.svg",
        bgColor: "bg-teal-50",
        textColor: "text-teal-600",
        descriptions: {
            admin: "Manage course offerings, allocate resources, handle course scheduling and room assignments.",
            superadmin: "Oversee curriculum development across institutes, establish course standards and policies.",
            faculty: "Manage your course content, share learning materials, create assignments and assess student work."
        }
    },
    obe_management: {
        id: 'obe-service', // Must match subscription if you use that
        name: "OBE Management",
        illustration: "/obe.png", // << CREATE THIS SVG ILLUSTRATION
        bgColor: "bg-indigo-50",
        textColor: "text-indigo-600",
        descriptions: {
            
            admin: "Define POs/PSOs, view overall attainment reports, configure settings.",
            superadmin: "Oversee OBE implementation across institutes, manage global settings.",
            faculty: "Manage COs, Assessments, Marks Entry, and view Attainment for your subjects.",
            // student: "View your course outcome progress." // Add if needed
        }
    }
    // --- END OBE MODULE ---
};
// --- END MODULE CONFIGURATION ---


export default function ModuleSelectionPage() {
    const router = useRouter();
    const { user, loading: userLoading } = useUser();
    const [loadingModule, setLoadingModule] = useState(null);

    // Redirect if not logged in
    // Note: This check might be better handled by middleware or layout component
    React.useEffect(() => {
        if (!userLoading && !user) {
            router.push('/login');
        }
    }, [user, userLoading, router]);

    const handleSignOut = async () => {
        await signOut({ redirect: false, callbackUrl: "/" });
        sessionStorage.clear(); // Clear any session storage if you use it
        router.push("/login");
    };

    const getAvailableModules = React.useCallback(() => {
        if (!user) return [];

        const role = user?.role;
        // Adjust subscription logic as needed. Add 'obe-service' if necessary.
        const subscribedServices = user?.subscribedServices || Object.values(MODULE_CONFIG).map(m => m.id); // Default to all if none specified
        const modules = [];

        Object.entries(MODULE_CONFIG).forEach(([key, module]) => {
            // Check role has description AND (is subscribed OR is superadmin/admin maybe?)
            if (
                module.descriptions[role] &&
                (subscribedServices.includes(module.id) || ['superadmin', 'admin'].includes(role)) // Example: Admins might bypass subscription
            ) {
                // Define role-specific base paths
                let rolePathSegment = '';
                if (role === 'superadmin') rolePathSegment = '/superadmin';
                else if (role === 'admin') rolePathSegment = '/admin';
                else if (role === 'faculty') rolePathSegment = '/faculty';
                else if (role === 'student') rolePathSegment = '/student';
                // Construct the full path
                const moduleBasePath = key.replace(/_management$/, '').replace(/_/, '-'); // e.g., 'obe_management' -> 'obe'
                modules.push({
                    ...module,
                    description: module.descriptions[role],
                    // Example Paths: /obe/admin, /obe/faculty, /student/admin etc.
                    path: `${key}${role === "superadmin" || role === "admin" ? "/admin" : `/${role}`}`
                });
            }
        });
        return modules;
    }, [user]); // Dependency: user object

    const availableModules = getAvailableModules();

    const handleModuleClick = (moduleName, modulePath) => {
        setLoadingModule(moduleName);
        router.push(modulePath);
        // No need to setLoadingModule(null) here as the page navigates away
    };

    if (userLoading || !user) { // Show loading spinner while user data loads or if no user yet
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" label="Loading Dashboard..." />
            </div>
        );
    }

    // --- RENDER LOGIC ---
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Institute Header */}
            <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 shadow-sm">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                        {/* Institute Info */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 lg:gap-4">
                            <Image
                                // Use placeholder or actual institute logo if available
                                src={user?.institute?.logoUrl || "/logoschool.jpeg"}
                                height={60} // Adjusted size
                                width={60}  // Adjusted size
                                alt="Institute Logo"
                                className="rounded-md shadow-sm hover:shadow-md transition-shadow object-cover"
                                priority // Prioritize logo loading
                            />
                            <div className="space-y-1 text-center sm:text-left">
                                <h1 className="text-base sm:text-lg font-semibold text-gray-800 leading-tight tracking-tight">
                                    {user?.role === "superadmin"
                                        ? user?.university || "University Admin"
                                        : user?.institute?.university || "University Name"}
                                    <span className="block text-primary font-bold text-lg sm:text-xl">
                                        {user?.role === "superadmin" ? user?.name : user?.institute?.name || "Institute Name"}
                                    </span>
                                </h1>
                                <p className="text-xs text-gray-500 tracking-wide hidden sm:block">
                                    {user?.role === "superadmin" ? user?.address : user?.institute?.address || "Institute Address"}
                                </p>
                            </div>
                        </div>
                        {/* User Info & Actions */}
                        <div className="text-center lg:text-right space-y-1.5">
                            <div className="flex items-center justify-center lg:justify-end gap-2 text-sm text-gray-700">
                                <UserCircle className="h-4 w-4 text-primary" />
                                <span>{user?.name || 'User Name'}</span>
                            </div>
                            {user?.department && (
                                <div className="flex items-center justify-center lg:justify-end gap-2 text-xs text-gray-600">
                                    <Building2 className="h-3 w-3 text-primary" />
                                    <span>Dept: {user.department}</span>
                                </div>
                            )}
                            {user?.email && (
                                <div className="flex items-center justify-center lg:justify-end gap-2 text-xs text-gray-600">
                                    <Mail className="h-3 w-3 text-primary" />
                                    <span>{user.email}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-center lg:justify-end gap-2 text-xs text-gray-600">
                                <GraduationCap className="h-3 w-3 text-primary" />
                                <span>Role: {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}</span>
                            </div>
                            <div className="flex justify-center lg:justify-end gap-3 pt-1">
                                <Button
                                    as={Link}
                                    href="/profile" // Your profile page route
                                    size="sm"
                                    variant="light"
                                    color="primary"
                                    startContent={<User2 className="h-4 w-4" />}
                                    className="text-xs"
                                >
                                    Profile
                                </Button>
                                <Button
                                    size="sm"
                                    variant="light"
                                    color="danger"
                                    startContent={<RxExit className="w-4 h-4" />}
                                    onPress={handleSignOut}
                                    className="text-xs"
                                >
                                    Sign Out
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content - Module Grid */}
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-700 mb-6">Select a Module</h2>
                {availableModules.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {availableModules.map((module) => (
                            <Card
                                key={module.name}
                                isPressable // Make card clickable
                                onPress={() => !loadingModule && handleModuleClick(module.name, module.path)} // Only allow click if not loading
                                className={`
                                    ${module.bgColor} border border-transparent shadow-md hover:shadow-lg
                                    transition-all duration-300 hover:-translate-y-1
                                    flex flex-col group ${loadingModule === module.name ? 'opacity-70 cursor-wait' : ''}
                                `}
                            >
                                <CardHeader className="flex flex-col items-center justify-center p-4 pb-2 h-40"> {/* Fixed height for illustration */}
                                    <div className="relative w-24 h-24 mb-2"> {/* Contained illustration */}
                                        <Image
                                            src={module.illustration}
                                            alt={`${module.name} Illustration`}
                                            fill // Use fill layout
                                            sizes="(max-width: 640px) 100vw, 200px" // Responsive sizes
                                            className="object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <h3 className={`text-base font-semibold ${module.textColor} text-center`}>
                                        {module.name}
                                    </h3>
                                </CardHeader>
                                <CardBody className="p-4 pt-0 flex flex-col justify-between flex-grow">
                                    <p className="text-xs text-gray-600 mb-3 text-center flex-grow">
                                        {module.description}
                                    </p>
                                    <Button
                                        fullWidth
                                        color="primary" // Use primary color for consistency
                                        variant="solid" // Solid button
                                        size="sm"
                                        className="mt-auto" // Push button to bottom
                                        onPress={() => handleModuleClick(module.name, module.path)}
                                        isDisabled={loadingModule === module.name}
                                        isLoading={loadingModule === module.name} // Show spinner on button
                                    >
                                        {loadingModule === module.name ? 'Loading...' : 'Open Module'}
                                    </Button>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 mt-10">No modules available for your role or subscription.</p>
                )}
            </main>
        </div>
    );
}