// app/api/v2/obe/co-po-mapping/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import CourseOutcome from "@/models/OBE/CourseOutcome";
import ProgramOutcome from "@/models/OBE/ProgramOutcome";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    await connectMongoDB();
    const url = new URL(req.url);
    const subject = url.searchParams.get("subject");
    const academicYear = url.searchParams.get("academicYear");
    const instituteId = url.searchParams.get("instituteId");
    const department = url.searchParams.get("department");

    if (!subject || !academicYear) {
      return NextResponse.json({ success: false, message: "Subject and academic year are required" }, { status: 400 });
    }

    // Find course outcomes for this subject and academic year
    const courseOutcomeDoc = await CourseOutcome.findOne({ 
      subject, 
      academicYear,
      institute: instituteId,
      department
    }).populate("subject programOutcome");

    if (!courseOutcomeDoc) {
      return NextResponse.json({ success: false, message: "Course outcomes not found" }, { status: 404 });
    }

    // Get the program outcome document
    const programOutcomeDoc = await ProgramOutcome.findById(courseOutcomeDoc.programOutcome);

    if (!programOutcomeDoc) {
      return NextResponse.json({ success: false, message: "Program outcome not found" }, { status: 404 });
    }

    // Format data according to frontend expectations
    const mappingMatrix = {
      courseOutcomes: courseOutcomeDoc.outcomes.map((co) => ({
        id: `${courseOutcomeDoc._id}-${co.index}`,
        code: `CO${co.index}`,
        index: co.index,
        description: co.description,
        cognitiveLevel: co.cognitiveLevel,
      })),
      programOutcomes: {
        pos: programOutcomeDoc.programOutcomes.map((po) => ({ 
          id: `PO-${po.index}`,
          index: po.index,
          description: po.description,
          type: "PO"
        })),
        psos: programOutcomeDoc.programSpecificOutcomes.map((pso) => ({ 
          id: `PSO-${pso.index}`,
          index: pso.index,
          description: pso.description,
          type: "PSO"
        })),
      },
      mappings: courseOutcomeDoc.mappings.map(mapping => ({
        courseOutcomeId: `${courseOutcomeDoc._id}-${mapping.outcomeIndex}`,
        programOutcomeId: mapping.outcomeType === "PO" ? `PO-${mapping.outcomeIndex}` : `PSO-${mapping.outcomeIndex}`,
        correlationLevel: mapping.correlationLevel,
      })),
      courseOutcomeId: courseOutcomeDoc._id
    };

    return NextResponse.json({ success: true, data: mappingMatrix }, { status: 200 });
  } catch (error) {
    console.error("Error in GET mapping matrix:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectMongoDB();
    const body = await req.json();

    if (!body.matrixData || !Array.isArray(body.matrixData)) {
      return NextResponse.json({ success: false, message: "Matrix data is required" }, { status: 400 });
    }

    // Ensure we have a courseOutcomeId to update
    if (!body.matrixData[0]?.courseOutcomeId) {
      return NextResponse.json({ success: false, message: "Course outcome ID is required" }, { status: 400 });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const courseOutcomeId = body.matrixData[0].courseOutcomeId.split('-')[0]; // Extract the actual ID
      const courseOutcome = await CourseOutcome.findById(courseOutcomeId).session(session);

      if (!courseOutcome) {
        throw new Error(`Course outcome ${courseOutcomeId} not found`);
      }

      // Clear existing mappings
      courseOutcome.mappings = [];

      // Process all mappings
      body.matrixData.forEach(row => {
        const coIndex = parseInt(row.courseOutcomeId.split('-')[1]);
        
        row.mappings.forEach(mapping => {
          if (mapping.correlationLevel > 0) {
            const [outcomeType, outcomeIndexStr] = mapping.programOutcomeId.split('-');
            const outcomeIndex = parseInt(outcomeIndexStr);
            
            courseOutcome.mappings.push({
              outcomeType,
              outcomeIndex,
              correlationLevel: mapping.correlationLevel
            });
          }
        });
      });

      await courseOutcome.save({ session });
      await session.commitTransaction();
      
      return NextResponse.json({ success: true, message: "Matrix updated successfully" }, { status: 200 });
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Error updating matrix:", error);
    return NextResponse.json({ success: false, message: "Failed to update mapping matrix", error: error.message }, { status: 500 });
  }
}