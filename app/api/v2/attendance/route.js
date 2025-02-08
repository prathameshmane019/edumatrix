import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Attendance from "@/models/attendance";
import Subject from "@/models/subject";
import Institute from "@/models/Institute"; // Assuming you have an Institute model

export async function POST(req) {
  try {
    await connectMongoDB();
    const data = await req.json();
    console.log("Received data:", data);

    const {
      subject,
      session,
      date,
      batchId,
      attendanceRecords,
      pointsDiscussed,
      institute
    } = data;

    // Initial validation
    if (!subject || !session || !date || !attendanceRecords || !institute) {
      return NextResponse.json({ message: "Invalid Input Data" }, { status: 400 });
    }

    // Get the subject document
    const subjectDoc = await Subject.findById(subject);
    if (!subjectDoc) {
      return NextResponse.json({ message: "Subject not found" }, { status: 404 });
    }

    console.log("Processing subject:", {
      id: subjectDoc._id,
      type: subjectDoc.subType,
      name: subjectDoc.name
    });

    const [year, month, day] = date.split('-');
    const attendanceDate = new Date(Date.UTC(year, month - 1, day));
    const formattedDate = attendanceDate.toISOString().split('T')[0];

    // Handle TG sessions first if applicable
    if (subjectDoc.subType === 'tg' && Array.isArray(pointsDiscussed) && pointsDiscussed.length > 0) {
      try {
        // First query to check current state
        const currentSubject = await Subject.findById(subject);
        if (!currentSubject) {
          throw new Error('Subject not found during TG session update');
        }

        // Update the document
        const updatedSubject = await Subject.findByIdAndUpdate(
          subject,
          {
            $push: {
              tgSessions: {
                date: formattedDate,
                pointsDiscussed: pointsDiscussed
              }
            }
          },
          {
            new: true,
            runValidators: false  // We'll validate manually
          }
        );

        if (!updatedSubject) {
          throw new Error('Failed to update TG sessions');
        }

        console.log("Updated TG sessions successfully");
      } catch (error) {
        console.error("Error updating TG sessions:", error);
        return NextResponse.json({
          error: "Failed to update TG sessions",
          details: error.message
        }, { status: 500 });
      }
    }

    // Process attendance records
    const sessions = Array.isArray(session) ? session : [session];
    const attendanceRecordsPromises = sessions.map(async (sess) => {
      const attendanceData = {
        date: attendanceDate,
        subject,
        session: sess,
        institute,
        ...(batchId && { batch: batchId }),
        records: attendanceRecords.map(record => ({
          student: record.student,
          status: record.status
        }))
      };

      return await Attendance.findOneAndUpdate(
        {
          date: attendanceDate,
          subject,
          session: sess,
          institute,
          ...(batchId && { batch: batchId })
        },
        attendanceData,
        { upsert: true, new: true }
      );
    });

    const attendanceRecordsResult = await Promise.all(attendanceRecordsPromises);

    return NextResponse.json({
      message: "Attendance and TG Session Recorded Successfully",
      attendance: attendanceRecordsResult
    }, { status: 200 });

  } catch (error) {
    console.error("Error recording attendance:", error);
    return NextResponse.json({
      error: "Failed to Record Attendance",
      details: error.message
    }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectMongoDB();
    const data = await req.json();
    const {
      date,
      subject,
      session,
      batchId,
      attendanceRecords,
      contents,
      pointsDiscussed,
      institute
    } = data;

    // Validate required fields
    if (!date || !Date.parse(date) || !subject || !session || !attendanceRecords || !institute) {
      return NextResponse.json({ message: "Invalid Input Data" }, { status: 400 });
    }

    // Verify institute exists
    const instituteDoc = await Institute.findById(institute);
    if (!instituteDoc) {
      return NextResponse.json({ message: "Institute not found" }, { status: 404 });
    }

    const attendanceDate = new Date(date);
    const startOfDay = new Date(Date.UTC(attendanceDate.getUTCFullYear(), attendanceDate.getUTCMonth(), attendanceDate.getUTCDate()));
    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

    const sessions = Array.isArray(session) ? session : [session];

    const sessionPromises = sessions.map(async (sess) => {
      const filter = {
        date: { $gte: startOfDay, $lt: endOfDay },
        subject,
        session: sess,
        institute
      };

      if (batchId) {
        filter.batch = batchId;
      }

      // Prepare updated attendance data
      const updateData = {
        date: attendanceDate,
        subject,
        session: sess,
        institute,
        ...(batchId && { batch: batchId }),
        records: attendanceRecords.map(record => ({
          student: record.student,
          status: record.status
        }))
      };

      let attendanceRecord = await Attendance.findOneAndUpdate(
        filter,
        updateData,
        { upsert: true, new: true, runValidators: true }
      );

      // Fetch the subject document
      const subjectDoc = await Subject.findById(subject);
      if (!subjectDoc) {
        throw new Error('Subject not found');
      }

      // Handle different subject types separately
      switch (subjectDoc.subType) {
        case 'tg':
          if (pointsDiscussed && pointsDiscussed.length > 0) {
            const formattedDate = attendanceDate.toISOString().split('T')[0];
            const updateQuery = {
              $set: {}
            };

            // Check if a session already exists for this date
            const existingSessionIndex = (subjectDoc.tgSessions || []).findIndex(session => {
              const sessionDate = new Date(session.date);
              return sessionDate.toISOString().split('T')[0] === formattedDate;
            });

            if (existingSessionIndex !== -1) {
              // Update existing session
              updateQuery.$set[`tgSessions.${existingSessionIndex}.pointsDiscussed`] = pointsDiscussed;
            } else {
              // Add new session
              updateQuery.$push = {
                tgSessions: {
                  date: formattedDate,
                  pointsDiscussed
                }
              };
            }

            await Subject.findByIdAndUpdate(subject, updateQuery, { new: true, runValidators: true });
          }
          break;

        case 'practical':
          if (contents && contents.length > 0 && batchId) {
            const indianFormattedDate = attendanceDate.toLocaleString('en-IN', {
              timeZone: 'Asia/Kolkata',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });

            await Subject.updateOne(
              { _id: subject, "content._id": { $in: contents } },
              {
                $set: {
                  "content.$[elem].batchStatus.$[batch].status": "covered",
                  "content.$[elem].batchStatus.$[batch].completedDate": indianFormattedDate
                }
              },
              {
                arrayFilters: [
                  { "elem._id": { $in: contents } },
                  { "batch.batchId": batchId, "batch.status": { $ne: "covered" } }
                ]
              }
            );
          }
          break;

        case 'theory':
          if (contents && contents.length > 0) {
            const indianFormattedDate = attendanceDate.toLocaleString('en-IN', {
              timeZone: 'Asia/Kolkata',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });

            await Subject.updateOne(
              { _id: subject },
              {
                $set: {
                  "content.$[elem].status": "covered",
                  "content.$[elem].completedDate": indianFormattedDate
                }
              },
              {
                arrayFilters: [
                  { "elem._id": { $in: contents }, "elem.status": { $ne: "covered" } }
                ]
              }
            );
          }
          break;
      }

      await Subject.findByIdAndUpdate(
        subject,
        { $addToSet: { reports: attendanceRecord._id } }
      );

      return attendanceRecord;
    });

    const attendanceRecordsResult = await Promise.all(sessionPromises);
    return NextResponse.json({
      message: "Attendance Updated/Created Successfully",
      attendance: attendanceRecordsResult
    }, { status: 200 });

  } catch (error) {
    console.error("Error updating/creating attendance:", error);
    return NextResponse.json({
      error: "Failed to Update/Create Attendance",
      details: error.message
    }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectMongoDB();
    const data = await req.json();
    const { date, subject, session, batchId, institute } = data;

    // Validate required fields
    if (!date || !subject || !session || !institute) {
      return NextResponse.json({ message: "Invalid Input Data" }, { status: 400 });
    }

    // Verify institute exists
    const instituteDoc = await Institute.findById(institute);
    if (!instituteDoc) {
      return NextResponse.json({ message: "Institute not found" }, { status: 404 });
    }

    const attendanceDate = new Date(date);
    const startOfDay = new Date(Date.UTC(attendanceDate.getUTCFullYear(), attendanceDate.getUTCMonth(), attendanceDate.getUTCDate()));
    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

    const filter = {
      date: { $gte: startOfDay, $lt: endOfDay },
      subject,
      session,
      institute
    };

    if (batchId) {
      filter.batch = batchId;
    }

    const attendanceRecord = await Attendance.findOne(filter);

    if (!attendanceRecord) {
      return NextResponse.json({
        message: "No matching attendance record found",
        filter: filter
      }, { status: 404 });
    }

    // Delete the attendance record
    const deletedRecord = await Attendance.findByIdAndDelete(attendanceRecord._id);

    // Remove reference from Subject
    await Subject.findByIdAndUpdate(subject, {
      $pull: { reports: attendanceRecord._id }
    });

    return NextResponse.json({
      message: "Attendance Deleted Successfully",
      deletedRecord
    }, { status: 200 });

  } catch (error) {
    console.error("Error deleting attendance:", error);
    return NextResponse.json({
      error: "Failed to Delete Attendance",
      details: error.message
    }, { status: 500 });
  }
}