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

// Improved virtual getter with comprehensive error handling
CourseOutcomeSchema.virtual('mappingStats').get(function () {
  // Default stats object with safe initial values
  const stats = {
    total: 0,
    byLevel: { 1: 0, 2: 0, 3: 0 },
    byType: { PO: 0, PSO: 0 },
  };

  try {
    // Guard clause: ensure outcomes exists and is an array
    if (!this.outcomes || !Array.isArray(this.outcomes)) {
      return stats;
    }

    // Process each outcome safely
    this.outcomes.forEach((outcome) => {
      // Skip invalid outcomes or those without mappings
      if (!outcome || !outcome.mappings || !Array.isArray(outcome.mappings)) {
        return;
      }
      
      // Count valid mappings
      stats.total += outcome.mappings.length;
      
      // Process each mapping safely
      outcome.mappings.forEach((mapping) => {
        // Skip invalid mappings
        if (!mapping) return;
        
        // Safely increment level counters using optional chaining and nullish coalescing
        const level = mapping.correlationLevel;
        if (level && [1, 2, 3].includes(level)) {
          stats.byLevel[level] = (stats.byLevel[level] || 0) + 1;
        }
        
        // Safely increment type counters
        const type = mapping.outcomeType;
        if (type && ['PO', 'PSO'].includes(type)) {
          stats.byType[type] = (stats.byType[type] || 0) + 1;
        }
      });
    });
  } catch (error) {
    // Log error but don't crash - return default stats
    console.error('Error calculating mappingStats:', error);
  }

  return stats;
});

// Pre-save hook to ensure unique outcome indices
CourseOutcomeSchema.pre("save", function (next) {
  try {
    const indexSet = new Set();
    
    if (!this.outcomes || !Array.isArray(this.outcomes)) {
      const error = new mongoose.Error.ValidationError(this);
      error.errors['outcomes'] = new mongoose.Error.ValidatorError({
        message: 'Outcomes must be a non-empty array',
        path: 'outcomes',
        value: this.outcomes,
      });
      return next(error);
    }
    
    for (const outcome of this.outcomes) {
      if (!outcome || !outcome.index) {
        const error = new mongoose.Error.ValidationError(this);
        error.errors['outcomes.index'] = new mongoose.Error.ValidatorError({
          message: 'Each outcome must have a valid index',
          path: 'outcomes.index',
          value: outcome ? outcome.index : undefined,
        });
        return next(error);
      }
      
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
  } catch (error) {
    next(error);
  }
});

// Optional: Add a method to safely get a specific outcome by index
CourseOutcomeSchema.methods.getOutcomeByIndex = function(index) {
  if (!this.outcomes || !Array.isArray(this.outcomes)) {
    return null;
  }
  return this.outcomes.find(outcome => outcome && outcome.index === index) || null;
};

// Fix for serialization issues - add a toJSON transform
CourseOutcomeSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    // Ensure mappingStats is safely calculated
    try {
      ret.mappingStats = doc.mappingStats;
    } catch (error) {
      // If error occurs during virtual calculation, provide default
      ret.mappingStats = {
        total: 0,
        byLevel: { 1: 0, 2: 0, 3: 0 },
        byType: { PO: 0, PSO: 0 },
      };
    }
    return ret;
  }
});

const CourseOutcome = mongoose.models.CourseOutcome || mongoose.model('CourseOutcome', CourseOutcomeSchema);

export default CourseOutcome;