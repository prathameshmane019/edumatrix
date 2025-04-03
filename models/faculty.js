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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classes'  // Ensure correct reference to Class model
    },
    department: {
        type: String
    },
    password: {
        type: String
    },
    currentYear:{
        type: String
    },
    sem:{
        type: String
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
    // Added fields
    contact: {
        type: String
    },
    dateOfBirth: {
        type: Date
    },
    address: {
        type: String
    },
    gender: {
        type: String
    },
    designation: {
        type: String
    },
    employmentType: {
        type: String,
        enum: ['teaching', 'non-teaching']
    },
    dateOfJoining: {
        type: Date
    },
    education: {
        highestDegree: {
            type: String
        },
        specialization: {
            type: String
        },
        university: {
            type: String
        },
        yearOfPassing: {
            type: Number
        }
    }
}, {
    timestamps: true,
});

const Faculty = mongoose.models.Faculty || mongoose.model('Faculty', FacultySchema);
export default Faculty;