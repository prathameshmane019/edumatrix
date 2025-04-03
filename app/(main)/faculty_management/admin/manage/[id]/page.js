import FacultyDetailPage from '@/app/components/facultyDetails'

import React from 'react'

const page = ({params}) => { 
  return (
    <div className='mx-10'>
      <FacultyDetailPage params={params}/>
    </div>
  )
}

export default page
