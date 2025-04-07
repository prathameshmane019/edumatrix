import { connectMongoDB } from '@/lib/connectDb';
import Attendance from '@/models/attendance';
import Feedback from '@/models/feedback';
import Response from '@/models/response';
import Questions from '@/models/questions';
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
- Faculty: { _id: ObjectId, name: String, classes: [ObjectId], department: String, email: String, institute: ObjectId }
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
      admin: ['attendance-service', 'student-service', 'feedback-service', 'course-service', 'faculty-service', 'department-service', 'class-service'],
      faculty: ['attendance-service', 'course-service', 'class-service'],
      student: ['student-service', 'feedback-service', 'class-service']
    };

    if (!rolePermissions[userRole]) {
      return NextResponse.json({ status: 401, message: 'Invalid user role' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const intentPrompt = `
      You are an ERP assistant for a college system. Analyze the question using this schema context: ${schemaContext}.
      
      - Intents: "query" (specific data), "count" (aggregate), "list" (multiple records), "report" (tabular/graph data), "update" (modify data), "general" (non-specific).
      - Services: "attendance-service", "student-service", "feedback-service", "course-service", "faculty-service", "department-service", "class-service", "general".
      - Entities: key-value pairs (e.g., {"entity": "department", "value": "CSE"}) matching schema fields.

      Instructions:
      1. Return a valid JSON object: {"intent": "string", "service": "string", "entities": [{"entity": "string", "value": "string"}]}
      2. No markdown, no \`\`\`json, no backticks, no extra text outside the JSON.
      3. Use 'report' intent for tables, charts, or summaries (e.g., 'feedback report', 'class attendance').
      4. For vague questions, use 'general' intent and service with empty entities.
      5. Only include entities that match schema fields or are clearly relevant.
      6. If question involves class details, batches, or class structure, use "class-service".
      7. For question about academic year, year, class-related details, use "class-service".
      8. Map schema fields properly: 'class' refers to the Classes model, 'year' to Classes.year.

      Question: ${question}
    `;

    const aiResponse = await model.generateContent(intentPrompt);
    let rawResponse = aiResponse.response.text().trim();
    console.log('Raw AI Response:', rawResponse);

    // More robust JSON parsing
    rawResponse = rawResponse.replace(/```json|```/g, '').trim();
    
    // Find JSON content even if there's surrounding text
    const jsonMatch = rawResponse.match(/({[\s\S]*})/);
    let jsonContent = jsonMatch ? jsonMatch[0] : rawResponse;
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(jsonContent);
      if (!parsedResponse.intent || !parsedResponse.service || !Array.isArray(parsedResponse.entities)) {
        throw new Error('Invalid AI response structure');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      parsedResponse = { intent: 'general', service: 'general', entities: [] };
    }

    let { intent, service, entities } = parsedResponse;
    
    // Handle class-related queries properly
    if (service === 'class-service') {
      // Map to appropriate model
      service = 'course-service';
    }

    const allowedServices = rolePermissions[userRole];
    if (service !== 'general' && !allowedServices.includes('all') && !allowedServices.includes(service)) {
      return NextResponse.json({ 
        answer: `You do not have permission to access ${service.replace('-service', '')} service.` 
      });
    }
    
    if (service !== 'general' && !subscribedServices.includes(service)) {
      return NextResponse.json({ 
        answer: `Access to ${service.replace('-service', '')} service is not subscribed.` 
      });
    }

    const queryContext = { instituteId, departmentId, userRole, question };
    let result = await executeServiceQuery(service, intent, entities, queryContext);

    if (!result) {
      const fallbackPrompt = `
        You are an ERP assistant for a college system. Use this schema context: ${schemaContext}.
        User role: ${userRole}, Institute ID: ${instituteId}, Department ID: ${departmentId || 'N/A'}.
        Subscribed services: ${subscribedServices.join(', ')}.

        Analyze the question thoroughly before responding. If it relates to:
        - Classes, batches, years, or academic periods - use the Classes model
        - Subject distribution in classes - use the Subject model with class relationship
        - Students in specific classes - use Student model with class reference

        Question: ${question}
        
        Provide a clear, concise, and accurate response based on the available data models.
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
async function executeServiceQuery(service, intent, entities, { instituteId, departmentId, userRole, question }) {
  const serviceHandlers = {
    'attendance-service': {
      models: { Attendance, Subject },
      fields: { 
        Attendance: ['subject', 'date', 'batch', 'session', 'records', 'records.student', 'records.status'],
        Subject: ['_id', 'name', 'subType', 'batch']
      },
      baseQuery: { 
        Attendance: { institute: new mongoose.Types.ObjectId(instituteId) },
        Subject: { institute: new mongoose.Types.ObjectId(instituteId) }
      },
      references: {
        Attendance: {
          subject: { model: 'Subject', field: '_id' }
        },
        Subject: {}
      },
      populate: {
        Attendance: []
      }
    },
    'student-service': {
      models: { Student, Classes },
      fields: { 
        Student: ['_id', 'personalDetails.name', 'academicDetails.rollNumber', 'academicDetails.department', 'academicDetails.class'],
        Classes: ['_id', 'year', 'department']
      },
      baseQuery: { 
        Student: { 'academicDetails.institute': new mongoose.Types.ObjectId(instituteId) },
        Classes: { institute: new mongoose.Types.ObjectId(instituteId) }
      },
      references: {
        Student: {
          'academicDetails.class': { model: 'Classes', field: '_id' }
        },
        Classes: {}
      },
      populate: { 
        Student: [{ path: 'academicDetails.class', model: 'Classes' }]
      }
    },
    'feedback-service': {
      models: { Feedback, Response, Questions },
      fields: { 
        Feedback: ['_id', 'feedbackTitle', 'feedbackType', 'department', 'students', 'class', 'subjects', 'subjects._id', 'subjects.subject', 'subjects.faculty', 'responses'], 
        Response: ['_id', 'feedback_id', 'date', 'ratings', 'ratings.subject_id', 'ratings.ratings', 'ratings.suggestions'], 
        Questions: ['_id', 'feedbackType', 'questions', 'subType'] 
      },
      baseQuery: { 
        Feedback: { institute: new mongoose.Types.ObjectId(instituteId) },
        Response: {},
        Questions: { institute: new mongoose.Types.ObjectId(instituteId) }
      },
      references: {
        Feedback: {
          'responses': { model: 'Response', field: '_id' },
          'class': { model: 'Classes', field: '_id' },
          'subjects._id': { model: 'Subject', field: '_id' },
          'subjects.faculty': { model: 'Faculty', field: '_id' }
        },
        Response: {
          'feedback_id': { model: 'Feedback', field: '_id' },
          'ratings.subject_id': { model: 'Subject', field: '_id' }
        },
        Questions: {}
      },
      populate: { 
        Feedback: [
          { path: 'responses', model: 'Response' },
          { path: 'class', model: 'Classes' }
        ] 
      }
    },
    'course-service': {
      models: { Subject, Classes, Faculty },
      fields: { 
        Subject: ['_id', 'name', 'subType', 'department', 'sem', 'class', 'teacher', 'batch', 'academicYear'],
        Classes: ['_id', 'year', 'department', 'students', 'batches', 'batches.id', 'batches.type', 'batches.students', 'subjects', 'subjects.sem1', 'subjects.sem2', 'teacher'],
        Faculty: ['_id', 'name', 'department', 'classes']
      },
      baseQuery: { 
        Subject: { institute: new mongoose.Types.ObjectId(instituteId) },
        Classes: { institute: new mongoose.Types.ObjectId(instituteId) },
        Faculty: { institute: new mongoose.Types.ObjectId(instituteId) }
      },
      references: {
        Subject: {
          'class': { model: 'Classes', field: '_id' },
          'teacher': { model: 'Faculty', field: '_id' }
        },
        Classes: {
          'teacher': { model: 'Faculty', field: '_id' },
          'subjects.sem1': { model: 'Subject', field: '_id', isArray: true },
          'subjects.sem2': { model: 'Subject', field: '_id', isArray: true }
        },
        Faculty: {
          'classes': { model: 'Classes', field: '_id', isArray: true }
        }
      },
      populate: { 
        Subject: [
          { path: 'class', model: 'Classes', select: 'year department students batches' },
          { path: 'teacher', model: 'Faculty', select: 'name department' }
        ],
        Classes: [
          { path: 'subjects.sem1', model: 'Subject' },
          { path: 'subjects.sem2', model: 'Subject' },
          { path: 'teacher', model: 'Faculty' }
        ]
      }
    },
    'faculty-service': {
      models: { Faculty, Classes, Subject },
      fields: { 
        Faculty: ['_id', 'name', 'department', 'classes', 'email'],
        Classes: ['_id', 'year', 'department', 'teacher'],
        Subject: ['_id', 'name', 'teacher']
      },
      baseQuery: { 
        Faculty: { institute: new mongoose.Types.ObjectId(instituteId) },
        Classes: { institute: new mongoose.Types.ObjectId(instituteId) },
        Subject: { institute: new mongoose.Types.ObjectId(instituteId) }
      },
      references: {
        Faculty: {
          'classes': { model: 'Classes', field: '_id', isArray: true }
        },
        Classes: {
          'teacher': { model: 'Faculty', field: '_id' }
        },
        Subject: {
          'teacher': { model: 'Faculty', field: '_id' }
        }
      },
      populate: {
        Faculty: [
          { path: 'classes', model: 'Classes' }
        ]
      }
    },
    'department-service': {
      models: { Department, Faculty, Student, Classes },
      fields: { 
        Department: ['_id', 'name', 'email'],
        Faculty: ['_id', 'department'],
        Student: ['_id', 'academicDetails.department'],
        Classes: ['_id', 'department']
      },
      baseQuery: { 
        Department: { institute: new mongoose.Types.ObjectId(instituteId) },
        Faculty: { institute: new mongoose.Types.ObjectId(instituteId) },
        Student: { 'academicDetails.institute': new mongoose.Types.ObjectId(instituteId) },
        Classes: { institute: new mongoose.Types.ObjectId(instituteId) }
      },
      references: {
        Department: {},
        Faculty: {},
        Student: {},
        Classes: {}
      }
    }
  };

  if (!serviceHandlers[service]) return null;

  const { models, fields, baseQuery, references, populate = {} } = serviceHandlers[service];
  let queries = Object.fromEntries(Object.keys(baseQuery).map(model => [model, { ...baseQuery[model] }]));

  // Add department filter if admin with departmentId
  if (userRole === 'admin' && departmentId) {
    for (const model in queries) {
      const deptField = model === 'Student' ? 'academicDetails.department' : 'department';
      if (model === 'Department') {
        queries[model]['_id'] = new mongoose.Types.ObjectId(departmentId);
      } else if (fields[model].includes(deptField)) {
        queries[model][deptField] = departmentId;
      }
    }
  }

  // Process entities to build query conditions
  entities.forEach(({ entity, value }) => {
    for (const model in fields) {
      // Check if entity matches any field or part of a field
      const matchingFields = fields[model].filter(f => 
        f === entity || 
        f.endsWith(`.${entity}`) || 
        f.includes(entity)
      );
      
      if (matchingFields.length > 0) {
        matchingFields.forEach(field => {
          // Check if field is a reference to another model
          const isReference = field in (references[model] || {});
          const isSubReference = Object.keys(references[model] || {}).some(ref => field.startsWith(ref + '.'));
          
          if (isReference || isSubReference) {
            let refConfig;
            let refField = field;
            
            if (isReference) {
              refConfig = references[model][field];
            } else {
              // Find the parent reference
              const parentRef = Object.keys(references[model]).find(ref => field.startsWith(ref + '.'));
              if (parentRef) {
                refConfig = references[model][parentRef];
                refField = parentRef;
              }
            }

            if (refConfig) {
              try {
                // Handle array references (many-to-many)
                if (refConfig.isArray) {
                  queries[model][field] = { $in: [new mongoose.Types.ObjectId(value)] };
                } else {
                  // Handle single references (one-to-many)
                  queries[model][field] = new mongoose.Types.ObjectId(value);
                }
              } catch (e) {
                // If not a valid ObjectId, fall back to string match
                if (typeof value === 'string') {
                  queries[model][field] = value;
                }
              }
            }
          } else {
            // Use regex for text search on non-reference fields
            if (typeof value === 'string') {
              queries[model][field] = { $regex: value, $options: 'i' };
            } else {
              queries[model][field] = value;
            }
          }
        });
      }
    }
  });
  switch (intent) {
    case 'query': {
      // Choose the most appropriate model based on the query context
      const primaryModelName = determinePrimaryModel(service, entities, question);
      const primaryModel = models[primaryModelName];
      
      if (!primaryModel) return { answer: `Could not determine appropriate model for this query.` };
      
      const record = await primaryModel.findOne(queries[primaryModelName])
        .populate(populate[primaryModelName] || [])
        .lean();
      
      if (!record) return { answer: `No ${service.replace('-service', '')} data found for your query.` };
      
      if (service === 'course-service' && primaryModelName === 'Classes') {
        // Enhanced formatting for Classes
        return formatClassRecord(record);
      }
      
      return { answer: formatRecord(record, fields[primaryModelName], service) };
    }
    
    case 'count': {
      const countModel = determinePrimaryModel(service, entities, question);
      const count = await models[countModel].countDocuments(queries[countModel]);
      return { answer: `Total ${service.replace('-service', '')} records: ${count}` };
    }

    case 'list': {
      const listModel = determinePrimaryModel(service, entities, question);
      const records = await models[listModel]
        .find(queries[listModel])
        .populate(populate[listModel] || [])
        .limit(20)
        .lean();
      
      if (!records.length) return { answer: `No ${service.replace('-service', '')} records found.` };
      
      // Special handling for class lists
      if (service === 'course-service' && listModel === 'Classes') {
        return formatClassesList(records);
      }
      
      return { 
        answer: `Found ${records.length} records`,
        records: records.map(r => formatRecordToObject(r, fields[listModel], service))
      };
    }

    case 'report': {
      // Enhanced reporting capabilities
      if (service === 'feedback-service') {
        const feedbacks = await Feedback.find(queries.Feedback)
          .populate('responses')
          .populate('class')
          .lean();
        
        if (!feedbacks.length) return { answer: 'No feedback data found for report.' };

        const report = feedbacks.map(f => ({
          feedbackTitle: f.feedbackTitle,
          department: f.department,
          class: f.class?.year || 'N/A',
          studentCount: f.students,
          responseCount: f.responses?.length || 0,
          averageRating: calculateAverageRating(f.responses)
        }));

        const chartData = {
          type: 'bar',
          labels: report.map(f => f.feedbackTitle),
          datasets: [
            { label: 'Responses', data: report.map(f => f.responseCount), backgroundColor: 'rgba(75, 192, 192, 0.6)' },
            { label: 'Avg Rating', data: report.map(f => parseFloat(f.averageRating) || 0), backgroundColor: 'rgba(255, 159, 64, 0.6)' }
          ]
        };
        
        return { 
          answer: `Generated feedback report for ${report.length} feedback forms.`, 
          report, 
          chart: chartData 
        };
      }

      if (service === 'course-service') {
        // Check if report is about Classes or Subjects
        if (question.toLowerCase().includes('class') || 
            question.toLowerCase().includes('batch') || 
            entities.some(e => e.entity === 'class' || e.entity === 'year')) {
          
          const classes = await Classes.find(queries.Classes)
            .populate('subjects.sem1')
            .populate('subjects.sem2')
            .populate('teacher')
            .lean();
            
          if (!classes.length) return { answer: 'No class data found for report.' };
          
          const report = classes.map(c => ({
            className: c.year,
            department: c.department,
            studentCount: c.students?.length || 0,
            batchCount: c.batches?.length || 0,
            semesterOneSubjects: c.subjects?.sem1?.length || 0,
            semesterTwoSubjects: c.subjects?.sem2?.length || 0,
            classTeacher: c.teacher?.name || 'Not assigned'
          }));
          
          const chartData = {
            type: 'bar',
            labels: report.map(c => `${c.className} - ${c.department}`),
            datasets: [
              { label: 'Students', data: report.map(c => c.studentCount), backgroundColor: 'rgba(54, 162, 235, 0.6)' },
              { label: 'Sem 1 Subjects', data: report.map(c => c.semesterOneSubjects), backgroundColor: 'rgba(255, 99, 132, 0.6)' },
              { label: 'Sem 2 Subjects', data: report.map(c => c.semesterTwoSubjects), backgroundColor: 'rgba(75, 192, 192, 0.6)' }
            ]
          };
          
          return { 
            answer: `Generated class report for ${report.length} classes.`, 
            report, 
            chart: chartData 
          };
        } else {
          // Subject-focused report
          const subjects = await Subject.find(queries.Subject)
            .populate('class')
            .populate('teacher')
            .lean();
            
          if (!subjects.length) return { answer: 'No course data found for report.' };

          const report = subjects.map(s => ({
            subjectName: s.name,
            subType: s.subType,
            department: s.department,
            semester: s.sem,
            academicYear: s.academicYear,
            classYear: s.class?.year || 'N/A',
            classDepartment: s.class?.department || 'N/A',
            faculty: s.teacher?.name || 'Not assigned',
            studentCount: s.class?.students?.length || 0
          }));

          const chartData = {
            type: 'pie',
            labels: report.map(s => s.subjectName),
            datasets: [{ 
              label: 'Students per Subject', 
              data: report.map(s => s.studentCount), 
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#4BC0C0'] 
            }]
          };
          
          return { 
            answer: `Generated course report for ${report.length} subjects.`, 
            report, 
            chart: chartData 
          };
        }
      }

      if (service === 'attendance-service') {
        // Get subject names for better display
        const subjects = await Subject.find({ institute: instituteId }).lean();
        const subjectMap = Object.fromEntries(subjects.map(s => [s._id.toString(), s.name]));
        
        const attendance = await Attendance.aggregate([
          { $match: queries.Attendance },
          { $unwind: '$records' },
          {
            $group: {
              _id: { subject: '$subject', batch: '$batch', date: '$date' },
              totalStudents: { $sum: 1 },
              presentCount: { $sum: { $cond: [{ $eq: ['$records.status', 'present'] }, 1, 0] } },
              session: { $first: '$session' }
            }
          },
          { $sort: { '_id.date': -1 } }
        ]);

        const report = attendance.map(a => ({
          subject: subjectMap[a._id.subject] || a._id.subject,
          batch: a._id.batch,
          date: new Date(a._id.date).toLocaleDateString(),
          session: a.session,
          totalStudents: a.totalStudents,
          presentCount: a.presentCount,
          attendancePercentage: (a.presentCount / a.totalStudents * 100).toFixed(2)
        }));

        const chartData = {
          type: 'bar',
          labels: report.map(a => `${a.subject} (${a.date})`),
          datasets: [
            { label: 'Attendance %', data: report.map(a => a.attendancePercentage), backgroundColor: 'rgba(54, 162, 235, 0.6)' }
          ]
        };
        
        return { 
          answer: `Generated attendance report for ${report.length} sessions.`, 
          report, 
          chart: chartData 
        };
      }

      if (service === 'faculty-service') {
        const faculty = await Faculty.find(queries.Faculty)
          .populate('classes')
          .lean();
            
        if (!faculty.length) return { answer: 'No faculty data found for report.' };

        // Count subjects taught by each faculty
        const subjectCounts = await Subject.aggregate([
          { $match: { institute: new mongoose.Types.ObjectId(instituteId) } },
          { $group: { _id: '$teacher', count: { $sum: 1 } } }
        ]);
        
        const subjectCountMap = Object.fromEntries(
          subjectCounts.map(s => [s._id?.toString(), s.count])
        );

        const report = faculty.map(f => ({
          name: f.name,
          department: f.department,
          email: f.email || 'N/A',
          classesAssigned: f.classes?.length || 0,
          subjectsTeaching: subjectCountMap[f._id.toString()] || 0
        }));

        const chartData = {
          type: 'bar',
          labels: report.map(f => f.name),
          datasets: [
            { label: 'Classes', data: report.map(f => f.classesAssigned), backgroundColor: 'rgba(255, 99, 132, 0.6)' },
            { label: 'Subjects', data: report.map(f => f.subjectsTeaching), backgroundColor: 'rgba(54, 162, 235, 0.6)' }
          ]
        };
        
        return { 
          answer: `Generated faculty report for ${report.length} faculty members.`, 
          report, 
          chart: chartData 
        };
      }

      // Generic report for other services
      const reportModel = determinePrimaryModel(service, entities, question);
      const reportData = await models[reportModel]
        .find(queries[reportModel])
        .populate(populate[reportModel] || [])
        .lean();
        
      if (!reportData.length) return { 
        answer: `No ${service.replace('-service', '')} data found for report.` 
      };
      
      const report = reportData.map(item => 
        Object.fromEntries(
          fields[reportModel].map(f => {
            const fieldName = f.split('.').pop();
            const value = f.split('.').reduce((o, k) => o?.[k], item);
            return [fieldName, value || 'N/A'];
          })
        )
      );
      
      return { 
        answer: `Generated ${service.replace('-service', '')} report with ${report.length} entries.`, 
        report 
      };
    }

    default:
      return null;
  }
}
function determinePrimaryModel(service, entities, question) {
  const questionLower = question.toLowerCase();
  
  // Map entities to model names based on common patterns
  const entityModelMap = {
    'student': 'Student',
    'class': 'Classes', 
    'faculty': 'Faculty',
    'department': 'Department',
    'subject': 'Subject',
    'course': 'Subject',
    'feedback': 'Feedback',
    'attendance': 'Attendance',
    'response': 'Response',
    'question': 'Questions',
    'batch': 'Classes',
    'year': 'Classes'
  };
  
  // Look for direct entity matches first
  for (const { entity } of entities) {
    if (entityModelMap[entity]) {
      return entityModelMap[entity];
    }
  }
  
  // Check for keywords in the question
  const keywordModelMap = {
    'student': ['student', 'roll', 'admission', 'enrolled'],
    'Classes': ['class', 'batch', 'year', 'semester', 'academic year'],
    'Faculty': ['faculty', 'teacher', 'professor', 'staff'],
    'Department': ['department', 'dept'],
    'Subject': ['subject', 'course', 'syllabus'],
    'Feedback': ['feedback', 'evaluation', 'rating'],
    'Attendance': ['attendance', 'absent', 'present', 'session']
  };
  
  for (const [model, keywords] of Object.entries(keywordModelMap)) {
    if (keywords.some(keyword => questionLower.includes(keyword))) {
      return model;
    }
  }
  
  // Service-specific logic as a fallback
  if (service === 'course-service') {
    if (questionLower.includes('class') || 
        questionLower.includes('batch') || 
        questionLower.includes('year')) {
      return 'Classes';
    }
    return 'Subject';
  }
  
  // Default mappings
  const serviceDefaultMap = {
    'attendance-service': 'Attendance',
    'student-service': 'Student',
    'feedback-service': 'Feedback',
    'course-service': 'Subject',
    'faculty-service': 'Faculty',
    'department-service': 'Department'
  };
  
  return serviceDefaultMap[service] || Object.keys(serviceHandlers[service]?.models || {})[0];
}

// Enhanced formatter for handling object references properly
function formatRecord(record, fields, service) {
  const formattedParts = [];
  
  fields.forEach(field => {
    const keys = field.split('.');
    const fieldName = keys[keys.length - 1];
    
    // Skip internal fields like _id unless specifically requested
    if (fieldName === '_id' && keys.length === 1) return;
    
    let value = record;
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined || value === null) break;
    }
    
    // Skip if value not found
    if (value === undefined || value === null) return;
    
    // Format based on value type
    let formattedValue;
    if (Array.isArray(value)) {
      if (value.length === 0) {
        formattedValue = 'None';
      } else if (typeof value[0] === 'object' && value[0] !== null) {
        // Extract meaningful information from object arrays
        formattedValue = value.map(v => {
          if (v._id) {
            const nameField = v.name || v.subject || v.title || v.year;
            return nameField ? nameField : v._id.toString();
          }
          return v.name || v.subject || v.id || JSON.stringify(v);
        }).join(', ');
      } else {
        formattedValue = value.join(', ');
      }
    } else if (value instanceof Date) {
      formattedValue = value.toLocaleDateString();
    } else if (typeof value === 'object' && value !== null) {
      // Handle ObjectId and other objects
      if (value._id) {
        formattedValue = value.name || value.subject || value.title || value.year || value._id.toString();
      } else {
        formattedValue = JSON.stringify(value);
      }
    } else {
      formattedValue = String(value);
    }
    
    formattedParts.push(`${fieldName}: ${formattedValue}`);
  });
  
  return formattedParts.join(', ');
}

function formatRecordToObject(record, fields, service) {
  // Format record as object for structured data
  return Object.fromEntries(fields.map(field => {
    const keys = field.split('.');
    const fieldName = keys.pop();
    let value = keys.reduce((obj, key) => obj?.[key], record);
    
    // Format values appropriately
    if (Array.isArray(value)) {
      if (typeof value[0] === 'object' && value[0] !== null) {
        value = value.map(v => v.name || v.subject || v.id || v._id);
      }
    } else if (value instanceof Date) {
      value = value.toLocaleDateString();
    } else if (value === null || value === undefined) {
      value = 'N/A';
    } else if (typeof value === 'object' && value !== null) {
      value = value.name || value.subject || value._id || JSON.stringify(value);
    }
    
    return [fieldName, value];
  }));
}

function formatClassRecord(classRecord) {
  const result = {
    className: classRecord.year,
    department: classRecord.department,
    studentCount: classRecord.students?.length || 0,
    batches: classRecord.batches?.map(b => ({
      id: b.id,
      type: b.type,
      studentCount: b.students?.length || 0
    })) || [],
    subjects: {
      sem1: classRecord.subjects?.sem1?.map(s => s.name || s) || [],
      sem2: classRecord.subjects?.sem2?.map(s => s.name || s) || []
    },
    classTeacher: classRecord.teacher?.name || 'Not assigned'
  };
  
  return { 
    answer: `Class: ${result.className} (${result.department}), Students: ${result.studentCount}, Batches: ${result.batches.length}`,
    classData: result
  };
}

function formatClassesList(classes) {
  const formattedClasses = classes.map(c => ({
    className: c.year,
    department: c.department,
    studentCount: c.students?.length || 0,
    batchCount: c.batches?.length || 0,
    subjectCount: (c.subjects?.sem1?.length || 0) + (c.subjects?.sem2?.length || 0),
    teacher: c.teacher?.name || 'Not assigned'
  }));
  
  return { 
    answer: `Found ${classes.length} classes`,
    classes: formattedClasses
  };
}

function calculateAverageRating(responses) {
  if (!responses || !responses.length) return 'N/A';
  
  let totalRating = 0;
  let ratingCount = 0;
  
  responses.forEach(response => {
    if (response?.ratings?.length) {
      response.ratings.forEach(subj => {
        if (Array.isArray(subj.ratings) && subj.ratings.length) {
          const sum = subj.ratings.reduce((a, b) => a + Number(b), 0);
          totalRating += sum;
          ratingCount += subj.ratings.length;
        }
      });
    }
  });
  
  return ratingCount > 0 ? (totalRating / ratingCount).toFixed(2) : 'N/A';
}