import mongoose from 'mongoose';

const AssessmentCoMappingSchema = new mongoose.Schema({
  courseOutcome: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseOutcome',
    required: true,
  },
  coIndex: {
    type: Number,
    required: true,
    min: 1,
    validate: {
      validator: Number.isInteger,
      message: 'CO Index must be an integer',
    },
  },
  maxMarks: {
    type: Number,
    required: true,
    min: 0,
  },
}, { _id: false });

// ✅ New schema for individual CO marks per student
const StudentCOMarkSchema = new mongoose.Schema({
  coIndex: {
    type: Number,
    required: true,
    min: 1,
  },
  marks: {
    type: Number,
    required: true,
    min: 0,
  },
}, { _id: false });

// ✅ Updated student mark schema to support CO-wise marks
const StudentMarkSchema = new mongoose.Schema({
  student: {
    type: String,
    required: true,
    unique: true,
  },
  rollNumber: {
    type: String,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  totalMarks: {
    type: Number,
    default: null,
    min: 0,
  },
  coMarks: {
    type: [StudentCOMarkSchema],
    validate: {
      validator: function (v) {
        return v.every(mark => mark.marks !== undefined && mark.marks >= 0);
      },
      message: 'All CO marks must be non-negative and defined.'
    },
  },
}, { _id: false });

const AssessmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['Exam', 'Quiz', 'Assignment', 'Lab', 'Project', 'Presentation', 'Other'],
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
    index: true,
  },
  academicYear: {
    type: String,
    required: true,
  },
  sem: {
    type: String,
    enum: ['sem1', 'sem2'],
    required: true,
  },
  maxMarks: {
    type: Number,
    required: true,
    min: 0,
  },
  assessmentDate: {
    type: Date,
  },
  coMapping: {
    type: [AssessmentCoMappingSchema],
    required: true,
    validate: [
      function (v) {
        if (this.maxMarks === undefined || this.maxMarks < 0) return true;
        if (!v || v.length === 0) return this.maxMarks === 0;
        const totalMappedMarks = v.reduce((sum, item) => sum + item.maxMarks, 0);
        return Math.abs(totalMappedMarks - this.maxMarks) < 0.001;
      },
      'Total marks mapped to COs must equal the assessment\'s total maxMarks'
    ],
  },
  studentMarks: {
    type: [StudentMarkSchema],
    default: [],
  },
}, { timestamps: true });

AssessmentSchema.index({ subject: 1, academicYear: 1, sem: 1 });
AssessmentSchema.index({ 'studentMarks.student': 1 });
AssessmentSchema.index({ 'studentMarks.rollNumber': 1 });

AssessmentSchema.virtual('markStats').get(function () {
  const marks = this.studentMarks.map(sm => sm.totalMarks).filter(m => m !== null && m !== undefined);
  const evaluatedCount = marks.length;
  const totalCount = this.studentMarks.length;

  if (evaluatedCount === 0) {
    return {
      count: totalCount,
      evaluatedCount: 0,
      average: 0,
      highest: 0,
      lowest: 0,
    };
  }

  return {
    count: totalCount,
    evaluatedCount,
    average: marks.reduce((sum, mark) => sum + mark, 0) / evaluatedCount,
    highest: Math.max(...marks),
    lowest: Math.min(...marks),
  };
});

const Assessment = mongoose.models.Assessment || mongoose.model('Assessment', AssessmentSchema);
export default Assessment;
