import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Subject from "@/models/subject";
import Classes from "@/models/className";
import Student from "@/models/student";
import mongoose from "mongoose";
import Faculty from "@/models/faculty";
import Institute from "@/models/Institute";

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
          select: '_id personalDetails.name academicDetails.rollNumber academicDetails.department academicDetails.academicYear'
        }
      })
      .populate('teacher', '_id personalDetails.name')
      .populate('institute', '_id name')
      .lean();

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    let students = [];
    let batches = [];

    // Different student retrieval logic based on subject type
    switch(subject.subType) {
      case 'theory':
        // For theory subjects, use students from the class
        students = subject.class?.students || [];
        break;

      case 'practical':
        // For practical subjects, handle batch-specific or all students
        if (selectedBatchId) {
          const classDoc = await Classes.findById(subject.class._id)
            .populate({
              path: 'batches.students',
              model: 'Student',
              select: '_id personalDetails.name academicDetails.rollNumber academicDetails.department academicDetails.academicYear'
            })
            .lean();

          if (classDoc) {
            batches = classDoc.batches || [];
            const selectedBatch = batches.find(batch => batch.id === selectedBatchId);
            students = selectedBatch ? selectedBatch.students : [];
          }
        } else {
          // If no specific batch, get all students in the class
          students = subject.class?.students || [];
          // Get all batches for practical subjects
          const classDoc = await Classes.findById(subject.class._id)
            .select('batches')
            .lean();
          batches = classDoc?.batches || [];
        }
        break;

      case 'tg':
        // For TG, use class students
        students = subject.class?.students || [];
        break;

      default:
        students = [];
    }

    // Transform student data to flatten the nested structure
    const transformedStudents = students.map(student => ({
      _id: student._id,
      name: student.personalDetails?.name || 'Unknown',
      rollNumber: student.academicDetails?.rollNumber || 'N/A',
      department: student.academicDetails?.department || 'N/A',
      academicYear: student.academicDetails?.academicYear || 'N/A'
    }));

    // Prepare response data
    const responseData = {
      subject: {
        _id: subject._id,
        name: subject.name,
        subType: subject.subType,
        class: {
          _id: subject.class?._id,
          name: subject.class?.name
        },
        teacher: {
          _id: subject.teacher?._id,
          name: subject.teacher?.personalDetails?.name || subject.teacher?.name
        },
        institute: {
          _id: subject.institute?._id,
          name: subject.institute?.name
        },
        ...(subject.subType !== 'tg' && { content: subject.content || [] }),
        ...(subject.subType === 'tg' && { tgSessions: subject.tgSessions || [] })
      },
      batches: subject.subType === 'practical' ? batches : undefined,
      students: transformedStudents,
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