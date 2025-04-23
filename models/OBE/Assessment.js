// models/OBE/Assessment.js
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
      message: 'CO Index must be an integer'
    }
  },
  maxMarks: {
    type: Number,
    required: true,
    min: 0,
  },
}, { _id: false });

// New schema for student marks
const StudentMarkSchema = new mongoose.Schema({
  // Changed 'student' type to ObjectId if it's an actual reference to a Student document
  // If it's just a unique string identifier, keep it as String.
  // Based on the backend logic using `mark.student === studentIdentifier` and `ref: 'Student'`,
  // it seems intended to be an ObjectId reference. Let's change it to ObjectId.
  // However, the backend logic currently uses it as a String identifier ('student_roll_timestamp').
  // For now, keep it as String to match the backend's usage, but note this inconsistency.
  // A better design would be to store Mongoose.Types.ObjectId references to a Student collection.
  student: {
    type: String, // Keeping as String to match current backend logic, but ideally should be ObjectId ref
    // ref: 'Student', // Ref is conceptual if type is String and no actual populate is used on it this way
    required: true,
    unique: true, // Ensure uniqueness of student identifier within the array
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
  marks: {
    type: Number,
    default: null, // null indicates not evaluated yet
    min: 0,
    validate: {
      validator: function (v) {
        // Allow null values for unevaluated students
        if (v === null || v === undefined) return true; // Also allow undefined
        // Marks should not exceed assessment's maxMarks if maxMarks is defined and non-negative
        const maxMarks = this.parent().parent().maxMarks;
        return maxMarks === undefined || maxMarks < 0 || (v >= 0 && v <= maxMarks);
      },
      message: props => {
        const maxMarks = props.instance.parent().parent().maxMarks;
        return `Marks (${props.value}) must be a non-negative number${maxMarks !== undefined && maxMarks >= 0 ? ` not exceeding ${maxMarks}` : ''}`;
      }
    }
  },

}, { _id: false }); // Explicitly do not add _id to subdocuments

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
    required: true, // Ensure coMapping is always present
    validate: [
      function (v) {
        if (this.maxMarks === undefined || this.maxMarks < 0) {
          return true; // Validation doesn't apply if maxMarks is invalid or missing
        }
        // Allow empty coMapping if maxMarks is 0, otherwise require total mapped marks to match maxMarks
        if (!v || v.length === 0) {
          return this.maxMarks === 0;
        }
        const totalMappedMarks = v.reduce((sum, item) => sum + item.maxMarks, 0);
        return Math.abs(totalMappedMarks - this.maxMarks) < 0.001;
      },
      'Total marks mapped to COs must equal the assessment\'s total maxMarks'
    ],
  },
  // Add studentMarks directly to the assessment
  studentMarks: {
    type: [StudentMarkSchema],
    default: [],
    // Mongoose will automatically add a unique validator for the 'student' field
    // within the array due to `unique: true` in StudentMarkSchema.
    // No need for a custom validator here for uniqueness of student.
  },
}, { timestamps: true });

// Indexes for better performance
AssessmentSchema.index({ subject: 1, academicYear: 1, sem: 1 });
// Index on the 'student' field within studentMarks for faster lookups
AssessmentSchema.index({ 'studentMarks.student': 1 });
// Index on rollNumber within studentMarks might also be useful
AssessmentSchema.index({ 'studentMarks.rollNumber': 1 });


// Virtual to get statistics about marks
AssessmentSchema.virtual('markStats').get(function () {
  const marks = this.studentMarks.map(sm => sm.marks).filter(m => m !== null && m !== undefined);
  const evaluatedCount = marks.length;
  const totalCount = this.studentMarks.length;

  if (evaluatedCount === 0) {
    return {
      count: totalCount, // Total number of student entries
      evaluatedCount: 0,
      average: 0,
      highest: 0,
      lowest: 0
    };
  }

  return {
    count: totalCount, // Total number of student entries
    evaluatedCount: evaluatedCount, // Number of students with non-null marks
    average: marks.reduce((sum, mark) => sum + mark, 0) / evaluatedCount,
    highest: Math.max(...marks),
    lowest: Math.min(...marks),
  };
});

const Assessment = mongoose.models.Assessment || mongoose.model('Assessment', AssessmentSchema);
export default Assessment;