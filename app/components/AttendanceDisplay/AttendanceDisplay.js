'use client'

import React, { useState, useEffect } from 'react'
import { Spinner } from "@nextui-org/react"
import StudentAttendance from './StudentAttendance'
import FacultyAttendance from './FacultyAttendance'
import AdminAttendance from './AdminAttendance'
import { getCurrentAcademicYear } from '@/app/utils/acadmicYears'

export default function AttendanceDisplay() {
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [year,setYear]=useState(getCurrentAcademicYear())
  const [sem,setSem]=useState("sem1")
  const [institute,setInstitute]= useState(null)
  useEffect(() => {
    const storedProfile = sessionStorage.getItem("userProfile")
    if (storedProfile) {
      setUserProfile(JSON.parse(storedProfile))
    }
   
    setLoading(false)
  }, [])

  useEffect(()=>{
     
    if (userProfile?.currentYear) {
      setYear(userProfile?.currentYear);
      setSem(userProfile?.sem) // Set default year from profile
    }
    if(userProfile?.role) {
      console.log(userProfile);
      const instituteId =userProfile?.role==="superadmin"? userProfile?._id : userProfile?.institute
      setInstitute(instituteId)
      console.log(instituteId);
    }
      
  },[userProfile])
  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Spinner size="large" />
        <p>Loading, please wait...</p>
      </div>
    );
  }
  
  // if (!userProfile) {
  //   return <div>Please log in to view attendance.</div>
  // }

  switch (userProfile.role) {
    case 'student':
      return <StudentAttendance institute={institute} studentId={userProfile._id} sem={sem} year={year}  />
    case 'faculty':
      return <FacultyAttendance institute={institute} facultyId={userProfile._id} sem={sem} year={year} />
    case 'admin':
      return <AdminAttendance institute={institute} adminId={userProfile._id} year={year} sem={sem} department={userProfile.department} />
    case 'superadmin':
      return <AdminAttendance institute={institute} role={userProfile.role} year={year} sem={sem}/>
    default:
      return <div>Invalid user role</div>
  }
}