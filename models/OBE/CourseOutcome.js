
// models/CourseOutcome.js
import mongoose from 'mongoose';

const CoPoMappingSchema = new mongoose.Schema({
  programOutcome: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProgramOutcome',
    required: true,
  },
  correlationLevel: { // How strongly this CO maps to the PO
    type: Number, // e.g., 1 (Low), 2 (Medium), 3 (High) - Define your scale
    required: true,
    min: 1,
    max: 3, // Adjust as per your institution's standard
  },
}, { _id: false });

const CourseOutcomeSchema = new mongoose.Schema({
  code: { // e.g., C101.1, C101.2 (CourseCode.CO_Number)
    type: String,
    required: [true, 'Course Outcome code is required'],
    trim: true,
    uppercase: true,
  },
  description: {
    type: String,
    required: [true, 'Course Outcome description is required'],
    trim: true,
  },
  subject: { // Link to the specific subject
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
    index: true,
  },
  cognitiveLevel: { // Optional: Bloom's Taxonomy Level (Remember, Understand, Apply, Analyze, Evaluate, Create)
    type: String,
    enum: ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create', 'N/A'],
    default: 'N/A',
  },
  poMapping: { // Mapping to Program Outcomes
    type: [CoPoMappingSchema],
    validate: [v => Array.isArray(v) && v.length > 0, 'At least one PO mapping is required']
  },
  // No need for institute/department/academicYear here as it's derived from the linked Subject
}, { timestamps: true });

// Ensure uniqueness for code within a subject
CourseOutcomeSchema.index({ code: 1, subject: 1 }, { unique: true });

const CourseOutcome = mongoose.models.CourseOutcome || mongoose.model('CourseOutcome', CourseOutcomeSchema);
export default CourseOutcome;
