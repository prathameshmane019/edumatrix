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
    
    if (!institute || !facultyId) {
      return NextResponse.json({ 
        error: "Institute ID and Faculty ID are required" 
      }, { status: 400 });
    }

    await connectMongoDB();

    // Convert string IDs to ObjectIds
    const facultyObjectId = new mongoose.Types.ObjectId(facultyId);
    const instituteObjectId = new mongoose.Types.ObjectId(institute);

    const query = {
      institute: instituteObjectId,
      $or: [
        // For theory subjects
        {
          subType: 'theory',
          teacher: facultyObjectId
        },
        // For practical/TG subjects
        {
          subType: { $in: ['practical', 'tg'] },
          'batchFaculties.faculty': facultyObjectId
        }
      ]
    };

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
    if (searchParams.get("class")) {
      query.class = new mongoose.Types.ObjectId(searchParams.get("class"));
    }

    const subjects = await Subject.find(query)
      .populate('class', 'name batches')
      .lean();

    if (!subjects || subjects.length === 0) {
      return NextResponse.json({ message: "No subjects found" }, { status: 404 });
    }

    const dropdownData = subjects.map(subject => ({
      value: subject._id.toString(),
      label: `${subject.name} (${subject.id}) - ${subject.subType} - ${subject.sem || 'N/A'}`,
      type: subject.subType,
      // Include all relevant data needed by the batch dropdown
      batches: subject.batch || [],
      batchFaculties: subject.batchFaculties || [],
      subject: {
        ...subject,
        _id: subject._id.toString(),
      }
    }));

    return NextResponse.json(dropdownData);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json({ error: "Failed to fetch subjects" }, { status: 500 });
  }
}