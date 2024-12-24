// // // Subject Dropdown API
// // import { NextResponse } from 'next/server';
// // import { connectMongoDB } from '@/lib/connectDb';
// // import Subject from '@/models/subject';

// // export async function GET(req) {
// //   try {
// //     const { searchParams } = new URL(req.url);
// //     const institute = searchParams.get("institute");
// //     const department = searchParams.get("department");
// //     const subType = searchParams.get("subType");
// //     const sem = searchParams.get("sem");
// //     const academicYear = searchParams.get("academicYear");
// //     const teacher = searchParams.get("facultyId");

// //     await connectMongoDB();

// //     // Validate institute
// //     if (!institute) {
// //       return NextResponse.json({ error: "Institute ID is required" }, { status: 400 });
// //     }

// //     // Construct dynamic filter
// //     const filter = { institute };

// //     // Optional filters
// //     if (department) filter.department = department;
// //     if (subType) filter.subType = subType;
// //     if (sem) filter.sem = sem;
// //     if (teacher) filter.teacher = teacher;
// //     if (academicYear) filter.academicYear = academicYear;

// //     // Fetch subjects with specified filters
// //     const subjects = await Subject.find(
// //       filter,
// //       '_id id name subType department sem academicYear'
// //     ).populate('teacher', 'name');

// //     if (!subjects || subjects.length === 0) {
// //       return NextResponse.json({ message: "No subjects found" }, { status: 404 });
// //     }

// //     // Transform data for dropdown
// //     const dropdownData = subjects.map(subject => ({
// //       value: subject._id,
// //       label: `${subject.name} (${subject.id}) - ${subject.subType} - ${subject.sem}`,
// //       type:subject.subType
// //     }));
// // console.log(dropdownData);

// //     return NextResponse.json(dropdownData,{status:200});
// //   } catch (error) {
// //     console.error("Error fetching subjects:", error);
// //     return NextResponse.json({ error: "Failed to fetch subjects" }, { status: 500 });
// //   }
// // }

// import { NextResponse } from 'next/server';
// import { connectMongoDB } from '@/lib/connectDb';
// import Subject from '@/models/subject';

// export async function GET(req) {
//   try {
//     const { searchParams } = new URL(req.url);
    
//     // Extract all possible filter parameters
//     const filterParams = {
//       institute: searchParams.get("institute"),
//       department: searchParams.get("department"),
//       subType: searchParams.get("subType"),
//       sem: searchParams.get("sem") || searchParams.get("semester"),
//       academicYear: searchParams.get("academicYear"),
//       teacher: searchParams.get("facultyId") || searchParams.get("teacher"),
//       class: searchParams.get("class")
//     };

//     await connectMongoDB();

//     // Validate institute
//     if (!filterParams.institute) {
//       return NextResponse.json({ error: "Institute ID is required" }, { status: 400 });
//     }

//     // Construct dynamic filter, removing undefined values
//     const filter  = Object.entries(filterParams)
//       .filter(([_, value]) => value !== null)
//       .reduce((acc, [key, value]) => {
//         // Special handling for specific fields
//         switch(key) {
//           case 'class':
//             acc['class'] = value;
//             break;
//           case 'teacher':
//             acc['teacher'] = value;
//             break;
//           default:
//             acc[key] = value;
//         }
//         return acc;
//       }, { institute: filterParams.institute });

//     // Fetch subjects with specified filters
//     const subjects = await Subject.find(filter)
//       .populate('teacher', 'name')
//       .populate('class', 'name')
//       .select('_id id name subType department sem academicYear');

//     if (!subjects || subjects.length === 0) {
//       return NextResponse.json({ message: "No subjects found" }, { status: 404 });
//     }

//     // Transform data for dropdown
//     const dropdownData = subjects.map(subject => ({
//       value: subject._id,
//       label: `${subject.name} (${subject.id}) - ${subject.subType || 'N/A'} - ${subject.sem || 'N/A'}`,
//       type: subject.subType
//     }));

//     return NextResponse.json(dropdownData, { status: 200 });
//   } catch (error) {
//     console.error("Error fetching subjects:", error);
//     return NextResponse.json({ error: "Failed to fetch subjects" }, { status: 500 });
//   }
// }
import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/connectDb';
import Subject from '@/models/subject';
import mongoose from 'mongoose';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    
    const facultyId = searchParams.get("facultyId") || searchParams.get("teacher");
    const institute = searchParams.get("institute");
    const classId = searchParams.get("class");
    
    if (!institute || (!facultyId && !classId)) {
      return NextResponse.json({ 
        error: "Institute ID and either Faculty ID or Class ID are required" 
      }, { status: 400 });
    }

    await connectMongoDB();

    // Convert string IDs to ObjectIds
    const instituteObjectId = new mongoose.Types.ObjectId(institute);
    
    // Base query with institute
    const query = {
      institute: instituteObjectId
    };

    // Handle faculty-based query
    if (facultyId) {
      const facultyObjectId = new mongoose.Types.ObjectId(facultyId);
      query.$or = [
        { subType: 'theory', teacher: facultyObjectId },
        { subType: { $in: ['practical', 'tg'] }, 'batchFaculties.faculty': facultyObjectId }
      ];
    }

    // Handle class-based query
    if (classId) {
      query.class = new mongoose.Types.ObjectId(classId);
      // Remove faculty-based conditions if we're querying by class
      delete query.$or;
    }

    // Add optional filters
    if (searchParams.get("department")) {
      query.department = searchParams.get("department");
    }
    if (searchParams.get("sem")) {
      query.sem = searchParams.get("sem");
    }
    if (searchParams.get("academicYear")) {
      query.academicYear = searchParams.get("academicYear");
    }

    console.log('Final Query:', JSON.stringify(query, null, 2));
    
    const subjects = await Subject.find(query)
      .populate('class', 'name batches')
      .populate('teacher', 'name')  // Add teacher population if needed
      .populate('batchFaculties.faculty', 'name')  // Add batch faculty population if needed
      .lean();

    console.log('Found subjects:', subjects.length);

    if (!subjects || subjects.length === 0) {
      return NextResponse.json({ 
        message: "No subjects found",
        query: query  // Include query for debugging
      }, { status: 404 });
    }

    const dropdownData = subjects.map(subject => ({
      value: subject._id.toString(),
      label: `${subject.name} (${subject.id}) - ${subject.subType} - ${subject.sem || 'N/A'}`,
      type: subject.subType,
      batches: subject.batch || [],
      batchFaculties: subject.batchFaculties?.map(bf => ({
        ...bf,
        faculty: typeof bf.faculty === 'object' ? {
          ...bf.faculty,
          _id: bf.faculty._id.toString()
        } : bf.faculty
      })) || [],
      subject: {
        ...subject,
        _id: subject._id.toString(),
        class: subject.class ? {
          ...subject.class,
          _id: subject.class._id.toString()
        } : null,
        teacher: subject.teacher ? {
          ...subject.teacher,
          _id: subject.teacher._id.toString()
        } : null
      }
    }));

    return NextResponse.json(dropdownData);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json({ 
      error: "Failed to fetch subjects",
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}