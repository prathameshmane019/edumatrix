// import { NextResponse } from "next/server";
// import { connectMongoDB } from "@/lib/connectDb";
// import Subject from "@/models/subject";
// import Classes from "@/models/className";

// export async function GET(req) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const institute = searchParams.get("institute");
//     const subject = searchParams.get("subject");
//     const selectedClass = searchParams.get("selectedClass");

//     await connectMongoDB();

//     // Validate institute
//     if (!institute) {
//       return NextResponse.json({ error: "Institute ID is required" }, { status: 400 });
//     }

//     let uniqueBatches = [];

//     // If subject ID is provided, fetch batches from Subject model
//     if (subject) {
//       const subjects = await Subject.find({
//         institute,
//         _id: subject,
//         batch: { $exists: true, $not: { $size: 0 } }
//       }, 'batch');

//       uniqueBatches = [...new Set(subjects.flatMap(s => s.batch))];
//     }

//     // If class ID is provided, fetch batches from Classes model
//     if (selectedClass) {
//       const classData = await Classes.findOne({
//         institute,
//         _id: selectedClass,
//         'batches': { $exists: true, $not: { $size: 0 } }
//       }, 'batches');

//       if (classData && classData.batches) {
//         // Extract batch IDs from the batches array
//         const classBatches = classData.batches.map(batch => batch.id);
//         uniqueBatches = [...new Set([...uniqueBatches, ...classBatches])];
//       }
//     }

//     if (!uniqueBatches || uniqueBatches.length === 0) {
//       return NextResponse.json({ message: "No batches found" }, { status: 404 });
//     }

//     // Transform data for dropdown
//     const dropdownData = uniqueBatches.map(batch => ({
//       value: batch,
//       label: `Batch ${batch}`
//     }));

//     return NextResponse.json(dropdownData);
//   } catch (error) {
//     console.error("Error fetching batches:", error);
//     return NextResponse.json({ error: "Failed to fetch batches" }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Subject from "@/models/subject";
import Classes from "@/models/className";
import mongoose from 'mongoose';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const institute = searchParams.get("institute");
    const subject = searchParams.get("subject");
    const selectedClass = searchParams.get("selectedClass");
    const facultyId = searchParams.get("facultyId");

    await connectMongoDB();

    if (!institute) {
      return NextResponse.json({ error: "Institute ID is required" }, { status: 400 });
    }

    let uniqueBatches = [];

    // If subject ID is provided, fetch batches
    if (subject) {
      const subjectDoc = await Subject.findOne({
        institute,
        _id: subject
      });

      if (subjectDoc) {
        if (subjectDoc.subType === 'theory') {
          // For theory subjects, use all batches
          uniqueBatches = subjectDoc.batch || [];
        } else {
          // For practical/TG subjects, only use batches assigned to this faculty
          if (facultyId) {
            const facultyBatches = subjectDoc.batchFaculties
              .filter(bf => bf.faculty.toString() === facultyId)
              .map(bf => bf.batchId);
            uniqueBatches = facultyBatches;
          }
        }
      }
    }

    // If class ID is provided, fetch batches from Classes model
    if (selectedClass) {
      const classData = await Classes.findOne({
        institute,
        _id: selectedClass,
        'batches': { $exists: true, $not: { $size: 0 } }
      });

      if (classData && classData.batches) {
        const classBatches = classData.batches.map(batch => batch.id);
        // Merge with existing batches if any
        uniqueBatches = [...new Set([...uniqueBatches, ...classBatches])];
      }
    }

    if (!uniqueBatches || uniqueBatches.length === 0) {
      return NextResponse.json({ message: "No batches found" }, { status: 404 });
    }

    // Transform data for dropdown
    const dropdownData = uniqueBatches.map(batch => ({
      value: batch,
      label: `Batch ${batch}`
    }));

    return NextResponse.json(dropdownData);
  } catch (error) {
    console.error("Error fetching batches:", error);
    return NextResponse.json({ error: "Failed to fetch batches" }, { status: 500 });
  }
}