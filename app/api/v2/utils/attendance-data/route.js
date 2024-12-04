import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Subject from "@/models/subject";
import Classes from "@/models/className";
import Student from "@/models/student";
import mongoose from "mongoose";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const subjectId = searchParams.get("_id");
  const selectedBatchId = searchParams.get("batchId");

  console.log("Attendance data request hit");
  
  if (!subjectId) {
    return NextResponse.json({ error: "Subject ID is required" }, { status: 400 });
  }

  try {
    await connectMongoDB();

    // Fetch subject with full population
    const subject = await Subject.findById(subjectId)
      .populate({
        path: 'class',
        populate: {
          path: 'students',
          model: 'Student',
          select: '_id rollNumber name department'
        }
      })
      .populate('teacher', '_id name')
      .populate('institute', '_id name')
      .lean();

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    let students = [];

    // Different student retrieval logic based on subject type
    switch(subject.subType) {
      case 'theory':
        // For theory subjects, use students from the class
        students = subject.class.students || [];
        break;

      case 'practical':
        // For practical subjects, handle batch-specific or all students
        if (selectedBatchId) {
          const classDoc = await Classes.findById(subject.class._id)
            .populate({
              path: 'batches.students',
              model: 'Student',
              select: '_id rollNumber name department'
            })
            .lean();

          if (classDoc) {
            const selectedBatch = classDoc.batches.find(batch => batch.id === selectedBatchId);
            students = selectedBatch ? selectedBatch.students : [];
          }
        } else {
          // If no specific batch, get all students in the class
          students = subject.class.students || [];
        }
        break;

      case 'tg':
        // For TG, use class students or implement specific TG group logic
        students = subject.class.students || [];
        break;

      default:
        students = [];
    }

    // Prepare response data
    const responseData = {
      subject: {
        ...subject,
        ...(subject.subType !== 'tg' && { content: subject.content || [] }),
        ...(subject.subType === 'tg' && { tgSessions: subject.tgSessions || [] }),
      },
      students,
      message: "Data fetched successfully"
    };

    console.log("Response Data:", JSON.stringify(responseData, null, 2));

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    return NextResponse.json({ 
      error: "Failed to fetch data", 
      details: error.message 
    }, { status: 500 });
  }
}