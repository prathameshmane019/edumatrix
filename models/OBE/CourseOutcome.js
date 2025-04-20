// models/CourseOutcome.js
import mongoose from 'mongoose';
import Subject from '../subject';
// Schema for CO-PO/PSO mapping
const OutcomeMappingSchema = new mongoose.Schema({
  outcomeType: {
    type: String,
    enum: ['PO', 'PSO'],
    required: true
  },
  outcomeIndex: {
    type: Number,
    required: [true, 'Outcome index is required'],
    min: [1, 'Index must be a positive integer'],
    validate: {
      validator: Number.isInteger,
      message: 'Index must be an integer'
    }
  },
  correlationLevel: {
    type: Number, // e.g., 1 (Low), 2 (Medium), 3 (High)
    required: true,
    min: 1,
    max: 3, // Adjust as per your institution's standard
  }
}, { _id: false });

// Schema for individual Course Outcome items
const OutcomeItemSchema = new mongoose.Schema(
  {
    index: {
      type: Number,
      required: [true, "Outcome index is required"],
      min: [1, "Index must be a positive integer"],
      validate: {
        validator: Number.isInteger,
        message: "Index must be an integer"
      }
    },
    description: {
      type: String,
      required: [true, "Outcome description is required"],
      trim: true
    },
    cognitiveLevel: { 
      type: String,
      enum: ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create', 'N/A'],
      default: 'N/A',
    },
   
  },
  { _id: false } // Don't create separate _ids for each outcome item
);

const CourseOutcomeSchema = new mongoose.Schema({
  subject: { // Link to the specific subject
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
    index: true,
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institute',
    required: true,
  },
  department: {
    type:String
  },
  academicYear:{
    type:String
  },
  outcomes: {
    type: [OutcomeItemSchema],
    required: [true, 'At least one outcome is required'],
    validate: [v => Array.isArray(v) && v.length > 0, 'At least one outcome is required']
  },
   mappings: {
    type: [OutcomeMappingSchema],
  },
  programOutcome: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProgramOutcome',
    required: true,
    // This links to the specific ProgramOutcome document that contains the 
    // relevant POs and PSOs for this course's institute/department/academicYear
  }
}, { timestamps: true });

// Ensure uniqueness for subject and program outcome combination
CourseOutcomeSchema.index({ subject: 1, programOutcome: 1 }, { unique: true });

// Pre-save hook to ensure index uniqueness within the outcomes array
CourseOutcomeSchema.pre("save", function(next) {
  const indexSet = new Set();
  for (const outcome of this.outcomes) {
    if (indexSet.has(outcome.index)) {
      const error = new mongoose.Error.ValidationError(this);
      error.errors['outcomes.index'] = new mongoose.Error.ValidatorError({
        message: `Duplicate Course Outcome index ${outcome.index} found`,
        path: 'outcomes.index',
        value: outcome.index
      });
      return next(error);
    }
    indexSet.add(outcome.index);
  }
  next();
});

const CourseOutcome = mongoose.models.CourseOutcome || mongoose.model('CourseOutcome', CourseOutcomeSchema);

export default CourseOutcome;