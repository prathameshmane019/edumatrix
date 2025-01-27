// "use client";
// import React, { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { Input, Button } from '@nextui-org/react';
// import { signIn, useSession } from 'next-auth/react';
// import { useRouter } from 'next/navigation';
// import { IoIosEye, IoIosEyeOff } from "react-icons/io";
// import { RiShieldUserFill } from "react-icons/ri";
// import { toast } from 'sonner';
// import axios from 'axios';
// import Image from 'next/image';
// import Loader from './loader';
// import { Elsie } from 'next/font/google';

// export default function LoginComponent() {
//   const [isVisible, setIsVisible] = useState(false);
//   const [userId, setUserId] = useState('');
//   const [password, setPassword] = useState('');
//   const [userIdError, setUserIdError] = useState('');
//   const [passwordError, setPasswordError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const toggleVisibility = () => setIsVisible(!isVisible);
//   const router = useRouter();
//   const { data: session, status } = useSession();
//   const [userProfile, setUserProfile] = useState(null); 

//   useEffect(() => {
//     if (userProfile?.role) {
//       const role = userProfile.role;
//       // const redirectPath = role === 'superadmin' || role === 'admin' ? `/admin` : `/${role}`;
//       const redirectPath = `/modules`;
//       router.replace(redirectPath);
//     }
//   }, [userProfile]);

//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       if (status === 'authenticated' && session?.user?.role) {
//         let role ;
//          if (session?.user?.role === "admin") role="department"
//          else if(session.user.role=== "superadmin") role ="institute" 
//          else role = session.user.role;
//         //  console.log(session?.user?.role);

//         const { _id } = session.user;
//         const storedProfile = sessionStorage.getItem('userProfile');

//         if (storedProfile) {
//           setUserProfile(JSON.parse(storedProfile));
//         } else {
//           try {
//             console.log(_id);

//             const res = await axios.get(`/api/v2/${role}?_id=${_id}`);
//             console.log(res.data);

//             const profileData = Array.isArray(res.data) ? res.data[0] : res.data; // Ensure userProfile is an object
//             profileData.role = session?.user?.role; // Add role to profile data
//             sessionStorage.setItem('userProfile', JSON.stringify(profileData));
//             setUserProfile(profileData);
//             console.log(profileData);

//           } catch (error) {
//             console.error("Error fetching user profile:", error);
//           }
//         }
//       }
//     };

//     if (status === 'authenticated') {
//       fetchUserProfile();
//     }
//   }, [session, status]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setUserIdError('');
//     setPasswordError('');
//     setIsLoading(true);

//     try {
//       const result = await signIn('credentials', {
//         userId,
//         password,
//         redirect: false,
//       });

//       setIsLoading(false);

//       if (result.ok) {
//         toast.success('Login Successful !');
//       } else {
//         if (result.error === 'Invalid username') {
//           setUserIdError('Invalid username');
//         } else if (result.error === 'Invalid password') {
//           setPasswordError('Invalid password');
//         } else {
//           toast.error('Failed to login');
//         }
//       }
//     } catch (error) {
//       console.error('Failed to login', error);
//       toast.error('Failed to login');
//       setIsLoading(false);
//     }
//   };

