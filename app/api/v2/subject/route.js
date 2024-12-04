// // import { NextResponse } from "next/server";
// // import { connectMongoDB } from "@/lib/connectDb";
// // import Subject from "@/models/subject";
// // import Classes from "@/models/className";

// // export async function GET(req) {
// //     try {
// //         const { searchParams } = new URL(req.url);
// //         const department = searchParams.get("department");
// //         const year = searchParams.get("acadmicYear");
// //         const sem = searchParams.get("sem");
// //         console.log(sem, year);

// //         let filter = {};
// //         if (department) filter.department = department;
// //         if (sem) filter.sem = sem;
// //         if (year) filter.academicYear = year;

// //         await connectMongoDB();
// //         const subjects = await Subject.find(filter).select("_id subCode name class teacher subType batch isActive");
// //         const classes = await Classes.find({department, isActive: true}).select('_id batches._id');
// //         console.log(subjects, classes);
// //         return NextResponse.json({ subjects, classes }, { status: 200 });
// //     } catch (error) {
// //         console.error("Error fetching subjects and teachers:", error);
// //         return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
// //     }
// // }

// // export async function POST(request) {
// //     try {
// //         const { subCode, name, class: classId, teacher, department, subType, batch, sem, academicYear, instituteId } = await request.json();

// //         if (!department || !instituteId) {
// //             return NextResponse.json({error: "department or instituteId is missing"});
// //         }

// //         await connectMongoDB();
// //         const newSubject = new Subject({
// //             subCode,
// //             name,
// //             class: classId,
// //             teacher,
// //             department,
// //             subType,
// //             batch: subType === 'practical' || subType === 'tg' ? batch : undefined,
// //             sem,
// //             academicYear,
// //             instituteId
// //         });

// //         await newSubject.save();
// //         return NextResponse.json({ message: 'Subject created successfully', subject: newSubject }, { status: 201 });
// //     } catch (error) {
// //         console.log(error);
// //         return NextResponse.json({ error: 'Error creating subject' }, { status: 500 });
// //     }
// // }

// // export async function PUT(request) {
// //     try {
// //         const { _id, subCode, name, class: classId, teacher, department, subType, batch, sem, academicYear, instituteId } = await request.json();

// //         if(!department || !instituteId){
// //             console.log("department or instituteId is missing", department, instituteId);
// //             return NextResponse.json({error: "department or instituteId is missing"});
// //         }

// //         await connectMongoDB();
// //         const updatedSubject = await Subject.findByIdAndUpdate(
// //             _id,
// //             {
// //                 subCode,
// //                 name,
// //                 class: classId,
// //                 teacher,
// //                 department,
// //                 subType,
// //                 batch: subType === 'practical' || subType === 'tg' ? batch : undefined,
// //                 sem,
// //                 academicYear,
// //                 instituteId
// //             },
// //             { new: true }
// //         );

// //         return NextResponse.json({ message: 'Subject updated successfully', subject: updatedSubject }, { status: 200 });
// //     } catch (error) {
// //         console.log(error);
// //         return NextResponse.json({ error: 'Error updating subject' }, { status: 500 });
// //     }
// // }

// // export async function DELETE(request) {
// //     try {
// //         await connectMongoDB();
// //         const { searchParams } = new URL(request.url);
// //         const id = searchParams.get("_id");
// //         await Subject.findByIdAndDelete(id);
// //         return NextResponse.json({ message: "Subject deleted successfully" }, { status: 200 });
// //     } catch (error) {
// //         console.log(error);
// //         return NextResponse.json({ error: 'Failed to delete subject' }, { status: 500 });
// //     }
// // }

// import { NextResponse } from "next/server";
// import { connectMongoDB } from "@/lib/connectDb";
// import Subject from "@/models/subject";
// import Classes from "@/models/className";
// import Faculty from "@/models/faculty";
// import Student from "@/models/student";
// import Attendance from "@/models/attendance";
// import Institute from "@/models/Institute";

// export async function GET(request) {
//   const { searchParams } = new URL(request.url);
//   const subjectId = searchParams.get("_id");
//   const selectedBatchId = searchParams.get("batchId");
//   const classId = searchParams.get("classId");
//   const academicYear = searchParams.get("academicYear");
//   const sem = searchParams.get("sem");

