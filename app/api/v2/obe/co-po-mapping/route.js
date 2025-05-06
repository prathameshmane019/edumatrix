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

    if (!subject || !academicYear || !instituteId || !department) {
      return NextResponse.json(
        { success: false, message: "All query parameters are required" },
        { status: 400 }
      );
    }

    // Validate the parameters
    console.log("Incoming parameters:", {
      subject,
      academicYear,
      instituteId,
      department,
    });
    
    const courseOutcomeDoc = await CourseOutcome.findOne({
      subject,
      academicYear,
      institute: instituteId,
      department,
    }).populate("subject programOutcome");

    console.log("courseOutcomeDoc", courseOutcomeDoc);
    
    if (!courseOutcomeDoc) {
      return NextResponse.json(
        { success: false, message: "Course outcomes not found" },
        { status: 404 }
      );
    }

    const programOutcomeDoc = await ProgramOutcome.findById(courseOutcomeDoc.programOutcome);

    if (!programOutcomeDoc) {
      return NextResponse.json(
        { success: false, message: "Program outcome not found" },
        { status: 404 }
      );
    }

    const mappingMatrix = {
      courseOutcomes: courseOutcomeDoc.outcomes.map((co) => ({
        id: co.index.toString(),
        code: `CO${co.index}`,
        index: co.index,
        description: co.description,
        cognitiveLevel: co.cognitiveLevel,
      })),
      programOutcomes: {
        pos: programOutcomeDoc.programOutcomes.map((po) => ({
          id: po.index.toString(),
          index: po.index,
          description: po.description,
          type: "PO",
        })),
        psos: programOutcomeDoc.programSpecificOutcomes.map((pso) => ({
          id: pso.index.toString(),
          index: pso.index,
          description: pso.description,
          type: "PSO",
        })),
      },
      mappings: courseOutcomeDoc.outcomes.flatMap((co) =>
        (co.mappings || []).map((mapping) => ({
          courseOutcomeId: co.index.toString(),
          programOutcomeId: mapping.outcomeIndex.toString(),
          outcomeType: mapping.outcomeType,
          correlationLevel: mapping.correlationLevel,
          justification: mapping.justification || "",
        }))
      ),
    };

    return NextResponse.json(
      {
        success: true,
        data: {
          ...mappingMatrix,
          courseOutcomeId: courseOutcomeDoc._id,
          subjectName: courseOutcomeDoc.subject?.name || "",
          department,
          academicYear,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET mapping matrix:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    await connectMongoDB();
    const body = await req.json();

    if (!body.courseOutcomeId || !body.mappings) {
      return NextResponse.json(
        { success: false, message: "Course outcome ID and mappings are required" },
        { status: 400 }
      );
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const courseOutcome = await CourseOutcome.findById(body.courseOutcomeId).session(session);

      if (!courseOutcome) {
        throw new Error(`Course outcome ${body.courseOutcomeId} not found`);
      }

      const mappingsByCO = {};

      body.mappings.forEach((mapping) => {
        const coIndex = parseInt(mapping.courseOutcomeId);
        if (!mappingsByCO[coIndex]) {
          mappingsByCO[coIndex] = [];
        }
        if (mapping.correlationLevel > 0) {
          mappingsByCO[coIndex].push({
            outcomeType: mapping.outcomeType,
            outcomeIndex: parseInt(mapping.programOutcomeId),
            correlationLevel: mapping.correlationLevel,
            justification: mapping.justification || "",
          });
        }
      });

      courseOutcome.outcomes.forEach((co) => {
        co.mappings = mappingsByCO[co.index] || [];
      });

      if (body.userId) {
        courseOutcome.lastUpdatedBy = body.userId;
      }
      courseOutcome.version += 1;

      await courseOutcome.save({ session });
      await session.commitTransaction();

      return NextResponse.json(
        {
          success: true,
          message: "Mapping matrix updated successfully",
          stats: courseOutcome.mappingStats,
        },
        { status: 200 }
      );
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Error updating mapping matrix:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update mapping matrix",
        error: error.message,
      },
      { status: 500 }
    );
  }
}