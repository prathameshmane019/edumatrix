// models/ProgramOutcome.js
import mongoose from 'mongoose';

const ProgramOutcomeSchema = new mongoose.Schema({
  code: { // e.g., PO1, PO2, PSO1
    type: String,
    required: [true, 'Program Outcome code is required'],
    trim: true,
    uppercase: true,
  },
  description: {
    type: String,
    required: [true, 'Program Outcome description is required'],
    trim: true,
  },
  type: { // To distinguish between PO and PSO if needed
    type: String,
    enum: ['PO', 'PSO'],
    default: 'PO',
  },
  department: { // POs/PSOs are typically department-specific
    type: String, // Or mongoose.Schema.Types.ObjectId, ref: 'Department' if you use ObjectIds for departments
    required: true,
    index: true,
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institute',
    required: true,
    index: true,
  },
  academicYear: { // POs might be revised over years
    type: String,
    required: true,
  },
}, { timestamps: true });

// Ensure uniqueness for code within a department, institute, and academic year
ProgramOutcomeSchema.index({ code: 1, department: 1, institute: 1, academicYear: 1 }, { unique: true });

const ProgramOutcome = mongoose.models.ProgramOutcome || mongoose.model('ProgramOutcome', ProgramOutcomeSchema);
export default ProgramOutcome;