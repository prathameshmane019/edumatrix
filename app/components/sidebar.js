// "use client";

// import Image from "next/image";
// import { RxExit } from "react-icons/rx";
// import { MdKeyboardArrowLeft, MdKeyboardArrowRight, MdPortrait } from "react-icons/md";
// import { TbReportAnalytics } from "react-icons/tb";
// import { AiOutlineSchedule } from "react-icons/ai";
// import { SiGoogleclassroom } from "react-icons/si";
// import { PiStudentBold } from "react-icons/pi";
// import { GiTeacher } from "react-icons/gi";
// import { RiCalendarScheduleLine } from "react-icons/ri";
// import Link from "next/link";
// import { useState, useEffect, useMemo } from "react";
// import { signOut } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { usePathname } from "next/navigation";
// import { Tooltip, Skeleton } from "@nextui-org/react";

// const Sidebar = () => {
//   const router = useRouter();
//   const pathname = usePathname();
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [userProfile, setUserProfile] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const storedProfile = sessionStorage.getItem('userProfile');
//     if (storedProfile) {
//       setUserProfile(JSON.parse(storedProfile));
//     }
//     // Simulate loading delay
//     setTimeout(() => setIsLoading(false), 1000);
//   }, []);

//   const toggleSidebarCollapse = () => {
//     setIsCollapsed((prevState) => !prevState);
//   };

//   const handleSignOut = async () => {
//     await signOut({ redirect: false });
//     sessionStorage.clear();
//     router.replace("/");
//   };

//   const sidebarItems = useMemo(() => {
//     if (!userProfile?.role) return [];

//     const { role } = userProfile;
//     switch (role) {
//       case "admin":
//         return [
//           { name: "Profile", href: "/admin", icon: MdPortrait },
//           { name: "Manage Faculty", href: "/admin/faculty", icon: GiTeacher },
//           { name: "Manage Students", href: "/admin/students", icon: PiStudentBold },
//           { name: "Manage Class", href: "/admin/classes", icon: SiGoogleclassroom },
//           { name: "Manage Subjects", href: "/admin/subject", icon: TbReportAnalytics },
//           { name: "Manage Reports", href: "/admin/showattendance", icon: AiOutlineSchedule },
//           { name: "Daily Absents", href: "/admin/absent-students", icon: AiOutlineSchedule },
//           { name: "Manage Questions", href: "/admin/questions", icon: AiOutlineSchedule },
//           { name: "Manage Feedback", href: "/admin/feedback", icon: AiOutlineSchedule },
//         ];
//       case "superadmin":
//         return [
//           { name: "Profile", href: "/admin", icon: MdPortrait },
//           { name: "Manage Department", href: "/admin/department", icon: AiOutlineSchedule },
//           { name: "Manage Faculty", href: "/admin/faculty", icon: GiTeacher },
//           { name: "Manage Students", href: "/admin/students", icon: PiStudentBold },
//           { name: "Manage Class", href: "/admin/classes", icon: SiGoogleclassroom },
//           { name: "Manage Reports", href: "/admin/showattendance", icon: AiOutlineSchedule },
//           { name: "Manage Feedback", href: "/admin/feedback", icon: AiOutlineSchedule },
          
//         ];
//       case "faculty":
//         return [
//           { name: "Profile", href: "/faculty", icon: MdPortrait },
//           { name: "Take Attendance", href: "/faculty/takeattendance", icon: RiCalendarScheduleLine },
//           { name: "Update Attendance", href: "/faculty/attendance", icon: AiOutlineSchedule },
//           { name: "Manage Reports", href: "/faculty/showattendance", icon: AiOutlineSchedule },
//           { name: "Manage Teaching Plan", href: "/faculty/content", icon: AiOutlineSchedule },
//         ];
//       case "student":
//         return [
//           { name: "Profile", href: "/student", icon: MdPortrait },
//           { name: "Check Attendance", href: "/student/showattendance", icon: AiOutlineSchedule },
//         ];
//       default:
//         return [];
//     }
//   }, [userProfile]);

