import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Assessment from "@/models/OBE/Assessment";
import CourseOutcome from "@/models/OBE/CourseOutcome";
import ProgramOutcome from "@/models/OBE/ProgramOutcome";

const CORRELATION_WEIGHTS = { 1: 0.33, 2: 0.67, 3: 1.0 };

export async function GET(req) {
  try {
    await connectMongoDB();
    const url = new URL(req.url);
    const subject = url.searchParams.get("subject");
    const academicYear = url.searchParams.get("academicYear");
    const sem = url.searchParams.get("sem");
    const department = url.searchParams.get("department");
    const instituteId = url.searchParams.get("instituteId");
    const coThreshold = parseFloat(url.searchParams.get("coThreshold")) || 60;
    const coTarget = parseFloat(url.searchParams.get("coTarget")) || 70;

    if (!subject || !academicYear || !department || !instituteId) {
      return NextResponse.json(
        { success: false, message: "subject, academicYear, department, and instituteId are required" },
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
    const poPso = await ProgramOutcome.findOne({
      department,
      academicYear,
      institute: instituteId
    }).lean();

    if (!assessments.length || !courseOutcome || !poPso) {
      return NextResponse.json(
        { success: false, message: "No assessments, course outcomes, or PO/PSO data found" },
        { status: 404 }
      );
    }

    const coAttainment = courseOutcome.outcomes.map(co => {
      let totalStudents = 0;
      let studentsMet = 0;

      assessments.forEach(assessment => {
        const coMapping = assessment.coMapping.find(cm => cm.coIndex === co.index);
        if (!coMapping) return;

        const threshold = (coMapping.maxMarks * coThreshold) / 100;
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
        attainmentLevel: Number(attainmentLevel.toFixed(2))
      };
    });

    const poList = [
      ...(poPso.programOutcomes || []).map(po => ({ type: 'PO', index: po.index, description: po.description })),
      ...(poPso.programSpecificOutcomes || []).map(pso => ({ type: 'PSO', index: pso.index, description: pso.description }))
    ];

    const poAttainment = poList.map(po => {
      let weightedSum = 0;
      let totalWeight = 0;

      courseOutcome.outcomes.forEach(co => {
        const mapping = co.mappings.find(m => 
          m.outcomeType === po.type && m.outcomeIndex === po.index
        );
        if (mapping) {
          const coAttain = coAttainment.find(ca => ca.coCode === `CO${co.index}`);
          if (coAttain) {
            const weight = CORRELATION_WEIGHTS[mapping.correlationLevel] || 0;
            weightedSum += coAttain.attainmentLevel * weight;
            totalWeight += weight;
          }
        }
      });

      const attainmentLevel = totalWeight > 0 ? (weightedSum / totalWeight) : 0;
      return {
        poCode: `${po.type}${po.index}`,
        description: po.description,
        attainmentLevel: Number(attainmentLevel.toFixed(2)),
        isAttained: attainmentLevel >= coTarget,
        targetPercentage: coTarget
      };
    }).filter(pa => pa.attainmentLevel > 0);

    return NextResponse.json(
      { success: true, data: poAttainment },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error calculating PO attainment:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}