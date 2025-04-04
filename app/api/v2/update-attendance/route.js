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
    const batchId = searchParams.get("batchId");

    console.log("Update Attendance", { subjectId, dateString, session, batchId });
    
    if (!subjectId || !dateString || !session) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const dateParam = new Date(dateString);
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
    switch(subject.subType) {
      case 'theory':
        students = subject.class?.students || [];
        break;

      case 'practical':
        if (batchId) {
          const classDoc = await Classes.findById(subject.class._id)
            .populate({
              path: 'batches.students',
              model: 'Student',
              select: '_id personalDetails.name academicDetails.rollNumber academicDetails.department academicDetails.academicYear'
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
          students = subject.class?.students || [];
        }
        break;

      case 'tg':
        students = subject.class?.students || [];
        break;

      default:
        students = [];
    }

    // Transform student data
    const transformedStudents = students.map(student => ({
      _id: student._id.toString(),
      name: student.personalDetails?.name || 'Unknown',
      rollNumber: student.academicDetails?.rollNumber || 'N/A',
      department: student.academicDetails?.department || 'N/A',
      academicYear: student.academicDetails?.academicYear || 'N/A'
    }));

    // Create date range for attendance search
    const startOfDay = new Date(Date.UTC(
      dateParam.getUTCFullYear(),
      dateParam.getUTCMonth(),
      dateParam.getUTCDate(),
      0, 0, 0, 0
    ));
    
    const endOfDay = new Date(Date.UTC(
      dateParam.getUTCFullYear(),
      dateParam.getUTCMonth(),
      dateParam.getUTCDate(),
      23, 59, 59, 999
    ));
    
    // Modify attendance record query to handle batch-specific records
    const attendanceQuery = {
      subject: subjectId,
      date: { $gte: startOfDay, $lt: endOfDay },
      session: parseInt(session)
    };

    if (subject.subType === 'practical' && batchId) {
      attendanceQuery.batchId = batchId; // Changed from 'batch' to 'batchId' for consistency
    }

    const attendanceRecord = await Attendance.findOne(attendanceQuery).lean();

    // Map students with their attendance status
    const studentsWithAttendance = transformedStudents.map(student => ({
      ...student,
      status: attendanceRecord?.attendanceRecords?.find(r => r.student.toString() === student._id)?.status || 'absent'
    }));
    
    return NextResponse.json({
      message: "Data fetched successfully",
      students: studentsWithAttendance,
      attendanceRecord: attendanceRecord || null,
      subject: {
        _id: subject._id.toString(),
        name: subject.name,
        subType: subject.subType,
        content: subject.content || [],
        tgSessions: subject.tgSessions || [],
        batchId: batchId || null
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
    const { 
      subject, 
      date, 
      session, 
      attendanceRecords, 
      contents, 
      batchId, 
      pointsDiscussed,
      institute 
    } = await req.json();

    if (!subject || !date || !session || !attendanceRecords || !institute) {
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

    // Prepare the update object
    const updateData = {
      subject,
      date: attendanceDate,
      session: parseInt(session),
      attendanceRecords: attendanceRecords.map(record => ({
        student: record.student,
        status: record.status
      })),
      institute
    };

    if (batchId) {
      updateData.batchId = batchId;
    }

    if (pointsDiscussed) {
      updateData.pointsDiscussed = pointsDiscussed;
    }

    // Update or create attendance record
    const attendanceResult = await Attendance.findOneAndUpdate(
      {
        subject,
        date: { $gte: startOfDay, $lt: endOfDay },
        session: parseInt(session),
        ...(batchId && { batchId })
      },
      { $set: updateData },
      { upsert: true, new: true }
    );

    // Update subject content if provided (for non-TG subjects)
    if (contents && contents.length > 0) {
      const subjectDoc = await Subject.findById(subject);
      if (subjectDoc && subjectDoc.subType !== 'tg') {
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
            if (batchId && subjectDoc.subType === 'practical') {
              if (!content.batchStatus) {
                content.batchStatus = [];
              }
              const batchStatus = content.batchStatus.find(bs => bs.batchId === batchId);
              if (batchStatus) {
                batchStatus.status = 'covered';
              } else {
                content.batchStatus.push({ batchId, status: 'covered' });
              }
            }
          }
        });

        await subjectDoc.save();
      }
    }

    // Update TG sessions if pointsDiscussed is provided
    if (pointsDiscussed && pointsDiscussed.length > 0) {
      const subjectDoc = await Subject.findById(subject);
      if (subjectDoc && subjectDoc.subType === 'tg') {
        if (!subjectDoc.tgSessions) {
          subjectDoc.tgSessions = [];
        }
        subjectDoc.tgSessions.push({
          date: attendanceDate,
          pointsDiscussed
        });
        await subjectDoc.save();
      }
    }

    return NextResponse.json({ 
      message: "Attendance and subject data updated successfully", 
      attendance: attendanceResult
    }, { status: 200 });

  } catch (error) {
    console.error("Failed to update attendance:", error);
    return NextResponse.json({ 
      error: "Failed to update", 
      details: error.message 
    }, { status: 500 });
  }
}