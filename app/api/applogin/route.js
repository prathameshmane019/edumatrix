import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Student from '@/models/student';
import Faculty from '@/models/faculty';
import Subject from '@/models/subject';
import Institute from '@/models/Institute';
import { connectMongoDB } from '@/lib/connectDb';
import mongoose from 'mongoose';
import Service from '@/models/service';
import Subscription from '@/models/subscription';

const SECRET_KEY = process.env.NEXTAUTH_SECRET;

export async function POST(request) {
  const { _id, password, role } = await request.json();
  console.log({ _id, password, role });

  try {
    await connectMongoDB();

    // Try to find user across different models without population
    let user = null;
    let instituteId = null;

    if (role === 'faculty') {
      user = await Faculty.findOne({ id: _id })
        .populate('institute', "name address");
    } else if (role === 'student') {
      // Explicitly select password field which is excluded by default
      user = await Student.findById(_id)
        .select('+password')
        .populate({
          path: 'academicDetails.institute',
          select: 'name address'
        });
    } else {
      return NextResponse.json({ msg: 'Invalid role' }, { status: 400 });
    }

    console.log("Found user:", user);

    if (!user) {
      return NextResponse.json({ msg: 'Invalid credentials' }, { status: 401 });
    }
    
    // Check if password exists in the user object
    if (!user.password) {
      console.log("User has no password set");
      return NextResponse.json({ msg: 'Invalid credentials' }, { status: 401 });
    }
    
    // Fixed password comparison logic
    if (user.password !== password) { // In a real app, use proper password comparison
      console.log("Invalid Password - provided:", password, "stored:", user.password);
      return NextResponse.json({ msg: 'Invalid credentials' }, { status: 401 });
    }

    // Get institute ID based on role
    const instituteDoc = role === 'faculty' ? 
      user.institute : 
      user.academicDetails.institute;
    
    // Get active subscriptions
    const currentDate = new Date();
    const activeSubscriptions = await Subscription.find({
      userId: instituteDoc._id,
      status: 'active',
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
      access: true
    }).select('serviceId');

    console.log("Active subscriptions:", activeSubscriptions);

    // Get service details
    const serviceIds = activeSubscriptions.map(sub => sub.serviceId);
    const services = await Service.find({
      _id: { $in: serviceIds }
    }).select('name _id');
    console.log("Service IDs:", serviceIds);

    let subjects = [];
    // If faculty, fetch their subjects
    if (role === 'faculty') {
      // Convert user._id to ObjectId if it's a string
      const facultyId = typeof user._id === 'string' ?
        new mongoose.Types.ObjectId(user._id) : user._id;

      // Fetch both theory subjects and practical/TG subjects
      const allSubjects = await Subject.find({
        institute: user.institute._id,
        sem: user.sem,
        academicYear: user.currentYear,
        $or: [
          // Theory subjects where faculty is the teacher
          {
            subType: 'theory',
            teacher: facultyId
          },
          // Practical/TG subjects where faculty is in batchFaculties
          {
            subType: { $in: ['practical', 'tg'] },
            'batchFaculties.faculty': facultyId
          }
        ]
      })
        .populate('class', 'id name')
        .lean();

      // Process subjects to include batch information
      subjects = allSubjects.map(subject => {
        if (subject.subType === 'theory') {
          // For theory subjects, return as is with all batches
          return {
            ...subject,
            _id: subject._id.toString(),
            assignedBatches: subject.batch || []
          };
        } else {
          // For practical/TG subjects, only include batches assigned to this faculty
          const assignedBatches = subject.batchFaculties
            .filter(bf => bf.faculty.toString() === facultyId.toString())
            .map(bf => bf.batchId);

          return {
            ...subject,
            _id: subject._id.toString(),
            assignedBatches
          };
        }
      });
    }

    // Create JWT token
    const token = jwt.sign({ 
      user: { 
        id: user._id, 
        role: role 
      } 
    }, SECRET_KEY, { expiresIn: '7h' });

    // Prepare user object based on role
    let userObj;
    
    if (role === 'faculty') {
      userObj = {
        ...user.toObject(),
        role: role,
        subscribedServices: services.map(service => service._id.toString()),
        hasActiveSubscription: activeSubscriptions.length > 0,
        subjects: subjects.map(subject => ({
          _id: subject._id,
          id: subject.id,
          name: subject.name,
          subType: subject.subType,
          class: subject.class,
          assignedBatches: subject.assignedBatches
        }))
      };
    } else if (role === 'student') {
      // Structure for student - matching the new schema
      userObj = {
        ...user.toObject(),
        role: role,
        name: user.personalDetails.name,
        institute: user.academicDetails.institute,
        class: user.academicDetails.class,
        department: user.academicDetails.department,
        rollNumber: user.academicDetails.rollNumber,
        academicYear: user.academicDetails.academicYear,
        status: user.admission.status,
        subscribedServices: services.map(service => service._id.toString()),
        hasActiveSubscription: activeSubscriptions.length > 0
      };
      
      // Remove password from the returned user object
      delete userObj.password;
    }

    console.log("Returning user:", userObj);
    return NextResponse.json({
      token,
      user: userObj
    });

  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ msg: 'Server error', error: err.message }, { status: 500 });
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