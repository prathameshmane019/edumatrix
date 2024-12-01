import mongoose from "mongoose";

const { Schema, model } = mongoose;

const departmentSchema = new Schema(
  {
    department: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    institute: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Institute', 
      required: true 
    },
  },
  {
    timestamps: true,
  }
);

const Department =
  mongoose.models.Department || model("Department", departmentSchema);

export default Department;
