import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Subject from "@/models/subject";
import Student from "@/models/student";
import Attendance from "@/models/attendance";
import Classes from "@/models/className";
import Faculty from "@/models/faculty";
import Institute from "@/models/Institute";
export async function GET(req) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("_id");
    const dateString = searchParams.get("date");
    const session = searchParams.get("session");
    const batchId = searchParams.get("batchId"); // Get batchId from query params

    console.log("Update Attendance", { subjectId, dateString, session, batchId });
    
    if (!subjectId || !dateString || !session) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const date = new Date(dateString);
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
    switch(subject.subType) {
      case 'theory':
        // For theory subjects, use all students from the class
        students = subject.class.students || [];
        break;

      case 'practical':
        // For practical subjects, handle batch-specific students
        if (batchId) {
          const classDoc = await Classes.findById(subject.class._id)
            .populate({
              path: 'batches.students',
              model: 'Student',
              select: '_id rollNumber name department'
            })
            .lean();

          if (!classDoc) {
            return NextResponse.json({ error: "Class not found" }, { status: 404 });
          }

          const selectedBatch = classDoc.batches.find(batch => batch.id === batchId);
          if (!selectedBatch) {
            return NextResponse.json({ error: "Batch not found" }, { status: 404 });
          }

          students = selectedBatch.students || [];
        } else {
          // If no specific batch is provided, use all students (fallback)
          students = subject.class.students || [];
        }
        break;

      case 'tg':
        // For TG subjects, use all class students
        students = subject.class.students || [];
        break;

      default:
        students = [];
    }

    // Create date range for attendance search
    const startOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

    // Find attendance record
    const attendanceRecord = await Attendance.findOne({
      subject: subjectId,
      date: { $gte: startOfDay, $lt: endOfDay },
      session: parseInt(session),
      ...(batchId && { batchId }) // Include batchId in query if it exists
    }).lean();

    // Map students with their attendance status
    const studentsWithAttendance = students.map(student => ({
      _id: student._id.toString(),
      name: student.name,
      rollNumber: student.rollNumber,
      department: student.department,
      status: attendanceRecord?.records.find(r => r.student.toString() === student._id.toString())?.status || 'absent'
    }));
    
    return NextResponse.json({
      message: "Data fetched successfully",
      students: studentsWithAttendance,
      attendanceRecord: attendanceRecord || null,
      subject: {
        _id: subject._id.toString(),
        name: subject.name,
        subType: subject.subType,
        content: subject.content,
        batchId: batchId || null // Include selected batchId in response
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching subject attendance:", error);
    return NextResponse.json({ 
      error: "Failed to fetch data", 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
export async function PUT(req) {
  try {
    await connectMongoDB();
    const { subject, date, session, attendanceRecords, contents } = await req.json();

    if (!subject || !date || !session || !attendanceRecords) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const attendanceDate = new Date(date);
    const startOfDay = new Date(Date.UTC(
      attendanceDate.getUTCFullYear(), 
      attendanceDate.getUTCMonth(), 
      attendanceDate.getUTCDate()
    ));
    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

    // Update or create attendance record
    const attendanceResult = await Attendance.findOneAndUpdate(
      {
        subject,
        date: { $gte: startOfDay, $lt: endOfDay },
        session: parseInt(session)
      },
      {
        $set: {
          records: attendanceRecords.map(record => ({
            student: record.student,
            status: record.status
          }))
        }
      },
      { upsert: true, new: true }
    );

    // Update subject content
    const subjectDoc = await Subject.findById(subject);

    if (contents && contents.length > 0) {
      const formattedDate = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(attendanceDate);

      subjectDoc.content.forEach(content => {
        if (contents.includes(content._id.toString())) {
          content.status = 'covered';
          content.completedDate = formattedDate;
        }
      });

      await subjectDoc.save();
    }

    return NextResponse.json({ 
      message: "Attendance and subject data updated successfully", 
      attendance: attendanceResult,
      subject: subjectDoc
    }, { status: 200 });

  } catch (error) {
    console.error("Failed to update attendance:", error);
    return NextResponse.json({ 
      error: "Failed to update", 
      details: error.message 
    }, { status: 500 });
  }
}