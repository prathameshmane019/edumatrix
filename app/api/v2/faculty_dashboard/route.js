import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Faculty from "@/models/faculty";
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

    const filter = { institute: new mongoose.Types.ObjectId(instituteId) };

    if (userRole !== "superadmin" && department && department !== "all") {
      filter.department = department;
    } else if (userRole === "superadmin" && department && department !== "all") {
      filter.department = department;
    }

    if (academicYear) {
      filter.currentYear = academicYear; // Filter by currentYear field
    }

    const dashboardData = await getFacultyDashboardMetrics(filter, userRole);

    return NextResponse.json(dashboardData, { status: 200 });
  } catch (error) {
    console.error("Error fetching faculty dashboard data:", error);
    return NextResponse.json({ error: "Failed to fetch faculty dashboard data" }, { status: 500 });
  }
}

async function getFacultyDashboardMetrics(filter, userRole) {
  const faculties = await Faculty.find(filter)
    .select("name department employmentType designation currentYear sem education dateOfJoining")
    .lean();

  // Key Metrics
  const totalFaculty = faculties.length;
  const teachingFaculty = faculties.filter((f) => f.employmentType === "teaching").length;
  const nonTeachingFaculty = faculties.filter((f) => f.employmentType === "non-teaching").length;

  // Employment Type Distribution
  const employmentTypeDist = {
    teaching: teachingFaculty,
    "non-teaching": nonTeachingFaculty,
  };
  const employmentTypeDistribution = Object.entries(employmentTypeDist).map(([type, count]) => ({
    type,
    count,
  }));

  // Department Distribution (for superadmin only when no department filter)
  let departmentDistribution = [];
  if (userRole === "superadmin" && !filter.department) {
    const deptCounts = faculties.reduce((acc, f) => {
      const dept = f.department || "Unknown";
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});
    departmentDistribution = Object.entries(deptCounts).map(([dept, count]) => ({
      department: dept,
      count,
    }));
  }

  // Designation Distribution
  const designationDist = faculties.reduce((acc, f) => {
    const designation = f.designation || "Unknown";
    acc[designation] = (acc[designation] || 0) + 1;
    return acc;
  }, {});
  const designationDistribution = Object.entries(designationDist).map(([designation, count]) => ({
    designation,
    count,
  }));

  // Average Experience (years since dateOfJoining)
  const currentYear = new Date().getFullYear();
  const experienceData = faculties
    .filter((f) => f.dateOfJoining)
    .map((f) => ({
      name: f.name,
      yearsOfExperience: currentYear - new Date(f.dateOfJoining).getFullYear(),
    }));
  const avgExperience =
    experienceData.length > 0
      ? Math.round(experienceData.reduce((sum, f) => sum + f.yearsOfExperience, 0) / experienceData.length)
      : 0;

  // Education Level Distribution
  const educationDist = faculties.reduce((acc, f) => {
    const degree = f.education?.highestDegree || "Unknown";
    acc[degree] = (acc[degree] || 0) + 1;
    return acc;
  }, {});
  const educationDistribution = Object.entries(educationDist).map(([degree, count]) => ({
    degree,
    count,
  }));

  return {
    totalFaculty,
    teachingFaculty,
    nonTeachingFaculty,
    employmentTypeDistribution,
    departmentDistribution,
    designationDistribution,
    avgExperience,
    educationDistribution,
  };
}