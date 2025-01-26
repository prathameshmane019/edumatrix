// "use client";

// import React from 'react';
// import { Button } from '@nextui-org/react';
// import { CardBody, Card, CardHeader } from '@nextui-org/react';
// import { useRouter } from 'next/navigation';
// import Image from 'next/image';
// import { useSession } from 'next-auth/react';

// // Import SVG illustrations
// import AttendanceIllustration from '@/public/illustrations/attendance.svg';
// import FeedbackIllustration from '@/public/illustrations/feedback.svg';

// export default function ModuleSelectionPage() {
//   const { data: session, status } = useSession();
//   const router = useRouter();

//   React.useEffect(() => {
//     if (status === 'unauthenticated') {
//       router.replace('/login');
//     }
//   }, [status, router]);

//   if (status === 'loading') {
//     return <div>Loading...</div>;
//   }

//   const role = session?.user?.role;
//   const basePath = role === 'superadmin' || role === 'admin' ? '/admin' : `/${role}`;

//   const modules = {
//     admin: [
//       {
//         name: 'Attendance Management',
//         path: `attendance${basePath}`,
//         description: 'View and manage attendance records',
//         illustration: AttendanceIllustration,
//         bgColor: 'bg-blue-50',
//         textColor: 'text-blue-600'
//       },
//       {
//         name: 'Feedback Management',
//         path: `feedback${basePath}`,
//         description: 'Manage and review feedback',
//         illustration: FeedbackIllustration,
//         bgColor: 'bg-green-50',
//         textColor: 'text-green-600'
//       }
//     ],
//     superadmin: [
//       {
//         name: 'Attendance Management',
//         path: `attendance/${basePath}`,
//         description: 'View and manage attendance records',
//         illustration: AttendanceIllustration,
//         bgColor: 'bg-blue-50',
//         textColor: 'text-blue-600'
//       },
//       {
//         name: 'Feedback Management',
//         path: `feedback${basePath}`,
//         description: 'Manage and review feedback',
//         illustration: FeedbackIllustration,
//         bgColor: 'bg-green-50',
//         textColor: 'text-green-600'
//       }
//     ],
//     faculty: [
//       {
//         name: 'Attendance',
//         path: `${basePath}/takeattendance`,
//         description: 'Take and manage daily attendance',
//         illustration: AttendanceIllustration,
//         bgColor: 'bg-blue-50',
//         textColor: 'text-blue-600'
//       },
//       // {
//       //   name: 'Feedback',
//       //   path: `${basePath}/feedback`,
//       //   description: 'View student feedback',
//       //   illustration: FeedbackIllustration,
//       //   bgColor: 'bg-green-50',
//       //   textColor: 'text-green-600'
//       // }
//     ],
//     student: [
//       {
//         name: 'Attendance',
//         path: `${basePath}`,
//         description: 'View your attendance records',
//         illustration: AttendanceIllustration,
//         bgColor: 'bg-blue-50',
//         textColor: 'text-blue-600'
//       }
//     ]
//   };

//   const userModules = modules[role] || [];

//   return (
//     <div className="container mx-auto p-4 max-w-4xl">
//       <h1 className="text-3xl font-bold mb-8 text-center">
//         Welcome, {session?.user?.name}
//       </h1>
//       <div className="grid md:grid-cols-3 gap-6">
//         {userModules.map((module) => (
//           <Card
//             key={module.name}
//             className={`
//               ${module.bgColor}
//               border-2 border-transparent
//               hover:border-primary
//               transition-all
//               duration-300
//               hover:shadow-xl
//               transform
//               hover:-translate-y-2
//               flex flex-col
//             `}
//           >
//             <CardHeader className="pb-2 flex-grow-0">
//               <div className="flex justify-center mb-4 h-48">
//                 <Image
//                   src={module.illustration}
//                   alt={module.name}
//                   className="max-h-full max-w-full object-contain"
//                 />
//               </div>
//               <h1 className={`text-xl text-center ${module.textColor}`}>
//                 {module.name}
//               </h1>
//             </CardHeader>
//             <CardBody className="flex flex-col flex-grow justify-end">
//               <p className="text-muted-foreground mb-4 text-center">
//                 {module.description}
//               </p>
//               <Button
//                 variant="outline"
//                 className={`
//                   w-full
//                   ${module.textColor}
//                   hover:bg-primary
//                   hover:text-primary-foreground
//                 `}
//                 onClick={() => router.push(module.path)}
//               >
//                 Open Module
//               </Button>
//             </CardBody>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// }

