import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Subject from "@/models/subject";
import Classes from "@/models/className";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const department = searchParams.get("department");
        const year = searchParams.get("acadmicYear");
        const sem = searchParams.get("sem");
        console.log(sem,year);
        
        let filter = {};
        if (department) filter.department = department;
        if (sem) filter.sem = sem;
        if (year) filter.academicYear = year;

      await connectMongoDB();
      const subjects = await Subject.find(filter).select("_id name class teacher subType batch isActive");
      const classes = await Classes.find({department, isActive: true}).select('_id batches._id');
      console.log(subjects, classes);
        return NextResponse.json({ subjects ,classes}, { status: 200 });
    } catch (error) {
        console.error("Error fetching subjects and teachers:", error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}
