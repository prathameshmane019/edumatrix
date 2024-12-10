import { connectMongoDB } from "@/lib/connectDb";
import Faculty from "@/models/faculty";
import Subject from "@/models/subject";
import { NextResponse } from "next/server";
import Institute from "@/models/Institute";
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const facultyId = searchParams.get("facultyId");
    const academicYear = searchParams.get("academicYear");
    const sem = searchParams.get("sem");
    const institute = searchParams.get("institute");
  
    if (!facultyId && !institute) {
      return NextResponse.json({ error: "Faculty ID and InstituteId is required" }, { status: 400 });
    }
  
    try {
      await connectMongoDB();
  
      // Construct query for subjects
      const query = {
        teacher:facultyId,
        ...(academicYear && { academicYear }),
        ...(institute && { institute }),
        ...(sem && { sem })
      };
  
      // Fetch subjects with detailed population
      const subjects = await Subject.find(query)
        .select('name id batch')
  
      return NextResponse.json(
        subjects, { status: 200 });
    } catch (error) {
      console.error("Error fetching faculty subjects:", error);
      return NextResponse.json({ 
        error: "Failed to fetch faculty subjects",
        details: error.message 
      }, { status: 500 });
    }
  }