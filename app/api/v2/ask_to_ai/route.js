// app/api/v2/ask_to_ai/route.js
import { connectMongoDB } from '@/lib/connectDb';
import Attendance from '@/models/attendance';
import Feedback from '@/models/feedback';
import Student from '@/models/student';
import Subject from '@/models/subject';
import Faculty from '@/models/faculty';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize Gemini API with your API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Schema descriptions for AI context
const schemaContext = `
Available MongoDB Schemas:
- Attendance: { date: Date, subject: String, batch: String, institute: ObjectId, session: Number, records: [{ student: String, status: 'present'|'absent' }] }
- Feedback: { feedbackTitle: String, department: String, feedbackType: String, subjects: [{ _id: String, subject: String, faculty: String }], questions: [String], responses: [ObjectId], institute: ObjectId, students: Number, class: String, pwd: String, resourcePerson: String, organization: String, note: String, isActive: Boolean }
- Student: { _id: String, personalDetails: { name: String, dateOfBirth: Date, gender: String, email: String, phoneNo: String }, academicDetails: { rollNumber: String, academicYear: String, department: String, class: ObjectId, institute: ObjectId }, admission: { admissionNumber: String, admissionDate: Date, categoryType: String, status: String }, parents: { name: String, contact: String, email: String, occupation: String, relation: String } }
- Subject: { id: String, name: String, subType: 'theory'|'practical'|'tg', class: ObjectId, teacher: ObjectId, batchFaculties: [{ batchId: String, faculty: ObjectId }], batch: [String], department: String, institute: ObjectId, content: [{ title: String, description: String, status: 'covered'|'not_covered' }], tgSessions: [{ date: String, pointsDiscussed: [String] }], sem: 'sem1'|'sem2', academicYear: String }
- Faculty: { id: String, name: String, classes: ObjectId, department: String, email: String, institute: ObjectId, contact: String, dateOfBirth: Date, address: String, gender: String, designation: String, employmentType: 'teaching'|'non-teaching', dateOfJoining: Date, education: { highestDegree: String, specialization: String, university: String, yearOfPassing: Number } }
- Classes: { id: String, year: String, department: String, subjects: { sem1: [ObjectId], sem2: [ObjectId] }, students: [String], teacher: ObjectId, batches: [{ id: String, type: 'practical'|'tg', students: [String] }], institute: ObjectId }
- Department: { id: String, name: String, email: String, institute: ObjectId }
- Institute: { name: String, instituteCode: String, address: String, university: String, contact: String, email: String }
- Response: { feedback_id: String, ratings: [{ subject_id: String, suggestions: String, ratings: [] }], date: Date }
- Questions: { feedbackType: 'academic'|'event', subType: String, feedbackId: String, questions: [String], institute: ObjectId }
`;

export async function POST(req) {
  await connectMongoDB();
  const { question, userRole, subscribedServices = [] } = await req.json();

  console.log(question, userRole, subscribedServices);
  const validRoles = ['admin', 'superadmin'];
  if (!validRoles.includes(userRole)) {
    return NextResponse.json({ status: 401, message: 'unauthorized role' });
  }

  try {
    // Step 1: Send question to Gemini API with schema context
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are an ERP assistant for a college system. Use the following schema context to interpret questions and generate accurate responses: ${schemaContext}. 
      Extract key entities (e.g., 'attendance', 'student', 'feedback', 'subject', 'faculty', 'date', 'count') and intent from the question. 
      Return a VALID JSON object as a string in this exact format: {"intent": "query"|"count"|"update"|"general", "entities": [{"entity": "string", "value": "string"}]}, ensuring no extra text or characters. 
      For 'count' intent, include an entity like {'entity': 'count', 'value': 'total'} if the question asks for a total count (e.g., 'count total number of students'). Question: ${question}
    `;
    const aiResponse = await model.generateContent(prompt);
    const rawResponse = aiResponse.response.text();
    console.log('Raw Gemini Response:', rawResponse); // Debug log

    // Attempt to parse the response
    let { intent, entities } = { intent: 'general', entities: [] };
    try {
      const parsedResponse = JSON.parse(rawResponse.trim());
      intent = parsedResponse.intent || 'general';
      entities = parsedResponse.entities || [];
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError, 'Raw response:', rawResponse);
      intent = 'general'; // Fallback to general intent if parsing fails
    }

    let answer = 'Let me help you with that.';

    // Step 2: Query database based on extracted intent and entities
    if (intent === 'query') {
      const serviceMap = {
        'attendance-service': async () => {
          if (!subscribedServices.includes('attendance-service')) {
            return 'Access to attendance service is not subscribed.';
          }
          const subject = entities.find((e) => e.entity === 'subject')?.value;
          const date = entities.find((e) => e.entity === 'date')?.value;
          const query = {};
          if (subject) query.subject = { $regex: subject, $options: 'i' };
          if (date) query.date = new Date(date);

          const attendance = await Attendance.findOne(query)
            .populate('records.student', 'personalDetails.name academicDetails.rollNumber');
          return attendance
            ? `Attendance for ${attendance.subject} on ${attendance.date.toDateString()}:\n${attendance.records
                .map((r) => `${r.student.personalDetails.name}: ${r.status}`)
                .join('\n')}`
            : 'No attendance data found.';
        },
        'feedback-service': async () => {
          if (!subscribedServices.includes('feedback-service')) {
            return 'Access to feedback service is not subscribed.';
          }
          const feedbackTitle = entities.find((e) => e.entity === 'feedback')?.value;
          const feedback = await Feedback.findOne({ feedbackTitle: { $regex: feedbackTitle || '', $options: 'i' } })
            .populate('responses');
          return feedback
            ? `Feedback for ${feedback.feedbackTitle}: ${feedback.responses.length} responses recorded.`
            : 'No feedback data found.';
        },
        'student-service': async () => {
          if (!subscribedServices.includes('student-service')) {
            return 'Access to student service is not subscribed.';
          }
          const name = entities.find((e) => e.entity === 'student')?.value;
          const student = await Student.findOne({ 'personalDetails.name': { $regex: name || '', $options: 'i' } })
            .select('personalDetails.name academicDetails.rollNumber');
          return student
            ? `Student: ${student.personalDetails.name}, Roll Number: ${student.academicDetails.rollNumber}`
            : 'No student data found.';
        },
        'course-service': async () => {
          if (!subscribedServices.includes('course-service')) {
            return 'Access to course service is not subscribed.';
          }
          const name = entities.find((e) => e.entity === 'subject')?.value;
          const subject = await Subject.findOne({ name: { $regex: name || '', $options: 'i' } });
          return subject
            ? `Subject: ${subject.name}, Type: ${subject.subType}, Semester: ${subject.sem}`
            : 'No subject data found.';
        },
        'faculty-service': async () => {
          if (!subscribedServices.includes('faculty-service')) {
            return 'Access to faculty service is not subscribed.';
          }
          const name = entities.find((e) => e.entity === 'faculty')?.value;
          const faculty = await Faculty.findOne({ name: { $regex: name || '', $options: 'i' } })
            .select('name email');
          return faculty
            ? `Faculty: ${faculty.name}, Email: ${faculty.email}`
            : 'No faculty data found.';
        },
      };

      for (const entity of entities) {
        const serviceKey = `${entity.entity}-service`;
        if (serviceMap[serviceKey]) {
          answer = await serviceMap[serviceKey]();
          break;
        }
      }
    } else if (intent === 'count' && subscribedServices.includes('student-service')) {
      // Handle count operations (e.g., total number of students)
      const countEntity = entities.find((e) => e.entity === 'count');
      if (countEntity && countEntity.value === 'total' && entities.some((e) => e.entity === 'student')) {
        const aggregation = await Student.aggregate([
          {
            $lookup: {
              from: 'Institute',
              localField: 'institute',
              foreignField: '_id',
              as: 'instituteDetails',
            },
          },
          {
            $match: {
              'instituteDetails.instituteCode': { $exists: true }, // Adjust filter as needed
            },
          },
          {
            $group: {
              _id: null,
              totalStudents: { $sum: 1 },
            },
          },
        ]);
        answer = aggregation.length > 0 ? `Total number of students: ${aggregation[0].totalStudents}` : 'No student data found.';
      }
    }

    // Step 3: If no database match or no relevant service, generate a generic response
    if (answer === 'Let me help you with that.') {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
        You are an ERP assistant for a college system. Use the schema context: ${schemaContext}. 
        Provide a helpful response based on a college ERP context. User role is ${userRole}, and subscribed services are ${subscribedServices.join(', ')}. 
        Format attendance data as a newline-separated list (e.g., "Name: Status\\nName: Status") for table display. 
        For count queries (e.g., 'count total number of students'), provide a direct numerical answer if possible, or explain if data is unavailable. Question: ${question}
      `;
      const response = await model.generateContent(prompt); 
      answer = response.response.text();
    }

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('Error in API:', error);
    if (error.code === 'RATE_LIMIT_EXCEEDED' || error.status === 429) {
      return NextResponse.json({ answer: 'Sorry, the AI service is temporarily unavailable due to rate limits. Please try again later.' }, { status: 429 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}