//   const handleCancel = () => {
//     setUserId('');
//     setPassword('');
//     setUserIdError('');
//     setPasswordError('');
//   };
//   if (status === 'loading') {
//     return (
//       <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75">
//         <Loader size="large" color="primary" />
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen">
//       <div className="flex flex-col w-2/3 justify-center items-center bg-violet-500 rounded-r-[20%]">
//         <h3 className='text-4xl  text-white'>Hey,Let&#39;s Begin </h3>
//         <Image src={"/login.png"} width={600} height={600} ></Image>
//          </div>
//       <div className="flex w-1/2 justify-center items-center">
//         <form onSubmit={handleSubmit} className="w-full max-w-md">
//           <div className="w-full p-9 bg-white rounded-lg shadow-lg text-center">
//             <h2 className="text-2xl font-bold mb-4">Login</h2>
//             <div className="mb-4 text-left">
//               <Input
//                 type="text"
//                 variant="bordered"
//                 label="User Id"
//                 value={userId}
//                 onChange={(e) => setUserId(e.target.value)}
//                 isInvalid={!!userIdError}
//                 endContent={
//                   <RiShieldUserFill className="text-2xl text-default-400 pointer-events-none"/>
//                 }
//                 className="mb-2"
//               />
//               {userIdError && <p className="text-red-500 text-sm">{userIdError}</p>}
//             </div>
//             <div className="mb-4 text-left">
//               <Input
//                 label="Password"
//                 variant="bordered"
//                 endContent={
//                   <button
//                     className="focus:outline-none"
//                     type="button"
//                     onClick={toggleVisibility}
//                   >
//                     {isVisible ? (
//                       <IoIosEyeOff className="text-2xl text-default-400 pointer-events-none"/>
//                     ) : (
//                       <IoIosEye className="text-2xl text-default-400 pointer-events-none"/>
//                     )}
//                   </button>
//                 }
//                 type={isVisible ? 'text' : 'password'}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 isInvalid={!!passwordError}
//                 className="mb-2"
//               />
//               {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
//             </div>
//             <div className="flex justify-center space-x-4">
//               <Button color="default" onClick={handleCancel} className="w-36">
//                 Cancel
//               </Button>
//               <Button 
//                 color="primary" 
//                 type="submit" 
//                 className="w-36" 
//                 disabled={isLoading}
//               >
//                 {isLoading ? (
//                   <div className="flex items-center justify-center">
//                     <Loader size="small" color="white" />
//                   </div>
//                 ) : (
//                   'Login'
//                 )}
//               </Button>
//             </div>
//             <div className="mt-2">
//               <p className="text-sm">
//                 <Link href="/reset_password" className="content-start text-blue-500">
//                   Reset password
//                 </Link>
//               </p>
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Input, Button } from '@nextui-org/react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { IoIosEye, IoIosEyeOff } from "react-icons/io";
import { RiShieldUserFill } from "react-icons/ri";
import { toast } from 'sonner';
import axios from 'axios';
import Loader from './loader';

