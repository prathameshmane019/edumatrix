import NextAuth from 'next-auth'
import CredentialsProvider from "next-auth/providers/credentials"
import { connectMongoDB } from "@/lib/connectDb"
import Faculty from '@/models/faculty'
import Student from '@/models/student'
import Institute from '@/models/Institute'
import Department from '@/models/department'

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
          const password = credentials.password

          await connectMongoDB()
          // Try to find user across different models
          const faculty = await Faculty.findOne({
            $or: [
              { phoneNo: identifier },
              { id: identifier }
            ]
          }).populate('institute')

          const student = await Student.findOne({
            $or: [
              { email: identifier },
              { phoneNo: identifier },
              { _id: identifier }
            ]
          }).populate('institute department')

          const department = await Department.findOne({
            $or: [
              { name: identifier },
              { id: identifier }
            ]
          }).populate('institute')

          const institute = await Institute.findOne({
            $or: [
              { instituteCode: identifier }
            ]
          })

          // Validate user
          let user = faculty || student || department || institute
          if (!user) {
            throw new Error('User not found')
          }
          console.log(user);

          // Simple password check (replace with more secure method)
          if (user.password !== password) {
            throw new Error('Invalid credentials')
          }

          // Determine user type and create profile
          let userType = 'unknown'
          if (faculty) userType = 'faculty'
          else if (student) userType = 'student'
          else if (department) userType = 'department'
          else if (institute) userType = 'superadmin'


          // Create a profile object with all necessary user information
          const profile = {
            _id: user._id,
            role:userType,
            department: user?.department,
            name: user.name,
            email: user.email,
            // Add any other relevant fields from the user document
          }
          console.log(profile);

          return profile
        } catch (error) {
          console.error('Error during authorization:', error)
          throw new Error(error instanceof Error ? error.message : 'An unexpected error occurred')
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