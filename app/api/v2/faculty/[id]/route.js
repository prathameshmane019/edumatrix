import { NextResponse } from 'next/server';
import { connectMongoDB } from "@/lib/connectDb"; // Using your existing connection function
import Faculty from "@/models/faculty";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  try {
    await connectMongoDB();
    
    const id = params.id;
    
    // First try to find by custom id field
    let faculty = await Faculty.findOne({ id: id })
      .populate('institute', 'name address university')
      .lean();
    
    // If not found, try to find by MongoDB _id (if valid ObjectId format)
    if (!faculty && mongoose.Types.ObjectId.isValid(id)) {
      faculty = await Faculty.findById(id)
        .populate('institute', 'name address university')
        .lean();
    }
    
    if (!faculty) {
      return NextResponse.json(
        { error: 'Faculty member not found' },
        { status: 404 }
      );
    }
    
    console.log("Fetched Faculty Successfully", faculty);
    return NextResponse.json(faculty, { status: 200 });
  } catch (error) {
    console.error('Error fetching faculty member:', error);
    return NextResponse.json(
      { error: 'Failed to Fetch Faculty' }, // Consistent error message style
      { status: 500 }
    );
  }
}