export default function LoginComponent() {
  const [isVisible, setIsVisible] = useState(false);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [userIdError, setUserIdError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [userProfile, setUserProfile] = useState(null);
  useEffect(() => {
    if (userProfile?.role) {
      const role = userProfile.role;
      // const redirectPath = role === 'superadmin' || role === 'admin' ? `/admin` : `/${role}`;
      const redirectPath = `/modules`;
      router.replace(redirectPath);
    }
  }, [userProfile]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (status === 'authenticated' && session?.user?.role) {
        let role ;
         if (session?.user?.role === "admin") role="department"
         else if(session.user.role=== "superadmin") role ="institute" 
         else role = session.user.role;
        //  console.log(session?.user?.role);

        const { _id } = session.user;
        const storedProfile = sessionStorage.getItem('userProfile');

        if (storedProfile) {
          setUserProfile(JSON.parse(storedProfile));
        } else {
          try {
            console.log(_id);

            const res = await axios.get(`/api/v2/${role}?_id=${_id}`);
            console.log(res.data);

            const profileData = Array.isArray(res.data) ? res.data[0] : res.data; // Ensure userProfile is an object
            profileData.role = session?.user?.role; // Add role to profile data
            sessionStorage.setItem('userProfile', JSON.stringify(profileData));
            setUserProfile(profileData);
            console.log(profileData);

          } catch (error) {
            console.error("Error fetching user profile:", error);
          }
        }
      }
    };

    if (status === 'authenticated') {
      fetchUserProfile();
    }
  }, [session, status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUserIdError('');
    setPasswordError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        userId,
        password,
        redirect: false,
      });

      setIsLoading(false);

      if (result.ok) {
        toast.success('Login Successful !');
      } else {
        if (result.error === 'Invalid username') {
          setUserIdError('Invalid username');
          toast.error('Invalid username');
        } else if (result.error === 'Invalid password') {
          setPasswordError('Invalid password');
          toast.error('Invalid Password');
        } else {
          toast.error('Failed to login');
        }
      }
    } catch (error) {
      console.error('Failed to login', error);
      toast.error('Failed to login');
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setUserId('');
    setPassword('');
    setUserIdError('');
    setPasswordError('');
  };
  if (status === 'loading') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75">
        <Loader size="large" color="primary" />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-violet-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl flex overflow-hidden">
 
        <div className="hidden lg:flex w-1/2 bg-violet-500 p-12 flex-col justify-between relative">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold text-white mb-6">Welcome Back!</h1>
            <p className="text-violet-100 text-lg">Sign in to continue your journey with us.</p>
          </div>
          <svg viewBox="0 0 800 600" className="absolute inset-0 w-full h-full opacity-20">
            <path d="M0 0 L800 0 L800 600 L0 600 Z" fill="#f3f4f6" />
            <circle cx="700" cy="100" r="200" fill="#8b5cf6" opacity="0.1" />
            <circle cx="100" cy="500" r="150" fill="#8b5cf6" opacity="0.1" />
            <path d="M400 150 Q600 50 700 200 T800 400" stroke="#8b5cf6" fill="none" strokeWidth="2" />
            <path d="M300 450 Q100 350 200 500 T400 600" stroke="#8b5cf6" fill="none" strokeWidth="2" />
            <circle cx="500" cy="300" r="8" fill="#8b5cf6" />
            <circle cx="520" cy="320" r="4" fill="#8b5cf6" />
            <circle cx="480" cy="280" r="6" fill="#8b5cf6" />
            <rect x="300" y="200" width="200" height="150" rx="10" fill="#8b5cf6" />
            <rect x="320" y="220" width="160" height="90" rx="5" fill="white" />
            <circle cx="400" cy="330" r="10" fill="white" />
          </svg>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full lg:w-1/2 p-12">
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Login</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User Id Field */}
              <div>
                <Input
                  type="text"
                  variant="bordered"
                  label="User Id"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  isInvalid={!!userIdError}
                  endContent={<RiShieldUserFill className="text-2xl text-default-400 pointer-events-none" />}
                  classNames={{
                    input: 'bg-transparent',
                    inputWrapper: 'bg-default-100/50 hover:bg-default-200/70 transition-colors',
                  }}
                />
                {userIdError && <p className="text-red-500 text-sm mt-1">{userIdError}</p>}
              </div>

              {/* Password Field */}
              <div>
                <Input
                  label="Password"
                  variant="bordered"
                  endContent={
                    <button type="button" onClick={toggleVisibility} className="focus:outline-none">
                      {isVisible ? (
                        <IoIosEyeOff className="text-2xl text-default-400 pointer-events-none" />
                      ) : (
                        <IoIosEye className="text-2xl text-default-400 pointer-events-none" />
                      )}
                    </button>
                  }
                  type={isVisible ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  isInvalid={!!passwordError}
                  classNames={{
                    input: 'bg-transparent',
                    inputWrapper: 'bg-default-100/50 hover:bg-default-200/70 transition-colors',
                  }}
                />
                {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
              </div>

              {/* Buttons */}
              <div className="flex flex-col space-y-4">
                <Button
                  color="primary"
                  type="submit"
                  className="w-full bg-violet-500 hover:bg-violet-600 transition-colors"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader size="small" color="white" />
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
                <Button
                  color="default"
                  onClick={handleCancel}
                  className="w-full"
                  size="lg"
                  variant="bordered"
                >
                  Cancel
                </Button>
              </div>

              {/* Forgot Password */}
              <div className="text-center mt-6">
                <Link
                  href="/reset_password"
                  className="text-violet-600 hover:text-violet-700 transition-colors text-sm font-medium"
                >
                  Forgot your password?
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}