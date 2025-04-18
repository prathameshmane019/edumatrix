
// models/StudentResult.js
import mongoose from 'mongoose';

const CoMarksSchema = new mongoose.Schema({
  courseOutcome: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseOutcome',
    required: true,
  },
  marksObtained: {
    type: Number,
    required: true,
    min: 0,
  },
  // Add maxMarks for this CO in this assessment for context (can be derived but useful)
  maxMarks: {
      type: Number,
      required: true,
  }
}, { _id: false });

const StudentResultSchema = new mongoose.Schema({
  student: { // Link to the student
    type: String, // Assuming student _id is String as per your schema
    ref: 'Student',
    required: true,
    index: true,
  },
  assessment: { // Link to the assessment
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment',
    required: true,
    index: true,
  },
  subject: { // Denormalized for easier querying, derivable from assessment
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
    index: true,
  },
  academicYear: { // Denormalized
    type: String,
    required: true,
  },
  sem: { // Denormalized
    type: String,
    enum: ['sem1', 'sem2'],
    required: true,
  },
  marksBreakdown: { // Marks obtained per CO for this assessment
    type: [CoMarksSchema],
    required: true,
  },
  totalMarksObtained: { // Sum of marksBreakdown.marksObtained
    type: Number,
    required: true,
    min: 0,
  },
  // Optional: Add fields like enteredBy (faculty ref), entryDate etc.
  // enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },

}, { timestamps: true });

// Ensure a student has only one result entry per assessment
StudentResultSchema.index({ student: 1, assessment: 1 }, { unique: true });

// Pre-save hook to calculate totalMarksObtained and ensure consistency
StudentResultSchema.pre('save', function(next) {
  this.totalMarksObtained = this.marksBreakdown.reduce((sum, item) => sum + item.marksObtained, 0);
  // Add validation: Ensure obtained marks don't exceed max marks for each CO
  const assessmentMaxMarksMap = new Map(); // You might need to fetch Assessment details here if not passed in
  // This pre-hook might become complex if it needs async fetching.
  // Consider doing validation in the API route instead.
  next();
});


const StudentResult = mongoose.models.StudentResult || mongoose.model('StudentResult', StudentResultSchema);
export default StudentResult;