//   try {
//     await connectMongoDB();
//     let subjects = [];
//     let batches = [];
//     let students = [];

//     // Query construction with new schema fields
//     const query = {};
//     if (subjectId) query._id = subjectId;
//     if (classId) query.class = classId;
//     if (academicYear) query.academicYear = academicYear;
//     if (sem) query.sem = sem;
//     let subject
//     if (subjectId) {
//       subject = await Subject.findById(subjectId)
//         .populate('class', 'name')
//         .populate('teacher', 'name')
//         .populate('institute', 'name')
//         .lean();

//       if (subject) {
//         if (subject.subType === "practical") {
//           const classDoc = await Classes.findById(subject.class).populate("batches").lean();
//           if (classDoc && classDoc.batches) {
//             batches = classDoc.batches.map((batch) => batch._id);

//             if (selectedBatchId) {
//               const selectedBatch = classDoc.batches.find(
//                 (batch) => batch._id.toString() === selectedBatchId
//               );

//               if (selectedBatch) {
//                 students = await Student.find({
//                   _id: { $in: selectedBatch.students },
//                   class: subject.class,
//                 })
//                   .select("_id rollNumber name")
//                   .lean();
//               }
//             }
//           }
//         } else if (subject.subType === "theory") {
//           students = await Student.find({
//             class: subject.class
//           })
//             .select("_id rollNumber name")
//             .lean();
//         }
//       }
//     } else {
//       // Fetch subjects with optional filtering
//       subjects = await Subject.find(query)
//         .populate('class', 'name')
//         .populate('teacher', 'name')
//         .populate('institute', 'name')
//         .lean();

//     }

//     const teachers = await Faculty.find().select("_id name").lean();
//     const institutes = await Institute.find().select("_id name").lean();

//     console.log(subject, subjects);

//     return NextResponse.json({
//       subject: subjectId ? subject : subjects,
//       batches,
//       students,
//       teachers,
//       institutes
//     }, { status: 200 });
//   } catch (error) {
//     console.error("Error fetching subjects:", error);
//     return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
//   }
// }

// export async function POST(request) {
//   try {
//     await connectMongoDB();
//     const data = await request.json();
//     const {
//       id,
//       name,
//       subType,
//      classId,
//       teacher,
//       batch,
//       department,
//       institute,
//       content,
//       tgSessions,
//       sem,
//       academicYear
//     } = data;

//     const newSubject = new Subject({
//       id,
//       name,
//       subType,
//       class: classId,
//       teacher,
//       batch: subType === "practical" ? batch : undefined,
//       department,
//       institute,
//       content: subType !== "tg" ? content : undefined,
//       tgSessions: subType === "tg" ? tgSessions : undefined,
//       sem,
//       academicYear
//     });

//     await newSubject.save();
    
//     await Classes.findByIdAndUpdate(classId, {
//       $addToSet: { [`subjects.${sem}`]: newSubject._id }
//     });

//     if (teacher) {
//       await Faculty.findByIdAndUpdate(teacher, { $addToSet: { subjects: newSubject._id } });
//     }

//     return NextResponse.json(newSubject, { status: 201 });
//   } catch (error) {
//     console.error("Error creating subject:", error);
//     return NextResponse.json({ error: "Error creating subject", details: error.message }, { status: 500 });
//   }
// }

// export async function PUT(request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const _id = searchParams.get("_id");
//     await connectMongoDB();
//     const data = await request.json();
//     console.log(data);
    
//     const { 
//       id,
//       name,
//       subType,
//       classId,
//       teacher,
//       batch,
//       department,
//       institute,
//       content,
//       tgSessions,
//       sem,
//       academicYear
//     } = data;

//     if (!_id) {
//       return NextResponse.json({ error: "Subject ID is required" }, { status: 400 });
//     }

//     const oldSubject = await Subject.findById(_id);
//     if (!oldSubject) {
//       return NextResponse.json({ error: "Subject not found" }, { status: 404 });
//     }

//     const updatedSubject = await Subject.findByIdAndUpdate(
//       _id,
//       {
//         id,
//         name,
//         subType,
//         class: classId,
//         teacher,
//         batch: subType === "practical" ? batch : undefined,
//         department,
//         institute,
//         content: subType !== "tg" ? content : undefined,
//         tgSessions: subType === "tg" ? tgSessions : undefined,
//         sem,
//         academicYear
//       },
//       { new: true }
//     );

