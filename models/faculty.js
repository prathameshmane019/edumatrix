import mongoose from 'mongoose';

const FacultySchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    classes: {
        type: String,
        ref: 'Classes'  // Ensure correct reference to Class model
    },
    department: {
        type: String
    },
    password: {
        type: String
    },

    currentYear:{
        type:String
    },
    sem:{
        type:String
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    institute: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Institute', 
    required: true 
  },
}, {
    timestamps: true,
});

const Faculty = mongoose.models.Faculty || mongoose.model('Faculty', FacultySchema);
export default Faculty;
