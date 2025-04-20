// models/ProgramEducationalObjectives.js
import mongoose from "mongoose";

// Schema for individual PEO items
const PEOItemSchema = new mongoose.Schema(
  {
    index: {
      type: Number,
      required: [true, "PEO index is required"],
      min: [1, "Index must be a positive integer"],
      validate: {
        validator: Number.isInteger,
        message: "Index must be an integer"
      }
    },
    description: {
      type: String,
      required: [true, "PEO description is required"],
      trim: true
    }
  },
  { _id: false } // Don't create separate _ids for each PEO item
);

// Main schema that holds arrays of PEOs for each institute and academic year
const ProgramEducationalObjectivesSchema = new mongoose.Schema(
  {
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: [true, "Institute ID is required"]
    },
    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
      trim: true
    },
    objectives: [PEOItemSchema]
  },
  {
    timestamps: true
  }
);

// Compound unique index to ensure one document per institute and academic year
ProgramEducationalObjectivesSchema.index(
  { institute: 1, academicYear: 1 },
  { unique: true }
);

// Add pre-save hook to ensure index uniqueness within the objectives array
ProgramEducationalObjectivesSchema.pre("save", function(next) {
  const indexSet = new Set();
  for (const peo of this.objectives) {
    if (indexSet.has(peo.index)) {
      const error = new mongoose.Error.ValidationError(this);
      error.errors.index = new mongoose.Error.ValidatorError({
        message: `Duplicate PEO index ${peo.index} found`,
        path: 'objectives.index',
        value: peo.index
      });
      return next(error);
    }
    indexSet.add(peo.index);
  }
  next();
});

// Create model only if it doesn't already exist
const ProgramEducationalObjectives = mongoose.models.ProgramEducationalObjectives ||
  mongoose.model("ProgramEducationalObjectives", ProgramEducationalObjectivesSchema);

export default ProgramEducationalObjectives;