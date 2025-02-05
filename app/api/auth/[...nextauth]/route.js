// import NextAuth from 'next-auth'
// import CredentialsProvider from "next-auth/providers/credentials"
// import { connectMongoDB } from "@/lib/connectDb"
// import Faculty from '@/models/faculty'
// import Student from '@/models/student'
// import Institute from '@/models/Institute'
// import Department from '@/models/department'
// import { NextResponse } from 'next/server'

// export const authOptions = {
//   providers: [
//     CredentialsProvider({
//       name: 'Credentials',
//       credentials: {},
//       async authorize(credentials) {
//         if (!credentials?.userId || !credentials?.password) {
//           throw new Error('Invalid credentials')
//         }

//         try {
//           await connectMongoDB()
//           const identifier = credentials.userId
//           const password = credentials.password

//           await connectMongoDB()
//           // Try to find user across different models
//           const faculty = await Faculty.findOne({
//             $or: [
//               { phoneNo: identifier },
//               { id: identifier }
//             ]
//           }).populate('institute')

//           const student = await Student.findOne({
//             $or: [
//               { email: identifier },
//               { phoneNo: identifier },
//               { _id: identifier }
//             ]
//           }).populate('institute department')

//           const department = await Department.findOne({
//             $or: [
//               { department: identifier },
//               { id: identifier }
//             ]
//           }).populate('institute')

//           const institute = await Institute.findOne({
//             $or: [
//               { instituteCode: identifier }
//             ]
//           })

//           // Validate user
//           let user = faculty || student || department || institute
//           if (!user) {

//             throw new Error('User not found')
//           }
//           console.log(user);

//           // Simple password check (replace with more secure method)
//           if (user.password !== password) {
//             throw new Error('Invalid credentials')
//           }

//           // Determine user type and create profile
//           let userType = 'unknown'
//           if (faculty) userType = 'faculty'
//           else if (student) userType = 'student'
//           else if (department) userType = 'admin'
//           else if (institute) userType = 'superadmin'


//           // Create a profile object with all necessary user information
//           const profile = {
//             _id: user._id,
//             role:userType,
//             department: user.role==="admin"?user?.id: user?.department,
//             name: user.name,
//             email: user.email,
//             // Add any other relevant fields from the user document
//           }
//           console.log(profile);

//           return profile
//         } catch (error) {
//           console.error('Error during authorization:', error)
//           throw new Error(error instanceof Error ? error.message : 'An unexpected error occurred')
//         }
//       }
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.user = user
//       }
//       return token
//     },
//     async session({ session, token }) {
//       session.user = token.user
//       return session
//     }
//   },
//   pages: {
//     signIn: "/",
//   },
//   session: {
//     strategy: "jwt",
//     maxAge: 3600, // 1 hour
//   },
//   secret: process.env.NEXTAUTH_SECRET,
// }

// const handler = NextAuth(authOptions)
// export { handler as GET, handler as POST }
import NextAuth from 'next-auth'
import CredentialsProvider from "next-auth/providers/credentials"
import { connectMongoDB } from "@/lib/connectDb"
import Faculty from '@/models/faculty'
import Student from '@/models/student'
import Institute from '@/models/Institute'
import Department from '@/models/department'
import Subscription from '@/models/subscription'
import Service from '@/models/service'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {},
      async authorize(credentials) {
        if (!credentials?.userId || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        try {
          await connectMongoDB()
          const identifier = credentials.userId
          console.log(credentials);

          // Try to find user across different models without population
          let user = null
          let userType = null
          let instituteId = null

          // Check Institute first (no population needed)
          const institute = await Institute.findOne({
            instituteCode: identifier
          })

          if (institute) {
            user = institute
            userType = 'superadmin'
            instituteId = institute._id
          } else {
            // Check Faculty
            const faculty = await Faculty.findOne({
              $or: [
                { phoneNo: identifier },
                { id: identifier }
              ]
            }).select('+password institute name email department')

            if (faculty) {
              user = faculty
              userType = 'faculty'
              instituteId = faculty.institute
            } else {
              // Check Student
              const student = await Student.findOne({
                $or: [
                  { email: identifier },
                  { phoneNo: identifier },
                  { _id: identifier }
                ]
              }).select('+password institute name email department')

              if (student) {
                user = student
                userType = 'student'
                instituteId = student.institute
              } else {
                // Check Department
                const department = await Department.findOne({
                  $or: [
                    { department: identifier },
                    { id: identifier }
                  ]
                }).select('+password institute name')

                if (department) {
                  user = department
                  userType = 'admin'
                  instituteId = department.institute
                }
              }
            }
          }

          if (!user) {
            throw new Error('User not found')
          }

          // Verify password
          if (!user.password == credentials.password) {
            throw new Error('Invalid credentials')
          }

          // Get active subscriptions
          const currentDate = new Date()
          const activeSubscriptions = await Subscription.find({
            userId: instituteId,
            status: 'active',
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate },
            access: true
          }).select('serviceId')


          // Get service details
          const serviceIds = activeSubscriptions.map(sub => sub.serviceId)
          const services = await Service.find({
            _id: { $in: serviceIds }
          }).select('name _id')

          // Create profile object with necessary information only
          const profile = {
            _id: user._id,
            role: userType,
            name: user.name,
            email: user.email,
            department: user.department,
            instituteId: instituteId,
            subscribedServices: services.map(service => (
            service._id.toString())),
            hasActiveSubscription: activeSubscriptions.length > 0
          }

          console.log(profile);

          return profile
        } catch (error) {
          console.error('Error during authorization:', error)
          throw new Error(error.message || 'Authentication failed')
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user
      }
      return token
    },
    async session({ session, token }) {
      session.user = token.user
      return session
    }
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 3600, // 1 hour
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }