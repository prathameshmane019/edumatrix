import mongoose from "mongoose"
const { Schema, model } = mongoose;

const grievanceSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,

  },
  issue: {
    type: String,

  },
  suggestion: {
    type: String,
     // Optional field
  },
  image: {
    image_url:{
        type:String
    },
    public_id:{
        type:String
    }
  },
}, {
  timestamps: true,  
})

const Grievance = mongoose.models.Grievance || mongoose.model("Grievance", grievanceSchema)

export default Grievance




