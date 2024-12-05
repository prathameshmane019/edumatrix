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
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
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
    // Simulate loading delay
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const toggleSidebarCollapse = () => {
    setIsCollapsed((prevState) => !prevState);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    sessionStorage.clear();
    router.replace("/");
  };

  const sidebarItems = useMemo(() => {
    if (!userProfile?.role) return [];

    const { role } = userProfile;
    switch (role) {
      case "admin":
        return [
          { name: "Profile", href: "/admin", icon: MdPortrait },
          { name: "Manage Faculty", href: "/admin/faculty", icon: GiTeacher },
          { name: "Manage Students", href: "/admin/students", icon: PiStudentBold },
          { name: "Manage Class", href: "/admin/classes", icon: SiGoogleclassroom },
          { name: "Manage Subjects", href: "/admin/subject", icon: TbReportAnalytics },
          { name: "Manage Reports", href: "/admin/showattendance", icon: AiOutlineSchedule },
          { name: "Daily Absents", href: "/admin/absent-students", icon: AiOutlineSchedule },
        ];
      case "superadmin":
        return [
          { name: "Profile", href: "/admin", icon: MdPortrait },
          { name: "Manage Department", href: "/admin/department", icon: AiOutlineSchedule },
          { name: "Manage Faculty", href: "/admin/faculty", icon: GiTeacher },
          { name: "Manage Students", href: "/admin/students", icon: PiStudentBold },
          { name: "Manage Class", href: "/admin/classes", icon: SiGoogleclassroom },
          { name: "Manage Reports", href: "/admin/showattendance", icon: AiOutlineSchedule },
        ];
      case "faculty":
        return [
          { name: "Profile", href: "/faculty", icon: MdPortrait },
          { name: "Take Attendance", href: "/faculty/takeattendance", icon: RiCalendarScheduleLine },
          { name: "Update Attendance", href: "/faculty/attendance", icon: AiOutlineSchedule },
          { name: "Manage Reports", href: "/faculty/showattendance", icon: AiOutlineSchedule },
          { name: "Manage Teaching Plan", href: "/faculty/content", icon: AiOutlineSchedule },
        ];
      case "student":
        return [
          { name: "Profile", href: "/student", icon: MdPortrait },
          { name: "Check Attendance", href: "/student/showattendance", icon: AiOutlineSchedule },
        ];
      default:
        return [];
    }
  }, [userProfile]);

  return (
    <div className={`h-screen sidebar__wrapper ${isCollapsed ? 'collapsed' : ''}`}>
      <button className="btn shadow-xl absolute top-4 -right-3 z-50 bg-white rounded-full p-1" onClick={toggleSidebarCollapse}>
        {isCollapsed ? <MdKeyboardArrowRight className="text-2xl" /> : <MdKeyboardArrowLeft className="text-2xl" />}
      </button>
      <aside className={`sidebar rounded-r-lg shadow-2xl bg-primary-500 text-gray-100 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
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
              <p className="sidebar__logo-name text-center mt-2 font-semibold">ERP System</p>
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
            sidebarItems.map(({ name, href, icon: Icon }) => (
              <li className="sidebar__item" key={name}>
                <Link
                   className={`sidebar__link ${pathname === href ? "sidebar__link--active" : ""}`}
                   href={href}
                >
                  <Tooltip content={isCollapsed ? name : ""} placement="right">
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
          <Tooltip content="Log Out" placement="right">
            {isLoading ? (
              <Skeleton className="w-8 h-8 rounded-full mx-auto" />
            ) : (
              <button onClick={handleSignOut} className="w-full flex justify-center items-center p-2 hover:bg-primary-400 rounded">
                <RxExit className="text-2xl text-white" />
                {!isCollapsed && <span className="ml-3 text-white">Log Out</span>}
              </button>
            )}
          </Tooltip>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;

