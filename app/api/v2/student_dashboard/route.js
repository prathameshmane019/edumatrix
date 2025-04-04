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

    // Base filter - always filter by institute
    const filter = { "academicDetails.institute": new mongoose.Types.ObjectId(instituteId) };

    // Handle department filtering based on role
    if (department && department !== "all") {
      filter["academicDetails.department"] = department;
    }

    // Apply academic year filter if provided
    if (academicYear) {
      const [startYear] = academicYear.split("-");
      const startDate = new Date(`${startYear}-04-01`);
      const endDate = new Date(`${parseInt(startYear) + 1}-03-31`);
      
      filter["admission.admissionDate"] = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    // Get metrics based on filter and role
    const dashboardData = await getStudentDashboardMetrics(filter, userRole);

    return NextResponse.json(dashboardData, { status: 200 });
  } catch (error) {
    console.error("Error fetching student dashboard data:", error);
    return NextResponse.json({ error: "Failed to fetch student dashboard data" }, { status: 500 });
  }
}

async function getStudentDashboardMetrics(filter, userRole) {
  // Get all student data based on filters
  const students = await Student.find(filter)
    .select("personalDetails academicDetails admission parents")
    .populate("academicDetails.class", "name")
    .lean();

  // Key Metrics
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.admission?.status === "active").length;
  const suspendedStudents = students.filter((s) => s.admission?.status === "suspended").length;
  const alumniStudents = students.filter((s) => s.admission?.status === "alumni").length;

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

  // Department Distribution (only for superadmin)
  let departmentDistribution = [];
  if (userRole === "superadmin" && !filter["academicDetails.department"]) {
    const deptCounts = students.reduce((acc, s) => {
      const dept = s.academicDetails?.department || "Unknown";
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});
    departmentDistribution = Object.entries(deptCounts)
      .map(([dept, count]) => ({ department: dept, count }))
      .sort((a, b) => b.count - a.count); // Sort by count in descending order
  }

  // Class Distribution - New
  const classCounts = students.reduce((acc, s) => {
    const className = s.academicDetails?.class?.name || "Unassigned";
    acc[className] = (acc[className] || 0) + 1;
    return acc;
  }, {});
  
  const classDistribution = Object.entries(classCounts)
    .map(([className, count]) => ({ className, count }))
    .sort((a, b) => b.count - a.count);

  // Gender Distribution
  const genderDist = students.reduce((acc, s) => {
    const gender = s.personalDetails?.gender || "Unknown";
    acc[gender] = (acc[gender] || 0) + 1;
    return acc;
  }, {});
  const genderDistribution = Object.entries(genderDist).map(([gender, count]) => ({
    gender,
    count,
  }));

  // Admission Category Distribution
  const categoryDist = students.reduce((acc, s) => {
    const category = s.admission?.categoryType || "Unknown";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  const categoryDistribution = Object.entries(categoryDist)
    .map(([category, count]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1), // Capitalize
      count,
    }))
    .sort((a, b) => b.count - a.count);

  // Monthly Admissions Trend (for current academic year)
  const admissionTrend = students.reduce((acc, s) => {
    if (s.admission?.admissionDate) {
      const date = new Date(s.admission.admissionDate);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      acc[monthYear] = (acc[monthYear] || 0) + 1;
    }
    return acc;
  }, {});
  
  const monthlyAdmissions = Object.entries(admissionTrend)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => {
      const [aMonth, aYear] = a.month.split('/').map(Number);
      const [bMonth, bYear] = b.month.split('/').map(Number);
      return (aYear - bYear) || (aMonth - bMonth);
    });

  // Average Age
  const currentYear = new Date().getFullYear();
  const ageData = students
    .filter((s) => s.personalDetails?.dateOfBirth)
    .map((s) => {
      const birthDate = new Date(s.personalDetails.dateOfBirth);
      const age = currentYear - birthDate.getFullYear();
      return {
        name: s.personalDetails.name,
        age,
      };
    });
    
  const avgAge = ageData.length > 0 
    ? Math.round(ageData.reduce((sum, s) => sum + s.age, 0) / ageData.length) 
    : 0;

  return {
    totalStudents,
    activeStudents,
    suspendedStudents,
    alumniStudents,
    statusDistribution,
    departmentDistribution,
    classDistribution,      // New: Class-wise distribution
    genderDistribution,
    categoryDistribution,
    monthlyAdmissions,      // New: Monthly admission trend
    avgAge,
  };
}