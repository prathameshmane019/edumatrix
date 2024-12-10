import { connectMongoDB } from "@/lib/connectDb";
import Subject from "@/models/subject";
import { NextResponse } from "next/server";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const facultyId = searchParams.get("facultyId");
    const academicYear = searchParams.get("academicYear");
    const sem = searchParams.get("sem");
  
    if (!facultyId) {
      return NextResponse.json({ error: "Faculty ID is required" }, { status: 400 });
    }
  
    try {
      await connectMongoDB();
  
      // Construct query for subjects
      const query = {
        teacher: new ObjectId(facultyId),
        ...(academicYear && { academicYear }),
        ...(sem && { sem })
      };
  
      // Fetch subjects with detailed population
      const subjects = await Subject.find(query)
        .populate('class', 'name')
        .populate('institute', 'name')
        .lean();
  
      // Additional context for frontend
      const facultyDetails = await Faculty.findById(facultyId)
        .select('name department')
        .lean();
  
      return NextResponse.json({
        subjects,
        faculty: facultyDetails
      }, { status: 200 });
    } catch (error) {
      console.error("Error fetching faculty subjects:", error);
      return NextResponse.json({ 
        error: "Failed to fetch faculty subjects",
        details: error.message 
      }, { status: 500 });
    }
  }