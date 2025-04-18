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
import { User2 } from "lucide-react";

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // const {user}=useUser();
  useEffect(() => {
    const storedProfile = sessionStorage.getItem('userProfile');
    if (storedProfile) {
      setUserProfile(JSON.parse(storedProfile));
    }
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const moduleOptions = {
    student_management: {
      options: {
        admin: [
          { name: "Dashboard", href: "/student_management/admin", icon: MdPortrait },
          { name: "Student Management", href: "/student_management/admin/manage", icon: MdPortrait },
        ],
        superadmin: [
          { name: "Dashboard", href: "/student_management/admin", icon: MdPortrait },

          { name: "Student Management", href: "/student_management/admin/manage", icon: MdPortrait },
        ],

      }
    },
    faculty_management: {
      options: {
        admin: [
          { name: "Dashboard", href: "/faculty_management/admin", icon: MdPortrait },
          { name: "Faculty Management", href: "/faculty_management/admin/manage", icon: MdPortrait },
        ],
        superadmin: [
          { name: "Dashboard", href: "/faculty_management/admin", icon: MdPortrait },

          { name: "Faculty Management", href: "/faculty_management/admin/manage", icon: MdPortrait },
        ],

      }
    },
    obe_management: {
      options: {
        admin: [
          { name: "Dashboard", href: "/faculty_management/admin", icon: MdPortrait },
          { name: "Faculty Management", href: "/faculty_management/admin/manage", icon: MdPortrait },
        ],
        faculty: [ 
          { name: "Course Outcomes", href: "/obe_management/faculty", icon: MdPortrait },
          { name: "Marks Entry", href: "/obe_management/faculty/marks-entry", icon: MdPortrait },
          { name: "Attainment", href: "/obe_management/faculty/attainment", icon: MdPortrait },
        ],

      }
    },
    department_management: {
      options: {
        superadmin: [
          { name: "Department Manage", href: "/department_management/admin", icon: MdPortrait },
        ],

      }
    },
    course_management: {
      options: {
        admin: [
          { name: "Dashboard", href: "/course_management/admin", icon: MdPortrait },
          { name: "Manage Classes", href: "/course_management/admin/class", icon: MdPortrait },
          { name: "Manage Subject", href: "/course_management/admin/subject", icon: MdPortrait },
        ],
        superadmin: [
          { name: "Dashboard", href: "/course_management/admin", icon: MdPortrait },
          { name: "Manage Classes", href: "/course_management/admin/class", icon: MdPortrait },

        ],
        faculty: [
         
          { name: "Manage Content", href: "/course_management/faculty", icon: FaChalkboardTeacher }
        ],
      }
    },
    feedback: {
      options: {
        admin: [
          { name: "Dashboard", href: "/feedback/admin", icon: MdPortrait },
          { name: "Feedback Evaluation", href: "/feedback/admin/evaluation", icon: TbReportAnalytics },
          { name: "Manage Feedback", href: "/feedback/admin/feedback", icon: MdFeedback },
        ],
        superadmin: [
          { name: "Dashboard", href: "/feedback/admin", icon: MdPortrait },
          { name: "Feedback Evaluation", href: "/feedback/admin/evaluation", icon: TbReportAnalytics },
          { name: "Manage Questions", href: "/feedback/admin/questions", icon: GiTeacher },
          { name: "Manage Feedback", href: "/feedback/admin/feedback", icon: MdFeedback },
          { name: "Give Feedback", href: "/feedback/admin/response", icon: FaChalkboardTeacher },

        ],
        faculty: [
          { name: "Dashboard", href: "/feedback/faculty", icon: MdPortrait },
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
        ],
        superadmin: [
          { name: "Profile", href: "/attendance/admin", icon: MdPortrait }, 
          { name: "View Reports", href: "/attendance/admin/reports", icon: AiOutlineSchedule },
        ],
        faculty: [
          { name: "Profile", href: "/attendance/faculty", icon: MdPortrait },
          { name: "Take Attendance", href: "/attendance/faculty/take", icon: RiCalendarScheduleLine },
          { name: "Update Attendance", href: "/attendance/faculty/update", icon: AiOutlineSchedule },
          { name: "View Reports", href: "/attendance/faculty/reports", icon: TbReportAnalytics }, 
        ],
        student: [
          { name: "Profile", href: "/attendance/student", icon: MdPortrait },
          { name: "View Attendance", href: "/attendance/student/view", icon: AiOutlineSchedule }
        ]
      }
    }
  };

  // Function to determine current module from pathname
  const getCurrentModule = (path) => {
    if (path.includes('feedback')) return 'feedback';
    if (path.includes('student_management')) return 'student_management';
    if (path.includes('course_management')) return 'course_management';
    if (path.includes('faculty_management')) return 'faculty_management';
    if (path.includes('department_management')) return 'department_management';
    if (path.includes('obe_management')) return 'obe_management';
    if (path.includes('attendance')) return 'attendance';
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

  const bestMatch = useMemo(() => {
    let best = null;
    let maxLength = 0;
  
    getNavigationItems.forEach((item) => {
      if (pathname.startsWith(item.href) && item.href.length > maxLength) {
        best = item.href;
        maxLength = item.href.length;
      }
    });
  
    return best;
  }, [pathname, getNavigationItems]);

  
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
  className={`sidebar__link ${href === bestMatch ? "sidebar__link--active" : ""}`}
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

        <div className="absolute bottom-4 left-0 right-0 px-4">
          <div className="flex items-center mb-3">
            <Tooltip content="Profile" placement="right">
              <Link href={"/profile"} className="text-violet-900   items-center">
                <User2 className="sidebar__icon" />
                {!isCollapsed && <span className="ml-3">Profile</span>}
              </Link>
            </Tooltip>
          </div>
          <div className="flex items-center">
            <Tooltip content="Log Out" placement="right">
              <button
                className="text-violet-900 text-sm flex items-center"
                onClick={handleSignOut}
              >
                <RxExit className="sidebar__icon  " />
                {!isCollapsed && <span className="ml-3">Log Out</span>}
              </button>
            </Tooltip>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;