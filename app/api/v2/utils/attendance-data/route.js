import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Subject from "@/models/subject";
import Classes from "@/models/className";
import Student from "@/models/student";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const subjectId = searchParams.get("subjectId");
  const selectedBatchId = searchParams.get("batchId");

  if (!subjectId) {
    return NextResponse.json({ error: "Subject ID is required" }, { status: 400 });
  }

  try {
    await connectMongoDB();
    let subject = null;
    let students = [];

    subject = await Subject.findById(subjectId).lean();
    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    if (subject.subType === 'practical' || subject.subType === 'tg') {
      if (selectedBatchId) {
        const classDoc = await Classes.findById(subject.class).lean();
        if (classDoc) {
          const selectedBatch = classDoc.batches.find(batch => batch._id.toString() === selectedBatchId);
          if (selectedBatch) {
            students = await Student.find({
              _id: { $in: selectedBatch.students },
              subjects: subjectId
            }).select('_id rollNumber name').lean();
          }
        }
      }
    } else {
      students = await Student.find({ class: subject.class, subjects: subjectId })
        .select('_id rollNumber name').lean();
    }

    // Include content for non-TG subjects
    if (subject.subType !== 'tg') {
      subject.content = subject.content || [];
    }

    // Include TG sessions for TG subjects
    if (subject.subType === 'tg') {
      subject.tgSessions = subject.tgSessions || [];
    }

    return NextResponse.json({ 
      subject, 
      students,
      message: "Data fetched successfully"
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    return NextResponse.json({ error: "Failed to fetch data", details: error.message }, { status: 500 });
  }
}

