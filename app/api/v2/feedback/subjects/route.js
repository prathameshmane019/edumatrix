// /app/api/v2/feedback/subjects/route.js
import { NextResponse } from "next/server";
import Subject from "@/models/subject";
import { connectMongoDB } from "@/lib/connectDb";

export async function GET(request) {
  try {
    await connectMongoDB();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("class");
    const sem = searchParams.get("sem");
    const academicYear = searchParams.get("academicYear");
    const subType = searchParams.get("subType"); // Get subType parameter
    
    if (!classId || !sem || !academicYear || !subType) {
      return NextResponse.json(
        { error: "Missing required parameters: class, sem, academicYear, subType" },
        { status: 400 }
      );
    }

    // Find subjects matching the criteria including subType
    const subjects = await Subject.find({
      class: classId,
      sem: sem,
      academicYear: academicYear,
      subType: subType // Filter by subject type
    }).populate('teacher', 'name _id')
      .populate('batchFaculties.faculty', 'name _id');

    // Transform data for the frontend
    const formattedSubjects = subjects.map(subject => {
      // Common base data
      const baseData = {
        subject: subject.name,
        _id: subject._id.toString(),
        subType: subject.subType
      };
      
      // For theory subjects
      if (subject.subType === 'theory') {
        return {
          ...baseData,
          faculty: subject.teacher?.name || '',
          teacherId: subject.teacher?._id?.toString() || ''
        };
      } 
      // For practical subjects with batch faculties
      else if (subject.subType === 'practical') {
        // Format all batch faculties
        const batchFaculties = (subject.batchFaculties || []).map(bf => ({
          batchId: bf.batchId,
          faculty: bf.faculty?.name || '',
          facultyId: bf.faculty?._id?.toString() || ''
        }));
        
        return {
          ...baseData,
          batch: subject.batch || [],
          batchFaculties: batchFaculties
        };
      }
      
      // Default case for other subject types
      return baseData;
    });

    return NextResponse.json(formattedSubjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}

// Add a POST endpoint to save subjects
export async function POST(request) {
  try {
    await connectMongoDB();
    
    const body = await request.json();
    const { subjects, classId, semester, academicYear } = body;
    
    if (!subjects || !classId || !semester || !academicYear) {
      return NextResponse.json(
        { error: "Missing required data" },
        { status: 400 }
      );
    }
    
    const savedSubjects = [];
    
    for (const subject of subjects) {
      let subjectData = {
        name: subject.subject,
        class: classId,
        sem: semester,
        academicYear: academicYear,
        subType: subject.subType || 'theory'
      };
      
      if (subject.subType === 'theory') {
        // For theory subjects
        subjectData.teacher = subject.teacherId || null;
      } else if (subject.subType === 'practical') {
        // For practical subjects
        subjectData.batch = subject.batches || [];
        
        // Format batch faculties data
        if (subject.batchFaculties && subject.batchFaculties.length > 0) {
          subjectData.batchFaculties = subject.batchFaculties.map(bf => ({
            batchId: bf.batchId,
            faculty: bf.facultyId
          }));
        }
      }
      
      // Check if subject already exists
      const existingSubject = await Subject.findOne({
        name: subject.subject,
        class: classId,
        sem: semester,
        academicYear: academicYear,
        subType: subject.subType || 'theory'
      });
      
      if (existingSubject) {
        // Update existing subject
        const updated = await Subject.findByIdAndUpdate(
          existingSubject._id,
          subjectData,
          { new: true }
        );
        savedSubjects.push(updated);
      } else {
        // Create new subject
        const newSubject = new Subject(subjectData);
        await newSubject.save();
        savedSubjects.push(newSubject);
      }
    }
    
    return NextResponse.json({ 
      message: "Subjects saved successfully", 
      subjects: savedSubjects 
    });
  } catch (error) {
    console.error("Error saving subjects:", error);
    return NextResponse.json(
      { error: "Failed to save subjects" },
      { status: 500 }
    );
  }
}