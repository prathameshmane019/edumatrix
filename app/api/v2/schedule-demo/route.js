import { closeMongoDB, connectMongoDB } from '@/lib/connectDb';
import { DemoRequest } from '@/models/demo';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'maneprathamesh019@gmail.com',
//     pass: 'ppmn ujpq uivu ovzg'
//   }
// });

// const generateCredentials = () => {
//   const username = `demo_${Math.random().toString(36).substring(7)}`;
//   const password = Math.random().toString(36).substring(7);
//   return { username, password };
// };

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone } = body; 
      await connectMongoDB()
      const demoRequest = new DemoRequest({
        name,
        email,
        phone
      });
    await demoRequest.save();
    // await closeMongoDB()
    return NextResponse.json(
      { message: 'Demo scheduled successfully' },
      { status: 200 }
    );
  } catch (error) {
    // console.error('Error sending email:', error);
      return NextResponse.json(
      { message: 'Failed to schedule demo' },
      { status: 500 }
    );

  }
}