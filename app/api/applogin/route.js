import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Student from '@/models/student';
import Faculty from '@/models/faculty';
import Subject from '@/models/subject';
import Institute from '@/models/Institute';
import { connectMongoDB } from '@/lib/connectDb';
const SECRET_KEY = process.env.NEXTAUTH_SECRET

export async function POST(request) {
  const { _id, password, role } = await request.json();
  console.log({ _id, password, role });

  try {
    await connectMongoDB()
    let user;
    if (role === 'faculty') {
      user = await Faculty.findOne({id:_id})
      .populate('institute',"name address");
    } else if (role === 'student') {
      user = await Student.findById(_id)
      .populate('institute',"name address");
    } else {
      return NextResponse.json({ msg: 'Invalid role' }, { status: 400 });
    }

    console.log(user);
    if (!user) {
      return NextResponse.json({ msg: 'Invalid credentials' }, { status: 401 });
    }
    if (user.password !== password) { // In a real app, use proper password comparison
      return NextResponse.json({ msg: 'Invalid credentials' }, { status: 401 });
    }

    let subjects = [];
    // If faculty, fetch their subjects
    if (role === 'faculty') {
      subjects = await Subject.find({
        teacher: user._id,
        sem: user.sem,
        academicYear: user.currentYear
      }).populate('class','id')
      .select('_id id name batch subType ');
    }

    const token = jwt.sign({ user: { id: user._id, role: role} }, SECRET_KEY, { expiresIn: '7h' });
    
    return NextResponse.json({ 
      token, 
      user: {
        ...user.toObject(),
        role: role,
        subjects: subjects
      } 
    });
  } catch (err) {
    console.error(err.message);
    return NextResponse.json({ msg: 'Server error' }, { status: 500 });
  }
}

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return NextResponse.json({ msg: 'Access denied' }, { status: 401 });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return NextResponse.json({ msg: 'This is protected data', user: decoded.user });
  } catch (err) {
    return NextResponse.json({ msg: 'Invalid token' }, { status: 403 });
  }
}