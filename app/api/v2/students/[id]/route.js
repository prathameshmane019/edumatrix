import { NextResponse } from 'next/server';
import { connectMongoDB } from "@/lib/connectDb"; 
import Student from "@/models/student";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  try {
    await connectMongoDB();
    
    const id = params.id;
    
    // First try to find by custom id field
    let student = await Student.findOne({ id: id })
      .populate('department', 'name')
      .populate('class', 'name')
      .populate('institute', 'name address university')
      .lean();
    
    // If not found, try to find by MongoDB _id (if valid ObjectId format)
    if (!student && mongoose.Types.ObjectId.isValid(id)) {
      student = await Student.findById(id)
        .populate('department', 'name')
        .populate('class', 'name')
        .populate('institute', 'name address university')
        .lean();
    }
    
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }
    
    console.log("Fetched Student Successfully", student);
    return NextResponse.json(student, { status: 200 });
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json(
      { error: 'Failed to Fetch Student' },
      { status: 500 }
    );
  }
}