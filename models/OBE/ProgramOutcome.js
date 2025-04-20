import mongoose from 'mongoose';

// Schema for individual Outcome items (PO or PSO)
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
        }
    },
    { _id: false } // Don't create separate _ids for each outcome item
);

// Main schema that holds arrays of POs and PSOs for each institute, department, and academic year
const ProgramOutcomeSchema = new mongoose.Schema(
    {
        institute: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Institute",
            required: [true, "Institute ID is required"]
        },
        department: {
            type: String,
            required: [true, "Department is required"],
            trim: true
        },
        academicYear: {
            type: String,
            required: [true, "Academic year is required"],
            trim: true
        },
        programOutcomes: [OutcomeItemSchema],
        programSpecificOutcomes: [OutcomeItemSchema]
    },
    {
        timestamps: true
    }
);

// Compound unique index to ensure one document per institute, department, and academic year
ProgramOutcomeSchema.index(
    { institute: 1, department: 1, academicYear: 1 },
    { unique: true }
);

// Pre-save hook to ensure index uniqueness within the programOutcomes array
ProgramOutcomeSchema.pre("save", function(next) {
    const poIndexSet = new Set();
    for (const po of this.programOutcomes) {
        if (poIndexSet.has(po.index)) {
            const error = new mongoose.Error.ValidationError(this);
            error.errors['programOutcomes.index'] = new mongoose.Error.ValidatorError({
                message: `Duplicate Program Outcome index ${po.index} found`,
                path: 'programOutcomes.index',
                value: po.index
            });
            return next(error);
        }
        poIndexSet.add(po.index);
    }

    const psoIndexSet = new Set();
    for (const pso of this.programSpecificOutcomes) {
        if (psoIndexSet.has(pso.index)) {
            const error = new mongoose.Error.ValidationError(this);
            error.errors['programSpecificOutcomes.index'] = new mongoose.Error.ValidatorError({
                message: `Duplicate Program Specific Outcome index ${pso.index} found`,
                path: 'programSpecificOutcomes.index',
                value: pso.index
            });
            return next(error);
        }
        psoIndexSet.add(pso.index);
    }

    next();
});

const ProgramOutcome = mongoose.models.ProgramOutcome ||
    mongoose.model("ProgramOutcome", ProgramOutcomeSchema);

export default ProgramOutcome;