// app/api/v2/obe/course-outcomes/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import CourseOutcome from "@/models/OBE/CourseOutcome"; 
import ProgramOutcome from "@/models/OBE/ProgramOutcome";

// Create a new course outcome
export async function POST(req) {
  try {
    await connectMongoDB();
    const body = await req.json();

    console.log("[API - POST] Received Body:", body);
    
    const programOutcome = await ProgramOutcome.findOne({institute: body.instituteId, department: body.department, academicYear: body.academicYear});

    console.log("Program Outcome:", programOutcome);
    if (!programOutcome) {
      return NextResponse.json({ 
        success: false, 
        message: "Program outcome not found" 
      }, { status: 404 });
    }
    
    // Validate required fields
    if (!body.subject || !body.outcomes || !Array.isArray(body.outcomes)) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required fields" 
      }, { status: 400 });
    }

    // Check if a course outcome already exists for this subject
    const existingCourseOutcome = await CourseOutcome.findOne({
      subject: body.subject
    });
// If existing course outcome found, append the new outcomes to it
if (existingCourseOutcome) {
  // Combine existing outcomes with new ones, avoiding duplicates based on outcomeCode
  const existingOutcomeCodes = existingCourseOutcome.outcomes.map(o => o.index);
  
  // Filter out any new outcomes that might be duplicates
  const newOutcomes = body.outcomes.filter(outcome => 
    !existingOutcomeCodes.includes(outcome.index)
  );
  
  // Update the existing course outcome with the combined outcomes
  const updatedCourseOutcome = await CourseOutcome.findByIdAndUpdate(
    existingCourseOutcome._id,
    { 
      $push: { outcomes: { $each: newOutcomes } },
      updatedBy: body.userId || null,
      updatedAt: new Date()
    },
    { new: true, runValidators: true }
  ).populate('subject', 'name code')
   .populate('programOutcome');
  
  return NextResponse.json({ 
    success: true, 
    message: "Course outcomes appended successfully",
    data: updatedCourseOutcome 
  }, { status: 200 });
}

    // Create the new course outcome document if none exists
    const newCourseOutcome = await CourseOutcome.create({
      subject: body.subject,
      code: body.code || `CO-${Date.now().toString().slice(-6)}`, // Generate a code if not provided
      programOutcome: programOutcome._id,
      institute: body.instituteId,
      department: body.department,
      academicYear: body.academicYear,
      outcomes: body.outcomes,
      createdBy: body.userId || null
    });

    return NextResponse.json({ 
      success: true, 
      message: "Course outcome created successfully",
      data: newCourseOutcome 
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating course outcome:", error);
    
    // Handle duplicate key error specifically
    if (error.code === 11000) {
      return NextResponse.json({ 
        success: false, 
        message: "A course outcome already exists for this subject",
        error: "Duplicate entry" 
      }, { status: 409 });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: "Failed to create course outcome", 
      error: error.message 
    }, { status: 500 });
  }
}

// Get course outcomes with optional filters
export async function GET(req) {
  try {
    await connectMongoDB();
    
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get('subjectId');
    const programOutcome = searchParams.get('programOutcome');
    const instituteId = searchParams.get('instituteId');
    const department = searchParams.get('department');
    const academicYear = searchParams.get('academicYear');
    
    // Build query filters
    const filter = {};
    if (subject) filter.subject = subject;
    if (programOutcome) filter.programOutcome = programOutcome;
    if (instituteId) filter.institute = instituteId;
    if (department) filter.department = department;
    if (academicYear) filter.academicYear = academicYear;
    
 
    if(!instituteId && (!subject))
    {
      return NextResponse.json({success:false},{status:400})
    }
    
    // Fetch course outcomes
    const courseOutcomes = await CourseOutcome.find(filter)
      .populate('subject', 'name code')
      .populate('programOutcome') 
    
      console.log("[API - GET] Course Outcomes:", courseOutcomes);
      
    return NextResponse.json({ 
      success: true, 
      data: courseOutcomes 
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching course outcomes:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch course outcomes" 
    }, { status: 500 });
  }
}
