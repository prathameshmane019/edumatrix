import { connectMongoDB } from '@/lib/connectDb';
import Attendance from '@/models/attendance';
import Feedback from '@/models/feedback';
import Response from '@/models/response'; // New
import Questions from '@/models/questions'; // New
import Student from '@/models/student';
import Subject from '@/models/subject';
import Faculty from '@/models/faculty';
import Classes from '@/models/className';
import Department from '@/models/department';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const schemaContext = `
Available MongoDB Schemas:
- Attendance: { _id: ObjectId, date: Date, subject: String, batch: String, institute: ObjectId, session: Number, records: [{ student: String, status: 'present'|'absent' }] }
- Feedback: { _id: ObjectId, feedbackTitle: String, department: String, feedbackType: String, subjects: [{ _id: String, subject: String, faculty: String }], questions: [String], responses: [ObjectId], institute: ObjectId, students: Number, class: String, pwd: String, resourcePerson: String, organization: String, note: String, isActive: Boolean }
- Response: { _id: ObjectId, feedback_id: String, ratings: [{ subject_id: String, suggestions: String, ratings: [] }], date: Date }
- Questions: { _id: ObjectId, feedbackType: String, subType: String, feedbackId: String, resourcePerson: String, organization: String, note: String, questions: [String], institute: ObjectId }
- Student: { _id: ObjectId, personalDetails: { name: String }, academicDetails: { rollNumber: String, department: String, class: ObjectId, institute: ObjectId } }
- Subject: { _id: ObjectId, name: String, subType: 'theory'|'practical'|'tg', class: ObjectId, teacher: ObjectId, batch: [String], department: String, institute: ObjectId, sem: 'sem1'|'sem2', academicYear: String }
- Faculty: { _id: ObjectId, name: String, classes: ObjectId, department: String, email: String, institute: ObjectId }
- Classes: { _id: ObjectId, year: String, department: String, subjects: { sem1: [ObjectId], sem2: [ObjectId] }, students: [String], teacher: ObjectId, batches: [{ id: String, type: 'practical'|'tg', students: [String] }], institute: ObjectId }
- Department: { _id: ObjectId, name: String, email: String, institute: ObjectId }
`;