//   return (
//     <div className={`h-screen sidebar__wrapper ${isCollapsed ? 'collapsed' : ''}`}>
//       <button className="btn shadow-xl absolute top-4 -right-3 z-50 bg-white rounded-full p-1" onClick={toggleSidebarCollapse}>
//         {isCollapsed ? <MdKeyboardArrowRight className="text-2xl" /> : <MdKeyboardArrowLeft className="text-2xl" />}
//       </button>
//       <aside className={`sidebar rounded-r-lg shadow-2xl bg-primary-500 text-gray-100 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`} data-collapse={isCollapsed}>
//         <div className="sidebar__top text-primary p-4">
//           {isLoading ? (
//             <Skeleton className="rounded-full w-16 h-16 mx-auto" />
//           ) : (
//             <Image
//               width={64}
//               height={64}
//               className="sidebar__logo rounded-full mx-auto"
//               src="/logoschool.jpeg"
//               alt="logo"
//             />
//           )}
//           {!isCollapsed && (
//             isLoading ? (
//               <Skeleton className="w-28 h-6 mt-2 mx-auto" />
//             ) : (
//               <p className="sidebar__logo-name text-center mt-2 font-semibold">ERP System</p>
//             )
//           )}
//         </div>
//         <ul className="sidebar__list text-slate-900 dark:text-slate-50 mt-8">
//           {isLoading ? (
//             Array(5).fill(0).map((_, index) => (
//               <li className="sidebar__item flex items-center px-4 py-2" key={index}>
//                 <Skeleton className="w-8 h-8 rounded-full" />
//                 {!isCollapsed && <Skeleton className="w-24 h-4 ml-3" />}
//               </li>
//             ))
//           ) : (
//             sidebarItems.map(({ name, href, icon: Icon }) => (
//               <li className="sidebar__item" key={name}>
//                 <Link
//                    className={`sidebar__link ${pathname === href ? "sidebar__link--active" : ""}`}
//                    href={href}
//                 >
//                   <Tooltip content={ name } placement="right">
//                     <span className="sidebar__icon">
//                       <Icon className="text-2xl" />
//                     </span>
//                   </Tooltip>
//                   {!isCollapsed && <span className="sidebar__name ml-3">{name}</span>}
//                 </Link>
//               </li>
//             ))
//           )}
//         </ul>
//         <div className="absolute bottom-4 left-0 right-0 px-4 flex">
//         <Tooltip content="Log Out">
//             <button onClick={handleSignOut} color="se" width="30">
//               <RxExit className="w-5 h-5 ml-3 my-2 text-violet-900" />
//             </button>
//           </Tooltip>
//           {!isCollapsed && <span className=" text-violet-900 ml-3 my-2">Log Out</span>}
//         </div>
//       </aside>
//     </div>
//   );
// };

// export default Sidebar;


"use client";