"use client";

import React from 'react';
import { Button } from '@nextui-org/react';
import { CardBody, Card, CardHeader } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { signOut, useSession } from 'next-auth/react';
import { UserCircle, BookOpen, Calendar, Building2, Mail, Clock, GraduationCap } from 'lucide-react';

// Import SVG illustrations
import AttendanceIllustration from '@/public/illustrations/attendance.svg';
import FeedbackIllustration from '@/public/illustrations/feedback.svg';
import { RxExit } from 'react-icons/rx';

export default function ModuleSelectionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false ,callbackUrl:'/'});
    sessionStorage.clear(); 
  };

  const role = session?.user?.role;
  const basePath = role === 'superadmin' || role === 'admin' ? '/admin' : `/${role}`;

  const modules = {
    admin: [
      {
        name: 'Attendance Management',
        path: `attendance${basePath}`,
        description: 'View and manage attendance records. Track student attendance patterns and generate detailed reports.',
        illustration: AttendanceIllustration,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600'
      },
      {
        name: 'Feedback Management',
        path: `feedback${basePath}`,
        description: 'Manage and review feedback. Analyze student responses and generate insights for improvement.',
        illustration: FeedbackIllustration,
        bgColor: 'bg-green-50',
        textColor: 'text-green-600'
      }
    ],
    superadmin: [
      {
        name: 'Attendance Management',
        path: `attendance/${basePath}`,
        description: 'View and manage attendance records. Track student attendance patterns and generate detailed reports.',
        illustration: AttendanceIllustration,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600'
      },
      {
        name: 'Feedback Management',
        path: `feedback${basePath}`,
        description: 'Manage and review feedback. Analyze student responses and generate insights for improvement.',
        illustration: FeedbackIllustration,
        bgColor: 'bg-green-50',
        textColor: 'text-green-600'
      }
    ],
    faculty: [
      {
        name: 'Attendance Management',
        path: `attendance/${basePath}`,
        description: 'Take and manage daily attendance. View attendance statistics and generate reports for your classes.',
        illustration: AttendanceIllustration,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600'
      }
    ],
    student: [
      {
        name: 'Attendance Records',
        path: `${basePath}`,
        description: 'View your attendance records, track your attendance percentage, and check subject-wise attendance details.',
        illustration: AttendanceIllustration,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600'
      }
    ]
  };

  const userModules = modules[role] || [];

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
                  Savitribai Phule Shikshan Prasarak Mandal&apos;s
                  <span className="block text-primary font-semibold">SKN Sinhgad College of Engineering</span>
                </h1>
                <p className="text-sm text-gray-500 tracking-wide">At Post: Korti, Tal: Pandharpur, Dist: Solapur, Maharashtra 413304</p>
              </div>
            </div>

            <div className="text-center lg:text-right space-y-1">
              {/* <div className="flex items-center gap-2 justify-center lg:justify-end">
                <Calendar className="h-4 w-4 text-primary" />
                <p className="text-sm text-gray-600">AY: {session?.user?.currentYear}</p>
              </div> */}
              <div className="flex items-center gap-2 justify-center lg:justify-end">
                <Building2 className="h-4 w-4 text-primary" />
                <p className="text-sm text-gray-600">Dept: {session?.user?.department || session?.user?.name}</p>
              </div>
              {role === 'faculty' && (
                <div className="flex items-center gap-2 justify-center lg:justify-end">
                  <UserCircle className="h-4 w-4 text-primary" />
                  <p className="text-sm text-gray-600">ID: {session?.user?.id}</p>
                </div>
              )}
              {session?.user?.email && (

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <p className="text-sm text-gray-600">{session?.user?.email}</p>
                  </div>
                </div>)
              }
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <p className="text-sm text-gray-600">Role: {role?.charAt(0).toUpperCase() + role?.slice(1)}</p>
                </div>
                {role === 'faculty' && (
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <p className="text-sm text-gray-600">Semester: {session?.user?.sem}</p>
                  </div>
                )}
              </div>
              <div className=" ">
                <button className='flex items-center gap-2' onClick={handleSignOut} color="se" width="30">
                  <RxExit className="w-5 h-5  text-violet-900" /> <span>SignOut</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-4">
        {/* User Info Card */}

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userModules.map((module) => (
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
                  variant="solid"
                  className={`
                    w-full
                    bg-primary
                    text-white
                    hover:bg-primary/90
                    transition-colors
                  `}
                  onClick={() => router.push(module.path)}
                >
                  Open Module
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}