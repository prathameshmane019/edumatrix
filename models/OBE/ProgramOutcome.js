// models/ProgramOutcome.js
import mongoose from 'mongoose';

const ProgramOutcomeSchema = new mongoose.Schema({
  index: { // Numerical index (e.g., 1, 2, 3)
    type: Number,
    required: [true, 'Index is required'],
    min: [1, 'Index must be 1 or greater']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  type: { // To distinguish between PO and PSO
    type: String,
    enum: ['PO', 'PSO'],
    required: [true, 'Type (PO or PSO) is required'], // Make type mandatory
  },
  department: { // POs/PSOs are typically department-specific
    type: String, // Or mongoose.Schema.Types.ObjectId, ref: 'Department'
    required: true,
    index: true,
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institute',
    required: true,
    index: true,
  },
  academicYear: { // POs/PSOs might be revised over years
    type: String,
    required: true,
  },
}, { timestamps: true });

// Ensure uniqueness for index+type within a department, institute, and academic year
// e.g., PO index 1 is different from PSO index 1 for the same dept/inst/year
ProgramOutcomeSchema.index({ index: 1, type: 1, department: 1, institute: 1, academicYear: 1 }, { unique: true });

const ProgramOutcome = mongoose.models.ProgramOutcome || mongoose.model('ProgramOutcome', ProgramOutcomeSchema);
export default ProgramOutcome;