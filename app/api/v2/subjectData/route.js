import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Subject from "@/models/subject";
import Classes from "@/models/className";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const department = searchParams.get("department");
        const academicYear = searchParams.get("academicYear"); // Fixed spelling
        const sem = searchParams.get("sem");
        const batchId = searchParams.get("batchId"); // Optional query parameter for filtering by batch
        const subjectId = searchParams.get("_id"); // Optional query parameter for filtering by subject ID
        const classId = searchParams.get("class"); // Optional query parameter for filtering by subject ID
 
        // Construct filters for Subject query
        let subjectFilter = {};
        if (department) subjectFilter.department = department;
        if (sem) subjectFilter.sem = sem;
        if (academicYear) subjectFilter.academicYear = academicYear;
        if (subjectId) subjectFilter._id = subjectId;
        if (classId) subjectFilter.class = classId;

        // Connect to the database
        await connectMongoDB();

        const selectFields = {
            id: 1,
            name: 1,
            subType: 1,
            teacher: 1,
            batch: 1,
            department: 1,
            institute: 1,
            sem: 1,
            academicYear: 1,
            class: 1,
            batchFaculties: 1
          };
        // Fetch subjects based on filter
        const subjects = await Subject.find(subjectFilter).select(selectFields)
        .populate('class', 'id')
        .populate('teacher', 'name')
        .populate('batchFaculties.faculty', 'name')
        .lean();

        // Fetch classes associated with the department and active status
        // const classFilter = {};
        // if (department) classFilter.department = department;

        // const classes = await Classes.find(classFilter).select("_id batches._id");

        // // If a batch ID is provided, filter associated students and teachers
        // let students = [];
        // let teachers = [];
        // if (batchId) {
        //     const selectedClass = await Classes.findOne({ "batches._id": batchId }).select("batches.students batches.teachers");
        //     const batch = selectedClass?.batches?.find(b => b._id.toString() === batchId);

        //     if (batch) {
        //         students = batch.students;
        //         teachers = batch.teachers;
        //     }
        // // }

        // console.log(subjects, classes);

        // Respond with subjects, classes, students, and teachers
        return NextResponse.json(
            { subjects },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching subjects and related data:", error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}
