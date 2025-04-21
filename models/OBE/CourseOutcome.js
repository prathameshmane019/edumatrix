import mongoose from 'mongoose';

const OutcomeItemSchema = new mongoose.Schema(
  {
    index: {
      type: Number,
      required: [true, "Outcome index is required"],
      min: [1, "Index must be a positive integer"],
      validate: {
        validator: Number.isInteger,
        message: "Index must be an integer",
      },
    },
    description: {
      type: String,
      required: [true, "Outcome description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    cognitiveLevel: {
      type: String,
      enum: ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create', 'N/A'],
      default: 'N/A',
    },
    mappings: [
      {
        outcomeType: {
          type: String,
          enum: ['PO', 'PSO'],
          required: [true, 'Outcome type is required'],
        },
        outcomeIndex: {
          type: Number,
          required: [true, 'Outcome index is required'],
          min: [1, 'Index must be a positive integer'],
          validate: {
            validator: Number.isInteger,
            message: 'Index must be an integer',
          },
        },
        correlationLevel: {
          type: Number,
          required: [true, 'Correlation level is required'],
          min: [1, 'Correlation level must be between 1 and 3'],
          max: [3, 'Correlation level must be between 1 and 3'],
          validate: {
            validator: Number.isInteger,
            message: 'Correlation level must be an integer',
          },
        },
        justification: {
          type: String,
          trim: true,
          maxlength: [500, 'Justification cannot exceed 500 characters'],
        },
      },
    ],
  },
  { _id: false }
);

const CourseOutcomeSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject reference is required'],
      index: true,
    },
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institute',
      required: [true, 'Institute reference is required'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      trim: true,
    },
    outcomes: {
      type: [OutcomeItemSchema],
      required: [true, 'At least one outcome is required'],
      validate: [v => Array.isArray(v) && v.length > 0, 'At least one outcome is required'],
    },
    programOutcome: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProgramOutcome',
      required: [true, 'Program outcome reference is required'],
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Under Review', 'Approved'],
      default: 'Draft',
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

CourseOutcomeSchema.index({ subject: 1, programOutcome: 1, academicYear: 1 }, { unique: true });

CourseOutcomeSchema.virtual('mappingStats').get(function () {
  const stats = {
    total: 0,
    byLevel: { 1: 0, 2: 0, 3: 0 },
    byType: { PO: 0, PSO: 0 },
  };

  this.outcomes.forEach((outcome) => {
    if (outcome.mappings && outcome.mappings.length > 0) {
      stats.total += outcome.mappings.length;
      outcome.mappings.forEach((mapping) => {
        stats.byLevel[mapping.correlationLevel]++;
        stats.byType[mapping.outcomeType]++;
      });
    }
  });

  return stats;
});

CourseOutcomeSchema.pre("save", function (next) {
  const indexSet = new Set();
  for (const outcome of this.outcomes) {
    if (indexSet.has(outcome.index)) {
      const error = new mongoose.Error.ValidationError(this);
      error.errors['outcomes.index'] = new mongoose.Error.ValidatorError({
        message: `Duplicate Course Outcome index ${outcome.index} found`,
        path: 'outcomes.index',
        value: outcome.index,
      });
      return next(error);
    }
    indexSet.add(outcome.index);
  }
  next();
});

const CourseOutcome = mongoose.models.CourseOutcome || mongoose.model('CourseOutcome', CourseOutcomeSchema);

export default CourseOutcome;