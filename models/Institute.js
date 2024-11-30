import mongoose from 'mongoose';

const InstituteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  instituteCode: {
    type: String,
    required: true,
    unique: true
  },
  address: {
    type: String,
    required: true
  },
  contact: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  }, 
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Institute = mongoose.models.Institute || mongoose.model('Institute', InstituteSchema);
export default Institute;
