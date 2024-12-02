'use server'

import { connectMongoDB } from "@/lib/connectDb";
import Student from "@/models/student";
import Classes from "@/models/className";
import mongoose from "mongoose";

export async function promoteStudents(formData) {
  let session;
  try {
    await connectMongoDB();
    session = await mongoose.startSession();
    session.startTransaction();

    const sourceClassId = formData.get('sourceClassId') ;
    const targetClassId = formData.get('targetClassId') ;

    // Fetch source and target class details
    const [sourceClass, targetClass] = await Promise.all([
      Classes.findById(sourceClassId).session(session),
      Classes.findById(targetClassId).session(session)
    ]);

    if (!sourceClass || !targetClass) {
      throw new Error('One or both classes not found');
    }

    // Promote students to target class
    const result = await Student.updateMany(
      { class: sourceClassId },
      { 
        $set: { 
          class: targetClassId,
          year: targetClass.year,
          department: targetClass.department,
          academicYear: targetClass.academicYear
        } 
      },
      { session }
    );

    // Update the students array in both classes
    await Classes.findByIdAndUpdate(
      sourceClassId,
      { $pull: { students: { $in: result.modifiedCount } } },
      { session }
    );

    await Classes.findByIdAndUpdate(
      targetClassId,
      { $push: { students: { $each: result.modifiedCount } } },
      { session }
    );

    await session.commitTransaction();

    return {
      success: true,
      message: `Promoted ${result.modifiedCount} students to ${targetClass.name}`,
      count: result.modifiedCount
    };
  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    console.error("Error promoting students:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to promote students" 
    };
  } finally {
    if (session) {
      session.endSession();
    }
  }
}

