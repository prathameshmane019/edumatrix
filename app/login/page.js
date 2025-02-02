import React, { Suspense } from 'react'
import LoginComponent from '../components/login'
import Loader from '../components/loader'

const page = () => {
  return (
    <div className=''>
      <Suspense fallback={<div className="w-full lg:w-1/2 p-12 flex items-center justify-center"><Loader /></div>}>
        <LoginComponent />
      </Suspense>
    </div>
  )
}

export default page
