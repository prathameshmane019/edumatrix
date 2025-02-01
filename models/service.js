// src/models/serviceModel.ts
import mongoose, { Schema } from 'mongoose';


const ServiceSchema = new Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete ret.id;  // Ensure 'id' is not included
    }
  },
  toObject: {
    transform: (doc, ret) => {
      delete ret.id;  // Ensure 'id' is not included
    }
  }
});

const Service = mongoose.models.Service || mongoose.model('Service', ServiceSchema);
export default Service;