import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        unique: true
    },
    rollNumber: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    phoneNo: {
        type: String
    },
    password: {
        type: String
    },
    department: {
        type: String
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classes'
    },
    institute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institute',
        required: true
    },
    // New fields
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    status: {
        type: String,
        enum: ['active', 'suspended', 'alumni'],
        default: 'active'
    },
    parentName: {
        type: String
    },
    parentContact: {
        type: String
    },
    parentEmail: {
        type: String
    },
    parentOccupation: {
        type: String
    },
    relationWithStudent: {
        type: String,
        enum: ['Father', 'Mother', 'Guardian', 'Other']
    },
    admissionDate: {
        type: Date
    },
    categoryType: {
        type: String,
        enum: ['management', 'reserved', 'cap'],
    },
    admissionNumber: {
        type: String
    }
}, {
    timestamps: true,
});

const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);
export default Student;