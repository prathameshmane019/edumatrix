import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Subject from "@/models/subject";

export async function GET(req) {
    try {
      const { searchParams } = new URL(req.url);
      const institute = searchParams.get("institute");
      const subject = searchParams.get("subject");
  
      await connectMongoDB();
  
      // Validate institute
      if (!institute) {
        return NextResponse.json({ error: "Institute ID is required" }, { status: 400 });
      }
  
      // Find subjects with batches
      const filter = { 
        institute,
        batch: { $exists: true, $not: { $size: 0 } } 
      };
  
      if (subject) {
        filter._id = subject;
      }
  
      const subjects = await Subject.find(filter, 'batch');
  
      // Aggregate unique batches
      const uniqueBatches = [...new Set(subjects.flatMap(s => s.batch))];
  
      if (!uniqueBatches || uniqueBatches.length === 0) {
        return NextResponse.json({ message: "No batches found" }, { status: 404 });
      }
  
      // Transform data for dropdown
      const dropdownData = uniqueBatches.map(batch => ({
        value: batch,
        label: `Batch ${batch}`
      }));
  
      return NextResponse.json(dropdownData);
    } catch (error) {
      console.error("Error fetching batches:", error);
      return NextResponse.json({ error: "Failed to fetch batches" }, { status: 500 });
    }
  }