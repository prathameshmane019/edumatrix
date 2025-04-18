import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import Classes from './className';


const BatchStatusSchema = new mongoose.Schema({
  batchId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['covered', 'not_covered'],
    default: 'not_covered'
  },
  proposedDate: {
    type: String
  },
  completedDate: {
    type: String
  }
}, { _id: false });

const ContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  references: {
    type: String
  },
  status: {
    type: String,
    enum: ['covered', 'not_covered'],
    default: 'not_covered'
  },
  courseOutcomes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CourseOutcome' }],
  
  completedDate: {
    type: String
  },
  proposedDate: {
    type: String
  },
  programOutcomes: {
    type: String
  },
  batchStatus: {
    type: [BatchStatusSchema],
    default: undefined,
    validate: {
      validator: function (v) {
        const subject = this.parent();
        return !subject || subject.subType !== 'practical' || (Array.isArray(v) && v.length > 0);
      },
      message: 'Batch status is required for practical subjects'
    }
  }
}, {
  _id: true,
});

const TGSessionSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true
  },
  pointsDiscussed: {
    type: [String],
    required: true,
    validate: {
      validator: function (v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'Points discussed cannot be empty'
    }
  }
}, {
  _id: true
});

// Create a new schema for batch-faculty mapping
const BatchFacultySchema = new mongoose.Schema({
  batchId: {
    type: String,
    required: true
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  }
}, { _id: false });

const SubjectSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  subType: {
    type: String,
    enum: ['theory', 'practical', 'tg'],
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classes'
  },
  // For theory subjects
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty'
  },
  // For practical/TG subjects - maps batches to faculty
  batchFaculties: {
    type: [BatchFacultySchema],
    validate: {
      validator: function (v) {
        return this.subType === 'theory' || (Array.isArray(v) && v.length > 0);
      },
      message: 'Batch-faculty mapping is required for practical/TG subjects'
    }
  },
  batch: {
    type: [String]
  },
  department: {
    type: String
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institute',
    required: true
  },
  content: {
    type: [ContentSchema],
    default: undefined,
    validate: {
      validator: function (v) {
        return this.subType !== 'tg' || (v === undefined || v.length === 0);
      },
      message: 'Content should be empty for TG subjects'
    }
  },
  tgSessions: {
    type: [TGSessionSchema],
    validate: {
      validator: function (v) {
        // Using function keyword to maintain 'this' context
        if (!this || typeof this.subType === 'undefined') {
          // If we can't access subType, don't validate
          return true;
        }

        if (this.subType === 'tg') {
          // For TG subjects, allow array of sessions
          return true;
        } else {
          // For non-TG subjects, ensure no sessions
          return !v || v.length === 0;
        }
      },
      message: 'TG sessions are only allowed for TG subjects'
    }
  },
  sem: {
    type: String,
    enum: ['sem1', 'sem2'],
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  coAttainmentTarget: { // e.g., 60% of students should score >= 60% marks for a CO to be considered attained
    type: Number,
    min: 0,
    max: 100,
    default: 60 // Set a sensible default for your institution
},
 coTargetThresholdPercentage: { // e.g., 60% of students should score >= 60% marks for a CO to be considered attained
    type: Number,
    min: 0,
    max: 100,
    default: 60 // Set a sensible default for your institution
}
}, {
  timestamps: true,
});
// Add a pre-save middleware to ensure data consistency
SubjectSchema.pre('save', function(next) {
  if (this.subType !== 'tg' && Array.isArray(this.tgSessions)) {
      this.tgSessions = [];
  }
  next();
});

// Add a pre-update middleware
SubjectSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
  const update = this.getUpdate();
  if (update.$push && update.$push.tgSessions) {
      // If we're pushing to tgSessions, make sure we're operating on a TG subject
      this.model.findOne(this.getFilter()).then(doc => {
          if (!doc || doc.subType !== 'tg') {
              next(new Error('Cannot add TG sessions to non-TG subject'));
          } else {
              next();
          }
      }).catch(next);
  } else {
      next();
  }
});

const Subject = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);
export default Subject;