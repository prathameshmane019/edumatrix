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

// export async function POST(request) {
//   try {
//     await connectMongoDB();
//     const data = await request.json();
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
    
//   const { searchParams } = new URL(request.url);
//   const _id = searchParams.get("_id");
//     await connectMongoDB();
//     const data = await request.json();
//     const { 
//       id,
//       name,
//       subType,
//       class:classId,
//       teacher,
//       batch,
//       department,
//       institute,
//       content,
//       tgSessions,
//       sem,
//       academicYear
//     } = data;
// console.log(classId);

//     console.log(data);
    
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

//     console.log(updatedSubject);
    
//     // Check if class or semester has changed
//     if (oldSubject.class?.toString() !== classId || oldSubject.sem !== sem) {
//       // Remove subject from old class
//       if (oldSubject.class) {
//         await Classes.findByIdAndUpdate(oldSubject.class, { 
//           $pull: { [`subjects.${oldSubject.sem}`]: _id }
//         });
//       }

//       // Add subject to new class
//       await Classes.findByIdAndUpdate(classId, { 
//         $addToSet: { [`subjects.${sem}`]: _id }
//       });
//     }

//     // Update teacher references
//     if (oldSubject.teacher?.toString() !== teacher) {
//       if (oldSubject.teacher) {
//         await Faculty.findByIdAndUpdate(oldSubject.teacher, { $pull: { subjects: _id } });
//       }
//       if (teacher) {
//         await Faculty.findByIdAndUpdate(teacher, { $addToSet: { subjects: _id } });
//       }
//     }

//     return NextResponse.json(updatedSubject, { status: 200 });
//   } catch (error) {
//     console.error("Error updating subject:", error);
//     return NextResponse.json({ error: "Error updating subject", details: error.message }, { status: 500 });
//   }
// }

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

export async function POST(request) {
  try {
    await connectMongoDB();
    const data = await request.json();
    const {
      id,
      name,
      subType,
      class: classId,
      teacher,
      batch,
      batchFaculties,
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
      teacher: subType === 'theory' ? teacher : undefined,
      batchFaculties: (subType === 'practical' || subType === 'tg') ? batchFaculties : undefined,
      batch: (subType === 'practical' || subType === 'tg') ? batch : undefined,
      department,
      institute,
      content: subType !== 'tg' ? content : undefined,
      tgSessions: subType === 'tg' ? tgSessions : undefined,
      sem,
      academicYear
    });

    await newSubject.save();
    
    await Classes.findByIdAndUpdate(classId, {
      $addToSet: { [`subjects.${sem}`]: newSubject._id }
    });

    // Update faculty references for all assigned teachers
    if (subType === 'theory' && teacher) {
      await Faculty.findByIdAndUpdate(teacher, { 
        $addToSet: { subjects: newSubject._id } 
      });
    } else if (batchFaculties && batchFaculties.length > 0) {
      const facultyIds = batchFaculties.map(bf => bf.faculty);
      await Faculty.updateMany(
        { _id: { $in: facultyIds } },
        { $addToSet: { subjects: newSubject._id } }
      );
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
      class: classId,
      teacher,
      batch,
      batchFaculties,
      department,
      institute,
      content,
      tgSessions,
      sem,
      academicYear
    } = data;

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
        teacher: subType === 'theory' ? teacher : undefined,
        batchFaculties: (subType === 'practical' || subType === 'tg') ? batchFaculties : undefined,
        batch: (subType === 'practical' || subType === 'tg') ? batch : undefined,
        department,
        institute,
        content: subType !== 'tg' ? content : undefined,
        tgSessions: subType === 'tg' ? tgSessions : undefined,
        sem,
        academicYear
      },
      { new: true }
    );

    // Update class references
    if (oldSubject.class?.toString() !== classId || oldSubject.sem !== sem) {
      if (oldSubject.class) {
        await Classes.findByIdAndUpdate(oldSubject.class, {
          $pull: { [`subjects.${oldSubject.sem}`]: _id }
        });
      }
      await Classes.findByIdAndUpdate(classId, {
        $addToSet: { [`subjects.${sem}`]: _id }
      });
    }

    // Update faculty references
    if (subType === 'theory') {
      // For theory subjects
      if (oldSubject.teacher?.toString() !== teacher) {
        if (oldSubject.teacher) {
          await Faculty.findByIdAndUpdate(oldSubject.teacher, { 
            $pull: { subjects: _id } 
          });
        }
        if (teacher) {
          await Faculty.findByIdAndUpdate(teacher, { 
            $addToSet: { subjects: _id } 
          });
        }
      }
    } else {
      // For practical/TG subjects
      const oldFacultyIds = oldSubject.batchFaculties?.map(bf => bf.faculty.toString()) || [];
      const newFacultyIds = batchFaculties?.map(bf => bf.faculty.toString()) || [];

      // Remove subject reference from faculties no longer teaching the subject
      const removedFaculties = oldFacultyIds.filter(id => !newFacultyIds.includes(id));
      if (removedFaculties.length > 0) {
        await Faculty.updateMany(
          { _id: { $in: removedFaculties } },
          { $pull: { subjects: _id } }
        );
      }

      // Add subject reference to new faculties
      const addedFaculties = newFacultyIds.filter(id => !oldFacultyIds.includes(id));
      if (addedFaculties.lengtholdFaculties.includes(id));
      if (addedFaculties.length > 0) {
        await Faculty.updateMany(
          { _id: { $in: addedFaculties } },
          { $addToSet: { subjects: _id } }
        );
      }
    }

    return NextResponse.json(updatedSubject, { status: 200 });
  } catch (error) {
    console.error("Error updating subject:", error);
    return NextResponse.json({ error: "Error updating subject", details: error.message }, { status: 500 });
  }
}

