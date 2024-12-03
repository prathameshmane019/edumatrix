'use server'

import { parse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';
import { connectMongoDB } from "@/lib/connectDb";
import Student from "@/models/student";
import mongoose from "mongoose";

export async function uploadStudents(formData) {
  let session = null;
  console.log('Starting uploadStudents function');

  try {
    await connectMongoDB();
    session = await mongoose.startSession();
    session.startTransaction();

    const file = formData.get('file');
    // const classId = formData.get('classId') ;
    const instituteId = formData.get('instituteId') ;
    const academicYear = formData.get('academicYear') ;
    const selectedSheet = formData.get('selectedSheet');
    const department = formData.get('department') ;

    console.log('File details:', {
      fileName: file?.name,
      fileSize: file?.size,
      instituteId,
      academicYear,
      selectedSheet,
      department
    });

    if (!file) {
      throw new Error('No file uploaded');
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let records= [];

    try {
      if (file.name.endsWith('.csv')) {
        records = parse(buffer.toString(), {
          columns: true,
          skip_empty_lines: true,
          trim: true,
          bom: true,
        });
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        
        if (!selectedSheet) {
          return { success: true, sheets: workbook.SheetNames };
        }

        const sheet = workbook.Sheets[selectedSheet];
        if (!sheet) {
          throw new Error(`Sheet "${selectedSheet}" not found in the workbook`);
        }
        records = XLSX.utils.sheet_to_json(sheet);
      } else {
        throw new Error('Unsupported file type. Please upload a CSV or Excel file.');
      }
    } catch (parseError) {
      console.error('File parsing error:', parseError);
      throw new Error(`File parsing failed: ${parseError.message}`);
    }

    console.log(`Parsed ${records.length} records`);

    const validatedStudents = records.filter(record => record.rollNumber && record.name);

    console.log(`Validated ${validatedStudents.length} students`);

    const existingStudents = await Student.find({
      rollNumber: { $in: validatedStudents.map(s => s.rollNumber) },
      institute: instituteId
    }).session(session);

    const existingStudentMap = new Map(existingStudents.map(s => [s.rollNumber, s]));

    const studentsToInsert = [];
    const studentsAlreadyPresent = [];

    for (const record of validatedStudents) {
      if (existingStudentMap.has(record.rollNumber)) {
        studentsAlreadyPresent.push(existingStudentMap.get(record.rollNumber));
      } else {
        studentsToInsert.push({
          _id: record._id,
          rollNumber: record.rollNumber,
          name: record.name,
          email: record.email || '',
          phoneNo: record.phoneNo || '',
          department: department,
          year: academicYear,
          institute: instituteId
        });
      }
    }

    console.log(`${studentsAlreadyPresent.length} students already present`);
    console.log(`${studentsToInsert.length} new students to insert`);

    let insertedStudents = [];

    if (studentsToInsert.length > 0) {
      try {
        insertedStudents = await Student.insertMany(studentsToInsert, { 
          session,
          ordered: false
        });
        console.log(`Successfully inserted ${insertedStudents.length} new students`);
      } catch (insertError) {
        console.error('Insertion error:', insertError);
        throw new Error(`Failed to insert students: ${insertError.message}`);
      }
    }

    await session.commitTransaction();

    const allStudents = [...studentsAlreadyPresent, ...insertedStudents];

    return { 
      success: true, 
      message: `${insertedStudents.length} new students uploaded, ${studentsAlreadyPresent.length} students already present`, 
      students: allStudents.map(student => ({
        _id: student._id,
        rollNumber: student.rollNumber,
        name: student.name,
        email: student.email,
        phoneNo: student.phoneNo,
        department: student.department,
        year: student.year
      }))
    };
  } catch (error) {
    console.error('Overall upload error:', error);

    if (session && session.inTransaction()) {
      await session.abortTransaction();
    }

    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to upload students" 
    };
  } finally {
    if (session) {
      await session.endSession();
    }
    console.log('Upload process completed');
  }
}


// 'use server'

// import { connectMongoDB } from "@/lib/connectDb";
// import Student from "@/models/student";
// import Classes from "@/models/className";
// import mongoose from "mongoose";
// import { parse } from 'csv-parse/sync';
// import xlsx from 'xlsx';

// export async function uploadStudents(formData) {
//   let session;
//   try {
//     await connectMongoDB();
//     session = await mongoose.startSession();
//     session.startTransaction();

//     const file = formData.get('file') ;
//     const classId = formData.get('classId') ;
//     const instituteId = formData.get('instituteId') ;
//     const academicYear = formData.get('academicYear');
//     const selectedSheet = formData.get('selectedSheet') ;
//     const department = formData.get('department')
//     if (!file || !classId || !instituteId || !academicYear) {
//       throw new Error('Missing required information');
//     }

//     let students = [];

//     if (file.name.endsWith('.csv')) {
//       const content = await file.text();
//       students = parse(content, { columns: true, skip_empty_lines: true });
//     } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
//       const buffer = await file.arrayBuffer();
//       const workbook = xlsx.read(buffer, { type: 'buffer' });
//       const sheetName = selectedSheet || workbook.SheetNames[0];
//       const worksheet = workbook.Sheets[sheetName];
//       students = xlsx.utils.sheet_to_json(worksheet);
//     } else {
//       throw new Error('Unsupported file format');
//     }

//   //   const classDoc = await Classes.findById(classId).session(session);
//   //   if (!classDoc) {
//   //     throw new Error('Class not found');
//   //   }
//   // let _id="674b150cef05e2658ddcba5c"
//     const createdStudents = await Student.create(students.map(student => ({
//       ...student,
//       institute: instituteId,
//       academicYear: academicYear,
//       department: department,
//       // year: classDoc.year
//     })), { session });

//     // await Classes.findByIdAndUpdate(
//     //   classId,
//     //   { $push: { students: { $each: createdStudents.map(s => s._id) } } },
//     //   { session }
//     // );

//     await session.commitTransaction();

//     return {
//       success: true,
//       message: `${createdStudents.length} students uploaded successfully`,
//       students: createdStudents
//     };
//   } catch (error) {
//     if (session) {
//       await session.abortTransaction();
//     }
//     console.error("Error uploading students:", error);
//     return { 
//       success: false, 
//       error: error instanceof Error ? error.message : "Failed to upload students" 
//     };
//   } finally {
//     if (session) {
//       session.endSession();
//     }
//   }
// }