//     if (oldSubject.class.toString() !== classId.toString() || oldSubject.sem !== sem) {
//       await Classes.findByIdAndUpdate(oldSubject.class, { 
//         $pull: { [`subjects.${oldSubject.sem}`]: _id }
//       });

//       await Classes.findByIdAndUpdate(classId, { 
//         $addToSet: { [`subjects.${sem}`]: _id }
//       });
//     }

//     return NextResponse.json(updatedSubject, { status: 200 });
//   } catch (error) {
//     console.error("Error updating subject:", error);
//     return NextResponse.json({ error: "Error updating subject", details: error.message }, { status: 500 });
//   }
// }


// export async function DELETE(request) {
//   const { searchParams } = new URL(request.url);
//   const subjectId = searchParams.get("_id");

//   try {
//     const subject = await Subject.findById(subjectId);

//     if (!subject) {
//       return NextResponse.json({ error: "Subject not found" }, { status: 404 });
//     }

//     // Delete related attendance records
//     await Attendance.deleteMany({ subject: subjectId });

//     // Delete the subject
//     await Subject.findByIdAndDelete(subjectId);

//     // Remove subject from class
//     await Classes.findByIdAndUpdate(subject.class, { $pull: { subjects: subjectId } });

//     // Remove subject from students
//     if (subject.subType === "theory") {
//       const classDoc = await Classes.findById(subject.class);
//       const studentIds = classDoc.students;
//       await Student.updateMany({ _id: { $in: studentIds } }, { $pull: { subjects: subjectId } });
//     } else if (subject.subType === "practical" && subject.batch && subject.batch.length > 0) {
//       const classDoc = await Classes.findById(subject.class);
//       const studentIds = classDoc.batches
//         .filter((batch) => subject.batch.includes(batch._id.toString()))
//         .flatMap((batch) => batch.students);

//       await Student.updateMany({ _id: { $in: studentIds } }, { $pull: { subjects: subjectId } });
//     }

//     // Remove subject from teacher
//     if (subject.teacher) {
//       await Faculty.findByIdAndUpdate(subject.teacher, { $pull: { subjects: subjectId } });
//     }