import Image from "next/image";
import { RxExit } from "react-icons/rx";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight, MdPortrait } from "react-icons/md";
import { TbReportAnalytics } from "react-icons/tb";
import { AiOutlineSchedule } from "react-icons/ai";
import { SiGoogleclassroom } from "react-icons/si";
import { PiStudentBold } from "react-icons/pi";
import { GiTeacher } from "react-icons/gi";
import { RiCalendarScheduleLine } from "react-icons/ri";
import { FaChalkboardTeacher } from "react-icons/fa";
import { MdFeedback } from "react-icons/md";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Tooltip, Skeleton } from "@nextui-org/react";

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedProfile = sessionStorage.getItem('userProfile');
    if (storedProfile) {
      setUserProfile(JSON.parse(storedProfile));
    }
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  // // Common management options that appear in all modules
  // const commonManagementOptions = {
  //   admin: [
  //     { name: "Manage Students", href: "/admin/students", icon: PiStudentBold },
  //     { name: "Manage Class", href: "/admin/classes", icon: SiGoogleclassroom },
  //     { name: "Manage Subjects", href: "/admin/subject", icon: TbReportAnalytics },
  //     { name: "Manage Faculty", href: "/admin/faculty", icon: GiTeacher },
  //   ]
  // };

  // Module-specific options
  const moduleOptions = {
    feedback: {
      options: {
        admin: [
          { name: "Profile", href: "/feedback/admin", icon: MdPortrait },
          { name: "Feedback Evaluation", href: "/feedback/admin/evaluate", icon: TbReportAnalytics },
          { name: "Manage Feedback", href: "/feedback/admin/feedback", icon: MdFeedback },
          { name: "Manage Department", href: "/attendance/admin/department", icon: FaChalkboardTeacher },
          { name: "Manage Students", href: "/attendance/admin/students", icon: PiStudentBold },
          { name: "Manage Class", href: "/attendance/admin/classes", icon: SiGoogleclassroom },
          { name: "Manage Subjects", href: "/feedback/admin/subjects", icon: SiGoogleclassroom },
          { name: "Manage Faculty", href: "/attendance/admin/faculty", icon: GiTeacher },
        ],
        superadmin: [
          { name: "Profile", href: "/feedback/admin", icon: MdPortrait },
          { name: "Feedback Evaluation", href: "/feedback/admin/evaluation", icon: TbReportAnalytics },
          { name: "Manage Questions", href: "/feedback/admin/questions", icon: GiTeacher },
          { name: "Manage Feedback", href: "/feedback/admin/feedback", icon: MdFeedback },
          { name: "Manage Department", href: "/feedback/admin/department", icon: FaChalkboardTeacher },
          { name: "Manage Students", href: "/feedback/admin/students", icon: PiStudentBold },
          { name: "Manage Class", href: "/feedback/admin/classes", icon: SiGoogleclassroom },
          { name: "Manage Faculty", href: "/feedback/admin/faculty", icon: GiTeacher },
        ],
        faculty: [
          { name: "Profile", href: "/feedback/faculty", icon: MdPortrait },
          { name: "View Feedback", href: "/feedback/faculty/view", icon: MdFeedback },
          { name: "Feedback History", href: "/feedback/faculty/history", icon: TbReportAnalytics }
        ],
        student: [
          { name: "Profile", href: "/feedback/student", icon: MdPortrait },
          { name: "Give Feedback", href: "/feedback/student/new", icon: MdFeedback },
          { name: "View History", href: "/feedback/student/history", icon: TbReportAnalytics }
        ]
      }
    },
    attendance: {
      options: {
        admin: [
          { name: "Profile", href: "/attendance/admin", icon: MdPortrait },
          { name: "View Reports", href: "/attendance/admin/reports", icon: AiOutlineSchedule },
          { name: "Daily Absents", href: "/attendance/admin/absent-students", icon: RiCalendarScheduleLine },
          // { name: "Manage Department", href: "/attendance/admin/department", icon: FaChalkboardTeacher },
          { name: "Manage Students", href: "/attendance/admin/students", icon: PiStudentBold },
          { name: "Manage Class", href: "/attendance/admin/classes", icon: SiGoogleclassroom },
          { name: "Manage Subjects", href: "/attendance/admin/subjects", icon: SiGoogleclassroom },
          { name: "Manage Faculty", href: "/attendance/admin/faculty", icon: GiTeacher },
        ],
        superadmin: [
          { name: "Profile", href: "/attendance/admin", icon: MdPortrait },
          { name: "View Reports", href: "/attendance/admin/reports", icon: AiOutlineSchedule },
          { name: "Manage Department", href: "/attendance/admin/department", icon: FaChalkboardTeacher },
          { name: "Manage Students", href: "/attendance/admin/students", icon: PiStudentBold },
          { name: "Manage Class", href: "/attendance/admin/classes", icon: SiGoogleclassroom },
          { name: "Manage Faculty", href: "/attendance/admin/faculty", icon: GiTeacher },
        ],
        faculty: [
          { name: "Profile", href: "/attendance/faculty/", icon: MdPortrait },
          { name: "Take Attendance", href: "/attendance/faculty/take", icon: RiCalendarScheduleLine },
          { name: "Update Attendance", href: "/attendance/faculty/update", icon: AiOutlineSchedule },
          { name: "View Reports", href: "/attendance/faculty/reports", icon: TbReportAnalytics }
        ],
        student: [
          { name: "Profile", href: "/attendance/student/", icon: MdPortrait },
          { name: "View Attendance", href: "/attendance/student/view", icon: AiOutlineSchedule }
        ]
      }
    },
    teaching: {
      options: {
        admin: [
          { name: "Profile", href: "/teaching/admin/", icon: MdPortrait },
          { name: "View Plans", href: "/teaching/admin/plans", icon: FaChalkboardTeacher },
          { name: "Manage Content", href: "/teaching/admin/content", icon: TbReportAnalytics }
        ],
        superadmin: [
          { name: "Profile", href: "/teaching/admin/", icon: MdPortrait },
          { name: "View Reports", href: "/teaching/admin/reports", icon: AiOutlineSchedule },
          { name: "Manage Department", href: "/teaching/admin/department", icon: FaChalkboardTeacher },
          { name: "Manage Content", href: "/teaching/admin/content", icon: TbReportAnalytics },
          { name: "Manage Faculty", href: "/teaching/admin/faculty", icon: GiTeacher },
        ],
        faculty: [
          { name: "Profile", href: "/teaching/faculty/", icon: MdPortrait },
          { name: "Teaching Plan", href: "/teaching/faculty/plan", icon: FaChalkboardTeacher },
          { name: "Course Material", href: "/teaching/faculty/material", icon: TbReportAnalytics }
        ],
        student: [
          { name: "Profile", href: "/teaching/student/", icon: MdPortrait },
          { name: "View Materials", href: "/teaching/student/materials", icon: TbReportAnalytics },
          { name: "Course Content", href: "/teaching/student/content", icon: FaChalkboardTeacher }
        ]
      }
    }
  };

  // Function to determine current module from pathname
  const getCurrentModule = (path) => {
    if (path.includes('feedback')) return 'feedback';
    if (path.includes('attendance')) return 'attendance';
    if (path.includes('teaching')) return 'teaching';
    return null;
  };

  // Get navigation items based on current path and role
  const getNavigationItems = useMemo(() => {
    if (!userProfile?.role) return [];

    const { role } = userProfile;
    const currentModule = getCurrentModule(pathname);
    let items = [];

    // Add module-specific options if we're in a module
    if (currentModule && moduleOptions[currentModule]?.options[role]) {
      items = [...moduleOptions[currentModule].options[role]];
    }


    return items;
  }, [userProfile, pathname]);

  const toggleSidebarCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    sessionStorage.clear();
    router.replace("/");
  };

  return (
    <div className={`h-screen sidebar__wrapper ${isCollapsed ? 'collapsed' : ''}`}>
      <button
        className="btn shadow-xl absolute top-4 -right-3 z-50 bg-white rounded-full p-1"
        onClick={toggleSidebarCollapse}
      >
        {isCollapsed ?
          <MdKeyboardArrowRight className="text-2xl" /> :
          <MdKeyboardArrowLeft className="text-2xl" />
        }
      </button>
      <aside
        className={`sidebar rounded-r-lg shadow-2xl bg-primary-500 text-gray-100 
          transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}
        data-collapse={isCollapsed}
      >
        <div className="sidebar__top text-primary p-4">
          {isLoading ? (
            <Skeleton className="rounded-full w-16 h-16 mx-auto" />
          ) : (
            <Image
              width={64}
              height={64}
              className="sidebar__logo rounded-full mx-auto"
              src="/logoschool.jpeg"
              alt="logo"
            />
          )}
          {!isCollapsed && (
            isLoading ? (
              <Skeleton className="w-28 h-6 mt-2 mx-auto" />
            ) : (
              <p className="sidebar__logo-name text-center mt-2 font-semibold">
                ERP System
              </p>
            )
          )}
        </div>

        <ul className="sidebar__list text-slate-900 dark:text-slate-50 mt-8">
          {isLoading ? (
            Array(5).fill(0).map((_, index) => (
              <li className="sidebar__item flex items-center px-4 py-2" key={index}>
                <Skeleton className="w-8 h-8 rounded-full" />
                {!isCollapsed && <Skeleton className="w-24 h-4 ml-3" />}
              </li>
            ))
          ) : (
            getNavigationItems.map(({ name, href, icon: Icon }) => (
              <li className="sidebar__item" key={name}>
                <Link
                  className={`sidebar__link ${pathname === href ? "sidebar__link--active" : ""}`}
                  href={href}
                >
                  <Tooltip content={name} placement="right">
                    <span className="sidebar__icon">
                      <Icon className="text-2xl" />
                    </span>
                  </Tooltip>
                  {!isCollapsed && <span className="sidebar__name ml-3">{name}</span>}
                </Link>
              </li>
            ))
          )}
        </ul>

        <div className="absolute bottom-4 left-0 right-0 px-4 flex">
          <Tooltip content="Log Out">
            <button onClick={handleSignOut} color="se" width="30">
              <RxExit className="w-5 h-5 ml-3 my-2 text-violet-900" />
            </button>
          </Tooltip>
          {!isCollapsed && <span className="text-violet-900 ml-3 my-2">Log Out</span>}
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;