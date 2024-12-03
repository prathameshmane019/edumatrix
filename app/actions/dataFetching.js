import { cache } from 'react';
import Department from '@/models/department';
import Faculty from '@/models/faculty';
import Student from '@/models/student';
import Classes from '@/models/className';
import { connectMongoDB } from '@/lib/connectDb';

// Cached server function to fetch departments by institute
export const getDepartmentsByInstitute = cache(async (instituteId) => {
  try {
    await connectMongoDB();
    
    const departments = await Department.find(
      { institute: instituteId }, 
      'id name' 
    ).lean();
    
    return departments;
  } catch (error) {
    console.error('Error fetching departments:', error);
    return [];
  }
});

// Cached server function to fetch faculty by institute
export const getFacultyByInstitute = cache(async (instituteId) => {
  try {
    await connectMongoDB();
    
    const faculty = await Faculty.find(
      { institute: instituteId }, 
      '_id id name department email' // Select specific fields
    ).lean();
    
    return faculty;
  } catch (error) {
    console.error('Error fetching faculty:', error);
    return [];
  }
});

// Cached server function to fetch students by institute
export const getStudentsByInstitute = cache(async (instituteId) => {
  try {
    await connectMongoDB();
    
    const students = await Student.find(
      { institute: instituteId }, 
      '_id rollNumber name department year email' // Select specific fields
    ).lean();
    
    return students;
  } catch (error) {
    console.error('Error fetching students:', error);
    return [];
  }
});

// Cached server function to fetch classes by institute
export const getClassesByInstitute = cache(async (instituteId) => {
  try {
    await connectMongoDB();
    
    const classes = await Classes.find(
      { institute: instituteId }, 
      'id year department teacher' // Select specific fields
    )
    .populate('teacher', 'name') // Populate teacher name
    .lean();
    
    return classes;
  } catch (error) {
    console.error('Error fetching classes:', error);
    return [];
  }
});

// Additional targeted fetch functions

// Fetch department names and IDs by institute
export const getDepartmentOptionsForInstitute = cache(async (instituteId) => {
  try {
    await connectMongoDB();
    console.log("InstituteId:",instituteId);
    
    const departments = await Department.find(
      { institute: instituteId }, 
      'id name'
    ).lean();
    
    return departments.map(dept => ({
      value: dept.id,
      label: dept.name
    }));
  } catch (error) {
    console.error('Error fetching department options:', error);
    return [];
  }
});

// Fetch faculty names and IDs by institute and optional department filter
export const getFacultyOptionsForInstitute = cache(async (instituteId, department) => {
  try {
    await connectMongoDB();
    
    const query = { institute: instituteId };
    if (department) {
      query.department = department;
    }
    
    const faculty = await Faculty.find(query, '_id name department').lean();
    
    return faculty.map(f => ({
      value: f._id,
      label: `${f.name} (${f.department})`,
      department: f.department
    }));
  } catch (error) {
    console.error('Error fetching faculty options:', error);
    return [];
  }
});

// Fetch student options by institute and optional class or department filter
export const getStudentOptionsForInstitute = cache(async (instituteId, filterOptions = {}) => {
  try {
    await connectMongoDB();
    
    const query = { institute: instituteId };
    
    if (filterOptions.class) {
      query.class = filterOptions.class;
    }
    
    if (filterOptions.department) {
      query.department = filterOptions.department;
    }
    
    const students = await Student.find(query, '_id name rollNumber department').lean();
    
    return students.map(student => ({
      value: student._id,
      label: `${student.name} (${student.rollNumber})`,
      department: student.department
    }));
  } catch (error) {
    console.error('Error fetching student options:', error);
    return [];
  }
});