// models/Assessment.js
import mongoose from 'mongoose';

const AssessmentCoMappingSchema = new mongoose.Schema({
  // This still references the main CourseOutcome *document*
  courseOutcome: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseOutcome',
    required: true,
  },
  // *** NEW: Reference to the index of the specific OutcomeItem within the outcomes array of the CourseOutcome document ***
  coIndex: {
      type: Number,
      required: true,
      min: 1, // Assuming CO indices start from 1
      validate: {
          validator: Number.isInteger,
          message: 'CO Index must be an integer'
      }
  },
  maxMarks: { // Max marks allocated to this specific CO within this assessment component
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
          if (this.maxMarks === undefined || this.maxMarks < 0) {
              // Cannot validate sum if maxMarks is invalid or missing
              return true;
          }
          if (!v || v.length === 0) {
               // If no COs are mapped, sum is 0. Validate against total maxMarks.
               return this.maxMarks === 0;
          }
          const totalMappedMarks = v.reduce((sum, item) => sum + item.maxMarks, 0);
          // Use a small tolerance for floating point comparison
          // Or, ideally, enforce integer marks or use a fixed-point representation if decimals are critical
          return Math.abs(totalMappedMarks - this.maxMarks) < 0.001; // Use a small epsilon
      },
      'Total marks mapped to COs must equal the assessment\'s total maxMarks' // Plain text message
    ],
    // Ensure that coMapping items reference a valid CO index within the specified CourseOutcome document
    // This validation would ideally happen in the API handler before saving,
    // as it requires querying the CourseOutcome document.
    // Mongoose schema validation is limited for complex checks like this.
  },
  // Add institute/department implicitly via Subject reference if needed downstream
}, { timestamps: true });

const Assessment = mongoose.models.Assessment || mongoose.model('Assessment', AssessmentSchema);
export default Assessment;