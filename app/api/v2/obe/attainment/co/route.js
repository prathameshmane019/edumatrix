import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Assessment from "@/models/OBE/Assessment";
import CourseOutcome from "@/models/OBE/CourseOutcome";

export async function GET(req) {
  try {
    await connectMongoDB();
    const url = new URL(req.url);
    const subject = url.searchParams.get("subject");
    const academicYear = url.searchParams.get("academicYear");
    const sem = url.searchParams.get("sem");
    const instituteId = url.searchParams.get("instituteId");
    const department = url.searchParams.get("department");
    const coThreshold = parseFloat(url.searchParams.get("coThreshold")) || 60;
    const coTarget = parseFloat(url.searchParams.get("coTarget")) || 70;

    if (!subject || !academicYear || !instituteId || !department) {
      return NextResponse.json(
        { success: false, message: "subject, academicYear, instituteId, and department are required" },
        { status: 400 }
      );
    }

    const query = { subject, academicYear };
    if (sem) query.sem = sem;

    const assessments = await Assessment.find(query).lean();
    const courseOutcome = await CourseOutcome.findOne({
      subject,
      academicYear,
      institute: instituteId,
      department
    }).lean();

    if (!assessments.length || !courseOutcome) {
      return NextResponse.json(
        { success: false, message: "No assessments or course outcomes found" },
        { status: 404 }
      );
    }

    const coAttainment = courseOutcome.outcomes.map(co => {
      let totalStudents = 0;
      let studentsMet = 0;
      let totalMaxMarks = 0;

      assessments.forEach(assessment => {
        const coMapping = assessment.coMapping.find(cm => cm.coIndex === co.index);
        if (!coMapping) return;

        const threshold = (coMapping.maxMarks * coThreshold) / 100;
        totalMaxMarks += coMapping.maxMarks;

        assessment.studentMarks.forEach(student => {
          const coMark = student.coMarks.find(cm => cm.coIndex === co.index);
          if (coMark && coMark.marks >= threshold) {
            studentsMet++;
          }
        });
        totalStudents += assessment.studentMarks.length;
      });

      const attainmentLevel = totalStudents > 0 ? (studentsMet / totalStudents) * 100 : 0;
      return {
        coCode: `CO${co.index}`,
        coDescription: co.description,
        attainmentLevel: Number(attainmentLevel.toFixed(2)),
        isAttained: attainmentLevel >= coTarget,
        targetPercentage: coTarget,
        studentsMet,
        totalStudents,
        scoreThreshold: coThreshold
      };
    });

    return NextResponse.json(
      { success: true, data: coAttainment },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error calculating CO attainment:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}