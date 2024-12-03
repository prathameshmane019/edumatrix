import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/connectDb';
import Classes from '@/models/className';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const institute = searchParams.get("institute");
    const year = searchParams.get("acadmicYear");
    const department = searchParams.get("selectedDepartment");
    await connectMongoDB();
    
    console.log(year,department,institute);
    let filter={}
    if (institute) filter.institute=institute
    if (year) filter.year=year
    if (department) filter.department=department
    // Validate instituteId
    if (!institute) {
      return NextResponse.json({ error: "Institute ID is required" }, { status: 400 });
    }

    // Fetch classes for the given institute
    const classes = await Classes.find(
      filter,
      '_id id year' // Select id, year, and department fields
    );

    if (!classes || classes.length === 0) {
      return NextResponse.json({ message: "No classes found for this institute" }, { status: 404 });
    }

    console.log(`Fetched ${classes.length} classes for institute ${institute}`);

    // Transform the data for dropdown menu
    const dropdownData = classes.map(cls => ({
      value: cls._id,
      label: `${cls.year} - ${cls.id}`
    }));

    return NextResponse.json(dropdownData);
  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
  }
}

