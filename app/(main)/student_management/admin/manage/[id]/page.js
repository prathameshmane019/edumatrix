
import StudentDetail from '@/app/components/studentDetails'

import React from 'react'

const page = ({params}) => { 
  return (
    <div className='mx-10'>
      <StudentDetail params={params}/>
    </div>
  )
}

export default page
