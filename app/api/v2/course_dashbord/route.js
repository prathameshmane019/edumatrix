import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Classes from "@/models/className";
import Student from "@/models/student";
import Faculty from "@/models/faculty";
import Subject from "@/models/subject";
import mongoose from "mongoose";

export async function GET(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const instituteId = searchParams.get("instituteId");
        const department = searchParams.get("department");
        const academicYear = searchParams.get("academicYear");
        
        if (!instituteId) {
            return NextResponse.json({ error: "Institute ID is required" }, { status: 400 });
        }

        // Create filter for dashboard data
        const filter = { institute: new mongoose.Types.ObjectId(instituteId) };
        
        // Only add department filter if a specific department is requested (not 'all')
        if (department && department !== 'all') {
            filter.department = department;
        }
       
        // Get metrics for dashboard
        const dashboardData = await getDashboardMetrics(filter, instituteId,academicYear);
        
        return NextResponse.json(dashboardData, { status: 200 });
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
    }
}

async function getDashboardMetrics(filter, instituteId,academicYear) {
    // Get class data with minimal information
    const classes = await Classes.find({...filter,year:academicYear})
        .select('id year department students batches')
        .lean();
    
    // Calculate total students (all unique student IDs across all classes)
    const allStudentIds = classes.flatMap(cls => cls.students || []);
    const uniqueStudentIds = [...new Set(allStudentIds)];
    
    // Get subject data with minimal information
    const subjects = await Subject.find({
        ...filter,
        class: { $in: classes.map(cls => cls._id) },academicYear
    })
    .select('id name subType sem academicYear content')
    .lean();
    
    // Calculate subject statistics
    const theoryCourses = subjects.filter(sub => sub.subType === 'theory').length;
    const practicalCourses = subjects.filter(sub => sub.subType === 'practical').length;
    const tgCourses = subjects.filter(sub => sub.subType === 'tg').length;
    
    // Get all batch data across classes
    const allBatches = classes.flatMap(cls => cls.batches || []);
    
    // Content completion statistics
    const contentItems = subjects.flatMap(sub => sub.content || []);
    const completedContent = contentItems.filter(item => item.status === 'covered').length;
    const totalContent = contentItems.length;
    const contentCompletion = totalContent > 0 ? Math.round((completedContent / totalContent) * 100) : 0;
    
    // Get faculty count based on filter
    const facultyCount = await Faculty.countDocuments(filter);
    
    // Class distribution by department - get all departments if viewing "all"
    let departmentDistribution = [];
    
    if (!filter.department) {
        // If no department filter (viewing all), get distribution
        const departmentCounts = {};
        classes.forEach(cls => {
            const dept = cls.department;
            if (dept) {
                departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
            }
        });
        
        departmentDistribution = Object.entries(departmentCounts).map(([dept, count]) => ({
            department: dept,
            count: count
        }));
    }
    
    // Get students per class
    const studentsPerClass = classes.map(cls => ({
        classId: cls.id,
        count: cls.students ? cls.students.length : 0
    }));
    
    // Get subjects per semester
    const sem1Subjects = subjects.filter(sub => sub.sem === 'sem1').length;
    const sem2Subjects = subjects.filter(sub => sub.sem === 'sem2').length;
    
    return {
        totalClasses: classes.length,
        totalStudents: uniqueStudentIds.length,
        totalSubjects: subjects.length,
        subjectTypes: {
            theory: theoryCourses,
            practical: practicalCourses,
            tg: tgCourses
        },
        totalBatches: allBatches.length,
        contentCompletionPercentage: contentCompletion,
        facultyCount: facultyCount,
        departmentDistribution: departmentDistribution,
        studentsPerClass: studentsPerClass,
        semesterDistribution: {
            sem1: sem1Subjects,
            sem2: sem2Subjects
        }
    };
}