//     return NextResponse.json({ message: "Subject and associated reports deleted successfully" }, { status: 200 });
//   } catch (error) {
//     console.error("Error deleting subject:", error);
//     return NextResponse.json({ error: "Error deleting subject", details: error.message }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Subject from "@/models/subject";
import Classes from "@/models/className";
import Faculty from "@/models/faculty";
import Student from "@/models/student";
import Attendance from "@/models/attendance";
import Institute from "@/models/Institute";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const subjectId = searchParams.get("_id");
  const selectedBatchId = searchParams.get("batchId");
  const classId = searchParams.get("classId");
  const academicYear = searchParams.get("academicYear");
  const sem = searchParams.get("sem");

  try {
    await connectMongoDB();
    let subjects = [];
    let batches = [];
    let students = [];

    const query = {};
    if (subjectId) query._id = subjectId;
    if (classId) query.class = classId;
    if (academicYear) query.academicYear = academicYear;
    if (sem) query.sem = sem;

    if (subjectId) {
      const subject = await Subject.findById(subjectId)
        .populate('class', 'name')
        .populate('teacher', 'name')
        .populate('institute', 'name')
        .lean();

      if (subject) {
        if (subject.subType === "practical") {
          const classDoc = await Classes.findById(subject.class).populate("batches").lean();
          if (classDoc && classDoc.batches) {
            batches = classDoc.batches.map((batch) => batch._id);

            if (selectedBatchId) {
              const selectedBatch = classDoc.batches.find(
                (batch) => batch._id.toString() === selectedBatchId
              );

              if (selectedBatch) {
                students = await Student.find({
                  _id: { $in: selectedBatch.students },
                  class: subject.class,
                })
                  .select("_id rollNumber name")
                  .lean();
              }
            }
          }
        } else if (subject.subType === "theory") {
          students = await Student.find({
            class: subject.class
          })
            .select("_id rollNumber name")
            .lean();
        }
        subjects = [subject];
      }
    } else {
      subjects = await Subject.find(query)
        .populate('class', 'name')
        .populate('teacher', 'name')
        .populate('institute', 'name')
        .lean();
    }

    const teachers = await Faculty.find().select("_id name").lean();
    const institutes = await Institute.find().select("_id name").lean();

    return NextResponse.json({
      subjects,
      batches,
      students,
      teachers,
      institutes
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectMongoDB();
    const data = await request.json();
    const {
      id,
      name,
      subType,
      classId,
      teacher,
      batch,
      department,
      institute,
      content,
      tgSessions,
      sem,
      academicYear
    } = data;

    const newSubject = new Subject({
      id,
      name,
      subType,
      class: classId,
      teacher,
      batch: subType === "practical" ? batch : undefined,
      department,
      institute,
      content: subType !== "tg" ? content : undefined,
      tgSessions: subType === "tg" ? tgSessions : undefined,
      sem,
      academicYear
    });

    await newSubject.save();
    
    await Classes.findByIdAndUpdate(classId, {
      $addToSet: { [`subjects.${sem}`]: newSubject._id }
    });

    if (teacher) {
      await Faculty.findByIdAndUpdate(teacher, { $addToSet: { subjects: newSubject._id } });
    }

    return NextResponse.json(newSubject, { status: 201 });
  } catch (error) {
    console.error("Error creating subject:", error);
    return NextResponse.json({ error: "Error creating subject", details: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    
  const { searchParams } = new URL(request.url);
  const _id = searchParams.get("_id");
    await connectMongoDB();
    const data = await request.json();
    const { 
      id,
      name,
      subType,
      class:classId,
      teacher,
      batch,
      department,
      institute,
      content,
      tgSessions,
      sem,
      academicYear
    } = data;
console.log(classId);

    console.log(data);
    
    if (!_id) {
      return NextResponse.json({ error: "Subject ID is required" }, { status: 400 });
    }

    const oldSubject = await Subject.findById(_id);
    if (!oldSubject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    const updatedSubject = await Subject.findByIdAndUpdate(
      _id,
      {
        id,
        name,
        subType,
        class: classId,
        teacher,
        batch: subType === "practical" ? batch : undefined,
        department,
        institute,
        content: subType !== "tg" ? content : undefined,
        tgSessions: subType === "tg" ? tgSessions : undefined,
        sem,
        academicYear
      },
      { new: true }
    );

    console.log(updatedSubject);
    
    // Check if class or semester has changed
    if (oldSubject.class?.toString() !== classId || oldSubject.sem !== sem) {
      // Remove subject from old class
      if (oldSubject.class) {
        await Classes.findByIdAndUpdate(oldSubject.class, { 
          $pull: { [`subjects.${oldSubject.sem}`]: _id }
        });
      }

      // Add subject to new class
      await Classes.findByIdAndUpdate(classId, { 
        $addToSet: { [`subjects.${sem}`]: _id }
      });
    }

    // Update teacher references
    if (oldSubject.teacher?.toString() !== teacher) {
      if (oldSubject.teacher) {
        await Faculty.findByIdAndUpdate(oldSubject.teacher, { $pull: { subjects: _id } });
      }
      if (teacher) {
        await Faculty.findByIdAndUpdate(teacher, { $addToSet: { subjects: _id } });
      }
    }

    return NextResponse.json(updatedSubject, { status: 200 });
  } catch (error) {
    console.error("Error updating subject:", error);
    return NextResponse.json({ error: "Error updating subject", details: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const subjectId = searchParams.get("_id");

  try {
    await connectMongoDB();
    const subject = await Subject.findById(subjectId);

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    await Attendance.deleteMany({ subject: subjectId });
    await Subject.findByIdAndDelete(subjectId);
    await Classes.findByIdAndUpdate(subject.class, { $pull: { [`subjects.${subject.sem}`]: subjectId } });

    if (subject.teacher) {
      await Faculty.findByIdAndUpdate(subject.teacher, { $pull: { subjects: subjectId } });
    }

    return NextResponse.json({ message: "Subject and associated data deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting subject:", error);
    return NextResponse.json({ error: "Error deleting subject", details: error.message }, { status: 500 });
  }
}

