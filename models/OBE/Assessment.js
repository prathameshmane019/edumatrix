
// models/Assessment.js
import mongoose from 'mongoose';

const AssessmentCoMappingSchema = new mongoose.Schema({
  courseOutcome: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseOutcome',
    required: true,
  },
  maxMarks: { // Max marks allocated to this CO within this assessment component
    type: Number,
    required: true,
    min: 0,
  },
  // Optional: Add question numbers if needed
  // questionNumbers: [String]
}, { _id: false });

const AssessmentSchema = new mongoose.Schema({
  name: { // e.g., Mid-Term Exam, Quiz 1, Lab Assignment 2, Final Project
    type: String,
    required: true,
    trim: true,
  },
  type: { // Categorize assessments
    type: String,
    enum: ['Exam', 'Quiz', 'Assignment', 'Lab', 'Project', 'Presentation', 'Other'],
    required: true,
  },
  subject: { // Link to the specific subject
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
    enum: ['sem1', 'sem2'], // Align with your Subject schema
    required: true,
  },
  maxMarks: { // Total max marks for this assessment
    type: Number,
    required: true,
    min: 0,
  },
  assessmentDate: {
    type: Date,
  },
  coMapping: { // How marks are distributed among COs for this assessment
    type: [AssessmentCoMappingSchema],
    validate: [
      function(v) { // Use function to access `this`
          const totalMappedMarks = v.reduce((sum, item) => sum + item.maxMarks, 0);
          // Allow for slight floating point inaccuracies if necessary, or enforce exact match
          // return Math.abs(totalMappedMarks - this.maxMarks) < 0.01;
          return totalMappedMarks === this.maxMarks;
      },
      'Total marks mapped to COs must equal the assessment\'s total maxMarks'
    ]
  },
  // Add institute/department implicitly via Subject reference if needed downstream
}, { timestamps: true });

const Assessment = mongoose.models.Assessment || mongoose.model('Assessment', AssessmentSchema);
export default Assessment;
