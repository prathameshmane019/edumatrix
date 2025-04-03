import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Student from "@/models/student";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const instituteId = searchParams.get("instituteId");
    const department = searchParams.get("department");
    const userRole = searchParams.get("userRole");
    const academicYear = searchParams.get("academicYear");

    if (!instituteId) {
      return NextResponse.json({ error: "Institute ID is required" }, { status: 400 });
    }

    const filter = { "academicDetails.institute": new mongoose.Types.ObjectId(instituteId) };

    if (userRole !== "superadmin" && department && department !== "all") {
      filter["academicDetails.department"] = department;
    } else if (userRole === "superadmin" && department && department !== "all") {
      filter["academicDetails.department"] = department;
    }

    if (academicYear) {
      const [startYear] = academicYear.split("-");
      filter["admission.admissionDate"] = {
        $gte: new Date(`${startYear}-04-01`),
        $lte: new Date(`${parseInt(startYear) + 1}-03-31`),
      };
    }

    const dashboardData = await getStudentDashboardMetrics(filter, userRole);

    return NextResponse.json(dashboardData, { status: 200 });
  } catch (error) {
    console.error("Error fetching student dashboard data:", error);
    return NextResponse.json({ error: "Failed to fetch student dashboard data" }, { status: 500 });
  }
}

async function getStudentDashboardMetrics(filter, userRole) {
  const students = await Student.find(filter)
    .select("personalDetails academicDetails admission parents")
    .lean();

  // Key Metrics
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.admission.status === "active").length;
  const suspendedStudents = students.filter((s) => s.admission.status === "suspended").length;
  const alumniStudents = students.filter((s) => s.admission.status === "alumni").length;

  // Status Distribution
  const statusDist = {
    active: activeStudents,
    suspended: suspendedStudents,
    alumni: alumniStudents,
  };
  const statusDistribution = Object.entries(statusDist).map(([status, count]) => ({
    status,
    count,
  }));

  // Department Distribution (superadmin only when no department filter)
  let departmentDistribution = [];
  if (userRole === "superadmin" && !filter["academicDetails.department"]) {
    const deptCounts = students.reduce((acc, s) => {
      const dept = s.academicDetails.department || "Unknown";
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});
    departmentDistribution = Object.entries(deptCounts).map(([dept, count]) => ({
      department: dept,
      count,
    }));
  }

  // Gender Distribution
  const genderDist = students.reduce((acc, s) => {
    const gender = s.personalDetails.gender || "Unknown";
    acc[gender] = (acc[gender] || 0) + 1;
    return acc;
  }, {});
  const genderDistribution = Object.entries(genderDist).map(([gender, count]) => ({
    gender,
    count,
  }));

  // Admission Category Distribution
  const categoryDist = students.reduce((acc, s) => {
    const category = s.admission.categoryType || "Unknown";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  const categoryDistribution = Object.entries(categoryDist).map(([category, count]) => ({
    category,
    count,
  }));

  // Average Age (based on dateOfBirth)
  const currentYear = new Date().getFullYear();
  const ageData = students
    .filter((s) => s.personalDetails.dateOfBirth)
    .map((s) => ({
      name: s.personalDetails.name,
      age: currentYear - new Date(s.personalDetails.dateOfBirth).getFullYear(),
    }));
  const avgAge =
    ageData.length > 0 ? Math.round(ageData.reduce((sum, s) => sum + s.age, 0) / ageData.length) : 0;

  return {
    totalStudents,
    activeStudents,
    suspendedStudents,
    alumniStudents,
    statusDistribution,
    departmentDistribution,
    genderDistribution,
    categoryDistribution,
    avgAge,
  };
}