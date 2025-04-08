import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
    // Identification
    _id: {
        type: String,
        required: [true, 'Student ID is required'],
        unique: true,
        trim: true,
        index: true
    },

    // Personal Information
    personalDetails: {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [50, 'Name cannot exceed 50 characters']
        },
        dateOfBirth: {
            type: Date,
            validate: {
                validator: (value) => value <= new Date(),
                message: 'Date of birth cannot be in the future'
            }
        },
        gender: {
            type: String,
            enum: {
                values: ['Male', 'Female', 'Other'],
                message: '{VALUE} is not a valid gender'
            }
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please enter a valid email'],
            sparse: true
        },
        phoneNo: {
            type: String,
            trim: true,
            match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'],
            sparse: true
        }
    },

    password: {
        type: String,
        select: false // Exclude from default queries for security
    },

    // Academic Information
    academicDetails: {
        rollNumber: {
            type: String,
            required: [true, 'Roll number is required'],
            unique: true,
            trim: true,
            index: true
        },

        academicYear: {
            type: String,
          
        },
        department: {
            type: String,
            trim: true,
            index: true
        },
        class: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Classes',
            index: true
        },
        institute: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Institute',
            required: [true, 'Institute is required'],
            index: true
        }
    },

    // Admission Information
    admission: {
        admissionNumber: {
            type: String,
            trim: true,
            sparse: true
        },
        admissionDate: {
            type: Date,
            default: Date.now,
        },
        categoryType: {
            type: String,
            enum: {
                values: ['management', 'reserved', 'merit', 'other'],
                message: '{VALUE} is not a valid category type'
            },
            default: 'merit'
        },
        status: {
            type: String,
            enum: {
                values: ['active', 'suspended', 'alumni'],
                message: '{VALUE} is not a valid status'
            },
            default: 'active',
            index: true
        }
    },

    // Parent/Guardian Information
    parents: {
        name: {
            type: String,
            trim: true,
            minlength: [2, 'Parent name must be at least 2 characters'],
            maxlength: [50, 'Parent name cannot exceed 50 characters']
        },
        contact: {
            type: String,
            trim: true,
            match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid parent contact number'],
            sparse: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please enter a valid parent email'],
            sparse: true
        },
        occupation: {
            type: String,
            trim: true,
            maxlength: [50, 'Occupation cannot exceed 50 characters']
        },
        relation: {
            type: String,
            enum: {
                values: ['Father', 'Mother', 'Guardian', 'Other'],
                message: '{VALUE} is not a valid relation'
            }
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Compound Indexes
StudentSchema.index({ 'academicDetails.institute': 1, 'academicDetails.department': 1 });

// Virtual Example (optional)
// StudentSchema.virtual('fullName').get(function () {
//     return `${this.personalDetails.name} (${this.rollNumber})`;
// });

const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);
export default Student;