export async function POST(req) {
  try {
    await connectMongoDB();
    const { question, userRole, instituteId, departmentId, subscribedServices = [] } = await req.json();

    console.log('Request:', { question, userRole, instituteId, departmentId, subscribedServices });

    const rolePermissions = {
      superadmin: ['all'],
      admin: ['attendance-service', 'student-service', 'feedback-service', 'course-service', 'faculty-service', 'department-service'],
      faculty: ['attendance-service', 'course-service'],
      student: ['student-service', 'feedback-service']
    };

    if (!rolePermissions[userRole]) {
      return NextResponse.json({ status: 401, message: 'Invalid user role' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const intentPrompt = `
      You are an ERP assistant for a college system. Analyze the question using this schema context: ${schemaContext}.
      - Intents: "query" (specific data), "count" (aggregate), "list" (multiple records), "report" (tabular/graph data), "update" (modify data), "general" (non-specific).
      - Services: "attendance-service", "student-service", "feedback-service", "course-service", "faculty-service", "department-service", "general".
      - Entities: key-value pairs (e.g., {"entity": "department", "value": "CSE"}) matching schema fields.

      Instructions:
      1. Return a valid JSON object: {"intent": "string", "service": "string", "entities": [{"entity": "string", "value": "string"}]}
      2. No markdown, no \`\`\`json, no backticks, no extra text outside the JSON.
      3. Use 'report' intent for tables, charts, or summaries (e.g., 'feedback report', 'class attendance').
      4. For vague questions, use 'general' intent and service with empty entities.
      5. Only include entities that match schema fields or are clearly relevant.

      Question: ${question}
    `;

    const aiResponse = await model.generateContent(intentPrompt);
    let rawResponse = aiResponse.response.text().trim();
    console.log('Raw AI Response:', rawResponse);

    rawResponse = rawResponse.replace(/```json|```/g, '').replace(/```/g, '').trim();

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(rawResponse);
      if (!parsedResponse.intent || !parsedResponse.service || !Array.isArray(parsedResponse.entities)) {
        throw new Error('Invalid AI response structure');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      parsedResponse = { intent: 'general', service: 'general', entities: [] };
    }

    const { intent, service, entities } = parsedResponse;

    const allowedServices = rolePermissions[userRole];
    if (service !== 'general' && !allowedServices.includes('all') && !allowedServices.includes(service)) {
      return NextResponse.json({ answer: `You do not have permission to access ${service.replace('-service', '')} service.` });
    }
    if (service !== 'general' && !subscribedServices.includes(service)) {
      return NextResponse.json({ answer: `Access to ${service.replace('-service', '')} service is not subscribed.` });
    }

    const queryContext = { instituteId, departmentId, userRole };
    let result = await executeServiceQuery(service, intent, entities, queryContext);

    if (!result) {
      const fallbackPrompt = `
        You are an ERP assistant for a college system. Use this schema context: ${schemaContext}.
        User role: ${userRole}, Institute ID: ${instituteId}, Department ID: ${departmentId || 'N/A'}.
        Subscribed services: ${subscribedServices.join(', ')}.
        Provide a helpful response based on the question: ${question}
      `;
      const fallbackResponse = await model.generateContent(fallbackPrompt);
      result = { answer: fallbackResponse.response.text() };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in API:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

async function executeServiceQuery(service, intent, entities, { instituteId, departmentId, userRole }) {
  const serviceHandlers = {
    'attendance-service': {
      models: { Attendance },
      fields: { Attendance: ['subject', 'date', 'batch'] },
      baseQuery: { Attendance: { institute: new mongoose.Types.ObjectId(instituteId) } }
    },
    'student-service': {
      models: { Student },
      fields: { Student: ['personalDetails.name', 'academicDetails.rollNumber', 'academicDetails.department', 'academicDetails.academicYear'] },
      baseQuery: { Student: { 'academicDetails.institute': new mongoose.Types.ObjectId(instituteId) } }
    },
    'feedback-service': {
      models: { Feedback, Response, Questions },
      fields: { 
        Feedback: ['feedbackTitle', 'feedbackType', 'department', 'students'], 
        Response: ['feedback_id', 'date'], 
        Questions: ['feedbackType', 'questions'] 
      },
      baseQuery: { 
        Feedback: { institute: new mongoose.Types.ObjectId(instituteId) },
        Response: {},
        Questions: { institute: new mongoose.Types.ObjectId(instituteId) }
      },
      populate: { Feedback: [{ path: 'responses', model: 'Response' }] }
    },
    'course-service': {
      models: { Subject, Classes },
      fields: { Subject: ['name', 'subType', 'department', 'sem'], Classes: ['year', 'department'] },
      baseQuery: { 
        Subject: { institute: new mongoose.Types.ObjectId(instituteId) },
        Classes: { institute: new mongoose.Types.ObjectId(instituteId) }
      },
      populate: { Subject: [{ path: 'class', model: 'Classes', select: 'year department students' }] }
    },
    'faculty-service': {
      models: { Faculty },
      fields: { Faculty: ['name', 'department', 'designation', 'employmentType'] },
      baseQuery: { Faculty: { institute: new mongoose.Types.ObjectId(instituteId) } }
    },
    'department-service': {
      models: { Department },
      fields: { Department: ['name', 'email'] },
      baseQuery: { Department: { institute: new mongoose.Types.ObjectId(instituteId) } }
    }
  };

  if (!serviceHandlers[service]) return null;

  const { models, fields, baseQuery, populate = {} } = serviceHandlers[service];
  let queries = Object.fromEntries(Object.keys(baseQuery).map(model => [model, { ...baseQuery[model] }]));

  if (userRole === 'admin' && departmentId && service !== 'attendance-service') {
    for (const model in queries) {
      const deptField = model === 'Student' ? 'academicDetails.department' : 'department';
      queries[model][deptField] = new mongoose.Types.ObjectId(departmentId);
    }
  }

  entities.forEach(({ entity, value }) => {
    for (const model in fields) {
      const field = fields[model].find(f => f.includes(entity.split('.')[1] || entity));
      if (field) queries[model][field] = { $regex: value, $options: 'i' };
    }
  });

  switch (intent) {
    case 'query':
      const primaryModel = Object.keys(models)[0];
      const record = await models[primaryModel].findOne(queries[primaryModel]).populate(populate[primaryModel] || []).lean();
      if (!record) return { answer: `No ${service.replace('-service', '')} data found.` };
      return { answer: formatRecord(record, fields[primaryModel], models) };

    case 'count':
      const countModel = Object.keys(models)[0];
      const count = await models[countModel].countDocuments(queries[countModel]);
      return { answer: `Total ${service.replace('-service', '')} records: ${count}` };

    case 'list':
      const listModel = Object.keys(models)[0];
      const records = await models[listModel].find(queries[listModel]).populate(populate[listModel] || []).limit(10).lean();
      if (!records.length) return { answer: `No ${service.replace('-service', '')} records found.` };
      return { answer: records.map(r => formatRecord(r, fields[listModel], models)).join('\n') };

    case 'report':
      if (service === 'feedback-service') {
        const feedbacks = await Feedback.find(queries.Feedback).populate('responses').lean();
        if (!feedbacks.length) return { answer: 'No feedback data found for report.' };

        const report = feedbacks.map(f => ({
          feedbackTitle: f.feedbackTitle,
          department: f.department,
          studentCount: f.students,
          responseCount: f.responses.length,
          averageRating: f.responses.length > 0 ? 
            (f.responses.reduce((sum, r) => sum + (r.ratings.reduce((s, subj) => s + subj.ratings.reduce((a, b) => a + b, 0) / subj.ratings.length, 0) / r.ratings.length), 0) / f.responses.length).toFixed(2) : 'N/A'
        }));

        const chartData = {
          type: 'bar',
          labels: report.map(f => f.feedbackTitle),
          datasets: [
            { label: 'Responses', data: report.map(f => f.responseCount), backgroundColor: 'rgba(75, 192, 192, 0.6)' },
            { label: 'Avg Rating', data: report.map(f => f.averageRating), backgroundColor: 'rgba(255, 159, 64, 0.6)' }
          ]
        };
        return { answer: 'Generated feedback report.', report, chart: chartData };
      }

      if (service === 'course-service') {
        const subjects = await Subject.find(queries.Subject).populate('class').lean();
        if (!subjects.length) return { answer: 'No course data found for report.' };

        const report = subjects.map(s => ({
          subjectName: s.name,
          subType: s.subType,
          department: s.department,
          semester: s.sem,
          classYear: s.class?.year || 'N/A',
          classDepartment: s.class?.department || 'N/A',
          studentCount: s.class?.students.length || 0
        }));

        const chartData = {
          type: 'pie',
          labels: report.map(s => s.subjectName),
          datasets: [{ label: 'Students per Subject', data: report.map(s => s.studentCount), backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'] }]
        };
        return { answer: 'Generated course report.', report, chart: chartData };
      }

      if (service === 'attendance-service') {
        const subjectNames = await Subject.find({ institute: instituteId }).lean();
        const subjectMap = Object.fromEntries(subjectNames.map(s => [s._id.toString(), s.name]));
        const attendance = await Attendance.aggregate([
          { $match: queries.Attendance },
          { $unwind: '$records' },
          {
            $group: {
              _id: { subject: '$subject', batch: '$batch' },
              totalLectures: { $sum: 1 },
              presentCount: { $sum: { $cond: [{ $eq: ['$records.status', 'present'] }, 1, 0] } }
            }
          }
        ]);

        const report = attendance.map(a => ({
          subject: subjectMap[a._id.subject] || a._id.subject,
          batch: a._id.batch,
          totalLectures: a.totalLectures,
          presentCount: a.presentCount,
          attendancePercentage: (a.presentCount / a.totalLectures * 100).toFixed(2)
        }));

        const chartData = {
          type: 'bar',
          labels: report.map(a => `${a.subject} (${a.batch})`),
          datasets: [
            { label: 'Attendance %', data: report.map(a => a.attendancePercentage), backgroundColor: 'rgba(54, 162, 235, 0.6)' }
          ]
        };
        return { answer: 'Generated attendance report.', report, chart: chartData };
      }

      const reportModel = Object.keys(models)[0];
      const reportData = await models[reportModel].find(queries[reportModel]).populate(populate[reportModel] || []).lean();
      if (!reportData.length) return { answer: `No ${service.replace('-service', '')} data found for report.` };
      const report = reportData.map(item => Object.fromEntries(fields[reportModel].map(f => [f.split('.').pop(), f.split('.').reduce((o, k) => o?.[k], item) || 'N/A'])));
      return { answer: `Generated ${service.replace('-service', '')} report.`, report };

    case 'update':
      return { answer: 'Update functionality is not implemented yet.' };

    default:
      return null;
  }
}

function formatRecord(record, fields, models) {
  return fields.map(field => {
    const keys = field.split('.');
    let value = keys.reduce((obj, key) => obj?.[key], record);
    if (field === 'subjects' && Array.isArray(value)) {
      value = value.map(s => s.subject).join(', ');
    }
    return `${keys.pop()}: ${value || 'N/A'}`;
  }).join(', ');
}